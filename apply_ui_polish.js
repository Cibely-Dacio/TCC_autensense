const fs = require('fs');

// 1. Estilização CSS
let css = fs.readFileSync('style.css', 'utf-8');
const uiPolishCSS = `

/* ============================================================
   UI POLISH (SCROLL, SLIDERS, ALERTS, EMPTY STATES)
============================================================ */

/* 1. Map Results Scroll */
#results {
  max-height: 280px;
  overflow-y: auto;
  padding-right: 8px;
}
#results::-webkit-scrollbar {
  width: 6px;
}
#results::-webkit-scrollbar-track {
  background: rgba(109,148,184,.08);
  border-radius: 4px;
}
#results::-webkit-scrollbar-thumb {
  background: rgba(109,148,184,.4);
  border-radius: 4px;
}
#results::-webkit-scrollbar-thumb:hover {
  background: rgba(109,148,184,.6);
}

/* 2. Custom Range Sliders */
input[type=range] {
  -webkit-appearance: none;
  width: 100%;
  background: transparent;
}
input[type=range]:focus {
  outline: none;
}
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8px;
  cursor: pointer;
  background: linear-gradient(90deg, var(--green) 0%, var(--yellow) 50%, var(--red) 100%);
  border-radius: 999px;
  border: 1px solid rgba(0,0,0,0.1);
}
input[type=range]::-webkit-slider-thumb {
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #fff;
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -7px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  border: 2px solid var(--primary);
  transition: transform 0.15s;
}
input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* 3. Empty States */
.emptyState {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: rgba(109,148,184,.04);
  border: 1.5px dashed rgba(109,148,184,.3);
  border-radius: 14px;
  padding: 30px 20px;
  text-align: center;
  color: var(--muted);
  font-size: 14px;
  font-weight: 600;
}
.emptyState::before {
  content: '🕵️‍♂️';
  font-size: 38px;
  opacity: 0.8;
  margin-bottom: 4px;
}

/* 4. Form Alerts */
.msg-error {
  display: block !important;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 12px !important;
  text-align: center;
  background: rgba(239,68,68,.08) !important;
  color: #b91c1c !important;
  border: 1.5px solid rgba(239,68,68,.2) !important;
  animation: popIn 0.3s ease;
}
.msg-success {
  display: block !important;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 12px !important;
  text-align: center;
  background: rgba(34,197,94,.08) !important;
  color: #15803d !important;
  border: 1.5px solid rgba(34,197,94,.2) !important;
  animation: popIn 0.3s ease;
}

@keyframes popIn {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
`;

if (!css.includes('UI POLISH')) {
  fs.appendFileSync('style.css', uiPolishCSS);
  console.log("CSS appended.");
}

// 2. Modificar app.js
let appJs = fs.readFileSync('app.js', 'utf-8');

// We will use regex to find msg.textContent assignments and append className
appJs = appJs.replace(/(msg\.textContent\s*=\s*[^;]+;)/g, (match) => {
  if (match.includes('"Erro') || match.includes('Erro: ') || match.includes('Informe o')) {
    return match + ' msg.className = "msg-error";';
  } else if (match.includes('sucesso') || match.includes('Login realizado') || match.includes('Avaliação salva') || match.includes('Perfil salvo') || match.includes('data.mensagem')) {
    return match + ' msg.className = "msg-success";';
  } else if (match.includes('""')) {
    return match + ' msg.className = "small muted";';
  }
  return match;
});

fs.writeFileSync('app.js', appJs);
console.log("app.js patched.");
