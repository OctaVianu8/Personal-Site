import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-dev-stub',
      configureServer(server) {
        // Handle /api/github-contributions in dev mode
        server.middlewares.use('/api/github-contributions', async (_req, res) => {
          try {
            const ghRes = await fetch(
              'https://github.com/users/OctaVianu8/contributions',
              { headers: { 'User-Agent': 'PersonalSiteDevServer/1.0' } }
            );
            if (!ghRes.ok) {
              res.statusCode = 502;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'GitHub returned ' + ghRes.status }));
              return;
            }
            const html = await ghRes.text();

            const totalMatch = html.match(/(\d[\d,]*)\s+contributions?\s+in the last year/i);
            const total = totalMatch ? parseInt(totalMatch[1].replace(/,/g, ''), 10) : 0;

            const dayRegex = /data-date="(\d{4}-\d{2}-\d{2})"[^>]*data-level="(\d)"/g;
            const days: { date: string; level: number; count: number }[] = [];
            let m: RegExpExecArray | null;
            while ((m = dayRegex.exec(html)) !== null) {
              days.push({ date: m[1], level: parseInt(m[2], 10), count: 0 });
            }

            const tooltipRegex = /for="contribution-day-component-(\d+)-(\d+)"[^>]*>(\d+|No) contributions? on ([^<]+)\./g;
            const countMap: Record<string, number> = {};
            let tm: RegExpExecArray | null;
            while ((tm = tooltipRegex.exec(html)) !== null) {
              const countStr = tm[3];
              const count = countStr === 'No' ? 0 : parseInt(countStr, 10);
              const dayId = `contribution-day-component-${tm[1]}-${tm[2]}`;
              const dateMatch = html.match(new RegExp(`id="${dayId}"[^>]*data-date="(\\d{4}-\\d{2}-\\d{2})"`))
                || html.match(new RegExp(`data-date="(\\d{4}-\\d{2}-\\d{2})"[^>]*id="${dayId}"`));
              if (dateMatch) {
                countMap[dateMatch[1]] = count;
              }
            }

            for (const day of days) {
              day.count = countMap[day.date] ?? 0;
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(JSON.stringify({ total, days }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to fetch contributions' }));
          }
        });

        // Handle /api/github-activity in dev mode
        server.middlewares.use('/api/github-activity', async (_req, res) => {
          try {
            const username = 'OctaVianu8';
            const months: { from: string; to: string; label: string }[] = [];
            const now = new Date();
            for (let i = 0; i < 6; i++) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              const from = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
              const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
              const to = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
              const label = `${['January','February','March','April','May','June','July','August','September','October','November','December'][d.getMonth()]} ${d.getFullYear()}`;
              months.push({ from, to, label });
            }

            const activities = [];
            for (const { from, to, label } of months) {
              const url = `https://github.com/${username}?tab=overview&from=${from}&to=${to}&include_header=no`;
              const ghRes = await fetch(url, {
                headers: {
                  'User-Agent': 'PersonalSiteDevServer/1.0',
                  'Accept': 'text/html',
                  'X-Requested-With': 'XMLHttpRequest',
                },
              });
              if (!ghRes.ok) continue;
              const html = await ghRes.text();
              if (html.includes('has no activity')) continue;

              const commitRepos: { fullName: string; commits: number }[] = [];
              const repoPattern = /href="\/([^"]+)"[^>]*class="Link"[^>]*>([^<]+)<[\s\S]*?(\d+)\s+commits?/g;
              let rm: RegExpExecArray | null;
              while ((rm = repoPattern.exec(html)) !== null) {
                commitRepos.push({ fullName: rm[2].trim(), commits: parseInt(rm[3], 10) });
              }

              const createdRepos: { fullName: string; language: string | null }[] = [];
              const createdRepoPattern = /Created\s+\d+\s+repositor[\s\S]*?<ul[^>]*>[\s\S]*?<\/ul>/g;
              let crMatch: RegExpExecArray | null;
              while ((crMatch = createdRepoPattern.exec(html)) !== null) {
                const section = crMatch[0];
                const repoLinkPattern = /href="\/([^"]+)"[^>]*class="Link[^"]*"[^>]*>([^<]+)/g;
                let rl: RegExpExecArray | null;
                while ((rl = repoLinkPattern.exec(section)) !== null) {
                  const escaped = rl[2].replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const langMatch = section.match(new RegExp(escaped + '[\\s\\S]*?itemprop="programmingLanguage">([^<]+)'));
                  createdRepos.push({
                    fullName: rl[2].trim(),
                    language: langMatch ? langMatch[1].trim() : null,
                  });
                }
              }

              if (commitRepos.length > 0 || createdRepos.length > 0) {
                activities.push({
                  month: label,
                  commits: commitRepos,
                  totalCommits: commitRepos.reduce((s, r) => s + r.commits, 0),
                  createdRepos,
                });
              }
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'public, max-age=3600');
            res.end(JSON.stringify({ activities }));
          } catch (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to fetch activity' }));
          }
        });

        // Other API routes — not available in dev
        server.middlewares.use('/api', (_req, res) => {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'API unavailable in dev — run: wrangler pages dev dist' }));
        });
      },
    },
  ],
})
