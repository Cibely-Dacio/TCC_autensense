const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf-8');
const startRecMatch = indexHtml.match(/<div class="sectionHeader">\s*<div>\s*<h2 class="sectionTitle">Locais Recomendados<\/h2>/);
const endRecMatch = indexHtml.match(/<div class="sectionHeader" style="margin-top:60px">/);

if (startRecMatch && endRecMatch) {
  indexHtml = indexHtml.substring(0, startRecMatch.index) + indexHtml.substring(endRecMatch.index);
  fs.writeFileSync('index.html', indexHtml);
  console.log('Removed from index.html');
} else {
  console.log('Could not find in index.html');
}

const geoRowMatch = indexHtml.match(/<div class="geoRow"[^>]*>[\s\S]*?<\/div>/);
if (geoRowMatch) {
  indexHtml = indexHtml.replace(geoRowMatch[0], '');
  fs.writeFileSync('index.html', indexHtml);
  console.log('Removed geoRow from index.html');
} else {
  console.log('No geoRow found in index.html');
}
