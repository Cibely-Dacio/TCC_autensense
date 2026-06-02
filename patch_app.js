const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf-8');

// 1. Fix btnSearch (Home)
const oldBtnSearchRegex = /document\.getElementById\("btnSearch"\)\?\.addEventListener\("click", \(\) => {[\s\S]*?}\);/;
const newBtnSearch = `document.getElementById("btnSearch")?.addEventListener("click", () => {
  const q = document.getElementById("q")?.value || "";
  const city = document.getElementById("city")?.value || "";
  const cat = document.getElementById("category")?.value || "";
  const sens = document.getElementById("sensory")?.value || "";
  window.location.href = \`mapas.html?q=\${encodeURIComponent(q)}&city=\${encodeURIComponent(city)}&cat=\${encodeURIComponent(cat)}&sensory=\${encodeURIComponent(sens)}\`;
});`;
code = code.replace(oldBtnSearchRegex, newBtnSearch);

// 2. Auth Rules for Rates
const rateCheck = `  if (!currentUser) {
    showToast("Faça login ou crie uma conta para salvar.", true);
    document.getElementById("btnAuthToggle")?.click();
    return;
  }\n`;

code = code.replace(
  'document.getElementById("btnSendRate")?.addEventListener("click", async () => {',
  'document.getElementById("btnSendRate")?.addEventListener("click", async () => {\n' + rateCheck
);

code = code.replace(
  'document.getElementById("btnSavePerfil")?.addEventListener("click", async () => {',
  'document.getElementById("btnSavePerfil")?.addEventListener("click", async () => {\n' + rateCheck
);

// 3. Map Initialization & Locais Recomendados on Maps page
const oldInit = /setView\(localStorage\.getItem\(VIEW_STORAGE_KEY\)\|\|"home",\{scroll:false\}\);/;
code = code.replace(oldInit, '');
code = code.replace('setView(localStorage.getItem(VIEW_STORAGE_KEY) || "home", { scroll: false });', '');

// loadURLFilters wrapper
code = code.replace('if (!document.getElementById("view-maps")) return;', '');

const pageInit = `
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
`;

// Insert the pageInit before carregarLocaisDoBackend();
code = code.replace('carregarLocaisDoBackend();', pageInit + '\ncarregarLocaisDoBackend();');

fs.writeFileSync('app.js', code);
console.log('App patched successfully.');
