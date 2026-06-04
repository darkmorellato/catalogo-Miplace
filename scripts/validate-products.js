// ============================================================
// scripts/validate-products.js
// Valida o schema de produtos.json e regras cruzadas.
// Falha com exit code != 0 se algo estiver errado.
// Uso:   node scripts/validate-products.js
// ============================================================

const fs = require('fs');
const path = require('path');

const PRODUCT_PATH = path.join(__dirname, '..', 'produtos.json');
const ALLOWED_BRANDS = new Set(['Realme', 'Honor', 'Motorola', 'Redmi', 'Poco', 'iPhone']);
const REQUIRED_FIELDS = ['id', 'brand', 'name', 'image'];

function fail(msg) {
    console.error(`\n✗ produtos.json inválido: ${msg}`);
    process.exit(1);
}

function ok(msg) {
    console.log(`✓ ${msg}`);
}

let data;
try {
    const raw = fs.readFileSync(PRODUCT_PATH, 'utf8');
    data = JSON.parse(raw);
} catch (e) {
    fail(`não foi possível ler/parsear: ${e.message}`);
}

if (!Array.isArray(data)) fail('o arquivo raiz deve ser um array');
if (data.length === 0) fail('o array está vazio');

const seenIds = new Set();
const seenRefs = new Set();

data.forEach((p, i) => {
    const ctx = `produto[${i}]`;

    if (typeof p !== 'object' || p === null) fail(`${ctx} não é um objeto`);

    for (const f of REQUIRED_FIELDS) {
        if (!(f in p)) fail(`${ctx} (id=${p.id ?? '?'}) sem campo obrigatório "${f}"`);
    }

    if (typeof p.id !== 'number' || !Number.isInteger(p.id) || p.id < 1) {
        fail(`${ctx} .id deve ser inteiro >= 1 (recebido: ${p.id})`);
    }
    if (seenIds.has(p.id)) fail(`id duplicado: ${p.id}`);
    seenIds.add(p.id);

    if (!ALLOWED_BRANDS.has(p.brand)) {
        fail(`${ctx} .brand "${p.brand}" não está em [${[...ALLOWED_BRANDS].join(', ')}]`);
    }

    if (typeof p.name !== 'string' || p.name.trim() === '') {
        fail(`${ctx} .name vazio ou não-string`);
    }

    if (typeof p.image !== 'string' || !/\.(webp|png|jpg|jpeg)$/i.test(p.image)) {
        fail(`${ctx} .image deve terminar em .webp|.png|.jpg|.jpeg (recebido: ${p.image})`);
    }

    if ('price' in p && (typeof p.price !== 'string' || p.price.trim() === '')) {
        fail(`${ctx} .price deve ser string não-vazia quando presente`);
    }
    if ('specialPrice' in p && (typeof p.specialPrice !== 'string' || p.specialPrice.trim() === '')) {
        fail(`${ctx} .specialPrice deve ser string não-vazia quando presente`);
    }
    if ('description' in p && typeof p.description !== 'string') {
        fail(`${ctx} .description deve ser string quando presente`);
    }

    if ('specs' in p) {
        if (!Array.isArray(p.specs)) fail(`${ctx} .specs deve ser array`);
        p.specs.forEach((s, si) => {
            if (!s || typeof s !== 'object') fail(`${ctx} .specs[${si}] não é objeto`);
            if (typeof s.label !== 'string' || !s.label.trim()) fail(`${ctx} .specs[${si}].label inválido`);
            if (typeof s.value !== 'string' || !s.value.trim()) fail(`${ctx} .specs[${si}].value inválido`);
        });
    }

    if ('highlights' in p) {
        if (!Array.isArray(p.highlights)) fail(`${ctx} .highlights deve ser array`);
        p.highlights.forEach((h, hi) => {
            if (!h || typeof h !== 'object') fail(`${ctx} .highlights[${hi}] não é objeto`);
            if (typeof h.title !== 'string') fail(`${ctx} .highlights[${hi}].title inválido`);
            if (typeof h.text !== 'string') fail(`${ctx} .highlights[${hi}].text inválido`);
        });
    }

    if ('gallery' in p) {
        if (!Array.isArray(p.gallery) || p.gallery.length === 0) {
            fail(`${ctx} .gallery deve ser array não-vazio quando presente`);
        }
        p.gallery.forEach((g, gi) => {
            if (typeof g !== 'string' || !/\.(webp|png|jpg|jpeg)$/i.test(g)) {
                fail(`${ctx} .gallery[${gi}] deve ser string terminando em extensão de imagem`);
            }
            if (seenRefs.has(g)) {
                console.warn(`! ${ctx} .gallery[${gi}] duplica referência "${g}" (não fatal)`);
            }
            seenRefs.add(g);
        });
        if (p.gallery && !p.gallery.includes(p.image)) {
            fail(`${ctx} .image ("${p.image}") não está presente em .gallery — adicione para o carrossel funcionar`);
        }
    }
});

ok(`${data.length} produtos validados (ids: ${[...seenIds].sort((a, b) => a - b).join(', ')})`);
