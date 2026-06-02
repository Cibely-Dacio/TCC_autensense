const fs = require('fs');
let code = fs.readFileSync('app.js', 'utf-8');

const startIndex = code.indexOf('// VIEWS');
const endIndex = code.indexOf('// AUTH');

if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
  const newCode = code.substring(0, startIndex) + `// ============================================================
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
});\n\n` + code.substring(endIndex);
  
  fs.writeFileSync('app.js', newCode);
  console.log('Cleaned views successfully.');
} else {
  console.log('Could not find VIEWS or AUTH block boundaries.');
}

// Check for `const views = {`
const viewsDefIndex = code.indexOf('const views = {');
if (viewsDefIndex !== -1) {
  const viewsDefEnd = code.indexOf('};', viewsDefIndex) + 2;
  const newCode2 = fs.readFileSync('app.js', 'utf-8');
  fs.writeFileSync('app.js', newCode2.substring(0, viewsDefIndex) + newCode2.substring(viewsDefEnd));
  console.log('Removed views definition block.');
}
