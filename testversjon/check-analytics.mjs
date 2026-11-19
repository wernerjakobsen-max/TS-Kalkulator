import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {statisticsTranslations} from './statistics-content.mjs';
const source=(await fs.readFile(new URL('./analytics.mjs',import.meta.url),'utf8')).replaceAll('__VERSION__','5.0.1');
function setup(options={}) {
 const requests=[],scripts=[],handlers={},saved=new Map(Object.entries(options.saved??{}));
 const button={addEventListener(type,fn){this[type]=fn;},setAttribute(){}};
 const document={title:'TS-Kalkulator',referrer:'https://example.org/private?secret=123',getElementById:()=>button,createElement:()=>({dataset:{},remove(){}}),head:{append(s){scripts.push(s);}}};
 const navigator={onLine:!options.offline,doNotTrack:options.dnt,globalPrivacyControl:options.gpc};
 const context={URL,URLSearchParams,document,navigator,location:{origin:options.local?'http://localhost':'https://wernerjakobsen-max.github.io',pathname:options.guide?'/TS-Kalkulator/fallkalkulator/':'/TS-Kalkulator/',search:'?secret=123'},matchMedia:()=>({matches:!!options.standalone}),localStorage:{getItem:k=>{if(options.blocked)throw Error();return saved.get(k)??null;},setItem:(k,v)=>{if(options.blocked)throw Error();saved.set(k,v);}},window:{addEventListener:(type,fn)=>handlers[type]=fn}};
 vm.runInNewContext(source,context);
 function load() { Object.assign(context.window.goatcounter,{filter:()=>false,count:payload=>requests.push({...context.window.goatcounter,...payload})});scripts.at(-1).onload(); }
 return {scripts,requests,handlers,saved,button,navigator,load};
}
for(const options of [{dnt:'1'},{gpc:true},{local:true},{saved:{'ts-statistics-disabled':'1'}}]) assert.equal(setup(options).scripts.length,0);
const first=setup();first.load();
assert.equal(first.requests.filter(x=>!x.event).length,1);
assert.ok(!first.requests.some(x=>x.path.startsWith('app-update-')),'First visit must not claim an upgrade');
assert.equal(first.requests[0].referrer,'https://example.org','Drop referring paths and query values');
assert.equal(first.requests[0].path,'/TS-Kalkulator/');
assert.equal(first.saved.get('ts-statistics-version'),'5.0.1');
const update=setup({saved:{'ts-statistics-version':'5.0.0'},standalone:true});update.load();
assert.ok(update.requests.some(x=>x.path==='app-update-5.0.0-to-5.0.1'));
assert.ok(update.requests.some(x=>x.path==='app-standalone-5.0.1'));
update.handlers.appinstalled();assert.equal(update.requests.at(-1).path,'app-installed-5.0.1');
const count=update.requests.length;update.button.click();update.handlers.appinstalled();assert.equal(update.requests.length,count,'Opt-out must stop events');
const offline=setup({offline:true});assert.equal(offline.scripts.length,0);offline.navigator.onLine=true;offline.handlers.online();offline.load();assert.equal(offline.requests.filter(x=>!x.event).length,1);
const failed=setup();failed.scripts[0].onerror();assert.equal(failed.saved.size,0,'Failed script must not record a version');
const blocked=setup({blocked:true});blocked.load();blocked.button.click();const before=blocked.requests.length;blocked.handlers.appinstalled();assert.equal(blocked.requests.length,before,'Opt-out also works for the open page if storage is blocked');
const guide=setup({guide:true});guide.load();assert.equal(guide.requests.length,1);assert.equal(guide.saved.size,0);
for(const values of Object.values(statisticsTranslations))assert.ok(values.length===5&&values.every(v=>typeof v==='string'&&v.length));
const html=await fs.readFile(new URL('../lansering/index.html',import.meta.url),'utf8');
assert.ok(html.includes('const version = \'5.0.1\''));
assert.ok(!source.includes('querySelectorAll')&&!source.includes('getElementById(\'reading\')'),'Do not read calculator inputs');
assert.ok(!(await fs.readFile(new URL('dist/index.html',import.meta.url),'utf8')).includes('const endpoint = \'https://ts-kalkulator.goatcounter.com/count\''),'Private preview must not send statistics');
console.log('OK: analytics baseline/update, standalone/install events, opt-out, blocked storage, DNT/GPC, offline, script failure, guide pages and six languages.');
