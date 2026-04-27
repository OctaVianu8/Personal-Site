import { onRequestGet as albumsGet, onRequestPost as albumsPost } from "./functions/api/albums";
import { onRequestGet as albumSlugGet, onRequestDelete as albumSlugDelete } from "./functions/api/albums/[slug]";
import { onRequestPost as photosUpload } from "./functions/api/photos/upload";
import { onRequestDelete as photoDelete } from "./functions/api/photos/[id]";
import { onRequestPatch as photoOrder } from "./functions/api/photos/[id]/order";
import { onRequestGet as photoBinary } from "./functions/api/photos/[[path]]";
import { CORS, Env, Ctx } from "./functions/api/_helpers";

type WorkerEnv = Env & { ASSETS: Fetcher };

function ctx(request: Request, env: Env, params: Record<string, string | string[]> = {}): Ctx {
  return { request, env, params, next: async () => new Response("Not found", { status: 404 }) };
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const { pathname } = new URL(request.url);
    const method = request.method.toUpperCase();

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    if (pathname === "/api/albums") {
      if (method === "GET") return albumsGet(ctx(request, env));
      if (method === "POST") return albumsPost(ctx(request, env));
    }

    const mAlbum = pathname.match(/^\/api\/albums\/([^/]+)$/);
    if (mAlbum) {
      if (method === "GET") return albumSlugGet(ctx(request, env, { slug: mAlbum[1] }));
      if (method === "DELETE") return albumSlugDelete(ctx(request, env, { slug: mAlbum[1] }));
    }

    if (pathname === "/api/photos/upload" && method === "POST") {
      return photosUpload(ctx(request, env));
    }

    const mOrder = pathname.match(/^\/api\/photos\/(\d+)\/order$/);
    if (mOrder && method === "PATCH") {
      return photoOrder(ctx(request, env, { id: mOrder[1] }));
    }

    const mPhoto = pathname.match(/^\/api\/photos\/(\d+)$/);
    if (mPhoto && method === "DELETE") {
      return photoDelete(ctx(request, env, { id: mPhoto[1] }));
    }

    if (pathname.startsWith("/api/photos/") && method === "GET") {
      const path = pathname.slice("/api/photos/".length).split("/");
      return photoBinary(ctx(request, env, { path }));
    }

    return env.ASSETS.fetch(request);
  },
};
