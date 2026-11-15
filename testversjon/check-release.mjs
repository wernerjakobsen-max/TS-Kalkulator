import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {VERSION} from './release.mjs';
import {angle} from './model.mjs';
const read=p=>fs.readFile(new URL(p,import.meta.url),'utf8');
const measurements=JSON.parse(await read('measurements.json'));
let worst=0;
for(const [mm,measured] of measurements.checks){
  const error=angle(mm)-measured;
  assert.ok(Math.abs(error)<=0.5,`Kontrollavvik ved ${mm}: ${error}`);
  worst=Math.max(worst,Math.abs(error));
}
assert.equal(angle(798),measurements.provisionalEndpoint.degrees);
const testHtml=await read('dist/index.html'),publicHtml=await read('../lansering/index.html');
assert.ok(testHtml.includes('noindex,nofollow'));
assert.ok(!publicHtml.includes('noindex,nofollow'));
assert.ok(publicHtml.includes('https://wernerjakobsen-max.github.io/TS-Kalkulator/'));
for(const dir of ['dist/','../lansering/']){
  const html=await read(dir+'index.html'),sw=await read(dir+'sw.js');
  assert.ok(html.includes(VERSION)&&sw.includes(VERSION));
  assert.equal(JSON.parse(await read(dir+'version.json')).version,VERSION);
  const manifest=JSON.parse(await read(dir+'manifest.webmanifest'));
  const origin='https://wernerjakobsen-max.github.io/TS-Kalkulator/';
  assert.equal(new URL(manifest.id,origin).href,origin+'min-v3-9-7d','Behold installert appidentitet');
  assert.equal(new URL(manifest.scope,origin).href,origin);
  for(const icon of manifest.icons)assert.ok((await read(dir+icon.src)).length>0);
  for(const script of html.matchAll(/<script type="module">([\s\S]*?)<\/script>/g)){
    const result=spawnSync(process.execPath,['--input-type=module','--check'],{input:script[1],encoding:'utf8'});
    assert.equal(result.status,0,result.stderr);
  }
  assert.ok(!html.includes('__VERSION__'));
}
console.log(`OK: ${VERSION}, komplette pakker, PWA-identitet, JavaScript og seks fysiske kontrollpunkter. Største kontrollavvik ${worst.toFixed(3)}° (ikke garanti utenfor kontrollpunktene).`);
