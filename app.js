/* =============================================
   CACAO COLLECT v2 — LOGIQUE PRINCIPALE
   ============================================= */
'use strict';

let currentUser = null;
let currentFicheNum = null;
let editingFicheId = null;
let polygonePoints = [];
let plageVideData = {};

const DB_KEY = 'cacaoCollect_fiches';
const USER_KEY = 'cacaoCollect_session';

// ── Storage ──────────────────────────────────
function getFiches() { try { return JSON.parse(localStorage.getItem(DB_KEY)||'[]'); } catch { return []; } }
function setFiches(f) { localStorage.setItem(DB_KEY, JSON.stringify(f)); }
function getSession() { try { return JSON.parse(localStorage.getItem(USER_KEY)||'null'); } catch { return null; } }
function setSession(u) { localStorage.setItem(USER_KEY, u ? JSON.stringify(u) : 'null'); }

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
  if (el) { el.textContent = on ? '🟢 En ligne' : '🟡 Hors ligne'; el.className = 'offline-indicator'+(on?'':' offline'); }
  if (note) note.textContent = on ? '' : 'Mode hors ligne — sync différée';
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
  document.getElementById('userAvatar').textContent = init;
  document.getElementById('menuAvatar').textContent = init;
  document.getElementById('menuUsername').textContent = currentUser.name;
  document.getElementById('menuRole').textContent = currentUser.role + (currentUser.region ? ' — ' + currentUser.region : '');
  if (currentUser.role === 'admin') document.getElementById('adminMenuItem').classList.remove('hidden');
  showPage('dashboard');
  updateStatus();
}
function doLogin() {
  const u = document.getElementById('loginUsername').value.trim();
  const p = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginError');
  const users = getUsers();
  const found = users.find(x => x.username === u && x.password === p && x.active !== false);
  if (!found) { err.textContent = 'Identifiant ou mot de passe incorrect.'; err.classList.remove('hidden'); return; }
  err.classList.add('hidden');
  currentUser = found;
  setSession(found);
  showApp();
}
function doLogout() {
  currentUser = null; setSession(null); hideMenu(); showLogin();
}
['loginUsername','loginPassword'].forEach(id => {
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById(id)?.addEventListener('keypress', e => { if(e.key==='Enter') doLogin(); });
  });
});

// ── Pages ─────────────────────────────────────
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const pg = document.getElementById('page-' + id);
  if (pg) { pg.classList.add('active'); pg.innerHTML = renderPage(id); }
  const titles = { dashboard:'Tableau de bord', newFiche:'Nouvelle fiche', drafts:'Brouillons', pending:'Attente de synchronisation', fiches:'Fiches synchronisées', admin:'Administration' };
  document.getElementById('topbarTitle').textContent = titles[id] || '';
  updateBadges();
}
function setNav(btn) { document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); }
function showMenu() { document.getElementById('sideMenu').classList.add('open'); document.getElementById('menuOverlay').classList.remove('hidden'); }
function hideMenu() { document.getElementById('sideMenu').classList.remove('open'); document.getElementById('menuOverlay').classList.add('hidden'); }

function renderPage(id) {
  const fiches = getFiches().filter(f => currentUser.role==='admin'||currentUser.role==='superviseur' ? true : f.userId===currentUser.id);
  switch(id) {
    case 'dashboard': return renderDashboard(fiches);
    case 'newFiche': return renderNewFiche();
    case 'drafts': return renderList(fiches.filter(f=>f.status==='draft'), 'Brouillons', '📝', true);
    case 'pending': return renderList(fiches.filter(f=>f.status==='pending'), 'Attente de sync', '⏳', false);
    case 'fiches': return renderList(fiches.filter(f=>f.status==='synced'), 'Synchronisées', '✅', false);
    case 'admin': return renderAdmin();
    default: return '';
  }
}

function updateBadges() {
  const fiches = getFiches().filter(f => currentUser ? f.userId===currentUser.id : false);
  const pending = fiches.filter(f=>f.status==='pending').length;
  const el = document.getElementById('pendingCount');
  const badge = document.getElementById('menuPendingBadge');
  if (el) { el.textContent = pending; el.classList.toggle('hidden', pending===0); }
  if (badge) { badge.textContent = pending; badge.classList.toggle('hidden', pending===0); }
}

// ── Dashboard ─────────────────────────────────
function renderDashboard(fiches) {
  const today = new Date().toDateString();
  const stats = {
    total: fiches.length,
    drafts: fiches.filter(f=>f.status==='draft').length,
    pending: fiches.filter(f=>f.status==='pending').length,
    synced: fiches.filter(f=>f.status==='synced').length,
    today: fiches.filter(f=>new Date(f.createdAt).toDateString()===today).length,
  };
  const hour = new Date().getHours();
  const greet = hour<12?'Bonjour':hour<18?'Bon après-midi':'Bonsoir';
  const dateStr = new Date().toLocaleDateString('fr-FR',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
  const recent = fiches.slice(-5).reverse();

  return `
    <div class="page-content">
      <div class="dashboard-hero">
        <div class="hero-greeting">${greet}, ${currentUser.name.split(' ')[0]} 👋</div>
        <div class="hero-date">${dateStr}</div>
      </div>
      <div class="stats-grid">
        <div class="stat-card stat-green"><div class="stat-num">${stats.total}</div><div class="stat-label">Fiches total</div></div>
        <div class="stat-card stat-amber"><div class="stat-num">${stats.drafts}</div><div class="stat-label">Brouillons</div></div>
        <div class="stat-card stat-blue"><div class="stat-num">${stats.pending}</div><div class="stat-label">En attente sync</div></div>
        <div class="stat-card stat-purple"><div class="stat-num">${stats.today}</div><div class="stat-label">Aujourd'hui</div></div>
      </div>
      <div class="section-title">Actions rapides</div>
      <div class="quick-actions">
        <button class="quick-btn" onclick="showPage('newFiche');setNav(document.querySelectorAll('.nav-btn')[1])"><span class="qb-icon">📝</span><span>Nouvelle fiche</span></button>
        <button class="quick-btn" onclick="showPage('drafts')"><span class="qb-icon">💾</span><span>Brouillons</span></button>
        <button class="quick-btn" onclick="trySync()"><span class="qb-icon">☁️</span><span>Synchroniser</span></button>
      </div>
      <div class="section-title">Fiches récentes</div>
      ${recent.length === 0
        ? '<div class="empty-state"><div class="es-icon">📭</div><p>Aucune fiche pour l\'instant</p></div>'
        : recent.map(f => ficheListItem(f, f.status==='draft')).join('')}
    </div>`;
}

// ── Fiche list ────────────────────────────────
function ficheListItem(f, editable=false) {
  const statusLabel = {draft:'Brouillon',pending:'En attente',synced:'Synchronisée'}[f.status]||f.status;
  const title = f.data?.nomProducteur || f.data?.gpsVillage || 'Sans titre';
  return `<div class="recent-item" onclick="${editable?`openFiche(${f.ficheNum},'${f.id}')`:f.status==='pending'?'':''}">
    <div class="ri-badge">F${f.ficheNum}</div>
    <div class="ri-info">
      <div class="ri-title">${title}</div>
      <div class="ri-sub">${new Date(f.createdAt).toLocaleDateString('fr-FR')} — ${FICHE_NAMES[f.ficheNum]||''} — ${f.userName||''}</div>
    </div>
    <div class="ri-status ${f.status}">${statusLabel}</div>
  </div>`;
}

function renderList(fiches, title, icon, editable) {
  const search = '';
  return `<div class="page-content">
    <div class="search-bar"><input type="search" placeholder="Rechercher…" oninput="filterList(this.value)"></div>
    <div id="listContainer">
      ${fiches.length === 0
        ? `<div class="empty-state"><div class="es-icon">${icon}</div><p>Aucune fiche dans cette section</p></div>`
        : fiches.slice().reverse().map(f => ficheListItem(f, editable)).join('')}
    </div>
    ${!editable && fiches.length > 0 && fiches[0]?.status==='pending'
      ? `<button class="btn-primary" style="margin-top:16px" onclick="trySync()">☁️ Synchroniser tout</button>`
      : ''}
  </div>`;
}

// ── New Fiche ─────────────────────────────────
function renderNewFiche() {
  return `<div class="page-content">
    <div class="section-title" style="margin-bottom:12px">Choisir une fiche</div>
    <div class="fiche-cards">
      ${Object.entries(FICHE_NAMES).map(([num,name]) => `
        <div class="fiche-card" onclick="openFiche(${num})">
          <div class="fc-num">F${num}</div>
          <div class="fc-info"><div class="fc-title">${name}</div></div>
          <div class="fc-arrow">›</div>
        </div>`).join('')}
    </div>
  </div>`;
}

// ── Open / Close Modal ────────────────────────
function openFiche(num, ficheId=null) {
  currentFicheNum = num;
  editingFicheId = ficheId;
  polygonePoints = [];
  plageVideData = {};

  let data = {};
  let isReadOnly = false;
  if (ficheId) {
    const f = getFiches().find(x => x.id === ficheId);
    if (f) {
      data = f.data || {};
      polygonePoints = data.polygone || [];
      isReadOnly = f.status === 'pending' || f.status === 'synced';
    }
  }

  document.getElementById('modalTitle').textContent = `Fiche ${num} — ${FICHE_NAMES[num]}`;
  document.getElementById('modalBody').innerHTML = buildForm(num, data);
  document.getElementById('ficheModal').classList.remove('hidden');
  document.getElementById('btnDraft').style.display = isReadOnly ? 'none' : '';
  document.getElementById('btnFinish').style.display = isReadOnly ? 'none' : '';

  if (isReadOnly) {
    document.getElementById('ficheModal').querySelectorAll('input,select,textarea,button:not(.btn-icon)').forEach(el => el.disabled = true);
    document.getElementById('modalTitle').insertAdjacentHTML('afterend', '<div class="readonly-banner">🔒 Fiche terminée — lecture seule</div>');
  }

  initInteractions();
}

function buildForm(num, data) {
  switch(num) {
    case 1: case '1': return buildFiche1(data);
    case 2: case '2': return buildFiche2(data);
    case 3: case '3': return buildFiche3(data);
    case 4: case '4': return buildFiche4(data);
    default: return '<p style="padding:20px">Fiche non disponible</p>';
  }
}

function closeModal() {
  document.getElementById('ficheModal').classList.add('hidden');
  editingFicheId = null; currentFicheNum = null;
}

// ── Interactions ──────────────────────────────
function initInteractions() {
  // Radio buttons
  document.querySelectorAll('.radio-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const name = opt.querySelector('input')?.name;
      document.querySelectorAll(`.radio-opt input[name="${name}"]`).forEach(i => i.closest('.radio-opt').classList.remove('selected'));
      opt.classList.add('selected');
      const inp = opt.querySelector('input'); if (inp) inp.checked = true;

      // Show/hide plage vide section
      if (name === 'plagesVides') {
        const val = inp?.value;
        const sec = document.getElementById('plageVideSection');
        if (sec) sec.classList.toggle('hidden', !['beaucoup','grande'].includes(val));
      }
    });
  });

  // Culture "Autre" reveal
  document.querySelectorAll('[data-field$="_culture"]').forEach(sel => {
    sel.addEventListener('change', function() {
      const i = this.dataset.field.match(/p(\d+)_culture/)?.[1];
      if (i !== undefined) {
        document.getElementById(`p${i}_autreBox`)?.classList.toggle('hidden', this.value !== 'Autre');
      }
    });
  });

  // Fermentation / Séchage "Autre"
  document.querySelector('[data-field="modeFermentation"]')?.addEventListener('change', function() {
    document.getElementById('fermentAutreBox')?.classList.toggle('hidden', this.value !== 'autre');
  });
  document.querySelector('[data-field="methodeSechage"]')?.addEventListener('change', function() {
    document.getElementById('sechageAutreBox')?.classList.toggle('hidden', this.value !== 'autre');
  });
}

// ── Dynamic row adders ────────────────────────
function addMenage() {
  const c = document.getElementById('menageRows'); if (!c) return;
  const i = c.querySelectorAll('.sub-card').length;
  c.insertAdjacentHTML('beforeend', buildMenageRow({}, i));
}
function addParcelle() {
  const c = document.getElementById('parcelleRows'); if (!c) return;
  const i = c.querySelectorAll('.sub-card').length;
  c.insertAdjacentHTML('beforeend', buildParcelleRow({}, i));
}
function addArbre() {
  const c = document.getElementById('arbreRows'); if (!c) return;
  const i = c.querySelectorAll('.sub-card').length;
  c.insertAdjacentHTML('beforeend', buildArbreRow({}, i));
}
function addEngrais() {
  const c = document.getElementById('engraisRows'); if (!c) return;
  const i = c.querySelectorAll('.sub-card').length;
  c.insertAdjacentHTML('beforeend', buildEngraisRow({}, i));
}
function addPhyto() {
  const c = document.getElementById('phytoRows'); if (!c) return;
  const i = c.querySelectorAll('.sub-card').length;
  c.insertAdjacentHTML('beforeend', buildPhytoRow({}, i));
}
function addEpargne() {
  const c = document.getElementById('epargneRows'); if (!c) return;
  const i = c.querySelectorAll('.sub-card').length;
  c.insertAdjacentHTML('beforeend', buildEpargneRow({custom:true}, i));
}
function addRevenu() {
  const c = document.getElementById('revenusRows'); if (!c) return;
  const i = c.querySelectorAll('.sub-card').length;
  c.insertAdjacentHTML('beforeend', buildRevenuRow({custom:true}, i));
}
function addMO() {
  const c = document.getElementById('moRows'); if (!c) return;
  const i = c.querySelectorAll('.sub-card').length;
  c.insertAdjacentHTML('beforeend', buildMORow({}, i));
}
function addEquip() {
  const c = document.getElementById('equipRows'); if (!c) return;
  const i = c.querySelectorAll('.sub-card').length;
  c.insertAdjacentHTML('beforeend', buildEquipRow({custom:true,nom:'',type:'Autre'}, i));
}
function addPlageVide() {
  const c = document.getElementById('plageVideRows'); if (!c) return;
  const i = c.querySelectorAll('.sub-card').length;
  c.insertAdjacentHTML('beforeend', buildPlageVideRow({}, i));
}

// ── GPS ───────────────────────────────────────
function captureGPS(latField, lonField, accId) {
  if (!navigator.geolocation) { showToast('GPS non disponible', 'error'); return; }
  showToast('Acquisition GPS en cours…');
  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude.toFixed(8);
    const lon = pos.coords.longitude.toFixed(8);
    const acc = pos.coords.accuracy.toFixed(1);
    const latEl = document.getElementById('inp_'+latField) || document.querySelector(`[data-field="${latField}"]`);
    const lonEl = document.getElementById('inp_'+lonField) || document.querySelector(`[data-field="${lonField}"]`);
    if (latEl) { latEl.value = lat; latEl.dataset.field = latField; }
    if (lonEl) { lonEl.value = lon; lonEl.dataset.field = lonField; }
    const accEl = document.getElementById(accId);
    if (accEl) accEl.textContent = `Précision: ±${acc} m`;
    showToast(`GPS: ${lat}, ${lon} (±${acc}m)`, 'success');
  }, err => {
    showToast('Erreur GPS: ' + (err.code===1?'Accès refusé':err.message), 'error');
  }, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
}

function addPolygonePoint() {
  if (!navigator.geolocation) { showToast('GPS non disponible', 'error'); return; }
  showToast('Acquisition GPS pour polygone…');
  navigator.geolocation.getCurrentPosition(pos => {
    const pt = {
      lat: pos.coords.latitude.toFixed(8),
      lon: pos.coords.longitude.toFixed(8),
      acc: pos.coords.accuracy.toFixed(1),
    };
    polygonePoints.push(pt);
    const c = document.getElementById('polygonePoints');
    if (c) c.innerHTML = buildPolygonePoints(polygonePoints);
    const cnt = document.getElementById('polygoneCount');
    if (cnt) cnt.textContent = `${polygonePoints.length} point(s)`;
    showToast(`Point ${polygonePoints.length} ajouté ±${pt.acc}m`, 'success');
  }, err => showToast('Erreur GPS', 'error'), { enableHighAccuracy: true, timeout: 15000 });
}

function removePolygonePoint(i) {
  polygonePoints.splice(i, 1);
  const c = document.getElementById('polygonePoints');
  if (c) c.innerHTML = buildPolygonePoints(polygonePoints);
  const cnt = document.getElementById('polygoneCount');
  if (cnt) cnt.textContent = `${polygonePoints.length} point(s)`;
}

function addPlagePoint(plageIdx) {
  if (!navigator.geolocation) { showToast('GPS non disponible', 'error'); return; }
  showToast('Acquisition GPS…');
  navigator.geolocation.getCurrentPosition(pos => {
    if (!plageVideData[plageIdx]) plageVideData[plageIdx] = [];
    const pt = { lat: pos.coords.latitude.toFixed(8), lon: pos.coords.longitude.toFixed(8), acc: pos.coords.accuracy.toFixed(1) };
    plageVideData[plageIdx].push(pt);
    const c = document.getElementById(`plagePoints_${plageIdx}`);
    if (c) c.innerHTML = buildPlagePoints(plageIdx, plageVideData[plageIdx]);
    const cnt = document.getElementById(`plageCount_${plageIdx}`);
    if (cnt) cnt.textContent = `${plageVideData[plageIdx].length} point(s)`;
    showToast(`Point ajouté ±${pt.acc}m`, 'success');
  }, err => showToast('Erreur GPS', 'error'), { enableHighAccuracy: true, timeout: 15000 });
}

// ── Densité calculator ───────────────────────
function calcDensite() {
  let totalPieds = 0, totalTiges = 0, carre_count = 0;
  for (let i=0; i<4; i++) {
    const p = parseFloat(document.querySelector(`[data-field="carre${i}_pieds"]`)?.value||0);
    const t = parseFloat(document.querySelector(`[data-field="carre${i}_tiges"]`)?.value||0);
    if (p > 0) { totalPieds += p; totalTiges += t; carre_count++; }
  }
  const sup = parseFloat(document.querySelector('[data-field="superficie_ha"]')?.value||0);
  const resEl = document.getElementById('densiteResultat');
  const nbTigesEl = document.getElementById('nbMoyenTigesCalc');
  if (resEl && sup > 0 && carre_count > 0) {
    // Surface totale des carrés = carre_count * 100 m²
    const poids_ha = totalPieds / (carre_count * 100) * 10000;
    resEl.value = Math.round(poids_ha) + ' pieds/ha';
    if (nbTigesEl && totalPieds > 0) nbTigesEl.value = (totalTiges/totalPieds).toFixed(2);
  } else if (resEl) { resEl.value = ''; }
}

// ── Collect form data ─────────────────────────
function collectData() {
  const data = {};
  document.querySelectorAll('#modalBody [data-field]').forEach(el => {
    const k = el.dataset.field;
    if (!k) return;
    if (el.type === 'radio') { if (el.checked) data[k] = el.value; }
    else if (el.type === 'checkbox') { if (!data[k]) data[k]=[]; if (el.checked) data[k].push(el.value); }
    else if (el.value !== '') data[k] = el.value;
  });
  data.polygone = polygonePoints;
  // Collect plage vide polygons
  const pvKeys = Object.keys(plageVideData);
  if (pvKeys.length) data.plagesVides_polygones = pvKeys.map(k => ({points: plageVideData[k]}));
  return data;
}

// ── Save draft ────────────────────────────────
function saveDraft() {
  const data = collectData();
  const fiches = getFiches();
  if (editingFicheId) {
    const idx = fiches.findIndex(f=>f.id===editingFicheId);
    if (idx>=0) { fiches[idx].data = data; fiches[idx].updatedAt = new Date().toISOString(); setFiches(fiches); showToast('Brouillon mis à jour ✓','success'); closeModal(); showPage('drafts'); return; }
  }
  const fiche = {
    id: 'f_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
    ficheNum: currentFicheNum,
    userId: currentUser.id,
    userName: currentUser.name,
    status: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    data,
  };
  fiches.push(fiche);
  setFiches(fiches);
  showToast('Brouillon enregistré ✓','success');
  closeModal();
  showPage('drafts');
}

// ── Finish fiche ──────────────────────────────
function finishFiche() {
  const cfg = getFieldConfig();
  const data = collectData();
  // Check required fields
  const missing = [];
  Object.entries(cfg).forEach(([k,v]) => {
    if (v.required && v.visible !== false && !data[k]) missing.push(v.label || k);
  });
  if (missing.length > 0) {
    showConfirm('Champs obligatoires manquants', `Les champs suivants sont requis:\n• ${missing.join('\n• ')}\n\nVoulez-vous quand même marquer la fiche comme terminée ?`, () => doFinishFiche(data));
    return;
  }
  showConfirm('Terminer la fiche', 'Une fois terminée, la fiche ne pourra plus être modifiée et passera en attente de synchronisation. Confirmer ?', () => doFinishFiche(data));
}

function doFinishFiche(data) {
  const fiches = getFiches();
  if (editingFicheId) {
    const idx = fiches.findIndex(f=>f.id===editingFicheId);
    if (idx>=0) { fiches[idx].status='pending'; fiches[idx].data=data; fiches[idx].finishedAt=new Date().toISOString(); setFiches(fiches); showToast('Fiche terminée ✅','success'); closeModal(); showPage('pending'); return; }
  }
  const fiche = {
    id: 'f_'+Date.now()+'_'+Math.random().toString(36).slice(2,6),
    ficheNum: currentFicheNum,
    userId: currentUser.id,
    userName: currentUser.name,
    status: 'pending',
    createdAt: new Date().toISOString(),
    finishedAt: new Date().toISOString(),
    data,
  };
  fiches.push(fiche);
  setFiches(fiches);
  showToast('Fiche terminée ✅','success');
  closeModal();
  showPage('pending');
  updateBadges();
}

// ── Sync ──────────────────────────────────────
function trySync() {
  if (!navigator.onLine) { showToast('Pas de connexion réseau','error'); return; }
  const fiches = getFiches();
  const toSync = fiches.filter(f=>f.status==='pending');
  if (!toSync.length) { showToast('Tout est déjà synchronisé ✓','success'); return; }
  showToast(`Synchronisation de ${toSync.length} fiche(s)…`);
  // Replace this with real API call to your backend
  setTimeout(() => {
    const updated = fiches.map(f => f.status==='pending' ? {...f, status:'synced', syncedAt:new Date().toISOString()} : f);
    setFiches(updated);
    showToast(`${toSync.length} fiche(s) synchronisée(s) ✓`,'success');
    updateBadges();
    const pg = document.querySelector('.page.active');
    if (pg) { const pgId = pg.id.replace('page-',''); showPage(pgId); }
  }, 2500);
}

// ── Admin Panel ───────────────────────────────
function renderAdmin() {
  if (currentUser?.role !== 'admin') return '<div class="page-content"><div class="empty-state"><div class="es-icon">🚫</div><p>Accès refusé</p></div></div>';
  const users = getUsers();
  const cfg = getFieldConfig();
  return `<div class="page-content">
    ${renderAdminUsers(users)}
    ${renderAdminFields(cfg)}
    ${renderAdminStats()}
  </div>`;
}

function renderAdminUsers(users) {
  return `
    <div class="admin-section">
      <div class="admin-section-title">👥 Gestion des utilisateurs</div>
      <div id="usersContainer">
        ${users.map((u,i) => `
          <div class="admin-user-card">
            <div class="au-info">
              <div class="au-name">${u.name}</div>
              <div class="au-meta">${u.username} · ${u.role} · ${u.region||''}</div>
            </div>
            <div class="au-actions">
              <span class="status-badge ${u.active!==false?'active':'inactive'}">${u.active!==false?'Actif':'Inactif'}</span>
              <button class="btn-sm ${u.active!==false?'btn-warn':'btn-ok'}" onclick="toggleUser(${i})">${u.active!==false?'Désactiver':'Activer'}</button>
              <button class="btn-sm btn-edit" onclick="editUser(${i})">✏️</button>
            </div>
          </div>`).join('')}
      </div>
      <button class="add-row-btn" onclick="addUser()" style="margin-top:10px">➕ Ajouter un utilisateur</button>
    </div>`;
}

function renderAdminFields(cfg) {
  return `
    <div class="admin-section">
      <div class="admin-section-title">⚙️ Configuration des questions</div>
      <p class="hint">Cochez les questions obligatoires. Décochez pour les rendre optionnelles. Masquer pour les cacher.</p>
      <div id="fieldsContainer">
        ${Object.entries(cfg).map(([key, v]) => `
          <div class="admin-field-row">
            <div class="afield-label">${v.label||key}</div>
            <div class="afield-controls">
              <label class="toggle-label">
                <input type="checkbox" ${v.required?'checked':''} onchange="setFieldRequired('${key}',this.checked)">
                <span>Obligatoire</span>
              </label>
              <label class="toggle-label">
                <input type="checkbox" ${v.visible!==false?'checked':''} onchange="setFieldVisible('${key}',this.checked)">
                <span>Visible</span>
              </label>
            </div>
          </div>`).join('')}
      </div>
    </div>`;
}

function renderAdminStats() {
  const fiches = getFiches();
  const byUser = {};
  fiches.forEach(f => { byUser[f.userName] = (byUser[f.userName]||0)+1; });
  return `
    <div class="admin-section">
      <div class="admin-section-title">📊 Statistiques globales</div>
      <div class="stats-grid" style="margin-bottom:16px">
        <div class="stat-card stat-green"><div class="stat-num">${fiches.length}</div><div class="stat-label">Total fiches</div></div>
        <div class="stat-card stat-amber"><div class="stat-num">${fiches.filter(f=>f.status==='draft').length}</div><div class="stat-label">Brouillons</div></div>
        <div class="stat-card stat-blue"><div class="stat-num">${fiches.filter(f=>f.status==='pending').length}</div><div class="stat-label">En attente</div></div>
        <div class="stat-card stat-purple"><div class="stat-num">${fiches.filter(f=>f.status==='synced').length}</div><div class="stat-label">Synchronisées</div></div>
      </div>
      <div class="admin-section-title" style="font-size:12px">Fiches par enquêteur</div>
      ${Object.entries(byUser).map(([name, count]) => `
        <div class="admin-field-row">
          <div class="afield-label">${name}</div>
          <div class="afield-controls"><span class="status-badge active">${count} fiche(s)</span></div>
        </div>`).join('')}
    </div>`;
}

function toggleUser(i) {
  const users = getUsers();
  users[i].active = users[i].active === false ? true : false;
  saveUsers(users);
  showPage('admin');
  showToast(users[i].active ? 'Utilisateur activé ✓' : 'Utilisateur désactivé','success');
}

function editUser(i) {
  const users = getUsers();
  const u = users[i];
  const name = prompt('Nom complet:', u.name);
  if (!name) return;
  const pwd = prompt('Nouveau mot de passe (laisser vide pour ne pas changer):');
  users[i].name = name;
  if (pwd) users[i].password = pwd;
  saveUsers(users);
  showPage('admin');
  showToast('Utilisateur mis à jour ✓','success');
}

function addUser() {
  const username = prompt('Identifiant (login):');
  if (!username) return;
  const name = prompt('Nom complet:');
  if (!name) return;
  const password = prompt('Mot de passe:');
  if (!password) return;
  const role = prompt('Rôle (enqueteur/superviseur/admin):') || 'enqueteur';
  const region = prompt('Région:') || '';
  const users = getUsers();
  users.push({ id:'u'+Date.now(), username, password, name, role, region, active:true });
  saveUsers(users);
  showPage('admin');
  showToast('Utilisateur ajouté ✓','success');
}

function setFieldRequired(key, val) {
  const cfg = getFieldConfig();
  if (!cfg[key]) cfg[key] = {};
  cfg[key].required = val;
  saveFieldConfig(cfg);
}
function setFieldVisible(key, val) {
  const cfg = getFieldConfig();
  if (!cfg[key]) cfg[key] = {};
  cfg[key].visible = val;
  saveFieldConfig(cfg);
}

// ── Toast ─────────────────────────────────────
let toastT;
function showToast(msg, type='') {
  const el = document.getElementById('toast');
  el.textContent = msg; el.className = 'toast'+(type?' '+type:'');
  el.classList.remove('hidden');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.add('hidden'), 3500);
}

// ── Confirm modal ─────────────────────────────
let confirmCb = null;
function showConfirm(title, msg, cb) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = msg;
  confirmCb = cb;
  document.getElementById('confirmModal').classList.remove('hidden');
  document.getElementById('confirmOk').onclick = () => { closeConfirm(); if(confirmCb) confirmCb(); };
}
function closeConfirm() { document.getElementById('confirmModal').classList.add('hidden'); confirmCb = null; }
