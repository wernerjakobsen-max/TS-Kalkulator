# TS-Kalkulator

Statisk PWA for tommestokk-vinkel (a-la Hultafors 2 m, 20 cm-ledd).
Kalibrert mot målepunktene deres. Cyan profilfarge.

## Hurtigoppsett på GitHub Pages
1. Opprett repo (f.eks. `TS-Kalkulator`) på GitHub.
2. Last opp **alle filene i denne mappen** til repo-roten (`index.html` må ligge i rot).
3. Gå til **Settings → Pages**:
   - Source: **Deploy from a branch**
   - Branch: **main** og folder: **/** (root)
4. Vent et lite øyeblikk, åpne: `https://<brukernavn>.github.io/<repo>/`
5. På mobil: **Legg til på Hjem-skjerm** for app-opplevelse (offline).

## Oppdateringer
- Når du endrer filer, committer du til `main`. GitHub Pages bygger automatisk på nytt.
- PWA cache styres i `sw.js` (endrer du noe stort, bump `CACHE`-navnet).

## QR-kode
- Åpne `qr.html` lokalt, lim inn den publiserte URL-en, og last ned PNG.
