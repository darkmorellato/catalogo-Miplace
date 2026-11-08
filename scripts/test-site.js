#!/usr/bin/env node
/**
 * Validador estático do site Miplace — sem browser e sem dependências.
 *
 * Uso:
 *   node scripts/test-site.js
 *   node scripts/test-site.js --strict
 *   node scripts/test-site.js --root /caminho/do/site
 *
 * Saída: relatório legível; exit code 1 se houver falha.
 * --strict também falha em avisos.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const EXPECTED_HOST = 'miplacemagazine.com.br';
const REQUIRED_FILES = [
  'index.html',
  'styles.css',
  'app.js',
  'produtos.json',
  'privacidade.html',
  'termos.html',
  'acessibilidade.html',
  'sw.js',
  'offline.html',
];
const LEGAL_PAGES = ['privacidade.html', 'termos.html', 'acessibilidade.html'];
const ALLOWED_BRANDS = new Set([
  'Realme', 'Honor', 'Motorola', 'Redmi', 'Poco',
  'iPhone', 'Samsung', 'Infinix', 'Tecno',
]);
const ALLOWED_CATEGORIES = new Set(['Celular', 'Tablet']);

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Uso: node scripts/test-site.js [--strict] [--root <diretório>]');
  process.exit(0);
}

const strict = args.includes('--strict');
const rootArgIndex = args.indexOf('--root');
const ROOT = path.resolve(
  rootArgIndex >= 0 && args[rootArgIndex + 1]
    ? args[rootArgIndex + 1]
    : path.join(__dirname, '..'),
);

const counters = { pass: 0, fail: 0, warn: 0 };
const failures = [];

function section(title) {
  console.log(`\n${title}`);
}

function emit(level, title, detail = '') {
  counters[level] += 1;
  const icon = level === 'pass' ? '✓' : level === 'warn' ? '!' : '✗';
  console.log(`  ${icon} ${title}${detail ? ` — ${detail}` : ''}`);
  if (level === 'fail') failures.push(detail ? `${title}: ${detail}` : title);
}

const pass = (title, detail) => emit('pass', title, detail);
const warn = (title, detail) => emit('warn', title, detail);
const fail = (title, detail) => emit('fail', title, detail);

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function fileExists(relPath) {
  try {
    return fs.statSync(path.join(ROOT, relPath)).isFile();
  } catch {
    return false;
  }
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function maskMarkup(html) {
  // Mantém o mesmo número de linhas para que os índices continuem válidos.
  const blank = (match) => match.replace(/[^\n]/g, ' ');
  return html
    .replace(/<!--[\s\S]*?-->/g, blank)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, blank)
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, blank);
}

const TAG_RE = /<([a-zA-Z][\w:-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/g;
const ATTR_RE = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function parseAttrs(rawAttrs) {
  const attrs = {};
  let match;
  ATTR_RE.lastIndex = 0;
  while ((match = ATTR_RE.exec(rawAttrs)) !== null) {
    const name = match[1].toLowerCase();
    if (!name || name === '/') continue;
    if (!(name in attrs)) {
      attrs[name] = match[2] ?? match[3] ?? match[4] ?? '';
    }
  }
  return attrs;
}

function tags(markup, tagName) {
  const found = [];
  TAG_RE.lastIndex = 0;
  let match;
  while ((match = TAG_RE.exec(markup)) !== null) {
    if (match[1].toLowerCase() === tagName) {
      found.push({
        attrs: parseAttrs(match[2]),
        index: match.index,
        raw: match[0],
      });
    }
  }
  return found;
}

function resolveLocalHref(href) {
  let clean = href.split('#')[0].split('?')[0];
  if (!clean) return { skip: true };
  try {
    clean = decodeURIComponent(clean);
  } catch {
    // Mantém o valor original; o teste de existência dirá se é inválido.
  }

  const isRootRelative = clean.startsWith('/');
  const relative = isRootRelative ? clean.slice(1) : clean;
  const absolute = path.resolve(ROOT, relative);
  const rootPrefix = ROOT.endsWith(path.sep) ? ROOT : ROOT + path.sep;
  if (absolute !== ROOT && !absolute.startsWith(rootPrefix)) {
    return { ok: false, reason: 'caminho fora da raiz do site' };
  }

  const candidates = [];
  if (absolute === ROOT || clean.endsWith('/')) {
    candidates.push(path.join(absolute, 'index.html'));
  } else {
    candidates.push(absolute, `${absolute}.html`, path.join(absolute, 'index.html'));
  }

  const found = candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
  return found ? { ok: true, file: found } : { ok: false, reason: 'arquivo não encontrado' };
}

function isIgnoredHref(href) {
  const value = href.trim();
  return (
    !value ||
    value.startsWith('#') ||
    value.startsWith('//') ||
    /^https?:\/\//i.test(value) ||
    /^(mailto|tel|javascript|data|blob):/i.test(value) ||
    /(^|\.)wa\.me\//i.test(value) ||
    /api\.whatsapp\.com/i.test(value)
  );
}

function resolveSitemapPath(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return { ok: false, reason: 'URL inválida' };
  }
  if (url.protocol !== 'https:') return { ok: false, reason: 'use HTTPS' };
  if (url.hostname !== EXPECTED_HOST) {
    return { ok: false, reason: `host ${url.hostname} difere de ${EXPECTED_HOST}` };
  }

  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    pathname = url.pathname;
  }
  const relative = pathname.replace(/^\/+/, '');
  const absolute = path.resolve(ROOT, relative);
  const candidates = pathname.endsWith('/') || pathname === '/'
    ? [path.join(absolute, 'index.html')]
    : [absolute, `${absolute}.html`, path.join(absolute, 'index.html')];

  const found = candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
  return found
    ? { ok: true, file: found }
    : { ok: false, reason: `página não existe (${url.pathname})` };
}

function collectLdTypes(node, types = []) {
  if (Array.isArray(node)) {
    node.forEach((item) => collectLdTypes(item, types));
  } else if (node && typeof node === 'object') {
    if (typeof node['@type'] === 'string') types.push(node['@type']);
    Object.values(node).forEach((value) => collectLdTypes(value, types));
  }
  return types;
}

function main() {
  console.log('==============================================');
  console.log(' test-site — validação estática do site Miplace');
  console.log(` Raiz: ${ROOT}`);
  console.log(` Modo: ${strict ? 'strict (avisos também falham)' : 'normal'}`);
  console.log('==============================================');

  section('Arquivos obrigatórios');
  for (const file of REQUIRED_FILES) {
    const full = path.join(ROOT, file);
    if (fileExists(file)) {
      const size = fs.statSync(full).size;
      pass(file, `${size} bytes`);
    } else {
      fail(file, 'ausente');
    }
  }

  section('index.html — estrutura e SEO');
  const html = fileExists('index.html') ? read('index.html') : '';
  let canonicalHost = EXPECTED_HOST;
  if (!html) {
    fail('index.html', 'não foi possível ler; testes de HTML ignorados');
  } else {
    const markup = maskMarkup(html);

    const htmlTags = tags(markup, 'html');
    if (htmlTags.length !== 1) {
      fail('lang', `esperado 1 elemento <html>, encontrado ${htmlTags.length}`);
    } else {
      const lang = (htmlTags[0].attrs.lang || '').trim();
      if (!lang) {
        fail('lang', 'atributo ausente em <html>');
      } else if (!/^[a-z]{2}(-[a-z]{2,})?$/i.test(lang)) {
        warn('lang', `valor incomum: "${lang}"`);
      } else {
        pass('lang', lang);
      }
    }

    const titleMatch = markup.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s+/g, ' ').trim() : '';
    if (!title) {
      fail('title', 'ausente ou vazio');
    } else {
      pass('title', `"${title}"`);
      if (title.length > 65) warn('title', `${title.length} caracteres (recomendado até 65)`);
      if (title.length < 20) warn('title', `${title.length} caracteres (recomendado 20–65)`);
    }

    const metaTags = tags(markup, 'meta');
    const description = metaTags.find(
      (tag) => (tag.attrs.name || '').toLowerCase() === 'description',
    );
    const descriptionValue = (description?.attrs.content || '').trim();
    if (!descriptionValue) {
      fail('meta description', 'ausente ou vazia');
    } else {
      pass('meta description', `${descriptionValue.length} caracteres`);
      if (descriptionValue.length < 50 || descriptionValue.length > 165) {
        warn('meta description', 'tamanho fora da faixa recomendada de 50–165 caracteres');
      }
    }

    const linkTags = tags(markup, 'link');
    const canonical = linkTags.find((tag) =>
      (tag.attrs.rel || '').toLowerCase().split(/\s+/).includes('canonical'),
    );
    const canonicalHref = (canonical?.attrs.href || '').trim();
    if (!canonicalHref) {
      fail('canonical', 'link rel="canonical" ausente');
    } else {
      try {
        const url = new URL(canonicalHref);
        canonicalHost = url.hostname;
        pass('canonical', canonicalHref);
        if (url.protocol !== 'https:') warn('canonical', 'não usa HTTPS');
        if (url.hostname !== EXPECTED_HOST) {
          warn('canonical', `host ${url.hostname} difere de ${EXPECTED_HOST}`);
        }
      } catch {
        fail('canonical', `URL inválida: ${canonicalHref}`);
      }
    }

    const h1Tags = tags(markup, 'h1');
    if (h1Tags.length === 1) {
      const text = markup
        .slice(h1Tags[0].index)
        .match(/<\/h1>/i)
        ? markup
          .slice(h1Tags[0].index, markup.indexOf('</h1>', h1Tags[0].index))
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        : '';
      pass('h1 único', text ? `"${text}"` : '1 elemento');
    } else {
      fail('h1 único', `encontrados ${h1Tags.length}; esperado exatamente 1`);
    }

    const allTags = [];
    TAG_RE.lastIndex = 0;
    let tagMatch;
    while ((tagMatch = TAG_RE.exec(markup)) !== null) {
      allTags.push({
        name: tagMatch[1].toLowerCase(),
        attrs: parseAttrs(tagMatch[2]),
        index: tagMatch.index,
      });
    }

    const idMap = new Map();
    for (const tag of allTags) {
      if (!Object.prototype.hasOwnProperty.call(tag.attrs, 'id')) continue;
      const id = tag.attrs.id;
      if (!id) {
        fail('id vazio', `linha ${lineOf(html, tag.index)}`);
        continue;
      }
      if (!idMap.has(id)) idMap.set(id, []);
      idMap.get(id).push(lineOf(html, tag.index));
    }
    const duplicateIds = [...idMap.entries()].filter(([, lines]) => lines.length > 1);
    if (duplicateIds.length === 0) {
      pass('IDs únicos', `${idMap.size} IDs`);
    } else {
      fail(
        'IDs duplicados',
        duplicateIds
          .slice(0, 8)
          .map(([id, lines]) => `"${id}" (linhas ${lines.join(', ')})`)
          .join('; ') + (duplicateIds.length > 8 ? `; +${duplicateIds.length - 8}` : ''),
      );
    }

    const anchors = tags(markup, 'a');
    const seenHrefs = new Set();
    let checkedLinks = 0;
    let brokenLinks = 0;
    for (const anchor of anchors) {
      const href = anchor.attrs.href;
      if (href === undefined) {
        warn('link sem href', `linha ${lineOf(html, anchor.index)}`);
        continue;
      }
      if (isIgnoredHref(href)) continue;
      if (seenHrefs.has(href)) continue;
      seenHrefs.add(href);
      checkedLinks += 1;
      const resolved = resolveLocalHref(href);
      if (!resolved.ok) {
        brokenLinks += 1;
        fail(
          'link interno quebrado',
          `"${href}" (linha ${lineOf(html, anchor.index)}): ${resolved.reason}`,
        );
      }
    }
    if (checkedLinks > 0 && brokenLinks === 0) {
      pass('links internos', `${checkedLinks} verificados`);
    } else if (checkedLinks === 0) {
      warn('links internos', 'nenhum link local para verificar');
    }

    const images = tags(markup, 'img');
    let missingAlt = 0;
    let emptyAlt = 0;
    for (const image of images) {
      const line = lineOf(html, image.index);
      if (!Object.prototype.hasOwnProperty.call(image.attrs, 'alt')) {
        missingAlt += 1;
        fail('imagem sem alt', `linha ${line}`);
      } else if (!image.attrs.alt.trim()) {
        const decorative = image.attrs['aria-hidden'] === 'true' ||
          image.attrs.role === 'presentation';
        if (!decorative) {
          emptyAlt += 1;
          warn('imagem com alt vazio', `linha ${line}; marque aria-hidden="true" se for decorativa`);
        }
      }
    }
    if (images.length > 0 && missingAlt === 0) {
      pass('imagens com alt', `${images.length} imagens${emptyAlt ? `; ${emptyAlt} com alt vazio` : ''}`);
    } else if (images.length === 0) {
      warn('imagens', 'nenhuma tag <img> estática encontrada');
    }

    const ldMatches = [
      ...html.matchAll(
        /<script\b[^>]*\btype\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ];
    if (ldMatches.length === 0) {
      fail('JSON-LD', 'nenhum bloco application/ld+json encontrado');
    } else {
      const ldTypes = [];
      let validBlocks = 0;
      for (const match of ldMatches) {
        const body = match[1].trim();
        const line = lineOf(html, match.index);
        if (!body) {
          fail('JSON-LD vazio', `linha ${line}; o bloco precisa ser JSON estático parseável`);
          continue;
        }
        try {
          const parsed = JSON.parse(body);
          validBlocks += 1;
          collectLdTypes(parsed, ldTypes);
          const context = parsed['@context'];
          if (typeof context !== 'string' || !context.includes('schema.org')) {
            warn('JSON-LD @context', `linha ${line}; esperado schema.org`);
          }
        } catch (error) {
          fail('JSON-LD inválido', `linha ${line}: ${error.message}`);
        }
      }
      if (validBlocks > 0) {
        pass('JSON-LD parseável', `${validBlocks} bloco(s)`);
        const hasOrganization = ldTypes.some((type) => /Organization/i.test(type));
        const hasWebSite = ldTypes.some((type) => /WebSite/i.test(type));
        if (!hasOrganization || !hasWebSite) {
          warn(
            'JSON-LD tipos',
            `Organization=${hasOrganization ? 'ok' : 'ausente'}, WebSite=${hasWebSite ? 'ok' : 'ausente'}`,
          );
        }
      }
    }
  }

  section('produtos.json');
  if (!fileExists('produtos.json')) {
    fail('produtos.json', 'ausente; validação ignorada');
  } else {
    let products;
    try {
      products = JSON.parse(read('produtos.json'));
    } catch (error) {
      fail('produtos.json', `JSON inválido: ${error.message}`);
      products = null;
    }

    if (products !== null) {
      if (!Array.isArray(products)) {
        fail('produtos.json', 'a raiz deve ser um array');
      } else if (products.length === 0) {
        fail('produtos.json', 'array vazio');
      } else {
        pass('produtos.json', `${products.length} produtos`);
        const seenIds = new Set();
        let productErrors = 0;

        products.forEach((product, index) => {
          const context = `produto[${index}]${product && product.id !== undefined ? ` id=${product.id}` : ''}`;
          const productFail = (title, detail) => {
            productErrors += 1;
            fail(title, `${context}: ${detail}`);
          };

          if (!product || typeof product !== 'object' || Array.isArray(product)) {
            productFail('produto inválido', 'não é um objeto');
            return;
          }
          for (const field of ['id', 'brand', 'name', 'image']) {
            if (!(field in product)) productFail('campo obrigatório', `"${field}" ausente`);
          }
          if (!Number.isInteger(product.id) || product.id < 1) {
            productFail('id inválido', `esperado inteiro >= 1, recebido ${product.id}`);
          } else if (seenIds.has(product.id)) {
            productFail('id duplicado', String(product.id));
          } else {
            seenIds.add(product.id);
          }
          if (typeof product.brand !== 'string' || !ALLOWED_BRANDS.has(product.brand)) {
            productFail('marca inválida', `"${product.brand}"`);
          }
          if (typeof product.name !== 'string' || !product.name.trim()) {
            productFail('nome inválido', 'vazio ou não-string');
          }
          if (typeof product.image !== 'string' || !product.image.trim()) {
            productFail('imagem inválida', 'vazia ou não-string');
          } else if (!fileExists(product.image)) {
            productFail('imagem ausente', product.image);
          }
          if (product.category !== undefined && !ALLOWED_CATEGORIES.has(product.category)) {
            productFail('categoria inválida', `"${product.category}"`);
          }
          if (Array.isArray(product.gallery)) {
            product.gallery.forEach((galleryImage) => {
              if (typeof galleryImage !== 'string' || !fileExists(galleryImage)) {
                productFail('imagem da galeria ausente', String(galleryImage));
              }
            });
          }
          if (product.price !== undefined && (typeof product.price !== 'string' || !product.price.trim())) {
            productFail('price inválido', 'deve ser string não-vazia');
          }
          if (
            product.specialPrice !== undefined &&
            (typeof product.specialPrice !== 'string' || !product.specialPrice.trim())
          ) {
            productFail('specialPrice inválido', 'deve ser string não-vazia');
          }
        });

        if (productErrors === 0) {
          pass('schema de produtos', `${products.length} produtos com id, marca, nome e imagens válidos`);
        }
      }
    }
  }

  section('sitemap.xml e robots.txt');
  const sitemapLocations = [];
  if (!fileExists('sitemap.xml')) {
    fail('sitemap.xml', 'ausente');
  } else {
    const sitemap = read('sitemap.xml');
    if (!/<urlset\b/i.test(sitemap)) {
      fail('sitemap.xml', 'elemento <urlset> ausente');
    }
    const locMatches = [...sitemap.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/gi)];
    if (locMatches.length === 0) {
      fail('sitemap.xml', 'nenhuma URL <loc> encontrada');
    } else {
      for (const match of locMatches) {
        const url = match[1].trim();
        sitemapLocations.push(url);
        const resolved = resolveSitemapPath(url);
        if (!resolved.ok) {
          fail('sitemap URL', `${url}: ${resolved.reason}`);
        }
      }
      const uniqueLocations = new Set(sitemapLocations);
      if (uniqueLocations.size !== sitemapLocations.length) {
        warn('sitemap.xml', 'há URLs duplicadas');
      }
      const homeListed = sitemapLocations.some((url) => {
        try {
          return new URL(url).pathname === '/';
        } catch {
          return false;
        }
      });
      if (homeListed) {
        pass('sitemap.xml', `${sitemapLocations.length} URL(s), incluindo a home`);
      } else {
        fail('sitemap.xml', 'a home (/) não está listada');
      }
    }
  }

  for (const legalPage of LEGAL_PAGES) {
    if (fileExists(legalPage) && !sitemapLocations.some((url) => url.endsWith(`/${legalPage}`))) {
      warn('sitemap.xml', `${legalPage} existe mas não está no sitemap`);
    }
  }

  if (!fileExists('robots.txt')) {
    fail('robots.txt', 'ausente');
  } else {
    const robots = read('robots.txt');
    const sitemapLines = [...robots.matchAll(/^\s*Sitemap:\s*(\S+)\s*$/gim)].map((match) => match[1]);
    if (sitemapLines.length === 0) {
      fail('robots.txt', 'diretiva Sitemap ausente');
    } else {
      const validSitemapLine = sitemapLines.find((url) => {
        try {
          const parsed = new URL(url);
          return parsed.protocol === 'https:' &&
            parsed.hostname === canonicalHost &&
            parsed.pathname === '/sitemap.xml';
        } catch {
          return false;
        }
      });
      if (validSitemapLine) {
        pass('robots.txt Sitemap', validSitemapLine);
      } else {
        fail(
          'robots.txt Sitemap',
          `nenhuma diretiva aponta para https://${canonicalHost}/sitemap.xml`,
        );
      }
    }
    if (/^\s*Disallow:\s*\/\s*$/im.test(robots)) {
      fail('robots.txt', 'Disallow: / bloqueia o site inteiro');
    } else {
      pass('robots.txt', 'sem bloqueio total');
    }
    if (!/^\s*User-agent:\s*\*/im.test(robots)) {
      warn('robots.txt', 'User-agent: * não encontrado');
    }
  }

  console.log('\n==============================================');
  console.log(
    ` Resumo: ${counters.pass} ok | ${counters.fail} falha(s) | ${counters.warn} aviso(s)`,
  );
  if (failures.length > 0) {
    console.log('\n Falhas:');
    for (const failure of failures) console.log(`  - ${failure}`);
  }
  if (strict && counters.fail === 0 && counters.warn > 0) {
    console.log('\n Modo strict: os avisos acima bloqueiam o release.');
  }
  console.log('==============================================');

  if (counters.fail > 0 || (strict && counters.warn > 0)) {
    process.exitCode = 1;
  }
}

main();
