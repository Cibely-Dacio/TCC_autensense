const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf-8');
const startRecMatch = indexHtml.match(/<div class="sectionHeader">\s*<div>\s*<h2 class="sectionTitle">Locais Recomendados<\/h2>/);
const endRecMatch = indexHtml.match(/<div class="sectionHeader" style="margin-top:60px">/);

let recHtml = '';
if (startRecMatch && endRecMatch) {
  recHtml = indexHtml.substring(startRecMatch.index, endRecMatch.index);
  // Also remove from index
  indexHtml = indexHtml.substring(0, startRecMatch.index) + indexHtml.substring(endRecMatch.index);
  fs.writeFileSync('index.html', indexHtml);
  console.log('Extracted from index.html');
}

let mapasHtml = fs.readFileSync('mapas.html', 'utf-8');
if (!mapasHtml.includes('class="recommendedPanel"') && recHtml) {
  const injectRegex = /<\/section>\s*<\/div>\s*<\/section>/;
  if (injectRegex.test(mapasHtml)) {
    mapasHtml = mapasHtml.replace(injectRegex, `</section>\n      <aside class="recommendedPanel">\n        ${recHtml}\n      </aside>\n    </div>\n  </section>`);
    fs.writeFileSync('mapas.html', mapasHtml);
    console.log('Injected successfully');
  } else {
    console.log('Regex for injection failed');
  }
} else {
  console.log('recHtml empty or already injected');
}
