import fs from 'node:fs/promises';
const read=f=>fs.readFile(new URL(f,import.meta.url),'utf8');
const [html,css,model,app]=await Promise.all(['index.html','style.css','model.mjs','app.mjs'].map(read));
const standalone=html.replace('<link rel="stylesheet" href="style.css">',`<style>${css}</style>`).replace('<script type="module" src="app.mjs"></script>',()=>`<script type="module">\n${model.replaceAll('export ','')}\n${app.replace(/^import[^\n]*\n/,'')}\n</script>`);
await fs.writeFile(new URL('../TS-Testversjon.html',import.meta.url),standalone);
console.log('Laget TS-Testversjon.html – åpnes direkte uten server eller nett.');
