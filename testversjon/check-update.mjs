import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
const code=await fs.readFile(new URL('./sw.js',import.meta.url),'utf8');
const handlers={},stores=new Map();
const cacheApi={
  async open(name){if(!stores.has(name))stores.set(name,new Map());const map=stores.get(name);return {put:async(k,v)=>map.set(k,v),match:async k=>map.get(k),addAll:async paths=>{if(fail)throw Error('offline');for(const p of paths)map.set(new URL(p,'https://example.test/TS/').href,{body:p});}};},
  async keys(){return [...stores.keys()];},async delete(k){return stores.delete(k);}
};
let skip=0,claims=0,fail=false;
const context=vm.createContext({URL,caches:cacheApi,
  fetch:async()=>{if(fail)throw Error('offline');return {ok:true,redirected:false,headers:{get:()=> 'text/html'},body:'complete app'};},
  self:{location:{href:'https://example.test/TS/sw.js'},addEventListener:(k,v)=>handlers[k]=v,skipWaiting:()=>skip++,clients:{claim:async()=>claims++}}
});
vm.runInContext(code.replaceAll('__VERSION__','test-new'),context);
async function lifecycle(name){let done;handlers[name]({waitUntil:p=>done=p});await done;}
stores.set('unrelated-app',new Map());stores.set('ts-kalkulator-app-old',new Map());
stores.set('ts-kalkulator-v3-9-7d',new Map());
await lifecycle('install');assert.equal(skip,0,'Install must not interrupt an open measurement');
await lifecycle('activate');assert.equal(claims,1);
assert.ok(stores.has('unrelated-app'));assert.ok(!stores.has('ts-kalkulator-app-old'));
assert.ok(!stores.has('ts-kalkulator-v3-9-7d'));
fail=true;
let response;
handlers.fetch({request:{url:'https://example.test/TS/',mode:'navigate',method:'GET'},respondWith:p=>response=p});
assert.equal((await response).body,'complete app','Installed app must open while offline');
handlers.fetch({request:{url:'https://example.test/TS/?v=4.2.1',mode:'navigate',method:'GET'},respondWith:p=>response=p});
assert.equal((await response).body,'complete app','Old installed start URL must open the new app');
handlers.fetch({request:{url:'https://example.test/TS/icon.svg',mode:'cors',method:'GET'},respondWith:p=>response=p});
assert.equal((await response).body,'./icon.svg');
for(const path of ['version.json','sw.js','other.html']){
  handlers.fetch({request:{url:'https://example.test/TS/'+path,mode:'navigate',method:'GET'},respondWith:()=>assert.fail('Must bypass app navigation cache')});
}
handlers.message({data:{type:'SKIP_WAITING'}});assert.equal(skip,1);
await assert.rejects(lifecycle('install'),/offline/);
console.log('OK: frivillig aktivering, offlineåpning, avgrenset cacheopprydding og mislykket nedlasting.');
