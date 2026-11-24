import { defineConfig } from 'astro/config';
import { SITE } from './src/config.ts';

// Statisk side – kan lægges direkte på Cloudflare Pages eller Netlify.
export default defineConfig({
  site: SITE.url,
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'always' },
  compressHTML: true,
});
