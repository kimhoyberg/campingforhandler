// Tjekker at alle datafiler følger datamodellen. Kører automatisk før `npm run build`.
// Ved fejl stopper buildet, og fejlene skrives ud på dansk.
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = join(root, 'src', 'data');
const errors = [];
const fejl = (fil, besked) => errors.push(`${fil}: ${besked}`);

const read = (path) => {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (e) {
    fejl(path.replace(root + '/', ''), `kunne ikke læses som JSON (${e.message})`);
    return null;
  }
};

const REGIONER = ['Nordjylland', 'Midtjylland', 'Syddanmark', 'Sjælland', 'Hovedstaden'];
const DAGE = ['mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'loerdag', 'soendag'];
const TID = /^\d{2}:\d{2}-\d{2}:\d{2}(, \d{2}:\d{2}-\d{2}:\d{2})*$/;
const DATO = /^\d{4}-\d{2}-\d{2}$/;
const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const idag = new Date().toISOString().slice(0, 10);

const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isBool = (v) => typeof v === 'boolean';
const isUrl = (v) => isStr(v) && /^https?:\/\/[^\s]+$/.test(v);
const nullOr = (check) => (v) => v === null || check(v);
const isStrArr = (v) => Array.isArray(v) && v.every(isStr);

// --- maerker.json ---
const maerker = read(join(dataDir, 'maerker.json')) ?? [];
const maerkeNavne = new Set();
const maerkeSlugs = new Set();
for (const m of maerker) {
  const f = `maerker.json (${m?.navn ?? '?'})`;
  if (!isStr(m.navn)) fejl(f, 'mangler "navn"');
  if (!SLUG.test(m.slug ?? '')) fejl(f, `ugyldig slug "${m.slug}"`);
  if (!nullOr(isStr)(m.producentland)) fejl(f, '"producentland" skal være tekst eller null');
  if (!nullOr(isUrl)(m.link)) fejl(f, '"link" skal være en URL eller null');
  if (!isStr(m.tip)) fejl(f, 'mangler "tip" (unik tekst til mærkesiden)');
  if (maerkeSlugs.has(m.slug)) fejl(f, `slug "${m.slug}" findes flere gange`);
  maerkeNavne.add(m.navn);
  maerkeSlugs.add(m.slug);
}

// --- regioner.json ---
const regioner = read(join(dataDir, 'regioner.json')) ?? [];
for (const r of regioner) {
  const f = `regioner.json (${r?.navn ?? '?'})`;
  if (!REGIONER.includes(r.navn)) fejl(f, `ukendt region "${r.navn}"`);
  if (!SLUG.test(r.slug ?? '')) fejl(f, `ugyldig slug "${r.slug}"`);
  if (!isStr(r.intro)) fejl(f, 'mangler "intro"');
}
if (regioner.length !== REGIONER.length) fejl('regioner.json', `skal indeholde præcis ${REGIONER.length} regioner`);

// --- ydelser.json ---
const ydelser = read(join(dataDir, 'ydelser.json')) ?? [];
const ydelseIds = new Set(ydelser.map((y) => y.id));

// --- forhandlere ---
const FELTER = {
  slug: (v) => SLUG.test(v ?? ''),
  navn: isStr,
  adresse: isStr,
  postnr: (v) => /^\d{4}$/.test(v ?? ''),
  by: isStr,
  region: (v) => REGIONER.includes(v),
  breddegrad: (v) => typeof v === 'number' && v > 54.5 && v < 57.8,
  laengdegrad: (v) => typeof v === 'number' && v > 8 && v < 15.3,
  telefon: nullOr((v) => /^\d{2} \d{2} \d{2} \d{2}$/.test(v)),
  email: nullOr((v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)),
  hjemmeside: nullOr(isUrl),
  aabningstider: (v) => v !== null && typeof v === 'object',
  aabningstiderVaerksted: (v) => v === null || typeof v === 'object',
  nyeMaerkerCampingvogne: nullOr(isStrArr),
  nyeMaerkerAutocampere: nullOr(isStrArr),
  teltvogne: nullOr(isStrArr),
  saelgerBrugte: nullOr(isBool),
  saelgerAutocampere: nullOr(isBool),
  vaerksted: nullOr(isBool),
  ydelser: isStrArr,
  dcuTestcenter: nullOr(isBool),
  udlejning: nullOr(isBool),
  opbevaring: nullOr(isBool),
  webshop: nullOr(isBool),
  brancheforening: nullOr(isStrArr),
  cvr: nullOr((v) => /^\d{8}$/.test(v)),
  etableret: nullOr((v) => Number.isInteger(v) && v >= 1900 && v <= new Date().getFullYear()),
  beskrivelse: isStr,
  kilder: (v) => Array.isArray(v) && v.length > 0,
  sidstTjekket: (v) => DATO.test(v ?? '') && v <= idag,
};

const checkUge = (f, navn, obj) => {
  if (obj === null) return;
  for (const key of Object.keys(obj)) {
    if (![...DAGE, 'note'].includes(key)) fejl(f, `${navn}: ukendt felt "${key}"`);
  }
  for (const dag of DAGE) {
    if (!(dag in obj)) fejl(f, `${navn}: mangler "${dag}" (brug null hvis ukendt)`);
    const v = obj[dag];
    if (v !== null && v !== 'lukket' && !TID.test(v)) fejl(f, `${navn}.${dag}: "${v}" skal være fx "10:00-17:00", "lukket" eller null`);
  }
  if (!nullOr(isStr)(obj.note)) fejl(f, `${navn}.note skal være tekst eller null`);
};

const forhandlerDir = join(dataDir, 'forhandlere');
const filer = readdirSync(forhandlerDir).filter((f) => f.endsWith('.json'));
if (filer.length === 0) fejl('forhandlere/', 'ingen forhandlere fundet');
const slugs = new Set();

for (const fil of filer) {
  const f = `forhandlere/${fil}`;
  const d = read(join(forhandlerDir, fil));
  if (!d) continue;

  for (const key of Object.keys(d)) if (!(key in FELTER)) fejl(f, `ukendt felt "${key}"`);
  for (const [key, check] of Object.entries(FELTER)) {
    if (!(key in d)) fejl(f, `mangler feltet "${key}" (brug null hvis ukendt)`);
    else if (!check(d[key])) fejl(f, `feltet "${key}" har en ugyldig værdi: ${JSON.stringify(d[key])}`);
  }
  if (d.slug && fil !== `${d.slug}.json`) fejl(f, `filnavnet skal være "${d.slug}.json"`);
  if (slugs.has(d.slug)) fejl(f, `slug "${d.slug}" findes flere gange`);
  slugs.add(d.slug);

  checkUge(f, 'aabningstider', d.aabningstider ?? null);
  checkUge(f, 'aabningstiderVaerksted', d.aabningstiderVaerksted ?? null);

  for (const felt of ['nyeMaerkerCampingvogne', 'nyeMaerkerAutocampere', 'teltvogne']) {
    for (const m of d[felt] ?? []) if (!maerkeNavne.has(m)) fejl(f, `${felt}: mærket "${m}" findes ikke i maerker.json`);
  }
  for (const y of d.ydelser ?? []) if (!ydelseIds.has(y)) fejl(f, `ydelser: "${y}" findes ikke i ydelser.json`);

  const saetninger = (d.beskrivelse ?? '').split(/[.!?](\s|$)/).filter((s) => s && s.trim().length > 3).length;
  if (saetninger < 2 || saetninger > 3) fejl(f, `beskrivelse skal være 2-3 sætninger (fandt ${saetninger})`);

  (d.kilder ?? []).forEach((k, i) => {
    if (!isUrl(k.url)) fejl(f, `kilder[${i}].url er ikke en gyldig URL`);
    if (!isStr(k.hvad)) fejl(f, `kilder[${i}].hvad mangler`);
    if (!DATO.test(k.tjekketDato ?? '') || k.tjekketDato > idag) fejl(f, `kilder[${i}].tjekketDato skal være en dato (ÅÅÅÅ-MM-DD), ikke i fremtiden`);
  });
}

if (errors.length) {
  console.error(`\nDatatjek fejlede (${errors.length} fejl):\n`);
  for (const e of errors) console.error('  ✗ ' + e);
  console.error('\nRet fejlene i src/data og kør igen.\n');
  process.exit(1);
}
console.log(`Datatjek OK: ${filer.length} forhandlere, ${maerker.length} mærker, ${regioner.length} regioner.`);
