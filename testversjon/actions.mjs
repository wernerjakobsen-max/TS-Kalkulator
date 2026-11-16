const shareUrl='__SHARE_URL__';
const privatePreview='__PRIVATE_PREVIEW__'==='true';
const install=document.getElementById('install-app');
let installPrompt;
function installed(){install.textContent='Åpnet som app';install.disabled=true;}
if(matchMedia('(display-mode: standalone)').matches||navigator.standalone===true)installed();
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installPrompt=event;});
window.addEventListener('appinstalled',()=>{installPrompt=null;installed();});
install.addEventListener('click',async()=>{
  if(installPrompt){const prompt=installPrompt;installPrompt=null;try{await prompt.prompt();await prompt.userChoice;}catch{document.getElementById('install-dialog').showModal();}}
  else document.getElementById('install-dialog').showModal();
});
for(const button of document.querySelectorAll('[data-close-dialog]'))button.addEventListener('click',()=>button.closest('dialog').close());
for(const field of document.querySelectorAll('[data-share-url]'))field.value=shareUrl;
document.getElementById('open-browser-link').href=shareUrl;
document.getElementById('share-qr').src='__QR_IMAGE__';
document.getElementById('download-qr').href='__QR_IMAGE__';
document.getElementById('preview-sharing-note').hidden=!privatePreview;
document.getElementById('share-app').addEventListener('click',()=>document.getElementById('share-dialog').showModal());
document.getElementById('native-share').hidden=typeof navigator.share!=='function';
document.getElementById('native-share').addEventListener('click',async()=>{
  try{await navigator.share({title:'TS-Kalkulator',url:shareUrl});}
  catch(error){if(error.name!=='AbortError')document.getElementById('share-status').textContent='Bruk Kopier lenke eller marker adressen i feltet.';}
});
for(const button of document.querySelectorAll('[data-copy-link]'))button.addEventListener('click',async()=>{
  const status=button.parentElement.querySelector('[role="status"]');
  try{await navigator.clipboard.writeText(shareUrl);status.textContent='Lenken er kopiert.';}
  catch{status.textContent='Marker og kopier adressen i feltet.';}
});

document.getElementById('open-guide-photo').addEventListener('click',()=>document.getElementById('photo-dialog').showModal());
document.getElementById('rotate-guide-photo').addEventListener('click',event=>{
 const rotated=document.getElementById('photo-stage').classList.toggle('is-rotated');
 event.currentTarget.setAttribute('aria-pressed',String(rotated));
 event.currentTarget.textContent=rotated?'Tilbake til høydeformat':'Roter 90°';
});
