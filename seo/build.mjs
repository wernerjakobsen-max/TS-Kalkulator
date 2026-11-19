import fs from 'node:fs/promises';
import {statisticsHtml} from '../testversjon/statistics-content.mjs';
import {PUBLIC_VERSION} from '../testversjon/release.mjs';
const analytics=(await fs.readFile(new URL('../testversjon/analytics.mjs',import.meta.url),'utf8')).replaceAll('__VERSION__',PUBLIC_VERSION);
const base='https://wernerjakobsen-max.github.io/TS-Kalkulator/';
const pages=[
 {slug:'vinkel-med-tommestokk',title:'Måle vinkel med tommestokk – veiledning og kalkulator',description:'Slik måler du en veiledende vinkel med tommestokk: still inn 200 mm-leddet og før nullhjørnet til øvre kant. Se animasjonen i TS-Kalkulator.',body:`
<p class="eyebrow">TOMMESTOKK · VINKELMÅLING</p><h1>Mål vinkel med tommestokk</h1>
<p class="lead">Les av millimeter på tommestokken og finn vinkelen i leddet ved 200 mm. TS-Kalkulator viser resultatet og forklarer oppsettet med en animasjon.</p>
<a class="button" href="../">Åpne tommestokk-kalkulatoren</a>
<h2>Slik måler du</h2><ol><li>Brett ut tre–fire ledd. Ved avlesning over 600 mm trenger du fire.</li><li>Bøy leddet ved 200 mm (20 cm) fra nullenden til vinkelen du vil måle.</li><li>Behold denne vinkelen mens du bøyer leddet ved 400 mm (40 cm).</li><li>La hjørnet ved nullpunktet treffe den <strong>øvre kanten</strong> av den rette delen av tommestokken.</li><li>Les av ved kontaktpunktet og skriv millimeterverdien i kalkulatoren.</li></ol>
<h2>Et eksempel</h2><p>En avlesning på <strong>486 mm gir 27,0°</strong> i TS-Kalkulator. Vinkelen gjelder det innvendige hjørnet i 200 mm-leddet.</p>
<h2>Hvilken tommestokk gjelder dette for?</h2><p>Målegrunnlaget gjelder 200 mm lange ledd med <strong>15 mm bredde</strong>. Avlesningsområdet er 420–798 mm, tilsvarende omtrent 8–170,3°. Andre leddbredder eller kontaktpunkter kan gi andre resultater.</p>
<h2>Hvor nøyaktig er metoden?</h2><p>Forventet praktisk nøyaktighet er ca. <strong>±0,5°</strong>, med forbehold om oppsett, avlesning og tommestokk. Dette er veiledende vinkelmåling. Endepunktet 798 mm = 170,3° er foreløpig. Se kontrollgrunnlaget i appen; bruk egnet vinkelmåler når arbeidet krever større presisjon.</p>
<h2>Bruk på mobilen</h2><p>Kalkulatoren har seks språk og kan legges til på startskjermen. Etter første innlasting kan selve kalkulatoren brukes uten nett.</p>`},
 {slug:'fallkalkulator',title:'Fallkalkulator – grader, prosent og fallforhold | TS-Kalkulator',description:'Beregn fall og stigning i grader, prosent og forhold. Finn høydeforskjell og lengde, og se sammenhengen i en animasjon.',body:`
<p class="eyebrow">FALL · STIGNING · HELNING</p><h1>Fallkalkulator: grader, prosent og forhold</h1>
<p class="lead">Regn om en helning mellom grader, prosent og fallforhold. Kjenner du lengden eller høydeforskjellen, kan du også finne de andre målene.</p>
<a class="button" href="../">Åpne TS-Kalkulator</a><p>Velg «Fall og stigning» i kalkulatoren.</p>
<h2>Hva betyr 1:50 fall?</h2><p>Fallforholdet 1:50 betyr én enhet høydeforskjell per 50 enheter <strong>horisontal lengde</strong>. Det tilsvarer 2 % eller 20 mm per meter. Over 3 meter blir høydeforskjellen 60 mm.</p>
<h2>Grader og prosent er ulike mål</h2><p>2 % fall tilsvarer omtrent 1,146°. Én grad tilsvarer omtrent 1,746 %. Kalkulatoren viser grader, prosent og forhold uten at du trenger å oppgi lengde.</p>
<table><caption>Vanlige omregninger</caption><thead><tr><th>Forhold</th><th>Prosent</th><th>mm per meter</th><th>Grader, ca.</th></tr></thead><tbody><tr><td>1:100</td><td>1 %</td><td>10</td><td>0,573°</td></tr><tr><td>1:50</td><td>2 %</td><td>20</td><td>1,146°</td></tr><tr><td>1:40</td><td>2,5 %</td><td>25</td><td>1,432°</td></tr></tbody></table>
<h2>Fra vinkel og høyde til lengde</h2><p>Velg «Grader og høydeforskjell». Med 35° og 3,2 m høydeforskjell blir horisontal lengde omtrent 4,570 m, og lengden langs skråningen omtrent 5,579 m. Kalkulatoren beregner geometrien; den dimensjonerer ikke trinn i en trapp.</p>
<h2>Slik regnes det</h2><p>Fallprosent = 100 × høydeforskjell / horisontal lengde. Fra grader brukes 100 × tan(vinkel). Lengde langs skråningen er et annet mål enn horisontal lengde.</p>
<h2>Velg fall fra prosjektets grunnlag</h2><p>Kalkulatoren regner om målene du oppgir. Den velger ikke hvilket fall et tak, et rør, et gulv eller en annen konstruksjon skal ha.</p>`}
];
const css=`:root{font-family:system-ui,sans-serif;color:#16343d;background:#f6f9f8;line-height:1.65}body{margin:0}main{max-width:780px;margin:auto;padding:28px 24px 60px}nav,footer{padding:18px 0;border-bottom:1px solid #cbdad7}a{color:#086750}h1{font-size:clamp(2rem,6vw,3rem);line-height:1.15}h2{margin-top:2rem;line-height:1.25}.lead{font-size:1.2rem}.eyebrow{font-weight:700;letter-spacing:.08em;font-size:.8rem;margin-top:36px}.button{display:inline-block;background:#176c58;color:white;padding:12px 20px;border-radius:8px;font-weight:700;text-decoration:none}li{padding-left:5px;margin-bottom:12px}table{width:100%;border-collapse:collapse;font-size:.9rem}caption{text-align:left;font-weight:700;margin:20px 0 8px}th,td{text-align:left;border-bottom:1px solid #cbdad7;padding:10px 5px}footer{margin-top:40px;font-size:.9rem}a:focus-visible{outline:3px solid #d19827;outline-offset:3px}`;
const root=new URL('./dist/',import.meta.url);
for(const p of pages){
 const dir=new URL(p.slug+'/',root);await fs.mkdir(dir,{recursive:true});
 await fs.writeFile(new URL('index.html',dir),`<!doctype html><html lang="nb"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${p.title}</title><meta name="description" content="${p.description}"><link rel="canonical" href="${base+p.slug}/"><meta property="og:title" content="${p.title}"><meta property="og:description" content="${p.description}"><meta property="og:type" content="website"><meta property="og:url" content="${base+p.slug}/"><style>${css}</style></head><body><main><nav aria-label="Hovedmeny"><a href="../">TS-Kalkulator</a> · <a href="../vinkel-med-tommestokk/">Vinkel med tommestokk</a> · <a href="../fallkalkulator/">Fallkalkulator</a></nav>${p.body}<footer>TS-Kalkulator av Werner Jakobsen · <a href="../">Åpne kalkulatoren</a></footer>${statisticsHtml}</main><script type="module">${analytics}</script></body></html>`);
}
await fs.writeFile(new URL('sitemap.xml',root),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['',...pages.map(p=>p.slug+'/')].map(path=>`<url><loc>${base+path}</loc></url>`).join('')}</urlset>`);
console.log('Klargjort to norske inngangssider og nettstedskart i seo/dist/. Kalkulator og publisert side er uendret.');
