const fs = require('fs');

let code = fs.readFileSync('app.js', 'utf-8');

// 1. Remove the VIEWS section
const viewsRegex = /\/\/ ============================================================\n\/\/ VIEWS\n\/\/ ============================================================\nconst VIEW_STORAGE_KEY[\s\S]*?(?=\/\/ ============================================================\n\/\/ AUTH\n\/\/ ============================================================)/;
code = code.replace(viewsRegex, `
// ============================================================
// AUTH TOGGLE MODAL E NAVBAR
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
\n`);

// 2. Modify btnSearch logic
const btnSearchRegex = /document\.getElementById\("btnSearch"\)\?\.addEventListener\("click", \(\) => {[\s\S]*?setTimeout\(applyFilters, 120\);\n}\);/;
const newBtnSearch = `document.getElementById("btnSearch")?.addEventListener("click", () => {
  const q = document.getElementById("q")?.value.trim() || "";
  const city = document.getElementById("city")?.value || "";
  const cat = document.getElementById("category")?.value || "";
  const sens = document.getElementById("sensory")?.value || "";
  window.location.href = \`mapas.html?q=\${encodeURIComponent(q)}&city=\${encodeURIComponent(city)}&cat=\${encodeURIComponent(cat)}&sensory=\${encodeURIComponent(sens)}\`;
});`;
code = code.replace(btnSearchRegex, newBtnSearch);

// 3. Modify autocomplete for homeSearchInput
const acHomeRegex = /attachAutocomplete\(homeSearchInput, autocompleteHome, place => {[\s\S]*?\}\);/;
const newAcHome = `attachAutocomplete(homeSearchInput, autocompleteHome, place => {
  window.location.href = "mapas.html?q=" + encodeURIComponent(place.name);
});`;
code = code.replace(acHomeRegex, newAcHome);

// 4. Modify init logic
const initPage = `
// URL FILTERS
function loadURLFilters() {
  if (!document.getElementById("view-maps")) return;
  
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
`;

code = code.replace('// INICIALIZAÇÃO', initPage + '\n// INICIALIZAÇÃO');

const initRegex = /initTheme\(\);\nrestaurarSessao\(\);\nsetView\(localStorage\.getItem\(VIEW_STORAGE_KEY\) \|\| "home", { scroll: false }\);\ncarregarLocaisDoBackend\(\);/;
const newInit = `initTheme();
restaurarSessao();
carregarLocaisDoBackend();

if (document.getElementById("view-maps")) {
  initMapIfNeeded();
  setTimeout(loadURLFilters, 500);
}
if (document.getElementById("view-rate")) {
  fillRateSelect();
  loadMyRatings();
}
if (document.getElementById("view-perfil")) {
  renderPerfilList();
}
`;
code = code.replace(initRegex, newInit);

// 5. Safe guards
code = code.replace('function renderRecommended() {', 'function renderRecommended() {\n  if (!document.getElementById("view-home")) return;');
code = code.replace('function renderPerfilList() {', 'function renderPerfilList() {\n  if (!document.getElementById("view-perfil")) return;');
code = code.replace('function fillRateSelect() {', 'function fillRateSelect() {\n  if (!document.getElementById("view-rate")) return;');

fs.writeFileSync('app.js', code);
console.log('app.js refactored');
