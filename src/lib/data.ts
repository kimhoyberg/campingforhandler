import maerkerData from '../data/maerker.json';
import regionerData from '../data/regioner.json';
import ydelserData from '../data/ydelser.json';

export type Dag = 'mandag' | 'tirsdag' | 'onsdag' | 'torsdag' | 'fredag' | 'loerdag' | 'soendag';
export type Uge = Record<Dag, string | null> & { note: string | null };

export interface Kilde {
  /** web (standard): en side på nettet. forhandler: bekræftet af forhandleren selv. redaktion: kendt af redaktionen. */
  type?: 'web' | 'forhandler' | 'redaktion';
  url: string | null;
  hvad: string;
  tjekketDato: string;
}

export const KILDETYPE_NAVN = {
  web: '',
  forhandler: 'Bekræftet af forhandleren',
  redaktion: 'Oplyst af redaktionen',
} as const;

export interface Forhandler {
  slug: string;
  navn: string;
  adresse: string;
  postnr: string;
  by: string;
  region: string;
  breddegrad: number;
  laengdegrad: number;
  telefon: string | null;
  email: string | null;
  hjemmeside: string | null;
  aabningstider: Uge;
  aabningstiderVaerksted: Uge | null;
  nyeMaerkerCampingvogne: string[] | null;
  nyeMaerkerAutocampere: string[] | null;
  teltvogne: string[] | null;
  saelgerBrugte: boolean | null;
  saelgerAutocampere: boolean | null;
  vaerksted: boolean | null;
  ydelser: string[];
  dcuTestcenter: boolean | null;
  udlejning: boolean | null;
  opbevaring: boolean | null;
  webshop: boolean | null;
  brancheforening: string[] | null;
  cvr: string | null;
  etableret: number | null;
  beskrivelse: string;
  kilder: Kilde[];
  sidstTjekket: string;
}

export interface Maerke {
  navn: string;
  slug: string;
  producentland: string | null;
  link: string | null;
  type: string;
  tip: string;
}

export interface Region {
  navn: string;
  slug: string;
  intro: string;
}

const moduler = import.meta.glob<Forhandler>('../data/forhandlere/*.json', { eager: true, import: 'default' });

export const forhandlere: Forhandler[] = Object.values(moduler).sort((a, b) => a.navn.localeCompare(b.navn, 'da'));
export const maerker: Maerke[] = [...(maerkerData as Maerke[])].sort((a, b) => a.navn.localeCompare(b.navn, 'da'));
export const regioner: Region[] = regionerData as Region[];
export const ydelser = ydelserData as { id: string; navn: string }[];

export const DAGE: { key: Dag; navn: string }[] = [
  { key: 'mandag', navn: 'Mandag' },
  { key: 'tirsdag', navn: 'Tirsdag' },
  { key: 'onsdag', navn: 'Onsdag' },
  { key: 'torsdag', navn: 'Torsdag' },
  { key: 'fredag', navn: 'Fredag' },
  { key: 'loerdag', navn: 'Lørdag' },
  { key: 'soendag', navn: 'Søndag' },
];

/** æ→ae, ø→oe, å→aa, kun små bogstaver og bindestreger. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const maerkeByNavn = (navn: string) => maerker.find((m) => m.navn === navn);
export const maerkeBySlug = (slug: string) => maerker.find((m) => m.slug === slug);
export const regionByNavn = (navn: string) => regioner.find((r) => r.navn === navn)!;
export const ydelseNavn = (id: string) => ydelser.find((y) => y.id === id)?.navn ?? id;

/** Alle mærker (nye campingvogne, autocampere og teltvogne) som forhandleren fører. */
export function maerkerFor(d: Forhandler): string[] {
  const alle = [...(d.nyeMaerkerCampingvogne ?? []), ...(d.nyeMaerkerAutocampere ?? []), ...(d.teltvogne ?? [])];
  return [...new Set(alle)].sort((a, b) => a.localeCompare(b, 'da'));
}

export const forhandlereForMaerke = (m: Maerke) => forhandlere.filter((d) => maerkerFor(d).includes(m.navn));
export const forhandlereForRegion = (r: Region) => forhandlere.filter((d) => d.region === r.navn);

/** Mærke + region-kombinationer. Siden laves kun, når der er mindst 2 forhandlere. */
export function maerkeRegionKombinationer() {
  const ud: { maerke: Maerke; region: Region; liste: Forhandler[] }[] = [];
  for (const maerke of maerker) {
    for (const region of regioner) {
      const liste = forhandlereForMaerke(maerke).filter((d) => d.region === region.navn);
      if (liste.length >= 2) ud.push({ maerke, region, liste });
    }
  }
  return ud;
}

export const harKombination = (maerkeSlug: string, regionSlug: string) =>
  maerkeRegionKombinationer().some((k) => k.maerke.slug === maerkeSlug && k.region.slug === regionSlug);

export const telefonHref = (t: string) => `tel:+45${t.replace(/\s/g, '')}`;

export const rutevejledning = (d: Forhandler) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${d.adresse}, ${d.postnr} ${d.by}, Danmark`)}`;

export function formatDato(iso: string): string {
  const mdr = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];
  const [y, m, dag] = iso.split('-').map(Number);
  return `${dag}. ${mdr[m - 1]} ${y}`;
}

/** Oplysninger ældre end et halvt år vises med en advarsel. */
export const FORAELDET_DAGE = 180;
export const erForaeldet = (d: Forhandler) => (Date.now() - new Date(d.sidstTjekket).getTime()) / 864e5 > FORAELDET_DAGE;

export const antal = (n: number, ental: string, flertal: string) => `${n} ${n === 1 ? ental : flertal}`;
