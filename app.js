async function testarBackend() {
  try {
    const resposta = await fetch(`${API_BASE}/api/locais`);
    const dados = await resposta.json();
    console.log("Dados vindos do backend:", dados);
  } catch (erro) {
    console.error("Erro no teste do backend:", erro);
  }
}

// ============================================================
// AUTENTICAÇÃO LOCAL / SESSÃO
// ============================================================
const API_BASE = "";
const USER_STORAGE_KEY = "autensense-current-user";

function salvarUsuarioLocal(user) {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function obterUsuarioLocal() {
  try {
    return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function limparUsuarioLocal() {
  localStorage.removeItem(USER_STORAGE_KEY);
}

// ============================================================
// ESTADO GLOBAL
// ============================================================
let currentUser = null;
let perfilAtivo = null;
let favoritosIds = new Set();
let placesData = [];
let map = null;
let markers = new Map();
let userLocation = null;
let watchId = null;
let userMarker = null;
let userCircle = null;

const APP_CITY_DEFAULT = "Manaus";
const MAP_DEFAULT_CENTER = [-3.119, -60.021];
const MAP_DEFAULT_ZOOM = 12;

const IMAGE_FOLDER = "imagens/";
const IMAGE_FALLBACK = "imagens/hero.jpg";

function getImagePath(imageName = "hero.jpg") {
  const img = String(imageName || "hero.jpg").trim();

  if (!img) return IMAGE_FALLBACK;

  if (
    img.startsWith("http://") ||
    img.startsWith("https://") ||
    img.startsWith("data:") ||
    img.startsWith("blob:") ||
    img.startsWith("imagens/")
  ) {
    return img;
  }

  return `${IMAGE_FOLDER}${img}`;
}


// ============================================================
// BASE FIXA DE LOCAIS PRÉ-CADASTRADOS
// sensory:
// baixo = Tranquilo
// medio = Moderado
// alto  = Alerta
// ============================================================
const PLACES_PRESET = [
  {
    id: "carrefour-ponta-negra",
    name: "Carrefour Ponta Negra",
    cat: "mercado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.09229,
    lng: -60.0499
  },
  {
    id: "carrefour-flores",
    name: "Carrefour Flores",
    cat: "mercado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.10413,
    lng: -60.0114
  },
  {
    id: "assai-atacadista",
    name: "Assai- Atacadista",
    cat: "mercado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.05458,
    lng: -60.0233
  },
  {
    id: "atack-hipermercado",
    name: "Atack Hipermercado",
    cat: "mercado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.0421,
    lng: -60.0088
  },
  {
    id: "nova-era-flores",
    name: "Nova Era Flores",
    cat: "mercado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.08985,
    lng: -60.0556
  },
  {
    id: "nova-era-grande-circular",
    name: "Nova Era Grande Circular",
    cat: "mercado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.06588,
    lng: -59.9905
  },
  {
    id: "db-supermercados",
    name: "DB Supermercados",
    cat: "mercado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.08888,
    lng: -60.0056
  },
  {
    id: "db-supermercados-nova-cidade",
    name: "DB Supermercados Nova Cidade",
    cat: "mercado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.05042,
    lng: -59.9901
  },
  {
    id: "vitoria-supermercados",
    name: "Vitoria Supermercados",
    cat: "mercado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.0832,
    lng: -59.9779
  },
  {
    id: "manauara-shopping",
    name: "Manauara Shopping",
    cat: "shopping",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.10413,
    lng: -60.0114
  },
  {
    id: "amazonas-shopping",
    name: "Amazonas Shopping",
    cat: "shopping",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.09434,
    lng: -60.0225
  },
  {
    id: "shopping-ponta-negra",
    name: "Shopping Ponta Negra",
    cat: "shopping",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.08459,
    lng: -60.0724
  },
  {
    id: "sumauma-park-shopping",
    name: "Sumauma Park Shopping",
    cat: "shopping",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.03019,
    lng: -59.9781
  },
  {
    id: "millennium-shopping",
    name: "Millennium Shopping",
    cat: "shopping",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.09954,
    lng: -60.0265
  },
  {
    id: "studio-5-shopping",
    name: "Studio 5 Shopping",
    cat: "shopping",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.12482,
    lng: -59.9831
  },
  {
    id: "via-norte-shopping",
    name: "Via Norte Shopping",
    cat: "shopping",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -2.99998,
    lng: -60.002
  },
  {
    id: "teatro-amazonas",
    name: "Teatro Amazonas",
    cat: "cultural",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.13028,
    lng: -60.0234
  },
  {
    id: "pal-cio-da-justi-a",
    name: "Palácio da Justiça",
    cat: "cultural",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.13024,
    lng: -60.0244
  },
  {
    id: "palacete-provincial",
    name: "Palacete Provincial",
    cat: "cultural",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.13555,
    lng: -60.021
  },
  {
    id: "centro-cultural-dos-povos-da-amaz-nia",
    name: "Centro Cultural dos Povos da Amazônia",
    cat: "cultural",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.133,
    lng: -59.9875
  },
  {
    id: "largo-s-o-sebasti-o",
    name: "Largo São Sebastião",
    cat: "cultural",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.13033,
    lng: -60.0225
  },
  {
    id: "mercado-municipal-adolpho-lisboa",
    name: "Mercado Municipal Adolpho Lisboa",
    cat: "cultural",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.13995,
    lng: -60.0236
  },
  {
    id: "porto-de-manaus",
    name: "Porto de Manaus",
    cat: "cultural",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -5.65322,
    lng: -62.226
  },
  {
    id: "centro-hist-rico-de-manaus",
    name: "Centro Histórico de Manaus",
    cat: "cultural",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.13384,
    lng: -60.0297
  },
  {
    id: "parque-do-mindu",
    name: "Parque do Mindu",
    cat: "parque",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.10233,
    lng: -60.0254
  },
  {
    id: "pra-a-da-saudade",
    name: "Praça da Saudade",
    cat: "parque",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.12751,
    lng: -60.0259
  },
  {
    id: "pra-a-heliodoro-balbi",
    name: "Praça Heliodoro Balbi",
    cat: "parque",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.13513,
    lng: -60.0215
  },
  {
    id: "pra-a-do-congresso",
    name: "Praça do Congresso",
    cat: "parque",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.12852,
    lng: -60.0241
  },
  {
    id: "parque-rio-negro",
    name: "Parque Rio Negro",
    cat: "parque",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.12913,
    lng: -60.0359
  },
  {
    id: "parque-gigantes-da-floresta",
    name: "Parque Gigantes da Floresta",
    cat: "parque",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.04856,
    lng: -59.9474
  },
  {
    id: "parque-da-crian-a",
    name: "Parque da Criança",
    cat: "infantil",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.10388,
    lng: -60.0016
  },
  {
    id: "magic-games-manauara-shopping",
    name: "Magic Games (Manauara Shopping)",
    cat: "infantil",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.10413,
    lng: -60.0114
  },
  {
    id: "cinemark",
    name: "Cinemark",
    cat: "infantil",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.10413,
    lng: -60.0114
  },
  {
    id: "cinepolis",
    name: "Cinepolis",
    cat: "infantil",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.0846,
    lng: -60.0724
  },
  {
    id: "bosque-da-ci-ncia",
    name: "Bosque da Ciência",
    cat: "natureza",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.09743,
    lng: -59.9877
  },
  {
    id: "musa-museu-da-amaz-nia",
    name: "MUSA (Museu da Amazônia)",
    cat: "natureza",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.0072,
    lng: -59.9399
  },
  {
    id: "reserva-florestal-adolpho-ducke",
    name: "Reserva Florestal Adolpho Ducke",
    cat: "natureza",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -2.96255,
    lng: -59.9229
  },
  {
    id: "zoologico-do-cigs",
    name: "Zoologico do CIGS",
    cat: "natureza",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.10178,
    lng: -60.0451
  },
  {
    id: "museu-da-amazonia",
    name: "Museu da Amazonia",
    cat: "natureza",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.00719,
    lng: -59.9399
  },
  {
    id: "museu-do-seringal-vila-para-so",
    name: "Museu do Seringal Vila Paraíso",
    cat: "natureza",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.13308,
    lng: -59.9873
  },
  {
    id: "encontro-das-guas",
    name: "Encontro das Águas",
    cat: "natureza",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.11885,
    lng: -59.8927
  },
  {
    id: "caf-regional-priscila",
    name: "Café Regional Priscila",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.05559,
    lng: -60.0825
  },
  {
    id: "caf-do-pina",
    name: "Café do Pina",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.13479,
    lng: -60.0222
  },
  {
    id: "cucina-borges",
    name: "Cucina Borges",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.10481,
    lng: -60.0171
  },
  {
    id: "recanto-do-sabor",
    name: "Recanto do Sabor",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.05695,
    lng: -60.0268
  },
  {
    id: "coco-bambu",
    name: "Coco Bambu",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.08198,
    lng: -60.0691
  },
  {
    id: "choupana-restaurante",
    name: "Choupana Restaurante",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.10862,
    lng: -60.013
  },
  {
    id: "banzeiro",
    name: "Banzeiro",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.11227,
    lng: -60.0169
  },
  {
    id: "caxiri",
    name: "Caxiri",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.12989,
    lng: -60.0225
  },
  {
    id: "loppiano",
    name: "Loppiano",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 2, light: 2, flow: 2,
    sensory: "medio",
    lat: -3.11755,
    lng: -60.0168
  },
  {
    id: "pra-a-de-alimenta-o-manauara-shopping",
    name: "Praça de Alimentação Manauara Shopping",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.10413,
    lng: -60.0114
  },
  {
    id: "pra-a-de-alimenta-o-amazonas-shopping",
    name: "Praça de Alimentação Amazonas Shopping",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.09434,
    lng: -60.0225
  },
  {
    id: "bar-do-armando",
    name: "Bar do Armando",
    cat: "gastronomia",
    city: "Manaus",
    address: "",
    image: "",
    noise: 3, light: 3, flow: 3,
    sensory: "alto",
    lat: -3.1299,
    lng: -60.0222
  },
  {
    id: "eamaar-espa-o-de-atendimento-multidisciplinar",
    name: "EAMAAR - Espaço de Atendimento Multidisciplinar",
    cat: "especializado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.07249,
    lng: -60.0482
  },
  {
    id: "centro-de-reabilita-o-integral",
    name: "Centro de Reabilitação Integral",
    cat: "especializado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.08219,
    lng: -60.0186
  },
  {
    id: "instituto-autismo-no-amazonas",
    name: "Instituto Autismo no Amazonas",
    cat: "especializado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.08245,
    lng: -60.0171
  },
  {
    id: "amua-associa-o-das-m-es-unidas-pelo-autismo",
    name: "AMUA associação das mães unidas pelo autismo",
    cat: "especializado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.01734,
    lng: -60.0416
  },
  {
    id: "casa-azul",
    name: "Casa Azul",
    cat: "especializado",
    city: "Manaus",
    address: "",
    image: "",
    noise: 1, light: 1, flow: 1,
    sensory: "baixo",
    lat: -3.09402,
    lng: -60.0392
  }
];

// ============================================================
// COORDENADAS CORRIGIDAS
// ============================================================
const PRESET_COORDS = {
  "vitoria-supermercados": { lat: -3.027836019851122, lng: -60.06528637116414 },
  "manaus-plaza-shopping-centro-convencoes": { lat: -3.097340342052424, lng: -60.02329029999999 },
  "supermercado-veneza": { lat: -3.0634735784707416, lng: -60.090113499999994 },
  "hiper-db-nova-cidade": { lat: -3.0028296602368125, lng: -59.98081938650755 },
  "shopping-ponta-negra": { lat: -3.084484100620811, lng: -60.072416399999994 },
  "pizzaria-super-herois": { lat: -3.0554196369969917, lng: -60.08226098465663 },
  "teatro-amazonas": { lat: -3.130117394740983, lng: -60.023414200000005 },
  "manauara-shopping": { lat: -3.1036175297173236, lng: -60.013554657671705 },
  "parque-cidade-da-crianca-castro-alves": { lat: -3.1038578166535276, lng: -60.00181785582077 },
  "inpa": { lat: -3.0973948947042924, lng: -59.98784418660171 },
  "musa-museu-da-amazonia": { lat: -3.006985446868343, lng: -59.93997282883585 },
  "parque-municipal-do-mindu": { lat: -3.0778731788664553, lng: -60.00836708360627 },
  "nene-park": { lat: -3.0577670915171287, lng: -59.94776882883585 },
  "mirage-park": { lat: -3.0834249472543984, lng: -60.023088699999995 },
  "puppy-play": { lat: -2.9992892161977127, lng: -60.002695413492454 },
  "planeta-imaginario-manaus": { lat: -3.0845229607549407, lng: -60.07238460000001 },
  "passinho-kids": { lat: -3.1318533283227006, lng: -60.02822256288093 }
};

// ============================================================
// ELEMENTOS
// ============================================================


const chip = document.getElementById("userDisplayName");
const btnAuthToggle = document.getElementById("btnAuthToggle");
const geoStatus = document.getElementById("geoStatus");
const resultsEl = document.getElementById("results");

const filterQueryInput = document.getElementById("f_q");
const filterCategorySelect = document.getElementById("f_cat");
const filterLevelSelect = document.getElementById("f_level");
const filterNearCheckbox = document.getElementById("f_near");
const filterRadiusSelect = document.getElementById("f_radius");

const homeSearchInput = document.getElementById("q");
const homeCitySelect = document.getElementById("city");
const homeCategorySelect = document.getElementById("category");
const homeSensorySelect = document.getElementById("sensory");
const themeToggle = document.getElementById("themeToggle");
const themeToggleIcon = document.getElementById("themeToggleIcon");
const themeToggleText = document.getElementById("themeToggleText");

// ============================================================
// HELPERS
// ============================================================
function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function toNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function catLabel(cat) {
  return {
    mercado: "Mercado / Supermercado",
    shopping: "Shopping",
    cultural: "Cultural / Turismo",
    parque: "Parque",
    infantil: "Infantil / Recreação",
    natureza: "Natureza / Museu",
    gastronomia: "Gastronomia",
    outro: "Outro"
  }[cat] || cat;
}

function level(place) {
  if (place.sensory) return place.sensory;

  const media = (place.noise + place.light + place.flow) / 3;
  if (media <= 2) return "baixo";
  if (media <= 3.5) return "medio";
  return "alto";
}

function levelLabel(lv) {
  return {
    baixo: "Tranquilo",
    medio: "Moderado",
    alto: "Alerta"
  }[lv] || lv;
}

function levelColor(lv) {
  return {
    baixo: "#2ecc71",
    medio: "#f1c40f",
    alto: "#e74c3c"
  }[lv] || "#999";
}

function categoryImageFallback(cat) {
  const map = {
    mercado: "shoppingMall.jpg",
    shopping: "shoppingMall.jpg",
    cultural: "ambienteSilencioso.jpg",
    parque: "pracaAconcheganteBanco.jpg",
    infantil: "espacoAdaptado.jpg",
    natureza: "iluminacaoNatural.jpg",
    gastronomia: "restaurante.jpg",
    outro: "hero.jpg"
  };
  return getImagePath(map[cat] || "hero.jpg");
}

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  const toast = document.getElementById("favToast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.remove("hidden");

  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.add("hidden");
  }, 2800);
}

function updateStatPlaces() {
  const stat = document.querySelector(".statsStrip .statNum");
  if (stat) stat.textContent = `${placesData.length}+`;
}

function distKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getBestVisitWindow(place) {
  const avg = (place.noise + place.light + place.flow) / 3;

  if (avg <= 2) {
    return {
      label: "Manhã",
      icon: "🌤️",
      text: "Ambiente geralmente mais tranquilo pela manhã."
    };
  }

  if (avg <= 3.5) {
    return {
      label: "Tarde",
      icon: "🌥️",
      text: "Movimento moderado durante a tarde."
    };
  }

  return {
    label: "Noite",
    icon: "🌙",
    text: "A noite costuma ter menos fluxo e estímulos."
  };
}

function getVisitInsights(place) {
  const avg = (place.noise + place.light + place.flow) / 3;

  if (avg <= 2) {
    return { best: "Manhã", empty: "Manhã" };
  }

  if (avg <= 3.5) {
    return { best: "Tarde", empty: "Manhã" };
  }

  return { best: "Noite", empty: "Noite" };
}

function scoreByPerfil(place, perfil) {
  const pr = perfil?.pesoRuido || 1;
  const pl = perfil?.pesoLuz || 1;
  const pm = perfil?.pesoMovimento || 1;

  return (5 - place.noise) * pr + (5 - place.light) * pl + (5 - place.flow) * pm;
}

// ============================================================
// RANKING INTELIGENTE - PASSO 3
// ============================================================
function getStimulusProfile(place) {
  return {
    ruido: place.noise,
    luz: place.light,
    movimento: place.flow
  };
}

function getPerfilCompatibility(place, perfil) {
  const stimuli = {
    ruido: Number(place.noise || 3),
    luz: Number(place.light || 3),
    movimento: Number(place.flow || 3)
  };

  if (!perfil) {
    const averageStimulus = (stimuli.ruido + stimuli.luz + stimuli.movimento) / 3;
    const baseScore = 100 - (averageStimulus - 1) * 18;

    const calmBonus =
      stimuli.ruido <= 2 && stimuli.luz <= 2 && stimuli.movimento <= 2
        ? 12
        : 0;

    const balancedBonus =
      Math.max(stimuli.ruido, stimuli.luz, stimuli.movimento) -
        Math.min(stimuli.ruido, stimuli.luz, stimuli.movimento) <= 1
        ? 8
        : 0;

    return Math.max(0, Math.min(130, Math.round(baseScore + calmBonus + balancedBonus)));
  }

  const pesoRuido = Number(perfil.pesoRuido || perfil.sensRuido || 3);
  const pesoLuz = Number(perfil.pesoLuz || perfil.sensLuz || 3);
  const pesoMovimento = Number(perfil.pesoMovimento || perfil.sensFluxo || 3);

  const pesos = {
    ruido: pesoRuido,
    luz: pesoLuz,
    movimento: pesoMovimento
  };

  const compatRuido = (6 - stimuli.ruido) * pesoRuido * 7;
  const compatLuz = (6 - stimuli.luz) * pesoLuz * 7;
  const compatMovimento = (6 - stimuli.movimento) * pesoMovimento * 7;

  let score = compatRuido + compatLuz + compatMovimento;

  const penaltyRuido = stimuli.ruido >= 4 && pesoRuido >= 4 ? 18 : 0;
  const penaltyLuz = stimuli.luz >= 4 && pesoLuz >= 4 ? 18 : 0;
  const penaltyMovimento = stimuli.movimento >= 4 && pesoMovimento >= 4 ? 18 : 0;

  score -= penaltyRuido + penaltyLuz + penaltyMovimento;

  const allCalm = stimuli.ruido <= 2 && stimuli.luz <= 2 && stimuli.movimento <= 2;
  const balancedPlace =
    Math.max(stimuli.ruido, stimuli.luz, stimuli.movimento) -
      Math.min(stimuli.ruido, stimuli.luz, stimuli.movimento) <= 1;

  if (allCalm) score += 16;
  if (balancedPlace) score += 10;

  const highPriorityKey = Object.entries(pesos).sort((a, b) => b[1] - a[1])[0]?.[0];
  if (highPriorityKey && stimuli[highPriorityKey] <= 2) {
    score += 14;
  }

  if (level(place) === "baixo") score += 10;
  else if (level(place) === "medio") score += 4;
  else score -= 6;

  return Math.max(0, Math.min(140, Math.round(score)));
}

function getCompatibilityBucket(score) {
  if (score >= 110) return "Ideal para você";
  if (score >= 90) return "Boa compatibilidade";
  if (score >= 70) return "Compatibilidade moderada";
  return "Pode exigir atenção";
}

function getCompatibilityReason(place, perfil) {
  const ruido = Number(place.noise || 3);
  const luz = Number(place.light || 3);
  const movimento = Number(place.flow || 3);

  if (!perfil) {
    if (ruido <= 2 && luz <= 2 && movimento <= 2) {
      return "Ambiente calmo e bem equilibrado para a maioria dos perfis.";
    }
    if (level(place) === "baixo") {
      return "Local com poucos estímulos e boa sensação de conforto.";
    }
    if (level(place) === "medio") {
      return "Tem equilíbrio entre conforto e movimento ao longo do dia.";
    }
    return "Pode concentrar mais estímulos, principalmente em horários cheios.";
  }

  const pesoRuido = Number(perfil.pesoRuido || perfil.sensRuido || 3);
  const pesoLuz = Number(perfil.pesoLuz || perfil.sensLuz || 3);
  const pesoMovimento = Number(perfil.pesoMovimento || perfil.sensFluxo || 3);

  const sensitivityMap = [
    { label: "ruído", peso: pesoRuido, valor: ruido },
    { label: "iluminação", peso: pesoLuz, valor: luz },
    { label: "movimento", peso: pesoMovimento, valor: movimento }
  ].sort((a, b) => b.peso - a.peso);

  const principal = sensitivityMap[0];
  const secundaria = sensitivityMap[1];

  if (principal.label === "ruído" && ruido <= 2) {
    return "Muito indicado para quem tem maior sensibilidade a barulho.";
  }
  if (principal.label === "iluminação" && luz <= 2) {
    return "Boa escolha para perfis com maior sensibilidade à luz.";
  }
  if (principal.label === "movimento" && movimento <= 2) {
    return "Mais adequado para quem se incomoda com fluxo de pessoas.";
  }

  if (principal.valor >= 4 && principal.peso >= 4) {
    return `Pode incomodar por conta de ${principal.label} mais intenso(a) neste local.`;
  }

  if (principal.valor <= 3 && secundaria.valor <= 3) {
    return `Boa combinação entre ${principal.label} e ${secundaria.label} para o perfil ativo.`;
  }

  if (level(place) === "baixo") {
    return "Mesmo com variações, continua sendo uma opção mais tranquila.";
  }

  if (level(place) === "medio") {
    return "Pode funcionar melhor em horários mais leves e organizados.";
  }

  return "Este local pode exigir planejamento maior antes da visita.";
}

function getCompatibilityTag(place, perfil) {
  const score = getPerfilCompatibility(place, perfil);
  return getCompatibilityBucket(score);
}

function getReasonTags(place) {
  const tags = [];
  const lv = level(place);

  if (lv === "baixo") {
    tags.push("Silencioso", "Luz Natural", "Calmo");
  } else if (lv === "medio") {
    tags.push("Sons Moderados", "Luz Ajustável", "Pouco Movimento");
  } else {
    tags.push("Mais Estímulos", "Fluxo Intenso", "Atenção Sensorial");
  }

  return tags.slice(0, 3);
}

function getRecommendationText(place) {
  const lv = level(place);
  if (lv === "baixo") return "Ambiente com baixo estímulo sensorial.";
  if (lv === "medio") return "Local com estímulo sensorial moderado.";
  return "Pode ter maior fluxo e estímulos em alguns horários.";
}

function getLowSensoryRanking() {
  if (!placesData.length) return [];

  return [...placesData]
    .sort((a, b) => {
      const scoreA = (a.noise + a.light + a.flow) / 3;
      const scoreB = (b.noise + b.light + b.flow) / 3;
      return scoreA - scoreB;
    })
    .slice(0, 5);
}

function getNearbyPlaces(radius = 3) {
  if (!userLocation) return [];

  return placesData
    .map(place => {
      if (place.lat == null || place.lng == null) return null;

      const distance = distKm(
        userLocation.lat,
        userLocation.lng,
        Number(place.lat),
        Number(place.lng)
      );

      return { ...place, distance };
    })
    .filter(place => place && place.distance <= radius)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);
}

function renderSmartInsights() {
  const ranking = getLowSensoryRanking();
  const nearby = getNearbyPlaces();

  console.log("⭐ Ranking menos sensorial:", ranking);
  console.log("📍 Locais próximos:", nearby);
}

// ============================================================
// TEMA VISUAL - SENSORIAL / PADRÃO
// ============================================================
const THEME_STORAGE_KEY = "autensense-theme";

function updateThemeToggleUI(theme) {
  if (!themeToggleIcon || !themeToggleText) return;

  if (theme === "normal") {
    themeToggleIcon.textContent = "⚡";
    themeToggleText.textContent = "Modo Padrão";
  } else {
    themeToggleIcon.textContent = "🌿";
    themeToggleText.textContent = "Modo Sensorial";
  }
}

function applyTheme(theme) {
  const selectedTheme = theme === "normal" ? "normal" : "sensory";
  document.body.setAttribute("data-theme", selectedTheme);
  updateThemeToggleUI(selectedTheme);
  localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);

  if (map) {
    setTimeout(() => map.invalidateSize(true), 120);
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || "sensory";
  applyTheme(savedTheme);

  themeToggle?.addEventListener("click", () => {
    const currentTheme = document.body.getAttribute("data-theme") || "sensory";
    const nextTheme = currentTheme === "sensory" ? "normal" : "sensory";
    applyTheme(nextTheme);
    showToast(nextTheme === "normal" ? "Modo padrão ativado." : "Modo sensorial ativado.");
  });
}

// ============================================================
// ============================================================
// AUTH TOGGLE MODAL
// ============================================================
document.addEventListener("click", event => {
  const btn = event.target.closest("[data-view='auth']");
  if (!btn) return;
  const authModal = document.getElementById("view-auth");
  if (authModal) {
    authModal.classList.toggle("hidden");
    if (!authModal.classList.contains("hidden")) {
      authModal.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }
});

// AUTH
// ============================================================
function traduzErroApi(code) {
  const erros = {
    EMAIL_JA_CADASTRADO: "E-mail já cadastrado.",
    EMAIL_INVALIDO: "E-mail inválido.",
    SENHA_FRACA: "A senha deve ter pelo menos 6 caracteres.",
    USUARIO_NAO_ENCONTRADO: "Usuário não encontrado.",
    SENHA_INCORRETA: "Senha incorreta.",
    CAMPOS_OBRIGATORIOS: "Preencha todos os campos.",
    ERRO_INTERNO: "Erro interno do servidor."
  };
  return erros[code] || "Erro inesperado.";
}

function atualizarUIAuth() {
  const user = currentUser;

  document.querySelectorAll(".btnLogout").forEach(btn => {
    btn.classList.toggle("hidden", !user);
  });

  if (user) {
    chip.textContent = user.displayName || (user.email ? user.email.split("@")[0] : "Usuário");
    chip.classList.remove("hidden");
    btnAuthToggle.textContent = "Minha conta";
    btnAuthToggle.dataset.view = "perfil";
  } else {
    chip.classList.add("hidden");
    btnAuthToggle.textContent = "Entrar";
    btnAuthToggle.dataset.view = "auth";
    favoritosIds.clear();
    perfilAtivo = null;
  }

  renderRecommended();
}

async function iniciarSessao(user) {
  currentUser = {
    id: user.id,
    uid: user.id,
    email: user.email,
    displayName: user.displayName || user.nome || "Usuário"
  };

  salvarUsuarioLocal(currentUser);
  atualizarUIAuth();
  await loadFavoritos();
}

function restaurarSessao() {
  const user = obterUsuarioLocal();
  if (!user) {
    currentUser = null;
    atualizarUIAuth();
    return;
  }

  currentUser = {
    id: user.id,
    uid: user.id,
    email: user.email,
    displayName: user.displayName || "Usuário"
  };

  atualizarUIAuth();
  loadFavoritos();
}

document.getElementById("btnRegister")?.addEventListener("click", async () => {
  const name = document.getElementById("reg_name").value.trim();
  const email = document.getElementById("reg_email").value.trim();
  const pass = document.getElementById("reg_pass").value;
  const msg = document.getElementById("regMsg");

  try {
    const resposta = await fetch(`${API_BASE}/api/usuarios?acao=registrar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome: name,
        email,
        senha: pass
      })
    });

    const data = await resposta.json();

    if (!resposta.ok || data.erro) {
      msg.textContent = "Erro: " + (data.mensagem || "Desconhecido"); msg.className = "msg-error";
      return;
    }

    await iniciarSessao(data.usuario);
    msg.textContent = "Conta criada com sucesso!"; msg.className = "msg-success";
    setTimeout(() => setView("home"), 900);
  } catch (e) {
    console.error("REGISTER:", e);
    msg.textContent = "Erro ao criar conta."; msg.className = "msg-error";
  }
});

document.getElementById("btnLogin")?.addEventListener("click", async () => {
  const email = document.getElementById("login_email").value.trim();
  const pass = document.getElementById("login_pass").value;
  const msg = document.getElementById("loginMsg");

  try {
    const resposta = await fetch(`${API_BASE}/api/usuarios?acao=login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        senha: pass
      })
    });

    const data = await resposta.json();

    if (!resposta.ok || data.erro) {
      msg.textContent = "Erro: " + (data.mensagem || "Desconhecido"); msg.className = "msg-error";
      return;
    }

    await iniciarSessao(data.usuario);
    msg.textContent = "Login realizado!"; msg.className = "msg-success";
    setTimeout(() => setView("home"), 700);
  } catch (e) {
    console.error("LOGIN:", e);
    msg.textContent = "Erro ao realizar login."; msg.className = "msg-error";
  }
});

document.getElementById("btnForgotPasswordToggle")?.addEventListener("click", () => {
  const box = document.getElementById("forgotPasswordBox");
  const loginEmail = document.getElementById("login_email")?.value?.trim() || "";
  const resetEmail = document.getElementById("reset_email");
  const resetMsg = document.getElementById("resetMsg");

  box?.classList.toggle("hidden");

  if (resetEmail && loginEmail && !resetEmail.value) {
    resetEmail.value = loginEmail;
  }

  if (resetMsg) resetMsg.textContent = "";
});

document.getElementById("btnForgotPassword")?.addEventListener("click", async () => {
  const email = document.getElementById("reset_email")?.value.trim() || "";
  const msg = document.getElementById("resetMsg");

  if (!email) {
    msg.textContent = "Informe o e-mail cadastrado."; msg.className = "msg-error";
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/api/usuarios?acao=recuperar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    });

    const data = await resposta.json();

    if (!resposta.ok || data.erro) {
      msg.textContent = "Erro: " + (data.mensagem || "Desconhecido"); msg.className = "msg-error";
      return;
    }

    msg.textContent = data.mensagem; msg.className = "msg-success";
    showToast("Solicitação enviada.");
  } catch (e) {
    console.error("RESET PASSWORD:", e);
    msg.textContent = "Erro ao recuperar senha."; msg.className = "msg-error";
  }
});

document.querySelectorAll(".btnLogout").forEach(btn => {
  btn.addEventListener("click", async () => {
    currentUser = null;
    limparUsuarioLocal();
    atualizarUIAuth();
    setView("home");
    showToast("Você saiu da conta.");
  });
});

// ============================================================
// FIRESTORE / LOCAIS
// ============================================================
async function removeOldMockDocs() {
  const oldIds = ["p1", "p2", "p3", "p4", "p5", "p6"];

  for (const id of oldIds) {
    try {
      await deleteDoc(doc(db, "locais", id));
    } catch {
      // ignora
    }
  }
}

async function seedPresetPlaces() {
  await removeOldMockDocs();

  for (const place of PLACES_PRESET) {
    const coords = PRESET_COORDS[place.id] || null;

    await setDoc(
      doc(db, "locais", place.id),
      {
        nome: place.name,
        name: place.name,
        cat: place.cat,
        categoria: catLabel(place.cat),
        city: place.city,
        cidade: place.city,
        address: place.address,
        endereco: place.address,
        image: place.image,
        imagem: place.image,
        lat: coords ? Number(coords.lat) : null,
        lng: coords ? Number(coords.lng) : null,
        barulho: place.noise,
        luz: place.light,
        fluxo: place.flow,
        sensory: place.sensory
      },
      { merge: true }
    );
  }
}

function mapFirestorePlace(docItem) {
  const data = docItem.data();
  const fallbackCoords = PRESET_COORDS[docItem.id] || null;
  const category = data.cat || "outro";

  return {
    id: docItem.id,
    name: data.nome || data.name || "Local",
    cat: category,
    city: data.city || data.cidade || APP_CITY_DEFAULT,
    address: data.address || data.endereco || "",
    image: data.image || data.imagem || categoryImageFallback(category),
    lat: data.lat != null ? Number(data.lat) : fallbackCoords?.lat ?? null,
    lng: data.lng != null ? Number(data.lng) : fallbackCoords?.lng ?? null,
    noise: toNumber(data.barulho ?? data.noise, 3),
    light: toNumber(data.luz ?? data.light, 3),
    flow: toNumber(data.fluxo ?? data.flow, 3),
    sensory: data.sensory || null
  };
}

async function loadPlaces() {
  try {
    await seedPresetPlaces();

    const snap = await getDocs(collection(db, "locais"));
    placesData = snap.docs.map(mapFirestorePlace);

    placesData = placesData.filter(place =>
      PLACES_PRESET.some(base => base.id === place.id)
    );
  } catch (e) {
    console.error("Erro ao carregar locais:", e);

    placesData = PLACES_PRESET.map(place => ({
      ...place,
      lat: PRESET_COORDS[place.id]?.lat ?? null,
      lng: PRESET_COORDS[place.id]?.lng ?? null
    }));

    showToast("Usando base local de locais.");
  }

  updateStatPlaces();
  initMapIfNeeded();
  renderMarkers(placesData);
  applyFilters();
  fillRateSelect();
  renderRecommended();

  setTimeout(() => {
    renderSmartInsights();
  }, 1200);
}

async function carregarLocaisDoBackend() {
  try {
    const resposta = await fetch(`${API_BASE}/api/locais`);
    const dados = await resposta.json();

    if (!dados || dados.length === 0) {
      throw new Error("Backend retornou array vazio");
    }

    placesData = dados.map(local => ({
      id: local.id,
      name: local.nome,
      cat: local.categoria,
      city: local.cidade,
      address: local.endereco,
      image: local.imagem,
      noise: Number(local.ruido),
      light: Number(local.luz),
      flow: Number(local.fluxo),
      sensory: local.sensory,
      lat: Number(local.lat),
      lng: Number(local.lng)
    }));

    console.log("Locais carregados do backend:", placesData);
  } catch (erro) {
    console.error("Erro ao carregar locais do backend (ou banco vazio). Usando Fallback de 58 locais:", erro);
    placesData = [...PLACES_PRESET];
  } finally {
    updateStatPlaces();
    initMapIfNeeded();
    renderMarkers(placesData);
    applyFilters();
    fillRateSelect();
    renderRecommended();

    setTimeout(() => {
      renderSmartInsights();
    }, 1200);
  }
}

// ============================================================
// RECOMENDADOS
// ============================================================
function renderRecommended() {
  if (!document.getElementById("view-home")) return;
  const el = document.getElementById("recommended");
  const subtitle = document.getElementById("rankingSubtitle");

  if (!el) return;

  if (!placesData.length) {
    el.innerHTML = '<p class="muted">Carregando locais...</p>';
    return;
  }

  const sorted = [...placesData].sort(
    (a, b) => getPerfilCompatibility(b, perfilAtivo) - getPerfilCompatibility(a, perfilAtivo)
  );

  const top = sorted.slice(0, 3);

  if (subtitle) {
    if (perfilAtivo) {
      subtitle.innerHTML = `
        <div class="perfilAtivo">
          <span class="perfilAtivoText">
            Ranking personalizado para: <b>${escapeHtml(perfilAtivo.nome)}</b>
          </span>
          <span class="perfilScoreHint">
            Sensibilidades ativas: Ruído ${escapeHtml(perfilAtivo.pesoRuido || perfilAtivo.sensRuido || 3)} ·
            Luz ${escapeHtml(perfilAtivo.pesoLuz || perfilAtivo.sensLuz || 3)} ·
            Movimento ${escapeHtml(perfilAtivo.pesoMovimento || perfilAtivo.sensFluxo || 3)}
          </span>
        </div>
      `;
    } else {
      subtitle.innerHTML = `
        <p class="muted small" style="margin-bottom:10px">
          Ative um perfil TEA para receber recomendações mais inteligentes.
        </p>
      `;
    }
  }

  el.className = "recommendGrid";
  el.innerHTML = "";

  top.forEach((place, index) => {
    const lv = level(place);
    const badgeColor = levelColor(lv);
    const tags = getReasonTags(place);
    const categoria = catLabel(place.cat);
    const recommendationText = getRecommendationText(place);
    const compatibilityScore = getPerfilCompatibility(place, perfilAtivo);
    const compatibilityTag = getCompatibilityTag(place, perfilAtivo);
    const compatibilityReason = getCompatibilityReason(place, perfilAtivo);

    const card = document.createElement("div");
    card.className = `recCard ${index === 0 ? "recCard--top" : ""}`;
    card.innerHTML = `
      <div class="recTop" style="display:flex; gap:12px; align-items:center;">
        <img
          src="${escapeHtml(getImagePath(place.image))}"
          alt="${escapeHtml(place.name)}"
          style="width:68px; height:68px; border-radius:16px; object-fit:cover; flex-shrink:0; border:1px solid #d8e1ec;"
          onerror="this.src='imagens/hero.jpg'"
        >
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px;">
            <div class="recTitle" style="font-size:1.05rem; line-height:1.2;">
              ${escapeHtml(place.name)}
            </div>
            ${
              index === 0
                ? `<span class="bestBadge">⭐ Mais compatível</span>`
                : ""
            }
          </div>

          <div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:8px; align-items:center;">
            <span style="font-size:.82rem; color:#5d6c7b; font-weight:700;">
              ${escapeHtml(categoria)}
            </span>
            <span style="background:${badgeColor}; color:#fff; padding:5px 10px; border-radius:999px; font-size:.72rem; font-weight:800;">
              ${escapeHtml(levelLabel(lv))}
            </span>
          </div>
        </div>
      </div>

      <div class="recDivider" style="background:${badgeColor}; opacity:.55;"></div>

      <div class="recBody" style="display:flex; flex-direction:column; gap:12px;">
        <div class="compatibilityBox">
          <div class="compatibilityTop">
            <span class="compatibilityBadge">${escapeHtml(compatibilityTag)}</span>
            <span class="compatibilityScore">${compatibilityScore} pts</span>
          </div>
          <div class="compatibilityText">${escapeHtml(compatibilityReason)}</div>
        </div>

        <div style="font-size:.85rem; color:#6a7886; line-height:1.45;">
          ${escapeHtml(recommendationText)}
        </div>

        <div class="recList">
          ${tags
            .map(
              tag => `
                <div class="recItem">
                  <span>${escapeHtml(tag)}</span>
                </div>
              `
            )
            .join("")}
        </div>
      </div>

      <div class="recFooter" style="display:flex; gap:8px; margin-top:14px;">
        <button class="recBtn" style="flex:1;" data-go-map="${escapeHtml(place.id)}">
          Ver no mapa
        </button>
        <button class="recBtn" style="flex:1;" data-route="${escapeHtml(place.id)}">
          Abrir rota
        </button>
      </div>
    `;

    el.appendChild(card);
  });
}

document.addEventListener("click", event => {
  const btnMap = event.target.closest("[data-go-map]");
  if (btnMap) {
    const place = placesData.find(item => item.id === btnMap.getAttribute("data-go-map"));
    if (!place) return;

    setView("maps");
    setTimeout(() => focusPlace(place), 180);
    return;
  }

  const btnRoute = event.target.closest("[data-route]");
  if (btnRoute) {
    const place = placesData.find(item => item.id === btnRoute.getAttribute("data-route"));
    if (!place) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${place.name}, ${place.address}`
    )}`;
    window.open(url, "_blank");
  }
});

// ============================================================
// FAVORITOS
// ============================================================
document.addEventListener("click", async event => {
  const btn = event.target.closest("[data-fav]");
  if (!btn) return;

  if (!currentUser) {
    showToast("Faça login para salvar favoritos.");
    return;
  }

  const placeId = btn.getAttribute("data-fav");

  try {
    if (favoritosIds.has(placeId)) {
      await fetch(`${API_BASE}/api/favoritos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario_id: currentUser.uid, local_id: placeId })
      });

      favoritosIds.delete(placeId);
      showToast("Removido dos favoritos.");
    } else {
      await fetch(`${API_BASE}/api/favoritos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usuario_id: currentUser.uid,
          local_id: placeId
        })
      });

      favoritosIds.add(placeId);
      showToast("Salvo nos favoritos!");
    }

    renderRecommended();
  } catch (erro) {
    console.error("Erro ao salvar/remover favorito:", erro);
    showToast("Erro ao atualizar favoritos.");
  }
});

// ============================================================
// FAVORITOS
// ============================================================
async function loadFavoritos() {
  if (!currentUser) return;

  try {
    const resposta = await fetch(`${API_BASE}/api/favoritos?usuario_id=${currentUser.uid}`);
    const favoritos = await resposta.json();

    favoritosIds = new Set(favoritos.map(item => item.placeId));
  } catch (erro) {
    console.error("Erro ao carregar favoritos do backend:", erro);
    favoritosIds = new Set();
  }
}

// ============================================================
// MAPA
// ============================================================
function initMapIfNeeded() {
  if (map) return;

  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  map = L.map("map").setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);
}

function markerIcon(color) {
  return L.divIcon({
    className: "custom-sensory-marker",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid #ffffff;
        box-shadow: 0 0 10px rgba(0,0,0,.25);
      "></div>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -8]
  });
}

function buildPopup(place) {
  const lv = level(place);
  const bestTime = getBestVisitWindow(place);
  const insight = getVisitInsights(place);
  const compatibilityScore = getPerfilCompatibility(place, perfilAtivo);
  const compatibilityTag = getCompatibilityTag(place, perfilAtivo);

  return `
    <div style="min-width:240px">
      <img
        src="${escapeHtml(getImagePath(place.image))}"
        alt="${escapeHtml(place.name)}"
        style="width:100%;height:120px;object-fit:cover;border-radius:10px;margin-bottom:8px"
        onerror="this.src='imagens/hero.jpg'"
      >

      <strong style="font-size:15px;">${escapeHtml(place.name)}</strong><br>

      <span style="color:#5d6c7b;font-weight:600;">
        ${escapeHtml(catLabel(place.cat))} • ${escapeHtml(levelLabel(lv))}
      </span><br>

      <span style="color:#6b7684">${escapeHtml(place.address || "")}</span><br><br>

      <div style="margin-bottom:8px;background:#eef4fb;padding:8px;border-radius:8px;font-size:12px;">
        <strong>🧠 ${escapeHtml(compatibilityTag)}</strong> · ${compatibilityScore} pts
      </div>

      <span>Ruído: ${place.noise}</span><br>
      <span>Iluminação: ${place.light}</span><br>
      <span>Movimento: ${place.flow}</span>

      <div style="
        margin-top:8px;
        background:#f2f6fb;
        padding:8px;
        border-radius:8px;
        font-size:12px;
      ">
        <strong>${bestTime.icon} Melhor horário: ${escapeHtml(bestTime.label)}</strong><br>
        ${escapeHtml(bestTime.text)}
      </div>

      <div style="
        margin-top:6px;
        background:#eef3fb;
        padding:8px;
        border-radius:8px;
        font-size:12px
      ">
        <strong>🕐 Horário mais vazio: ${escapeHtml(insight.empty)}</strong>
      </div>

      <br>

      <a
        href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${place.name}, ${place.address}`
        )}"
        target="_blank"
      >
        Abrir rota
      </a>
    </div>
  `;
}

function renderMarkers(list) {
  if (!map) return;

  markers.forEach(marker => map.removeLayer(marker));
  markers.clear();

  const bounds = [];

  list.forEach(place => {
    if (place.lat == null || place.lng == null || Number.isNaN(place.lat) || Number.isNaN(place.lng)) {
      return;
    }

    const marker = L.marker([Number(place.lat), Number(place.lng)], {
      icon: markerIcon(levelColor(level(place)))
    }).addTo(map).bindPopup(buildPopup(place));

    markers.set(place.id, marker);
    bounds.push([Number(place.lat), Number(place.lng)]);
  });

  map.invalidateSize(true);

  if (bounds.length > 1) {
    map.fitBounds(bounds, { padding: [30, 30] });
  } else if (bounds.length === 1) {
    map.setView(bounds[0], 15);
  } else {
    map.setView(MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM);
  }
}

function highlightSelectedCard(placeId) {
  document.querySelectorAll(".resultCard").forEach(card => {
    card.classList.remove("active");
  });

  document.querySelectorAll(".btnSeeMap").forEach(button => {
    button.classList.remove("is-active");
    button.textContent = "Ver no mapa";
  });

  const targetButton = document.querySelector(`[data-focus="${placeId}"]`);
  if (!targetButton) return;

  const targetCard = targetButton.closest(".resultCard");
  if (!targetCard) return;

  targetCard.classList.add("active");
  targetButton.classList.add("is-active");
  targetButton.textContent = "Local selecionado";

  targetCard.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });
}

function focusPlace(place) {
  initMapIfNeeded();
  if (!map) return;

  if (place.lat == null || place.lng == null || Number.isNaN(place.lat) || Number.isNaN(place.lng)) {
    showToast("Esse local ainda não possui coordenadas válidas no mapa.");
    return;
  }

  const lat = Number(place.lat);
  const lng = Number(place.lng);

  map.invalidateSize(true);
  map.flyTo([lat, lng], 16, {
    animate: true,
    duration: 1.5,
    easeLinearity: 0.25
  });

  const marker = markers.get(place.id);
  if (marker) {
    setTimeout(() => marker.openPopup(), 700);
  }

  highlightSelectedCard(place.id);
}

// ============================================================
// FILTROS DO MAPA
// ============================================================
function resetDistanceCache(list) {
  list.forEach(place => {
    delete place._distance;
  });
}

function getFilteredPlaces() {
  if (!placesData.length) return [];

  const q = normalizeText(filterQueryInput?.value || "");
  const cat = filterCategorySelect?.value || "todos";
  const levelSelected = filterLevelSelect?.value || "todos";
  const urlParams = new URLSearchParams(window.location.search);
  const citySelected = normalizeText(homeCitySelect?.value || urlParams.get('city') || "");

  resetDistanceCache(placesData);

  let list = placesData.filter(place => {
    const searchArea = normalizeText(
      `${place.name} ${place.cat} ${place.address} ${place.city}`
    );

    const matchesQuery = !q || searchArea.includes(q);
    const matchesCategory = cat === "todos" || place.cat === cat;
    const matchesLevel = levelSelected === "todos" || level(place) === levelSelected;
    const matchesCity =
      !citySelected ||
      citySelected === "todas" ||
      normalizeText(place.city) === citySelected;

    return matchesQuery && matchesCategory && matchesLevel && matchesCity;
  });

  if (filterNearCheckbox?.checked) {
    if (!userLocation) {
      showToast("Ative a localização ao vivo primeiro.");
      filterNearCheckbox.checked = false;
      return list;
    }

    const radius = Number(filterRadiusSelect?.value || 3);

    list = list
      .map(place => {
        if (place.lat == null || place.lng == null) return null;

        const distance = distKm(
          userLocation.lat,
          userLocation.lng,
          Number(place.lat),
          Number(place.lng)
        );

        return {
          ...place,
          _distance: distance
        };
      })
      .filter(place => place && place._distance <= radius)
      .sort((a, b) => a._distance - b._distance);
  }

  return list;
}

function applyFilters() {
  const list = getFilteredPlaces();
  renderMarkers(list);
  renderResults(list);
}

function renderResults(list) {
  if (!resultsEl) return;
  resultsEl.innerHTML = "";

  if (!list.length) {
    resultsEl.innerHTML = `<div class="emptyState">Nenhum resultado encontrado com esses filtros.</div>`;
    return;
  }

  [...list]
    .sort((a, b) => getPerfilCompatibility(b, perfilAtivo) - getPerfilCompatibility(a, perfilAtivo))
    .forEach((place, index) => {
      const lv = level(place);
      const compatibilityScore = getPerfilCompatibility(place, perfilAtivo);
      const compatibilityTag = getCompatibilityTag(place, perfilAtivo);
      const compatibilityReason = getCompatibilityReason(place, perfilAtivo);

      const item = document.createElement("div");
      item.className = `resultCard ${index === 0 ? "resultCard--best" : ""}`;
      item.innerHTML = `
        <div class="resultInfo">
          <div class="resultTop">
            <span class="resultDot" style="background:${levelColor(lv)}"></span>
            <strong>${escapeHtml(place.name)}</strong>
            ${index === 0 ? `<span class="miniBestTag">Mais compatível</span>` : ``}
          </div>
          <span class="resultMeta">
            ${escapeHtml(catLabel(place.cat))}
            <span class="metaDot">·</span>
            <span class="levelWithDot">
              <span class="sensoryDot ${escapeHtml(lv)}"></span>
              ${escapeHtml(levelLabel(lv))}
            </span>
          </span>
          <span class="resultAddress">${escapeHtml(place.address || "")}</span>
          <span class="resultCompatibility">${escapeHtml(compatibilityTag)} · ${compatibilityScore} pts</span>
          <span class="resultReason">${escapeHtml(compatibilityReason)}</span>
          ${
            place._distance !== undefined
              ? `<span class="resultDistance">${place._distance.toFixed(1)} km de você</span>`
              : ""
          }
          ${
            place.lat && place.lng
              ? `<a href="https://www.google.com/maps/dir/?api=1&destination=${place.lat},${place.lng}" target="_blank" class="btn primary small" style="margin-top:10px; text-decoration:none; display:inline-block;">🗺️ Traçar Rota</a>`
              : ""
          }
        </div>
        <button class="btn soft btnSeeMap" data-focus="${escapeHtml(place.id)}">
          Ver no mapa
        </button>
      `;
      resultsEl.appendChild(item);
    });
}

document.getElementById("btnApplyFilters")?.addEventListener("click", applyFilters);

document.getElementById("btnClearFilters")?.addEventListener("click", () => {
  if (filterQueryInput) filterQueryInput.value = "";
  if (filterCategorySelect) filterCategorySelect.value = "todos";
  if (filterLevelSelect) filterLevelSelect.value = "todos";
  if (filterNearCheckbox) filterNearCheckbox.checked = false;
  if (filterRadiusSelect) filterRadiusSelect.value = "3";

  // Limpa também os resultados de busca e o mapa, como solicitado
  renderMarkers([]);
  if (resultsEl) {
    resultsEl.innerHTML = `<div class="emptyState">Filtros limpos. Digite algo ou aplique filtros para buscar.</div>`;
  }
});

document.addEventListener("click", event => {
  const btn = event.target.closest("[data-focus]");
  if (!btn) return;

  const place = placesData.find(item => item.id === btn.getAttribute("data-focus"));
  if (!place) return;

  if (views.maps?.classList.contains("hidden")) {
    setView("maps");
  }

  setTimeout(() => {
    map?.invalidateSize(true);
    focusPlace(place);
  }, 150);
});

document.getElementById("btnSearch")?.addEventListener("click", () => {
  const q = document.getElementById("q")?.value || "";
  const city = document.getElementById("city")?.value || "";
  const cat = document.getElementById("category")?.value || "";
  const sens = document.getElementById("sensory")?.value || "";
  window.location.href = `mapas.html?q=${encodeURIComponent(q)}&city=${encodeURIComponent(city)}&cat=${encodeURIComponent(cat)}&sensory=${encodeURIComponent(sens)}`;
});

// ============================================================
// AVALIAÇÕES
// ============================================================
function fillRateSelect() {
  if (!document.getElementById("view-rate")) return;
  const list = document.getElementById("rate_place_list");
  if (!list) return;

  list.innerHTML = "";
  placesData.forEach(place => {
    const option = document.createElement("option");
    option.value = place.name;
    list.appendChild(option);
  });
}

["noise", "light", "flow"].forEach(key => {
  const input = document.getElementById(`rate_${key}`);
  const val = document.getElementById(`rate_${key}_val`);

  input?.addEventListener("input", () => {
    if (val) val.textContent = input.value;
  });
});

document.getElementById("btnSendRate")?.addEventListener("click", async () => {
  if (!currentUser) {
    showToast("Faça login ou crie uma conta para salvar.", true);
    document.getElementById("btnAuthToggle")?.click();
    return;
  }

  if (!currentUser) {
    showToast("Faça login para avaliar locais.");
    setView("auth");
    return;
  }

  const placeName = document.getElementById("rate_place_name").value.trim();
  const placeObj = placesData.find(p => p.name === placeName);
  
  if (!placeObj) {
    showToast("Por favor, pesquise e selecione um local da lista.", true);
    return;
  }
  
  const placeId = placeObj.id;
  const noise = Number(document.getElementById("rate_noise").value);
  const light = Number(document.getElementById("rate_light").value);
  const flow = Number(document.getElementById("rate_flow").value);
  const note = document.getElementById("rate_note").value.trim();
  const msg = document.getElementById("rateMsg");

  try {
    const resposta = await fetch(`${API_BASE}/api/avaliacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        usuario_id: currentUser.uid,
        local_id: placeId,
        ruido: noise,
        iluminacao: light,
        movimento: flow,
        comentario: note
      })
    });

    if (!resposta.ok) {
      throw new Error("Não foi possível salvar a avaliação.");
    }

    msg.textContent = "Avaliação salva!"; msg.className = "msg-success";
    document.getElementById("rate_note").value = "";
    loadMyRatings();
    setTimeout(() => {
      msg.textContent = ""; msg.className = "small muted";
    }, 4000);
  } catch (e) {
    console.error("Erro ao salvar avaliação no backend:", e);
    msg.textContent = "Erro: " + e.message; msg.className = "msg-error";
  }
});

async function loadMyRatings() {
  const el = document.getElementById("myRatings");
  if (!el) return;

  if (!currentUser) {
    el.innerHTML = `<p class="muted small">Faça login para ver suas avaliações.</p>`;
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/api/avaliacoes?usuario_id=${currentUser.uid}`);
    const avaliacoes = await resposta.json();

    if (!avaliacoes.length) {
      el.innerHTML = `<p class="muted small">Você ainda não avaliou nenhum local.</p>`;
      return;
    }

    el.innerHTML = "";

    avaliacoes.slice(0, 5).forEach(rating => {
      const place = placesData.find(item => item.id === rating.placeId);

      const item = document.createElement("div");
      item.className = "ratingHistItem";
      item.innerHTML = `
        <strong>${escapeHtml(place?.name || rating.placeId)}</strong>
        <span>Ruído ${rating.barulho || rating.noise} · Luz ${rating.luz || rating.light} · Mov ${rating.fluxo || rating.flow}</span>
        ${rating.note ? `<br><span>${escapeHtml(rating.note)}</span>` : ""}
      `;
      el.appendChild(item);
    });
  } catch (erro) {
    console.error("Erro ao carregar avaliações do backend:", erro);
    el.innerHTML = `<p class="muted small">Erro ao carregar avaliações.</p>`;
  }
}

// ============================================================
// PERFIL TEA
// ============================================================
["ruido", "luz", "movimento"].forEach(key => {
  const input = document.getElementById(`peso_${key}`);
  const val = document.getElementById(`peso_${key}_val`);

  input?.addEventListener("input", () => {
    if (val) val.textContent = input.value;
  });
});

document.getElementById("btnSavePerfil")?.addEventListener("click", async () => {
  if (!currentUser) {
    showToast("Faça login ou crie uma conta para salvar.", true);
    document.getElementById("btnAuthToggle")?.click();
    return;
  }

  if (!currentUser) {
    showToast("Faça login para salvar perfis.");
    setView("auth");
    return;
  }

  const nome = document.getElementById("perfil_nome").value.trim();
  const idadeFaixa = document.getElementById("perfil_idade").value;
  const nivelSuporte = Number(document.getElementById("perfil_nivel").value);
  const sensRuido = Number(document.getElementById("peso_ruido").value);
  const sensLuz = Number(document.getElementById("peso_luz").value);
  const sensFluxo = Number(document.getElementById("peso_movimento").value);
  const obs = document.getElementById("perfil_obs").value.trim();
  const msg = document.getElementById("perfilMsg");

  if (!nome) {
    msg.textContent = "Informe o nome do perfil."; msg.className = "msg-error";
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/api/perfis`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        idadeFaixa: String(idadeFaixa || ""),
        nivelSuporte,
        sensRuido,
        sensLuz,
        sensFluxo,
        gatilhos: obs,
        userId: currentUser.uid
      })
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      msg.textContent = "Erro: " + (data.erro || "Não foi possível salvar o perfil."); msg.className = "msg-error";
      return;
    }

    msg.textContent = "Perfil salvo!"; msg.className = "msg-success";
    renderPerfilList();
    setTimeout(() => {
      msg.textContent = ""; msg.className = "small muted";
    }, 3000);
  } catch (e) {
    console.error("Erro ao salvar perfil:", e);
    msg.textContent = "Erro ao salvar perfil."; msg.className = "msg-error";
  }
});

async function renderPerfilList() {
  if (!document.getElementById("view-perfil")) return;
  const el = document.getElementById("perfilList");
  if (!el) return;

  if (!currentUser) {
    el.innerHTML = `<p class="muted small">Faça login para gerenciar perfis.</p>`;
    return;
  }

  try {
    const resposta = await fetch(`${API_BASE}/api/perfis/${currentUser.uid}`);
    const perfis = await resposta.json();

    if (!perfis.length) {
      el.innerHTML = `<p class="muted small">Nenhum perfil cadastrado ainda.</p>`;
      return;
    }

    el.innerHTML = "";

    perfis.forEach(perfil => {
      const isActive = perfilAtivo?.id === perfil.id;
      const pr = Number(perfil.sensRuido || perfil.pesoRuido || 3);
      const pl = Number(perfil.sensLuz || perfil.pesoLuz || 3);
      const pm = Number(perfil.sensFluxo || perfil.pesoMovimento || 3);

      const card = document.createElement("div");
      card.className = `perfilCard ${isActive ? "active" : ""}`;
      card.innerHTML = `
        <div>
          <div class="perfilCardName">${escapeHtml(perfil.nome || "Perfil")}</div>
          <div class="perfilCardSub">
            TEA nível ${escapeHtml(perfil.nivelSuporte || "—")} · Idade: ${escapeHtml(perfil.idadeFaixa || "—")} ·
            Ruído ${pr} · Luz ${pl} · Mov ${pm}
            ${perfil.gatilhos ? `<br>Gatilhos: ${escapeHtml(perfil.gatilhos)}` : ""}
          </div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn soft" style="font-size:12px;padding:6px 11px" data-sel="${escapeHtml(perfil.id)}">
            ${isActive ? "Ativo" : "Usar"}
          </button>
          <button class="btn danger-soft" style="font-size:12px;padding:6px 11px" data-del="${escapeHtml(perfil.id)}">
            Remover
          </button>
        </div>
      `;

      card.querySelector("[data-sel]").addEventListener("click", () => {
        perfilAtivo = {
          id: perfil.id,
          ...perfil,
          pesoRuido: pr,
          pesoLuz: pl,
          pesoMovimento: pm
        };

        renderPerfilList();
        renderRecommended();
        applyFilters();
        showToast(`Perfil "${perfil.nome || "Perfil"}" ativado.`);
      });

      card.querySelector("[data-del]").addEventListener("click", async () => {
        await fetch(`${API_BASE}/api/perfis/${perfil.id}`, {
          method: "DELETE"
        });

        if (perfilAtivo?.id === perfil.id) perfilAtivo = null;

        renderPerfilList();
        renderRecommended();
        applyFilters();
        showToast("Perfil removido.");
      });

      el.appendChild(card);
    });
  } catch (e) {
    console.error(e);
    el.innerHTML = `<p class="muted small">Erro ao carregar perfis.</p>`;
  }
}

// ============================================================
// GEOLOCALIZAÇÃO
// ============================================================
function setLiveButtons(live) {
  document.querySelectorAll("#btnLiveStart, #btnLiveStart2").forEach(btn => {
    btn.classList.toggle("hidden", live);
  });

  document.querySelectorAll("#btnLiveStop, #btnLiveStop2").forEach(btn => {
    btn.classList.toggle("hidden", !live);
  });
}

function updateUserMarker(lat, lng, accuracy) {
  userLocation = { lat, lng };
  initMapIfNeeded();
  if (!map) return;

  const pos = [lat, lng];

  if (!userMarker) {
    userMarker = L.circleMarker(pos, {
      radius: 8,
      weight: 2,
      color: "#4a5f7a",
      fillColor: "#6d94b8",
      fillOpacity: 0.9
    }).addTo(map).bindPopup("Você está aqui");
  } else {
    userMarker.setLatLng(pos);
  }

  if (accuracy > 0) {
    if (!userCircle) {
      userCircle = L.circle(pos, {
        radius: accuracy,
        weight: 1,
        opacity: 0.3,
        fillOpacity: 0.07
      }).addTo(map);
    } else {
      userCircle.setLatLng(pos);
      userCircle.setRadius(accuracy);
    }
  }
}

let liveHasCentered = false;

function goToUserOnMap(lat, lng, zoom = 15, openPopup = true) {
  initMapIfNeeded();
  if (!map) return;

  setView("maps");

  setTimeout(() => {
    map.invalidateSize(true);
    map.flyTo([lat, lng], zoom, {
      animate: true,
      duration: 1.2,
      easeLinearity: 0.25
    });

    if (openPopup) {
      setTimeout(() => userMarker?.openPopup(), 420);
    }
  }, 160);
}

function startLive() {
  if (!navigator.geolocation) {
    showToast("Geolocalização não disponível.");
    return;
  }

  if (watchId) {
    showToast("A localização ao vivo já está ativada.");
    return;
  }

  liveHasCentered = false;

  watchId = navigator.geolocation.watchPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy || 0;

      updateUserMarker(lat, lng, accuracy);

      if (geoStatus) {
        geoStatus.textContent = `Ao vivo · ~${Math.round(accuracy)}m`;
      }

      if (!liveHasCentered) {
        goToUserOnMap(lat, lng, 15, true);
        liveHasCentered = true;
        showToast("Localização ao vivo ativada.");
      }

      applyFilters();
    },
    () => {
      stopLive();
      if (geoStatus) geoStatus.textContent = "Erro de localização.";
      showToast("Não foi possível obter sua localização.");
    },
    { enableHighAccuracy: true, maximumAge: 1500, timeout: 15000 }
  );

  setLiveButtons(true);
}

function stopLive() {
  if (watchId) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
  }

  liveHasCentered = false;
  setLiveButtons(false);

  if (geoStatus) {
    geoStatus.textContent = "Localização ao vivo pausada.";
  }

  showToast("Localização ao vivo desativada.");
}

document.getElementById("btnLiveStart")?.addEventListener("click", () => {
  initMapIfNeeded();
  startLive();
});

document.getElementById("btnLiveStop")?.addEventListener("click", stopLive);

document.getElementById("btnLiveStart2")?.addEventListener("click", () => {
  initMapIfNeeded();
  startLive();
});

document.getElementById("btnLiveStop2")?.addEventListener("click", stopLive);

document.getElementById("btnCenterMe")?.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showToast("Geolocalização não disponível.");
    return;
  }

  initMapIfNeeded();

  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const accuracy = pos.coords.accuracy || 0;

      updateUserMarker(lat, lng, accuracy);
      goToUserOnMap(lat, lng, 16, true);
      applyFilters();

      if (geoStatus) {
        geoStatus.textContent = "Mapa centralizado na sua localização.";
      }

      showToast("Centralizado no seu ponto.");
    },
    () => showToast("Não foi possível obter localização."),
    { enableHighAccuracy: true, timeout: 12000 }
  );
});

// ============================================================
// AUTOCOMPLETE
// ============================================================
function buildSuggestions(queryText, limit = 7) {
  const q = normalizeText(queryText).trim();
  if (!q) return [];

  return placesData
    .map(place => {
      let score = 0;
      const n = normalizeText(place.name);
      const a = normalizeText(place.address || "");

      if (n.startsWith(q)) score += 100;
      if (n.includes(q)) score += 60;
      if (a.includes(q)) score += 40;
      if (normalizeText(place.cat).includes(q)) score += 25;

      return { place, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.place);
}

function renderAutocomplete(container, list, onPick) {
  container.innerHTML = "";

  if (!list.length) {
    container.classList.add("hidden");
    return;
  }

  list.forEach(place => {
    const item = document.createElement("div");
    item.className = "acItem";
    item.innerHTML = `
      <div class="acLeft">
        <div class="acTitle">${escapeHtml(place.name)}</div>
        <div class="acSub">${escapeHtml(catLabel(place.cat))} · ${escapeHtml(place.city)}</div>
      </div>
      <div class="acTag">${escapeHtml(levelLabel(level(place)))}</div>
    `;

    item.addEventListener("mousedown", event => {
      event.preventDefault();
      onPick(place);
      container.classList.add("hidden");
    });

    container.appendChild(item);
  });

  container.classList.remove("hidden");
}

function attachAutocomplete(input, container, onPick) {
  if (!input || !container) return;

  input.addEventListener("input", () => {
    renderAutocomplete(container, buildSuggestions(input.value), onPick);
  });

  input.addEventListener("focus", () => {
    renderAutocomplete(container, buildSuggestions(input.value), onPick);
  });

  input.addEventListener("blur", () => {
    setTimeout(() => container.classList.add("hidden"), 140);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      container.classList.add("hidden");
    }
  });
}

const autocompleteHome = document.getElementById("ac_q");
const autocompleteMap = document.getElementById("ac_fq");

attachAutocomplete(homeSearchInput, autocompleteHome, place => {
  window.location.href = "mapas.html?q=" + encodeURIComponent(place.name);
});

attachAutocomplete(filterQueryInput, autocompleteMap, place => {
  filterQueryInput.value = place.name;

  setTimeout(() => {
    applyFilters();
    focusPlace(place);
  }, 120);
});

// ============================================================

// URL FILTERS
function loadURLFilters() {
  
  
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  const city = params.get('city');
  const cat = params.get('cat');
  const sens = params.get('sensory');

  let hasFilters = false;
  if (q && filterQueryInput) { filterQueryInput.value = q; hasFilters = true; }
  if (city && document.getElementById("filter_city")) { document.getElementById("filter_city").value = city; hasFilters = true; }
  if (cat && filterCategorySelect) { filterCategorySelect.value = cat; hasFilters = true; }
  if (sens && filterLevelSelect) { filterLevelSelect.value = sens; hasFilters = true; }

  if (hasFilters) {
    applyFilters();
  }
}

// INICIALIZAÇÃO
// ============================================================
initTheme();
restaurarSessao();


if (window.location.pathname.includes("mapas.html")) {
  initMapIfNeeded();
  setTimeout(loadURLFilters, 500);
  setTimeout(renderRecommended, 600);
} else if (window.location.pathname.includes("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/")) {
  // on home page, maybe init some home stuff if needed
} else if (window.location.pathname.includes("avaliar.html")) {
  fillRateSelect();
  loadMyRatings();
} else if (window.location.pathname.includes("perfil.html")) {
  renderPerfilList();
}

carregarLocaisDoBackend();
