/* =============================================
   CACAO COLLECT v3 — DONNÉES DE RÉFÉRENCE
   ============================================= */

const CULTURES_CI = [
  'Cacao','Café','Hévéa','Palmier à huile','Anacarde (Cajou)',
  'Coton','Canne à sucre','Cocotier','Banane plantain','Banane douce',
  'Ananas','Mangue','Avocat','Citrus (Orange/Citron/Pamplemousse)',
  'Teck','Gmelina','Eucalyptus','Cola','Poivre','Vanille','Autre'
];

const MALADIES_CACAO = [
  { id: 'pourriture_brune', label: 'Pourriture Brune (Phytophthora)' },
  { id: 'mirides', label: 'Mirides (Sahlbergella / Distantiella)' },
  { id: 'cssvd', label: 'CSSVD (Swollen Shoot)' },
  { id: 'chancre', label: 'Chancre du tronc' },
  { id: 'moniliose', label: 'Moniliose (Moniliophthora roreri)' },
  { id: 'witches_broom', label: "Balai de sorcière (Witch's Broom)" },
  { id: 'anthracnose', label: 'Anthracnose (Colletotrichum)' },
  { id: 'pourriture_noire', label: 'Pourriture noire des cabosses' },
  { id: 'ceratocystis', label: 'Ceratocystis (mort du cacaoyer)' },
  { id: 'verticilliose', label: 'Verticilliose (flétrissement)' },
  { id: 'algues', label: 'Algues et mousses sur tronc' },
];

const RAVAGEURS_CACAO = [
  { id: 'foreurs_tronc', label: 'Foreurs du tronc (Xylébores)' },
  { id: 'foreurs_cabosses', label: 'Foreurs des cabosses' },
  { id: 'punaises', label: 'Punaises des cabosses (Bathycoelia)' },
  { id: 'cochenilles', label: 'Cochenilles (Pseudococcus)' },
  { id: 'termites', label: 'Termites' },
  { id: 'rongeurs', label: 'Rongeurs (rats, écureuils)' },
  { id: 'fourmis', label: 'Fourmis (Crematogaster)' },
  { id: 'acariens', label: 'Acariens' },
  { id: 'thrips', label: 'Thrips' },
  { id: 'chenilles', label: 'Chenilles défoliatrices' },
  { id: 'pucerons', label: 'Pucerons (Toxoptera)' },
];

const PARAMETRES_CACAO = [
  { id: 'gourmands', label: 'Présence de gourmands' },
  { id: 'momifiees', label: 'Présence de cabosses momifiées' },
  { id: 'epiphytes', label: 'Présence de plantes épiphytes' },
  { id: 'loranthus', label: 'Présence de Loranthus (plantes parasites)' },
  { id: 'enherbement', label: 'Enherbement sous cacaoyer' },
  { id: 'feuilles_jaunes', label: 'Jaunissement des feuilles' },
  { id: 'defoliation', label: 'Défoliation anormale' },
  { id: 'branches_mortes', label: 'Branches mortes / dépérissement' },
  { id: 'ecorce_alteree', label: 'Écorce altérée / lésions' },
  { id: 'flux_gomme', label: 'Flux de gomme sur le tronc' },
  { id: 'fruits_vides', label: 'Cabosses vides / avortées' },
  { id: 'chute_fleurs', label: 'Chute excessive des fleurs' },
];

const EQUIPEMENTS = [
  { type: 'Matériel de traitement', items: ['Pulvérisateur', 'Atomiseur', 'EPI (Équipement de Protection Individuelle)'] },
  { type: 'Matériel de transport', items: ['Tricycle', 'Brouette', 'Camion/Camionnette'] },
  { type: 'Moyen de déplacement', items: ['Vélo', 'Moto', 'Voiture'] },
  { type: 'Matériel de séchage', items: ['Claie/Séco', 'Aire cimentée', 'Séchoir solaire'] },
  { type: 'Matériel de fermentation', items: ['Bac de fermentation'] },
  { type: 'Petit outillage', items: ['Machette', 'Émondoir', 'Matériel de récolte'] },
  { type: 'Motorisé', items: ['Tronçonneuse', 'Motopompe'] },
];

const SEVERITE_OPTS = [
  { v: '0', l: '0. Non observé' },
  { v: '1', l: '1. Aucun' },
  { v: '2', l: '2. Faible' },
  { v: '3', l: '3. Moyen' },
  { v: '4', l: '4. Fort' },
];

const FICHE_NAMES = {
  1: 'Profil Producteur & Ménage',
  2: "Profil de l'Exploitation",
  3: 'Informations sur la Cacaoyère',
  4: 'Profil Socio-Économique',
};

const DEFAULT_USERS = [
  { id: 'u0', username: 'admin', password: 'Admin2024!', name: 'Administrateur Général', role: 'admin', region: 'Nationale', active: true },
  { id: 'u1', username: 'enqueteur1', password: 'cacao2024', name: 'Kouassi Amani', role: 'enqueteur', region: 'Abidjan', active: true },
  { id: 'u2', username: 'enqueteur2', password: 'cacao2024', name: 'Traoré Fatou', role: 'enqueteur', region: 'Yamoussoukro', active: true },
  { id: 'u3', username: 'superviseur', password: 'super2024', name: 'Koffi Brou', role: 'superviseur', region: 'Nationale', active: true },
];

// ── Registre complet de toutes les questions ──
const DEFAULT_FIELD_CONFIG = {
  // FICHE 1
  _h1:              { fiche:1, type:'header', label:'FICHE 1 — Profil Producteur & Ménage', required:false, visible:true },
  date:             { fiche:1, label:'Date de collecte',                    required:true,  visible:true },
  nomEnqueteur:     { fiche:1, label:"Nom de l'enquêteur",                  required:true,  visible:true },
  contactEnqueteur: { fiche:1, label:"Contact de l'enquêteur",              required:false, visible:true },
  qualification:    { fiche:1, label:"Qualification de l'enquêteur",        required:false, visible:true },
  nomProducteur:    { fiche:1, label:'Nom et prénoms du producteur',        required:true,  visible:true },
  codeNational:     { fiche:1, label:'Code National Producteur (CCC)',      required:true,  visible:true },
  codeGroupe:       { fiche:1, label:'Code groupe',                         required:false, visible:true },
  nomEntite:        { fiche:1, label:'Nom Entité Reconnue',                 required:false, visible:true },
  codeCooperative:  { fiche:1, label:'Code coopérative',                    required:false, visible:true },
  delegation:       { fiche:1, label:'Délégation Régionale',                required:false, visible:true },
  departement:      { fiche:1, label:'Département',                         required:true,  visible:true },
  sousPrefecture:   { fiche:1, label:'Sous-Préfecture',                     required:true,  visible:true },
  village:          { fiche:1, label:'Village',                             required:true,  visible:true },
  campement:        { fiche:1, label:'Campement',                           required:false, visible:true },

  // FICHE 2
  _h2:              { fiche:2, type:'header', label:"FICHE 2 — Profil de l'Exploitation", required:false, visible:true },
  gpsLat:           { fiche:2, label:'Latitude GPS de la cacaoyère',        required:true,  visible:true },
  gpsLon:           { fiche:2, label:'Longitude GPS de la cacaoyère',       required:true,  visible:true },
  gpsSousPref:      { fiche:2, label:'Sous-Préfecture (coordonnées GPS)',   required:false, visible:true },
  gpsVillage:       { fiche:2, label:'Village (coordonnées GPS)',           required:false, visible:true },
  gpsCampement:     { fiche:2, label:'Campement (coordonnées GPS)',         required:false, visible:true },
  p0_culture:       { fiche:2, label:'Parcelle 1 — Culture',               required:true,  visible:true },
  p0_annee:         { fiche:2, label:"Parcelle 1 — Année de création",      required:false, visible:true },
  p0_precedent:     { fiche:2, label:'Parcelle 1 — Précédent cultural',    required:false, visible:true },
  p0_superficie:    { fiche:2, label:'Parcelle 1 — Superficie (ha)',        required:true,  visible:true },
  p0_origine:       { fiche:2, label:'Parcelle 1 — Origine matériel végétal', required:false, visible:true },
  p0_production:    { fiche:2, label:'Parcelle 1 — En production ?',       required:false, visible:true },
  a0_botanique:     { fiche:2, label:'Arbre 1 — Nom botanique',            required:false, visible:true },
  a0_local:         { fiche:2, label:'Arbre 1 — Nom local',                required:false, visible:true },
  a0_circ:          { fiche:2, label:'Arbre 1 — Circonférence (cm)',       required:false, visible:true },
  a0_lat:           { fiche:2, label:'Arbre 1 — Latitude GPS',             required:false, visible:true },
  a0_origine:       { fiche:2, label:'Arbre 1 — Origine (préservé/planté)',required:false, visible:true },
  a0_decision:      { fiche:2, label:'Arbre 1 — Décision',                 required:false, visible:true },

  // FICHE 3
  _h3:                  { fiche:3, type:'header', label:'FICHE 3 — Informations sur la Cacaoyère', required:false, visible:true },
  dispositifPlantation: { fiche:3, label:'Dispositif de plantation',        required:false, visible:true },
  superficie_ha:        { fiche:3, label:'Superficie de la parcelle (ha)', required:true,  visible:true },
  densiteCalculee:      { fiche:3, label:'Densité calculée (pieds/ha)',     required:false, visible:true },
  nbMoyenTiges:         { fiche:3, label:'Nombre moyen de tiges/cacaoyer', required:false, visible:true },
  plagesVides:          { fiche:3, label:'Plages vides dans le champ',     required:false, visible:true },
  ombrage:              { fiche:3, label:'Ombrage des arbres',              required:false, visible:true },
  canopee:              { fiche:3, label:'Présentation canopée/couronne',   required:false, visible:true },
  positionnement:       { fiche:3, label:'Positionnement de la parcelle',   required:false, visible:true },
  sol_couvert:          { fiche:3, label:'Sol — Couvert végétal',           required:false, visible:true },
  sol_matorg:           { fiche:3, label:'Sol — Matière organique',         required:false, visible:true },
  sol_profondeur:       { fiche:3, label:'Sol — Profondeur',                required:false, visible:true },
  sol_texture:          { fiche:3, label:'Sol — Texture',                   required:false, visible:true },
  sol_hydro:            { fiche:3, label:'Sol — Hydromorphie',              required:false, visible:true },
  sol_erode:            { fiche:3, label:'Sol — Zones érodées',             required:false, visible:true },
  sol_risque:           { fiche:3, label:'Sol — Zones à risque érosion',    required:false, visible:true },
  commentaireSol:       { fiche:3, label:'Sol — Commentaires généraux',     required:false, visible:true },
  freqRecoltes:         { fiche:3, label:'Fréquence des récoltes (jours)',  required:false, visible:true },
  tempsEcabossage:      { fiche:3, label:'Temps récolte → écabossage (j)', required:false, visible:true },
  dureeFermentation:    { fiche:3, label:'Durée de fermentation (jours)',   required:false, visible:true },
  modeFermentation:     { fiche:3, label:'Mode de fermentation',            required:false, visible:true },
  methodeSechage:       { fiche:3, label:'Méthode de séchage',              required:false, visible:true },
  gestionEmballages:    { fiche:3, label:'Gestion des emballages',          required:false, visible:true },
  mal_pourriture_brune_sev: { fiche:3, label:'Maladie — Pourriture Brune (Sévérité)',   required:false, visible:true },
  mal_mirides_sev:          { fiche:3, label:'Maladie — Mirides (Sévérité)',             required:false, visible:true },
  mal_cssvd_sev:            { fiche:3, label:'Maladie — CSSVD (Sévérité)',               required:false, visible:true },
  mal_chancre_sev:          { fiche:3, label:'Maladie — Chancre (Sévérité)',             required:false, visible:true },
  mal_moniliose_sev:        { fiche:3, label:'Maladie — Moniliose (Sévérité)',           required:false, visible:true },
  mal_witches_broom_sev:    { fiche:3, label:'Maladie — Balai de sorcière (Sévérité)',  required:false, visible:true },
  mal_anthracnose_sev:      { fiche:3, label:'Maladie — Anthracnose (Sévérité)',         required:false, visible:true },
  mal_pourriture_noire_sev: { fiche:3, label:'Maladie — Pourriture noire (Sévérité)',   required:false, visible:true },
  mal_ceratocystis_sev:     { fiche:3, label:'Maladie — Ceratocystis (Sévérité)',       required:false, visible:true },
  mal_verticilliose_sev:    { fiche:3, label:'Maladie — Verticilliose (Sévérité)',      required:false, visible:true },
  mal_algues_sev:           { fiche:3, label:'Maladie — Algues/mousses (Sévérité)',     required:false, visible:true },
  rav_foreurs_tronc_sev:    { fiche:3, label:'Ravageur — Foreurs du tronc (Sévérité)', required:false, visible:true },
  rav_foreurs_cabosses_sev: { fiche:3, label:'Ravageur — Foreurs cabosses (Sévérité)', required:false, visible:true },
  rav_punaises_sev:         { fiche:3, label:'Ravageur — Punaises (Sévérité)',          required:false, visible:true },
  rav_cochenilles_sev:      { fiche:3, label:'Ravageur — Cochenilles (Sévérité)',       required:false, visible:true },
  rav_termites_sev:         { fiche:3, label:'Ravageur — Termites (Sévérité)',          required:false, visible:true },
  rav_rongeurs_sev:         { fiche:3, label:'Ravageur — Rongeurs (Sévérité)',          required:false, visible:true },
  rav_fourmis_sev:          { fiche:3, label:'Ravageur — Fourmis (Sévérité)',           required:false, visible:true },
  rav_acariens_sev:         { fiche:3, label:'Ravageur — Acariens (Sévérité)',          required:false, visible:true },
  rav_thrips_sev:           { fiche:3, label:'Ravageur — Thrips (Sévérité)',            required:false, visible:true },
  rav_chenilles_sev:        { fiche:3, label:'Ravageur — Chenilles (Sévérité)',         required:false, visible:true },
  rav_pucerons_sev:         { fiche:3, label:'Ravageur — Pucerons (Sévérité)',          required:false, visible:true },
  par_gourmands_val:        { fiche:3, label:'Paramètre — Gourmands',                  required:false, visible:true },
  par_momifiees_val:        { fiche:3, label:'Paramètre — Cabosses momifiées',          required:false, visible:true },
  par_epiphytes_val:        { fiche:3, label:'Paramètre — Plantes épiphytes',           required:false, visible:true },
  par_loranthus_val:        { fiche:3, label:'Paramètre — Loranthus',                  required:false, visible:true },
  par_enherbement_val:      { fiche:3, label:'Paramètre — Enherbement',                required:false, visible:true },
  par_feuilles_jaunes_val:  { fiche:3, label:'Paramètre — Jaunissement feuilles',      required:false, visible:true },
  par_defoliation_val:      { fiche:3, label:'Paramètre — Défoliation',                required:false, visible:true },
  par_branches_mortes_val:  { fiche:3, label:'Paramètre — Branches mortes',            required:false, visible:true },
  par_ecorce_alteree_val:   { fiche:3, label:'Paramètre — Écorce altérée',             required:false, visible:true },
  par_flux_gomme_val:       { fiche:3, label:'Paramètre — Flux de gomme',              required:false, visible:true },
  par_fruits_vides_val:     { fiche:3, label:'Paramètre — Cabosses vides',             required:false, visible:true },
  par_chute_fleurs_val:     { fiche:3, label:'Paramètre — Chute des fleurs',           required:false, visible:true },

  // FICHE 4
  _h4:              { fiche:4, type:'header', label:'FICHE 4 — Profil Socio-Économique', required:false, visible:true },
  ep0_compte:       { fiche:4, label:'Mobile Money — A un compte',          required:false, visible:true },
  ep0_financement:  { fiche:4, label:'Mobile Money — A bénéficié financement', required:false, visible:true },
  ep1_compte:       { fiche:4, label:'Microfinance — A un compte',          required:false, visible:true },
  ep2_compte:       { fiche:4, label:'Banque — A un compte',                required:false, visible:true },
  prod0_kg:         { fiche:4, label:'Production année N-1 (kg)',            required:false, visible:true },
  prod0_fcfa:       { fiche:4, label:'Revenu brut année N-1 (FCFA)',         required:false, visible:true },
  prod1_kg:         { fiche:4, label:'Production année N-2 (kg)',            required:false, visible:true },
  prod2_kg:         { fiche:4, label:'Production année N-3 (kg)',            required:false, visible:true },
  dep_scolarite_an: { fiche:4, label:'Dépenses — Scolarité/an',             required:false, visible:true },
  dep_nourriture_an:{ fiche:4, label:'Dépenses — Nourriture/an',            required:false, visible:true },
  dep_sante_an:     { fiche:4, label:'Dépenses — Santé/an',                 required:false, visible:true },
  dep_electricite_an:{fiche:4, label:'Dépenses — Électricité/an',           required:false, visible:true },
  dep_eau_an:       { fiche:4, label:'Dépenses — Eau courante/an',          required:false, visible:true },
  dep_funerailles_an:{ fiche:4, label:'Dépenses — Funérailles/an',          required:false, visible:true },
  dep_charges_an:   { fiche:4, label:'Dépenses — Charges sociales/an',      required:false, visible:true },
};

function getFieldConfig() {
  try {
    const stored = localStorage.getItem('cacaoCollect_fieldConfig');
    const base = JSON.parse(JSON.stringify(DEFAULT_FIELD_CONFIG));
    if (!stored) return base;
    const saved = JSON.parse(stored);
    // Merge: keep all default keys, override with saved values
    Object.keys(saved).forEach(k => { if (base[k]) base[k] = Object.assign(base[k], saved[k]); });
    return base;
  } catch { return JSON.parse(JSON.stringify(DEFAULT_FIELD_CONFIG)); }
}
function saveFieldConfig(cfg) { localStorage.setItem('cacaoCollect_fieldConfig', JSON.stringify(cfg)); }
function getUsers() { try { const s=localStorage.getItem('cacaoCollect_users'); return s?JSON.parse(s):DEFAULT_USERS; } catch { return DEFAULT_USERS; } }
function saveUsers(u) { localStorage.setItem('cacaoCollect_users', JSON.stringify(u)); }
