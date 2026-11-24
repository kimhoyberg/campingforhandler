import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE } from './src/config.ts';

// Adresse og undermappe kan styres udefra, fx af GitHub Pages-workflowet:
//   SITE_ORIGIN=https://kimhoyberg.github.io  BASE_PATH=/campingforhandler/
// Uden variabler bygges siden til roden af SITE.url (eget domæne).
const site = process.env.SITE_ORIGIN || SITE.url;
const base = process.env.BASE_PATH || '/';

// Siden skriver interne links som "/maerke/kabe/". Ligger siden i en undermappe,
// sætter dette trin undermappen foran alle interne links i de færdige HTML-filer.
function undermappeLinks() {
  return {
    name: 'undermappe-links',
    hooks: {
      'astro:build:done': ({ dir }) => {
        if (base === '/') return;
        const prefix = base.replace(/\/$/, '');
        const walk = (d) => {
          for (const f of readdirSync(d)) {
            const p = join(d, f);
            if (statSync(p).isDirectory()) walk(p);
            else if (f.endsWith('.html')) {
              const html = readFileSync(p, 'utf8').replace(
                /(href|src|action)="\/(?!\/)/g,
                (_, attr) => `${attr}="${prefix}/`,
              );
              writeFileSync(p, html);
            }
          }
        };
        walk(fileURLToPath(dir));
      },
    },
  };
}

// Statisk side – kan lægges på GitHub Pages, Cloudflare Pages eller Netlify.
export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
  integrations: [undermappeLinks()],
});
