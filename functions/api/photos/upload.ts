import { CORS, preflight, Ctx } from "../_helpers";

export const onRequestOptions = preflight;

export async function onRequestPost({ env, request }: Ctx): Promise<Response> {
  const form = await request.formData();
  const albumId = form.get("album_id") as string;
  const filename = form.get("filename") as string;
  const file = form.get("file") as File;

  const key = `album-${albumId}/${filename}`;
  await env.PHOTO_BUCKET.put(key, await file.arrayBuffer(), {
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
