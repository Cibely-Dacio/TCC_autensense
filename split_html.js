const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf-8');

const headMatch = html.match(/([\s\S]*?)<!-- ===== TOPBAR ===== -->/);
const headStr = headMatch ? headMatch[1] : '';

const endStr = `
</main>
<script src="components.js"></script>
<script type="module" src="app.js"></script>
</body>
</html>
`;

const heroMatch = html.match(/(<!-- ===== HERO ===== -->[\s\S]*?)<!-- ===== MAIN ===== -->/);
const heroStr = heroMatch ? heroMatch[1] : '';

function extractSection(id) {
    const regex = new RegExp(`(<section id="${id}"[\\s\\S]*?</section>)`);
    const match = html.match(regex);
    return match ? match[1] : '';
}

const viewHome = extractSection('view-home');
let viewMaps = extractSection('view-maps');
let viewRate = extractSection('view-rate');
let viewPerfil = extractSection('view-perfil');
let viewAbout = extractSection('view-about');

viewMaps = viewMaps.replace('class="view hidden"', 'class="view"');
viewRate = viewRate.replace('class="view hidden"', 'class="view"');
viewPerfil = viewPerfil.replace('class="view hidden"', 'class="view"');
viewAbout = viewAbout.replace('class="view hidden"', 'class="view"');

// Create index.html (Início)
const newIndex = headStr + heroStr + '\n<main class="container">\n' + viewHome + endStr;
fs.writeFileSync('index.html', newIndex);

// Create mapas.html
const mapasHtml = headStr + '\n<main class="container">\n' + viewMaps + endStr;
fs.writeFileSync('mapas.html', mapasHtml);

// Create avaliar.html
const avaliarHtml = headStr + '\n<main class="container">\n' + viewRate + endStr;
fs.writeFileSync('avaliar.html', avaliarHtml);

// Create perfil.html
const perfilHtml = headStr + '\n<main class="container">\n' + viewPerfil + endStr;
fs.writeFileSync('perfil.html', perfilHtml);

// Create sobre.html
const sobreHtml = headStr + '\n<main class="container">\n' + viewAbout + endStr;
fs.writeFileSync('sobre.html', sobreHtml);

console.log('Files split successfully.');
