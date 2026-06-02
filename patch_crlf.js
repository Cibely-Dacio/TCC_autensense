const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf-8');

// Normalize to \n
appJs = appJs.replace(/\r\n/g, '\n');

// 1. Restore testarBackend()
const testarBackendOld = `async function testarBackend() {
  try {
    const resposta = await fetch(\`\${API_BASE}/api/locais\`);
    const dados = await resposta.json();
    console.log("Dados vindos do backend:", dados);
  } catch (erro) {
    console.error("Erro ao carregar locais do backend:", erro);
    showToast("Usando base de locais local.");
    
    // Fallback para os 58 locais!
    placesData = [...PLACES_PRESET];

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

testarBackend();`;

const testarBackendNew = `async function testarBackend() {
  try {
    const resposta = await fetch(\`\${API_BASE}/api/locais\`);
    const dados = await resposta.json();
    console.log("Dados vindos do backend:", dados);
  } catch (erro) {
    console.error("Erro no teste do backend:", erro);
  }
}`;

appJs = appJs.replace(testarBackendOld, testarBackendNew);

// 2. Fix carregarLocaisDoBackend
const carregarOld = `async function carregarLocaisDoBackend() {
  try {
    const resposta = await fetch(\`\${API_BASE}/api/locais\`);
    const dados = await resposta.json();

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

    updateStatPlaces();
    initMapIfNeeded();
    renderMarkers(placesData);
    applyFilters();
    fillRateSelect();
    renderRecommended();

    setTimeout(() => {
      renderSmartInsights();
    }, 1200);

    console.log("Locais carregados do backend:", placesData);
  } catch (erro) {
    console.error("Erro ao carregar locais do backend:", erro);
    showToast("Erro ao carregar locais do backend.");
  }
}`;

const carregarNew = `async function carregarLocaisDoBackend() {
  try {
    const resposta = await fetch(\`\${API_BASE}/api/locais\`);
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
}`;

if (appJs.includes(carregarOld)) {
  appJs = appJs.replace(carregarOld, carregarNew);
  console.log("carregarLocaisDoBackend PATCHED!");
} else {
  console.log("carregarLocaisDoBackend NOT FOUND!");
}

if (appJs.includes(testarBackendOld)) {
  appJs = appJs.replace(testarBackendOld, testarBackendNew);
  console.log("testarBackend PATCHED!");
}

fs.writeFileSync('app.js', appJs);
