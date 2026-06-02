const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf-8');

// Fix gridMap
const oldGridMap = `.gridMap {
  display: grid;
  grid-template-columns: 290px 1fr 340px;
  align-items: stretch;
  gap: 18px;
  align-items: start;
  overflow: hidden;
}`;

const newGridMap = `.gridMap {
  display: grid;
  grid-template-columns: minmax(250px, 290px) 1fr minmax(280px, 340px);
  gap: 18px;
  align-items: stretch;
  overflow: hidden;
}`;
css = css.replace(oldGridMap, newGridMap);

// If it wasn't exactly like that, use Regex
css = css.replace(/\.gridMap \{\s*display: grid;\s*grid-template-columns: [^;]+;\s*align-items: stretch;\s*gap: 18px;\s*align-items: start;\s*overflow: hidden;\s*\}/, newGridMap);
// Try one more time if missing stretch
css = css.replace(/\.gridMap \{\s*display: grid;\s*grid-template-columns: [^;]+;\s*gap: 18px;\s*align-items: start;\s*overflow: hidden;\s*\}/, newGridMap);

// Add flex column to mapSection if missing
if (!css.includes('display: flex;\n  flex-direction: column;\n  z-index: 1;')) {
  css = css.replace('  position: relative;\n  overflow: hidden;\n  z-index: 1;', '  position: relative;\n  overflow: hidden;\n  display: flex;\n  flex-direction: column;\n  z-index: 1;');
}

// Add responsive media queries
const mediaQueries = `
@media (max-width: 1200px) {
  .gridMap {
    grid-template-columns: 290px 1fr !important;
  }
  .recommendedPanel {
    grid-column: 1 / -1;
  }
}
@media (max-width: 900px) {
  .gridMap {
    grid-template-columns: 1fr !important;
  }
}
`;

if (!css.includes('max-width: 1200px')) {
  css += mediaQueries;
}

fs.writeFileSync('style.css', css);
console.log('CSS fixed');
