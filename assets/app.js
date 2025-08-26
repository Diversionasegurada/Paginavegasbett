(function(){
  const CFG = window.VEGASBETT_CONFIG || {};
  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  $$("#year").forEach(el=> el.textContent = new Date().getFullYear());

  // URL overrides
  const params = new URLSearchParams(location.search);
  if (CFG.ALLOW_URL_OVERRIDES){
    ['principal','respaldo','cbu','alias','marca'].forEach(k=>{
      const v = params.get(k); if (v) {
        if (k==='principal') CFG.NUMERO_PRINCIPAL = v;
        if (k==='respaldo')  CFG.NUMERO_RESPALDO  = v;
        if (k==='cbu')       CFG.CBU              = v;
        if (k==='alias')     CFG.ALIAS            = v;
        if (k==='marca')     CFG.MARCA            = v;
      }
    });
  }

  function waUrl(number, text){
    const msg = encodeURIComponent(text);
    return number ? `https://wa.me/${number}?text=${msg}` : `https://wa.me/?text=${msg}`;
  }
  function moneyFormat(n){
    try{ const v=Number(n); if(isNaN(v)) return n;
      return v.toLocaleString('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0});
    }catch(e){ return n; }
  }
  function copyFromSelector(sel){
    const el=$(sel); if(!el) return false;
    el.select(); el.setSelectionRange(0,99999);
    const ok=document.execCommand('copy');
    if(ok){ toast('Copiado al portapapeles'); }
    const btn=document.activeElement;
    if(btn && btn.classList.contains('copybtn')){
      const old=btn.textContent; btn.textContent='¡Copiado!';
      setTimeout(()=> btn.textContent=old, 1200);
    }
    return ok;
  }
  function toast(text){
    const t=$('#toast'); if(!t) return;
    t.textContent=text; t.classList.add('show');
    setTimeout(()=> t.classList.remove('show'), 1600);
  }

  

  // Index
  if ($('#btnPrincipal')){
    $('#btnPrincipal').addEventListener('click', ()=>{
      const text=`Hola, soy ____.\nNecesito atención del *número principal*.\nGracias.`;
      if (typeof fbq==='function'){ fbq('track','Contact',{flow:'direct',target:'principal'}); }
      location.href=waUrl(CFG.NUMERO_PRINCIPAL, text);
    });
  }
  if ($('#btnRespaldo')){
    $('#btnRespaldo').addEventListener('click', ()=>{
      const text=`Hola, soy ____.\nNecesito atención del *número respaldo*.\nGracias.`;
      if (typeof fbq==='function'){ fbq('track','Contact',{flow:'direct',target:'respaldo'}); }
      location.href=waUrl(CFG.NUMERO_RESPALDO, text);
    });
  }

  // Cargar
  if ($('#formCargar')){
    const form=$('#formCargar');
    const paso2=$('#paso2');
    const cbu=$('#cbu'), alias=$('#alias');
    if (cbu) cbu.value = CFG.CBU || '';
    if (alias) alias.value = CFG.ALIAS || '';

    $$('.copybtn').forEach(btn=>btn.addEventListener('click',e=>{
      e.preventDefault(); copyFromSelector(btn.getAttribute('data-copy'));
    }));

    form.addEventListener('submit', e=>{
      e.preventDefault();
      const nombre=$('#nombre').value.trim();
      const monto=$('#monto').value.trim();
      if(!nombre || !monto){ alert('Completá nombre y monto.'); return; }
      paso2.classList.remove('hidden');
      paso2.scrollIntoView({behavior:'smooth',block:'start'});
    });

    const enviar=$('#enviarWhatsCargar');
    if (enviar){
      enviar.addEventListener('click', ()=>{
        const nombre=$('#nombre').value.trim();
        const monto=$('#monto').value.trim();
        if(!nombre || !monto){ alert('Completá nombre y monto.'); return; }
        const text=`Hola, soy *${nombre}*.\nQuiero *CARGAR* ${moneyFormat(monto)}.\nCBU/ALIAS copiado. Envío el comprobante aquí.`;
        if (typeof fbq==='function'){ fbq('track','Contact',{flow:'cargar'}); }
        location.href=waUrl(CFG.NUMERO_PRINCIPAL, text);
      });
    }
  }

  // Retirar
  if ($('#formRetirar')){
    $('#formRetirar').addEventListener('submit', e=>{
      e.preventDefault();
      const nombre=$('#nombreR').value.trim();
      const monto=$('#montoR').value.trim();
      if(!nombre || !monto){ alert('Completá nombre/usuario y monto.'); return; }
      const text=`Hola, soy *${nombre}*.\nQuiero *RETIRAR* ${moneyFormat(monto)}.\nEntiendo que hay 1 retiro cada 24 hs.`;
      if (typeof fbq==='function'){ fbq('track','Contact',{flow:'retirar'}); }
      location.href=waUrl(CFG.NUMERO_PRINCIPAL, text);
    });
  }

  // Panel admin
  const adminToggle=$('#adminToggle');
  const panel=$('#adminPanel');
  const pin=$('#pin');
  const nP=$('#nPrincipal'), nR=$('#nRespaldo');
  if (adminToggle && panel){ adminToggle.addEventListener('click', ()=> panel.classList.toggle('hidden')); }
  if ($('#aplicarAdmin')){
    $('#aplicarAdmin').addEventListener('click', ()=>{
      if (!pin.value || pin.value !== (CFG.EMERGENCY_PIN||'')){ alert('PIN incorrecto'); return; }
      if (nP.value) CFG.NUMERO_PRINCIPAL = nP.value.trim();
      if (nR.value) CFG.NUMERO_RESPALDO  = nR.value.trim();
      toast('Números aplicados (solo en esta sesión)');
    });
  }
  if ($('#genLink')){
    $('#genLink').addEventListener('click', ()=>{
      if (!pin.value || pin.value !== (CFG.EMERGENCY_PIN||'')){ alert('PIN incorrecto'); return; }
      const base=location.origin+location.pathname;
      const qp=new URLSearchParams();
      if (nP.value) qp.set('principal', nP.value.trim());
      if (nR.value) qp.set('respaldo',  nR.value.trim());
      const link=base+'?'+qp.toString();
      const out=$('#linkResult'); if(out){ out.value=link; out.select(); document.execCommand('copy'); toast('Link generado'); }
    });
  }
})();