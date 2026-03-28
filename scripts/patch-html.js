const fs = require('fs');
const path = require('path');
const fp = path.join(__dirname, '../index.html');
let src = fs.readFileSync(fp, 'utf8');

// 1. Remove bloco Schema.org hardcoded (será gerado dinamicamente pelo stores.js)
src = src.replace(
    /\s*<!-- Schema\.org JSON-LD[^>]*-->\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/,
    '\n    <!-- Schema.org JSON-LD gerado dinamicamente por stores.js -->\n    <script id="schema-org" type="application/ld+json"></script>'
);

// 2. Adiciona skip-to-content logo após <body ...>
src = src.replace(
    /(<body[^>]*>)/,
    '$1\n\n    <!-- Skip to content (acessibilidade) -->\n    <a href="#catalogo" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:text-xs focus:font-bold focus:uppercase focus:tracking-widest" style="background-color:#1c1917;color:#f4f4f0;">Ir para o conteúdo</a>'
);

// 3. fetchpriority + loading eager na moldura-celular
src = src.replace(
    '<img src="moldura-celular.png" alt="Mão segurando Smartphone" width="700" height="950" class="relative z-10 w-full h-auto pointer-events-none" style="filter:drop-shadow(0 20px 40px rgba(0,0,0,0.15));">',
    '<img src="moldura-celular.png" alt="Mão segurando Smartphone" width="700" height="950" fetchpriority="high" loading="eager" class="relative z-10 w-full h-auto pointer-events-none" style="filter:drop-shadow(0 20px 40px rgba(0,0,0,0.15));">'
);

fs.writeFileSync(fp, src, 'utf8');
console.log('index.html atualizado');
