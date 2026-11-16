import fs from 'node:fs/promises';
import qrcode from './vendor/qrcode.mjs';
import {VERSION} from './release.mjs';
const read=f=>fs.readFile(new URL(f,import.meta.url),'utf8');
const [html,css,model,app]=await Promise.all(['index.html','style.css','model.mjs','app.mjs'].map(read));
const dictionaries={...JSON.parse(await read('translations.json')),...JSON.parse(await read('dynamic-translations.json'))};
const i18n=(await read('i18n.js')).replace('/*__TRANSLATIONS__*/{}',()=>JSON.stringify(dictionaries));
const localizedHtml=html.replace('<script src="i18n.js"></script>',()=>'<script>'+i18n+'</script>');
const standalone=localizedHtml.replace('<link rel="stylesheet" href="style.css">',`<style>${css}</style>`).replace('<script type="module" src="app.mjs"></script>',()=>`<script type="module">\n${model.replaceAll('export ','')}\n${app.replace(/^import[^\n]*\n/gm,'')}\n</script>`);
const stamp = text => text.replaceAll('__VERSION__', VERSION).replace('Testversjon · 15.11.2026', 'Testversjon · ' + VERSION);
const privateUrl='https://ts-kalkulator-werner-test.werner-jakob-6451.chatgpt.site/';
const actions=await read('actions.mjs');
function addActions(page,url,privatePreview){
 const qr=qrcode(0,'M');qr.addData(url);qr.make();
 const data='data:image/svg+xml;base64,'+Buffer.from(qr.createSvgTag({cellSize:6,margin:24,scalable:true})).toString('base64');
 const script=actions.replaceAll('__SHARE_URL__',url).replaceAll('__QR_IMAGE__',data).replaceAll('__PRIVATE_PREVIEW__',String(privatePreview));
 return page.replace('<script type="module" src="actions.mjs"></script>',()=>'<script type="module">'+script+'</script>');
}
await fs.writeFile(new URL('../TS-Testversjon.html',import.meta.url),addActions(stamp(standalone),privateUrl,true).replaceAll('guide-photo.jpg','testversjon/guide-photo.jpg'));
const updater = await read('update.mjs');
const manifest=await read('manifest.webmanifest'),icon=await read('icon.svg');
const license=await read('LICENCE.txt');
const controls = '<aside aria-label="Oppdateringer"><strong>Versjon ' + VERSION + '</strong><p id="update-status" role="status">Ser etter oppdateringer …</p><button id="apply-update" hidden>Oppdater nå</button> <button id="check-update" class="quiet">Se etter oppdatering</button></aside>';
const hostedBase = stamp(standalone).replace('</head>','<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icon.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="icon-192.png"></head>').replace('</main>',controls+'</main>').replace('</body>',()=>`<script type="module">${stamp(updater)}</script></body>`);
const hosted=addActions(hostedBase,privateUrl,true);
await fs.mkdir(new URL('./dist/',import.meta.url),{recursive:true});
await fs.writeFile(new URL('./dist/index.html',import.meta.url),hosted);
await fs.writeFile(new URL('./dist/sw.js',import.meta.url),stamp(await read('sw.js')));
await fs.writeFile(new URL('./dist/version.json',import.meta.url),JSON.stringify({version:VERSION}));
await fs.writeFile(new URL('./dist/manifest.webmanifest',import.meta.url),manifest);
await fs.writeFile(new URL('./dist/icon.svg',import.meta.url),icon);
await fs.writeFile(new URL('./dist/LICENCE.txt',import.meta.url),license);
// Publiseringspakken er separat. Dette endrer ikke rotfilene som main publiserer.
const publicUrl='https://wernerjakobsen-max.github.io/TS-Kalkulator/';
const candidate=addActions(hostedBase,publicUrl,false).replace('<meta name="robots" content="noindex,nofollow">','<meta name="description" content="Beregn vinkel med tommestokk, fall, stigning, grader, prosent og fallforhold. Måleveiledning og animerte illustrasjoner."><link rel="canonical" href="'+publicUrl+'">');
await fs.mkdir(new URL('../lansering/',import.meta.url),{recursive:true});
for(const [name,body] of Object.entries({'index.html':candidate,'sw.js':stamp(await read('sw.js')),'version.json':JSON.stringify({version:VERSION}),'manifest.webmanifest':manifest,'icon.svg':icon,'robots.txt':'User-agent: *\nAllow: /\nSitemap: '+publicUrl+'sitemap.xml\n','sitemap.xml':'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>'+publicUrl+'</loc></url></urlset>'}))await fs.writeFile(new URL('../lansering/'+name,import.meta.url),body);
await fs.writeFile(new URL('../lansering/LICENCE.txt',import.meta.url),license);
console.log('Laget TS-Testversjon.html – åpnes direkte uten server eller nett.');

for(const directory of ['./dist/','../lansering/']){
 for(const size of [192,512])await fs.copyFile(new URL('icon-'+size+'.png',import.meta.url),new URL(directory+'icon-'+size+'.png',import.meta.url));
 await fs.copyFile(new URL('vendor/NOTICE.txt',import.meta.url),new URL(directory+'QR-LICENCE.txt',import.meta.url));
}

for(const directory of ['./dist/','../lansering/'])await fs.copyFile(new URL('guide-photo.jpg',import.meta.url),new URL(directory+'guide-photo.jpg',import.meta.url));
