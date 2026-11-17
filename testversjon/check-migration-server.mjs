// Lokal test av gammel app -> kandidat under samme URL og worker-scope.
// Sett migration-phase.txt til new for kandidaten, offline for nettfeil.
import http from 'node:http';
import fs from 'node:fs/promises';
const names=new Set(['index.html','sw.js','manifest.webmanifest','icon.svg','app.js','units.js','version.json','icon-192.png','icon-512.png','guide-photo.jpg','tsfolded-v2.jpg']);
http.createServer(async(req,res)=>{
  try{
    const phase=(await fs.readFile(new URL('./migration-phase.txt',import.meta.url),'utf8')).trim();
    if(phase==='offline'){res.writeHead(503);res.end('Simulert nettfeil');return;}
    const path=new URL(req.url,'http://localhost').pathname;
    const file=path==='/TS-Kalkulator/'?'index.html':path.startsWith('/TS-Kalkulator/')?path.slice('/TS-Kalkulator/'.length):'';
    if(!names.has(file)){res.writeHead(404);res.end();return;}
    const base=phase==='new'?'../lansering/':'../source/';
    const body=await fs.readFile(new URL(base+file,import.meta.url));
    const type=file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.js')?'text/javascript':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.png')?'image/png':file.endsWith('.jpg')?'image/jpeg':file.endsWith('.json')?'application/json':'application/manifest+json';
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body);
  }catch{res.writeHead(500);res.end('Testoppsett mangler');}
}).listen(4177,'127.0.0.1',()=>console.log('Migration: http://127.0.0.1:4177/TS-Kalkulator/'));
