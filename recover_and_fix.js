const fs = require('fs');
const { execSync } = require('child_process');

// 1. Recover index.html from HEAD~1 to extract Locais Recomendados
try {
  const oldIndexHtml = execSync('git show HEAD~1:index.html', { encoding: 'utf-8' });
  const startRecMatch = oldIndexHtml.match(/<div class="sectionHeader">\s*<div>\s*<h2 class="sectionTitle">Locais Recomendados<\/h2>/);
  const endRecMatch = oldIndexHtml.match(/<div class="sectionHeader" style="margin-top:60px">/);
  
  let recHtml = '';
  if (startRecMatch && endRecMatch) {
    recHtml = oldIndexHtml.substring(startRecMatch.index, endRecMatch.index);
    console.log('Successfully extracted Locais Recomendados from old index.html');
    
    // Now apply all fixes to mapas.html
    let mapasHtml = fs.readFileSync('mapas.html', 'utf-8');
    
    // 2. Remove Ao Vivo from mapas.html
    mapasHtml = mapasHtml.replace(/<div class="row" style="margin-top:15px; margin-bottom:15px;">\s*<button id="btnLiveStart2" class="btn geoBtn">📍 Ao vivo<\/button>\s*<button id="btnLiveStop2" class="btn geoBtnStop hidden">⏹ Parar<\/button>\s*<\/div>/g, '');
    // Try a more flexible regex in case spacing is different
    mapasHtml = mapasHtml.replace(/<div class="row"[^>]*>\s*<button id="btnLiveStart2"[^>]*>.*?<\/button>\s*<button id="btnLiveStop2"[^>]*>.*?<\/button>\s*<\/div>/, '');
    
    // 3. Move Results above Map
    const mapMatch = mapasHtml.match(/<div id="map" class="map"[^>]*><\/div>/);
    const resultsHeaderMatch = mapasHtml.match(/<div class="resultsHeader"[^>]*>.*?<\/div>/);
    const resultsMatch = mapasHtml.match(/<div id="results" class="cardsList"[^>]*><\/div>/);
    
    if (mapMatch && resultsHeaderMatch && resultsMatch) {
      mapasHtml = mapasHtml.replace(mapMatch[0], '');
      mapasHtml = mapasHtml.replace(resultsHeaderMatch[0], '');
      mapasHtml = mapasHtml.replace(resultsMatch[0], '');
      
      const newLayout = `
        ${resultsHeaderMatch[0].replace('class="resultsHeader"', 'class="resultsHeader" style="margin-top:0; border-top:none; padding-top:0;"')}
        ${resultsMatch[0].replace('class="cardsList"', 'class="cardsList" style="margin-bottom:20px;"')}
        <div id="map" class="map" style="flex:1;"></div>
      `;
      mapasHtml = mapasHtml.replace('<section class="mapSection">', '<section class="mapSection">\n' + newLayout);
      console.log('Reordered Map and Results');
    }
    
    // 4. Inject Locais Recomendados
    if (!mapasHtml.includes('class="recommendedPanel"')) {
      // Find the closing tags of mapSection
      const injectRegex = /<\/section>\s*<\/div>\s*<\/section>/;
      if (injectRegex.test(mapasHtml)) {
        mapasHtml = mapasHtml.replace(injectRegex, `</section>\n      <aside class="recommendedPanel">\n        ${recHtml}\n      </aside>\n    </div>\n  </section>`);
        console.log('Injected Locais Recomendados into mapas.html');
      } else {
        console.log('Could not find injection point for Locais Recomendados');
      }
    }
    
    fs.writeFileSync('mapas.html', mapasHtml);
    console.log('mapas.html updated successfully');
  } else {
    console.log('Could not match Locais Recomendados in old index.html');
  }
} catch (e) {
  console.error('Error:', e.message);
}
