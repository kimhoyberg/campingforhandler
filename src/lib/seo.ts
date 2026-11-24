import { SITE } from '../config';
import type { Forhandler, Uge } from './data';
import { DAGE } from './data';

export const abs = (path: string) => new URL(path, SITE.url).href;

export interface Crumb {
  navn: string;
  url: string;
}

export function breadcrumbLd(crumbs: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.navn, item: abs(c.url) })),
  };
}

export function itemListLd(navn: string, liste: Forhandler[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: navn,
    numberOfItems: liste.length,
    itemListElement: liste.map((d, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: abs(`/forhandler/${d.slug}/`),
      name: d.navn,
    })),
  };
}

const SCHEMA_DAG: Record<string, string> = {
  mandag: 'Monday',
  tirsdag: 'Tuesday',
  onsdag: 'Wednesday',
  torsdag: 'Thursday',
  fredag: 'Friday',
  loerdag: 'Saturday',
  soendag: 'Sunday',
};

export function openingHoursLd(uge: Uge) {
  const spec: object[] = [];
  for (const { key } of DAGE) {
    const v = uge[key];
    if (!v || v === 'lukket') continue;
    for (const interval of v.split(', ')) {
      const [opens, closes] = interval.split('-');
      spec.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${SCHEMA_DAG[key]}`, opens, closes });
    }
  }
  return spec;
}

export function businessLd(d: Forhandler) {
  const url = abs(`/forhandler/${d.slug}/`);
  const ld: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'AutomotiveBusiness',
    '@id': `${url}#forhandler`,
    name: d.navn,
    description: d.beskrivelse,
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: d.adresse,
      postalCode: d.postnr,
      addressLocality: d.by,
      addressRegion: `Region ${d.region}`,
      addressCountry: 'DK',
    },
    geo: { '@type': 'GeoCoordinates', latitude: d.breddegrad, longitude: d.laengdegrad },
  };
  if (d.telefon) ld.telephone = `+45 ${d.telefon}`;
  if (d.email) ld.email = d.email;
  if (d.hjemmeside) ld.sameAs = [d.hjemmeside];
  if (d.cvr) ld.vatID = `DK${d.cvr}`;
  if (d.etableret) ld.foundingDate = String(d.etableret);
  const hours = openingHoursLd(d.aabningstider);
  if (hours.length) ld.openingHoursSpecification = hours;
  return ld;
}
