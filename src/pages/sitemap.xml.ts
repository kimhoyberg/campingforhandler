import type { APIRoute } from 'astro';
import { forhandlere, maerker, regioner, forhandlereForMaerke, forhandlereForRegion, maerkeRegionKombinationer } from '../lib/data';
import { services, forhandlereForService } from '../lib/services';
import { abs } from '../lib/seo';

// Kun sider, der må indekseres. Oversigter med under 2 forhandlere (noindex) er udeladt.
export const GET: APIRoute = () => {
  const nyeste = forhandlere.map((d) => d.sidstTjekket).sort().at(-1)!;
  const sider: { loc: string; lastmod: string }[] = [
    { loc: '/', lastmod: nyeste },
    { loc: '/maerke/', lastmod: nyeste },
    { loc: '/region/', lastmod: nyeste },
    { loc: '/service/', lastmod: nyeste },
    { loc: '/om/', lastmod: nyeste },
    { loc: '/ret-oplysninger/', lastmod: nyeste },
    ...forhandlere.map((d) => ({ loc: `/forhandler/${d.slug}/`, lastmod: d.sidstTjekket })),
    ...maerker.filter((m) => forhandlereForMaerke(m).length >= 2).map((m) => ({ loc: `/maerke/${m.slug}/`, lastmod: nyeste })),
    ...maerkeRegionKombinationer().map((k) => ({ loc: `/maerke/${k.maerke.slug}/${k.region.slug}/`, lastmod: nyeste })),
    ...regioner.filter((r) => forhandlereForRegion(r).length >= 2).map((r) => ({ loc: `/region/${r.slug}/`, lastmod: nyeste })),
    ...services.filter((s) => forhandlereForService(s).length >= 2).map((s) => ({ loc: `/service/${s.slug}/`, lastmod: nyeste })),
  ];
  const xml =
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    sider.map((s) => `  <url><loc>${abs(s.loc)}</loc><lastmod>${s.lastmod}</lastmod></url>`).join('\n') +
    '\n</urlset>\n';
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
