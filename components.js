const topbarHTML = `
<header class="topbar">
  <div class="topbarInner">
    <div class="brand">
      <img src="imagens/iconeLogo.png" alt="Logo AutenSense" class="brandLogo"/>
      <div class="brandText">
        <strong>AutenSense</strong>
        <span>mapa sensorial</span>
      </div>
    </div>
    <nav class="nav">
      <a class="navLink" id="nav-home" href="index.html">Início</a>
      <a class="navLink" id="nav-maps" href="mapas.html">Mapas</a>
      <a class="navLink" id="nav-rate" href="avaliar.html">Avaliar</a>
      <a class="navLink" id="nav-perfil" href="perfil.html">Perfil TEA</a>
      <a class="navLink" id="nav-about" href="index.html#view-about">Sobre</a>
    </nav>
    <div class="topbarActions">
      <button id="themeToggle" class="themeToggle" type="button" aria-label="Alternar modo visual">
        <span class="themeTogglePill">
          <span id="themeToggleIcon" class="themeToggleIcon">🌿</span>
          <span id="themeToggleText" class="themeToggleText">Modo Sensorial</span>
        </span>
      </button>
      <span id="userDisplayName" class="userChip hidden"></span>
      <button class="btn ghost" id="btnAuthToggle" data-view="auth">Entrar</button>
      <button class="btn danger-soft btnLogout hidden">Sair</button>
    </div>
  </div>
</header>
`;

const authHTML = `
  <section id="view-auth" class="view hidden" style="margin-top: 40px; margin-bottom: 60px;">
    <div class="sectionHeader">
      <div>
        <h2 class="sectionTitle">Acesse sua conta</h2>
        <p class="sectionSub">Salve perfis, avaliações e favoritos na nuvem</p>
      </div>
    </div>
    <div class="grid2">
      <div class="card">
        <h3 class="cardTitle">Criar conta</h3>
        <form autocomplete="off" onsubmit="event.preventDefault();">
          <label class="label">Nome completo</label>
          <input id="reg_name" class="input" placeholder="Seu nome" autocomplete="name"/>
          <label class="label">E-mail</label>
          <input id="reg_email" class="input" type="email" placeholder="email@email.com" autocomplete="email"/>
          <label class="label">Senha</label>
          <input id="reg_pass" class="input" type="password" placeholder="Mínimo 6 caracteres" autocomplete="new-password"/>
          <button id="btnRegister" class="btn primary" style="margin-top:14px;width:100%">Criar conta</button>
        </form>
        <p id="regMsg" class="small muted" style="margin-top:8px"></p>
      </div>
      <div class="card">
        <h3 class="cardTitle">Entrar</h3>
        <form autocomplete="off" onsubmit="event.preventDefault();">
          <label class="label">E-mail</label>
          <input id="login_email" class="input" type="email" placeholder="email@email.com" autocomplete="email"/>
          <label class="label">Senha</label>
          <input id="login_pass" class="input" type="password" placeholder="********" autocomplete="current-password"/>

          <button id="btnForgotPasswordToggle" class="authLinkBtn" type="button">Esqueci minha senha</button>

          <div id="forgotPasswordBox" class="forgotPasswordBox hidden">
            <label class="label">Recuperar senha por e-mail</label>
            <input id="reset_email" class="input" type="email" placeholder="Digite seu e-mail cadastrado"/>
            <button id="btnForgotPassword" class="btn soft" style="margin-top:12px;width:100%">Enviar link de redefinição</button>
            <p id="resetMsg" class="small muted" style="margin-top:8px"></p>
          </div>

          <button id="btnLogin" class="btn primary" style="margin-top:14px;width:100%">Entrar</button>
        </form>
        <button class="btn soft btnLogout hidden" style="margin-top:8px;width:100%">Sair da conta</button>
        <p id="loginMsg" class="small muted" style="margin-top:8px"></p>
      </div>
    </div>
  </section>
  <div id="favToast" class="toast hidden">Salvo com sucesso</div>
`;

document.body.insertAdjacentHTML('afterbegin', topbarHTML);

// O modal de login deve ser inserido dentro do <main> se ele existir
const mainContainer = document.querySelector('main.container');
if (mainContainer) {
    mainContainer.insertAdjacentHTML('beforeend', authHTML);
} else {
    document.body.insertAdjacentHTML('beforeend', authHTML);
}

// Marcar link ativo na navegação
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.navLink');
navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
    } else {
        link.classList.remove('active');
    }
});
