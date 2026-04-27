import { CORS, preflight, Ctx } from "./_helpers";

export const onRequestOptions = preflight;

export async function onRequestGet({ env }: Ctx): Promise<Response> {
  const result = await env.DB.prepare(
    `SELECT a.id, a.name, a.slug, COUNT(p.id) AS photo_count
     FROM albums a
     LEFT JOIN photos p ON p.album_id = a.id
     GROUP BY a.id
     ORDER BY a.created_at DESC`
  ).all();
  return Response.json(result.results, { headers: CORS });
}

export async function onRequestPost({ env, request }: Ctx): Promise<Response> {
  const { name, slug } = await request.json() as { name: string; slug: string };
  const album = await env.DB.prepare(
    `INSERT INTO albums (name, slug, created_at) VALUES (?, ?, datetime('now')) RETURNING *`
  ).bind(name, slug).first();
  return Response.json(album, { status: 201, headers: CORS });
}
