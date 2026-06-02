const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf-8');

// 1. Restore testarBackend() to its original small state
const testarBackendRegex = /async function testarBackend\(\) \{[\s\S]*?\}, 1200\);\n  \}/;
const originalTestarBackend = `async function testarBackend() {
  try {
    const resposta = await fetch(\`\${API_BASE}/api/locais\`);
    const dados = await resposta.json();
    console.log("Dados vindos do backend:", dados);
  } catch (erro) {
    console.error("Erro no teste do backend:", erro);
  }
}`;

appJs = appJs.replace(testarBackendRegex, originalTestarBackend);

// 2. Properly inject the fallback into carregarLocaisDoBackend
const carregarBackendRegex = /async function carregarLocaisDoBackend\(\) \{[\s\S]*?console\.log\("Locais carregados do backend:", placesData\);\n  \} catch \(erro\) \{\n    console\.error\("Erro ao carregar locais do backend:", erro\);\n    showToast\("Erro ao carregar locais do backend\."\);\n  \}\n\}/;

const newCarregarBackend = `async function carregarLocaisDoBackend() {
  try {
    const resposta = await fetch(\`\${API_BASE}/api/locais\`);
    const dados = await resposta.json();

    if (!dados || dados.length === 0) {
        throw new Error("Tabela vazia ou sem locais");
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
    console.error("Erro ao carregar locais do backend (ou vazio). Usando fallback local:", erro);
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

if (appJs.match(carregarBackendRegex)) {
  appJs = appJs.replace(carregarBackendRegex, newCarregarBackend);
  fs.writeFileSync('app.js', appJs);
  console.log('Fixed fallbacks successfully.');
} else {
  console.log('Failed to match carregarLocaisDoBackend block. Applying manual fix.');
  // If we couldn't match perfectly, just try to replace the catch block of carregarLocaisDoBackend
  const fallbackStr = `  } catch (erro) {
    console.error("Erro ao carregar locais do backend (ou vazio). Usando fallback local:", erro);
    placesData = [...PLACES_PRESET];
  } finally {
    updateStatPlaces();
    initMapIfNeeded();
    renderMarkers(placesData);
    applyFilters();
    fillRateSelect();
    renderRecommended();
    setTimeout(() => { renderSmartInsights(); }, 1200);
  }`;
  // We can do this manually if needed.
}
