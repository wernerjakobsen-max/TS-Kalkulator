import http from 'node:http';
import fs from 'node:fs/promises';
const html=await fs.readFile(new URL('../TS-Testversjon.html',import.meta.url));
http.createServer((req,res)=>{
  if(req.url!=='/'){res.writeHead(404);res.end();return;}
  res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);
}).listen(4174,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4174/'));
