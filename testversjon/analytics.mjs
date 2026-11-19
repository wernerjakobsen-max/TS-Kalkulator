// Public release only. No measurement fields, personal IDs or offline event queue.
const endpoint = 'https://ts-kalkulator.goatcounter.com/count';
const version = '__VERSION__';
const preferenceKey = 'ts-statistics-disabled';
const versionKey = 'ts-statistics-version';
const publicSite = location.origin === 'https://wernerjakobsen-max.github.io';
const allowedPaths = ['/TS-Kalkulator/', '/TS-Kalkulator/index.html', '/TS-Kalkulator/vinkel-med-tommestokk/', '/TS-Kalkulator/fallkalkulator/'];
const app = ['/TS-Kalkulator/', '/TS-Kalkulator/index.html'].includes(location.pathname);
let script, ready = false, started = false;
let disabled = stored(preferenceKey) === '1';
const pending = [];
function stored(key) { try { return localStorage.getItem(key); } catch { return null; } }
function save(key, value) { try { localStorage.setItem(key, value); } catch {} }
function permitted() {
  return publicSite && allowedPaths.includes(location.pathname) &&
    !disabled && navigator.doNotTrack !== '1' && navigator.globalPrivacyControl !== true;
}
function event(name, title) {
  if (!permitted() || !navigator.onLine) return;
  if (!ready) { if (pending.length < 8) pending.push({path:name, title, event:true}); return; }
  try { window.goatcounter.count({path:name, title, event:true}); } catch {}
}
function referrer() {
  if (new URLSearchParams(location.search).get('utm_source') === 'qr') return 'QR-kode';
  try { return document.referrer ? new URL(document.referrer).origin : ''; } catch { return ''; }
}
function start() {
  if (started || !permitted() || !navigator.onLine) return;
  started = true;
  window.goatcounter = {no_onload:true, endpoint, path:app?'/TS-Kalkulator/':location.pathname, referrer:referrer(), title:document.title};
  script = document.createElement('script');
  script.src = 'https://gc.zgo.at/count.js';
  script.async = true;
  script.dataset.goatcounter = endpoint;
  script.onload = () => {
    if (!permitted() || !navigator.onLine || typeof window.goatcounter?.count !== 'function') return;
    try {
      if (window.goatcounter.filter()) return;
      window.goatcounter.count();
      ready = true;
      if (app) {
        event('app-version-' + version, 'Appversjon ' + version);
        const previous = stored(versionKey);
        // First observation is a baseline, never an inferred upgrade from 5.0.0.
        if (previous && previous !== version && /^\d+\.\d+\.\d+$/.test(previous)) {
          event('app-update-' + previous + '-to-' + version, 'Versjonsbytte ' + previous + ' → ' + version);
        }
        save(versionKey, version);
        if (matchMedia('(display-mode: standalone)').matches || navigator.standalone === true) {
          event('app-standalone-' + version, 'Åpnet fra startskjerm ' + version);
        }
      }
      for (const item of pending.splice(0)) window.goatcounter.count(item);
    } catch { /* Statistics must never interrupt the calculator. */ }
  };
  script.onerror = () => { started = false; script.remove(); };
  document.head.append(script);
}
const toggle = document.getElementById('statistics-toggle');
const tr = key => window.TSI18n?.t(key) ?? key;
function renderToggle() {
  if (!toggle) return;
  const render = () => disabled ? tr('Slå på bruksstatistikk') : tr('Slå av bruksstatistikk');
  if (window.TSI18n) window.TSI18n.write(toggle, render); else toggle.textContent = render();
  toggle.setAttribute('aria-pressed', String(!disabled));
}
toggle?.addEventListener('click', () => {
  disabled = !disabled;
  save(preferenceKey, disabled ? '1' : '0');
  if (disabled) { pending.length = 0; script?.remove(); }
  else { started = false; ready = false; start(); }
  renderToggle();
});
window.addEventListener('appinstalled', () => event('app-installed-' + version, 'Nettleseren bekreftet installasjon ' + version));
window.addEventListener('online', start);
renderToggle();
start();
