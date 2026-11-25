import type { Forhandler } from './data';
import type { IkonNavn } from './ikoner';
import { forhandlere } from './data';

export interface Service {
  slug: string;
  /** Kort navn til filter og mærkater */
  kort: string;
  ikon: IkonNavn;
  /** Overskrift på servicesiden */
  titel: string;
  /** 2–3 sætninger unik, hjælpsom tekst */
  intro: string;
  match: (d: Forhandler) => boolean;
}

export const services: Service[] = [
  {
    slug: 'vaerksted',
    ikon: 'vaerksted',
    kort: 'Værksted',
    titel: 'Værksted til campingvogne',
    intro:
      'Et værksted hos forhandleren kan lave service, reparationer og de årlige tests. Ring og spørg om ventetid i foråret – mange værksteder har travlt lige før sæsonen.',
    match: (d) => d.vaerksted === true,
  },
  {
    slug: 'dcu-testcenter',
    ikon: 'dcu',
    kort: 'DCU-testcenter',
    titel: 'DCU-testcentre',
    intro:
      'Et DCU-testcenter laver tests efter Dansk Camping Unions faste krav, og værktøjet bliver kontrolleret udefra. Er du medlem af DCU, får du rabat på testene – husk medlemskortet.',
    match: (d) => d.dcuTestcenter === true,
  },
  {
    slug: 'gastest',
    ikon: 'gas',
    kort: 'Gastest',
    titel: 'Gastest af campingvogn',
    intro:
      'En gastest tjekker, at gasanlægget er tæt og sikkert. Den bør laves jævnligt og altid, når du køber en brugt vogn. Spørg, om du får en skriftlig rapport med.',
    match: (d) => d.ydelser.includes('gastest'),
  },
  {
    slug: 'fugttest',
    ikon: 'fugt',
    kort: 'Fugttest',
    titel: 'Fugttest af campingvogn',
    intro:
      'Fugt er en campingvogns største fjende. En fugttest én gang om året finder skader i tide, og den kræves ofte for at bevare fabrikkens tæthedsgaranti. Tøm skabe og gaskasse før testen.',
    match: (d) => d.ydelser.includes('fugttest'),
  },
  {
    slug: 'forsikringsskader',
    ikon: 'skade',
    kort: 'Forsikringsskader',
    titel: 'Reparation af forsikringsskader',
    intro:
      'Har vognen fået en storm-, hagl- eller kollisionsskade, så anmeld den først til dit forsikringsselskab. Værkstedet kan derefter få skaden vurderet og repareret.',
    match: (d) => d.ydelser.includes('forsikringsskader'),
  },
  {
    slug: 'mover',
    ikon: 'mover',
    kort: 'Mover',
    titel: 'Montering af mover på campingvogn',
    intro:
      'En mover gør det let at flytte vognen på pladsen eller i indkørslen. Tjek vognens totalvægt, for moveren og batteriet vejer typisk 30–40 kg.',
    match: (d) => d.ydelser.includes('mover-montering'),
  },
  {
    slug: 'udlejning',
    ikon: 'udlejning',
    kort: 'Udlejning',
    titel: 'Udlejning af campingvogne og autocampere',
    intro:
      'At leje før du køber er en god måde at finde ud af, hvilken størrelse og indretning der passer jer. Spørg om dyr er tilladt, og hvad forsikringen dækker.',
    match: (d) => d.udlejning === true,
  },
  {
    slug: 'brugte-campingvogne',
    ikon: 'brugte',
    kort: 'Brugte vogne',
    titel: 'Brugte campingvogne hos forhandler',
    intro:
      'Køber du brugt hos en forhandler, har du reklamationsret, som du ikke har ved privat handel. Bed om en nylig gastest og fugttest af vognen.',
    match: (d) => d.saelgerBrugte === true,
  },
  {
    slug: 'opbevaring',
    ikon: 'opbevaring',
    kort: 'Opbevaring',
    titel: 'Opbevaring af campingvogn',
    intro:
      'Opbevaring hos forhandleren gør det nemt at få vognen serviceret om vinteren. Spørg om pladsen er aflåst, om du kan hente vognen når som helst, og om den skal være forsikret.',
    match: (d) => d.opbevaring === true,
  },
  {
    slug: 'autocampere',
    ikon: 'autocamper',
    kort: 'Autocampere',
    titel: 'Forhandlere af autocampere',
    intro:
      'En autocamper over 3.500 kg kræver C1-kørekort. Spørg forhandleren, om værkstedet også kan servicere bildelen, eller om den skal til et almindeligt autoværksted.',
    match: (d) => d.saelgerAutocampere === true,
  },
];

export const serviceBySlug = (slug: string) => services.find((s) => s.slug === slug);
export const forhandlereForService = (s: Service) => forhandlere.filter(s.match);
export const servicesFor = (d: Forhandler) => services.filter((s) => s.match(d));
