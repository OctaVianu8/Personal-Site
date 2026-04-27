const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface Env {
  DB: any;
  PHOTO_BUCKET: any;
  ASSETS: any;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    const method = request.method.toUpperCase();

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
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

  // GET /api/albums  POST /api/albums
  if (pathname === "/api/albums") {
    if (method === "GET") {
      const r = await env.DB.prepare(
        `SELECT a.id, a.name, a.slug, COUNT(p.id) AS photo_count
         FROM albums a LEFT JOIN photos p ON p.album_id = a.id
         GROUP BY a.id ORDER BY a.created_at DESC`
      ).all();
      const albums = r.results as any[];
      if (albums.length > 0) {
        const previews = await env.DB.prepare(
          `SELECT album_id, filename FROM (
             SELECT album_id, filename,
               ROW_NUMBER() OVER (PARTITION BY album_id ORDER BY display_order ASC) AS rn
             FROM photos
           ) WHERE rn <= 5`
        ).all();
        const map: Record<number, string[]> = {};
        for (const row of previews.results as any[]) {
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
      ).bind(param).first();
      if (!album) return Response.json({ error: "Not found" }, { status: 404, headers: CORS });
      const photos = await env.DB.prepare(
        `SELECT id, filename, display_order FROM photos WHERE album_id = ? ORDER BY display_order ASC`
      ).bind(album.id).all();
      return Response.json({ ...album, photos: photos.results }, { headers: CORS });
    }
    if (method === "DELETE") {
      const listed = await env.PHOTO_BUCKET.list({ prefix: `album-${param}/` });
      if (listed.objects.length > 0) {
        await env.PHOTO_BUCKET.delete(listed.objects.map((o: any) => o.key));
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
    ).bind(albumId).first();
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

  return Response.json({ error: "Not found" }, { status: 404, headers: CORS });
}
