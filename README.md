# Personal site

React/Vite frontend with a Cloudflare Worker backend. Photography and CV files are stored in R2; album, photo, CV-version, and active-CV metadata are stored in D1.

## Development

```bash
npm install
npm run build
npx wrangler d1 migrations apply photography-db --local
npx wrangler dev --local
```

The regular `npm run dev` command is still useful for frontend-only work, but its development middleware does not provide the D1/R2-backed admin APIs.

## CV publishing flow

- Open `/admin` and choose **CV manager**.
- Drop in a PDF (10 MB maximum). A new upload is stored under the `cvs/` prefix in the existing R2 bucket and becomes the live version immediately.
- Recent uploads stay available for preview, rollback, and deletion. The live version cannot be deleted until another version is selected.
- `/CV.pdf` is a stable Worker-served URL for the selected version. No PDF is bundled into the frontend.

## Deploying schema and code

Apply D1 migrations before deploying the Worker so the CV tables exist when the new route goes live:

```bash
npx wrangler d1 migrations apply photography-db --remote
npm run build
npx wrangler deploy
```

The `assets.run_worker_first` routes in `wrangler.toml` ensure `/api/*` and `/CV.pdf` cannot be shadowed by static assets.
