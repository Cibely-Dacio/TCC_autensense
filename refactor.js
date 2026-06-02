const fs = require('fs');

// 1. STYLE.CSS
let css = fs.readFileSync('style.css', 'utf-8');
css = css.replace('grid-template-columns: 290px 1fr;', 'grid-template-columns: 290px 1fr 340px;\n  align-items: stretch;');
css = css.replace('.btn {\n', '.btn {\n  text-decoration: none;\n');
if (!css.includes('.recommendedPanel')) {
  css += `\n.recommendedPanel {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px;
  display: flex;
  flex-direction: column;
}\n`;
}
// Modify .recCard to fit the new column
css = css.replace('grid-template-columns: repeat(3, 1fr);', 'grid-template-columns: 1fr;\n  display: flex;\n  flex-direction: column;');
fs.writeFileSync('style.css', css);

// 2. HTML Files
let indexHtml = fs.readFileSync('index.html', 'utf-8');
let mapasHtml = fs.readFileSync('mapas.html', 'utf-8');
let sobreHtml = fs.readFileSync('sobre.html', 'utf-8');

// A. Extract Locais Recomendados
const recStart = indexHtml.indexOf('<div class="sectionHeader">\n      <div>\n        <h2 class="sectionTitle">Locais Recomendados');
const recEnd = indexHtml.indexOf('<div class="sectionHeader" style="margin-top:60px">');
let recomendadosHtml = '';
if (recStart !== -1 && recEnd !== -1) {
  recomendadosHtml = indexHtml.substring(recStart, recEnd).trim();
  indexHtml = indexHtml.substring(0, recStart) + indexHtml.substring(recEnd);
}

// B. Remove GeoRow from index.html
const geoRowRegex = /<div class="geoRow">[\s\S]*?<\/div>/;
indexHtml = indexHtml.replace(geoRowRegex, '');

// C. Change CTA Buttons in index.html
indexHtml = indexHtml.replace('<button class="btn primary" data-view="perfil">Criar perfil TEA</button>', '<a href="perfil.html" class="btn primary">Criar perfil TEA</a>');
indexHtml = indexHtml.replace('<button class="btn ctaGhost" data-view="maps">Ver mapa</button>', '<a href="mapas.html" class="btn ctaGhost">Ver mapa</a>');

// D. Move Results above Map in mapas.html
const resultsStart = mapasHtml.indexOf('<div class="resultsHeader">');
const resultsEnd = mapasHtml.indexOf('</section>\n    </div>');
let resultsHtml = '';
if (resultsStart !== -1 && resultsEnd !== -1) {
  resultsHtml = mapasHtml.substring(resultsStart, resultsEnd).trim();
  mapasHtml = mapasHtml.substring(0, resultsStart) + '\n      </section>\n    </div>\n  </section>\n</main>\n<script src="components.js"></script>\n<script type="module" src="app.js"></script>\n</body>\n</html>';
  // Note: the substring replacement above might mess up if there are multiple tags.
}

// Let's do mapas.html using string manipulation more carefully:
mapasHtml = fs.readFileSync('mapas.html', 'utf-8');
mapasHtml = mapasHtml.replace(
  '<div id="map" class="map"></div>\n        <div class="resultsHeader"><h3>Resultados</h3></div>\n        <div id="results" class="cardsList"></div>',
  '<div class="resultsHeader" style="margin-top:0; border-top:none; padding-top:0;"><h3>Resultados</h3></div>\n        <div id="results" class="cardsList" style="margin-bottom:20px;"></div>\n        <div id="map" class="map" style="flex:1;"></div>'
);

// Inject Locais Recomendados into mapas.html Grid
mapasHtml = mapasHtml.replace('      </section>\n    </div>', `      </section>\n      <aside class="recommendedPanel">\n        ${recomendadosHtml}\n      </aside>\n    </div>`);

// E. Move Sobre to Index
const sobreViewStart = sobreHtml.indexOf('<section id="view-about"');
const sobreViewEnd = sobreHtml.indexOf('</section>', sobreViewStart) + 10;
if (sobreViewStart !== -1) {
  const sobreSection = sobreHtml.substring(sobreViewStart, sobreViewEnd);
  // append before </main>
  indexHtml = indexHtml.replace('</main>', `\n${sobreSection}\n</main>`);
}

fs.writeFileSync('index.html', indexHtml);
fs.writeFileSync('mapas.html', mapasHtml);

// Delete sobre.html
fs.unlinkSync('sobre.html');

console.log("HTML and CSS refactored successfully.");
