// Fælles indstillinger for siden. Ret her, så slår det igennem overalt.
export const SITE = {
  navn: 'Campingforhandler.dk',
  url: 'https://campingforhandler.dk',
  // Adressen som forhandlere skriver til for at rette deres oplysninger.
  // PLADSHOLDER: skift til den rigtige postkasse, før siden går online.
  rettelserEmail: 'ret@campingforhandler.dk',
};

// Cookiefri statistik (ingen cookie-banner nødvendig).
// Sæt `provider` til 'plausible' eller 'umami' og udfyld felterne for at slå det til.
// Står provider på null, indlæses der intet script.
export const ANALYTICS: {
  provider: 'plausible' | 'umami' | null;
  plausibleDomain: string;
  plausibleSrc: string;
  umamiSrc: string;
  umamiWebsiteId: string;
} = {
  provider: null,
  plausibleDomain: 'campingforhandler.dk',
  plausibleSrc: 'https://plausible.io/js/script.js',
  umamiSrc: 'https://cloud.umami.is/script.js',
  umamiWebsiteId: 'INDSÆT-UMAMI-WEBSITE-ID',
};
