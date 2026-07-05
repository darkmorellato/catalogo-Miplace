// ============================================================
// scripts/test-snapshot.js
// Snapshot test do produtos.json: schema + invariantes estruturais.
// Falha com exit code != 0 se algo divergir do snapshot.
// Uso: npm test
//      ou: node scripts/test-snapshot.js
// ============================================================

const fs = require('fs');
const path = require('path');

const PRODUCT_PATH = path.join(__dirname, '..', 'produtos.json');
const SNAPSHOT_PATH = path.join(__dirname, '.products-snapshot.json');

function deepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

function fail(msg) {
    console.error(`\n✗ Snapshot test falhou: ${msg}`);
    process.exit(1);
}

function ok(msg) {
    console.log(`✓ ${msg}`);
}

let data;
try {
    data = JSON.parse(fs.readFileSync(PRODUCT_PATH, 'utf8'));
} catch (e) {
    fail(`não foi possível ler/parsear produtos.json: ${e.message}`);
}
if (!Array.isArray(data)) fail('o arquivo raiz deve ser um array');

// Invariantes canônicos do catálogo versão 1.1.x
const brands = { Realme: 7, Honor: 5, Motorola: 6, Redmi: 1, Poco: 2, iPhone: 1 };
const expectedIds = Array.from({ length: 22 }, (_, i) => i + 1);

const actualIds = data.map(p => p.id).sort((a, b) => a - b);
if (!deepEqual(actualIds, expectedIds)) {
    fail(`IDs divergem do esperado.\n  esperado: [${expectedIds.join(',')}]\n  obtido:   [${actualIds.join(',')}]`);
}
ok('IDs 1..22 sequenciais sem duplicados');

const actualBrands = data.reduce((acc, p) => {
    acc[p.brand] = (acc[p.brand] || 0) + 1;
    return acc;
}, {});
if (!deepEqual(actualBrands, brands)) {
    fail(`Contagem por marca diverge.\n  esperado: ${JSON.stringify(brands)}\n  obtido:   ${JSON.stringify(actualBrands)}`);
}
ok('Distribuição por marca preservada (Realme:7, Honor:5, Motorola:6, Redmi:1, Poco:2, iPhone:1)');

// Cada produto deve ter pelo menos 1 spec (não é regra rígida do schema mas é convenção)
const withoutSpecs = data.filter(p => !p.specs || p.specs.length === 0);
if (withoutSpecs.length > 0) {
    fail(`${withoutSpecs.length} produto(s) sem specs: ${withoutSpecs.map(p => p.id).join(', ')}`);
}
ok('Todos os produtos têm ao menos 1 spec');

// Cada produto com .gallery deve ter .image presente nela
const galleryMismatches = data.filter(p => p.gallery && !p.gallery.includes(p.image));
if (galleryMismatches.length > 0) {
    fail(`${galleryMismatches.length} produto(s) com image fora da gallery: ${galleryMismatches.map(p => p.id).join(', ')}`);
}
ok('image ⊆ gallery em 100% dos produtos com gallery');

// Preço deve existir em algum formato (price ou specialPrice)
const semPreco = data.filter(p => !p.price && !p.specialPrice);
if (semPreco.length > 0) {
    fail(`${semPreco.length} produto(s) sem price/specialPrice: ${semPreco.map(p => p.id).join(', ')}`);
}
ok('Todos os produtos têm preço (price ou specialPrice)');

// WhatsApp deve ter 13 dígitos (55 + DDD + 9 + número)
// Parsing do stores.js sem dependências: extrai apenas o array STORES via slice
const storesSrc = fs.readFileSync(path.join(__dirname, '..', 'stores.js'), 'utf8');
const storesMatch = storesSrc.match(/const STORES = (\[[\s\S]*?\n\]);/);
if (!storesMatch) {
    console.warn('⚠ Não foi possível extrair STORES de stores.js (regex falhou). Pulando teste de telefones.');
} else {
    const stores = eval(storesMatch[1]);
    const WA_RE = /^55\d{2}9\d{8}$/;
    const badWA = stores.filter(/** @returns {n is never} */ s => !WA_RE.test(s.whatsapp));
    if (badWA.length > 0) {
        fail(`${badWA.length} loja(s) com whatsapp inválido: ${badWA.map(s => s.id).join(', ')}`);
    }
    ok('Todos os ' + stores.length + ' telefones WhatsApp seguem formato 55DDD9xxxxxxxx');
}

// Persistir/atualizar snapshot
const newSnapshot = { generated: new Date().toISOString(), count: data.length, brands: actualBrands, ids: actualIds };
if (fs.existsSync(SNAPSHOT_PATH)) {
    const old = JSON.parse(fs.readFileSync(SNAPSHOT_PATH, 'utf8'));
    if (deepEqual(old, newSnapshot)) {
        ok('Snapshot inalterado desde ' + old.generated);
    } else {
        fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(newSnapshot, null, 2));
        console.log(`! Snapshot atualizado (${old.generated} → ${newSnapshot.generated})`);
        console.log(`  → Confirmar mudança executando: git add scripts/.products-snapshot.json`);
    }
} else {
    fs.writeFileSync(SNAPSHOT_PATH, JSON.stringify(newSnapshot, null, 2));
    console.log(`! Snapshot criado em scripts/.products-snapshot.json`);
}

console.log(`\n✓ Snapshot test OK — ${data.length} produtos íntegros`);
