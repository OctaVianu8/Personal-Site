const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const MAX_CV_SIZE = 10 * 1024 * 1024;

interface DatabaseStatement {
  bind(...values: unknown[]): DatabaseStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<unknown>;
}

interface StorageObject {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
}

interface Env {
  DB: { prepare(query: string): DatabaseStatement };
  PHOTO_BUCKET: {
    put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<void>;
    get(key: string): Promise<StorageObject | null>;
    delete(key: string | string[]): Promise<void>;
    list(options?: { prefix?: string }): Promise<{ objects: Array<{ key: string }> }>;
  };
  ASSETS: { fetch(request: Request): Promise<Response> };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    const method = request.method.toUpperCase();

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    // Keep the public CV URL stable while the selected file lives in R2.
    if (pathname === "/CV.pdf" && (method === "GET" || method === "HEAD")) {
      const response = await serveActiveCv(env);
      return method === "HEAD"
        ? new Response(null, { status: response.status, headers: response.headers })
        : response;
    }

    if (pathname.startsWith("/api/")) {
      try {
        return await handleApi(request, env, pathname, method);
      } catch (err) {
        return Response.json({ error: String(err) }, { status: 500, headers: CORS });
      }
    }

    // Serve static assets; fall back to index.html for SPA routes
    try {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status === 404) {
        return env.ASSETS.fetch(new Request(new URL("/index.html", request.url).toString()));
      }
      return asset;
    } catch (err) {
      return new Response(String(err), { status: 500 });
    }
  },
};

async function handleApi(
  request: Request,
  env: Env,
  pathname: string,
  method: string
): Promise<Response> {

  // GET /api/cvs  (recent versions, with the selected version first)
  if (pathname === "/api/cvs" && method === "GET") {
    const result = await env.DB.prepare(
      `SELECT c.id, c.original_filename, c.size_bytes, c.uploaded_at,
         CASE WHEN CAST(c.id AS TEXT) = s.value THEN 1 ELSE 0 END AS is_active
       FROM cv_files c
       LEFT JOIN site_settings s ON s.key = 'active_cv_id'
       ORDER BY is_active DESC, c.uploaded_at DESC, c.id DESC
       LIMIT 8`
    ).all<{ id: number; original_filename: string; size_bytes: number; uploaded_at: string; is_active: number }>();
    return Response.json(result.results, { headers: CORS });
  }

  // POST /api/cvs/upload  (new uploads become the public version)
  if (pathname === "/api/cvs/upload" && method === "POST") {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return Response.json({ error: "Choose a PDF file to upload." }, { status: 400, headers: CORS });
    }
    if (file.size === 0 || file.size > MAX_CV_SIZE) {
      return Response.json({ error: "The PDF must be between 1 byte and 10 MB." }, { status: 400, headers: CORS });
    }

    const contents = await file.arrayBuffer();
    if (!hasPdfSignature(contents)) {
      return Response.json({ error: "The uploaded file is not a valid PDF." }, { status: 400, headers: CORS });
    }

    const storageKey = `cvs/${crypto.randomUUID()}.pdf`;
    await env.PHOTO_BUCKET.put(storageKey, contents, {
      httpMetadata: { contentType: "application/pdf" },
    });

    let cv: { id: number; original_filename: string; size_bytes: number; uploaded_at: string } | null;
    try {
      cv = await env.DB.prepare(
        `INSERT INTO cv_files (original_filename, storage_key, size_bytes, uploaded_at)
         VALUES (?, ?, ?, datetime('now'))
         RETURNING id, original_filename, size_bytes, uploaded_at`
      ).bind(normalizeCvFilename(file.name), storageKey, file.size)
        .first<{ id: number; original_filename: string; size_bytes: number; uploaded_at: string }>();
    } catch (error) {
      await env.PHOTO_BUCKET.delete(storageKey);
      throw error;
    }

    if (!cv) throw new Error("The uploaded CV record could not be created.");

    await env.DB.prepare(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES ('active_cv_id', ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    ).bind(String(cv.id)).run();

    return Response.json({ ...cv, is_active: 1 }, { status: 201, headers: CORS });
  }

  // PATCH /api/cvs/:id/activate
  const mCvActivate = pathname.match(/^\/api\/cvs\/(\d+)\/activate$/);
  if (mCvActivate && method === "PATCH") {
    const cv = await env.DB.prepare(`SELECT id FROM cv_files WHERE id = ?`)
      .bind(mCvActivate[1]).first<{ id: number }>();
    if (!cv) return Response.json({ error: "CV version not found." }, { status: 404, headers: CORS });

    await env.DB.prepare(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES ('active_cv_id', ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`
    ).bind(mCvActivate[1]).run();
    return Response.json({ ok: true }, { headers: CORS });
  }

  // GET /api/cvs/:id/file  (preview a stored version)
  const mCvFile = pathname.match(/^\/api\/cvs\/(\d+)\/file$/);
  if (mCvFile && method === "GET") {
    const cv = await env.DB.prepare(
      `SELECT original_filename, storage_key FROM cv_files WHERE id = ?`
    ).bind(mCvFile[1]).first() as { original_filename: string; storage_key: string } | null;
    if (!cv) return new Response("Not found", { status: 404, headers: CORS });

    const object = await env.PHOTO_BUCKET.get(cv.storage_key);
    if (!object) return new Response("Stored PDF not found", { status: 404, headers: CORS });
    return pdfResponse(object, cv.original_filename, CORS);
  }

  // DELETE /api/cvs/:id  (the live version must be replaced first)
  const mCv = pathname.match(/^\/api\/cvs\/(\d+)$/);
  if (mCv && method === "DELETE") {
    const cv = await env.DB.prepare(
      `SELECT c.storage_key,
         CASE WHEN CAST(c.id AS TEXT) = s.value THEN 1 ELSE 0 END AS is_active
       FROM cv_files c LEFT JOIN site_settings s ON s.key = 'active_cv_id'
       WHERE c.id = ?`
    ).bind(mCv[1]).first() as { storage_key: string; is_active: number } | null;
    if (!cv) return Response.json({ error: "CV version not found." }, { status: 404, headers: CORS });
    if (cv.is_active) {
      return Response.json({ error: "Select another CV before deleting the live version." }, { status: 409, headers: CORS });
    }

    await env.PHOTO_BUCKET.delete(cv.storage_key);
    await env.DB.prepare(`DELETE FROM cv_files WHERE id = ?`).bind(mCv[1]).run();
    return Response.json({ ok: true }, { headers: CORS });
  }

  // GET /api/albums  POST /api/albums
  if (pathname === "/api/albums") {
    if (method === "GET") {
      const r = await env.DB.prepare(
        `SELECT a.id, a.name, a.slug, COUNT(p.id) AS photo_count
         FROM albums a LEFT JOIN photos p ON p.album_id = a.id
         GROUP BY a.id ORDER BY a.created_at DESC`
      ).all<{ id: number; name: string; slug: string; photo_count: number; preview_photos?: string[] }>();
      const albums = r.results;
      if (albums.length > 0) {
        const previews = await env.DB.prepare(
          `SELECT album_id, filename FROM (
             SELECT album_id, filename,
               ROW_NUMBER() OVER (PARTITION BY album_id ORDER BY display_order ASC) AS rn
             FROM photos
           ) WHERE rn <= 5`
        ).all<{ album_id: number; filename: string }>();
        const map: Record<number, string[]> = {};
        for (const row of previews.results) {
          if (!map[row.album_id]) map[row.album_id] = [];
          map[row.album_id].push(row.filename);
        }
        for (const album of albums) album.preview_photos = map[album.id] ?? [];
      }
      return Response.json(albums, { headers: CORS });
    }
    if (method === "POST") {
      const { name, slug } = await request.json() as { name: string; slug: string };
      const album = await env.DB.prepare(
        `INSERT INTO albums (name, slug, created_at) VALUES (?, ?, datetime('now')) RETURNING *`
      ).bind(name, slug).first();
      return Response.json(album, { status: 201, headers: CORS });
    }
  }

  // GET /api/albums/:slug   DELETE /api/albums/:id
  const mAlbum = pathname.match(/^\/api\/albums\/([^/]+)$/);
  if (mAlbum) {
    const param = mAlbum[1];
    if (method === "GET") {
      const album = await env.DB.prepare(
        `SELECT * FROM albums WHERE slug = ?`
      ).bind(param).first<{ id: number; name: string; slug: string; created_at: string }>();
      if (!album) return Response.json({ error: "Not found" }, { status: 404, headers: CORS });
      const photos = await env.DB.prepare(
        `SELECT id, filename, display_order FROM photos WHERE album_id = ? ORDER BY display_order ASC`
      ).bind(album.id).all();
      return Response.json({ ...album, photos: photos.results }, { headers: CORS });
    }
    if (method === "DELETE") {
      const listed = await env.PHOTO_BUCKET.list({ prefix: `album-${param}/` });
      if (listed.objects.length > 0) {
        await env.PHOTO_BUCKET.delete(listed.objects.map((object) => object.key));
      }
      await env.DB.prepare(`DELETE FROM photos WHERE album_id = ?`).bind(param).run();
      await env.DB.prepare(`DELETE FROM albums WHERE id = ?`).bind(param).run();
      return Response.json({ ok: true }, { headers: CORS });
    }
  }

  // POST /api/photos/upload
  if (pathname === "/api/photos/upload" && method === "POST") {
    const form = await request.formData();
    const albumId = form.get("album_id") as string;
    const filename = form.get("filename") as string;
    const file = form.get("file") as File;
    await env.PHOTO_BUCKET.put(`album-${albumId}/${filename}`, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type || "image/jpeg" },
    });
    const maxRow = await env.DB.prepare(
      `SELECT COALESCE(MAX(display_order), 0) AS max_order FROM photos WHERE album_id = ?`
    ).bind(albumId).first<{ max_order: number }>();
    const nextOrder = (maxRow?.max_order ?? 0) + 1;
    const photo = await env.DB.prepare(
      `INSERT INTO photos (album_id, filename, display_order, created_at) VALUES (?, ?, ?, datetime('now')) RETURNING *`
    ).bind(albumId, filename, nextOrder).first();
    return Response.json(photo, { status: 201, headers: CORS });
  }

  // PATCH /api/photos/:id/order
  const mOrder = pathname.match(/^\/api\/photos\/(\d+)\/order$/);
  if (mOrder && method === "PATCH") {
    const { display_order } = await request.json() as { display_order: number };
    await env.DB.prepare(`UPDATE photos SET display_order = ? WHERE id = ?`)
      .bind(display_order, mOrder[1]).run();
    return Response.json({ ok: true }, { headers: CORS });
  }

  // DELETE /api/photos/:id
  const mPhoto = pathname.match(/^\/api\/photos\/(\d+)$/);
  if (mPhoto && method === "DELETE") {
    const photo = await env.DB.prepare(
      `SELECT album_id, filename FROM photos WHERE id = ?`
    ).bind(mPhoto[1]).first() as { album_id: number; filename: string } | null;
    if (!photo) return Response.json({ error: "Not found" }, { status: 404, headers: CORS });
    await env.PHOTO_BUCKET.delete(`album-${photo.album_id}/${photo.filename}`);
    await env.DB.prepare(`DELETE FROM photos WHERE id = ?`).bind(mPhoto[1]).run();
    return Response.json({ ok: true }, { headers: CORS });
  }

  // GET /api/photos/**  (serve image binary from R2)
  if (pathname.startsWith("/api/photos/") && method === "GET") {
    const key = decodeURIComponent(pathname.slice("/api/photos/".length));
    const object = await env.PHOTO_BUCKET.get(key);
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType ?? "image/jpeg",
        "Cache-Control": "public, max-age=31536000",
        ...CORS,
      },
    });
  }
  // GET /api/github-contributions  (proxy GitHub contribution calendar)
  if (pathname === "/api/github-contributions" && method === "GET") {
    const username = "OctaVianu8";
    const ghRes = await fetch(
      `https://github.com/users/${username}/contributions`,
      { headers: { "User-Agent": "PersonalSiteWorker/1.0" } }
    );
    if (!ghRes.ok) {
      return Response.json(
        { error: "GitHub returned " + ghRes.status },
        { status: 502, headers: CORS }
      );
    }
    const html = await ghRes.text();

    // Parse total contributions from heading text
    const totalMatch = html.match(/(\d[\d,]*)\s+contributions?\s+in the last year/i);
    const total = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ""), 10) : 0;

    // Parse each day cell: data-date="YYYY-MM-DD" ... data-level="0-4"
    const dayRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g;
    const days: { date: string; level: number }[] = [];
    let m: RegExpExecArray | null;
    while ((m = dayRegex.exec(html)) !== null) {
      days.push({ date: m[1], level: parseInt(m[2], 10) });
    }

    // Parse tooltip texts for exact contribution counts per day
    // Format: >N contribution(s) on Month Day.< or >No contributions on Month Day.<
    const tooltipRegex = /for="contribution-day-component-(\d+)-(\d+)"[^>]*>(\d+|No) contributions? on ([^<]+)\./g;
    const countMap: Record<string, number> = {};
    let tm: RegExpExecArray | null;
    while ((tm = tooltipRegex.exec(html)) !== null) {
      const countStr = tm[3];
      const count = countStr === "No" ? 0 : parseInt(countStr, 10);
      // Match tooltip to its day cell using the component ID
      const dayId = `contribution-day-component-${tm[1]}-${tm[2]}`;
      // Find the date for this cell ID in the HTML
      const dateMatch = html.match(new RegExp(`id="${dayId}"[^>]*data-date="(\\d{4}-\\d{2}-\\d{2})"`))
        || html.match(new RegExp(`data-date="(\\d{4}-\\d{2}-\\d{2})"[^>]*id="${dayId}"`));
      if (dateMatch) {
        countMap[dateMatch[1]] = count;
      }
    }

    // Merge counts into day data
    const daysWithCounts = days.map((d) => ({
      ...d,
      count: countMap[d.date] ?? 0,
    }));

    return Response.json(
      { total, days: daysWithCounts },
      {
        headers: {
          ...CORS,
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  }

  // GET /api/github-activity  (proxy GitHub contribution activity per month)
  if (pathname === "/api/github-activity" && method === "GET") {
    const username = "OctaVianu8";
    const months = buildMonthRanges(6);
    const activities = [];

    for (const { from, to, label } of months) {
      const url = `https://github.com/${username}?tab=overview&from=${from}&to=${to}&include_header=no`;
      const ghRes = await fetch(url, {
        headers: {
          "User-Agent": "PersonalSiteWorker/1.0",
          "Accept": "text/html",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      if (!ghRes.ok) continue;
      const html = await ghRes.text();

      // Skip months with "has no activity"
      if (html.includes("has no activity")) continue;

      // Parse commit entries: "N commits" linked to a repo
      const commitRepos: { fullName: string; commits: number }[] = [];
      // Pattern: repo link followed by "N commits" link
      const repoPattern = /href="\/([^"]+)"[^>]*class="Link"[^>]*>([^<]+)<[\s\S]*?(\d+)\s+commits?/g;
      let rm: RegExpExecArray | null;
      while ((rm = repoPattern.exec(html)) !== null) {
        commitRepos.push({
          fullName: rm[2].trim(),
          commits: parseInt(rm[3], 10),
        });
      }

      // Parse "Created N repository/repositories" sections
      const createdRepos: { fullName: string; language: string | null }[] = [];
      const createdRepoPattern = /Created\s+\d+\s+repositor[\s\S]*?<ul[^>]*>[\s\S]*?<\/ul>/g;
      let crMatch: RegExpExecArray | null;
      while ((crMatch = createdRepoPattern.exec(html)) !== null) {
        const section = crMatch[0];
        const repoLinkPattern = /href="\/([^"]+)"[^>]*class="Link[^"]*"[^>]*>([^<]+)/g;
        let rl: RegExpExecArray | null;
        while ((rl = repoLinkPattern.exec(section)) !== null) {
          const langMatch = section.match(new RegExp(rl[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\s\\S]*?itemprop="programmingLanguage">([^<]+)'));
          createdRepos.push({
            fullName: rl[2].trim(),
            language: langMatch ? langMatch[1].trim() : null,
          });
        }
      }

      if (commitRepos.length > 0 || createdRepos.length > 0) {
        activities.push({
          month: label,
          commits: commitRepos,
          totalCommits: commitRepos.reduce((s, r) => s + r.commits, 0),
          createdRepos,
        });
      }
    }

    return Response.json(
      { activities },
      {
        headers: {
          ...CORS,
          "Cache-Control": "public, max-age=3600",
        },
      }
    );
  }

  return Response.json({ error: "Not found" }, { status: 404, headers: CORS });
}

async function serveActiveCv(env: Env): Promise<Response> {
  const cv = await env.DB.prepare(
    `SELECT c.original_filename, c.storage_key
     FROM cv_files c
     JOIN site_settings s ON s.key = 'active_cv_id' AND s.value = CAST(c.id AS TEXT)`
  ).first() as { original_filename: string; storage_key: string } | null;

  if (!cv) return new Response("No CV has been published yet.", { status: 404 });
  const object = await env.PHOTO_BUCKET.get(cv.storage_key);
  if (!object) return new Response("The published CV could not be found.", { status: 404 });

  return pdfResponse(object, "CV.pdf");
}

function pdfResponse(
  object: { body: ReadableStream; httpMetadata?: { contentType?: string } },
  filename: string,
  extraHeaders: Record<string, string> = {}
): Response {
  const safeFilename = filename.replace(/[^\x20-\x7e]|["\\\r\n]/g, "_");
  const encodedFilename = encodeURIComponent(filename).replace(/['()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
  return new Response(object.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
      ...extraHeaders,
    },
  });
}

function hasPdfSignature(contents: ArrayBuffer): boolean {
  if (contents.byteLength < 5) return false;
  const header = new Uint8Array(contents, 0, 5);
  return header[0] === 0x25 && header[1] === 0x50 && header[2] === 0x44 && header[3] === 0x46 && header[4] === 0x2d;
}

function normalizeCvFilename(filename: string): string {
  const cleaned = filename.trim().replaceAll("/", "_").replace(/[\\\r\n]/g, "_");
  return cleaned.toLowerCase().endsWith(".pdf") ? cleaned : `${cleaned || "CV"}.pdf`;
}

/** Build an array of { from, to, label } for the last N months */
function buildMonthRanges(count: number) {
  const ranges = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    const to = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
    const label = `${["January","February","March","April","May","June","July","August","September","October","November","December"][d.getMonth()]} ${d.getFullYear()}`;
    ranges.push({ from, to, label });
  }
  return ranges;
}
