const fs = require('fs');

let css = fs.readFileSync('style.css', 'utf-8');

// 1. Fix gridMap
css = css.replace(
  /grid-template-columns: 290px 1fr 340px;/g,
  'grid-template-columns: minmax(250px, 290px) 1fr minmax(280px, 340px);'
);
css = css.replace(
  /align-items: start;\r?\n/g,
  ''
);

// 2. Fix mapSection
css = css.replace(
  /\.mapSection \{[\s\S]*?z-index: 1;\r?\n\}/,
  `.mapSection {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 1;
}`
);

// 3. Fix map
css = css.replace(
  /\.map \{[\s\S]*?z-index: 1;\r?\n\}/,
  `.map {
  width: 100%;
  flex: 1;
  min-height: 560px;
  border-radius: 14px;
  border: 1.5px solid var(--line);
  overflow: hidden;
  position: relative;
  z-index: 1;
}`
);

// 4. Fix recommendedPanel
if (css.includes('.recommendedPanel {')) {
  css = css.replace(
    /\.recommendedPanel \{[\s\S]*?flex-direction: column;\r?\n\}/,
    `.recommendedPanel {
  background: #fff;
  border: 1.5px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px;
  display: flex;
  flex-direction: column;
}`
  );
} else {
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

// 5. Add Media Queries if missing
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
console.log('CSS updated successfully.');
