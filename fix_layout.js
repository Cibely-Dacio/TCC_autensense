const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf-8');
let mapasHtml = fs.readFileSync('mapas.html', 'utf-8');

// 1. Extrair "Locais Recomendados" do index.html
const startRecMatch = indexHtml.match(/<div class="sectionHeader">\s*<div>\s*<h2 class="sectionTitle">Locais Recomendados<\/h2>/);
const endRecMatch = indexHtml.match(/<div class="sectionHeader" style="margin-top:60px">/);

let recHtml = '';
if (startRecMatch && endRecMatch) {
  const startIndex = startRecMatch.index;
  const endIndex = endRecMatch.index;
  recHtml = indexHtml.substring(startIndex, endIndex);
  indexHtml = indexHtml.substring(0, startIndex) + indexHtml.substring(endIndex);
  fs.writeFileSync('index.html', indexHtml);
  console.log('Extracted Locais Recomendados from index.html');
} else {
  console.log('Could not find Locais Recomendados in index.html');
}

// 2. Mapas HTML: Remove Ao Vivo Button
mapasHtml = mapasHtml.replace(/<div class="row">\s*<button id="btnLiveStart2" class="btn geoBtn">📍 Ao vivo<\/button>\s*<button id="btnLiveStop2" class="btn geoBtnStop hidden">⏹ Parar<\/button>\s*<\/div>/g, '');
console.log('Removed btnLiveStart2 from mapas.html');

// 3. Mapas HTML: Move Results above Map
const mapDivMatch = mapasHtml.match(/<div id="map" class="map"[^>]*><\/div>/);
const resultsHeaderMatch = mapasHtml.match(/<div class="resultsHeader"[^>]*>.*?<\/div>/);
const resultsDivMatch = mapasHtml.match(/<div id="results" class="cardsList"[^>]*><\/div>/);

if (mapDivMatch && resultsHeaderMatch && resultsDivMatch) {
  // Remove them from current locations
  mapasHtml = mapasHtml.replace(mapDivMatch[0], '');
  mapasHtml = mapasHtml.replace(resultsHeaderMatch[0], '');
  mapasHtml = mapasHtml.replace(resultsDivMatch[0], '');

  // Insert them in correct order
  const newOrder = `
        ${resultsHeaderMatch[0].replace('class="resultsHeader"', 'class="resultsHeader" style="margin-top:0; border-top:none; padding-top:0;"')}
        ${resultsDivMatch[0].replace('class="cardsList"', 'class="cardsList" style="margin-bottom:20px;"')}
        <div id="map" class="map" style="flex:1;"></div>
  `;
  
  // Insert inside mapSection
  mapasHtml = mapasHtml.replace('<section class="mapSection">', '<section class="mapSection">' + newOrder);
  console.log('Moved Results above Map');
} else {
  console.log('Could not find Map/Results divs to reorder');
}

// 4. Mapas HTML: Insert Locais Recomendados on the right
if (recHtml && !mapasHtml.includes('class="recommendedPanel"')) {
  mapasHtml = mapasHtml.replace('</section>\n    </div>', `</section>\n      <aside class="recommendedPanel">\n        ${recHtml}\n      </aside>\n    </div>`);
  console.log('Inserted Locais Recomendados into mapas.html');
} else if (mapasHtml.includes('class="recommendedPanel"')) {
  console.log('recommendedPanel already exists in mapas.html');
}

fs.writeFileSync('mapas.html', mapasHtml);
console.log('Done.');
