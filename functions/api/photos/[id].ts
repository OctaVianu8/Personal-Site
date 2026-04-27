import { CORS, preflight, Ctx } from "../_helpers";

export const onRequestOptions = preflight;

export async function onRequestDelete({ env, params }: Ctx): Promise<Response> {
  const id = params.id as string;

  const photo = await env.DB.prepare(
    `SELECT album_id, filename FROM photos WHERE id = ?`
  ).bind(id).first<{ album_id: number; filename: string }>();

  if (!photo) return Response.json({ error: "Not found" }, { status: 404, headers: CORS });

  await env.PHOTO_BUCKET.delete(`album-${photo.album_id}/${photo.filename}`);
  await env.DB.prepare(`DELETE FROM photos WHERE id = ?`).bind(id).run();

  return Response.json({ ok: true }, { headers: CORS });
}
