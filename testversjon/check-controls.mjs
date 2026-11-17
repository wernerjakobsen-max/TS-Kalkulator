import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await fs.readFile(new URL('./update.mjs',import.meta.url),'utf8');
for(const hasController of [false,true]){
  const elements=new Map();
  const get=id=>{
    if(!elements.has(id))elements.set(id,{hidden:id==='apply-update',textContent:'',addEventListener(){}});
    return elements.get(id);
  };
  const registration={waiting:{postMessage(){}},addEventListener(){},async update(){}};
  const context={
    document:{getElementById:get,addEventListener(){},querySelectorAll(){return []}},
    navigator:{serviceWorker:{controller:hasController?{}:null,addEventListener(){},async register(){return registration}}},
    location:{pathname:'/',reload(){}},window:{addEventListener(){}},
    sessionStorage:{getItem(){return null},removeItem(){}},setInterval(){},
    fetch:async()=>({ok:true,json:async()=>({version:'__VERSION__'})})
  };
  await vm.runInNewContext('(async()=>{'+source+'})()',context);
  assert.equal(get('apply-update').hidden,!hasController,'Only existing installations should offer a waiting update');
  assert.ok(get('update-status').textContent.includes(hasController?'En ny versjon':'Du bruker versjon'));
}
console.log('OK: førstegangsinstallasjon skilles fra ventende oppdatering.');
