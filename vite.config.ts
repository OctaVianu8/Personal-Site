import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-dev-stub',
      configureServer(server) {
        server.middlewares.use('/api', (_req, res) => {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'API unavailable in dev — run: wrangler pages dev dist' }));
        });
      },
    },
  ],
})
