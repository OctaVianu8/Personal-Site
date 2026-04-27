import { onRequestOptions as __api_photos__id__order_ts_onRequestOptions } from "/home/octavianu/repos/personal-site/functions/api/photos/[id]/order.ts"
import { onRequestPatch as __api_photos__id__order_ts_onRequestPatch } from "/home/octavianu/repos/personal-site/functions/api/photos/[id]/order.ts"
import { onRequestOptions as __api_photos_upload_ts_onRequestOptions } from "/home/octavianu/repos/personal-site/functions/api/photos/upload.ts"
import { onRequestPost as __api_photos_upload_ts_onRequestPost } from "/home/octavianu/repos/personal-site/functions/api/photos/upload.ts"
import { onRequestDelete as __api_albums__slug__ts_onRequestDelete } from "/home/octavianu/repos/personal-site/functions/api/albums/[slug].ts"
import { onRequestGet as __api_albums__slug__ts_onRequestGet } from "/home/octavianu/repos/personal-site/functions/api/albums/[slug].ts"
import { onRequestOptions as __api_albums__slug__ts_onRequestOptions } from "/home/octavianu/repos/personal-site/functions/api/albums/[slug].ts"
import { onRequestDelete as __api_photos__id__ts_onRequestDelete } from "/home/octavianu/repos/personal-site/functions/api/photos/[id].ts"
import { onRequestOptions as __api_photos__id__ts_onRequestOptions } from "/home/octavianu/repos/personal-site/functions/api/photos/[id].ts"
import { onRequestGet as __api_photos___path___ts_onRequestGet } from "/home/octavianu/repos/personal-site/functions/api/photos/[[path]].ts"
import { onRequestOptions as __api_photos___path___ts_onRequestOptions } from "/home/octavianu/repos/personal-site/functions/api/photos/[[path]].ts"
import { onRequestGet as __api_albums_ts_onRequestGet } from "/home/octavianu/repos/personal-site/functions/api/albums.ts"
import { onRequestOptions as __api_albums_ts_onRequestOptions } from "/home/octavianu/repos/personal-site/functions/api/albums.ts"
import { onRequestPost as __api_albums_ts_onRequestPost } from "/home/octavianu/repos/personal-site/functions/api/albums.ts"

export const routes = [
    {
      routePath: "/api/photos/:id/order",
      mountPath: "/api/photos/:id",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_photos__id__order_ts_onRequestOptions],
    },
  {
      routePath: "/api/photos/:id/order",
      mountPath: "/api/photos/:id",
      method: "PATCH",
      middlewares: [],
      modules: [__api_photos__id__order_ts_onRequestPatch],
    },
  {
      routePath: "/api/photos/upload",
      mountPath: "/api/photos",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_photos_upload_ts_onRequestOptions],
    },
  {
      routePath: "/api/photos/upload",
      mountPath: "/api/photos",
      method: "POST",
      middlewares: [],
      modules: [__api_photos_upload_ts_onRequestPost],
    },
  {
      routePath: "/api/albums/:slug",
      mountPath: "/api/albums",
      method: "DELETE",
      middlewares: [],
      modules: [__api_albums__slug__ts_onRequestDelete],
    },
  {
      routePath: "/api/albums/:slug",
      mountPath: "/api/albums",
      method: "GET",
      middlewares: [],
      modules: [__api_albums__slug__ts_onRequestGet],
    },
  {
      routePath: "/api/albums/:slug",
      mountPath: "/api/albums",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_albums__slug__ts_onRequestOptions],
    },
  {
      routePath: "/api/photos/:id",
      mountPath: "/api/photos",
      method: "DELETE",
      middlewares: [],
      modules: [__api_photos__id__ts_onRequestDelete],
    },
  {
      routePath: "/api/photos/:id",
      mountPath: "/api/photos",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_photos__id__ts_onRequestOptions],
    },
  {
      routePath: "/api/photos/:path*",
      mountPath: "/api/photos",
      method: "GET",
      middlewares: [],
      modules: [__api_photos___path___ts_onRequestGet],
    },
  {
      routePath: "/api/photos/:path*",
      mountPath: "/api/photos",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_photos___path___ts_onRequestOptions],
    },
  {
      routePath: "/api/albums",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_albums_ts_onRequestGet],
    },
  {
      routePath: "/api/albums",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_albums_ts_onRequestOptions],
    },
  {
      routePath: "/api/albums",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_albums_ts_onRequestPost],
    },
  ]