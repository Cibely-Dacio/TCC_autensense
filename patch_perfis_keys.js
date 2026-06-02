const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf-8');

const postOld = `  const novoPerfil = {
    id: "local_" + Date.now(),
    nome,
    idadeFaixa: String(idadeFaixa || ""),
    nivelSuporte,
    sensRuido,
    sensLuz,
    sensFluxo,
    gatilhos: obs,
    userId: currentUser.uid
  };`;

const postNew = `  const novoPerfil = {
    // Local / Legacy Keys
    id: "local_" + Date.now(),
    nome,
    idadeFaixa: String(idadeFaixa || ""),
    nivelSuporte,
    sensRuido,
    sensLuz,
    sensFluxo,
    gatilhos: obs,
    userId: currentUser.uid,

    // Backend PostgreSQL Keys (api/perfis.js expectations)
    usuario_id: currentUser.uid,
    idade: idadeFaixa ? parseInt(idadeFaixa) : null,
    nivel_suporte: String(nivelSuporte),
    sensibilidade_ruido: sensRuido,
    sensibilidade_luz: sensLuz,
    sensibilidade_movimento: sensFluxo,
    observacoes: obs
  };`;

if (appJs.includes(postOld)) {
  appJs = appJs.replace(postOld, postNew);
  fs.writeFileSync('app.js', appJs);
  console.log("Perfis Payload PATCHED!");
} else {
  console.log("Could not find postOld in app.js");
}
