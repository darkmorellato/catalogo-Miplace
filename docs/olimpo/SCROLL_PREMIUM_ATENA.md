# Scroll Premium — Proposta de Arquitetura

> **Status:** proposta para decisão do Zeus/usuário; não altera produção.
> **Data:** 2026-11-07 · **Autora:** Atena (Tech Lead & Arquiteta)
> **Escopo:** substituir o mockup de celular 3D da seção `#experiencia` por uma direção de scroll mais premium.
> **Fontes:** `BRIEFING.md`, `DESIGN_SYSTEM.md`, `REQUISITOS.md`, `index.html:438-490`, `styles.css:2900-3232`, `modules/corporate.js:217-275`.
> **Restrições preservadas:** começar no topo, sem scroll-snap global, performance mobile, `prefers-reduced-motion`, acessibilidade, catálogo/contato/PWA intactos.

## 1. Diagnóstico do que existe

- A seção é um palco sticky de **300vh** com um celular 3D central e três slides (`.phone-scroll`, `styles.css:2903-2914`). O celular ocupa o centro da composição e reduz os produtos a screenshots pequenas; a leitura parece anúncio de aparelho, não marca corporativa.
- O scroll é calculado em JavaScript a cada frame: `getBoundingClientRect`, cinco custom properties e `classList` em três slides e três imagens (`corporate.js:240-264`). Funciona, mas é mais código e mais escrita de estilo do que o necessário.
- O design system aprovado diz “movimento discreto” e “3D/tilt restrito ao catálogo legado; novas seções corporativas não usam” (`DESIGN_SYSTEM.md:332-350`). O mockup 3D atual contraria essa regra.
- No mobile, a seção continua com 300vh e um palco sticky; o layout empilha, mas o custo de rolagem e a altura permanecem (`styles.css:3131-3185`). O `100vh` também é frágil no iOS; `100svh`/`100dvh` são mais previsíveis.
- O que deve ser preservado: `#experiencia`, `#phone-title`, as chaves `phone.*` do i18n, a copy dos três capítulos, o topo no carregamento (`app.js:8-22`) e a ausência de scroll-snap global.
- O que deve sair: moldura de celular, tilt/rotação 3D, brilho de dispositivo, prints de tela e a dependência de um único objeto central.

**Princípio:** a página deve ter **um** momento de scroll autoral — esta seção — e o resto continua discreto. Se tudo anima, nada é premium.

## 2. Critérios de decisão

| Critério | Peso | Por quê |
|---|---:|---|
| Marca “executiva, confiante, humana, sem hype” | Alto | O mockup atual comunica vitrine de aparelho; o alvo é grupo de tecnologia |
| Performance mobile | Alto | 300vh + imagens grandes + sticky podem travar em aparelho intermediário |
| Acessibilidade | Alto | Conteúdo não pode depender de scroll, hover ou opacidade para existir |
| Manutenção | Alto | Uma seção, não um novo framework; CSS/JS pequenos e testáveis |
| Suporte de navegadores | Médio | `animation-timeline` é Baseline 2026; fallback é obrigatório |
| Risco de regressão | Alto | Catálogo, contato, PWA e i18n não podem quebrar por CSS global |
| Dependência de imagens | Médio | Não há acervo lifestyle aprovado; produto em fundo branco limita direções cinematográficas |

## 3. Três direções

### Direção A — Capítulos Editoriais (sticky spread) — recomendada

**Conceito:** trocar o celular por uma dupla editorial. A coluna de texto contém os três capítulos em fluxo normal (01 Curadoria, 02 Acesso, 03 Proximidade); a coluna visual fica sticky e troca a imagem conforme o capítulo entra na zona de leitura. Fundo `--forest`, tipografia `--font-display`, réguas finas `--color-dark-border`, número de capítulo em `--gold`.

**Mecânica CSS/JS:**
- Grid de duas colunas; a coluna de imagem é `position: sticky; top: clamp(96px, 14vh, 140px); height: min(72svh, 680px)`.
- Cada capítulo tem `min-height: 70svh`; a seção não tem altura fixa de 300vh — a altura nasce do conteúdo.
- As imagens ficam empilhadas em `position: absolute`; a ativa recebe opacidade 1 e `scale(1)`, as outras opacidade 0 e `scale(1.03)`. Transição de 400–500 ms com `--ease-out`.
- O estado ativo é trocado por `IntersectionObserver` com `rootMargin: '-35% 0px -35% 0px'`; **não** há listener de scroll nem cálculo de progresso por frame.
- Sem `animation-timeline` obrigatório: `sticky` + `IntersectionObserver` funcionam amplamente; a direção não depende de Baseline 2026.
- Mobile: coluna visual vira um bloco estático antes da lista de capítulos (ou uma imagem por capítulo), `position: static`, altura automática; sem sticky e sem 300vh.
- Reduced motion: layout estático, todos os capítulos visíveis, primeira imagem fixa, sem transições.

**Prós:** mais alinhada ao tom executivo; texto e produto respiraram; excelente acessibilidade; menor risco; sem 3D; fácil de traduzir e testar.
**Contras:** menos “efeito” do que um trilho horizontal; exige boa direção de arte nas imagens (recorte, proporção, grão) para não parecer apenas duas colunas.

### Direção B — Trilho Horizontal (sticky horizontal gallery)

**Conceito:** um palco sticky com três painéis em trilho horizontal; o scroll vertical move o trilho para a esquerda. Cada painel tem número grande, título serifado, uma linha de texto e uma imagem full-bleed. É o efeito mais próximo de um “showreel” de scroll.

**Mecânica CSS/JS:**
- Seção com `height: 280svh`; palco `position: sticky; top: 0; height: 100svh; overflow: clip`.
- Trilho `display: flex; width: 300%`; cada painel `flex: 0 0 33.333%`. O movimento é `translate3d(calc(var(--exp-progress) * -66.666%), 0, 0)`.
- CSS-first com `view-timeline-name: --exp-rail` na seção e `animation-timeline: --exp-rail` no trilho; `@supports (animation-timeline: view())` isola a animação. Sem suporte, o layout cai para painéis empilhados (não para uma tela quebrada).
- Alternativa com JS: um único `requestAnimationFrame` atualiza `--exp-progress`; usar só se o suporte de CSS scroll-driven não for aceitável na matriz de navegadores.
- Mobile: desligar sticky/trilho; empilhar os três painéis em largura total, imagem 16:9, texto abaixo. Não usar scroll-snap global; se houver snap local, só dentro do trilho e com fallback.
- Reduced motion: painéis empilhados, sem transform.

**Prós:** alto impacto visual; cria um momento de marca; é o mais próximo da referência de “scroll effects” em CSS puro.
**Contras:** 280vh de rolagem; risco de jank no iOS; imagens grandes; texto pode ficar “fora da tela” para leitores de teclado; tom mais “agência/showreel” do que “grupo executivo”. Exige teste em dispositivo real.

### Direção C — Manifesto Tipográfico (kinetic type)

**Conceito:** sem imagens de produto no centro. Três atos tipográficos em tela cheia: “CURADORIA”, “ACESSO”, “PROXIMIDADE” entram por máscara de linha, com uma régua fina e um texto curto. O fundo alterna `--paper` e `--forest`. É o mais editorial e o mais leve.

**Mecânica CSS/JS:**
- Cada ato é um bloco de ~80svh; a seção não é sticky de 300vh.
- Linhas em `overflow: hidden`; o `span` interno começa em `translateY(110%)` e vai a `0` com `animation-timeline: view()` e `animation-range: entry 15% cover 55%`.
- Fallback: sem suporte, texto já visível e estático; `@supports` isola a animação.
- Mobile: tipografia `clamp()`, atos empilhados, sem sticky; reduced motion mostra tudo estático.
- Sem imagens obrigatórias; se houver, uma imagem pequena de detalhe por ato, não full-bleed.

**Prós:** melhor performance; nenhuma dependência de fotos; identidade autoral forte; acessibilidade e SEO simples (texto real).
**Contras:** pode parecer manifesto de agência, não experiência de produto; precisa de copy excelente; perde o “produto” como protagonista.

## 4. Comparação

| Critério | A — Capítulos Editoriais | B — Trilho Horizontal | C — Manifesto Tipográfico |
|---|---|---|---|
| Impacto visual | Alto, sofisticado | Muito alto, showreel | Alto, autoral |
| Complexidade | Baixa/média | Média/alta | Baixa |
| Mobile | Excelente | Exige fallback e teste iOS | Excelente |
| Acessibilidade | Alta | Média | Alta |
| Suporte de navegadores | Sticky + IO amplos | `animation-timeline` 2026 + fallback | `animation-timeline` 2026 + fallback |
| Risco de regressão | Baixo | Médio/alto | Baixo |
| Dependência de imagens | Média | Alta | Baixa |
| Manutenção | Baixa | Média | Baixa |
| Adequação ao tom “sem hype” | Alta | Média | Alta |
| Veredito | **Recomendada para v1** | Fase 2 / teste A/B | Plano B sem fotos |

`animation-timeline`/`view()` é Baseline 2026 segundo o [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline); por isso B e C exigem `@supports` e fallback estático. A não depende dessa API.

## 5. Recomendação

**A — Capítulos Editoriais.** É a única direção que combina o tom “executivo, confiante, humano, sem hype” com a regra de movimento discreto do design system, sem trocar um problema de mockup por um problema de 300vh e jank no iOS. Ela também preserva toda a copy e as chaves de i18n, então o custo de conteúdo é quase zero.

Se o usuário quiser mais movimento depois do A, a evolução natural é um **B-lite**: manter a coluna editorial e mover apenas um trilho de 3 imagens dentro do bloco sticky, com no máximo 180vh — nunca a seção inteira. C fica como plano B se não houver acervo de imagens aprovado; é a direção mais rápida de produzir e a mais segura em performance.

## 6. Mecânica recomendada (A)

### 6.1 HTML

```html
<section id="experiencia" class="exp-editorial" aria-labelledby="phone-title">
  <div class="corp-container exp-head">
    <p class="eyebrow" data-i18n="phone.eyebrow">A experiência Miplace</p>
    <h2 class="display display--on-dark" id="phone-title" data-i18n="phone.title">Tecnologia que se sente.</h2>
  </div>

  <div class="corp-container exp-grid">
    <div class="exp-copy">
      <article class="exp-chapter" data-exp-chapter="0">
        <span class="exp-index">01</span>
        <h3 data-i18n="phone.slide1.title">Curadoria</h3>
        <p data-i18n="phone.slide1.body">Selecionamos as marcas e os modelos que fazem sentido para o seu momento.</p>
      </article>
      <!-- capítulos 02 e 03 com os mesmos data-i18n atuais -->
    </div>

    <div class="exp-media" aria-hidden="true">
      <figure class="exp-frame is-active" data-exp-frame="0"><img src="..." alt="" loading="lazy" decoding="async"></figure>
      <figure class="exp-frame" data-exp-frame="1"><img src="..." alt="" loading="lazy" decoding="async"></figure>
      <figure class="exp-frame" data-exp-frame="2"><img src="..." alt="" loading="lazy" decoding="async"></figure>
      <span class="exp-counter">01 / 03</span>
    </div>
  </div>
</section>
```

### 6.2 CSS (núcleo)

```css
.exp-editorial { background: var(--forest); color: var(--paper); padding-block: var(--section); }
.exp-grid { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, .95fr); gap: clamp(24px, 5vw, 80px); align-items: start; }
.exp-media { position: sticky; top: clamp(96px, 14vh, 140px); height: min(72svh, 680px); overflow: clip; border: 1px solid var(--color-dark-border); }
.exp-frame { position: absolute; inset: 0; margin: 0; opacity: 0; transform: scale(1.03); transition: opacity 400ms var(--ease-out), transform 500ms var(--ease-out); }
.exp-frame.is-active { opacity: 1; transform: none; }
.exp-frame img { width: 100%; height: 100%; object-fit: cover; }
.exp-chapter { min-height: 70svh; display: flex; flex-direction: column; justify-content: center; border-top: 1px solid var(--color-dark-border); }
.exp-chapter h3 { font-family: var(--font-display); font-size: clamp(2rem, 4vw, 4rem); line-height: .95; letter-spacing: -.03em; }
.exp-chapter p { max-width: 42ch; color: var(--color-dark-muted); }
```

### 6.3 JS (30 linhas, sem listener de scroll)

```js
const section = document.getElementById('experiencia');
const chapters = section ? [...section.querySelectorAll('[data-exp-chapter]')] : [];
const frames = section ? [...section.querySelectorAll('[data-exp-frame]')] : [];

if (section && chapters.length) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('IntersectionObserver' in window)) {
    frames.forEach((frame, i) => frame.classList.toggle('is-active', i === 0));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Number(entry.target.dataset.expChapter);
        frames.forEach((frame, i) => frame.classList.toggle('is-active', i === index));
      });
    }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });
    chapters.forEach((chapter) => io.observe(chapter));
  }
}
```

### 6.4 Mobile e reduced motion

- `@media (max-width: 900px)`: `exp-grid` vira uma coluna; `exp-media` fica `position: static; height: auto`; cada capítulo tem sua imagem inline ou a mídia vira um bloco 16:9 antes da lista. Sem sticky, sem 300vh.
- `@media (prefers-reduced-motion: reduce)`: `exp-media` estática, `exp-frame` sem transição, todos os capítulos visíveis; o JS só fixa a primeira imagem.
- `100svh` em vez de `100vh`; `aspect-ratio` nas imagens; `loading="lazy"` e `decoding="async"`; `contain: layout paint` na mídia.

### 6.5 Integração

- Substituir o bloco `#experiencia` em `index.html:438-490`; manter `id="experiencia"`, `id="phone-title"` e todas as chaves `phone.*`.
- Em `modules/corporate.js`, substituir `initPhoneShowcase()` por `initExperienceChapters()`; remover o listener de scroll e as custom properties `--phone-*` antigas.
- Em `styles.css`, remover o bloco 2900-3232 depois da migração; não deixar CSS morto.
- Não criar módulo novo: a seção é comportamento de `corporate.js`; manter a ordem de scripts do `INTEGRACAO.md`.
- Atualizar `DESIGN_SYSTEM.md`/`BRIEFING.md` para “capítulos editoriais” quando o usuário aprovar; o texto da seção não muda.

## 7. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| CSS global afetar catálogo/contato/PWA | Escopar tudo em `#experiencia`; não alterar `body`, `html` ou utilitários globais; rodar `test-site.js` |
| Sticky não funcionar no iOS | Testar em iPhone real; fallback `position: static` em `@media (max-width: 900px)`; evitar `100vh` |
| Imagens grandes piorarem LCP/CLS | 3 imagens no máximo; `loading=lazy`; `aspect-ratio`; `decoding=async`; comprimir; primeira imagem sem prioridade alta |
| Movimento causar desconforto | `prefers-reduced-motion` estático; sem parallax no mobile; sem autoplay; sem scroll hijack |
| Conteúdo invisível para teclado/leitor | Texto sempre no fluxo normal; mídia decorativa com `aria-hidden`; não usar `opacity:0` em conteúdo focável |
| i18n quebrar com troca de DOM | Manter chaves e `data-i18n`; reaplicar `MiplaceI18n.apply()` após render; testar PT/EN/ES |
| Início não ser no topo | Não adicionar hash na URL; manter `forcePageTop()`; não usar `scrollIntoView`/autofocus no load |
| `animation-timeline` indisponível | A não depende disso; B/C usam `@supports` e fallback estático |
| Tom “showreel” | A como padrão; B só com aprovação explícita e no máximo 180vh no B-lite |

## 8. Critérios de aceite

- [ ] A página inicia no topo em reload, `pageshow` e navegação normal; não há auto-scroll para `#experiencia`.
- [ ] `#experiencia`, `#phone-title`, as chaves `phone.*` e os três capítulos continuam no HTML; PT/EN/ES sem chave crua.
- [ ] Nenhum `scroll-snap` global; roda do mouse e gesto touch rolam a página normalmente; sem sequestro de scroll.
- [ ] Desktop: a imagem ativa troca no capítulo correto; sem salto de layout; a seção termina e libera o fluxo.
- [ ] Mobile 360/390: layout empilhado, sem sticky que prenda a tela; sem overflow horizontal; texto não cortado.
- [ ] `prefers-reduced-motion`: tudo estático, todos os capítulos legíveis, primeira imagem fixa.
- [ ] Sem JS: todo o texto e a primeira imagem aparecem; a seção não fica em branco.
- [ ] Acessibilidade: ordem de leitura lógica, foco visível, contraste AA, mídia decorativa fora da árvore de acessibilidade; nenhum conteúdo focável escondido.
- [ ] Performance: Lighthouse mobile ≥85; LCP ≤2,5 s; CLS <0,1; sem long task >50 ms causada por scroll.
- [ ] Catálogo, contato, wishlist, modal, PWA e analytics inalterados; `npm run build`, `npm test` e `node scripts/test-site.js` verdes.
- [ ] Sem 3D, sem mockup de celular, sem autoplay, sem biblioteca nova.
- [ ] A seção é o único momento de scroll autoral; o resto da página mantém reveal discreto.

## 9. O que não fazer

- Não usar `scroll-snap-type` no `html`/`body` nem “prender” a página em uma seção.
- Não usar `scroll-behavior: smooth` global para compensar a animação.
- Não esconder conteúdo com `opacity: 0` sem `aria-hidden`/`inert`; texto não pode depender de scroll para existir.
- Não usar 3D, tilt ou parallax no mobile; o design system já restringe isso ao catálogo legado.
- Não colocar texto essencial dentro de imagem; não usar `background-image` para copy.
- Não criar 300vh no mobile; não usar `100vh` puro no iOS.
- Não adicionar Three.js, GSAP, Locomotive ou biblioteca de scroll; a stack é vanilla.
