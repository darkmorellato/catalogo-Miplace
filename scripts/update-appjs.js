// Remove productsData do app.js e atualiza loadPrecosFromJSON para carregar do JSON
const fs = require('fs');
const path = require('path');

let src = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

// 1. Remove o array productsData e substitui por declaração vazia
src = src.replace(
    /const productsData = \[[\s\S]*?\n        \];/,
    'let productsData = [];'
);

// 2. Substitui loadPrecosFromJSON para carregar dados completos do JSON
const oldFn = `        async function loadPrecosFromJSON() {
            try {
                const response = await fetch('produtos.json?v=' + Date.now());
                if (!response.ok) throw new Error('Falha ao carregar produtos.json');
                const precos = await response.json();
                precos.forEach(item => {
                    const produto = productsData.find(p => p.id === item.id);
                    if (produto) {
                        if (item.price) produto.price = item.price;
                        if (item.specialPrice !== undefined) produto.specialPrice = item.specialPrice;
                    }
                });
            } catch (err) {
                console.warn('[Miplace] Usando preços embutidos:', err.message);
            }
        }`;

const newFn = `        async function loadPrecosFromJSON() {
            try {
                const response = await fetch('produtos.json?v=' + Date.now());
                if (!response.ok) throw new Error('Falha ao carregar produtos.json');
                productsData = await response.json();
            } catch (err) {
                console.error('[Miplace] Erro ao carregar produtos.json:', err.message);
            }
        }`;

src = src.replace(oldFn, newFn);

fs.writeFileSync(path.join(__dirname, '../app.js'), src, 'utf8');
console.log('app.js atualizado. Tamanho:', src.length, 'chars');
