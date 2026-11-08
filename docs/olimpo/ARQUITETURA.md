# Arquitetura — Website Corporativo Miplace Group

> **Status:** revisão de arquitetura concluída para o gate M0; sem bloqueio de implementação.
> **Data:** 2026-11-07 · **Autora:** Atena (Tech Lead & Arquiteta)
> **Escopo:** home corporativa única + 3 páginas legais, catálogo existente preservado, PWA e API de contato.
> **Fontes:** `docs/olimpo/BRIEFING.md`, `REQUISITOS.md`, `INTEGRACAO.md`, `PENDENCIAS.md`, `DEVOPS.md`, `INFRA.md` e código atual em 2026-11-07 20:10.
> **Regra:** este documento não altera código de produção. A propriedade de arquivos do briefing §7 permanece válida.

## 1. Parecer sobre o briefing

**Aprovo a direção arquitetural.** A stack estática é adequada ao problema: 27 produtos, conteúdo editorial de baixa frequência, SEO e performance importam mais do que interatividade de aplicação. Não há motivo para React/Next nesta entrega.

- **Concordo** com vanilla JS + Tailwind v4 + PWA + Vercel; o catálogo existente e os contratos globais devem ser preservados.
- **Concordo** com home única + 3 páginas legais: narrativa corporativa em uma URL canônica, páginas legais separadas para obrigação e SEO próprio.
- **Concordo** com contato via função serverless, desde que o contrato e o fallback WhatsApp sejam parte do aceite, não um detalhe de UI.
- **Registro ressalvas, sem bloquear:** i18n client-side limita SEO de EN/ES (ADR-003); CSP mantém `'unsafe-inline'` por causa do boot inline e do import map (ADR-007); analytics e provedor de e-mail ainda são decisões abertas (ADR-006 e §9).
- **Não há hreflang honesto nesta versão:** a URL é a mesma para PT/EN/ES. Emitir `hreflang` para variantes client-side criaria sinal falso; a dívida está registrada e a evolução é rota/SSG por idioma.

### 1.1 Estado atual vs. alvo (verificado no repositório)

| Item | Estado verificado | Ação de integração | Dono |
|---|---|---|---|
| `index.html` | Ainda com header/H1 antigos e 4 seções; scripts `?v=1.2.0` (`index.html:96-101`) | Substituir pela home corporativa; preservar IDs/contratos | Afrodite |
| Seções corporativas | Ainda não existem | Criar as 11 seções e 3 páginas legais | Afrodite/Mnemósine |
| `sw.js` | Atualizado; lista `i18n`/`corporate` no precache (tolerante a 404), mas não `analytics`, `concierge` e `three-hero` (`sw.js:20-42`) | Precache dos críticos; runtime dos opcionais; bump de versão | Daedalus |
| `api/contact.js` | Existe e valida JSON, honeypot, consentimento, tamanho e rate limit (`api/contact.js:15-18`) | Integrar o formulário ao contrato real; não simular envio | Hefesto/Afrodite |
| `vercel.json` | HTML/SW/API já com `must-revalidate`/`no-store`; cache `immutable` só para ui, catalog, modal e wishlist (`vercel.json:21`); CSP em `vercel.json:75` | Incluir novos módulos no cache e revisar CSP | Ártemis |
| `favicon_io/site.webmanifest` | Atualizado com nome, ícones e shortcuts | Manter em sincronia com a versão/PWA | Daedalus |
| `sitemap.xml` | Só a home, `lastmod` de 2026-03-28 | Incluir as 3 páginas legais e atualizar `lastmod` | Mnemósine |
| `design/tokens.css` | Publicado em 20:07; `src/input.css` ainda tem 5 cores próprias | Mapear os tokens no `@theme` e remover duplicação | Íris/Afrodite |
| `docs/olimpo/INFRA.md` | Escrito antes de `api/contact.js`; diz que `api/` não existe | Reconciliar a seção 1/8 com o estado atual | Atlas/Zeus |

## 2. Diagrama textual de camadas

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ 0. DOCUMENTO — index.html + privacidade.html + termos.html +                │
│    acessibilidade.html                                                       │
│    HTML semântico, landmarks, âncoras estáveis, meta/OG, JSON-LD, noscript    │
└───────────────┬──────────────────────────────────┬───────────────────────────┘
                │ carrega                          │ estiliza
                ▼                                  ▼
┌───────────────────────────────────┐  ┌───────────────────────────────────────┐
│ 2. MÓDULOS JS                     │  │ 1. DESIGN SYSTEM CSS                  │
│ ui → i18n → analytics →           │  │ design/tokens.css                     │
│ catalog → modal → wishlist →      │  │   → src/input.css (@theme Tailwind)   │
│ corporate → concierge → app       │  │   → tailwind.css (build)              │
│ (three-hero: módulo ES opcional)  │  │   → styles.css (editorial/componentes)│
└──────────┬────────────────┬───────┘  └───────────────────────────────────────┘
           │ lê             │ POST /api/contact
           ▼                ▼
┌───────────────────────┐  ┌──────────────────────────────────────────────────┐
│ 3. DADOS              │  │ 4. API SERVERLESS                                │
│ produtos.json         │  │ api/contact.js (Vercel Function, Node 22)        │
│ stores.js             │  │ valida schema, honeypot, consentimento, rate     │
│ content/company.json  │  │ limit; envia por Resend; 503/502/504 → fallback  │
│ content/concierge-faq │  │ WhatsApp no cliente; nunca grava lead em banco   │
└───────────────────────┘  └──────────────────────────────────────────────────┘
           ▲
           │ entrega
┌──────────┴───────────────────────────────────────────────────────────────────┐
│ 5. ENTREGA — Vercel CDN + PWA                                                │
│ sw.js: precache versionado, network-first para HTML/produtos.json,           │
│ cache-first para estáticos versionados, offline.html; API nunca é cacheada   │
│ manifest + ícones + headers de cache/segurança                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Regra de ouro:** cada camada só conhece a imediatamente abaixo. HTML não contém regra de negócio; CSS não conhece dados; módulos JS não acessam Firebase/banco (não há banco); a API não é chamada por `catalog.js` nem por `wishlist.js`.

| Camada | Responsabilidade | Pode depender de | Não pode |
|---|---|---|---|
| HTML semântico | Conteúdo, landmarks, âncoras, SEO, formulário | CSS, módulos, dados estáticos | Regra de negócio, estilo inline extensivo |
| Design system CSS | Tokens, tipografia, layout, estados, motion | `design/tokens.css` | Dados, JS, hex solto em componente |
| Módulos JS | Comportamento, render, i18n, analytics | `window.Miplace*`, DOM, dados públicos | Escrever em `produtos.json`/`stores.js`, acessar internals de outro módulo |
| Dados | Fatos canônicos do catálogo/lojas/empresa | Nada | Copy inventada, dado pessoal |
| API serverless | Validar e enviar contato | Env vars, provedor de e-mail | Segredo no cliente, log de PII, persistência de lead |
| PWA | Cache, offline, instalabilidade | Assets versionados, `offline.html` | Cachear `/api/*`, servir HTML velho |

## 3. Módulos, ordem de scripts e contratos

A ordem abaixo é a do `INTEGRACAO.md:7-18`; `defer` garante execução após o parse e na ordem declarada. `three-hero.js` é módulo ES separado, carregado após `requestIdleCallback`, e não entra nessa fila.

| # | Módulo | Papel | Contrato público | Init |
|---|---|---|---|---|
| 1 | `stores.js` | 4 lojas, `STORES`, cartões, dropdown, JSON-LD | `window.STORES`, `getStoresByCity`, `renderContactDropdown`, `renderStoreCards`, `injectSchemaOrg` | imediato (dados) |
| 2 | `modules/ui.js` | Utilitários compartilhados, escape, foco, scroll, menus | `window.escapeHTML`, `trapFocus`, `lockBodyScroll`, `debounce`, `initScrollReveal` | imediato |
| 3 | `modules/i18n.js` | Dicionários PT/EN/ES, troca, persistência | `window.MiplaceI18n` (`init`, `t`, `setLocale`, `getLocale`, `apply`) | DOM pronto |
| 4 | `modules/analytics.js` | Fachada privacy-first, eventos permitidos | `window.MiplaceAnalytics` (`init`, `track`) | DOM pronto |
| 5 | `modules/catalog.js` | Filtros, busca, grade, carrossel | `window.renderFilters`, `renderProducts`, `initCatalog`, `initSearch` | `app.js` chama |
| 6 | `modules/modal.js` | Modal de produto, lightbox, galeria | `window.initModal` | `app.js` chama |
| 7 | `modules/wishlist.js` | Store reativo de favoritos | `window.MiplaceWishlist` (`has`, `toggle`, `subscribe`, `refresh`) | imediato |
| 8 | `modules/corporate.js` | Contadores, reveal, vídeo, seções institucionais | `window.MiplaceCorporate` (se necessário) | DOM pronto |
| 9 | `modules/concierge.js` | FAQ/IA opcional, lazy | `window.MiplaceConcierge` | sob demanda |
| 10 | `app.js` | Composição: schema, catálogo, modal, busca, fetch de produtos, SW | `window.MiplaceState`, `window.MiplaceProducts` | `DOMContentLoaded` |

**Regras de dependência (revisão de código):**

1. Nenhum módulo lê estado interno de outro; só o contrato `window.Miplace*` ou as funções `window.render*/init*` documentadas.
2. Captura no topo só é permitida de módulos anteriores na ordem (ex.: `catalog.js` captura `escapeHTML` de `ui.js`). Referências a módulos posteriores devem ser lazy, com guarda `if (window.X)`.
3. `i18n.js` roda antes de `catalog.js`, `corporate.js` e `app.js`; `analytics.js` antes de qualquer evento de UI.
4. `app.js` é o único orquestrador; `corporate.js` não pode duplicar render de catálogo, modal ou wishlist.
5. Todo `init` é idempotente, testa o DOM e não lança se a seção não existir (home x páginas legais).
6. `three-hero.js` é progressivo: se WebGL, `prefers-reduced-motion` ou seletor novo falharem, o layout estático permanece.

## 4. Dados e fontes canônicas

| Fonte | Papel | Regra | Dono |
|---|---|---|---|
| `produtos.json` | 27 produtos, 9 marcas, imagens, preços | Fonte canônica; **não alterar** nesta entrega; validado por `scripts/validate-products.js` e snapshot | Hades/Afrodite |
| `stores.js` | 4 lojas, endereços, WhatsApp, redes, geo | Fonte canônica; pode ganhar campos, **não perder**; alimenta JSON-LD e cards | Afrodite |
| `content/company.json` | Fatos corporativos estruturados (números, compromissos, jurídico) | Publicado; `null`/`"status":"pendente"` para lacunas; **copy crítica deve existir no HTML**, não só no JSON | Hades |
| `content/schema/company.schema.json` | JSON Schema do `company.json` | Validar o arquivo antes de publicar; não é carregado pelo cliente | Hades |
| `content/concierge-faq.json` | FAQ do concierge | Opcional; não pode conter dado inventado nem PII | Hécate |
| `favicon_io/site.webmanifest` | Nome, ícones, shortcuts, cores | Sincronizado com tokens e versão; ícones existentes | Daedalus |

**Decisão de carregamento:** `produtos.json` continua via `fetch` em `app.js`, com retry e banner de erro (comportamento atual). `content/company.json` é auxiliar: o HTML entrega a copy principal (SEO e no-JS); o JSON complementa JSON-LD/estados e tem fallback silencioso se falhar. Nunca usar `fetch` de JSON para renderizar o H1 ou o manifesto.

**Não duplicar:** não copiar preços para `index.html`; não copiar endereços para `content/company.json`; não criar segundo array de marcas — a lista canônica continua em `modules/catalog.js`/`types/product.d.ts`/`scripts/validate-products.js`.

## 5. Contrato da API de contato

Implementação atual: `api/contact.js` (CommonJS, Vercel Node 22). O cliente envia `POST /api/contact` com `Content-Type: application/json` e:

```json
{ "name": "string", "email": "string", "phone": "string", "subject": "string", "message": "string", "consent": true, "website": "" }
```

| Situação | Status | Corpo | Ação no cliente |
|---|---:|---|---|
| Envio aceito | 200 | `{ ok: true, code: "SENT" }` | Mostrar confirmação em `aria-live`; limpar formulário |
| Honeypot preenchido | 200 | `{ ok: true, code: "OK" }` | Mostrar confirmação genérica; não revelar bloqueio |
| Campo inválido | 400 | `{ ok: false, code: "VALIDATION_ERROR", errors: [...] }` | Erro por campo, foco no primeiro inválido |
| Corpo grande | 413 | `{ ok: false, code: "PAYLOAD_TOO_LARGE" }` | Mensagem genérica |
| JSON/tipo errado | 400/415 | `INVALID_JSON` / `UNSUPPORTED_MEDIA_TYPE` | Erro de formulário |
| Rate limit | 429 | `{ ok: false, code: "RATE_LIMITED" }` + `Retry-After` | Mensagem + WhatsApp |
| Provedor não configurado | 503 | `EMAIL_NOT_CONFIGURED` | Fallback WhatsApp obrigatório |
| Timeout do provedor | 504 | `EMAIL_TIMEOUT` | Fallback WhatsApp |
| Falha do provedor | 502 | `EMAIL_SEND_FAILED` | Fallback WhatsApp |
| Erro interno | 500 | `INTERNAL_ERROR` | Fallback WhatsApp |

**Regras:** só `POST`; corpo máximo de 20 KB; `consent === true`; `website` vazio; validação de e-mail/telefone/tamanhos no servidor; nenhum segredo no cliente; nenhum PII em log; rate limit em memória é **por instância** (limitação do serverless, não fronteira de segurança). Para abuso real, usar rate limit de borda/WAF ou provedor; não confiar só no Map local.

## 6. ADRs

### ADR-001 — Manter vanilla JS + Tailwind v4 + PWA + Vercel

- **Status:** Aceito.
- **Contexto:** catálogo estático de 27 produtos, editorial de baixa frequência, SEO e LCP críticos; o código atual já tem contratos globais, testes de snapshot e build Tailwind.
- **Decisão:** manter a stack; não introduzir React/Next/Astro nesta entrega; não adicionar biblioteca pesada. Type safety continua via JSDoc + `tsc --noEmit` (`jsconfig.json`).
- **Consequências:** bundle pequeno e deploy simples; estado manual e acoplamento por `window.*` exigem disciplina de módulos e testes de contrato. Um framework futura pode ser avaliado se houver CMS, rotas por idioma ou área logada.
- **Alternativas:** Next/Astro dariam componente/SSG, mas exigiriam reescrever catálogo e contratos, contra o prazo e o escopo de preservação.

### ADR-002 — Home única + três páginas legais estáticas

- **Status:** Aceito.
- **Contexto:** a narrativa corporativa é sequencial (hero → manifesto → números → negócios → marcas → presença → compromissos → carreiras → imprensa → coleção → contato); as páginas legais têm obrigação própria e conteúdo estável.
- **Decisão:** uma `index.html` com âncoras estáveis; `privacidade.html`, `termos.html` e `acessibilidade.html` separadas, com o mesmo CSS e um shell mínimo. `imprensa` e `carreiras` continuam seções nesta versão.
- **Consequências:** uma URL canônica forte e narrativa coesa; página longa e shell duplicado nas 3 legais. Preservar `#enderecos` como âncora-ponte para `#presenca` evita quebrar links antigos.
- **Alternativas:** multipágina corporativa completa; melhor granularidade de SEO, mas multiplica templates, navegação e custo de integração sem conteúdo suficiente.

### ADR-003 — i18n client-side com fallback PT

- **Status:** Aceito com ressalva de SEO.
- **Contexto:** PT-BR é o padrão; EN/ES cobrem apenas a camada corporativa; produtos, endereços e dados de catálogo permanecem em PT. Não há orçamento para rotas/SSG por idioma.
- **Decisão:** `modules/i18n.js` com dicionários inline, `data-i18n`/`data-i18n-attr`, `localStorage` (`miplace-locale`), atualização de `<html lang>`, `<title>` e meta description; fallback PT para chave ausente; seletor PT/EN/ES com `aria-pressed`.
- **Consequências:** troca sem reload e zero infraestrutura; FOUC se o script atrasar, chaves podem divergir e EN/ES não terão indexação própria. Mitigar com dicionários inline, init antes do render corporativo, teste de paridade de chaves e **não emitir `hreflang` sem URL distinta**.
- **Alternativas:** rotas `/en/`, `/es/` ou SSG por idioma; é a evolução correta quando SEO internacional virar meta, mas não nesta entrega.

### ADR-004 — Contato via função serverless na Vercel

- **Status:** Aceito.
- **Contexto:** site estático sem backend; o formulário precisa enviar sem expor credenciais e com fallback quando o provedor falhar. A função `api/contact.js` já implementa o contrato.
- **Decisão:** `POST /api/contact` same-origin, JSON, validação no servidor, honeypot `website`, `consent === true`, limite de 20 KB, rate limit best-effort, env `RESEND_API_KEY`, `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL`. Falha 503/502/504 sempre oferece WhatsApp com texto pré-preenchido.
- **Consequências:** sem banco e sem lead persistido; dependência de provedor e cold start; rate limit em memória não é garantia global. Para produção, configurar rate limit de borda/WAF e monitorar a função.
- **Alternativas:** formulário de terceiro (Formspree etc.) reduz código, mas adiciona fornecedor, CSP e transferência de PII; SMTP próprio exigiria credencial e mais superfície.

### ADR-005 — Cache e service worker versionados

- **Status:** Aceito.
- **Contexto:** PWA com assets estáticos, HTML mutável e `produtos.json` dinâmico; o `sw.js` atual já usa `BUILD_TIMESTAMP`, network-first para navegação/JSON e cache-first para estáticos (`sw.js:11-42`).
- **Decisão:** manter a estratégia; precache do shell e dos módulos que o offline precisa (`i18n`, `corporate`, páginas legais); `analytics`, `concierge` e `three-hero` podem ser cache runtime, conforme `PWA_MOBILE.md`, desde que o offline dessas camadas seja aceito como degradado; nunca cachear `/api/*`; `networkFirst` com timeout para HTML/`produtos.json`; `offline.html` como fallback; bump de `CACHE_NAME` e `?v=` no mesmo release.
- **Consequências:** visitas repetidas rápidas e offline útil; risco de cache velho se versão não for bumpada. Mitigar com checklist de release e teste de atualização (Application → Service Workers).
- **Alternativas:** Workbox daria estratégias prontas, mas adiciona build/dependência; sem SW eliminaria o PWA, contra o briefing.

### ADR-006 — Analytics privacy-first e provider-agnostic

- **Status:** Aceito com pendência de provedor (`PENDENCIAS.md` #8/#13).
- **Contexto:** não há cookies de analytics hoje; o briefing exige privacy-first e a LGPD está no escopo. GA4/Plausible/Matomo ainda não foram escolhidos.
- **Decisão:** `modules/analytics.js` é uma fachada; **default no-op**. Eventos permitidos: `page_view`, `catalog_filter`, `product_open`, `wishlist_add`, `contact_submit`, `locale_change`, `store_click`. Nunca enviar nome, e-mail, telefone, mensagem, termo de busca, URL completa com query ou ID persistente. Respeitar `DNT`/`GPC`. Se o provedor for externo, CSP `script-src`/`connect-src` só recebe o domínio após decisão; GA4 exige consentimento e banner.
- **Consequências:** privacidade por padrão e zero custo até decidir; menos atribuição. A escolha do provedor é bloqueio de go-live apenas para a meta de observabilidade, não para o site.
- **Alternativas:** Vercel Analytics (cookieless, same-origin) é a opção de menor atrito; Plausible/Matomo são alternativas; GA4 fica para quando houver consentimento e necessidade de mídia paga.

### ADR-007 — CSP compatível agora, estrita como alvo

- **Status:** Aceito com dívida técnica registrada.
- **Contexto:** `vercel.json:75` tem `script-src 'self' 'unsafe-inline'`; o `index.html` usa um boot inline (`index.html:19-27`) e um import map inline (`index.html:90-92`). Remover `unsafe-inline` agora quebraria o boot e o Three.js.
- **Decisão:** manter a CSP atual nesta entrega, com `object-src 'none'`, `base-uri 'self'`, `frame-ancestors 'none'`, `form-action 'self'` e `connect-src 'self'`. Não adicionar domínio externo para contato (same-origin). Se analytics externo for escolhido, adicionar **somente** o domínio necessário. Alvo: externalizar o boot, remover o import map (import relativo do vendor) e então remover `'unsafe-inline'` de `script-src`; `style-src` pode manter `'unsafe-inline'` enquanto houver style attributes.
- **Consequências:** compatibilidade imediata; `'unsafe-inline'` reduz a defesa contra XSS. Compensar com `escapeHTML` em todo HTML dinâmico, ausência de `innerHTML` com dado não escapado, revisão de links e CSP report-only no preview antes de endurecer.
- **Alternativas:** CSP estrita agora exigiria hashes/nonces e refatoração de HTML/Three; correto como próximo ciclo, não como bloqueio do M0.

## 7. Riscos técnicos e mitigação

| # | Risco | Severidade | Evidência | Mitigação | Dono |
|---|---|---|---|---|---|
| 1 | IDs/`window.*` quebrados na reescrita da home | Alta | `app.js:396-408`; `modules/catalog.js:380-386`; BRIEFING §6 | Congelar a lista de contratos; teste de fumaça que verifica cada ID/função; diff de integração | Afrodite/Argos |
| 2 | Ordem de scripts, i18n e módulos novos | Alta | `INTEGRACAO.md:7-18`; `index.html:96-101` | Ordem única; init idempotente; guardas `if (window.X)`; teste de console sem erros | Zeus/Afrodite |
| 3 | CSP × inline boot/import map/analytics | Alta | `vercel.json:75`; `index.html:19-27,90-92` | Inventário de scripts; não adicionar domínio sem decisão; report-only; dívida ADR-007 | Ártemis/Afrodite |
| 4 | Service worker/manifest/cache de módulos novos | Alta | `sw.js:20-42`; `vercel.json:21` | Precache dos críticos; runtime dos opcionais; bump; teste de atualização; cache pattern para `/modules/*`; API fora | Daedalus/Ártemis |
| 5 | Formulário sem as 3 env vars na Vercel | Alta | `api/contact.js:363-370` exige `RESEND_API_KEY` + `CONTACT_TO_EMAIL` + `CONTACT_FROM_EMAIL`; `DEVOPS.md:88-90` documenta, mas o valor ainda não foi configurado | Configurar as 3 env; testar 503 e fallback WhatsApp; rate limit de borda | Hefesto/Hermes |
| 6 | SEO: H1 duplicado, lojas só em JS, sitemap incompleto | Média | `index.html:148,207`; `stores.js:176-207`; `sitemap.xml` | Um H1 no hero; JSON-LD `Organization` + `WebSite`; endereços em HTML/JSON-LD; sitemap com legais | Afrodite/Mnemósine |
| 7 | Performance da home longa | Média | vídeo 4,3 MB (`index.html:193`), MP3 6,5 MB, 27 imagens, 3D | Áudio sob demanda; poster; lazy abaixo da dobra; orçar 3D; Lighthouse 4G | Afrodite/Íris |
| 8 | Conflito de edição no `index.html` | Alta | briefing §7; várias frentes | Snippets, janela única de integração, ownership e PR pequeno | Zeus/Hera |

## 8. Checklist de revisão de código — entrega da Afrodite

### Contratos e integração

- [ ] Todos os IDs do BRIEFING §6 preservados, incluindo `#category-filters`, `#search-input`, `#search-clear`, `#search-count`, `#products-grid`, `#stores-grid`, `#contato-dropdown-content`, `#contato-menu`, `#hamburger-btn`, `#mobile-menu`, `#lightbox`, `#product-modal`, `#modal-content`, `#wishlist-fab`, `#wishlist-drawer`, `#back-to-top`, `#scroll-progress`, `#page-fade`.
- [ ] `window.renderFilters`, `renderProducts`, `initCatalog`, `initModal`, `initSearch`, `renderStoreCards`, `renderContactDropdown` e `window.MiplaceWishlist` continuam disponíveis.
- [ ] `#products-grid` renderiza 27 produtos; filtros, busca, modal, lightbox e wishlist funcionam em desktop e mobile.
- [ ] Ordem de scripts exatamente `stores → ui → i18n → analytics → catalog → modal → wishlist → corporate → concierge → app`, com `defer`; nenhum módulo novo é chamado antes de existir.

### HTML, semântica e SEO

- [ ] Um único `h1` (hero); logo do header é link/texto, não heading; títulos de seção em `h2`, cards em `h3`; sem salto de nível.
- [ ] IDs das 11 seções do briefing (`inicio`, `sobre`, `numeros`, `negocios`, `marcas`, `presenca`, `compromissos`, `carreiras`, `imprensa`, `catalogo`, `contato`) e âncora-ponte `#enderecos` para links antigos.
- [ ] `title`, meta description, canonical, OG/Twitter e JSON-LD `Organization` + `WebSite` atualizados; sem `hreflang` falso para variantes client-side.
- [ ] Páginas legais linkadas no rodapé; `sitemap.xml` inclui as 3; dados jurídicos ausentes marcados como pendentes.
- [ ] Imagens com `alt`, dimensões e `loading="lazy"` abaixo da dobra; hero com `fetchpriority="high"` e poster; links externos com `rel="noopener noreferrer"`.

### CSS e design system

- [ ] Tokens de `design/tokens.css` são a fonte única; `src/input.css` mapeia `@theme`; `styles.css` não redefine paleta.
- [ ] Sem hex/rgb solto em `index.html`/JS quando existir token; sem `!important` novo; sem style attribute extensivo.
- [ ] Contraste AA, foco visível, alvos ≥44px, `prefers-reduced-motion` desliga reveal/contadores/parallax.
- [ ] `npm run build:css` gera `tailwind.css` sem classes faltantes; classes dinâmicas usam safelist/`@source` correto.

### JavaScript

- [ ] IIFE + `'use strict'` + `// @ts-check`; JSDoc em funções públicas; sem `any` implícito.
- [ ] Nenhum `onclick` inline; event delegation; `escapeHTML` em todo HTML dinâmico; nenhum `innerHTML` com dado não escapado.
- [ ] Nenhum estado novo em `window` além dos contratos `Miplace*`; sem duplicar `STORES`, marcas ou produtos.
- [ ] `init` idempotente, testa DOM ausente e não quebra páginas legais; sem erro de console em desktop/mobile.

### i18n

- [ ] 100% das chaves corporativas em PT/EN/ES; fallback PT; nenhuma chave crua visível.
- [ ] `data-i18n`/`data-i18n-attr` cobrem texto, `placeholder`, `aria-label` e `title`; `<html lang>`, `<title>` e description mudam.
- [ ] Produtos, endereços e nomes de marca não são traduzidos; `miplace-locale` persiste; seletor tem `aria-pressed`.
- [ ] Texto dinâmico de `corporate.js`/`concierge.js` chama `MiplaceI18n.apply()` depois de inserir DOM.

### Catálogo e dados

- [ ] `produtos.json` e `stores.js` intocados nos dados; nenhum preço/endereço copiado à mão para o HTML.
- [ ] 27 produtos, 9 marcas, 4 lojas; `npm test` e `npm run validate:products` verdes.
- [ ] Cards de loja continuam vindo de `stores.js`; `injectSchemaOrg` atualizado para `Organization` + `WebSite` + lojas.

### Contato

- [ ] `POST /api/contact` com o JSON exato; `consent` booleano; `website` honeypot vazio.
- [ ] Validação no cliente **e** no servidor; erros associados ao campo e `aria-live`; estado de loading evita duplo envio.
- [ ] 503/502/504/429 mostram mensagem clara e link WhatsApp com texto pré-preenchido; nenhum segredo no cliente.
- [ ] Testar com `CONTACT_FROM_EMAIL` ausente (deve dar 503 + fallback), com sucesso e com rate limit.

### PWA, performance e acessibilidade

- [ ] `sw.js` inclui todos os módulos/páginas usadas, `BUILD_TIMESTAMP` bumpado e `/api/*` fora do cache; teste offline e update.
- [ ] `site.webmanifest` com nome, ícones existentes, `start_url`, `theme_color` coerente; install prompt sem erro.
- [ ] Áudio sob demanda; vídeo mudo com poster e sem bloquear LCP; 3D só após idle e com fallback.
- [ ] Skip link, navegação por teclado, focus trap/ESC em modal/drawer, `aria-expanded`, `aria-hidden`, contraste e reduced motion.
- [ ] Lighthouse mobile ≥85 Performance, ≥95 Acessibilidade/Best Practices/SEO (meta aspiracional; registrar medição real).

### Build e evidência

- [ ] `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` passam.
- [ ] `node scripts/test-site.js` (quando Argos entregar) passa; smoke em 360/768/1024/1440.
- [ ] Nenhum arquivo de produção fora da propriedade da Afrodite alterado; snippets de módulos novos reportados a Zeus.
- [ ] `vercel.json`/`sw.js`/`?v=`/`package.json` na mesma versão; CSP revisada se novo script externo.

## 9. Decisões em aberto (não bloqueiam o M0)

| # | Decisão | Impacto | Dono | Como resolver |
|---|---|---|---|---|
| 1 | Provedor de analytics (Vercel/Plausible/Matomo/GA4) | CSP, consentimento, SLO | Deméter/Ártemis | Escolher cookieless por padrão; GA4 só com consentimento |
| 2 | Provedor de e-mail e caixa de destino | Função 503, go-live do formulário | Hefesto/Hermes | Definir Resend/SMTP; configurar `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` |
| 3 | Dados jurídicos (razão social/CNPJ) | Rodapé, JSON-LD, páginas legais | Mnemósine/usuário | Preencher `PENDENCIAS.md` #1; manter “pendente” até revisão |
| 4 | Licença dos logos/fotos | Parede de marcas e manifesto | Apolo/usuário | Usar tipografia; não publicar logo sem licença |
| 5 | Rotas/SSG por idioma | SEO EN/ES | Atena/Afrodite | Pós-aprovação; hoje i18n client-side com dívida registrada |
