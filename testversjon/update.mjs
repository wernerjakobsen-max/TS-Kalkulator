const tr=(key,...args)=>window.TSI18n?.t(key,...args)??key.replace(/\{(\d+)\}/g,(_,i)=>String(args[i]??''));
const write=(el,render)=>window.TSI18n?window.TSI18n.write(el,render):(el.textContent=render());
const currentVersion = '__VERSION__';
const updateStatus = document.getElementById('update-status');
const updateButton = document.getElementById('apply-update');
const checkButton = document.getElementById('check-update');
const stateKey = 'ts-update-inputs:' + location.pathname;
let registration, requested = false, checking = false;
function showWaiting() {
  if(!registration?.waiting || !navigator.serviceWorker.controller) return;
  write(updateStatus,()=>tr('En ny versjon er klar. Oppdater når målingen er ferdig.'));
  updateButton.hidden = false;
}
function saveInputs() {
  try {
    sessionStorage.setItem(stateKey, JSON.stringify({
      fields: [...document.querySelectorAll('input[id],select[id]')].map(el => [el.id,el.value]),
      tab: document.querySelector('nav button[aria-pressed="true"]')?.id
    }));
  } catch { /* Oppdatering virker også når lagring er blokkert. */ }
}
try {
  const saved = JSON.parse(sessionStorage.getItem(stateKey) || 'null');
  sessionStorage.removeItem(stateKey);
  if(saved) {
    for(const [id,value] of saved.fields) {
      const el = document.getElementById(id);
      if(el?.matches('input,select')) el.value = value;
    }
    document.getElementById('reading').dispatchEvent(new Event('input'));
    document.getElementById('fall-mode').dispatchEvent(new Event('input'));
    document.getElementById(saved.tab)?.click();
  }
} catch { /* En ugyldig gammel økt skal ikke stoppe kalkulatoren. */ }
async function checkUpdate() {
  if(checking) return;
  checking = true;
  checkButton.disabled = true;
  try {
    if(registration) {
      await registration.update();
      if(registration.waiting && navigator.serviceWorker.controller) showWaiting();
      else {
        updateButton.hidden = true;
        const response = await fetch('./version.json', {cache:'no-store'});
        if(!response.ok) throw Error();
        const latest = await response.json();
        write(updateStatus,()=>latest.version === currentVersion
          ? tr('Du bruker versjon {0}.',currentVersion)
          : tr('Laster ny versjon. Du kan fortsette målingen.'));
      }
    } else {
      const response = await fetch('./version.json', {cache:'no-store'});
      if(!response.ok) throw Error();
      const latest = await response.json();
      if(latest.version !== currentVersion) {
        write(updateStatus,()=>tr('Ny versjon tilgjengelig. Last siden på nytt for å oppdatere.'));
        updateButton.hidden = false;
      } else write(updateStatus,()=>tr('Du bruker versjon {0}.',currentVersion));
    }
  } catch {
    write(updateStatus,()=>tr('Kan ikke sjekke oppdateringer nå. Kalkulatoren kan fortsatt brukes.'));
  } finally { checking = false; checkButton.disabled = false; }
}
updateButton.addEventListener('click', () => {
  saveInputs();
  if(registration?.waiting) {
    requested = true;
    updateButton.disabled = true;
    write(updateStatus,()=>tr('Tar i bruk oppdateringen …'));
    registration.waiting.postMessage({type:'SKIP_WAITING'});
  } else location.reload();
});
checkButton.addEventListener('click', checkUpdate);
if('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    // Første installasjon eller en annen fane skal ikke avbryte målingen.
    if(requested) location.reload();
  });
  try {
    registration = await navigator.serviceWorker.register('./sw.js', {updateViaCache:'none'});
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing;
      installing?.addEventListener('statechange', () => {
        if(installing.state === 'installed') showWaiting();
        if(installing.state === 'redundant') write(updateStatus,()=>tr('Oppdateringen ble ikke lastet. Prøv igjen senere.'));
      });
    });
    showWaiting();
  } catch {
    write(updateStatus,()=>tr('Automatisk lagring uten nett er utilgjengelig. Du kan fortsatt sjekke oppdateringer.'));
  }
}
await checkUpdate();
window.addEventListener('online', checkUpdate);
document.addEventListener('visibilitychange', () => { if(!document.hidden) checkUpdate(); });
setInterval(() => { if(!document.hidden && navigator.onLine) checkUpdate(); }, 60000);
