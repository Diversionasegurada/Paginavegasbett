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

  // RETIRAR
if (document.querySelector('#formRetirar')) {
  const $ = (s,r=document)=>r.querySelector(s);
  const CFG = window.VEGASBETT_CONFIG || {};

  // Prefills útiles
  const titularInput = $('#titularR');
  const cbuAliasInput = $('#cbuAliasR');
  if (titularInput && CFG.TITULAR) titularInput.value = CFG.TITULAR;
  if (cbuAliasInput) cbuAliasInput.value = (CFG.ALIAS || CFG.CBU || '');

  $('#formRetirar').addEventListener('submit', (e) => {
    e.preventDefault();

    const usuario  = $('#usuarioR').value.trim();
    const titular  = $('#titularR').value.trim();
    const cbuAlias = $('#cbuAliasR').value.trim();
    const monto    = $('#montoR').value.trim();

    if (!usuario || !titular || !cbuAlias || !monto) {
      alert('Completá todos los campos.');
      return;
    }

    const moneyFormat = (n) => {
      try { const v = Number(n); if (isNaN(v)) return n;
        return v.toLocaleString('es-AR', { style:'currency', currency:'ARS', maximumFractionDigits:0 });
      } catch(e){ return n; }
    };

    const text = `🎉 *¡FELICITACIONES POR TU PREMIO!* 🥳
Para procesar tu retiro, por favor completá los siguientes datos:

👤 _Usuario:_ ${usuario}
👑 _Titular de la cuenta:_ ${titular}
🏦 _CBU o Alias:_ ${cbuAlias}
💵 _Monto a retirar:_ ${moneyFormat(monto)}

—
⚠️ *IMPORTANTE*
Procesamos los retiros por orden de _llegada._
Si escribís reiteradamente, el mensaje sube y se demora el proceso. Apenas finalicemos, te enviamos el comprobante ✅

—
⏰ *RECORDÁ:*
📆 Solo se puede realizar 1 retiro cada 24 hs.
💸 Monto máximo por retiro: $250.000

—
🙌 Desde VegasBett buscamos darte el mejor servicio posible
💛 Si querés ayudarnos con una propina, ¡te lo vamos a agradecer mucho! 🙏🏻

🤝 Para colaborar, solo pedinos el CBU`;

    const msg = encodeURIComponent(text);
    const number = CFG.NUMERO_PRINCIPAL;
    const url = number ? `https://wa.me/${number}?text=${msg}` : `https://wa.me/?text=${msg}`;
    if (typeof fbq === 'function') { fbq('track','Contact',{flow:'retirar'}); }
    window.location.href = url;
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
