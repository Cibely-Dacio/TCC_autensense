const fs = require('fs');

let appJs = fs.readFileSync('app.js', 'utf-8');

// 1. renderResults - Add Como Chegar button
const resultsInjectionPoint = /\${[\s\S]*?place\._distance !== undefined[\s\S]*?\? \`<span class="resultDistance">\${place\._distance\.toFixed\(1\)} km de você<\/span>\`[\s\S]*?: ""[\s\S]*?}/;

if (appJs.match(resultsInjectionPoint)) {
  const routeBtnHtml = `
          \${
            place.lat && place.lng
              ? \`<a href="https://www.google.com/maps/dir/?api=1&destination=\${place.lat},\${place.lng}" target="_blank" class="btn primary small" style="margin-top:10px; text-decoration:none; display:inline-block;">🗺️ Traçar Rota</a>\`
              : ""
          }`;
  appJs = appJs.replace(resultsInjectionPoint, `$&${routeBtnHtml}`);
}

// 2. renderMarkers - Add Como Chegar button
const markerInjectionPoint = /<button class="btn secondary small" data-focus="\${place\.id}">Ver na lista<\/button>/;

if (appJs.match(markerInjectionPoint)) {
  const markerRouteBtnHtml = `
        <a href="https://www.google.com/maps/dir/?api=1&destination=\${place.lat},\${place.lng}" target="_blank" class="btn primary small" style="margin-top:6px; text-decoration:none; display:block; text-align:center;">🗺️ Traçar Rota</a>`;
  appJs = appJs.replace(markerInjectionPoint, `$&${markerRouteBtnHtml}`);
}

fs.writeFileSync('app.js', appJs);
console.log('Rotas injetadas no app.js');
