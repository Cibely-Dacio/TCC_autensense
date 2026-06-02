const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf-8');

// 1. Add LocalStorage helpers
const lsHelpers = `
function getLocalPerfis() {
  try { return JSON.parse(localStorage.getItem("autensense_perfis") || "[]"); }
  catch { return []; }
}
function saveLocalPerfis(perfis) {
  localStorage.setItem("autensense_perfis", JSON.stringify(perfis));
}
`;
if (!appJs.includes('getLocalPerfis')) {
  appJs = appJs.replace('const API_BASE = "";', 'const API_BASE = "";\n' + lsHelpers);
}

// 2. Fix POST (btnSavePerfil)
const postOld = `  try {
    const resposta = await fetch(\`\${API_BASE}/api/perfis\`, {
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
  }`;

const postNew = `  const novoPerfil = {
    id: "local_" + Date.now(),
    nome,
    idadeFaixa: String(idadeFaixa || ""),
    nivelSuporte,
    sensRuido,
    sensLuz,
    sensFluxo,
    gatilhos: obs,
    userId: currentUser.uid
  };

  try {
    const resposta = await fetch(\`\${API_BASE}/api/perfis\`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoPerfil)
    });
    if (!resposta.ok) throw new Error("Falha na API");
    
    msg.textContent = "Perfil salvo na nuvem!"; msg.className = "msg-success";
  } catch (e) {
    console.warn("Backend indisponível, salvando perfil localmente.");
    const locais = getLocalPerfis();
    locais.push(novoPerfil);
    saveLocalPerfis(locais);
    msg.textContent = "Perfil salvo localmente!"; msg.className = "msg-success";
  }
  
  renderPerfilList();
  setTimeout(() => { msg.textContent = ""; msg.className = "small muted"; }, 3000);`;

appJs = appJs.replace(postOld, postNew);

// 3. Fix GET and DELETE in renderPerfilList
const renderOld = `  try {
    const resposta = await fetch(\`\${API_BASE}/api/perfis/\${currentUser.uid}\`);
    const perfis = await resposta.json();

    if (!perfis.length) {
      el.innerHTML = \`<p class="muted small">Nenhum perfil cadastrado ainda.</p>\`;
      return;
    }

    el.innerHTML = "";

    perfis.forEach(perfil => {
      const isActive = perfilAtivo?.id === perfil.id;
      const pr = Number(perfil.sensRuido || perfil.pesoRuido || 3);
      const pl = Number(perfil.sensLuz || perfil.pesoLuz || 3);
      const pm = Number(perfil.sensFluxo || perfil.pesoMovimento || 3);

      const card = document.createElement("div");
      card.className = \`perfilCard \${isActive ? "active" : ""}\`;
      card.innerHTML = \`
        <div>
          <div class="perfilCardName">\${escapeHtml(perfil.nome || "Perfil")}</div>
          <div class="perfilCardSub">
            TEA nível \${escapeHtml(perfil.nivelSuporte || "—")} · Idade: \${escapeHtml(perfil.idadeFaixa || "—")} ·
            Ruído \${pr} · Luz \${pl} · Mov \${pm}
            \${perfil.gatilhos ? \`<br>Gatilhos: \${escapeHtml(perfil.gatilhos)}\` : ""}
          </div>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn soft" style="font-size:12px;padding:6px 11px" data-sel="\${escapeHtml(perfil.id)}">
            \${isActive ? "Ativo" : "Usar"}
          </button>
          <button class="btn danger-soft" style="font-size:12px;padding:6px 11px" data-del="\${escapeHtml(perfil.id)}">
            Remover
          </button>
        </div>
      \`;

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
        showToast(\`Perfil "\${perfil.nome || "Perfil"}" ativado.\`);
      });

      card.querySelector("[data-del]").addEventListener("click", async () => {
        await fetch(\`\${API_BASE}/api/perfis/\${perfil.id}\`, {
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
    el.innerHTML = \`<p class="muted small">Erro ao carregar perfis.</p>\`;
  }`;

const renderNew = `  let perfis = [];
  try {
    const resposta = await fetch(\`\${API_BASE}/api/perfis?usuario_id=\${currentUser.uid}\`);
    if (!resposta.ok) throw new Error("API Falhou");
    perfis = await resposta.json();
    if (perfis.erro) throw new Error(perfis.mensagem);
  } catch (e) {
    console.warn("Carregando perfis locais por falha na API.");
    perfis = getLocalPerfis().filter(p => p.userId === currentUser.uid);
  }

  if (!perfis || !perfis.length) {
    el.innerHTML = \`<p class="muted small">Nenhum perfil cadastrado ainda.</p>\`;
    return;
  }

  el.innerHTML = "";

  perfis.forEach(perfil => {
    const isActive = perfilAtivo?.id === perfil.id;
    const pr = Number(perfil.sensRuido || perfil.pesoRuido || perfil.sensibilidade_ruido || 3);
    const pl = Number(perfil.sensLuz || perfil.pesoLuz || perfil.sensibilidade_luz || 3);
    const pm = Number(perfil.sensFluxo || perfil.pesoMovimento || perfil.sensibilidade_movimento || 3);

    const card = document.createElement("div");
    card.className = \`perfilCard \${isActive ? "active" : ""}\`;
    card.innerHTML = \`
      <div>
        <div class="perfilCardName">\${escapeHtml(perfil.nome || "Perfil")}</div>
        <div class="perfilCardSub">
          Nível \${escapeHtml(perfil.nivelSuporte || perfil.nivel_suporte || "—")} · Idade: \${escapeHtml(perfil.idadeFaixa || perfil.idade || "—")} ·
          Ruído \${pr} · Luz \${pl} · Mov \${pm}
          \${perfil.gatilhos ? \`<br>Gatilhos: \${escapeHtml(perfil.gatilhos)}\` : ""}
        </div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn soft" style="font-size:12px;padding:6px 11px" data-sel="\${escapeHtml(perfil.id)}">
          \${isActive ? "Ativo" : "Usar"}
        </button>
        <button class="btn danger-soft" style="font-size:12px;padding:6px 11px" data-del="\${escapeHtml(perfil.id)}">
          Remover
        </button>
      </div>
    \`;

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
      showToast(\`Perfil "\${perfil.nome || "Perfil"}" ativado.\`);
    });

    card.querySelector("[data-del]").addEventListener("click", async () => {
      try {
        const res = await fetch(\`\${API_BASE}/api/perfis?id=\${perfil.id}\`, { method: "DELETE" });
        if (!res.ok) throw new Error("API Fail");
      } catch (e) {
        let locais = getLocalPerfis();
        locais = locais.filter(p => p.id !== perfil.id);
        saveLocalPerfis(locais);
      }

      if (perfilAtivo?.id === perfil.id) perfilAtivo = null;
      renderPerfilList();
      renderRecommended();
      applyFilters();
      showToast("Perfil removido.");
    });

    el.appendChild(card);
  });`;

appJs = appJs.replace(renderOld, renderNew);

fs.writeFileSync('app.js', appJs);
console.log("Perfis PATCHED!");
