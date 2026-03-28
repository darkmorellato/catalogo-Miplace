// Extrai productsData do app.js e salva como produtos.json
const fs = require('fs');
const path = require('path');

const appJs = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

// Captura tudo entre "const productsData = [" e "];" (linha que contém só "];")
const match = appJs.match(/const productsData = (\[[\s\S]*?\n        \]);/);
if (!match) { console.error('productsData não encontrado'); process.exit(1); }

// Avalia o array em contexto seguro para obter objeto JS válido
let data;
try {
    data = eval('(' + match[1] + ')');
} catch (e) {
    console.error('Erro ao parsear productsData:', e.message);
    process.exit(1);
}

fs.writeFileSync(
    path.join(__dirname, '../produtos.json'),
    JSON.stringify(data, null, 2),
    'utf8'
);
console.log(`Exportados ${data.length} produtos para produtos.json`);
