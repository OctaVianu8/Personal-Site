import { CORS, preflight, Ctx } from "../_helpers";

export const onRequestOptions = preflight;

export async function onRequestGet({ env, params }: Ctx): Promise<Response> {
  const segments = params.path as string[];
  const key = segments.map((s) => decodeURIComponent(s)).join("/");

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
