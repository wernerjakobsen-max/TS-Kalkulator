
// units.js for v3.9.7d — injects a mm/in selector safely.
// Slider remains mm 400..800. Input shows mm or inch; conversions happen on the fly.
(function(){
  const INCH = 25.4;
  const UNIT_KEY='ts_unit_v397d';
  const STR = {
    mm: {
      lblD:"Avlest D (mm)",
      range:"måleområde 400–800 mm",
      out:"Utenfor måleområde 400–800 mm."
    },
    in: {
      lblD:"Avlest D (inch)",
      range:"range 15.75–31.50\"",
      out:"Outside range 15.75–31.50\"."
    }
  };
  function getUnit(){ try{ return localStorage.getItem(UNIT_KEY) || 'mm'; }catch(e){ return 'mm'; } }
  function setUnit(u){ try{ localStorage.setItem(UNIT_KEY, u); }catch(e){} applyUnits(); renderFromSlider(); }

  function fmt(val, unit){ return unit==='mm' ? String(Math.round(val)) : (Math.round(val*100)/100).toFixed(2); }
  function toMm(v, unit){ if(!Number.isFinite(v)) return NaN; return unit==='mm' ? v : v*INCH; }
  function fromMm(mm, unit){ return unit==='mm' ? mm : (mm/INCH); }

  function makeUnitSelect(){
    const sel = document.createElement('select');
    sel.id = 'unit';
    sel.className = 'btn ghost';
    sel.innerHTML = '<option value="mm">mm</option><option value="in">inch</option>';
    sel.value = getUnit();
    sel.addEventListener('change', (e)=> setUnit(e.target.value));
    return sel;
  }

  function inject(){
    const tb = document.getElementById('toolbar');
    if(!tb || document.getElementById('unit')) return;
    tb.insertBefore(makeUnitSelect(), document.getElementById('lang'));
    applyUnits();
    hookInput();
    hookSlider();
  }

  function applyUnits(){
    const u = getUnit();
    // labels
    const lblD = document.getElementById('lbl_D');
    const range = document.getElementById('rangeText');
    if(lblD) lblD.textContent = STR[u].lblD;
    if(range) range.textContent = STR[u].range;
  }

  function renderFromSlider(){
    const u = getUnit();
    const mm = parseFloat(document.getElementById('sliderD').value);
    document.getElementById('D').value = fmt(fromMm(mm, u), u);
    // trigger the core render using current displayed value converted back to mm
    renderUnitAware();
  }

  function renderUnitAware(){
    const u = getUnit();
    const raw = parseFloat(String(document.getElementById('D').value).replace(',','.'));
    const mm = toMm(raw, u);
    const status = document.getElementById('statusMsg');
    if(status) status.textContent='';
    if(!Number.isFinite(mm)){
      document.getElementById('thetaTop').textContent='–';
      if(status) status.textContent = STR[u].out;
      return;
    }
    if(mm<400 || mm>800){
      document.getElementById('rangeText').classList.add('warn');
      document.getElementById('thetaTop').textContent='–';
      if(status) status.textContent = STR[u].out;
      return;
    } else {
      document.getElementById('rangeText').classList.remove('warn');
    }
    // let core use mm by reflecting mm into slider + textbox (in chosen unit)
    document.getElementById('sliderD').value = String(Math.round(mm));
    // temporarily set textbox to mm for core render, then restore formatted
    const prev = document.getElementById('D').value;
    document.getElementById('D').value = String(Math.round(mm));
    if(typeof render === 'function') render();
    document.getElementById('D').value = fmt(fromMm(mm,u), u);
  }

  function hookInput(){
    const inp = document.getElementById('D');
    if(!inp) return;
    inp.addEventListener('input', renderUnitAware);
    inp.addEventListener('blur', ()=>{
      const u = getUnit();
      const raw = parseFloat(String(inp.value).replace(',','.'));
      if(!Number.isFinite(raw)) return;
      let mm = toMm(raw, u);
      if(mm<400) mm=400; if(mm>800) mm=800;
      document.getElementById('sliderD').value = String(Math.round(mm));
      inp.value = fmt(fromMm(mm,u), u);
      renderUnitAware();
    });
  }

  function hookSlider(){
    const s = document.getElementById('sliderD');
    if(!s) return;
    s.addEventListener('input', renderFromSlider);
  }

  document.addEventListener('DOMContentLoaded', inject);
})();
