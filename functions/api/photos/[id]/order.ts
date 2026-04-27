import { CORS, preflight, Ctx } from "../../_helpers";

export const onRequestOptions = preflight;

export async function onRequestPatch({ env, params, request }: Ctx): Promise<Response> {
  const id = params.id as string;
  const { display_order } = await request.json() as { display_order: number };

  await env.DB.prepare(`UPDATE photos SET display_order = ? WHERE id = ?`)
    .bind(display_order, id)
    .run();

  return Response.json({ ok: true }, { headers: CORS });
}
