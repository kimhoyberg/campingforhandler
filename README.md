# Campingforhandler.dk

En dansk oversigt over forhandlere af campingvogne. Du kan finde dem efter **mærke**, **område** og **ydelse** (værksted, DCU-testcenter, udlejning, brugte vogne m.m.).

Siden er helt statisk. Der er ingen database: alle oplysninger ligger i små tekstfiler (JSON) i `src/data/`.

## Kør siden på din egen computer

Du skal have [Node.js](https://nodejs.org) version 20 eller nyere.

```bash
npm install
```

```bash
npm run dev
```

Åbn http://localhost:4321 i din browser. Siden opdaterer sig selv, når du gemmer en fil.

## Byg siden

```bash
npm run build
```

Kommandoen tjekker først alle datafiler (se "Datatjek" herunder). Derefter bygger den den færdige side i mappen `dist/`. Er der fejl i data, stopper den og fortæller, hvad der er galt.

Se den byggede side, før den lægges online:

```bash
npm run preview
```

## Læg siden online

### GitHub Pages (gratis, direkte fra repoet)

Workflowen `.github/workflows/deploy.yml` bygger og udruller siden, hver gang der pushes til repoets standard-branch (Settings → General → Default branch).

1. Gå til **Settings → Pages** i repoet, og vælg **Source: GitHub Actions**.
2. Push til standard-branchen, eller kør workflowen manuelt under **Actions → Udrul til GitHub Pages → Run workflow**.

Siden ligger derefter på `https://kimhoyberg.github.io/campingforhandler/`. Alle links tilpasses automatisk til undermappen.

GitHub Pages er gratis for offentlige repoer. Er repoet privat, kræver Pages et betalt GitHub-abonnement.

**Eget domæne (campingforhandler.dk):**

1. Skriv domænet under **Settings → Pages → Custom domain**, og opsæt DNS hos din domæneudbyder, som GitHub beskriver.
2. Opret variablen `CUSTOM_DOMAIN` med værdien `campingforhandler.dk` under **Settings → Secrets and variables → Actions → Variables**.
3. Kør workflowen igen. Nu bygges siden til roden af domænet.

Uden eget domæne ligger `robots.txt` i undermappen, hvor søgemaskiner ikke kigger efter den. Siden kan stadig findes, men eget domæne er bedst til søgemaskiner.

### Cloudflare Pages eller Netlify

**Cloudflare Pages:** Opret et nyt projekt og forbind det til GitHub-repositoriet. Vælg *Framework preset: Astro*, *Build command:* `npm run build`, *Build output directory:* `dist`. Sæt miljøvariablen `NODE_VERSION` til `22`.

**Netlify:** Opret et nyt site fra GitHub-repositoriet. Indstillingerne står allerede i `netlify.toml`, så du skal bare trykke *Deploy*.

### Før siden går online

1. Ret e-mailadressen til rettelser i `src/config.ts` (`rettelserEmail`).
2. Slå eventuelt statistik til i samme fil (se herunder).

### Statistik uden cookies

I `src/config.ts` står `ANALYTICS.provider: null`. Skriv `'plausible'` eller `'umami'` i stedet, og udfyld domænet eller website-id'et. Begge sætter ingen cookies, så der skal ikke være et cookie-banner.

## Tilføj en ny forhandler – trin for trin

1. **Find oplysningerne.** Start altid med forhandlerens egen hjemmeside: forsiden, kontaktsiden, åbningstider, værksted og mærker. Se i bunden af siden, om de er medlem af fx Camping Outdoor Danmark. Brug kun andre kilder (producenternes forhandlersøgning, DBA, CVR) til det, der mangler.
2. **Kopiér en eksisterende fil.** Gå til `src/data/forhandlere/` og kopiér en af filerne, fx `le-camping.json`.
3. **Giv filen et navn.** Brug forhandlerens navn med små bogstaver og bindestreger. Skriv æ som `ae`, ø som `oe` og å som `aa`. Eksempel: "Østsjællands Camping Center" bliver `oestsjaellands-camping-center.json`.
4. **Ret felterne.** `slug` skal være det samme som filnavnet (uden `.json`). Skriv `null`, hvis du ikke har fundet en sikker kilde. **Gæt aldrig.**
   - Åbningstider skrives som `"10:00-17:00"`, `"lukket"` eller `null`.
   - `region` skal være en af: Nordjylland, Midtjylland, Syddanmark, Sjælland, Hovedstaden.
   - Telefon skrives som `"12 34 56 78"`.
   - Mærker skal stå præcis som i `src/data/maerker.json`. Mangler et mærke, så tilføj det dér først.
   - Ydelser skal stå som i `src/data/ydelser.json`.
   - Har firmaet flere butikker, laver du én fil pr. butik og skriver de andre butikkers slugs i `sammeFirma` i begge filer, fx `"sammeFirma": ["struer-caravan"]`. Ellers `null`.
5. **Find koordinaterne.** Søg adressen på [openstreetmap.org](https://www.openstreetmap.org), højreklik på stedet og vælg "Vis adresse". Kopiér de to tal til `breddegrad` (det første, ca. 55–57) og `laengdegrad` (det andet, ca. 8–15).
6. **Skriv en beskrivelse** på 2–3 korte sætninger med dine egne ord. Kopiér aldrig forhandlerens tekst.
7. **Skriv kilderne.** Under `kilder` skriver du hver side, du har brugt: adressen, hvad du fandt der, og datoen. Sæt `sidstTjekket` til dagens dato.
   - Har forhandleren selv bekræftet noget på mail eller telefon, så skriv `"type": "forhandler"` og `"url": null`.
   - Ved du det selv, fx fra et besøg, så skriv `"type": "redaktion"` og `"url": null`.
   - Eksempel: `{ "type": "forhandler", "url": null, "hvad": "Sælger ikke autocampere", "tjekketDato": "2026-11-24" }`
8. **Tjek og byg.** Kør `npm run build`. Er der fejl, står der præcis hvilken fil og hvilket felt. Ret og kør igen.

Forhandleren kommer nu automatisk med på forsiden og på de rigtige mærke-, region- og servicesider. Får et mærke i en region 2 forhandlere, laves siden `/maerke/<mærke>/<region>/` af sig selv.

## Datatjek

`scripts/validate.mjs` kører før hvert build og tjekker blandt andet:

- at alle felter findes og har den rigtige type
- at region, mærker og ydelser findes i de faste lister
- at åbningstider, telefon, CVR og datoer har det rigtige format
- at koordinaterne ligger i Danmark
- at beskrivelsen er 2–3 sætninger, og at der er mindst én kilde

Du kan også køre tjekket alene med `npm run validate`. `npm run check` tjekker koden for typefejl.

## Kildetjek hver uge

Workflowen `.github/workflows/kildetjek.yml` kører hver mandag morgen (og kan startes manuelt under **Actions → Kildetjek → Run workflow**). Den kører `scripts/kildetjek.mjs`, som henter alle kildesider og sammenligner med sidste uge (`.kildetjek/snapshot.json`):

- **DCU-testcenter** rettes automatisk ud fra DCU's liste.
- **Ændrede åbningstider, mærker eller ydelser, døde links og forhandlere, der ikke er tjekket i over et halvt år,** samles i et issue på GitHub. Du ser på siden, retter JSON-filen og sætter `sidstTjekket` til dagens dato.
- Bagefter genbygges siden, så advarslen "kan være forældet" kommer med på forhandlere med gamle oplysninger.

Du kan også køre tjekket på din egen computer:

```bash
node scripts/kildetjek.mjs
```

Rapporten ligger derefter i `.kildetjek/rapport.md`.

## Mapper

```
src/data/forhandlere/   én fil pr. forhandler
src/data/maerker.json   mærker (navn, land, link, tip til mærkesiden)
src/data/regioner.json  de fem regioner med en kort tekst
src/data/ydelser.json   faste navne for værkstedsydelser
src/config.ts           e-mail til rettelser og statistik
src/lib/                datafunktioner, services og SEO
src/pages/              siderne
scripts/validate.mjs    datatjek
scripts/kildetjek.mjs   ugentligt kildetjek
.kildetjek/             sidste uges udgangspunkt for kildetjekket
```

Se også `DECISIONS.md` (valg og hvorfor) og `DATA_NOTES.md` (hvad der mangler, og hvor kilderne var uenige).
