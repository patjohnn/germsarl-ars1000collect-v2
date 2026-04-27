/* =============================================
   CACAO COLLECT v3 — LOGIQUE PRINCIPALE
   ============================================= */
'use strict';

let currentUser = null;
let currentFicheNum = null;
let editingFicheId = null;
let polygonePoints = [];
let plageVideData = {};

// Live polygon tracking state
let trackingActive = false;
let trackingWatchId = null;
let trackingTarget = null;
let trackingTimer = null;
let lastGPSPosition = null;
let trackingCountdown = 0;

const DB_KEY = 'cacaoCollect_fiches';
const USER_KEY = 'cacaoCollect_session';

function getFiches() { try { return JSON.parse(localStorage.getItem(DB_KEY)||'[]'); } catch { return []; } }
function setFiches(f) { localStorage.setItem(DB_KEY, JSON.stringify(f)); }
function getSession() { try { return JSON.parse(localStorage.getItem(USER_KEY)||'null'); } catch { return null; } }
function setSession(u) { localStorage.setItem(USER_KEY, u?JSON.stringify(u):'null'); }

// ── Init ──────────────────────────────────────
window.addEventListener('load', () => {
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  setTimeout(() => {
    document.getElementById('splash').classList.add('out');
    currentUser = getSession();
    currentUser ? showApp() : showLogin();
  }, 1600);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
});

function updateStatus() {
  const on = navigator.onLine;
  const el = document.getElementById('offlineStatus');
  const note = document.getElementById('offlineNote');
  if (el) { el.textContent = on?'🟢 En ligne':'🟡 Hors ligne'; el.className='offline-indicator'+(on?'':' offline'); }
  if (note) note.textContent = on?'':'Mode hors ligne — sync différée';
}

// ── Auth ──────────────────────────────────────
function showLogin() {
  document.getElementById('loginScreen').classList.remove('hidden');
  document.getElementById('app').classList.add('hidden');
  updateStatus();
}
function showApp() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('app').classList.remove('hidden');
  const init = currentUser.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();
  ['userAvatar','menuAvatar'].forEach(id => document.getElementById(id).textContent = init);
  document.getElementById('menuUsername').textContent = currentUser.name;
  document.getElementById('menuRole').textContent = currentUser.role + (currentUser.region?' — '+currentUser.region:'');
  document.getElementById('adminMenuItem').classList.toggle('hidden', currentUser.role !== 'admin');
  showPage('dashboard');
  updateStatus();
}
function doLogin() {
  const u = document.getElementById('loginUsername').value.trim();
  const p = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginError');
  const found = getUsers().find(x => x.username===u && x.password===p && x.active!==false);
  if (!found) { err.textContent='Identifiant ou mot de passe incorrect.'; err.classList.remove('hidden'); return; }
  err.classList.add('hidden');
  currentUser = found; setSession(found); showApp();
}
function doLogout() { currentUser=null; setSession(null); hideMenu(); showLogin(); }

// ── Pages ─────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const pg = document.getElementById('page-'+id);
  if (pg) { pg.classList.add('active'); pg.innerHTML = renderPage(id); }
  const titles = {dashboard:'Tableau de bord',newFiche:'Nouvelle fiche',drafts:'Brouillons',pending:'Attente de synchronisation',fiches:'Fiches synchronisées',admin:'Administration'};
  document.getElementById('topbarTitle').textContent = titles[id]||'';
  updateBadges();
}
function setNav(btn) { document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }
function showMenu() { document.getElementById('sideMenu').classList.add('open'); document.getElementById('menuOverlay').classList.remove('hidden'); }
function hideMenu() { document.getElementById('sideMenu').classList.remove('open'); document.getElementById('menuOverlay').classList.add('hidden'); }

function renderPage(id) {
  const fiches = getFiches().filter(f => ['admin','superviseur'].includes(currentUser?.role) ? true : f.userId===currentUser?.id);
  switch(id) {
    case 'dashboard': return renderDashboard(fiches);
    case 'newFiche':  return renderNewFiche();
    case 'drafts':    return renderList(fiches.filter(f=>f.status==='draft'), '📝', true);
    case 'pending':   return renderList(fiches.filter(f=>f.status==='pending'), '⏳', false, true);
    case 'fiches':    return renderList(fiches.filter(f=>f.status==='synced'), '✅', false);
    case 'admin':     return renderAdmin();
    default: return '';
  }
}
function updateBadges() {
  const n = getFiches().filter(f=>f.userId===currentUser?.id && f.status==='pending').length;
  ['pendingCount','menuPendingBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent=n; el.classList.toggle('hidden',n===0); }
  });
}

// ── Dashboard ─────────────────────────────────
function renderDashboard(fiches) {
  const today = new Date().toDateString();
  const s = { total:fiches.length, drafts:fiches.filter(f=>f.status==='draft').length, pending:fiches.filter(f=>f.status==='pending').length, today:fiches.filter(f=>new Date(f.createdAt).toDateString()===today).length };
  const h = new Date().getHours();
  const greet = h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir';
  const dateStr = new Date().toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  return `<div class="page-content">
    <div class="dashboard-hero"><div class="hero-greeting">${greet}, ${currentUser.name.split(' ')[0]} 👋</div><div class="hero-date">${dateStr}</div></div>
    <div class="stats-grid">
      <div class="stat-card stat-green"><div class="stat-num">${s.total}</div><div class="stat-label">Fiches total</div></div>
      <div class="stat-card stat-amber"><div class="stat-num">${s.drafts}</div><div class="stat-label">Brouillons</div></div>
      <div class="stat-card stat-blue"><div class="stat-num">${s.pending}</div><div class="stat-label">En attente</div></div>
      <div class="stat-card stat-purple"><div class="stat-num">${s.today}</div><div class="stat-label">Aujourd'hui</div></div>
    </div>
    <div class="section-title">Actions rapides</div>
    <div class="quick-actions">
      <button class="quick-btn" onclick="showPage('newFiche')"><span class="qb-icon">📝</span><span>Nouvelle</span></button>
      <button class="quick-btn" onclick="showPage('drafts')"><span class="qb-icon">💾</span><span>Brouillons</span></button>
      <button class="quick-btn" onclick="trySync()"><span class="qb-icon">☁️</span><span>Synchroniser</span></button>
    </div>
    <div class="section-title">Fiches récentes</div>
    ${fiches.length===0?'<div class="empty-state"><div class="es-icon">📭</div><p>Aucune fiche</p></div>':fiches.slice(-5).reverse().map(f=>ficheItem(f,f.status==='draft')).join('')}
  </div>`;
}

function ficheItem(f, editable=false) {
  const statusLabel = {draft:'Brouillon',pending:'En attente',synced:'Synchronisée'}[f.status]||f.status;
  const title = f.data?.nomProducteur || f.data?.gpsVillage || 'Sans titre';
  const onclick = editable ? `openFiche(${f.ficheNum},'${f.id}')` : (f.status==='pending' ? `openFiche(${f.ficheNum},'${f.id}')` : '');
  return `<div class="recent-item" onclick="${onclick}">
    <div class="ri-badge">F${f.ficheNum}</div>
    <div class="ri-info"><div class="ri-title">${title}</div><div class="ri-sub">${new Date(f.createdAt).toLocaleDateString('fr-FR')} — ${FICHE_NAMES[f.ficheNum]||''}</div></div>
    <div class="ri-status ${f.status}">${statusLabel}</div>
  </div>`;
}

function renderList(fiches, icon, editable, showSync=false) {
  return `<div class="page-content">
    <div class="search-bar"><input type="search" placeholder="Rechercher…" oninput="filterList(this.value,'listContainer')"></div>
    <div id="listContainer">
      ${fiches.length===0?`<div class="empty-state"><div class="es-icon">${icon}</div><p>Aucune fiche ici</p></div>`:fiches.slice().reverse().map(f=>ficheItem(f,editable)).join('')}
    </div>
    ${showSync&&fiches.length>0?`<button class="btn-primary" style="margin-top:16px" onclick="trySync()">☁️ Synchroniser tout (${fiches.length})</button>`:''}
  </div>`;
}
function filterList(q, containerId) {
  document.querySelectorAll(`#${containerId} .recent-item`).forEach(el => {
    el.style.display = el.textContent.toLowerCase().includes(q.toLowerCase()) ? '' : 'none';
  });
}

function renderNewFiche() {
  return `<div class="page-content">
    <div class="section-title" style="margin-bottom:12px">Choisir une fiche</div>
    <div class="fiche-cards">
      ${Object.entries(FICHE_NAMES).map(([num,name])=>`
        <div class="fiche-card" onclick="openFiche(${num})">
          <div class="fc-num">F${num}</div>
          <div class="fc-info"><div class="fc-title">${name}</div></div>
          <div class="fc-arrow">›</div>
        </div>`).join('')}
    </div>
  </div>`;
}

// ── Modal ─────────────────────────────────────
function openFiche(num, ficheId=null) {
  currentFicheNum = num; editingFicheId = ficheId;
  polygonePoints = []; plageVideData = {};
  let data = {}, isReadOnly = false;
  if (ficheId) {
    const f = getFiches().find(x=>x.id===ficheId);
    if (f) { data=f.data||{}; polygonePoints=data.polygone||[]; isReadOnly=(f.status==='synced'); }
  }
  document.getElementById('modalTitle').textContent = `Fiche ${num} — ${FICHE_NAMES[num]}`;
  document.getElementById('modalBody').innerHTML = buildForm(num, data);
  document.getElementById('ficheModal').classList.remove('hidden');
  document.getElementById('btnDraft').style.display = isReadOnly?'none':'';
  document.getElementById('btnFinish').style.display = isReadOnly?'none':'';
  if (isReadOnly) {
    document.querySelectorAll('#modalBody input,#modalBody select,#modalBody textarea,#modalBody button:not(.btn-icon)').forEach(el=>el.disabled=true);
    document.getElementById('modalBody').insertAdjacentHTML('afterbegin','<div class="readonly-banner">🔒 Fiche synchronisée — lecture seule</div>');
  }
  initInteractions();
}
function buildForm(num, data) {
  switch(parseInt(num)) {
    case 1: return buildFiche1(data);
    case 2: return buildFiche2(data);
    case 3: return buildFiche3(data);
    case 4: return buildFiche4(data);
    default: return '<p style="padding:20px">Fiche non disponible</p>';
  }
}
function closeModal() {
  stopTracking();
  document.getElementById('ficheModal').classList.add('hidden');
  editingFicheId=null; currentFicheNum=null;
}

function initInteractions() {
  document.querySelectorAll('.radio-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const name = opt.querySelector('input')?.name;
      document.querySelectorAll(`.radio-opt input[name="${name}"]`).forEach(i=>i.closest('.radio-opt').classList.remove('selected'));
      opt.classList.add('selected');
      const inp = opt.querySelector('input'); if(inp) inp.checked=true;
      if (name==='plagesVides') {
        const val = inp?.value;
        document.getElementById('plageVideSection')?.classList.toggle('hidden', !['beaucoup','grande'].includes(val));
      }
    });
  });
  document.querySelectorAll('[data-field$="_culture"]').forEach(sel => {
    sel.addEventListener('change', function() {
      const m = this.dataset.field.match(/p(\d+)_culture/);
      if (m) document.getElementById(`p${m[1]}_autreBox`)?.classList.toggle('hidden', this.value!=='Autre');
    });
  });
  document.querySelector('[data-field="modeFermentation"]')?.addEventListener('change', function() {
    document.getElementById('fermentAutreBox')?.classList.toggle('hidden', this.value!=='autre');
  });
  document.querySelector('[data-field="methodeSechage"]')?.addEventListener('change', function() {
    document.getElementById('sechageAutreBox')?.classList.toggle('hidden', this.value!=='autre');
  });
}

// ── Dynamic row adders ────────────────────────
function addMenage() { const c=document.getElementById('menageRows'); if(!c)return; c.insertAdjacentHTML('beforeend',buildMenageRow({},c.querySelectorAll('.sub-card').length)); }
function addParcelle() { const c=document.getElementById('parcelleRows'); if(!c)return; c.insertAdjacentHTML('beforeend',buildParcelleRow({},c.querySelectorAll('.sub-card').length)); }
function addArbre() { const c=document.getElementById('arbreRows'); if(!c)return; c.insertAdjacentHTML('beforeend',buildArbreRow({},c.querySelectorAll('.sub-card').length)); }
function addEngrais() { const c=document.getElementById('engraisRows'); if(!c)return; c.insertAdjacentHTML('beforeend',buildEngraisRow({},c.querySelectorAll('.sub-card').length)); }
function addPhyto() { const c=document.getElementById('phytoRows'); if(!c)return; c.insertAdjacentHTML('beforeend',buildPhytoRow({},c.querySelectorAll('.sub-card').length)); }
function addEpargne() { const c=document.getElementById('epargneRows'); if(!c)return; c.insertAdjacentHTML('beforeend',buildEpargneRow({custom:true},c.querySelectorAll('.sub-card').length)); }
function addRevenu() { const c=document.getElementById('revenusRows'); if(!c)return; c.insertAdjacentHTML('beforeend',buildRevenuRow({custom:true},c.querySelectorAll('.sub-card').length)); }
function addMO() { const c=document.getElementById('moRows'); if(!c)return; c.insertAdjacentHTML('beforeend',buildMORow({},c.querySelectorAll('.sub-card').length)); }
function addEquip() { const c=document.getElementById('equipRows'); if(!c)return; c.insertAdjacentHTML('beforeend',buildEquipRow({custom:true,nom:'',type:'Autre'},c.querySelectorAll('.sub-card').length)); }
function addPlageVide() { const c=document.getElementById('plageVideRows'); if(!c)return; const i=c.querySelectorAll('.sub-card').length; plageVideData[i]=[]; c.insertAdjacentHTML('beforeend',buildPlageVideRow({},i)); }

// ── GPS single point ──────────────────────────
function captureGPS(latField, lonField, accId) {
  if (!navigator.geolocation) { showToast('GPS non disponible','error'); return; }
  showToast('Acquisition GPS…');
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude.toFixed(8);
    const lon = pos.coords.longitude.toFixed(8);
    const acc = pos.coords.accuracy.toFixed(1);
    const setVal = (field, val) => {
      const el = document.getElementById('inp_'+field) || document.querySelector(`[data-field="${field}"]`);
      if (el) el.value = val;
    };
    setVal(latField, lat); setVal(lonField, lon);
    const accEl = document.getElementById(accId);
    if (accEl) accEl.textContent = `Précision: ±${acc} m`;
    showToast(`📍 ${lat}, ${lon} (±${acc}m)`,'success');
  }, err => showToast('Erreur GPS: '+(err.code===1?'Accès refusé':err.message),'error'),
  { enableHighAccuracy:true, timeout:15000, maximumAge:0 });
}

// ── LIVE POLYGON TRACKING ─────────────────────
function getTrackConfig(target) {
  const intervalEl  = document.getElementById('trackInterval_' + target);
  const accuracyEl  = document.getElementById('trackAccuracy_' + target);
  return {
    interval:    parseInt(intervalEl?.value  || 5),
    maxAccuracy: parseFloat(accuracyEl?.value || 10),
  };
}

function startTracking(target) {
  if (!navigator.geolocation) { showToast('GPS non disponible','error'); return; }
  if (trackingActive && trackingTarget === target) { stopTracking(); return; }
  if (trackingActive) stopTracking();

  const cfg = getTrackConfig(target);
  trackingActive   = true;
  trackingTarget   = target;
  lastGPSPosition  = null;
  trackingCountdown = cfg.interval;

  const btn    = document.getElementById('trackBtn_'    + target);
  const status = document.getElementById('trackStatus_' + target);
  const info   = document.getElementById('trackInfo_'   + target);
  if (btn)    { btn.textContent = '⏹ Arrêter le tracé'; btn.classList.add('tracking-active'); }
  if (info)   info.classList.remove('hidden');
  if (status) status.textContent = '🔴 En cours — acquisition GPS…';
  showToast(`Tracé démarré — ${cfg.interval}s / ≤${cfg.maxAccuracy}m`, 'success');

  // Continuous GPS watch (feeds lastGPSPosition)
  trackingWatchId = navigator.geolocation.watchPosition(
    pos  => { lastGPSPosition = pos; updateCountdownUI(target, trackingCountdown, cfg.maxAccuracy); },
    err  => { showToast('Erreur GPS: ' + err.message, 'error'); stopTracking(); },
    { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
  );

  // Timed capture every second (counts down, captures at 0)
  trackingTimer = setInterval(() => {
    trackingCountdown--;
    updateCountdownUI(target, trackingCountdown, cfg.maxAccuracy);
    if (trackingCountdown <= 0) {
      trackingCountdown = cfg.interval;
      captureTrackingPoint(target, cfg.maxAccuracy);
    }
  }, 1000);
}

function updateCountdownUI(target, countdown, maxAcc) {
  const accEl  = document.getElementById('trackAcc_'  + target);
  const nextEl = document.getElementById('trackNext_' + target);
  if (lastGPSPosition && accEl) {
    const acc = lastGPSPosition.coords.accuracy;
    const ok  = acc <= maxAcc;
    accEl.innerHTML = `<span style="color:${ok?'var(--green-600)':'var(--red-500)'}">±${acc.toFixed(1)}m ${ok?'✓':'✗'}</span>`;
  }
  if (nextEl) nextEl.textContent = `Prochain: ${countdown}s`;
}

function captureTrackingPoint(target, maxAccuracy) {
  if (!lastGPSPosition) { updateStatus(target, '⚠️ Pas de signal GPS…'); return; }
  const acc = lastGPSPosition.coords.accuracy;
  if (acc > maxAccuracy) {
    const s = document.getElementById('trackStatus_' + target);
    if (s) s.textContent = `⚠️ Précision ±${acc.toFixed(1)}m > ${maxAccuracy}m — point ignoré`;
    return;
  }
  const pt = {
    lat: lastGPSPosition.coords.latitude.toFixed(8),
    lon: lastGPSPosition.coords.longitude.toFixed(8),
    acc: acc.toFixed(1),
    t:   new Date().toISOString(),
  };
  if (target === 'parcelle') {
    polygonePoints.push(pt);
    refreshPolygoneUI();
    drawMapCanvas('parcelle', polygonePoints);
  } else {
    const idx = parseInt(target.split('_')[1]);
    if (!plageVideData[idx]) plageVideData[idx] = [];
    plageVideData[idx].push(pt);
    refreshPlageUI(idx);
    drawMapCanvas(target, plageVideData[idx]);
  }
  const total  = target === 'parcelle' ? polygonePoints.length : (plageVideData[parseInt(target.split('_')[1])]||[]).length;
  const s      = document.getElementById('trackStatus_' + target);
  const ptsEl  = document.getElementById('trackPts_'    + target);
  if (s)     s.textContent = `✅ Point #${total} enregistré (±${acc.toFixed(1)}m)`;
  if (ptsEl) ptsEl.textContent = `${total} pts`;
}

function stopTracking() {
  if (trackingTimer)      { clearInterval(trackingTimer); trackingTimer = null; }
  if (trackingWatchId !== null) { navigator.geolocation.clearWatch(trackingWatchId); trackingWatchId = null; }
  if (trackingTarget) {
    const btn    = document.getElementById('trackBtn_'    + trackingTarget);
    const status = document.getElementById('trackStatus_' + trackingTarget);
    const info   = document.getElementById('trackInfo_'   + trackingTarget);
    const total  = trackingTarget === 'parcelle'
      ? polygonePoints.length
      : (plageVideData[parseInt(trackingTarget.split('_')[1])]||[]).length;
    if (btn)    { btn.textContent = '▶ Démarrer le tracé'; btn.classList.remove('tracking-active'); }
    if (info)   info.classList.add('hidden');
    if (status) status.textContent = total > 0 ? `✅ Tracé terminé — ${total} point(s)` : '';
    showToast('Tracé arrêté ✓','success');
  }
  trackingActive = false; trackingTarget = null;
  lastGPSPosition = null; trackingCountdown = 0;
}

function clearPolygone(target) {
  showConfirm('Effacer le tracé','Tous les points seront supprimés. Confirmer ?', () => {
    if (target === 'parcelle') { polygonePoints = []; refreshPolygoneUI(); drawMapCanvas('parcelle',[]); }
    else { const idx=parseInt(target.split('_')[1]); plageVideData[idx]=[]; refreshPlageUI(idx); drawMapCanvas(target,[]); }
    const s = document.getElementById('trackStatus_' + target);
    if (s) s.textContent = '';
    showToast('Tracé effacé','success');
  });
}

function refreshPolygoneUI() {
  const c = document.getElementById('polygonePoints');
  if (c) c.innerHTML = buildPolygonePoints(polygonePoints);
  const cnt = document.getElementById('polygoneCount');
  if (cnt) cnt.textContent = `${polygonePoints.length} point(s)`;
}
function refreshPlageUI(idx) {
  const c = document.getElementById(`plagePoints_${idx}`);
  if (c) c.innerHTML = buildPlagePoints(idx, plageVideData[idx]||[]);
  const cnt = document.getElementById(`plageCount_${idx}`);
  if (cnt) cnt.textContent = `${(plageVideData[idx]||[]).length} point(s)`;
}

// Manual point add
function addPolygonePointManual() {
  if (!navigator.geolocation) { showToast('GPS non disponible','error'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    const pt = { lat:pos.coords.latitude.toFixed(8), lon:pos.coords.longitude.toFixed(8), acc:pos.coords.accuracy.toFixed(1) };
    polygonePoints.push(pt);
    refreshPolygoneUI();
    drawMapCanvas('parcelle', polygonePoints);
    showToast(`Point ${polygonePoints.length} ajouté ±${pt.acc}m`,'success');
  }, ()=>showToast('Erreur GPS','error'), {enableHighAccuracy:true,timeout:15000});
}
function addPolygonePoint() { addPolygonePointManual(); } // alias
function removePolygonePoint(i) {
  polygonePoints.splice(i,1);
  refreshPolygoneUI();
  drawMapCanvas('parcelle', polygonePoints);
}
function addPlagePoint(idx) {
  if (!navigator.geolocation) { showToast('GPS non disponible','error'); return; }
  navigator.geolocation.getCurrentPosition(pos => {
    if (!plageVideData[idx]) plageVideData[idx]=[];
    const pt={lat:pos.coords.latitude.toFixed(8),lon:pos.coords.longitude.toFixed(8),acc:pos.coords.accuracy.toFixed(1)};
    plageVideData[idx].push(pt);
    refreshPlageUI(idx);
    drawMapCanvas('plage_'+idx, plageVideData[idx]);
    showToast(`Point ajouté ±${pt.acc}m`,'success');
  }, ()=>showToast('Erreur GPS','error'), {enableHighAccuracy:true,timeout:15000});
}

// ── MAP CANVAS PREVIEW ────────────────────────
function drawMapCanvas(target, points) {
  const canvas = document.getElementById('mapCanvas_' + target);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0,0,W,H);

  // Background + grid
  ctx.fillStyle = '#f0f7f0'; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle = '#c8e6c9'; ctx.lineWidth = 0.5;
  for (let x=0;x<W;x+=30) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for (let y=0;y<H;y+=30) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }

  if (!points || points.length === 0) {
    ctx.fillStyle = '#9e9e9e'; ctx.font = '13px Sora,sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Démarrez le tracé pour voir l\'aperçu', W/2, H/2-8);
    ctx.fillStyle='#bdbdbd'; ctx.font='11px Sora,sans-serif';
    ctx.fillText('Le polygone apparaîtra ici en temps réel', W/2, H/2+12);
    return;
  }

  const lats = points.map(p=>parseFloat(p.lat)), lons = points.map(p=>parseFloat(p.lon));
  const minLat=Math.min(...lats), maxLat=Math.max(...lats);
  const minLon=Math.min(...lons), maxLon=Math.max(...lons);
  const pad=28;
  const rangeX = maxLon-minLon || 0.0001, rangeY = maxLat-minLat || 0.0001;
  const scale = Math.min((W-pad*2)/rangeX, (H-pad*2)/rangeY);
  const offX = (W - rangeX*scale)/2, offY = (H - rangeY*scale)/2;
  const tc = (lat,lon) => ({ x: offX+(lon-minLon)*scale, y: H-offY-(lat-minLat)*scale });

  // Filled polygon
  if (points.length >= 3) {
    ctx.beginPath();
    const s = tc(lats[0],lons[0]); ctx.moveTo(s.x,s.y);
    for (let i=1;i<points.length;i++) { const p=tc(lats[i],lons[i]); ctx.lineTo(p.x,p.y); }
    ctx.closePath();
    ctx.fillStyle = 'rgba(46,157,94,0.18)'; ctx.fill();
    ctx.strokeStyle='#2e9d5e'; ctx.lineWidth=2; ctx.setLineDash([]); ctx.stroke();
  } else {
    ctx.beginPath();
    const s=tc(lats[0],lons[0]); ctx.moveTo(s.x,s.y);
    for (let i=1;i<points.length;i++) { const p=tc(lats[i],lons[i]); ctx.lineTo(p.x,p.y); }
    ctx.strokeStyle='#2e9d5e'; ctx.lineWidth=2; ctx.setLineDash([5,4]); ctx.stroke(); ctx.setLineDash([]);
  }

  // Closing dashed line
  if (points.length>=2) {
    const pF=tc(lats[0],lons[0]), pL=tc(lats[points.length-1],lons[points.length-1]);
    ctx.beginPath(); ctx.moveTo(pL.x,pL.y); ctx.lineTo(pF.x,pF.y);
    ctx.strokeStyle='rgba(46,157,94,0.35)'; ctx.lineWidth=1.5; ctx.setLineDash([4,4]); ctx.stroke(); ctx.setLineDash([]);
  }

  // Draw dots
  points.forEach((pt,i) => {
    const {x,y} = tc(parseFloat(pt.lat),parseFloat(pt.lon));
    if (i===0) {
      ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.fillStyle='#1a4a2e'; ctx.fill();
      ctx.fillStyle='#fff'; ctx.font='bold 8px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('S',x,y);
    } else if (i===points.length-1 && trackingActive) {
      ctx.beginPath(); ctx.arc(x,y,9,0,Math.PI*2); ctx.fillStyle='rgba(239,68,68,0.2)'; ctx.fill();
      ctx.beginPath(); ctx.arc(x,y,5,0,Math.PI*2); ctx.fillStyle='#ef4444'; ctx.fill();
    } else {
      ctx.beginPath(); ctx.arc(x,y,3.5,0,Math.PI*2); ctx.fillStyle='#3b82f6'; ctx.fill();
    }
  });

  // Area label
  if (points.length>=3) {
    const areaHa = (estimatePolygonArea(points)/10000).toFixed(4);
    ctx.fillStyle='rgba(26,74,46,0.8)';
    ctx.beginPath(); ctx.roundRect(W/2-58,H-23,116,18,4); ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='bold 11px Sora,sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(`≈ ${areaHa} ha  (${points.length} pts)`, W/2, H-14);
  }
}

// Shoelace on lat/lon → m²
function estimatePolygonArea(points) {
  const R=6371000; let area=0; const n=points.length;
  for (let i=0;i<n;i++) {
    const j=(i+1)%n;
    const la1=parseFloat(points[i].lat)*Math.PI/180, la2=parseFloat(points[j].lat)*Math.PI/180;
    const lo1=parseFloat(points[i].lon)*Math.PI/180, lo2=parseFloat(points[j].lon)*Math.PI/180;
    area+=(lo2-lo1)*(2+Math.sin(la1)+Math.sin(la2));
  }
  return Math.abs(area*R*R/2);
}

// Haversine distance
function distanceMeters(lat1,lon1,lat2,lon2) {
  const R=6371000,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
}

// ── Densité calculator ───────────────────────
function calcDensite() {
  let totalPieds=0, totalTiges=0, n=0;
  for(let i=0;i<4;i++){
    const p=parseFloat(document.querySelector(`[data-field="carre${i}_pieds"]`)?.value||0);
    const t=parseFloat(document.querySelector(`[data-field="carre${i}_tiges"]`)?.value||0);
    if(p>0){totalPieds+=p;totalTiges+=t;n++;}
  }
  const sup=parseFloat(document.querySelector('[data-field="superficie_ha"]')?.value||0);
  const resEl=document.getElementById('densiteResultat');
  const tigesEl=document.getElementById('nbMoyenTigesCalc');
  if(resEl&&sup>0&&n>0){
    resEl.value=Math.round(totalPieds/(n*100)*10000)+' pieds/ha';
    if(tigesEl&&totalPieds>0) tigesEl.value=(totalTiges/totalPieds).toFixed(2);
  } else if(resEl) resEl.value='';
}

// ── Collect form data ─────────────────────────
function collectData() {
  const data = {};
  document.querySelectorAll('#modalBody [data-field]').forEach(el => {
    const k = el.dataset.field; if(!k) return;
    if(el.type==='radio'){if(el.checked)data[k]=el.value;}
    else if(el.type==='checkbox'){if(!data[k])data[k]=[];if(el.checked)data[k].push(el.value);}
    else if(el.value!=='') data[k]=el.value;
  });
  data.polygone = polygonePoints;
  const pvKeys = Object.keys(plageVideData);
  if(pvKeys.length) data.plagesVides_polygones=pvKeys.map(k=>({points:plageVideData[k]}));
  return data;
}

// ── Save / Finish ─────────────────────────────
function saveDraft() {
  const data = collectData();
  const fiches = getFiches();
  if (editingFicheId) {
    const idx = fiches.findIndex(f=>f.id===editingFicheId);
    if(idx>=0){fiches[idx].data=data;fiches[idx].updatedAt=new Date().toISOString();setFiches(fiches);showToast('Brouillon mis à jour ✓','success');closeModal();showPage('drafts');return;}
  }
  fiches.push({id:'f_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),ficheNum:currentFicheNum,userId:currentUser.id,userName:currentUser.name,status:'draft',createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),data});
  setFiches(fiches);
  showToast('Brouillon enregistré ✓','success');
  closeModal(); showPage('drafts');
}

function finishFiche() {
  const cfg = getFieldConfig();
  const data = collectData();
  const missing = Object.entries(cfg).filter(([k,v])=>v.required&&v.visible!==false&&v.type!=='header'&&!data[k]).map(([k,v])=>v.label||k);
  if(missing.length>0){
    showConfirm('Champs obligatoires manquants',`Les champs suivants sont requis :\n• ${missing.join('\n• ')}\n\nVoulez-vous quand même terminer ?`,()=>doFinish(data));
    return;
  }
  showConfirm('Terminer la fiche','Une fois terminée, la fiche ne pourra plus être modifiée. Elle passera en attente de synchronisation. Confirmer ?',()=>doFinish(data));
}

function doFinish(data) {
  const fiches = getFiches();
  if(editingFicheId){
    const idx=fiches.findIndex(f=>f.id===editingFicheId);
    if(idx>=0){fiches[idx].status='pending';fiches[idx].data=data;fiches[idx].finishedAt=new Date().toISOString();setFiches(fiches);showToast('Fiche terminée ✅','success');closeModal();showPage('pending');updateBadges();return;}
  }
  fiches.push({id:'f_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),ficheNum:currentFicheNum,userId:currentUser.id,userName:currentUser.name,status:'pending',createdAt:new Date().toISOString(),finishedAt:new Date().toISOString(),data});
  setFiches(fiches);
  showToast('Fiche terminée ✅','success');
  closeModal(); showPage('pending'); updateBadges();
}

// ── Sync ──────────────────────────────────────
function trySync() {
  if(!navigator.onLine){showToast('Pas de connexion réseau','error');return;}
  const fiches=getFiches(), toSync=fiches.filter(f=>f.status==='pending');
  if(!toSync.length){showToast('Tout est déjà synchronisé ✓','success');return;}
  showToast(`Synchronisation de ${toSync.length} fiche(s)…`);
  // ── Replace this with real API call ──────────
  // Example with Firebase:
  // toSync.forEach(f => db.collection('fiches').doc(f.id).set(f));
  // Example with Supabase:
  // supabase.from('fiches').upsert(toSync);
  // ─────────────────────────────────────────────
  setTimeout(()=>{
    const updated=fiches.map(f=>f.status==='pending'?{...f,status:'synced',syncedAt:new Date().toISOString()}:f);
    setFiches(updated);
    showToast(`${toSync.length} fiche(s) synchronisée(s) ✓`,'success');
    updateBadges();
    const active=document.querySelector('.page.active');
    if(active) showPage(active.id.replace('page-',''));
  },2000);
}

// ── ADMIN ─────────────────────────────────────
function renderAdmin() {
  if(currentUser?.role!=='admin') return '<div class="page-content"><div class="empty-state"><div class="es-icon">🚫</div><p>Accès refusé</p></div></div>';
  return `<div class="page-content">
    ${renderAdminUsers()}
    ${renderAdminFields()}
    ${renderAdminCustomQuestions()}
    ${renderAdminStats()}
  </div>`;
}

function renderAdminUsers() {
  const users = getUsers();
  return `<div class="admin-section">
    <div class="admin-section-title">👥 Gestion des utilisateurs</div>
    ${users.map((u,i)=>`
      <div class="admin-user-card">
        <div class="au-info">
          <div class="au-name">${u.name}</div>
          <div class="au-meta">${u.username} · ${u.role} · ${u.region||''}</div>
        </div>
        <div class="au-actions">
          <span class="status-badge ${u.active!==false?'active':'inactive'}">${u.active!==false?'Actif':'Inactif'}</span>
          <button class="btn-sm ${u.active!==false?'btn-warn':'btn-ok'}" onclick="toggleUser(${i})">${u.active!==false?'Désactiver':'Activer'}</button>
          <button class="btn-sm btn-edit" onclick="editUser(${i})">✏️</button>
          ${i>0?`<button class="btn-sm" style="background:var(--red-100);color:var(--red-500)" onclick="deleteUser(${i})">🗑</button>`:''}
        </div>
      </div>`).join('')}
    <button class="add-row-btn" style="margin-top:10px" onclick="addUser()">➕ Ajouter un utilisateur</button>
  </div>`;
}

function renderAdminFields() {
  const cfg = getFieldConfig();
  const byFiche = {};
  Object.entries(cfg).forEach(([k,v]) => {
    const f = v.fiche || 0;
    if(!byFiche[f]) byFiche[f]=[];
    byFiche[f].push([k,v]);
  });
  let html = `<div class="admin-section">
    <div class="admin-section-title">⚙️ Configuration des questions</div>
    <p class="hint" style="margin-bottom:12px">Pour chaque question : cochez "Obligatoire" pour la rendre requise, décochez "Visible" pour la masquer.</p>`;
  Object.keys(byFiche).sort().forEach(fiche => {
    byFiche[fiche].forEach(([key,v]) => {
      if(v.type==='header') {
        html += `<div class="admin-fiche-header">${v.label}</div>`;
        return;
      }
      html += `<div class="admin-field-row">
        <div class="afield-label">${v.label||key}</div>
        <div class="afield-controls">
          <label class="toggle-label"><input type="checkbox" ${v.required?'checked':''} onchange="setFieldRequired('${key}',this.checked)"><span>Obligatoire</span></label>
          <label class="toggle-label"><input type="checkbox" ${v.visible!==false?'checked':''} onchange="setFieldVisible('${key}',this.checked)"><span>Visible</span></label>
        </div>
      </div>`;
    });
  });
  html += '</div>';
  return html;
}

function renderAdminCustomQuestions() {
  const custom = getCustomQuestions();
  return `<div class="admin-section">
    <div class="admin-section-title">➕ Questions personnalisées</div>
    <p class="hint" style="margin-bottom:12px">Ajoutez vos propres questions qui apparaîtront à la fin de la fiche choisie.</p>
    <div id="customQContainer">
      ${custom.map((q,i)=>renderCustomQRow(q,i)).join('')}
    </div>
    <div class="add-custom-q-form">
      <div class="field-row" style="margin-bottom:8px">
        <div class="field-group">
          <label class="field-label">Fiche</label>
          <select class="field-select" id="newQ_fiche">
            ${Object.entries(FICHE_NAMES).map(([n,name])=>`<option value="${n}">F${n} — ${name}</option>`).join('')}
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Type de réponse</label>
          <select class="field-select" id="newQ_type">
            <option value="text">Texte court</option>
            <option value="textarea">Texte long</option>
            <option value="number">Nombre</option>
            <option value="select">Liste déroulante</option>
            <option value="radio">Choix unique</option>
          </select>
        </div>
      </div>
      <div class="field-group">
        <label class="field-label">Libellé de la question</label>
        <input type="text" class="field-input" id="newQ_label" placeholder="Ex: Avez-vous reçu une formation ?">
      </div>
      <div class="field-group" id="newQ_optionsGroup" style="display:none">
        <label class="field-label">Options (une par ligne)</label>
        <textarea class="field-input textarea" id="newQ_options" placeholder="Option 1&#10;Option 2&#10;Option 3" style="min-height:60px"></textarea>
      </div>
      <div class="field-row">
        <label class="toggle-label" style="padding:8px 0"><input type="checkbox" id="newQ_required"><span>Obligatoire</span></label>
      </div>
      <button class="btn-primary" onclick="addCustomQuestion()" style="margin-top:8px">➕ Ajouter cette question</button>
    </div>
    <script>
      document.getElementById('newQ_type').addEventListener('change', function(){
        document.getElementById('newQ_optionsGroup').style.display = ['select','radio'].includes(this.value)?'':'none';
      });
    <\/script>
  </div>`;
}

function renderCustomQRow(q, i) {
  return `<div class="admin-field-row" data-cq="${i}">
    <div class="afield-label">
      <span class="fiche-tag">F${q.fiche}</span> ${q.label}
      <small style="color:var(--gray-400);display:block">${q.type}${q.required?' · Obligatoire':''}</small>
    </div>
    <div class="au-actions">
      <button class="btn-sm btn-warn" onclick="deleteCustomQuestion(${i})">🗑 Supprimer</button>
    </div>
  </div>`;
}

function getCustomQuestions() {
  try { return JSON.parse(localStorage.getItem('cacaoCollect_customQ')||'[]'); } catch { return []; }
}
function saveCustomQuestions(q) { localStorage.setItem('cacaoCollect_customQ', JSON.stringify(q)); }

function addCustomQuestion() {
  const fiche = document.getElementById('newQ_fiche')?.value;
  const type = document.getElementById('newQ_type')?.value;
  const label = document.getElementById('newQ_label')?.value?.trim();
  const required = document.getElementById('newQ_required')?.checked;
  const optionsRaw = document.getElementById('newQ_options')?.value||'';
  if(!label) { showToast('Le libellé est obligatoire','error'); return; }
  const options = ['select','radio'].includes(type) ? optionsRaw.split('\n').map(o=>o.trim()).filter(Boolean) : [];
  const q = { fiche, type, label, required, options, id:'cq_'+Date.now() };
  const all = getCustomQuestions();
  all.push(q);
  saveCustomQuestions(all);
  // Also register in fieldConfig for required/visible toggle
  const cfg = getFieldConfig();
  cfg[q.id] = { fiche:parseInt(fiche), label, required, visible:true };
  saveFieldConfig(cfg);
  showPage('admin');
  showToast('Question ajoutée ✓','success');
}

function deleteCustomQuestion(i) {
  showConfirm('Supprimer la question','Cette question sera supprimée définitivement. Confirmer ?', ()=>{
    const all = getCustomQuestions();
    const removed = all.splice(i,1)[0];
    saveCustomQuestions(all);
    if(removed?.id) {
      const cfg = getFieldConfig();
      delete cfg[removed.id];
      saveFieldConfig(cfg);
    }
    showPage('admin');
    showToast('Question supprimée','success');
  });
}

function renderAdminStats() {
  const fiches = getFiches();
  const byUser = {};
  fiches.forEach(f=>{byUser[f.userName]=(byUser[f.userName]||0)+1;});
  return `<div class="admin-section">
    <div class="admin-section-title">📊 Statistiques globales</div>
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-card stat-green"><div class="stat-num">${fiches.length}</div><div class="stat-label">Total fiches</div></div>
      <div class="stat-card stat-amber"><div class="stat-num">${fiches.filter(f=>f.status==='draft').length}</div><div class="stat-label">Brouillons</div></div>
      <div class="stat-card stat-blue"><div class="stat-num">${fiches.filter(f=>f.status==='pending').length}</div><div class="stat-label">En attente</div></div>
      <div class="stat-card stat-purple"><div class="stat-num">${fiches.filter(f=>f.status==='synced').length}</div><div class="stat-label">Synchronisées</div></div>
    </div>
    <div class="admin-fiche-header">Fiches par enquêteur</div>
    ${Object.entries(byUser).map(([name,count])=>`
      <div class="admin-field-row">
        <div class="afield-label">${name}</div>
        <span class="status-badge active">${count} fiche(s)</span>
      </div>`).join('')}
    <div style="margin-top:16px">
      <button class="btn-sm btn-edit" onclick="exportAllData()" style="width:100%;padding:12px;font-size:13px">📥 Exporter toutes les données (JSON)</button>
    </div>
  </div>`;
}

function exportAllData() {
  const fiches = getFiches();
  const blob = new Blob([JSON.stringify(fiches, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `cacaocollect_export_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  showToast('Export téléchargé ✓','success');
}

function toggleUser(i) { const u=getUsers(); u[i].active=u[i].active===false?true:false; saveUsers(u); showPage('admin'); showToast(u[i].active?'Utilisateur activé ✓':'Utilisateur désactivé','success'); }
function editUser(i) {
  const u=getUsers();
  const name=prompt('Nom complet:',u[i].name); if(!name)return;
  const pwd=prompt('Nouveau mot de passe (vide = ne pas changer):');
  u[i].name=name; if(pwd) u[i].password=pwd;
  const role=prompt('Rôle (enqueteur/superviseur/admin):',u[i].role)||u[i].role;
  u[i].role=role;
  const region=prompt('Région:',u[i].region||'');
  u[i].region=region;
  saveUsers(u); showPage('admin'); showToast('Utilisateur mis à jour ✓','success');
}
function deleteUser(i) {
  showConfirm('Supprimer l\'utilisateur','Cette action est irréversible. Confirmer ?',()=>{
    const u=getUsers(); u.splice(i,1); saveUsers(u); showPage('admin'); showToast('Utilisateur supprimé','success');
  });
}
function addUser() {
  const username=prompt('Identifiant (login):'); if(!username)return;
  const name=prompt('Nom complet:'); if(!name)return;
  const password=prompt('Mot de passe:'); if(!password)return;
  const role=prompt('Rôle (enqueteur/superviseur/admin):')||'enqueteur';
  const region=prompt('Région:')||'';
  const u=getUsers();
  u.push({id:'u'+Date.now(),username,password,name,role,region,active:true});
  saveUsers(u); showPage('admin'); showToast('Utilisateur ajouté ✓','success');
}
function setFieldRequired(key,val){const c=getFieldConfig();if(!c[key])c[key]={};c[key].required=val;saveFieldConfig(c);}
function setFieldVisible(key,val){const c=getFieldConfig();if(!c[key])c[key]={};c[key].visible=val;saveFieldConfig(c);}

// ── Toast ─────────────────────────────────────
let toastT;
function showToast(msg,type=''){
  const el=document.getElementById('toast');
  el.textContent=msg; el.className='toast'+(type?' '+type:'');
  el.classList.remove('hidden');
  clearTimeout(toastT);
  toastT=setTimeout(()=>el.classList.add('hidden'),3500);
}

// ── Confirm modal ─────────────────────────────
let confirmCb=null;
function showConfirm(title,msg,cb){
  document.getElementById('confirmTitle').textContent=title;
  document.getElementById('confirmMsg').textContent=msg;
  confirmCb=cb;
  document.getElementById('confirmModal').classList.remove('hidden');
  document.getElementById('confirmOk').onclick=()=>{closeConfirm();if(confirmCb)confirmCb();};
}
function closeConfirm(){document.getElementById('confirmModal').classList.add('hidden');confirmCb=null;}
