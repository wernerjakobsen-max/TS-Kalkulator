# TS-Kalkulator – teknisk gjennomgang og separat prototype

Gjennomgått 13. november 2026. Referanse: `main` på commit
`00ed244ec328fcaf0ea42669b6416a2e2c42382b` (versjon 4.2.1 i `index.html`).
Alle foreslåtte filer ligger i `prototype/`. Ingen eksisterende produksjonsfiler,
publiseringsinnstillinger eller service workere er endret. Prototypen registrerer
ingen service worker, bruker ingen eksterne ressurser og er merket `noindex`.

## Konklusjon

Behold dagens kalibrerte kurve som produksjonsreferanse. Den er numerisk velfungerende,
men praktisk målenøyaktighet er ikke dokumentert. Prioriter PWA-oppdateringer,
validering i fallkalkulatoren og tydelig måleveiledning før en ny beregningsmetode.
En modell med stive ledd og hjørneforskyvning forklarer kontrollpunktene godt,
og er et konkret grunnlag for både videre måling og en matematisk konsistent animasjon.

## Beregning og kontrollpunkter

Den aktive koden er det siste inline-skriptet i `index.html`, ikke `app.js`.
`index.html:280–281` har 17 punkter fra 420 mm / 8° til 800 mm / 180°.
90° ligger på **677,5 mm**, 107,5° på **718 mm**, 158° på **791 mm**.
767 mm / 135° er ikke et kontrollpunkt i denne versjonen; tidligere forslag må
ikke brukes som fasit for gjeldende kode.

Metoden (`index.html:600–640`) er monoton kubisk Hermite-interpolasjon med vektet
harmonisk middel for indre helninger og en ekstra helningsbegrensning. Endepunktene
bruker nabosekantens helning. Den er PCHIP-lignende, men endepunktregelen er ikke
identisk med den vanlige trepunktsregelen i standard PCHIP-implementasjoner.
Et blindt bibliotekbytte kan derfor endre resultatene mellom kontrollpunktene.

Kontroll med faktisk produksjonsskript kjørt i Node VM:

| Kontroll | Resultat |
| --- | --- |
| Alle 17 kontrollpunkter | Gjengis innen 1e-10 grader |
| 420–800 mm i trinn på 0,01 mm | 38 001 verdier, monotont, uten oversving |
| Prototype mot produksjonsskript | Største avvik 5,68e-14 grader |
| Største numeriske lokale helning | Ca. 3,9244°/mm |
| 677,5 ± 1 mm | Ca. 89,6–90,4° |
| 799–800 mm | Ca. 176,3–180,0° |

Dette dokumenterer numerisk oppførsel, ikke fysisk presisjon. Kontrollpunktene er
selve interpolasjonsgrunnlaget og kan ikke fungere som uavhengige valideringsdata.
Repoet dokumenterer ikke måleinstrumentets nøyaktighet, gjentakelser, spredning,
hingeslitasje, temperatur eller nøyaktige kontakt- og hengselkoordinater.

## Geometrisk hypotese og animasjon

En ideell modell uten leddbredde gir `D = 400 + 400 sin(θ/2)`. Mot de 17 punktene
gir den 6,00 mm RMS-avvik. Det er derfor utilstrekkelig å bruke en vanlig trekant
med to 200 mm sider uten å modellere hvor avlesningen faktisk skjer.

Prototypen bruker følgende eksplisitte antakelser:

- A er hengselet ved 400 mm og referanselinjens nullpunkt i tegningen.
- B er hengselet ved 200 mm. AB = 200 mm.
- E er senteret av nullenden. BE = 200 mm.
- C er nullhjørnet, forskjøvet 7,5 mm normalt fra BE, og ligger på referanselinjen.
- θ er den indre vinkelen ABE. D = 400 + AC.

Med L = 200 mm og h = 7,5 mm følger:

`D(θ) = 400 + sqrt(2L²(1 − cos θ) + h² − 2Lh sin θ)`

Modellen beregner koordinatene fra stive ledd og kontaktbetingelsen, ikke ved å
strekke leddene eller flytte nullhjørnet for å treffe en ønsket avlesning.
Testene kontrollerer begge lengder, kontaktens normalavstand, kontakt på linjen,
vinkel ved B og invers beregning over 8–180° i 0,1° trinn.

| Sammenligning mot eksisterende punkter | Resultat |
| --- | --- |
| RMS-avvik i avlesning | 0,486 mm |
| Største absolutt avvik | 1,103 mm ved 485 mm / 27° |
| Modell ved 60° | 593,541 mm mot kontrollpunkt 594 mm |
| Modell ved 90° | 677,590 mm mot kontrollpunkt 677,5 mm |
| Modell ved 180° | 800,070 mm mot kontrollpunkt 800 mm |

Ingen parametere er tilpasset med regresjon; L og h er valgt fra oppgitt nominell
lengde og bredde. Den gode overensstemmelsen er lovende, men beviser ikke at
fotografiets hengsel- og kantgeometri er identisk med modellen. Fotoet viser også
overheng og lagdeling som modellen ikke beskriver. Ved 8° er modellens avlesning
420,428 mm; den inverse modellen dekker dermed ikke hele dagens domene fra 420 mm.
Endepunktet ved 180° er heller ikke nøyaktig 800 mm. Ikke tving endepunktene til
å passe eller markedsfør modellen som ferdig kalibrering.

Animasjonen styres av dagens beregnede vinkel og viser separat hvilken avlesning
geometrien forventer. Avviket vises i tekst og tabell. Vinkelbuen ligger ved B.
Illustrasjonen er geometrisk konsistent innenfor antakelsene, men er en modellskisse
og ingen ferdig mekanisk G59-tvilling. Fotografi bør beholdes i en produksjonsguide.

Neste måleserie: merk eksakt hjørne, avlesningskant og indre vinkel i et nærfoto;
mål bredde, akseavstand og overheng. Bruk minst tre tommestokker og fem gjentakelser
ved 10°, 20°, 30°, 45°, 60°, 75°, 90°, 105°, 120°, 135°, 150°, 160°, 170°, 175° og 180°.
Registrer råverdier, referanseinstrument, innstillingsretning og spredning. Sett av
hele vinkler og ett instrument som holdt-utenfor-validering før eventuell tilpasning.
Sammenlign dagens kurve, ren geometri og en eventuell monotont begrenset hybrid på
de samme uavhengige dataene. Dokumenter både avvik i mm og grader, særlig nær 180°.

## Konkrete funn og prioritering

| Prioritet | Sted | Funn, konsekvens og anbefalt tiltak |
| --- | --- | --- |
| Høy | `sw.js:1` | Cache-navnet er v3-9-7d mens appen er 4.2.1. Cache-first på alle forespørsler og uendret worker kan holde brukere på gammel HTML. Bruk versjonert app-cache og en eksplisitt oppdateringsflyt, med kontrollert nettverksstrategi for navigasjon. |
| Høy | `index.html:901–910` | «Hard refresh» sletter alle cacher og avregistrerer alle service workere på samme origin. GitHub Pages-prosjekter under samme brukernavn deler origin. Begrens rydding til appens cache-prefiks og eksakte registreringsscope. |
| Høy | `index.html:846–848` | Grader valideres ikke før tangens. 200° behandles som 20°, 90° gir et enormt endelig tall, og negative/ugyldige verdier kan la gamle resultater stå. Definer domene, eksempelvis 0 ≤ θ < 90°, og vis feil i alle avhengige felt. |
| Høy | `index.html:831–877` | Prosent/grader/forhold oppdateres, men høyde/lengde blir stående når man endrer andre felt. Avklar beregningsretning og hvilken lengde som holdes fast; ikke presenter motstridende tall uten forklaring. |
| Middels | `index.html:850–856` | Forholdet `2:50` tolkes som `1:50` fordi telleren ignoreres. Støtt bare ren X eller eksplisitt `1:X`, eller beregn begge sider korrekt. |
| Middels | `index.html:752,820` | `parseFloat` aksepterer prefiks som `677abc` og `677,5,2`. Bruk validering av hele inndata og en konsistent parser for alle felt. Prototypen avviser disse strengene. |
| Middels | `index.html:224–241` | «Lengde» angir ikke uttrykkelig horisontal utstrekning. Formelen er h / horisontal lengde, ikke h / skrå lengde. Endre ordlyd og tegn en rettvinklet trekant i fallguiden. |
| Middels | `sw.js`, bilde | Fotoet på ca. 1,04 MB er ikke i precache; nettverksfunn lagres heller ikke. Hjelpebildet og QR er derfor utilgjengelige offline selv etter vanlig nettbruk. Komprimer og precache guidebildet; generer QR lokalt eller forklar nettkravet. |
| Middels | `app.js`, `units.js` | Eldre, ulastede filer beskriver en annen kurve og område 400–800 mm. `app.js` har doble `const themeKey`/`themeColorTag` og parser ikke. Ikke koble disse inn i ny HTML; arkiver eller fjern dem i en egen opprydding etter referansetest. |
| Middels | `manifest.webmanifest` | `id` har versjonsnavn v3-9-7d, ikonsettet er bare SVG. Bevar eksisterende app-identitet ved migrering, test oppgraderingsinstallasjon og legg til PNG 192/512, maskable og Apple-ikon etter plattformtesting. |
| Middels | Språk / `applyLang` | Ti språk finnes, men `html lang` forblir `no`, arabisk får ikke `dir=rtl`, og interne koden `dk` må mappes til språkstandarden `da`. Bruk `nb`, `da`, `sr-Latn`, `uk`, `ar` der relevant. Flere knapper, verktøyvalg og modaltekster er norsk; åtte språk har engelsk juridisk fallback. Fullfør UI-ordbok og faglig språkvask. |
| Middels | Tilgjengelighet | Ingen `h1`/`main`, D-label mangler `for`, flere select/ikonknapper og høyde/lengdefelt mangler tydelige navn. Resultatet mangler live-status; modalene mangler fokusflyt og Escape. Legg til semantikk, feilkobling, tastaturtest og målt kontrast i begge temaer. |
| Lav | UI | Hovedoppgaven konkurrerer med QR, installasjon, tema, presisjon og «Hard refresh». Samle sekundærhandlinger, bruk nummererte måletrinn og fold ut guide. La profesjonelle brukere velge desimaler, med forklaring av måleusikkerhet. |
| Lav | Tema | Theme-color ved «auto» følger ikke systemets mørke tema etter veksling. Beregn effektivt tema og lytt til medieendringer. |

Anbefalt PWA-løsning: cache bare same-origin GET under appens path, bruk navngitt
app-cache direkte i stedet for global `caches.match`, precache nødvendige ressurser,
og slett bare eldre cacher med eget prefiks ved aktivering. Vis «Ny versjon klar»
før kontrollert aktivering/omlasting. Test første installasjon, offline etter ny
start, oppgradering fra en bufret eldre versjon, flere faner, nettfeil og at andre
GitHub Pages-prosjekter på samme origin forblir uberørt. Ikke endre app-ID som en
vilkårlig versjonsoppdatering.

## SEO og større rekkevidde

Det finnes beskrivende norsk title/meta-description, robots.txt og sitemap med
hovedside og QR-side. Men `applyLang` erstatter sidetittelen med bare appnavnet.
Det mangler canonical-link, hreflang, Open Graph og egne indekserbare språk-URL-er.
JavaScript-konstanten `CANONICAL` er en delingsadresse med versjonsparameter,
ikke en HTML canonical-annotasjon. Språkvalget lagres bare i localStorage.
En `robots.txt` i prosjektmappen styrer ikke origin-roten `/robots.txt`.

Før bred lansering: bygg statiske sider med unike oversatte titler, beskrivelse og
full måleveiledning, først norsk og engelsk, deretter kvalitetssikrede språk etter
etterspørsel. Bruk selvrefererende canonical, gjensidige hreflang-koblinger og
stabile URL-er uten versjonsparametere. Legg disse i sitemap; QR-verktøyet trenger
ikke prioriteres i søk. Legg til delingsbilde og tydelig H1. Vurder strukturert
WebApplication-data bare med faktiske, synlige opplysninger; ikke lov rich results.
Sett GitHub-repoets Website-felt til den publiserte adressen.

Publisering krever ikke ny plattform: GitHub Pages er et mulig videre utgangspunkt.
Bekreft deployment-kilden før endringer; den ble ikke endret eller separat verifisert
i denne gjennomgangen. Bruk gren/PR og en isolert preview-origin for tester av PWA;
ikke test ny worker under produksjonens scope. Etter teknisk godkjenning: kort
målevideo, QR med stabil lenke, faglig introduksjon til relevante håndverksmiljøer
og Search Console for faktisk indeksering/søkeord. Ingen kontoer eller innlegg er opprettet.

Primærkilder for anbefalingene:

- [MDN: Using Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers)
- [MDN: PWA caching](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching)
- [Google: Localized versions](https://developers.google.com/search/docs/specialty/international/localized-versions)

## Kjøring, test og begrensninger

Åpne `prototype/` via en lokal statisk HTTP-server med JavaScript-moduler som
`text/javascript`. Direkte `file://` kan blokkere modulene. Kjør fra repo-roten:

```text
node prototype/check.mjs
node prototype/serve.mjs
```

Den andre kommandoen starter en isolert lokal forhåndsvisning på
`http://127.0.0.1:4174/`; stopp med Ctrl+C. Ingen pakker eller byggetrinn kreves.
Testprogrammet skriver alle avvik og
samlet statistikk til stdout og avslutter med feil hvis invariantene brytes.
I tillegg ble prototypen kontrollert i nettleser ved 1280 og 390 px bredde,
med komma/punktum, ugyldig tekst, 800 mm, animasjonsstart og stopp ved inntasting.
390 px-visningen hadde ingen horisontal side-overflyt. SVG-en og tabellen ble
visuelt kontrollert; brukerens opprinnelige foto ble inspisert som referanse.
Redusert bevegelse håndteres i koden, men OS-innstillingen ble ikke aktivt testet.

Dette er kildekodeanalyse og en avgrenset prototype, ikke en full ombygging av appen.
Fysisk validering, installasjon på iOS/Android, faktiske PWA-oppgraderinger,
skjermlesertest og måling av søketrafikk gjenstår. Publisert side lot seg ikke hente
via nettlesetjenesten; nettlesertesten gjaldt den lokale prototypen. Ingen eksisterende
nettlesercacher ble slettet. Ingen merge eller produksjonsdeploy ble utført.
