// Atualiza referências de imagens para WebP em todos os arquivos JS/JSON
const fs = require('fs');
const path = require('path');

const files = [
    '../produtos.json',
    '../stores.js',
    '../app.js',
];

// Substitui extensões de imagem por .webp nos paths de imagem conhecidos
// Padrão: (Realme|Honor|Motorola|Redmi|Poco|Iphone|Iphone|logo)/filename.(png|jpg|jpeg)
const IMG_RE = /(\b(?:Realme|Honor|Motorola|Redmi|Poco|Iphone|Iphone|logo)\/[^"'\s]+)\.(png|jpg|jpeg)/gi;

for (const rel of files) {
    const fp = path.join(__dirname, rel);
    let src = fs.readFileSync(fp, 'utf8');
    const before = (src.match(IMG_RE) || []).length;
    src = src.replace(IMG_RE, '$1.webp');
    const after = (src.match(/\.(png|jpg|jpeg)/gi) || []).filter(m =>
        src.substring(src.lastIndexOf('\n', src.indexOf(m)), src.indexOf(m)).match(/Realme|Honor|Motorola|Redmi|Poco|Iphone|logo/)
    ).length;
    fs.writeFileSync(fp, src, 'utf8');
    console.log(`${path.basename(fp)}: ${before} referências atualizadas`);
}
