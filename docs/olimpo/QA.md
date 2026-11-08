# Plano de QA — Miplace Group

**Autor:** Argos (QA) · **Data:** 2026-11-07 · **Escopo:** site corporativo + catálogo + páginas legais + PWA + formulário de contato.

## 1. Objetivo

Garantir que a entrega corporativa preserve o catálogo e os contratos atuais, cumpra WCAG 2.2 AA, mantenha SEO/PWA íntegros e tenha um gate de release reproduzível — sem browser na fase 1 e com Playwright na fase 2.

**Artefatos desta entrega**

- `scripts/test-site.js` — validador estático em Node puro, sem dependências novas, exit code 1 em falha.
- `docs/olimpo/QA.md` — este plano, matriz de dispositivos, checklist e critérios de bloqueio.
- Fase 2 (não instalada nesta sessão): suíte Playwright + axe + Lighthouse CI.

**Fora de escopo agora:** teste de carga, teste de penetração, publicação em lojas, compra real e validação de dados de produção.

## 2. Estratégia

| Camada | O que cobre | Ferramenta | Fase |
|---|---|---|---|
| Estático | Arquivos, HTML, links, IDs, alt, JSON-LD, produtos, sitemap/robots | `node scripts/test-site.js` | 1 (pronta) |
| Integração de API | `POST /api/contact`, erros, honeypot, fallback | Playwright `request` ou `curl` em staging | 2 |
| E2E browser | Catálogo, busca, filtros, modal, wishlist, i18n, formulário, PWA | Playwright | 2 |
| Acessibilidade | axe + teclado + foco + contraste | Playwright + axe-core; Lighthouse | 2 |
| Performance | LCP, INP, CLS, peso, cache | Lighthouse CI / WebPageTest | 2 |
| Exploratório | Copy, responsividade, estados vazios, erros de rede | Manual guiado por risco | 1 e 2 |

**Ambientes:** local (`npx serve .`), preview da Vercel e produção. Dados de catálogo vêm de `produtos.json` (canônico); lojas de `stores.js`. Nunca usar dados pessoais reais em teste.

## 3. Fase 1 — validador estático (implementado)

```bash
node scripts/test-site.js
node scripts/test-site.js --strict   # avisos também falham
node scripts/test-site.js --root /caminho/do/site
```

**Cobertura do script**

- Arquivos obrigatórios: `index.html`, `styles.css`, `app.js`, `produtos.json`, `privacidade.html`, `termos.html`, `acessibilidade.html`, `sw.js`, `offline.html`.
- `index.html`: `lang`, `title`, `meta description`, `canonical`, exatamente um `h1`, âncoras internas resolvendo no disco, `alt` em imagens, IDs únicos.
- `JSON-LD`: todo bloco `application/ld+json` precisa ser JSON parseável; avisa se faltar `Organization`/`WebSite`.
- `produtos.json`: array, IDs inteiros e únicos, marca permitida, nome, imagem existente, galeria existente, `price`/`specialPrice` como string, categoria permitida.
- `sitemap.xml`: `urlset`, URLs HTTPS no host `miplacemagazine.com.br`, cada URL existindo no disco, home presente, duplicatas.
- `robots.txt`: diretiva `Sitemap` apontando para o sitemap correto, sem `Disallow: /`.

**Limitações:** não executa JavaScript, não valida CSS/contraste, não faz requisição HTTP, não testa formulário, service worker, layout real nem comportamento de navegador. Essas lacunas são a fase 2.

### Execução de 2026-11-07

```text
node scripts/test-site.js
Resumo: 18 ok | 4 falha(s) | 2 aviso(s)
Exit code: 1
```

Falhas: `privacidade.html`, `termos.html` e `acessibilidade.html` ausentes; bloco JSON-LD vazio em `index.html:87`. Avisos: `meta description` com 214 caracteres e nenhum link local de âncora para verificar (a home atual usa âncoras e links externos).

> O repositório está em transição para a versão corporativa; rerodar o validador após a integração de Afrodite/Mnemósine e tratar as falhas como gate.

## 4. Testes funcionais

| ID | Área | Caso | Prioridade | Evidência esperada |
|---|---|---|---|---|
| F-01 | Home | Todas as seções do briefing existem e as âncoras (`#inicio`, `#sobre`, `#negocios`, `#marcas`, `#presenca`, `#compromissos`, `#carreiras`, `#imprensa`, `#catalogo`, `#contato`) navegam | P0 | Playwright + screenshot |
| F-02 | Navegação | Menu desktop e mobile abrem/fecham; link ativo correto; skip link visível no foco | P0 | Playwright |
| F-03 | Catálogo | 27 produtos renderizam com nome, marca, imagem, preço e condições | P0 | Playwright + contagem |
| F-04 | Busca | Busca por nome e marca; limpar; contador; estado sem resultado | P0 | Playwright |
| F-05 | Filtros | Filtro por categoria/marca combina com busca e mantém URL/estado | P1 | Playwright |
| F-06 | Modal/lightbox | Abrir detalhes, galeria, fechar por botão/Escape/backdrop; foco retorna ao card | P0 | Playwright |
| F-07 | Wishlist | Adicionar/remover, contador, persistência após reload | P1 | Playwright |
| F-08 | i18n | PT/EN/ES troca textos, `lang`, `title`, `description`; persiste `miplace-locale`; fallback PT | P1 | Playwright |
| F-09 | Contato | Envio válido retorna sucesso e limpa formulário | P0 | Playwright + API staging |
| F-10 | Contato | Campos obrigatórios, e-mail, consentimento e honeypot bloqueiam envio | P0 | Playwright |
| F-11 | Contato | Falha da API mostra erro claro e oferece WhatsApp | P0 | Playwright route abort |
| F-12 | Legais | Privacidade, Termos e Acessibilidade abrem, têm conteúdo e link de volta | P0 | Playwright |
| F-13 | Rotas | URL inexistente retorna 404 customizada (ou redirect definido) sem quebrar layout | P1 | Playwright/HTTP |
| F-14 | PWA | Instalação, offline após primeiro load, `offline.html`, atualização do service worker | P1 | Playwright + DevTools |
| F-15 | Mídia | Player de música com controle; vídeo mudo; sem autoplay antes de gesto; `prefers-reduced-motion` desliga animações | P1 | Inspeção + Playwright |

## 5. Responsivo e matriz de dispositivos

| Viewport | Dispositivo de referência | O que validar |
|---|---|---|
| 360×800 | Android comum | Sem scroll horizontal; menu, cards, modal e formulário utilizáveis |
| 390×844 | iPhone 13/14 | Safe area, teclado virtual, alvos ≥44 px |
| 768×1024 | iPad retrato | Grid do catálogo, navegação, tabelas/legal |
| 1024×768 | iPad paisagem / notebook pequeno | Header, colunas, imagens sem corte |
| 1280×800 | Notebook | Container máximo, tipografia, seções escuras |
| 1440×900 | Desktop | Hero, wall de marcas, catálogo e footer |

**Navegadores mínimos:** Chrome e Edge estáveis, Firefox estável, Safari 17+ (macOS/iOS). PWA: Chrome Android e Safari iOS. Electron não faz parte deste site.

## 6. Acessibilidade AA

**Automatizado (fase 2):** axe-core em home e páginas legais; zero violações `critical`/`serious`; Lighthouse acessibilidade ≥95; contraste verificado nos tokens `paper/ink/accent/gold/forest`.

**Manual:**

- Teclado: todos os controles alcançáveis, ordem lógica, foco visível, sem armadilha; Escape fecha modal e devolve foco.
- Estrutura: um `h1`, hierarquia sem saltos, landmarks (`header`, `nav`, `main`, `footer`), skip link funcional.
- Formulário: labels explícitos, erros associados por `aria-describedby`, `aria-live` para sucesso/erro, consentimento claro.
- Imagens: `alt` descritivo para conteúdo, vazio + `aria-hidden` para decorativas.
- Movimento: `prefers-reduced-motion` respeitado; vídeo mudo em autoplay; música só após gesto.
- Alvos de toque ≥44×44 px e espaçamento adequado.

## 7. Performance

**Orçamentos para mobile (4G simulada, cache frio):**

| Métrica | Meta | Bloqueio |
|---|---|---|
| LCP | ≤2,5 s | >4,0 s |
| INP | ≤200 ms | >500 ms |
| CLS | ≤0,1 | >0,25 |
| Lighthouse Performance | ≥90 | <75 |
| Peso inicial JS | ≤350 KB gzip | >600 KB |
| Imagens abaixo da dobra | `loading="lazy"` + `width`/`height` | layout shift visível |

Testar home e uma página legal; verificar preload do hero, fonte, `fetchpriority`, cache do service worker e ausência do MP3 de 6,7 MB no carregamento inicial.

## 8. SEO

- Title e description únicos por página; canonical absoluto em todas.
- OG/Twitter completos; imagem absoluta e acessível.
- Um `h1` por página; `h2`/`h3` sem saltos.
- JSON-LD estático e parseável com `Organization` e `WebSite`; sem placeholder vazio.
- `sitemap.xml` com home e páginas legais; `robots.txt` com `Sitemap` correto e sem bloqueio.
- `hreflang` PT/EN/ES quando a camada i18n estiver publicada; `lang` coerente.
- 404 customizada, URLs limpas e sem conteúdo duplicado.

## 9. PWA

- `manifest` com nome, `short_name`, `start_url`, `display`, cores e ícones 192/512 existentes.
- Service worker registrado, cache versionado e `offline.html` servido quando offline.
- Instalável em Chrome Android e adicionável ao iOS; ícone e splash corretos.
- Atualização: novo SW assume sem prender o usuário em versão antiga; botão/aviso de atualização quando aplicável.
- HTTPS e headers de segurança coerentes com `vercel.json`.

## 10. Formulário de contato

- Payload: `{ name, email, phone, subject, message, consent, website }`; `website` é honeypot.
- Validação no cliente e no servidor; e-mail válido; consentimento obrigatório; mensagem com limite.
- Sucesso: feedback claro, `aria-live`, limpeza segura.
- Erro de rede/API: mensagem clara + fallback WhatsApp; sem perda do texto digitado.
- Segurança: sem segredo no cliente, sem PII em `localStorage`, sanitização/escape contra XSS, rate limit no endpoint.
- Nunca testar com e-mail/telefone reais de clientes; usar dados fictícios.

## 11. Checklist de release

- [ ] `npm run validate:products`
- [ ] `npm run test:snapshot`
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `node scripts/test-site.js --strict`
- [ ] Smoke manual das seções e páginas legais
- [ ] Catálogo: 27 produtos, busca, filtros, modal, lightbox e wishlist
- [ ] Formulário: sucesso, validação e fallback
- [ ] axe sem `critical`/`serious`; teclado e foco revisados
- [ ] Lighthouse mobile dentro do orçamento
- [ ] SEO: title/description/canonical/OG/JSON-LD/sitemap/robots
- [ ] PWA: offline, instalação e atualização
- [ ] 360, 768, 1024 e 1440 px sem scroll horizontal
- [ ] Console sem erro; rede sem 404 de assets
- [ ] Headers/CSP e HTTPS conferidos
- [ ] Plano de rollback definido (Vercel: deployment anterior)
- [ ] Evidências anexadas ao handoff

## 12. Critérios de bloqueio

**P0 — bloqueia release**

- Arquivo obrigatório ausente, link interno quebrado, produto/imagem inválida.
- `h1` ausente ou múltiplo, ID duplicado, imagem sem `alt`, JSON-LD inválido/vazio.
- Sitemap/robots incoerentes, canonical ausente ou host errado.
- Catálogo, busca, modal, wishlist ou formulário quebrados.
- PWA sem offline ou com service worker quebrando o site.
- Conteúdo secreto no cliente, mixed content ou falha de segurança crítica.
- Qualquer violação axe `critical`/`serious` ou armadilha de teclado.

**P1 — corrige antes do release ou exige aceite explícito**

- Layout quebrado em 360/768/1024/1440 px.
- i18n incompleta ou persistência quebrada.
- LCP >4 s, INP >500 ms ou CLS >0,25.
- Fallback do formulário ausente ou mensagem de erro confusa.
- Contraste abaixo de 4,5:1 em texto normal.

**P2 — pode ir para o próximo ciclo**

- Textos longos/curtos, `meta description` fora da faixa, avisos de SEO.
- Melhorias de microcopy, animação e organização de CSS.

**Saída:** zero P0, P1 corrigido ou aceite registrado por Zeus, todos os comandos verdes e evidência anexada.

## 13. Fase 2 — Playwright (planejada, não instalada)

- `@playwright/test` + `playwright.config.ts` com `baseURL`, 3 projetos (Chromium, Firefox, WebKit) e viewport mobile.
- Specs: `smoke.spec.ts`, `catalog.spec.ts`, `contact.spec.ts`, `a11y.spec.ts`, `pwa.spec.ts`, `legal.spec.ts`.
- Fixtures: produtos fictícios apenas para estados de erro; catálogo real para smoke.
- API: interceptar `/api/contact` com `route.fulfill` para sucesso, 400, 500 e timeout; um teste real em staging.
- Evidências: trace, screenshot e vídeo em falha; relatório HTML no CI.
- Gate: PR roda smoke + catálogo + formulário; nightly roda matriz completa + axe + Lighthouse.

## 14. Riscos e pendências atuais

1. **Páginas legais ausentes** — `privacidade.html`, `termos.html` e `acessibilidade.html` ainda não existem; bloqueiam release e SEO.
2. **JSON-LD vazio** — `index.html:87` tem `<script type="application/ld+json"></script>` sem conteúdo; falta `Organization`/`WebSite` estático.
3. **Sem teste de runtime** — o validador não executa JS; catálogo, formulário e PWA dependem da fase 2.
4. **Sitemap incompleto** — hoje só lista a home; incluir as páginas legais quando publicadas.
5. **Performance não medida** — o MP3 de 6,7 MB, Font Awesome, three.js e fontes externas precisam de orçamento e medição.
6. **i18n e camada corporativa ainda não integradas** — o HTML atual é o catálogo antigo; rerodar o gate após a integração.

## 15. Comandos de referência

```bash
node scripts/test-site.js
node scripts/test-site.js --strict
node scripts/validate-products.js
node scripts/test-snapshot.js
npm run lint
npm run typecheck
npm run build
```
