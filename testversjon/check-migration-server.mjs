// Lokal test av gammel app -> kandidat under samme URL og worker-scope.
// Sett migration-phase.txt til new for kandidaten, offline for nettfeil.
import http from 'node:http';
import fs from 'node:fs/promises';
const names=new Set(['index.html','sw.js','manifest.webmanifest','icon.svg','app.js','units.js','version.json']);
http.createServer(async(req,res)=>{
  try{
    const phase=(await fs.readFile(new URL('./migration-phase.txt',import.meta.url),'utf8')).trim();
    if(phase==='offline'){res.writeHead(503);res.end('Simulert nettfeil');return;}
    const path=new URL(req.url,'http://localhost').pathname;
    const file=path==='/TS-Kalkulator/'?'index.html':path.startsWith('/TS-Kalkulator/')?path.slice('/TS-Kalkulator/'.length):'';
    if(!names.has(file)){res.writeHead(404);res.end();return;}
    const base=phase==='new'?'../lansering/':'../source/';
    const body=await fs.readFile(new URL(base+file,import.meta.url));
    const type=file.endsWith('.html')?'text/html':file.endsWith('.js')?'text/javascript':file.endsWith('.svg')?'image/svg+xml':'application/manifest+json';
    res.writeHead(200,{'Content-Type':type+'; charset=utf-8','Cache-Control':'no-store'});res.end(body);
  }catch{res.writeHead(500);res.end('Testoppsett mangler');}
}).listen(4175,'127.0.0.1',()=>console.log('Migration: http://127.0.0.1:4175/TS-Kalkulator/'));
