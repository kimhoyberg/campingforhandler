// Kildetjek: henter alle kildesider og finder ændringer siden sidst.
//
//   node scripts/kildetjek.mjs            kun rapport
//   node scripts/kildetjek.mjs --opdater  opdaterer også DCU-feltet automatisk
//
// Skriver:
//   .kildetjek/snapshot.json  hvad der stod på siderne sidst (bruges til sammenligning)
//   .kildetjek/rapport.md     ændringer, der skal ses på af et menneske
//
// Kun ting, der er stabile, sammenlignes – ellers ville lagerlister og nyheder give falske alarmer:
//   1. om siden kan hentes
//   2. linjer med åbningstider (ugedage, klokkeslæt, "lukket")
//   3. hvilke mærker en mærkeside nævner
//   4. hvilke ydelser en værkstedsside nævner
// DCU-testcenter er en entydig liste og opdateres automatisk med --opdater.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src', 'data');
const outDir = join(root, '.kildetjek');
const snapshotFil = join(outDir, 'snapshot.json');
const rapportFil = join(outDir, 'rapport.md');
const OPDATER = process.argv.includes('--opdater');
const idag = new Date().toISOString().slice(0, 10);
const FORAELDET_DAGE = 180;
const DCU_URL = 'https://www.dcu.dk/da/medlemsfordele/dcu-servicecentre';

const maerker = JSON.parse(readFileSync(join(dataDir, 'maerker.json'), 'utf8')).map((m) => m.navn);
const forhandlerDir = join(dataDir, 'forhandlere');
const filer = readdirSync(forhandlerDir).filter((f) => f.endsWith('.json'));
const forhandlere = filer.map((f) => ({ fil: join(forhandlerDir, f), d: JSON.parse(readFileSync(join(forhandlerDir, f), 'utf8')) }));
const forrige = existsSync(snapshotFil) ? JSON.parse(readFileSync(snapshotFil, 'utf8')) : {};

const YDELSER = ['værksted', 'dcu', 'gastest', 'fugttest', 'forsikringsskade', 'mover', 'udlejning', 'opbevaring', 'autocamper', 'teltvogn', 'brugte'];
const DAG = /\b(mandag|tirsdag|onsdag|torsdag|fredag|lørdag|søndag|hverdage|weekend|helligdag|man|tirs|ons|tors|fre|lør|søn)\b/i;
const TIDSRUM = /\b\d{1,2}(?:[.:]\d{2})?\s*(?:-|–|til)\s*\d{1,2}(?:[.:]\d{2})?\b/;

async function hent(url) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(25000),
      headers: { 'User-Agent': 'campingforhandler.dk kildetjek (+https://campingforhandler.dk/om/)' },
    });
    return { status: res.status, html: res.ok ? await res.text() : '' };
  } catch (e) {
    return { status: 0, html: '', fejl: e.cause?.code ?? e.name ?? 'fejl' };
  }
}

function tekst(html) {
  return html
    .replace(/<(script|style|noscript|svg)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/tr|\/h\d|\/td|\/dt|\/dd)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function udtraek(html, hvad) {
  const linjer = tekst(html);
  const alt = linjer.join(' ').toLowerCase();
  const tider = [...new Set(linjer.filter((l) => l.length < 160 && (DAG.test(l) || TIDSRUM.test(l)) && /\d|lukket/i.test(l)))].slice(0, 80);
  const ud = { tider };
  // Hele ord, så fx "Kabe" ikke findes i "kabel".
  const ord = (m) => new RegExp(`(^|[^a-z0-9æøå])${m.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}($|[^a-z0-9æøå])`);
  if (/mærke/i.test(hvad)) ud.maerker = maerker.filter((m) => ord(m).test(alt));
  if (/værksted|ydelse|test|skade|udlejning|opbevaring|service/i.test(hvad)) ud.ydelser = YDELSER.filter((y) => alt.includes(y));
  return ud;
}

const forskel = (a = [], b = []) => ({ ny: b.filter((x) => !a.includes(x)), vaek: a.filter((x) => !b.includes(x)) });
const hash = (o) => createHash('sha1').update(JSON.stringify(o)).digest('hex').slice(0, 12);

// --- 1. Hent alle web-kilder ---
const kilder = new Map();
for (const { d } of forhandlere) {
  for (const k of d.kilder) {
    if ((k.type ?? 'web') !== 'web' || !k.url || k.url.includes('nominatim.openstreetmap.org') || k.url === DCU_URL) continue;
    if (!kilder.has(k.url)) kilder.set(k.url, { url: k.url, hvad: k.hvad, forhandlere: [] });
    kilder.get(k.url).forhandlere.push(d.navn);
  }
}

const nu = {};
const fund = { fejl: [], tider: [], maerker: [], ydelser: [], dcu: [], gamle: [] };
const koe = [...kilder.values()];
await Promise.all(
  Array.from({ length: 6 }, async () => {
    while (koe.length) {
      const k = koe.shift();
      const r = await hent(k.url);
      const prev = forrige[k.url];
      if (r.status !== 200) {
        nu[k.url] = { ...(prev ?? {}), status: r.status, fejl: r.fejl ?? null };
        if (!prev || prev.status === 200) fund.fejl.push({ ...k, status: r.status || r.fejl });
        continue;
      }
      const ud = udtraek(r.html, k.hvad);
      nu[k.url] = { status: 200, hash: hash(ud), ...ud };
      if (!prev || prev.status !== 200 || prev.hash === nu[k.url].hash) continue;
      const t = forskel(prev.tider, ud.tider);
      if (t.ny.length || t.vaek.length) fund.tider.push({ ...k, ...t });
      if (ud.maerker) {
        const m = forskel(prev.maerker, ud.maerker);
        if (m.ny.length || m.vaek.length) fund.maerker.push({ ...k, ...m });
      }
      if (ud.ydelser) {
        const y = forskel(prev.ydelser, ud.ydelser);
        if (y.ny.length || y.vaek.length) fund.ydelser.push({ ...k, ...y });
      }
    }
  }),
);

// --- 2. DCU's liste over test- og servicecentre ---
const dcu = await hent(DCU_URL);
const dcuTekst = tekst(dcu.html).join(' ');
const antalCentre = (dcuTekst.match(/Tlf\./g) ?? []).length;
const cifre = (s) => s.replace(/\D/g, '');
if (dcu.status !== 200 || antalCentre < 8) {
  fund.fejl.push({ url: DCU_URL, hvad: 'DCU-listen', forhandlere: ['alle'], status: dcu.status || 'kunne ikke læses' });
} else {
  const dcuCifre = cifre(dcuTekst);
  for (const f of forhandlere) {
    const { d } = f;
    const paaListe = (d.telefon && dcuCifre.includes(cifre(d.telefon))) || dcuTekst.toLowerCase().includes(d.navn.toLowerCase());
    if (paaListe === d.dcuTestcenter) continue;
    fund.dcu.push({ navn: d.navn, foer: d.dcuTestcenter, efter: paaListe });
    if (OPDATER) {
      d.dcuTestcenter = paaListe;
      const k = d.kilder.find((x) => x.url === DCU_URL);
      if (k) k.tjekketDato = idag;
      else d.kilder.push({ url: DCU_URL, hvad: "DCU's liste over test- og servicecentre", tjekketDato: idag });
      writeFileSync(f.fil, JSON.stringify(d, null, 2) + '\n');
    }
  }
}

// --- 3. Forældede oplysninger ---
for (const { d } of forhandlere) {
  const dage = Math.floor((Date.now() - new Date(d.sidstTjekket).getTime()) / 864e5);
  if (dage > FORAELDET_DAGE) fund.gamle.push({ navn: d.navn, dage });
}

// --- 4. Gem og skriv rapport ---
mkdirSync(outDir, { recursive: true });
const sorteret = Object.fromEntries(Object.entries(nu).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(snapshotFil, JSON.stringify(sorteret, null, 1) + '\n');

const forste = Object.keys(forrige).length === 0;
const hvem = (k) => k.forhandlere.join(', ');
const r = [`# Kildetjek ${idag}`, ''];
if (forste) r.push('Første kørsel: der er gemt et udgangspunkt. Ændringer vises fra næste kørsel.', '');
if (fund.fejl.length) {
  r.push('## Sider der ikke kan hentes', '');
  for (const k of fund.fejl) r.push(`- **${hvem(k)}** – ${k.hvad}: ${k.url} (svar: ${k.status})`);
  r.push('');
}
if (fund.tider.length) {
  r.push('## Åbningstider ser ud til at være ændret', '', 'Tjek siden og ret `aabningstider` i forhandlerens JSON-fil.', '');
  for (const k of fund.tider) {
    r.push(`### ${hvem(k)}`, k.url, '');
    for (const l of k.vaek.slice(0, 15)) r.push(`- ~~${l}~~`);
    for (const l of k.ny.slice(0, 15)) r.push(`- **${l}**`);
    r.push('');
  }
}
if (fund.maerker.length) {
  r.push('## Mærker nævnt på mærkesider er ændret', '');
  for (const k of fund.maerker)
    r.push(`- **${hvem(k)}** (${k.url}): ${k.ny.length ? 'nye: ' + k.ny.join(', ') : ''}${k.ny.length && k.vaek.length ? '; ' : ''}${k.vaek.length ? 'forsvundet: ' + k.vaek.join(', ') : ''}`);
  r.push('');
}
if (fund.ydelser.length) {
  r.push('## Ydelser nævnt på værkstedssider er ændret', '');
  for (const k of fund.ydelser)
    r.push(`- **${hvem(k)}** (${k.url}): ${k.ny.length ? 'nye: ' + k.ny.join(', ') : ''}${k.ny.length && k.vaek.length ? '; ' : ''}${k.vaek.length ? 'forsvundet: ' + k.vaek.join(', ') : ''}`);
  r.push('');
}
if (fund.dcu.length) {
  r.push(`## DCU-testcenter ${OPDATER ? '(rettet automatisk)' : '(ikke rettet)'}`, '');
  for (const x of fund.dcu) r.push(`- **${x.navn}**: ${x.foer} → ${x.efter}`);
  r.push('');
}
if (fund.gamle.length) {
  r.push(`## Ikke tjekket i over ${FORAELDET_DAGE} dage`, '');
  for (const x of fund.gamle) r.push(`- **${x.navn}** (${x.dage} dage)`);
  r.push('');
}
const antalFund = Object.values(fund).reduce((n, l) => n + l.length, 0);
if (!antalFund) r.push('Ingen ændringer fundet.');
writeFileSync(rapportFil, r.join('\n') + '\n');

console.log(`Kildetjek: ${kilder.size} sider hentet, ${antalFund} fund. Rapport: .kildetjek/rapport.md`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `fund=${!forste && antalFund > 0}\n`);
