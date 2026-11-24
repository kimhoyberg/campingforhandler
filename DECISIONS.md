# Beslutninger

Valg truffet undervejs, og hvorfor.

## Teknik

- **Astro 5, statisk output, almindelig CSS.** Ingen Tailwind: én lille CSS-fil er nemmere at læse og giver ingen ekstra byggetrin. CSS lægges direkte ind i HTML'en (`inlineStylesheets: 'always'`), så der er ingen ekstra forespørgsler.
- **Ingen webfonts.** Systemets egen skrift er hurtig og læsbar. Det er en stor del af grunden til 100 i Lighthouse.
- **Egen `sitemap.xml` i stedet for `@astrojs/sitemap`.** Så kan sider med `noindex` (under 2 forhandlere) udelades fra sitemap'et, og der er én afhængighed mindre.
- **GitHub Pages i en undermappe.** Uden eget domæne ligger siden på `kimhoyberg.github.io/campingforhandler/`. Alle sider skriver interne links fra roden (`/maerke/kabe/`), og et lille trin efter buildet (i `astro.config.mjs`) sætter undermappen foran. Det er valgt frem for at ændre hvert eneste link i koden. Canonical, JSON-LD og sitemap bygger den fulde adresse med `abs()`. Undermappe og adresse styres af `BASE_PATH` og `SITE_ORIGIN`, som workflowen sætter.
- **`trailingSlash: 'always'`** og `build.format: 'directory'`, så adresserne ser ud som `/forhandler/le-camping/` på både Netlify og Cloudflare Pages.
- **JavaScript kun på forsiden** til filteret (ca. 1 KB). Uden JavaScript vises alle forhandlere, og der står links til mærke-, region- og servicesiderne.
- **Filteret husker valget i adressen** (`?maerke=kabe&region=sjaelland`), så et filtreret link kan deles.
- **Kun lyst tema.** Siden er altid lys, også når telefonen står på mørk tilstand. Det giver ét roligt udtryk, og kontrasten følger WCAG AA.

## Datamodel

- **Ekstra felt: `aabningstiderVaerksted`.** Flere forhandlere har andre tider på værkstedet end i butikken (fx Camping Parken, Bijé, SK Caravan). Det er netop den slags oplysninger, siden skal hjælpe med, så det fik sit eget felt med samme form som `aabningstider`. Det er `null`, når tiderne ikke er oplyst separat.
- **Åbningstider pr. dag** som `"10:00-17:00"`, `"lukket"` eller `null` (ukendt). Delte dage skrives `"09:00-12:00, 14:00-17:00"`. Sæsonændringer står i `note`.
- **`null` betyder "ikke fundet"** for alle felter, også ja/nej-felter og mærkelister. `false` bruges kun, når en kilde siger nej (fx at der ikke er opbevaring, eller at forhandleren ikke er på DCU's liste). En tom liste `[]` betyder, at vi har set forhandlerens mærkeoversigt, og at der ikke var nogen af den type.
- **Tre slags kilder:** `web` (standard, kræver URL), `forhandler` (bekræftet af forhandleren selv på mail eller telefon) og `redaktion` (kendt af redaktionen). De to sidste har `url: null` og vises som tekst på forhandlersiden. Det gør det muligt at skrive "Nej" til ting, som en hjemmeside aldrig nævner, fx at Viborg Caravan Center ikke sælger autocampere.
- **`brancheforening` er en liste**, fordi flere forhandlere er medlem af mere end én (Camping Parken: Camping Outdoor Danmark, DCU og Autobranchen Danmark).
- **`ydelser` bruger et fast ordforråd** i `src/data/ydelser.json`, så de kan filtreres og vises ens. Valideringen afviser ukendte ydelser.
- **Mærker gemmes med navn** (fx `"Niesmann+Bischoff"`) i forhandlerfilerne og slås op i `maerker.json`. Valideringen tjekker, at mærket findes.
- **`maerker.json` har to ekstra felter:** `type` (campingvogne, autocampere osv.) og `tip` – de 2–3 sætninger unik tekst, som står øverst på mærkesiden.
- **Regionsnavne** følger de fem danske regioner. "Jylland" findes ikke som side. Det ville kræve en ekstra region, der overlapper de andre.

## Dataindsamling

- **Netværket i arbejdsmiljøet var låst.** Der blev oprettet et miljø, hvor forhandlernes sider, producenternes forhandlersøgninger, DBA, Bilbasen, DCU og Nominatim måtte hentes.
- **DAWA er lukket** (svarer 410). Koordinater er hentet fra OpenStreetMap Nominatim i stedet.
- **CVR:** virk.dk blokerer automatiske opslag, og cvrapi.dk's gratis kvote var brugt op. CVR-numre er kun angivet, når de stod hos forhandleren selv, på DBA eller i et søgeresultat fra Proff/De Gule Sider. Er der to mulige numre, er feltet `null`.
- **Producenternes standardtider er ikke brugt.** Knaus Tabbert og Weinsberg viser de samme tider for alle forhandlere. Det er en skabelon.
- **DCU-testcenter** er tjekket mod DCU's egen liste, ikke kun forhandlernes udsagn.
- **Åbningstider med sæson** gemmes for den aktuelle periode (november 2026), og den anden periode står i noten.
- **Beskrivelser** er skrevet fra bunden ud fra fakta. Der er ikke kopieret tekst, billeder eller logoer.

## Indhold og SEO

- **Tynde sider:** oversigter med kun 1 forhandler får `<meta name="robots" content="noindex, follow">` og er udeladt af sitemap'et. De findes stadig, så interne links virker.
- **Mærke + region-sider** laves kun ved mindst 2 forhandlere. Lige nu er der 5: Dethleffs, Fendt og Hobby i Midtjylland samt Kabe og Knaus på Sjælland.
- **Forhandlersider linker til mærke + region-siden**, når den findes, ellers til mærkesiden.
- **Titler** får kun "| Campingforhandler.dk" på, når titlen er kort, så de vigtige ord ikke bliver skåret af i Google.
- **Servicesider:** værksted, DCU-testcenter, gastest, fugttest, forsikringsskader, mover, udlejning, brugte vogne, opbevaring og autocampere. Servicen "mover" har adressen `/service/mover/`.
- **Rutevejledning** er et almindeligt Google Maps-link. Der er intet indlejret kort, så siden er hurtig og uden tredjepartscookies.
- **JSON-LD-typen er `AutomotiveBusiness`.** CVR vises som `vatID` (DK + nummer).
- **Open Graph-billede** (`public/og.png`) er lavet til siden og er ens for alle sider.

## Pladsholdere, der skal udfyldes

- **`SITE.rettelserEmail`** i `src/config.ts` er sat til `ret@campingforhandler.dk`. Det skal være en rigtig postkasse, før siden går online.
- **Statistik:** `ANALYTICS.provider` i `src/config.ts` er `null`, så der indlæses intet. Sæt den til `'plausible'` eller `'umami'` for at slå den til. Begge er cookiefri, så der skal ikke være et cookie-banner.
- **"Hvem står bag"** på `/om/` beskriver siden som et uafhængigt projekt uden navn. Tilføj ejerens navn, hvis det ønskes.
