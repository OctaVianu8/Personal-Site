import { CORS, preflight, Ctx } from "../_helpers";

export const onRequestOptions = preflight;

export async function onRequestGet({ env, params }: Ctx): Promise<Response> {
  const slug = params.slug as string;
  const album = await env.DB.prepare(`SELECT * FROM albums WHERE slug = ?`).bind(slug).first();
  if (!album) return Response.json({ error: "Not found" }, { status: 404, headers: CORS });

  const photos = await env.DB.prepare(
    `SELECT id, filename, display_order FROM photos WHERE album_id = ? ORDER BY display_order ASC`
  ).bind((album as Record<string, unknown>).id).all();

  return Response.json({ ...album, photos: photos.results }, { headers: CORS });
}

export async function onRequestDelete({ env, params }: Ctx): Promise<Response> {
  const id = params.slug as string;

  // List and delete all R2 objects under album prefix
  const listed = await env.PHOTO_BUCKET.list({ prefix: `album-${id}/` });
  if (listed.objects.length > 0) {
    await env.PHOTO_BUCKET.delete(listed.objects.map((o) => o.key));
  }

  await env.DB.prepare(`DELETE FROM photos WHERE album_id = ?`).bind(id).run();
  await env.DB.prepare(`DELETE FROM albums WHERE id = ?`).bind(id).run();

  return Response.json({ ok: true }, { headers: CORS });
}
