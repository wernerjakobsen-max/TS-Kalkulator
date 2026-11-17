// Bundled with the app: language switching never requires a network request.
(() => {
  const dictionary = /*__TRANSLATIONS__*/{};
  const codes = ['nb','en','pl','uk','de','es'];
  const locales = {nb:'nb-NO',en:'en-GB',pl:'pl-PL',uk:'uk-UA',de:'de-DE',es:'es-ES'};
  const storageKey = 'ts-kalkulator-language';
  let language = 'nb';
  try { const saved=localStorage.getItem(storageKey); if(codes.includes(saved))language=saved; } catch {}
  const t = (key,...args) => {
    const text=language==='nb'?key:(dictionary[key]?.[codes.indexOf(language)-1] ?? key);
    return text.replace(/\{(\d+)\}/g,(_,i)=>String(args[i] ?? ''));
  };
  const formatNumber = (value,digits=1) => value.toLocaleString(locales[language],{
    minimumFractionDigits:digits,maximumFractionDigits:digits
  });
  const entries=[];
  const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
    if(node.parentElement.closest('script,style,select#language'))continue;
    const key=node.nodeValue.trim();
    if(dictionary[key])entries.push({node,key,before:node.nodeValue.match(/^\s*/)[0],after:node.nodeValue.match(/\s*$/)[0]});
    else if(/^(Testversjon|Versjon)(?: ·)? /.test(key)){
      const word=key.startsWith('Testversjon')?'Testversjon':'Versjon';
      entries.push({node,key:word,suffix:key.slice(word.length),before:'',after:''});
    }
  }
  const attributes=[];
  for(const el of document.querySelectorAll('[aria-label],[alt]')){
    for(const name of ['aria-label','alt']){
      const key=el.getAttribute(name);if(dictionary[key])attributes.push({el,name,key});
    }
  }
  const live=new Map();
  const write=(el,render)=>{live.set(el,render);el.textContent=render();};
  function apply(){
    document.documentElement.lang=language;
    for(const entry of entries)entry.node.nodeValue=entry.before+t(entry.key)+(entry.suffix||'')+entry.after;
    for(const {el,name,key} of attributes)el.setAttribute(name,t(key));
    for(const [el,render] of live)el.textContent=render();
  }
  window.TSI18n={t,formatNumber,write,get language(){return language;}};
  const select=document.getElementById('language');select.value=language;
  select.addEventListener('change',()=>{
    if(!codes.includes(select.value))return;
    language=select.value;
    try{localStorage.setItem(storageKey,language);}catch{}
    apply();document.dispatchEvent(new Event('ts-language-change'));
  });
  apply();
})();
