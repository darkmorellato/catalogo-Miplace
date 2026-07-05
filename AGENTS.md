# AGENTS.md — Convenções do projeto Miplace Magazine

> Catálogo digital de smartphones premium. Stack: **vanilla JS + Tailwind + PWA** (sem framework).
> Este arquivo documenta convenções, comandos e arquitetura para assistentes de IA e contribuidores.

---

## 1. Visão geral

- **Tipo**: Site estático (HTML/CSS/JS puro) hospedado em **Vercel**.
- **Entry point**: `index.html` carrega 7 scripts `<script defer>` em ordem (versão atual `?v=1.1.3`):
  1. `youtube-lazy.js` — YouTube IFrame API carregada sob demanda (scroll OU 3s timeout)
  2. `stores.js` — dados das lojas + `STORES` global + schema.org JSON-LD
  3. `modules/ui.js` — utilitários compartilhados: `window.escapeHTML`, `window.trapFocus` (com cleanup), `window.lockBodyScroll`, debounce, áudios, menus, scroll reveal
  4. `modules/catalog.js` — filtros, busca, render de produtos, carrossel; usa `window.escapeHTML`
  5. `modules/modal.js` — modal de produto, lightbox; usa `window.escapeHTML`, `window.trapFocus`, `window.lockBodyScroll`
  6. `modules/wishlist.js` — store reativo de favoritos com `localStorage`; usa `window.lockBodyScroll`
  7. `app.js` — orquestrador (init, parallax, scroll, ripple, audio, SW, produtos load com retry)
- **Dados**: `produtos.json` é a fonte canônica; carregado por `app.js` via `fetch()` com retry exponencial e banner de erro inline.
- **PWA**: Service Worker (`sw.js`, `BUILD_TIMESTAMP = '1.1.4'`) com cache-first para assets, network-first para `produtos.json` e navegações.
- **CSP**: definida via header em `vercel.json` (não usar `<meta>` per spec).
- **Headers de segurança**: HSTS, Permissions-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.

## 2. Comandos

| Comando                    | O que faz                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`              | Watch do Tailwind (modo desenvolvimento)                                          |
| `npm run build:css`        | Build minificado do Tailwind → `tailwind.css`                                      |
| `npm run lint`             | ESLint v9 flat config (`eslint.config.js`) em todos JS                             |
| `npm run lint:fix`         | ESLint com `--fix` (auto-correção de warnings triviais)                           |
| `npm run typecheck`        | `tsc --noEmit` em modo **strict** usando `jsconfig.json`                           |
| `npm run validate:products`| Valida schema de `produtos.json` (id, brand, image, gallery)                       |
| `npm run test:snapshot`    | Roda snapshot test do catálogo (IDs/marcas/whatsapp/gallery/image)                 |
| `npm run build`            | **Pipeline completo**: `validate:products` → `lint:fix` → `typecheck` → `build:css` |
| `npm test`                 | `validate:products` + `test:snapshot`                                             |

> **NÃO** commitar sem antes rodar `npm run build`. O CI deve falhar se typecheck/lint falharem.

## 3. Type safety (TypeScript via JSDoc)

- **Setup**: `jsconfig.json` (não `tsconfig.json`) com `checkJs: true`, `strict: true`, `noImplicitAny: true`.
- **Cobertura**: 100% dos arquivos JS têm `// @ts-check` no topo.
- **Utils compartilhados**: `escapeHTML` e `lockBodyScroll` vivem em `modules/ui.js` como `window.escapeHTML` / `window.lockBodyScroll`. Não duplique localmente.
- **Tipos**: declarados em `types/*.d.ts` como **interfaces globais** (sem `import`/`export` para que sejam ambient).
  - `types/product.d.ts` → `Product`, `ProductSpec`, `ProductHighlight`, `ProductBrand`
  - `types/store.d.ts` → `Store`, `StoreAddress`, `StoreLogo`, `StoresByCity`, etc.
  - `types/dom.d.ts` → `AppState`, `ModalState`, `AudioState`, `ModalDOMRefs`, `CatalogState`, `WishlistAPI`, `Subscriber`, `WishlistDrawerRefs`
  - `types/global.d.ts` → `declare global { interface Window { ... } }` (a única com `export {};`)
- **JSDoc rules**:
  - Toda função pública tem `@param` e `@returns`.
  - Callbacks de eventos tipados: `/** @type {EventListener} */ (function (/** @type {Event} */ _e) { ... })`
  - Casts: `(/** @type {HTMLElement} */ (e.target)).closest(...)` ou atribuir a `const target = /** @type {Element} */ (/** @type {unknown} */ (e.target));`
  - `// @ts-ignore` apenas com comentário explicando (raro, ex: `this` dinâmico em `debounce`).

## 4. Estrutura de arquivos

```
catalogo-Miplace-main/
├── index.html                    # HTML único, scripts com ?v=1.1.1 (cache-bust)
├── app.js                        # Entry: init, parallax, scroll, audio, SW
├── stores.js                     # 5 lojas (Piracicaba/Amparo), STORES global
├── modules/
│   ├── ui.js                     # trapFocus, debounce, trackEvent, playUIClick, menus
│   ├── catalog.js                # Filtros, busca, render, carrossel com IntersectionObserver
│   ├── modal.js                  # Modal, lightbox, contatos (DRY via STORES)
│   └── wishlist.js               # Store reativo, drawer lateral, import via URL, share
├── types/
│   ├── product.d.ts              # Product, ProductSpec, ProductHighlight, ProductBrand
│   ├── store.d.ts                # Store, StoreAddress, StoresByCity, etc.
│   ├── dom.d.ts                  # AppState, ModalDOMRefs, WishlistAPI, etc.
│   └── global.d.ts               # declare global { interface Window { ... } }
├── jsconfig.json                 # TS strict para JS
├── eslint.config.js              # ESLint v9 flat config
├── tailwind.config.js            # Tailwind config
├── src/input.css                 # CSS fonte
├── tailwind.css                  # Build output (gerado)
├── produtos.json                 # Fonte canônica de produtos
├── sw.js                         # Service Worker (BUILD_TIMESTAMP)
├── vercel.json                   # CSP, headers de segurança, cache-control
├── scripts/
│   ├── validate-products.js      # Schema validation
│   └── update-refs-webp.js       # Migração .png→.webp
├── .eslintrc.json                # Legado (substituído por eslint.config.js)
└── package.json
```

## 5. Padrões de código

- **Estilo**: Single quotes, `;` obrigatório, 4 espaços indent.
- **IIFEs**: cada módulo é `(() => { 'use strict'; ... })();`.
- **Event delegation**: nunca `onclick` inline. Usar `addEventListener` no container.
- **Refs DOM**: cachear via `document.getElementById` no init; tipar como `HTMLElement | null` e fazer narrow com `instanceof` ou null-checks.
- **Estado**: objetos mutáveis compartilhados via `window.MiplaceX` para módulos se comunicarem.
- **localStorage**: wrapper com try/catch para Safari Private Mode e quota exceeded.
- **Acessibilidade**: `aria-pressed`, `aria-expanded`, `aria-hidden`, `aria-live`, focus trap, ESC handlers.

## 6. Performance

- **Imagens**: `.webp` preferido, preload da hero (`<link rel="preload">`).
- **Fontes**: Google Fonts com `&subset=latin` e `display=swap`.
- **Carrossel**: usa `IntersectionObserver` + `visibilitychange` para pausar fora da viewport.
- **CSS**: Tailwind purged via `build:css` (apenas classes usadas).
- **Service Worker**: cache-first com versionamento via `BUILD_TIMESTAMP` (atualizar para invalidar).

## 7. Segurança

- **CSP** (em `vercel.json`): `default-src 'self'; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; ...`
- **HSTS**: `max-age=63072000; includeSubDomains; preload`
- **Permissions-Policy**: bloqueia camera/mic/geolocation/etc.
- **No inline scripts** exceto o necessário (CSP `'unsafe-inline'` em `script-src`).
- **Headers**: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

## 8. Workflow de mudanças

1. Editar código (JS/HTML/CSS)
2. `npm run typecheck` → 0 erros
3. `npm run lint` → 0 erros (warnings são tolerados)
4. `npm run validate:products` se tocou em `produtos.json`
5. `npm run build` → pipeline completo
6. Testar em dev (`http-server` ou similar) e fazer hard-refresh para bypassar SW

## 9. Bug fixes históricos

- **app.js:78**: `WeakMap` → `Map` (WeakMap não tem `.clear()`; bug introduzido em refator de performance)
- **sw.js**: bumpado `BUILD_TIMESTAMP` de `'20260328g'` → `'1.1.0'`; `produtos.json` removido de `ASSETS_TO_CACHE` (network-first)
- **index.html**: scripts com `?v=1.1.1` para forçar bypass do SW
- **Removido**: `<meta http-equiv="Content-Security-Policy-Report-Only">` (inválido em meta per spec)
