# Datanoter

Alle 29 forhandlere er tjekket **24. november 2026**. De første 10 kom fra opgavens startliste, de næste 10 fra DCU's liste over test- og servicecentre ("Runde 2"), Struer Caravan som afdeling af Viborg Caravan Center, og 8 fra Knaus Tabberts forhandlerliste ("Runde 3"). Forhandlerens egen hjemmeside er brugt som hovedkilde for 9 af 10. Kilderne for hvert felt står i `kilder` i den enkelte JSON-fil og vises nederst på forhandlersiden.

## Dækning pr. forhandler

Tabellen tæller 17 felter, som kan mangle: telefon, e-mail, hjemmeside, åbningstider, de tre mærkelister, de fem ja/nej-felter for salg og værksted, DCU, udlejning, opbevaring, webshop, brancheforening, CVR og etableret. Adresse, postnr., by, region, koordinater og beskrivelse er udfyldt for alle 10.

| Forhandler | Fundet | Mangler (står som `null` / "Ukendt") | Hovedkilde |
|---|---|---|---|
| Camping Parken Herning | 15/17 | opbevaring, etableret | campingparken.dk |
| Bijé Fritid & Camping | 14/17 | webshop, brancheforening, etableret | bije.dk (fundet i denne runde) |
| Damsgaards CaravanCenter | 14/17 | sælger autocampere, udlejning, opbevaring | damsgaardscaravancenter.dk (fundet via DBA) |
| LE Camping | 14/17 | sælger autocampere, udlejning, webshop | le-camping.dk |
| Østsjællands Camping Center | 14/17 | sælger autocampere, udlejning, CVR | oecc.dk |
| SK Caravan | 13/17 | opbevaring, brancheforening, CVR, etableret | skcaravan.dk (fundet i denne runde) |
| Hinshøj Caravan | 12/17 | udlejning, opbevaring, brancheforening, CVR, etableret | hinshoj.dk (fundet via Bilbasen) |
| Viborg Caravan Center | 12/17 | sælger autocampere, udlejning, opbevaring, webshop, brancheforening | viborg-caravancenter.dk |
| Vestsjællands Campingcenter | 11/17 | sælger autocampere, udlejning, opbevaring, webshop, brancheforening, CVR | vs-camping.dk |
| Vestjysk Camping Center | **6/17** | hjemmeside, åbningstider, alle mærker, brugte, autocampere, udlejning, opbevaring, webshop, brancheforening | Knaus Tabberts forhandlersøgning (egen side virker ikke) |

**I alt: 125 af 170 felter (74 %).** Uden Vestjysk: 119 af 153 (78 %).

"Mangler" betyder, at vi ikke har fundet en sikker kilde. Det betyder ikke, at forhandleren ikke tilbyder det. Felterne for udlejning og opbevaring står kun som "Nej", når forhandleren selv skriver det (fx skriver Østsjællands Camping Center, at de ikke har opbevaring).

### DCU-testcenter

Bekræftet for alle 10 ud fra DCU's egen liste (dcu.dk/da/medlemsfordele/dcu-servicecentre): **Camping Parken Herning, LE Camping og Bijé** er DCU-testcentre. De øvrige 7 står ikke på listen og har derfor `false`.

## Uenige eller usikre kilder

| Forhandler | Felt | Uenighed | Hvad vi valgte |
|---|---|---|---|
| Alle med Knaus Tabbert/Weinsberg-profil | Åbningstider | Producenternes forhandlersøgning viser **de samme tider for alle forhandlere** (man–fre 9–12 og 14–17, lør 9–12). Det er en standardskabelon, ikke rigtige tider. | Ikke brugt. Egen hjemmeside gælder. |
| Hinshøj Caravan | Lørdag | Bilbasen: lørdag 10–15. Egen side: lørdag lukket. | Egen side (lukket). |
| Hinshøj Caravan | Søndag | Egen side: 10–16 fra 4/1–31/8, 11–16 fra 1/9–18/12. | Gemt den aktuelle periode (11–16), den anden står i noten. |
| Viborg Caravan Center | Weekend | Kontaktsiden viser tre forskellige sæt weekendtider. Forsiden siger "lukket i weekenden resten af året". | Lukket i weekenden + note. Bør tjekkes igen i foråret. |
| Viborg Caravan Center | Adresse | Første runde: Fuglevænget 10. Egen side: Fuglevænget 6-10. | Fuglevænget 6-10. |
| LE Camping | Adresse | Egen side: Industrivej 15. DCU's liste: Industrivej 13-15. | Industrivej 15. |
| LE Camping | Etableret | Egen side: siden 1961. Andre kilder nævner 1963 og en registrering i 1997 (ejerskifte). | 1961. |
| LE Camping | CVR | Kun fundet hos De Gule Sider (19699838, enkeltmandsvirksomhed) via et søgeresultat. | Brugt, men markeret som ikke bekræftet i CVR. |
| Østsjællands Camping Center | Nye mærker | Teksten på siden nævner LMC, men mærkeoversigten og sidefoden viser kun Knaus, T@B og Kabe. LMC er tilsyneladende en gammel tekst. | Knaus, T@B, Kabe. |
| Østsjællands Camping Center | Brancheforening | Skriver "medlem af campingbranchen" (det gamle navn for Camping Outdoor Danmark). | Gemt som "Camping Branchen", som de selv skriver. |
| SK Caravan | CVR | To mulige: 35844481 (adresse Ubberudvej 121 ifølge CVR-spejl) og 44310678 ("SK Caravan ApS" på estatistik.dk). | `null`, indtil det er tjekket i CVR. |
| SK Caravan | Telefon | Én side nævner +45 65 96 71 05. Resten af siden og DBA: 54 34 88 88. | 54 34 88 88. |
| SK Caravan | Autocampere | Siden skriver, at de forhandler LMC-autocampere. LMC-mærket er så vidt vides stoppet. | Sælger autocampere = ja, men ingen nye autocampermærker angivet. |
| Vestsjællands Campingcenter | CVR | To selskaber på adressen: 29205922 (ejendomsselskab) og 29511233 (fra Creditsafe). | `null`. |
| Vestjysk Camping Center | Hjemmeside | vestjyskcamping.dk står i Knaus Tabberts søgning, men domænet svarer ikke (DNS-fejl, og uden www et ugyldigt certifikat). | `hjemmeside: null`. |
| Vestjysk Camping Center | Mærker | Søgeresultater fra Krak/Campingunivers nævner Knaus, Kabe og Sprite, men det kunne ikke bekræftes. | `null` (ukendt). |
| Bijé Fritid & Camping | Etableret | Krak/De Gule Sider nævner 1986 (kun set i søgeresultat). CVR 41144556 er et nyere ApS. | `null`. |
| Camping Parken Herning | Etableret | Historien siger "begyndelsen af 1960'erne" – intet præcist år. | `null`. |
| Hinshøj Caravan | Etableret | Siden siger, at de nuværende ejere overtog forretningen 1. oktober 1985. Startåret står ikke. | `null`. |

## Andre fund

- **Østsjællands Camping Centers hjemmeside indeholder skjult casino-spam** (engelske tekster om online-casinoer på forsiden). Siden er sandsynligvis hacket. Værd at sige til forhandleren.
- **Koordinater:** DAWA (Danmarks Adressers Web API) er lukket og svarer "410 Gone". I stedet er brugt OpenStreetMap Nominatim, som fandt alle 10 adresser på husnummer-niveau. Camping Parken er slået op som Tjelevej 12.
- **CVR:** Det gratis cvrapi.dk havde opbrugt sin kvote, og datacvr.virk.dk blokerer automatiske opslag. CVR-numre kommer derfor fra forhandlerens egen side (Camping Parken, Bijé), DBA (Damsgaards) eller Proff/De Gule Sider via søgeresultater (Viborg, Vestjysk, LE Camping). Det er markeret i `kilder`.
- **Producentlinks i `maerker.json`** er producenternes officielle hjemmesider. De er ikke hentet og tjekket i denne runde. Vega, Silver og Caravelair har `null`, fordi vi ikke kendte en sikker adresse.
- **Struer Caravan** (Gimsinglundvej 2, 7600 Struer) hører under Viborg Caravan Center (samme CVR og hjemmeside) og har nu sin egen side. Mærket (nye Hobby) og brugte vogne er taget fra lagerlisten, hvor vognene står med "Vognen står i Struer". Telefon og e-mail er fælles med Viborg. Struers weekendtider er lige så uklare på hjemmesiden som Viborgs.

## Runde 2: 10 nye forhandlere fra DCU's liste

Kilde til listen: DCU's oversigt over test- og servicecentre (dcu.dk/da/medlemsfordele/dcu-servicecentre). Alle 10 er DCU-testcentre, og alle oplysninger er tjekket på forhandlerens egen hjemmeside.

| Forhandler | Region | Fundet | Mangler |
|---|---|---|---|
| Campinggården Slagelse | Sjælland | 13/17 | teltvogne, udlejning, webshop, CVR |
| Jysk Caravan Center | Nordjylland | 13/17 | webshop, brancheforening, CVR, etableret |
| Kronjyllands Camping Center | Midtjylland | 12/17 | teltvogne, udlejning, opbevaring, webshop, brancheforening |
| Møllegårdens Camping | Nordjylland | 12/17 | udlejning, opbevaring, webshop, brancheforening, CVR |
| Svendborg Camping Center | Syddanmark | 12/17 | teltvogne, opbevaring, webshop, brancheforening, CVR |
| Tarup Campingcenter | Syddanmark | 12/17 | åbningstider, teltvogne, udlejning, brancheforening, etableret |
| KG Camping | Syddanmark | 11/17 | teltvogne, udlejning, opbevaring, webshop, CVR, etableret |
| Lunderskov Camping | Syddanmark | 11/17 | nye autocampere, sælger autocampere, udlejning, webshop, CVR, etableret |
| Jyderup Camping Center | Sjælland | 8/17 | alle mærkelister, sælger autocampere, udlejning, opbevaring, webshop, brancheforening, etableret |
| Ny Vejle Caravan | Syddanmark | 7/17 | e-mail, åbningstider (salg), alle mærkelister, udlejning, opbevaring, webshop, brancheforening, CVR |

**Samlet for alle 20: 237 af 340 felter (70 %).**

### Noter til runde 2

| Forhandler | Felt | Bemærkning |
|---|---|---|
| Tarup Campingcenter | Åbningstider | Vises med et script, som ikke kunne læses. Står som ukendt. |
| Ny Vejle Caravan | Åbningstider, mærker | Salgstider og lagerlister indlæses med script. Kun værkstedets tider kunne læses. Værkstedet nævner en "Carado leak test", men mærket er ikke bekræftet som nyt. |
| Ny Vejle Caravan | E-mail | Adressen er skjult (beskyttet mod robotter). |
| Lunderskov Camping | Lørdag | Siden siger både "lørdag lukket" og "lørdag 10–16". Står som ukendt. |
| Møllegårdens Camping | Weekend | Åbningstidssiden nævner kun hverdage, men forsiden siger søndag 11–16. Søndag er taget fra forsiden, lørdag står som ukendt. |
| KG Camping | Lørdag | Normalt 10–16, men lukket september–december. Gemt som lukket (november) med note. |
| Kronjyllands Camping Center | Mærker | Siden har også en LMC-side. LMC er ikke taget med som nyt mærke. |
| Jyderup Camping Center | Mærker | Siden har kun en salgsliste med brugte vogne. Ingen nye mærker kunne bekræftes. |
| Svendborg Camping Center | E-mail | Den eneste e-mail på kontaktsiden er en medarbejders. |

## Runde 3: 8 forhandlere fra Knaus Tabberts forhandlerliste

Kilde til listen: Knaus Tabberts forhandler-API (api.knaustabbert.de/api/dealer?country=DK), som gav 19 danske forhandlere. 8 var nye og kunne tjekkes på deres egen hjemmeside. Ingen af dem står på DCU's liste over testcentre.

| Forhandler | Region | Bemærkning |
|---|---|---|
| Brønderslev Caravan & Trailer Center | Nordjylland | Mange mærker, også italienske autocampere (Elnagh, Giottiline). Brugte vogne og opbevaring er ikke bekræftet. |
| Hjørring Camping & Fritid | Nordjylland | Siden er uenig med sig selv om søndag (lukket / 13–16) og værkstedets start (7.00 / 7.30). Åbningstidssiden er brugt. |
| Kai's Caravan | Syddanmark | Lukket om tirsdagen. |
| Juels Auto & Camp | Syddanmark | Både autoværksted og campingværksted. Eneste e-mail er en medarbejders. |
| NH Camping | Syddanmark | Værkstedets tider står både som man.–fre. og man.–tors. |
| Camping-Specialisten.dk | Midtjylland | **Butikken i Aarhus (Viby J) er lukket** ifølge deres egen historieside, selv om den stadig står hos Knaus Tabbert. Kun Silkeborg er med. Adressen staves "Funder Dalgårdsvej" på deres side og "Funder Dalsgårdsvej" hos Knaus Tabbert; deres egen stavning er brugt. |
| Toftlund Caravan | Syddanmark | Mest et serviceværksted. Nye mærker kunne ikke bekræftes. |
| Vonsild Camping | Syddanmark | Siden 1964. Nye autocampermærker kunne ikke bekræftes. |

**Samlet for alle 29: 331 af 493 felter (67 %).** Andelen er faldet lidt, fordi de nye forhandleres sider oplyser færre ting, fx CVR og medlemskab.

Knaus Tabberts liste viser i øvrigt den samme standardtid for alle forhandlere, så den er kun brugt til at finde navne og adresser.

## Kandidater til næste runde

Fundet undervejs, men ikke tjekket eller tilføjet endnu:

- **Silkeborg Caravan Center**, Priorsvej 11, 8600 Silkeborg (står på DCU's liste). Hjemmesiden har et ugyldigt sikkerhedscertifikat og kunne ikke læses.
- **Vendelbo Vans**, Tårs, og **Jels Autoværksted**, Rødding (DCU's liste, men kun autocampere).
- **Intercamp** (Vejen og Lunderskov) står hos Knaus Tabbert, men hjemmesiden indlæses kun med script og kunne ikke læses.
- **Antoncamp**, Videbæk, står hos Knaus Tabbert, men hjemmesiden svarer ikke.
- Klarup Caravan og Steens MC-Center (Esbjerg) er set i søgeresultater, men kunne ikke bekræftes.
- **Hovedstaden** har stadig kun Bijé. Heller ikke Knaus Tabberts liste har nogen forhandler i Hovedstaden. JP Caravan i Hedehusene er nævnt som lukket i en ældre oversigt. Næste skridt er Hobbys, Adrias og Kabes forhandlersøgninger, som ikke kunne læses automatisk i denne runde, og Krak/De Gule Sider, der blokerer robotter.

Når nye mærker tilføjes i `maerker.json`, melder kildetjekket én gang, at mærket er "nyt" på sider, der allerede nævnte det (fx Tabbert hos Østsjællands Camping Center). Det er ikke en ændring hos forhandleren.
