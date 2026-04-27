/* =============================================
   CACAO COLLECT v2 — CONSTRUCTEURS DE FORMULAIRES
   ============================================= */

// ── Helpers HTML ──────────────────────────────

function fld(label, key, type='text', value='', opts={}) {
  const cfg = getFieldConfig()[key] || {};
  if (cfg.visible === false) return '';
  const req = cfg.required ? '<span class="req">*</span>' : '';
  const v = value ?? '';

  if (type === 'select') {
    const options = (opts.options||[]).map(o =>
      `<option value="${o.v}" ${v===o.v?'selected':''}>${o.l}</option>`).join('');
    return `<div class="field-group">
      <label class="field-label">${label}${req}</label>
      <select class="field-select" data-field="${key}" ${cfg.required?'required':''}>
        <option value="">-- Choisir --</option>${options}
      </select></div>`;
  }
  if (type === 'radio') {
    const radios = (opts.options||[]).map(o =>
      `<label class="radio-opt ${v===o.v?'selected':''}">
        <input type="radio" name="${key}" data-field="${key}" value="${o.v}" ${v===o.v?'checked':''}>${o.l}
      </label>`).join('');
    return `<div class="field-group">
      <label class="field-label">${label}${req}</label>
      <div class="radio-group">${radios}</div></div>`;
  }
  if (type === 'textarea') {
    return `<div class="field-group">
      <label class="field-label">${label}${req}</label>
      <textarea class="field-input textarea" data-field="${key}" placeholder="${opts.placeholder||''}">${v}</textarea>
    </div>`;
  }
  const readonly = opts.readonly ? 'readonly class="field-input readonly-field"' : 'class="field-input"';
  return `<div class="field-group">
    <label class="field-label">${label}${req}</label>
    <input type="${type}" ${readonly} data-field="${key}" value="${v}" placeholder="${opts.placeholder||''}">
  </div>`;
}

function row2(a, b) { return `<div class="field-row">${a}${b}</div>`; }
function sec(title, icon='') { return `<div class="section-header">${icon} ${title}</div>`; }

// ── GPS Capture ───────────────────────────────
function gpsButton(latField, lonField, locked=true) {
  return `
    <div class="gps-group">
      ${row2(
        `<div class="field-group"><label class="field-label">Latitude${locked?'<span class="req"> 🔒</span>':''}</label>
          <input type="text" class="field-input${locked?' readonly-field':''}" data-field="${latField}" id="inp_${latField}" placeholder="0.00000000" ${locked?'readonly':''}>
        </div>`,
        `<div class="field-group"><label class="field-label">Longitude${locked?'<span class="req"> 🔒</span>':''}</label>
          <input type="text" class="field-input${locked?' readonly-field':''}" data-field="${lonField}" id="inp_${lonField}" placeholder="0.00000000" ${locked?'readonly':''}>
        </div>`
      )}
      <div class="gps-row">
        <button class="gps-btn" onclick="captureGPS('${latField}','${lonField}','gps_acc_${latField}')">
          📍 Capturer position GPS
        </button>
        <span class="gps-acc" id="gps_acc_${latField}"></span>
      </div>
    </div>`;
}

// ── FICHE 1 ───────────────────────────────────
function buildFiche1(d={}) {
  return `
    ${sec('Informations de l\'enquête','📅')}
    ${row2(fld('Date','date','date',d.date), fld('Nom enquêteur','nomEnqueteur','text',d.nomEnqueteur,{placeholder:'Nom complet'}))}
    ${row2(fld('Contact enquêteur','contactEnqueteur','tel',d.contactEnqueteur), fld('Qualification','qualification','text',d.qualification))}

    ${sec('Identité du producteur','👤')}
    ${fld('Nom et prénoms du producteur','nomProducteur','text',d.nomProducteur,{placeholder:'Nom complet'})}
    ${row2(fld('Code National Producteur (CCC)','codeNational','text',d.codeNational), fld('Code groupe','codeGroupe','text',d.codeGroupe))}
    ${row2(fld('Nom Entité Reconnue','nomEntite','text',d.nomEntite), fld('Code coopérative','codeCooperative','text',d.codeCooperative))}

    ${sec('Localisation','📍')}
    ${row2(fld('Délégation Régionale','delegation','text',d.delegation), fld('Département','departement','text',d.departement))}
    ${row2(fld('Sous-Préfecture','sousPrefecture','text',d.sousPrefecture), fld('Village','village','text',d.village))}
    ${fld('Campement','campement','text',d.campement)}

    ${sec('Membres du ménage','👨‍👩‍👧')}
    <div id="menageRows">${buildMenageRows(d.menage||[{}])}</div>
    <button class="add-row-btn" onclick="addMenage()">➕ Ajouter un membre</button>

    <div class="legend-box">
      <b>Statut Famille:</b> 1.Chef de ménage 2.Conjoint 3.Enfant 4.Autre<br>
      <b>Statut Plantation:</b> 1.Aucun 2.Propriétaire 3.Gérant 4.MO permanent 5.MO Temporaire<br>
      <b>Niveau d'instruction:</b> 1.Aucun 2.Préscolaire 3.Primaire 4.Secondaire 5.Supérieur 6.Autre<br>
      <b>Catégorie ethnique:</b> 1.Autochtone 2.Allochtone 3.Allogène
    </div>
    ${buildCustomQuestionsSection(1)}`;
}

function buildMenageRows(rows) {
  return rows.map((r,i) => buildMenageRow(r,i)).join('');
}
function buildMenageRow(r={}, i=0) {
  return `<div class="sub-card" data-menage="${i}">
    <div class="sub-card-header">Membre ${i+1}${i>0?`<span class="del-btn" onclick="this.closest('[data-menage]').remove()">🗑</span>`:''}</div>
    ${fld('Nom & prénoms',`m${i}_nom`,'text',r.nom)}
    ${row2(
      fld('Statut famille',`m${i}_famille`,'select',r.famille,{options:[{v:'1',l:'1. Chef ménage'},{v:'2',l:'2. Conjoint'},{v:'3',l:'3. Enfant'},{v:'4',l:'4. Autre'}]}),
      fld('Statut plantation',`m${i}_plantation`,'select',r.plantation,{options:[{v:'1',l:'1. Aucun'},{v:'2',l:'2. Propriétaire'},{v:'3',l:'3. Gérant'},{v:'4',l:'4. MO perm.'},{v:'5',l:'5. MO temp.'}]})
    )}
    ${row2(
      fld('Statut scolaire',`m${i}_scolaire`,'select',r.scolaire,{options:[{v:'1',l:'1. Scolarisé'},{v:'2',l:'2. Déscolarisé'}]}),
      fld('Téléphone',`m${i}_tel`,'tel',r.tel)
    )}
    ${row2(
      fld('Année naissance',`m${i}_annee`,'number',r.annee,{placeholder:'ex: 1990'}),
      fld('Sexe',`m${i}_sexe`,'select',r.sexe,{options:[{v:'M',l:'Masculin'},{v:'F',l:'Féminin'}]})
    )}
    ${row2(
      fld('Niveau instruction',`m${i}_niveau`,'select',r.niveau,{options:[{v:'1',l:'1. Aucun'},{v:'2',l:'2. Préscolaire'},{v:'3',l:'3. Primaire'},{v:'4',l:'4. Secondaire'},{v:'5',l:'5. Supérieur'},{v:'6',l:'6. Autre'}]}),
      fld('Catégorie ethnique',`m${i}_ethnie`,'select',r.ethnie,{options:[{v:'1',l:'1. Autochtone'},{v:'2',l:'2. Allochtone'},{v:'3',l:'3. Allogène'}]})
    )}
  </div>`;
}

// ── CUSTOM QUESTIONS (injected by admin) ──────
function buildCustomQuestionsSection(ficheNum) {
  const custom = (typeof getCustomQuestions === 'function') ? getCustomQuestions().filter(q=>parseInt(q.fiche)===ficheNum) : [];
  if (!custom.length) return '';
  return sec('Questions supplémentaires','📋') + custom.map(q => {
    if (q.type === 'textarea') return fld(q.label, q.id, 'textarea', '', { placeholder: 'Votre réponse…' });
    if (q.type === 'number') return fld(q.label, q.id, 'number', '');
    if (q.type === 'select' && q.options?.length) {
      return fld(q.label, q.id, 'select', '', { options: q.options.map(o=>({v:o,l:o})) });
    }
    if (q.type === 'radio' && q.options?.length) {
      return fld(q.label, q.id, 'radio', '', { options: q.options.map(o=>({v:o,l:o})) });
    }
    return fld(q.label, q.id, 'text', '', { placeholder: 'Votre réponse…' });
  }).join('');
}
function buildFiche2(d={}) {
  return `
    ${sec('Coordonnées GPS de la cacaoyère','🌍')}
    ${gpsButton('gpsLat','gpsLon', true)}
    ${row2(fld('Sous-Préfecture','gpsSousPref','text',d.gpsSousPref), fld('Village','gpsVillage','text',d.gpsVillage))}
    ${fld('Campement','gpsCampement','text',d.gpsCampement)}

    ${sec('Données sur les cultures','🌱')}
    <p class="hint">Renseignez chaque parcelle et la culture présente.</p>
    <div id="parcelleRows">${buildParcelleRows(d.parcelles||[{}])}</div>
    <button class="add-row-btn" onclick="addParcelle()">➕ Ajouter une parcelle</button>

    ${sec('Matériels agricoles & Équipements','🚜')}
    <div id="equipRows">${buildEquipRows(d.equipements||[])}</div>
    <button class="add-row-btn" onclick="addEquip()">➕ Autre matériel / équipement</button>

    ${sec('Diagnostic arbres non-cacaoyers','🌳')}
    <p class="hint">Arbres forestiers et fruitiers présents dans la cacaoyère.</p>
    <div id="arbreRows">${buildArbreRows(d.arbres||[{}])}</div>
    <button class="add-row-btn" onclick="addArbre()">➕ Ajouter un arbre</button>
    ${buildCustomQuestionsSection(2)}`;
}

function buildParcelleRows(rows) {
  return rows.map((r,i) => buildParcelleRow(r,i)).join('');
}
function buildParcelleRow(r={}, i=0) {
  const cultOpts = CULTURES_CI.map(c => ({v:c,l:c}));
  return `<div class="sub-card" data-parcelle="${i}">
    <div class="sub-card-header">Parcelle N°${i+1}${i>0?`<span class="del-btn" onclick="this.closest('[data-parcelle]').remove()">🗑</span>`:''}</div>
    ${fld('Culture',`p${i}_culture`,'select',r.culture,{options:cultOpts})}
    <div id="p${i}_autreBox" class="${r.culture==='Autre'?'':'hidden'}">
      ${fld('Préciser la culture',`p${i}_autreDetail`,'text',r.autreDetail,{placeholder:'Nom de la culture'})}
    </div>
    ${row2(
      fld('Année de création',`p${i}_annee`,'number',r.annee,{placeholder:'ex: 2010'}),
      fld('Précédent cultural',`p${i}_precedent`,'text',r.precedent)
    )}
    ${row2(
      fld('Superficie (ha)',`p${i}_superficie`,'number',r.superficie,{placeholder:'ex: 2.5'}),
      fld('Origine matériel végétal',`p${i}_origine`,'text',r.origine)
    )}
    ${fld('En production',`p${i}_production`,'select',r.production,{options:[{v:'oui',l:'Oui'},{v:'non',l:'Non'}]})}
  </div>`;
}

function buildEquipRows(rows) {
  // Initialize with standard equipment if empty
  if (!rows || rows.length === 0) {
    rows = EQUIPEMENTS.flatMap(cat => cat.items.map(item => ({ type: cat.type, nom: item, qte: '' })));
  }
  return rows.map((r,i) => buildEquipRow(r,i)).join('');
}

function buildEquipRow(r={}, i=0) {
  const isCustom = r.custom;
  return `<div class="sub-card equip-card" data-equip="${i}" id="equipCard_${i}">
    <div class="sub-card-header">
      ${isCustom ? `<input type="text" data-field="eq${i}_nom" value="${r.nom||''}" placeholder="Nom du matériel" class="field-input" style="font-size:13px;padding:6px 10px;margin:0;flex:1">` : `<span>${r.nom||''}</span><small style="color:var(--gray-400);font-size:11px;margin-left:6px">${r.type||''}</small>`}
      ${isCustom?`<span class="del-btn" onclick="this.closest('[data-equip]').remove()">🗑</span>`:''}
    </div>
    <div class="field-row">
      <div class="field-group">
        <label class="field-label">Quantité</label>
        <input type="number" class="field-input" data-field="eq${i}_qte" value="${r.qte||''}" min="0" placeholder="0" oninput="updateEquipDetails(${i}, this.value)">
      </div>
    </div>
    <div id="equipDetails_${i}">${buildEquipDetails(i, r)}</div>
  </div>`;
}

function buildEquipDetails(equip_i, r={}) {
  const qte = parseInt(r.qte) || 0;
  if (qte === 0) return '';
  let html = '';
  for (let j = 0; j < qte; j++) {
    const existing = (r.details || [])[j] || {};
    html += `<div class="equip-detail-row">
      <div class="equip-detail-label">${r.nom || 'Unité'} #${j+1}</div>
      ${row2(
        `<div class="field-group"><label class="field-label">Année acquisition</label>
          <input type="number" class="field-input" data-field="eq${equip_i}_d${j}_annee" value="${existing.annee||''}" placeholder="ex: 2022"></div>`,
        `<div class="field-group"><label class="field-label">Coût (FCFA)</label>
          <input type="number" class="field-input" data-field="eq${equip_i}_d${j}_cout" value="${existing.cout||''}" placeholder="0"></div>`
      )}
      <div class="field-group"><label class="field-label">État</label>
        <select class="field-select" data-field="eq${equip_i}_d${j}_etat">
          <option value="">-- Choisir --</option>
          <option value="bon" ${existing.etat==='bon'?'selected':''}>Bon</option>
          <option value="acceptable" ${existing.etat==='acceptable'?'selected':''}>Acceptable</option>
          <option value="mauvais" ${existing.etat==='mauvais'?'selected':''}>Mauvais</option>
        </select>
      </div>
    </div>`;
  }
  return html;
}

function updateEquipDetails(i, qteVal) {
  const card = document.querySelector(`[data-equip="${i}"]`);
  if (!card) return;
  const nom = card.querySelector(`[data-field="eq${i}_nom"]`)?.value || '';
  const qte = parseInt(qteVal) || 0;
  const r = { nom, qte, details: [] };
  document.getElementById(`equipDetails_${i}`).innerHTML = buildEquipDetails(i, r);
}

function buildArbreRows(rows) {
  return rows.map((r,i) => buildArbreRow(r,i)).join('');
}
function buildArbreRow(r={}, i=0) {
  return `<div class="sub-card" data-arbre="${i}">
    <div class="sub-card-header">Arbre #${i+1}${i>0?`<span class="del-btn" onclick="this.closest('[data-arbre]').remove()">🗑</span>`:''}</div>
    ${row2(fld('Nom botanique',`a${i}_botanique`,'text',r.botanique), fld('Nom local',`a${i}_local`,'text',r.local))}
    ${fld('Circonférence à hauteur de poitrine (cm)',`a${i}_circ`,'number',r.circ)}
    <div class="gps-group">
      ${row2(
        `<div class="field-group"><label class="field-label">Latitude 🔒</label>
          <input type="text" class="field-input readonly-field" data-field="a${i}_lat" id="a${i}_lat" value="${r.lat||''}" readonly placeholder="0.00000000"></div>`,
        `<div class="field-group"><label class="field-label">Longitude 🔒</label>
          <input type="text" class="field-input readonly-field" data-field="a${i}_lon" id="a${i}_lon" value="${r.lon||''}" readonly placeholder="0.00000000"></div>`
      )}
      <div class="gps-row">
        <button class="gps-btn" onclick="captureGPS('a${i}_lat','a${i}_lon','a${i}_acc')">📍 Capturer GPS de l'arbre</button>
        <span class="gps-acc" id="a${i}_acc"></span>
      </div>
    </div>
    ${row2(
      fld('Origine',`a${i}_origine`,'select',r.origine,{options:[{v:'preserve',l:'Préservé'},{v:'plante',l:'Planté'}]}),
      fld('Organe utilisé',`a${i}_organe`,'text',r.organe)
    )}
    ${fld('Utilité',`a${i}_utilite`,'text',r.utilite,{placeholder:'Usage de cet arbre'})}
    ${row2(
      fld('Décision',`a${i}_decision`,'select',r.decision,{options:[{v:'maintenir',l:'À maintenir'},{v:'eliminer',l:'À éliminer'}]}),
      fld('Raisons',`a${i}_raisons`,'text',r.raisons)
    )}
  </div>`;
}

// ── FICHE 3 ───────────────────────────────────
function buildFiche3(d={}) {
  return `
    ${sec('État de la cacaoyère','🌿')}
    ${fld('Dispositif de plantation','dispositifPlantation','radio',d.dispositifPlantation,{options:[{v:'1',l:'1. En lignes'},{v:'2',l:'2. En désordre'}]})}

    ${sec('Tableau de densité (4 carrés de 10m × 10m)','📐')}
    <p class="hint">Comptez les pieds de cacaoyer et les tiges dans chaque carré de 100 m².</p>
    ${buildDensiteTable(d)}

    ${sec('Polygone de la parcelle','🗺️')}
    <p class="hint">Marchez le long du périmètre de la parcelle — le système tracera le polygone automatiquement en temps réel.</p>
    <div class="tracking-box">
      <button class="track-btn" id="trackBtn_parcelle" onclick="startTracking('parcelle')">▶ Tracer le polygone en marchant</button>
      <div class="track-status" id="trackStatus_parcelle"></div>
    </div>
    <div class="gps-row" style="margin-top:8px">
      <button class="gps-btn" onclick="addPolygonePoint()" style="font-size:12px;padding:8px 10px">📍 Ajouter point manuellement</button>
      <span id="polygoneCount" class="gps-acc">${(d.polygone||[]).length} point(s)</span>
    </div>
    <div id="polygonePoints" style="margin-top:8px">${buildPolygonePoints(d.polygone||[])}</div>

    ${sec('Plages vides dans le champ','⬜')}
    ${fld('Plages vides','plagesVides','radio',d.plagesVides,{options:[{v:'peu',l:'Peu (≤5)'},{v:'beaucoup',l:'Beaucoup (>5)'},{v:'grande',l:'Grande(s) plage(s)'}]})}
    <div id="plageVideSection" class="${['beaucoup','grande'].includes(d.plagesVides)?'':'hidden'}">
      <p class="hint" style="margin-bottom:8px">Collectez le polygone de chaque plage vide.</p>
      <div id="plageVideRows">${buildPlageVideRows(d.plagesVides_polygones||[])}</div>
      <button class="add-row-btn" onclick="addPlageVide()">➕ Ajouter une plage vide</button>
    </div>

    ${sec('Ombrage & Canopée','🌲')}
    ${fld('Ombrage (arbres autres que cacaoyer)','ombrage','radio',d.ombrage,{options:[{v:'1',l:'1. Inexistant'},{v:'2',l:'2. Moyen'},{v:'3',l:'3. Dense'}]})}
    ${fld('État canopée/couronne','canopee','radio',d.canopee,{options:[{v:'normal',l:'Normal'},{v:'peu_degrade',l:'Peu dégradé'},{v:'degrade',l:'Dégradé'}]})}

    ${sec('Maladies du cacaoyer','🦠')}
    ${buildMaladiesSection(d)}

    ${sec('Ravageurs du cacaoyer','🐛')}
    ${buildRavageursSection(d)}

    ${sec('Paramètres complémentaires','📊')}
    ${buildParametresSection(d)}

    ${sec('État du sol','🪨')}
    ${fld('Positionnement de la parcelle','positionnement','radio',d.positionnement,{options:[{v:'1',l:'1. Plateau'},{v:'2',l:'2. Haut de pente'},{v:'3',l:'3. Mi-versant'},{v:'4',l:'4. Bas de pente'}]})}
    ${buildEtatSol(d)}
    ${fld('Commentaires sur l\'état du sol','commentaireSol','textarea',d.commentaireSol,{placeholder:'Observations générales sur le sol…'})}

    ${sec('Pratiques de récolte & post-récolte','🍫')}
    ${buildRecolte(d)}

    ${sec('Application d\'engrais','🧪')}
    <div id="engraisRows">${buildEngraisRows(d.engrais||[{}])}</div>
    <button class="add-row-btn" onclick="addEngrais()">➕ Ajouter un engrais</button>

    ${sec('Produits phytosanitaires','🔬')}
    <div id="phytoRows">${buildPhytoRows(d.phyto||[{}])}</div>
    <button class="add-row-btn" onclick="addPhyto()">➕ Ajouter un produit phytosanitaire</button>

    ${sec('Gestion des emballages','♻️')}
    ${fld('Que faites-vous des emballages après traitement ?','gestionEmballages','textarea',d.gestionEmballages,{placeholder:'Décrivez la gestion des emballages…'})}
    ${buildCustomQuestionsSection(3)}`;
}

function buildDensiteTable(d={}) {
  const sup = d.superficie || '';
  const carres = d.carres || [{},{},{},{}];
  let rows = '';
  for (let i=0; i<4; i++) {
    const c = carres[i] || {};
    rows += `<div class="densite-row">
      <div class="densite-label">Carré ${i+1}</div>
      <input type="number" class="field-input" data-field="carre${i}_pieds" value="${c.pieds||''}" placeholder="Pieds" oninput="calcDensite()">
      <input type="number" class="field-input" data-field="carre${i}_tiges" value="${c.tiges||''}" placeholder="Tiges" oninput="calcDensite()">
    </div>`;
  }
  return `<div class="densite-table">
    <div class="densite-header">
      <span>Carré (10m×10m)</span><span>Nb pieds cacaoyers</span><span>Nb tiges total</span>
    </div>
    ${rows}
  </div>
  <div class="field-row" style="margin-top:10px">
    <div class="field-group">
      <label class="field-label">Superficie parcelle (ha)</label>
      <input type="number" class="field-input" data-field="superficie_ha" value="${sup}" placeholder="ex: 2.5" oninput="calcDensite()">
    </div>
    <div class="field-group">
      <label class="field-label">Densité calculée (pieds/ha)</label>
      <input type="text" class="field-input readonly-field" data-field="densiteCalculee" id="densiteResultat" value="${d.densiteCalculee||''}" readonly placeholder="Calculée automatiquement">
    </div>
  </div>
  <div class="field-row">
    <div class="field-group">
      <label class="field-label">Nb moyen tiges/cacaoyer</label>
      <input type="text" class="field-input readonly-field" data-field="nbMoyenTiges" id="nbMoyenTigesCalc" value="${d.nbMoyenTiges||''}" readonly placeholder="Calculé">
    </div>
  </div>`;
}

function buildPolygonePoints(points=[]) {
  if (points.length === 0) {
    return '<p class="hint" style="color:var(--gray-400)">Aucun point capturé pour l\'instant.</p>';
  }
  return points.map((p,i) => `
    <div class="polygone-point">
      <span class="pp-num">${i+1}</span>
      <span class="pp-coords">📍 ${p.lat} , ${p.lon}</span>
      <span class="pp-acc">±${p.acc||'?'}m</span>
      <span class="del-btn" onclick="removePolygonePoint(${i})">🗑</span>
    </div>`).join('');
}

function buildPlageVideRows(rows=[]) {
  return rows.map((r,i) => buildPlageVideRow(r,i)).join('');
}
function buildPlageVideRow(r={}, i=0) {
  const pts = r.points || [];
  return `<div class="sub-card" data-plage="${i}">
    <div class="sub-card-header">Plage vide #${i+1}<span class="del-btn" onclick="this.closest('[data-plage]').remove()">🗑</span></div>
    <div class="tracking-box">
      <button class="track-btn" id="trackBtn_plage_${i}" onclick="startTracking('plage_${i}')">▶ Tracer le polygone en marchant</button>
      <div class="track-status" id="trackStatus_plage_${i}"></div>
    </div>
    <button class="gps-btn" style="margin-top:8px;font-size:12px;padding:8px 10px" onclick="addPlagePoint(${i})">📍 Ajouter point manuellement</button>
    <span id="plageCount_${i}" class="gps-acc" style="margin-left:8px">${pts.length} point(s)</span>
    <div id="plagePoints_${i}" style="margin-top:8px">${buildPlagePoints(i, pts)}</div>
  </div>`;
}
function buildPlagePoints(plage_i, pts=[]) {
  if (!pts.length) return '<p class="hint" style="color:var(--gray-400);font-size:12px">Aucun point.</p>';
  return pts.map((p,i) => `<div class="polygone-point">
    <span class="pp-num">${i+1}</span>
    <span class="pp-coords">📍 ${p.lat} , ${p.lon}</span>
    <span class="pp-acc">±${p.acc||'?'}m</span>
  </div>`).join('');
}

function buildMaladiesSection(d={}) {
  return MALADIES_CACAO.map(m => {
    const key = `mal_${m.id}`;
    const v = d[key] || {};
    const sevOpts = SEVERITE_OPTS.map(o => `<option value="${o.v}" ${(v.sev||'')=== o.v?'selected':''}>${o.l}</option>`).join('');
    return `<div class="pathogen-card">
      <div class="pathogen-title">🔴 ${m.label}</div>
      <div class="field-group">
        <label class="field-label">Sévérité</label>
        <select class="field-select" data-field="${key}_sev"><option value="">-- Choisir --</option>${sevOpts}</select>
      </div>
      ${fld('Observations',`${key}_obs`,'textarea',v.obs,{placeholder:'Décrire les symptômes observés…'})}
      ${fld('Mesures de lutte mises en place',`${key}_lutte`,'textarea',v.lutte,{placeholder:'Qu\'avez-vous mis en place pour lutter contre cette maladie ?'})}
    </div>`;
  }).join('');
}

function buildRavageursSection(d={}) {
  return RAVAGEURS_CACAO.map(r => {
    const key = `rav_${r.id}`;
    const v = d[key] || {};
    const sevOpts = SEVERITE_OPTS.map(o => `<option value="${o.v}" ${(v.sev||'')=== o.v?'selected':''}>${o.l}</option>`).join('');
    return `<div class="pathogen-card">
      <div class="pathogen-title">🟠 ${r.label}</div>
      <div class="field-group">
        <label class="field-label">Sévérité</label>
        <select class="field-select" data-field="${key}_sev"><option value="">-- Choisir --</option>${sevOpts}</select>
      </div>
      ${fld('Observations',`${key}_obs`,'textarea',v.obs,{placeholder:'Décrire les dégâts observés…'})}
      ${fld('Mesures de lutte mises en place',`${key}_lutte`,'textarea',v.lutte,{placeholder:'Qu\'avez-vous mis en place pour lutter ?'})}
    </div>`;
  }).join('');
}

function buildParametresSection(d={}) {
  return PARAMETRES_CACAO.map(p => {
    const key = `par_${p.id}`;
    const v = d[key] || {};
    const valOpts = SEVERITE_OPTS.map(o => `<option value="${o.v}" ${(v.val||'')=== o.v?'selected':''}>${o.l}</option>`).join('');
    return `<div class="pathogen-card">
      <div class="pathogen-title">🟡 ${p.label}</div>
      <div class="field-group">
        <label class="field-label">Niveau / Valeur</label>
        <select class="field-select" data-field="${key}_val"><option value="">-- Choisir --</option>${valOpts}</select>
      </div>
      ${fld('Observations',`${key}_obs`,'textarea',v.obs,{placeholder:'Observations…'})}
      ${fld('Actions correctives mises en place',`${key}_action`,'textarea',v.action,{placeholder:'Qu\'avez-vous mis en place ?'})}
    </div>`;
  }).join('');
}

function buildEtatSol(d={}) {
  const obs1 = [
    ['Couvert végétal','sol_couvert',['1. Beaucoup','2. Moyen','3. Faible']],
    ['Présence de Matière organique','sol_matorg',['1. Beaucoup','2. Moyen','3. Faible']],
    ['Profondeur','sol_profondeur',['1. Profond','2. Moyen','3. Superficiel']],
    ['Texture','sol_texture',['1. Argileuse','2. Limoneuse','3. Sableuse']],
    ['Hydromorphie','sol_hydro',['1. Beaucoup','2. Moyen','3. Faible']],
  ];
  const obs2 = [
    ['Existence de zones érodées','sol_erode'],
    ['Existence de zones à risque d\'érosion','sol_risque'],
  ];
  return obs1.map(([label,key,options]) => `<div class="field-group">
    <label class="field-label">${label}</label>
    <select class="field-select" data-field="${key}">
      <option value="">-- Choisir --</option>
      ${options.map((o,i) => `<option value="${i+1}" ${d[key]===(i+1).toString()?'selected':''}>${o}</option>`).join('')}
    </select>
  </div>`).join('') +
  obs2.map(([label,key]) => `<div class="field-group">
    <label class="field-label">${label}</label>
    <select class="field-select" data-field="${key}">
      <option value="">-- Choisir --</option>
      <option value="oui" ${d[key]==='oui'?'selected':''}>Oui</option>
      <option value="non" ${d[key]==='non'?'selected':''}>Non</option>
    </select>
  </div>`).join('');
}

function buildRecolte(d={}) {
  const fermentOpts = [{v:'1',l:'1. Bâche en plastique'},{v:'2',l:'2. Feuilles de bananier'},{v:'3',l:'3. Bac de fermentation'},{v:'autre',l:'4. Autre'}];
  const sechageOpts = [{v:'1',l:'1. Sur goudron'},{v:'2',l:'2. Aire cimentée'},{v:'3',l:'3. Bâche plastique à terre'},{v:'4',l:'4. Sur claie'},{v:'autre',l:'5. Autre'}];
  return `
    ${row2(
      fld('Fréquence récoltes (jours)','freqRecoltes','number',d.freqRecoltes,{placeholder:'ex: 14'}),
      fld('Temps récolte→écabossage (jours)','tempsEcabossage','number',d.tempsEcabossage)
    )}
    ${row2(
      fld('Durée fermentation (jours)','dureeFermentation','number',d.dureeFermentation),
      fld('Mode de fermentation','modeFermentation','select',d.modeFermentation,{options:fermentOpts})
    )}
    <div id="fermentAutreBox" class="${d.modeFermentation==='autre'?'':'hidden'}">
      ${fld('Préciser le mode de fermentation','modeFermentationAutre','textarea',d.modeFermentationAutre)}
    </div>
    ${fld('Méthode de séchage','methodeSechage','select',d.methodeSechage,{options:sechageOpts})}
    <div id="sechageAutreBox" class="${d.methodeSechage==='autre'?'':'hidden'}">
      ${fld('Préciser la méthode de séchage','methodeSechageAutre','textarea',d.methodeSechageAutre)}
    </div>`;
}

function buildEngraisRows(rows=[]) {
  return rows.map((r,i) => buildEngraisRow(r,i)).join('');
}
function buildEngraisRow(r={}, i=0) {
  return `<div class="sub-card" data-engrais="${i}">
    <div class="sub-card-header">Engrais ${i+1}${i>0?`<span class="del-btn" onclick="this.closest('[data-engrais]').remove()">🗑</span>`:''}</div>
    ${row2(
      fld('Type',`eng${i}_type`,'select',r.type,{options:[{v:'mineral',l:'Minéral'},{v:'organique',l:'Organique'},{v:'organo',l:'Organo-minéral'}]}),
      fld('Nom commercial / Formule',`eng${i}_nom`,'text',r.nom)
    )}
    ${row2(
      fld('Quantité/an',`eng${i}_qte`,'text',r.qte,{placeholder:'ex: 50 kg'}),
      fld('Période d\'apport',`eng${i}_periode`,'text',r.periode)
    )}
    ${row2(
      fld('Mode d\'apport',`eng${i}_mode`,'select',r.mode,{options:[{v:'foliaire',l:'Foliaire'},{v:'sol',l:'Au sol'}]}),
      fld('Applicateur',`eng${i}_applicateur`,'select',r.applicateur,{options:[{v:'1',l:'1. Producteur'},{v:'2',l:'2. Applicateur'}]})
    )}
  </div>`;
}

function buildPhytoRows(rows=[]) {
  return rows.map((r,i) => buildPhytoRow(r,i)).join('');
}
function buildPhytoRow(r={}, i=0) {
  return `<div class="sub-card" data-phyto="${i}">
    <div class="sub-card-header">Produit phytosanitaire ${i+1}${i>0?`<span class="del-btn" onclick="this.closest('[data-phyto]').remove()">🗑</span>`:''}</div>
    ${row2(
      fld('Type',`phy${i}_type`,'select',r.type,{options:[{v:'insecticide',l:'Insecticide'},{v:'fongicide',l:'Fongicide'},{v:'herbicide',l:'Herbicide'},{v:'acaricide',l:'Acaricide'},{v:'nematicide',l:'Nématicide'}]}),
      fld('Nom commercial / Formule',`phy${i}_nom`,'text',r.nom)
    )}
    ${row2(
      fld('Quantité/traitement',`phy${i}_qte`,'text',r.qte),
      fld('Période de traitement',`phy${i}_periode`,'text',r.periode)
    )}
    ${row2(
      fld('Mode d\'apport',`phy${i}_mode`,'select',r.mode,{options:[{v:'atomiseur',l:'Atomiseur'},{v:'pulverisateur',l:'Pulvérisateur'},{v:'manuel',l:'Manuel'}]}),
      fld('Applicateur',`phy${i}_applicateur`,'select',r.applicateur,{options:[{v:'1',l:'1. Producteur'},{v:'2',l:'2. Applicateur'}]})
    )}
  </div>`;
}

// ── FICHE 4 ───────────────────────────────────
function buildFiche4(d={}) {
  return `
    ${sec('Compte d\'épargne et Financement','💰')}
    <div id="epargneRows">${buildEpargneRows(d.epargne||[{type:'Mobile Money'},{type:'Microfinance'},{type:'Banque'}])}</div>
    <button class="add-row-btn" onclick="addEpargne()">➕ Autre compte d'épargne</button>

    ${sec('Production de cacao (3 dernières années)','🍫')}
    ${buildProductionTable(d)}

    ${sec('Autres sources de revenus','🌾')}
    <div id="revenusRows">${buildRevenusRows(d.revenus||[{source:'Riz'},{source:'Maïs'},{source:'Élevage'}])}</div>
    <button class="add-row-btn" onclick="addRevenu()">➕ Ajouter une source de revenus</button>

    ${sec('Dépenses courantes du foyer','🏠')}
    ${buildDepensesTable(d)}

    ${sec('Coût de la main d\'œuvre','👷')}
    <div id="moRows">${buildMORows(d.mainoeuvre||[{}])}</div>
    <button class="add-row-btn" onclick="addMO()">➕ Ajouter un travailleur</button>
    ${buildCustomQuestionsSection(4)}`;
}

function buildEpargneRows(rows=[]) {
  return rows.map((r,i) => buildEpargneRow(r,i)).join('');
}
function buildEpargneRow(r={}, i=0) {
  const isCustom = !['Mobile Money','Microfinance','Banque'].includes(r.type);
  return `<div class="sub-card" data-epargne="${i}">
    <div class="sub-card-header">
      ${isCustom
        ? `<input type="text" data-field="ep${i}_type" value="${r.type||''}" placeholder="Type de compte" class="field-input" style="font-size:13px;padding:6px;flex:1"><span class="del-btn" onclick="this.closest('[data-epargne]').remove()">🗑</span>`
        : `<span>${r.type}</span>`}
    </div>
    ${row2(
      fld('A un compte',`ep${i}_compte`,'select',r.compte,{options:[{v:'oui',l:'Oui'},{v:'non',l:'Non'}]}),
      fld('Argent disponible sur compte',`ep${i}_argent`,'select',r.argent,{options:[{v:'oui',l:'Oui'},{v:'non',l:'Non'}]})
    )}
    ${row2(
      fld('A bénéficié de financement',`ep${i}_financement`,'select',r.financement,{options:[{v:'oui',l:'Oui'},{v:'non',l:'Non'}]}),
      fld('Montant (FCFA)',`ep${i}_montant`,'number',r.montant,{placeholder:'0'})
    )}
  </div>`;
}

function buildProductionTable(d={}) {
  return ['N-1','N-2','N-3'].map((an,i) => `
    <div class="sub-card" style="margin-bottom:8px">
      <div class="sub-card-header">Année ${an}</div>
      ${row2(
        fld('Production (kg)',`prod${i}_kg`,'number',d[`prod${i}_kg`],{placeholder:'kg'}),
        fld('Revenu brut (FCFA)',`prod${i}_fcfa`,'number',d[`prod${i}_fcfa`],{placeholder:'FCFA'})
      )}
    </div>`).join('');
}

function buildRevenusRows(rows=[]) {
  return rows.map((r,i) => buildRevenuRow(r,i)).join('');
}
function buildRevenuRow(r={}, i=0) {
  const isCustom = !['Riz','Maïs','Élevage'].includes(r.source);
  return `<div class="sub-card" data-revenu="${i}">
    <div class="sub-card-header">
      ${isCustom
        ? `<input type="text" data-field="rev${i}_source" value="${r.source||''}" placeholder="Source de revenus" class="field-input" style="font-size:13px;padding:6px;flex:1"><span class="del-btn" onclick="this.closest('[data-revenu]').remove()">🗑</span>`
        : `<span>${r.source}</span>`}
    </div>
    ${row2(
      fld('Production moy. annuelle',`rev${i}_prod`,'text',r.prod,{placeholder:'ex: 500 kg'}),
      fld('Consommation personnelle/an',`rev${i}_conso`,'text',r.conso)
    )}
    ${fld('Revenu brut moyen/an (FCFA)',`rev${i}_fcfa`,'number',r.fcfa,{placeholder:'FCFA'})}
  </div>`;
}

function buildDepensesTable(d={}) {
  const items = [
    ['Scolarité','Année','dep_scolarite'],
    ['Nourriture','Mois','dep_nourriture'],
    ['Santé','Année','dep_sante'],
    ['Électricité','2 mois','dep_electricite'],
    ['Eau courante','Mois','dep_eau'],
    ['Funérailles','Année','dep_funerailles'],
    ['Charges sociales (mariage, baptême…)','Année','dep_charges'],
  ];
  return items.map(([label,period,key]) => `
    <div class="sub-card" style="margin-bottom:8px">
      <div class="sub-card-header">${label} <small style="font-size:11px;color:var(--gray-400)">(${period})</small></div>
      ${row2(
        fld('Montant moyen/mois (FCFA)',`${key}_mois`,'number',d[`${key}_mois`],{placeholder:'FCFA/mois'}),
        fld('Montant moyen/an (FCFA)',`${key}_an`,'number',d[`${key}_an`],{placeholder:'FCFA/an'})
      )}
    </div>`).join('');
}

function buildMORows(rows=[]) {
  return rows.map((r,i) => buildMORow(r,i)).join('');
}
function buildMORow(r={}, i=0) {
  return `<div class="sub-card" data-mo="${i}">
    <div class="sub-card-header">Travailleur ${i+1}${i>0?`<span class="del-btn" onclick="this.closest('[data-mo]').remove()">🗑</span>`:''}</div>
    ${row2(
      fld('Nom du travailleur',`mo${i}_nom`,'text',r.nom),
      fld('Statut',`mo${i}_statut`,'select',r.statut,{options:[{v:'permanent',l:'MO permanente'},{v:'occasionnel',l:'MO occasionnel'},{v:'familiale',l:'Non rémunérée (familiale)'}]})
    )}
    ${row2(
      fld('Sexe',`mo${i}_sexe`,'select',r.sexe,{options:[{v:'M',l:'Masculin'},{v:'F',l:'Féminin'}]}),
      fld('Coût annuel (FCFA)',`mo${i}_cout`,'number',r.cout,{placeholder:'0'})
    )}
    ${fld('Jours de travail sur la cacaoyère',`mo${i}_jours`,'number',r.jours,{placeholder:'Nombre de jours'})}
  </div>`;
}
