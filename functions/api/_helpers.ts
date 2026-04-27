export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const preflight = () => new Response(null, { status: 204, headers: CORS });

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ success: boolean; meta: unknown }>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

export interface R2Object {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
}

export interface R2Bucket {
  put(
    key: string,
    value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob | null,
    options?: { httpMetadata?: { contentType?: string } }
  ): Promise<void>;
  get(key: string): Promise<R2Object | null>;
  delete(key: string | string[]): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ objects: { key: string }[]; truncated: boolean }>;
}

export interface Env {
  DB: D1Database;
  PHOTO_BUCKET: R2Bucket;
}

export type Ctx = {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
  next(): Promise<Response>;
};
