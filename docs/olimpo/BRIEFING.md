# BRIEFING MESTRE — Miplace Group

> **Status:** aprovado por Zeus em 2026-11-07.
> **Objetivo:** transformar o catálogo Miplace Magazine em um website corporativo profissional de padrão multinacional, preservando o catálogo, os dados reais e a stack estática.
> **Prazo:** esta sessão. Entregar a primeira versão funcional e registrar pendências.

---

## 1. Contexto

- Projeto: `/home/dark/Desktop/codes/catalogo-Miplace-main/`
- Hoje: catálogo editorial de smartphones e tablets, vanilla JS + Tailwind v4 + PWA, hospedado na Vercel.
- Base real: 28 produtos, 9 marcas, 4 lojas em Piracicaba e Amparo (SP), parcelamento em até 24x no boleto sem consulta, 7 anos de mercado.
- O site atual é bem executado, mas comunica "revista de catálogo local". O alvo é comunicar **grupo de tecnologia com padrão global**, sem perder a alma local e sem quebrar o catálogo.

## 2. Posicionamento

- **Marca corporativa:** MIPLACE GROUP
- **Marca de varejo/catálogo:** Miplace (Miplace Magazine continua como assinatura editorial da coleção)
- **Tagline:** "Tecnologia global. Cuidado local."
- **Descritor:** "Grupo brasileiro de tecnologia e lifestyle que conecta pessoas às melhores marcas do mundo com curadoria, acesso facilitado e atendimento próximo."
- **Tom:** executivo, confiante, humano, sem hype. Frases curtas. Nada de "sinergia", "disrupção" ou superlativos vazios.
- **Idiomas:** PT-BR padrão; EN e ES na camada corporativa. Produtos permanecem em PT-BR nesta versão.

### 2.1 Fatos que podem ser usados

- 7 anos de mercado (dado do site atual).
- 4 lojas: Miplace XV Prime, Miplace Honor e Miplace Realme (Piracicaba); Miplace Premium (Amparo).
- 2 cidades: Piracicaba e Amparo, SP.
- 9 marcas: Apple/iPhone, Samsung, Motorola, Realme, Honor, Redmi, Poco, Infinix, Tecno.
- 28 produtos no catálogo (conferir no `produtos.json` na data da entrega).
- Parcelamento em até 24x no boleto, sem consulta.
- Acessórios e proteção Rockspace.
- Endereços, telefones, WhatsApp, Instagram e Facebook de `stores.js`.
- Domínio: `miplacemagazine.com.br`.

### 2.2 Proibido inventar

Não criar, em nenhum texto ou dado:

- escritórios, países, filiais ou operações internacionais inexistentes;
- nomes de executivos, fundadores, conselheiros ou funcionários;
- CNPJ, razão social, capital social, faturamento, número de funcionários, prêmios, certificações, auditorias ou prêmios de sustentabilidade;
- depoimentos, cases, clientes, matérias de imprensa ou citações;
- e-mails, telefones ou endereços novos;
- métricas de ESG, emissões, reciclagem ou impacto social;
- vagas de emprego abertas.

### 2.3 Como tratar lacunas

- Usar linguagem de **compromisso** ("estamos estruturando", "nosso compromisso é") em vez de resultado.
- Em JSON, usar `null` e `"status": "pendente"`.
- Registrar toda lacuna em `docs/olimpo/PENDENCIAS.md`.
- A camada "multinacional" é expressa por: marcas globais, experiência em 3 idiomas, governança, padrão de atendimento e ambição internacional declarada como ambição — não como operação existente.

### 2.4 Copy aprovada (ponto de partida)

**Utility bar:** `Miplace Group` · `Tecnologia global. Cuidado local.` · `Imprensa` · `Carreiras` · `PT / EN / ES`

**Navegação:** A Miplace · Negócios · Marcas · Coleção · Presença · Compromissos · Carreiras · Contato

**Hero**
- Eyebrow: `Grupo brasileiro • Curadoria global`
- H1: `Tecnologia global. Cuidado local.`
- Lead: `Conectamos pessoas à melhor tecnologia do mundo com curadoria especializada, acesso facilitado e um atendimento que só uma operação próxima pode oferecer.`
- CTA primária: `Conheça a Miplace`
- CTA secundária: `Explorar a coleção`
- Indicadores: `7 anos de história` · `4 lojas` · `9 marcas globais` · `24x no boleto`

**Manifesto**
- Eyebrow: `A Miplace`
- H2: `Uma empresa de tecnologia com alma de bairro.`
- Texto: `Nascemos no interior de São Paulo com uma convicção simples: acesso à alta tecnologia não deveria ser complicado. Hoje, reunimos as marcas mais desejadas do mundo em uma operação que combina curadoria, crédito acessível e atendimento humano.`
- Pilares:
  - `Curadoria` — `Selecionamos as marcas e os modelos que fazem sentido para cada perfil, sem ruído e sem excesso.`
  - `Acesso` — `Parcelamento em até 24x no boleto, sem consulta, para aproximar a alta tecnologia da vida real.`
  - `Proximidade` — `Quatro lojas, equipes especializadas e atendimento humano antes, durante e depois da compra.`

**Números:** 7 anos · 4 lojas · 9 marcas globais · 28 produtos · 24x no boleto · 2 cidades

**Negócios**
- H2: `Um grupo, várias formas de chegar até você.`
- `Varejo` — `Lojas físicas com consultoria especializada e as principais marcas do mercado.`
- `Crediário & Serviços` — `Parcelamento próprio em até 24x no boleto, sem consulta, e suporte pós-venda.`
- `Digital & Curadoria` — `Catálogo online, conteúdo editorial e atendimento por WhatsApp.`
- `Parcerias` — `Relações de longo prazo com fabricantes e distribuidores globais.`

**Marcas**
- H2: `As marcas que movem o mundo, na sua mão.`
- Texto: `Trabalhamos com as principais fabricantes globais de smartphones, tablets e acessórios.`
- Marcas: Apple · Samsung · Motorola · Realme · Honor · Redmi · Poco · Infinix · Tecno
- Nota: `Acessórios e proteção Rockspace.`

**Presença**
- H2: `Perto de você, com padrão global.`
- Texto: `Nossa operação está em Piracicaba e Amparo, no interior de São Paulo. Um time local, processos internacionais e uma experiência digital em português, inglês e espanhol.`
- Card de lojas existente.

**Compromissos**
- H2: `O próximo ciclo exige mais do que vender tecnologia.`
- `Acesso` — `Crédito transparente e condições claras para democratizar o acesso à tecnologia.`
- `Circularidade` — `Estruturar logística reversa e descarte responsável de eletrônicos.`
- `Pessoas` — `Formação contínua e oportunidades de carreira para o nosso time.`
- `Transparência` — `Comunicação clara sobre preços, prazos e condições.`
- Nota: `Compromissos em evolução. Estamos estruturando nossos indicadores e metas públicas.`

**Carreiras**
- H2: `O próximo capítulo começa com pessoas.`
- Texto: `Buscamos gente que gosta de tecnologia, de gente e de fazer acontecer. Se você quer construir uma empresa brasileira com ambição global, envie seu perfil.`
- CTA: `Banco de talentos`
- Valores: `Curadoria` · `Proximidade` · `Responsabilidade` · `Ambição global`

**Imprensa**
- H2: `Miplace para a imprensa.`
- Texto: `Materiais institucionais, dados da operação e agendamento de entrevistas. Fale com o nosso time de comunicação.`
- CTA: `Solicitar material`

**Contato**
- H2: `Vamos conversar.`
- Texto: `Atendimento consultivo, parcerias, imprensa ou carreiras. Escolha o assunto e nosso time responde.`

**Rodapé**
- `Miplace Group © 2026. Todos os direitos reservados.`
- `Marcas mencionadas pertencem aos seus respectivos proprietários.`
- Links: Privacidade · Termos · Acessibilidade · Contato · Carreiras · Imprensa.

## 3. Arquitetura de informação

Home única corporativa + páginas legais. Âncoras com IDs estáveis.

| Seção | ID | Conteúdo |
|---|---|---|
| Hero | `inicio` | headline, vídeo, CTAs, indicadores |
| Manifesto | `sobre` | posicionamento, 3 pilares, imagem |
| Números | `numeros` | faixa de indicadores |
| Negócios | `negocios` | 4 frentes |
| Marcas | `marcas` | parede tipográfica das 9 marcas |
| Presença | `presenca` | 4 lojas reais + mapa/links |
| Compromissos | `compromissos` | 4 compromissos ESG |
| Carreiras | `carreiras` | proposta + CTA banco de talentos |
| Imprensa | `imprensa` | central de imprensa + CTA |
| Coleção | `catalogo` | catálogo existente completo |
| Contato | `contato` | formulário + WhatsApp + lojas |
| Rodapé | — | navegação corporativa + legal |

Páginas secundárias: `privacidade.html`, `termos.html`, `acessibilidade.html`.
Redirecionamentos/links: `imprensa` e `carreiras` podem apontar para as seções da home nesta versão.

## 4. Design system

### 4.1 Tokens

```css
--paper: #f5f2ea;
--paper-2: #ebe7dd;
--ink: #141414;
--ink-2: #4a4641;
--ink-3: #79736b;
--accent: #8c1d1d;       /* oxblood — herança editorial */
--gold: #b9965a;         /* champagne — detalhe premium */
--forest: #173b32;       /* verde profundo — seções corporativas */
--line: rgba(20, 20, 20, 0.14);
--line-strong: rgba(20, 20, 20, 0.32);
--font-display: "Playfair Display", Georgia, serif;
--font-sans: "DM Sans", system-ui, sans-serif;
--max: 1280px;
--gutter: clamp(20px, 4vw, 48px);
--section: clamp(72px, 10vw, 140px);
--radius: 2px;
```

### 4.2 Direção visual

- Editorial corporativo: papel quente, tinta quase preta, oxblood e champagne.
- Tipografia grande, hierarchia clara, muito respiro, réguas finas.
- Seções escuras em `--forest` para contraste (Números ou Compromissos).
- Remover a moldura de 12px nas laterais do body; usar container máximo.
- Manter grão de papel sutil, sem exagero.
- Ícones: preferir SVG inline; Font Awesome pode permanecer onde já é usado no catálogo.
- Nada de dark mode automático; o site é light-only, com seções escuras intencionais.
- Música de fundo opcional, com controle visível e volume baixo; só começa após interação do usuário.
- Microinterações discretas: reveal, contadores, hover de 200–400ms. Respeitar `prefers-reduced-motion`.

### 4.3 Componentes

- `eyebrow` — caixa alta, 10–12px, tracking largo.
- `display` — Playfair, 48–96px, line-height 0.95–1.05.
- `lead` — 18–22px, max 60ch.
- `rule` — linha de 1px.
- `btn-primary` — fundo ink, texto paper.
- `btn-ghost` — borda 1px, fundo transparente.
- `stat` — número grande + label.
- `card` — superfície paper, borda 1px, hover sutil.
- `brand-tile` — tipografia, sem logos não licenciados.
- `section-head` — eyebrow + título + lead + link.
- `dark-section` — forest + paper.
- `store-card` — dados reais de `stores.js`.

### 4.4 Acessibilidade

- WCAG 2.2 AA: contraste, foco visível, alvos de 44px, labels, `aria-*` corretos.
- Um único `h1` por página. Hierarquia de headings sem saltos.
- Skip link, navegação por teclado, focus trap nos modais existentes.
- `prefers-reduced-motion` desliga animações.
- Formulário com labels explícitos, mensagens de erro associadas e `aria-live`.

## 5. i18n

- Implementar `modules/i18n.js` com dicionários `pt`, `en`, `es`.
- Atributos `data-i18n` para texto e `data-i18n-attr` para `placeholder`, `aria-label` e `title`.
- Idioma inicial: `pt-BR`; persistir em `localStorage` (`miplace-locale`).
- Atualizar `<html lang>`, `<title>` e meta description ao trocar.
- Fallback para PT em chaves ausentes.
- Não traduzir nomes de produtos, endereços e dados de `produtos.json` nesta versão.
- Seletor no header e no footer: `PT · EN · ES`, com `aria-pressed`.

## 6. Stack e restrições técnicas

- Manter **vanilla JS + Tailwind v4 + PWA + Vercel**. Não migrar para React/Next nesta entrega.
- `produtos.json` é a fonte canônica; não alterar dados de produto.
- `stores.js` é a fonte canônica de lojas; pode ganhar campos, não perder.
- Preservar IDs e contratos usados pelos módulos:
  - `#category-filters`, `#search-input`, `#search-clear`, `#search-icon`, `#search-count`, `#products-grid`
  - `#stores-grid`, `#contato-dropdown-content`, `#contato-menu`, `#hamburger-btn`, `#mobile-menu`
  - `#lightbox`, `#product-modal`, `#modal-content`, `#modal-container`
  - `#wishlist-fab`, `#wishlist-drawer`, `#wishlist-drawer-content`, `#wishlist-drawer-overlay`
  - `#back-to-top`, `#scroll-progress`, `#page-fade`
- Preservar `window.renderFilters`, `window.renderProducts`, `window.initCatalog`, `window.initModal`, `window.initSearch`, `window.renderStoreCards`, `window.renderContactDropdown`, `window.MiplaceWishlist`.
- Não remover o catálogo, a busca, os filtros, o modal, o lightbox ou a wishlist.
- O formulário de contato faz `POST /api/contact` com JSON:
  `{ name, email, phone, subject, message, consent, website }` (`website` é honeypot).
- Se a API falhar, oferecer fallback por WhatsApp e mensagem clara.
- Não usar `localStorage` para dados pessoais sensíveis.
- Performance: lazy-load abaixo da dobra, `preload` apenas do crítico, música só após gesto, sem bibliotecas novas pesadas.
- SEO: title/description/OG/Twitter, canonical, JSON-LD `Organization` + `WebSite`, sitemap atualizado, `hreflang` para PT/EN/ES quando viável.
- Segurança: sem segredos no cliente; CSP e headers em `vercel.json`; formulário com validação e honeypot.

## 7. Propriedade de arquivos (evitar conflito)

| Agente | Pode criar/editar | Não editar |
|---|---|---|
| **Afrodite** | `index.html`, `styles.css`, `src/input.css`, `app.js`, `stores.js` (preservando todos os dados), `modules/catalog.js`, `modules/ui.js`, `modules/modal.js`, `modules/wishlist.js`, `modules/three-hero.js` (pode desativar se conflitar), novos `modules/i18n.js` e `modules/corporate.js` | `produtos.json`, `vercel.json`, `sw.js`, `api/`, `content/`, `docs/`, `README.md` |
| **Íris** | `docs/olimpo/DESIGN_SYSTEM.md`, `design/tokens.css` | arquivos de produção |
| **Hera** | `docs/olimpo/PLANO_PROJETO.md` | código |
| **Apolo** | `docs/olimpo/REQUISITOS.md` | código |
| **Atena** | `docs/olimpo/ARQUITETURA.md` | código |
| **Hefesto** | `api/contact.js`, `docs/olimpo/API_CONTATO.md` | `index.html` |
| **Daedalus** | `sw.js`, `offline.html`, `favicon_io/site.webmanifest`, `docs/olimpo/PWA_MOBILE.md` | `index.html` |
| **Hades** | `content/company.json`, `content/schema/company.schema.json`, `docs/olimpo/DADOS.md` | `produtos.json` |
| **Deméter** | `modules/analytics.js`, `docs/olimpo/ANALYTICS.md` | `index.html` |
| **Ártemis** | `vercel.json`, `docs/olimpo/SEGURANCA.md` | `index.html` |
| **Hermes** | `.github/workflows/ci.yml`, `docs/olimpo/DEVOPS.md` | código de produção |
| **Atlas** | `docs/olimpo/INFRA.md` | código |
| **Argos** | `scripts/test-site.js`, `docs/olimpo/QA.md` | código de produção |
| **Mnemósine** | `README.md`, `CHANGELOG.md`, `docs/olimpo/DOCS.md`, `privacidade.html`, `termos.html`, `acessibilidade.html` | `index.html` |
| **Hécate** | `modules/concierge.js`, `content/concierge-faq.json`, `docs/olimpo/IA.md` | `index.html` |

> Módulos novos (`i18n`, `corporate`, `analytics`, `concierge`) serão plugados no `index.html` na integração final. Quem criar um módulo entrega o snippet de `<script>` na resposta e não edita o HTML.

## 8. Definition of Done

- [ ] Home corporativa implementada com todas as seções e copy aprovada.
- [ ] Catálogo, busca, filtros, modal, lightbox e wishlist funcionando.
- [ ] PT/EN/ES na camada corporativa.
- [ ] Responsivo em 360, 768, 1024 e 1440px.
- [ ] `npm run build` e `npm test` passando.
- [ ] Formulário de contato com validação e fallback.
- [ ] Páginas legais publicadas.
- [ ] SEO básico (title, description, OG, JSON-LD, sitemap).
- [ ] Acessibilidade AA verificada.
- [ ] Documentação e pendências registradas.

## 9. Handoff

Ao concluir, responder a Zeus com:

1. Status: concluído / parcial / bloqueado.
2. Arquivos criados ou alterados (caminhos absolutos).
3. Evidência de teste (comando + resultado).
4. Pendências ou riscos.
5. Snippet de integração, se houver módulo novo.

Não responder apenas "ok". Sem artefato, não há entrega.
