# PWA e Experiência Mobile — Miplace Group

> Responsável: Daedalus (Engenheiro Mobile) · Atualizado em 2026-11-07
> Escopo: `favicon_io/site.webmanifest`, `sw.js`, `offline.html` e este documento.
> `index.html` não foi editado.

## 1. O que foi implementado

- **Manifest corporativo** em `favicon_io/site.webmanifest`:
  - `name` e `short_name`: `Miplace Group`;
  - `theme_color`: `#141414`; `background_color`: `#f5f2ea`;
  - `display: standalone`, `start_url: /`, `scope: /`, `id: /`;
  - ícones existentes em `favicon_io/` (192, 512 e Apple 180), com caminhos relativos ao manifest;
  - atalhos para `/#catalogo` e `/#contato`;
  - `lang: pt-BR`, `dir: ltr`, `prefer_related_applications: false`.
- **Service worker** em `sw.js`:
  - network-first para navegações e `produtos.json`, com timeout de 4 s;
  - cache-first para os demais assets locais;
  - fallback `offline.html` para navegação sem cache;
  - API (`/api/*`), `/_vercel/*`, `Range` e cross-origin passam direto, sem cache;
  - precache tolerante a 404 (um módulo ausente não derruba a instalação inteira).
- **Página offline** em `offline.html`: self-contained, sem fontes externas, com os tokens corporativos, link “Tentar novamente” e área segura para iOS.

### Desvio consciente: `start_url`

O briefing pedia `start_url: ./`, mas o manifest fica em `/favicon_io/site.webmanifest`. Pela spec, `./` resolveria para `/favicon_io/`, abrindo a pasta de ícones em vez do site. Foi usado `"/"` (e `scope: "/"`), que aponta para a home real. Se o manifest for movido para a raiz no futuro, `./` passa a ser válido.

## 2. Estratégia de cache

| Requisição | Estratégia | Fallback |
|---|---|---|
| Navegação (`document`/`navigate`) | Network First, timeout 4 s | cache da rota → `/index.html`/`/` → `offline.html` |
| `produtos.json` | Network First, timeout 4 s | cache do JSON → `503` com JSON vazio |
| CSS, JS, imagens, favicons, manifest | Cache First | `504` (ou `offline.html` se for documento) |
| `/api/*` | Não intercepta | erro de rede normal; formulário usa fallback WhatsApp |
| Cross-origin (Font Awesome, Google Fonts, CDN) | Não intercepta | navegador decide; offline degrada para fonte/ícone local |
| `Range` (vídeo/áudio) | Não intercepta | navegador decide |

### Por que `ignoreSearch`

O HTML referencia os módulos com `?v=2.0.0` (`app.js`, `modules/ui.js`, etc.), mas o precache usa os caminhos limpos. Todas as buscas no Cache Storage usam `{ ignoreSearch: true }`; sem isso, `cache.match('/app.js?v=2.0.0')` não encontraria `/app.js` e o app quebraria offline. Não remover essa opção.

### Versão e atualização

- `BUILD_TIMESTAMP` em `sw.js` é a versão do cache. **Bump obrigatório a cada release** que altere CSS, JS, HTML ou o próprio SW.
- O `activate` remove apenas caches com prefixo `miplace-` e nome diferente do atual.
- `skipWaiting()` + `clients.claim()` fazem a nova versão assumir rápido; em troca, uma aba aberta pode receber assets novos no meio da sessão. Para o catálogo estático, o risco é aceitável; se houver erro de chunk, recarregar resolve.
- Recomendação para o Ártemis (dono de `vercel.json`): headers explícitos `Cache-Control: no-cache` para `/sw.js` e `/favicon_io/site.webmanifest`. Hoje não há regra específica; um `sw.js` preso em cache atrasa a atualização mesmo com bump.

### Assets precacheados

`/`, `/index.html`, `tailwind.css`, `styles.css`, `stores.js`, `app.js`, `modules/ui.js`, `modules/catalog.js`, `modules/modal.js`, `modules/wishlist.js`, `modules/i18n.js`, `modules/corporate.js`, `produtos.json`, `offline.html` e favicons.

`modules/i18n.js` e `modules/corporate.js` ainda não existem no repositório nesta data. O precache registra aviso e continua; eles entram no cache no primeiro acesso online (runtime) ou no próximo bump. `modules/analytics.js`, `modules/concierge.js` e `modules/three-hero.js` também são cacheados em runtime quando carregados; não estão no precache para não inflar a instalação.

## 3. Checklist mobile

### Viewport e layout

- [x] `offline.html` usa `viewport-fit=cover` e `100dvh` com fallback `100vh`.
- [ ] `index.html`: incluir `viewport-fit=cover` no viewport (hoje `width=device-width, initial-scale=1.0`). Dono: Afrodite.
- [ ] Safe areas: `padding`/`env(safe-area-inset-*)` no header fixo, menu mobile, drawer da wishlist, modais e footer. Dono: Afrodite/Íris.
- [ ] Evitar largura fixa em modais/painéis; usar `min(100% - 32px, <max>)` ou `max-width` com `width: 100%`.
- [ ] Testar em 360, 390, 768, 1024 e 1440 px; retrato e paisagem.
- [ ] Não bloquear orientação no manifest (não foi definido `orientation`).

### Toque e legibilidade

- [ ] Alvos de toque com no mínimo 44 × 44 px (menu, busca, filtros, favoritos, fechar modal, setas do carrossel).
- [ ] Espaçamento mínimo de 8 px entre alvos vizinhos.
- [ ] Inputs com `font-size: 16px` no mobile para evitar zoom automático no iOS.
- [ ] Não depender de `hover` para ações; manter equivalentes por toque e foco.
- [ ] `:focus-visible` visível em todos os controles; testar teclado.
- [ ] Contraste AA: `#141414`/`#f5f2ea`, `#4a4641`/`#f5f2ea` e `#8c1d1d` em textos pequenos.
- [ ] Respeitar `prefers-reduced-motion` nas animações e no scroll suave.

### Performance

- [ ] Manter `tailwind.css` e `styles.css` locais e cacheáveis; evitar CSS externo bloqueante.
- [ ] Imagens em WebP/AVIF com `width`/`height` ou `aspect-ratio` para evitar CLS.
- [ ] `loading="lazy"` e `decoding="async"` abaixo da dobra; não aplicar lazy no hero.
- [ ] `preload` apenas do CSS crítico, poster do vídeo e imagem do hero.
- [ ] Vídeo mudo com `poster` e `preload="metadata"`; música só após gesto.
- [ ] Font Awesome e Google Fonts são cross-origin: se falharem, o layout deve continuar legível com fallback de sistema.
- [ ] Evitar bibliotecas novas; o 3D (`three-hero.js`) deve ser progressivo e não bloquear o catálogo.

### iOS

- [x] `apple-touch-icon` 180×180 referenciado no `index.html`.
- [x] `apple-mobile-web-app-capable` e `apple-mobile-web-app-status-bar-style` presentes no `index.html`.
- [ ] Confirmar `apple-mobile-web-app-title` = `Miplace Group` após a troca de título pelo Afrodite.
- [ ] Instalação manual: Safari → Compartilhar → “Adicionar à Tela de Início”; não existe prompt automático no iOS.
- [ ] Testar status bar, safe areas e altura do menu no modo standalone.
- [ ] Testar teclado aberto em formulário de contato e na busca; o campo focado precisa continuar visível.
- [ ] Evitar `100vh` puro em telas com barra do Safari; usar `100dvh` quando possível.
- [ ] Armazenamento do PWA pode ser despejado pelo iOS; não usar como único local de dados críticos.

## 4. Como testar

### Sintaxe e integridade

```bash
node --check sw.js
node -e "JSON.parse(require('fs').readFileSync('favicon_io/site.webmanifest','utf8')); console.log('manifest ok')"
```

### Smoke local

```bash
npx serve .
# abrir http://localhost:3000
```

1. DevTools → Application → Manifest: conferir nome, cores, ícones 192/512, atalhos e ausência de erro de ícone.
2. Application → Service Workers: conferir `/sw.js` ativo e o cache `miplace-v2026-11-07.1`.
3. Application → Cache Storage: conferir os assets precacheados. `i18n.js`/`corporate.js` podem estar ausentes (esperado nesta data).
4. Network → Offline; recarregar `/`: deve carregar o shell cacheado.
5. Offline, navegar para `/#catalogo` e abrir um produto: catálogo e modal devem funcionar com `produtos.json` cacheado.
6. Offline, abrir uma rota não cacheada (ex.: `/qualquer-coisa`): deve exibir `offline.html`.
7. Offline, enviar o formulário: a chamada `/api/contact` deve falhar e o fallback WhatsApp deve aparecer.
8. Com online, alterar `sw.js` (bump) e recarregar duas vezes: o cache antigo deve ser removido e o novo ativado.
9. Application → Clear storage → recarregar online: instalação do zero deve concluir mesmo com `i18n.js`/`corporate.js` ausentes.
10. Lighthouse mobile (após integração do Afrodite): Performance ≥ 85, Acessibilidade ≥ 95, Best Practices ≥ 95.

### Dispositivos

- Android Chrome: instalar pelo menu, abrir standalone, testar offline, atalhos e voltar pelo gesto.
- iPhone Safari: Adicionar à Tela de Início, abrir standalone, testar safe areas, teclado e offline.
- Tablet: paisagem, toque, menu mobile e modais.
- Rede lenta: DevTools → Network → Slow 4G; a navegação deve cair para cache após 4 s, não ficar em branco.

## 5. Riscos de cache conhecidos

1. **`sw.js` sem `no-cache` no `vercel.json`**: o navegador pode manter o worker antigo e atrasar a atualização; o bump sozinho não resolve se o arquivo não for revalidado. Ação: Ártemis adicionar header.
2. **Query string nos módulos**: o HTML usa `?v=2.0.0`; qualquer `cache.match` sem `ignoreSearch` deixa o app sem JS offline. Ação: manter a opção e testar após a integração.
3. **Módulos novos ausentes no install**: `i18n.js`/`corporate.js` são tolerados, mas só entram no cache no primeiro acesso online ou após bump; se o usuário ficar offline antes disso, i18n/camadas corporativas não carregam. Ação: bump após a integração e um teste online antes de liberar.

## 6. Pendências de integração

- Afrodite: atualizar `theme-color` do `index.html` para `#141414`, adicionar `viewport-fit=cover` e revisar safe areas/tap targets.
- Ártemis: header `Cache-Control: no-cache` para `/sw.js` e `site.webmanifest`.
- Zeus: bump de `BUILD_TIMESTAMP` depois que `i18n.js`, `corporate.js`, `analytics.js` e `concierge.js` estiverem no HTML final.

## 7. Teste executado nesta entrega

```text
node --check sw.js                                  → ok
JSON.parse(favicon_io/site.webmanifest)             → ok (3 ícones, 2 atalhos)
checagem dos 16 caminhos existentes do precache     → ok
parse de offline.html                               → ok
smoke HTTP local                                    → 200 em /, /sw.js, /offline.html, manifest e ícones
```

Não foi possível testar o service worker em navegador real nesta máquina sem abrir um servidor local e um Chrome com DevTools; o roteiro da seção 4 cobre esse teste na integração.

