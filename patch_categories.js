const fs = require('fs');

const optionHtml = '<option value="gastronomia">Gastronomia</option>';
const newOptionHtml = '<option value="gastronomia">Gastronomia</option>\n          <option value="especializado">Especializado</option>';

['index.html', 'mapas.html'].forEach(file => {
  let html = fs.readFileSync(file, 'utf-8');
  if (html.includes(optionHtml)) {
    html = html.replace(new RegExp(optionHtml, 'g'), newOptionHtml);
    fs.writeFileSync(file, html);
    console.log(`Updated ${file}`);
  }
});
