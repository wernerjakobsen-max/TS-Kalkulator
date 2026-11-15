import http from 'node:http';
import fs from 'node:fs/promises';
http.createServer(async (req,res)=>{
  const path=new URL(req.url,'http://localhost').pathname;
  const files={'/':['index.html','text/html; charset=utf-8'],'/index.html':['index.html','text/html; charset=utf-8'],'/sw.js':['sw.js','text/javascript'],'/version.json':['version.json','application/json']};
  if(!files[path]){res.writeHead(404);res.end();return;}
  try {
    const [file,type]=files[path];
    const data=await fs.readFile(new URL('./dist/'+file,import.meta.url));
    res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(503);res.end('Bygg testversjonen først.');}
}).listen(4174,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4174/'));
