const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf-8');

function extractBetween(startStr, endStr) {
    const startIndex = html.indexOf(startStr);
    if (startIndex === -1) return '';
    const endIndex = html.indexOf(endStr, startIndex);
    if (endIndex === -1) return html.substring(startIndex);
    return html.substring(startIndex, endIndex);
}

const headMatch = html.match(/([\s\S]*?)<!-- ===== TOPBAR ===== -->/);
const headStr = headMatch ? headMatch[1] : '';

const heroMatch = html.match(/(<!-- ===== HERO ===== -->[\s\S]*?)<!-- ===== MAIN ===== -->/);
const heroStr = heroMatch ? heroMatch[1] : '';

const endStr = `
</main>
<script src="components.js"></script>
<script type="module" src="app.js"></script>
</body>
</html>
`;

let viewHome = extractBetween('<section id="view-home"', '<section id="view-maps"');
let viewMaps = extractBetween('<section id="view-maps"', '<section id="view-rate"');
let viewRate = extractBetween('<section id="view-rate"', '<section id="view-perfil"');
let viewPerfil = extractBetween('<section id="view-perfil"', '<section id="view-about"');
let viewAbout = extractBetween('<section id="view-about"', '<!-- AUTH -->');

viewMaps = viewMaps.replace('class="view hidden"', 'class="view"');
viewRate = viewRate.replace('class="view hidden"', 'class="view"');
viewPerfil = viewPerfil.replace('class="view hidden"', 'class="view"');
viewAbout = viewAbout.replace('class="view hidden"', 'class="view"');

fs.writeFileSync('index.html', headStr + heroStr + '\n<main class="container">\n' + viewHome + endStr);
fs.writeFileSync('mapas.html', headStr + '\n<main class="container">\n' + viewMaps + endStr);
fs.writeFileSync('avaliar.html', headStr + '\n<main class="container">\n' + viewRate + endStr);
fs.writeFileSync('perfil.html', headStr + '\n<main class="container">\n' + viewPerfil + endStr);
fs.writeFileSync('sobre.html', headStr + '\n<main class="container">\n' + viewAbout + endStr);

console.log("Files reconstructed correctly!");
