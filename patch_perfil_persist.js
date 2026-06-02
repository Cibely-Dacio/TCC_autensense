const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf-8');

// 1. Initial State
appJs = appJs.replace('let perfilAtivo = null;', `let perfilAtivo = null;
try {
  const salvo = localStorage.getItem("autensense_perfil_ativo");
  if (salvo) perfilAtivo = JSON.parse(salvo);
} catch (e) {}`);

// 2. Logout
appJs = appJs.replace(`    perfilAtivo = null;
    document.getElementById("btnAuthToggle").innerHTML =`, `    perfilAtivo = null;
    localStorage.removeItem("autensense_perfil_ativo");
    document.getElementById("btnAuthToggle").innerHTML =`);

// 3. Selection
const selOld = `        perfilAtivo = {
          id: perfil.id,
          ...perfil,
          pesoRuido: pr,
          pesoLuz: pl,
          pesoMovimento: pm
        };

        renderPerfilList();`;
const selNew = `        perfilAtivo = {
          id: perfil.id,
          ...perfil,
          pesoRuido: pr,
          pesoLuz: pl,
          pesoMovimento: pm
        };
        localStorage.setItem("autensense_perfil_ativo", JSON.stringify(perfilAtivo));

        renderPerfilList();`;
appJs = appJs.replace(selOld, selNew);

// 4. Deletion
const delOld = `      if (perfilAtivo?.id === perfil.id) perfilAtivo = null;`;
const delNew = `      if (perfilAtivo?.id === perfil.id) {
        perfilAtivo = null;
        localStorage.removeItem("autensense_perfil_ativo");
      }`;
appJs = appJs.replace(delOld, delNew);

fs.writeFileSync('app.js', appJs);
console.log("Persistence patched!");
