// Local preview only. No production service worker is registered by the prototype.
import http from 'node:http';
import fs from 'node:fs/promises';
const files=new Map([
  ['/',['index.html','text/html; charset=utf-8']],
  ['/index.html',['index.html','text/html; charset=utf-8']],
  ['/demo.mjs',['demo.mjs','text/javascript']],
  ['/model.mjs',['model.mjs','text/javascript']]
]);
http.createServer(async(req,res)=>{
  const entry=files.get(new URL(req.url,'http://localhost').pathname);
  if(req.method!=='GET'||!entry){res.writeHead(404);res.end('Not found');return;}
  try{const body=await fs.readFile(new URL(entry[0],import.meta.url));res.writeHead(200,{'Content-Type':entry[1],'Cache-Control':'no-store'});res.end(body);}
  catch{res.writeHead(500);res.end('Unable to read preview file');}
}).listen(4174,'127.0.0.1',()=>console.log('TS prototype: http://127.0.0.1:4174/ (Ctrl+C to stop)'));
