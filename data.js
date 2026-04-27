/* =============================================
   CACAO COLLECT v2 — DONNÉES DE RÉFÉRENCE
   ============================================= */

// Cultures de rente en Côte d'Ivoire
const CULTURES_CI = [
  'Cacao','Café','Hévéa','Palmier à huile','Anacarde (Cajou)',
  'Coton','Canne à sucre','Cocotier','Banane plantain','Banane douce',
  'Ananas','Mangue','Avocat','Citrus (Orange/Citron/Pamplemousse)',
  'Teck','Gmelina','Eucalyptus','Cola','Poivre','Vanille','Autre'
];

// Maladies du cacaoyer
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

// Ravageurs du cacaoyer
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

// Paramètres complémentaires état de la cacaoyère
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

// Équipements agricoles
const EQUIPEMENTS = [
  { type: 'Matériel de traitement', items: ['Pulvérisateur', 'Atomiseur', 'EPI (Équipement de Protection Individuelle)'] },
  { type: 'Matériel de transport', items: ['Tricycle', 'Brouette', 'Camion/Camionnette'] },
  { type: 'Moyen de déplacement', items: ['Vélo', 'Moto', 'Voiture'] },
  { type: 'Matériel de séchage', items: ['Claie/Séco', 'Aire cimentée', 'Séchoir solaire'] },
  { type: 'Matériel de fermentation', items: ['Bac de fermentation'] },
  { type: 'Petit outillage', items: ['Machette', 'Émondoir', 'Matériel de récolte'] },
  { type: 'Motorisé', items: ['Tronçonneuse', 'Motopompe'] },
];

// Utilisateurs du système
const DEFAULT_USERS = [
  { id: 'u0', username: 'admin', password: 'Admin2024!', name: 'Administrateur Général', role: 'admin', region: 'Nationale', active: true },
  { id: 'u1', username: 'enqueteur1', password: 'cacao2024', name: 'Kouassi Amani', role: 'enqueteur', region: 'Abidjan', active: true },
  { id: 'u2', username: 'enqueteur2', password: 'cacao2024', name: 'Traoré Fatou', role: 'enqueteur', region: 'Yamoussoukro', active: true },
  { id: 'u3', username: 'superviseur', password: 'super2024', name: 'Koffi Brou', role: 'superviseur', region: 'Nationale', active: true },
];

// Niveaux de sévérité
const SEVERITE_OPTS = [
  { v: '0', l: '0. Non observé' },
  { v: '1', l: '1. Aucun' },
  { v: '2', l: '2. Faible' },
  { v: '3', l: '3. Moyen' },
  { v: '4', l: '4. Fort' },
];

const FICHE_NAMES = {
  1: 'Profil Producteur & Ménage',
  2: 'Profil de l\'Exploitation',
  3: 'Informations sur la Cacaoyère',
  4: 'Profil Socio-Économique',
};

// Config admin — questions obligatoires par défaut
const DEFAULT_FIELD_CONFIG = {
  // Fiche 1
  'date': { required: true, visible: true, label: 'Date de collecte' },
  'nomEnqueteur': { required: true, visible: true, label: 'Nom enquêteur' },
  'nomProducteur': { required: true, visible: true, label: 'Nom producteur' },
  'codeNational': { required: true, visible: true, label: 'Code national producteur' },
  'sousPrefecture': { required: true, visible: true, label: 'Sous-Préfecture' },
  'village': { required: true, visible: true, label: 'Village' },
  // Fiche 2
  'gpsLat': { required: true, visible: true, label: 'Latitude GPS' },
  'gpsLon': { required: true, visible: true, label: 'Longitude GPS' },
  // Fiche 3
  'dispositifPlantation': { required: false, visible: true, label: 'Dispositif de plantation' },
  'densite': { required: false, visible: true, label: 'Densité des arbres' },
  // Fiche 4
  'prod_0_kg': { required: false, visible: true, label: 'Production année N-1 (kg)' },
};

function getFieldConfig() {
  try {
    const stored = localStorage.getItem('cacaoCollect_fieldConfig');
    return stored ? JSON.parse(stored) : DEFAULT_FIELD_CONFIG;
  } catch { return DEFAULT_FIELD_CONFIG; }
}
function saveFieldConfig(cfg) {
  localStorage.setItem('cacaoCollect_fieldConfig', JSON.stringify(cfg));
}

function getUsers() {
  try {
    const stored = localStorage.getItem('cacaoCollect_users');
    return stored ? JSON.parse(stored) : DEFAULT_USERS;
  } catch { return DEFAULT_USERS; }
}
function saveUsers(users) {
  localStorage.setItem('cacaoCollect_users', JSON.stringify(users));
}
