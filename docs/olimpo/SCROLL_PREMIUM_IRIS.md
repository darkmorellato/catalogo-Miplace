# SCROLL PREMIUM — A EXPERIÊNCIA MIPLACE

> **Versão:** 1.0 · 2026-11-07
> **Owner:** Íris (UX/UI) · **Implementação:** Afrodite · **QA:** Argos
> **Escopo:** substituir o showcase de celular 3D da seção `#experiencia` por uma direção de scroll mais premium.
> **Restrições:** não editar produção nesta etapa; preservar catálogo, contato, PWA e contratos existentes.

---

## 1. Leitura do que existe hoje

- A seção `#experiencia` ocupa **300vh**, com `.phone-stage` sticky em `100vh`, três slides de copy e um celular cenográfico com notch, brilho e rotação 3D (`styles.css:2903-3233`; `index.html:439-488`).
- O controlador atual calcula o progresso do scroll e troca slides/imagens, além de mover o aparelho em `rotateY`, `rotateX` e `translateY` (`modules/corporate.js:218-275`).
- O efeito comunica “demo de produto”, não “grupo de tecnologia com padrão corporativo”. O celular falso, o notch, o glow e a rotação competem com a fotografia e com a tipografia.
- No mobile, a seção continua com 300vh e o palco sticky; a copy cai para 12px e o aparelho para ~150px (`styles.css:3131-3184`). É longa para o conteúdo que entrega.
- O fallback de `prefers-reduced-motion` existe e empilha os slides (`styles.css:3190-3233`), mas ainda depende de um dispositivo que o usuário rejeitou.
- O site já começa no topo por `forcePageTop()` e `history.scrollRestoration = 'manual'` (`app.js:11-28`). Isso deve ser preservado.
- A referência citada é o tutorial **“Efeitos de Scroll no seu Site com CSS Puro!”**, de Gustavo Campelo: o princípio útil é sticky + animação nativa de scroll, sem biblioteca. Não é uma referência de layout para copiar.

### O que o redesign precisa provar
1. **Sair do mockup** sem perder a narrativa de Curadoria, Acesso e Proximidade.
2. **Parecer editorial e corporativo**, não um carrossel de produto.
3. **Funcionar no mobile** com pouco peso e sem sequestrar o scroll.
4. **Ser acessível** e desligar completamente em `prefers-reduced-motion`.

---

## 2. Três direções de scroll

### Direção A — Capítulos editoriais (vertical sticky)

**Narrativa.** A seção vira três spreads de revista. Cada ato ocupa uma viewport: uma fotografia macro ou uma prancha tipográfica, um número de capítulo, um título em Playfair e uma frase. O usuário não “arrasta um celular”; ele atravessa uma sequência editorial.

**Direção de arte.**
- Fundo `--forest`; texto `--paper`; filete `--gold` de 1px; sem gradientes, sem glow, sem sombras.
- Capítulo 01: macro de acabamento (ex.: `motorola/edge70-1.webp`), título “Curadoria”.
- Capítulo 02: objeto único em fundo escuro (ex.: `honor/magic8lite-3.webp`), título “Acesso”, com o dado “24x” em tipografia grande.
- Capítulo 03: **prancha tipográfica** com as lojas reais de `stores.js` e as cidades; sem foto de loja, porque esse acervo está pendente. A pausa tipográfica dá ritmo e evita imagem inventada.
- Números de capítulo em Playfair, 01/02/03; copy em DM Sans 16–18px, no máximo 2–3 linhas.

**Ritmo.** 300vh no desktop (≈100vh por ato); 260–280vh se a copy for curta. A troca acontece em 1/3 e 2/3. Título entra em 520ms; imagem em 600ms; sem bounce.

**Mecânica.** `position: sticky` no palco; `--xp-progress` calculado por `requestAnimationFrame`; classes `is-active` nos capítulos; crossfade de imagens com `opacity` + `scale(1.03→1)`; nenhum `scroll-snap`, nenhum listener de wheel.

**Prós.** É a direção mais alinhada à alma editorial; funciona bem no mobile quando vira empilhado; usa imagens que já existem; performance previsível; acessibilidade simples.
**Contras.** Menos “uau” que uma tira horizontal; depende de uma boa curadoria de imagens e de hierarquia tipográfica forte.

---

### Direção B — Tira editorial (horizontal film strip)

**Narrativa.** O scroll vertical move uma tira horizontal de três quadros, como um contato fotográfico ou um filme editorial. Cada quadro é um capítulo; o último pode ser uma prancha tipográfica. O movimento horizontal é consequência do scroll vertical, não um carrossel com setas.

**Direção de arte.**
- Quadros de 100vw × 80vh, separados por 1px; alternância forest/paper; títulos grandes; contador e linha de progresso.
- Imagens full-bleed, com legendas pequenas; nada de molduras de celular.
- Um único filete dourado atravessa a base da tira, funcionando como “perfuração” do filme.

**Ritmo.** 300vh no desktop; a tira percorre 3 quadros (translateX de 0 a -200vw). A cada 33% um novo quadro se alinha; a copy entra depois da imagem, com 80ms de defasagem.

**Mecânica.** Palco sticky; track `display:flex; width:300vw`; `transform: translate3d(calc(var(--xp-progress) * -66.666%), 0, 0)`; sem `overflow-x` no body; sem arrastar com o mouse; no mobile, a tira vira coluna estática.

**Prós.** Mais cinematográfica e memorável; boa para “coleção” e para mostrar variedade de produtos; o movimento horizontal dá sensação de avanço.
**Contras.** Pode parecer carrossel; no mobile exige fallback; a ordem de leitura horizontal é menos natural; maior risco de jank e de motion sickness; implementação mais cara.

---

### Direção C — Estudo de objeto (macro crop)

**Narrativa.** O produto deixa de ser um aparelho em uma moldura e vira um objeto de museu. O scroll move um recorte macro sobre a fotografia — textura, câmera, acabamento — enquanto anotações tipográficas aparecem como etiquetas de exposição. É a direção mais silenciosa e mais contida.

**Direção de arte.**
- Uma imagem por ato, ou uma única imagem com três crops; fundo paper/forest; tipografia pequena e precisa; linhas de anotação de 1px; muito espaço vazio.
- Títulos em Playfair; legendas em DM Sans 12–14px; sem ícones de interface, sem notch, sem brilho.
- O objeto é sempre real: `motorola/edge70-1.webp` e `honor/magic8lite-3.webp` têm fundo escuro e recorte editorial; não usar cutout de catálogo em fundo branco como full-bleed.

**Ritmo.** 280–320vh; cada ato avança o crop em 6–10% e troca uma anotação; a transição é quase imperceptível, como uma câmera lenta.

**Mecânica.** Palco sticky; imagem com `transform: scale(1→1.12)` e `object-position`/`clip-path`; copy em crossfade; se usar `clip-path`, manter uma única camada para não custar pintura; reduced motion mostra os três crops estáticos.

**Prós.** É a mais premium e a que mais se afasta do “celular de vitrine”; excelente para marca; alta percepção de cuidado.
**Contras.** Depende de fotografia com resolução e enquadramento; pode parecer slideshow se os crops não forem realmente interessantes; comunica menos “Acesso/Proximidade” se não houver copy forte.

---

### Comparativo

| Critério | A. Capítulos | B. Tira | C. Estudo |
|---|---|---|---|
| Elimina o celular 3D | ✓ | ✓ | ✓ |
| Funciona sem pin no mobile | ✓ | — | ✓ |
| Movimento horizontal | — | ✓ | — |
| Usa apenas fotos existentes | ✓ | ✓ | ✓ |
| Risco de parecer carrossel | — | ✓ | — |
| Implementação simples | ✓ | — | ✓ |

---

## 3. Recomendação

**Direção A — Capítulos editoriais, com o tratamento de imagem da Direção C.**

É a que melhor resolve o problema sem trocar um exagero por outro:

- **Mantém a alma editorial** que o briefing pede, com Playfair, papel, forest e réguas finas.
- **Remove o celular falso** e o vocabulário de “demo de produto” (notch, glow, rotação).
- **Usa o que já existe**: duas fotos de produto com fundo escuro e uma prancha tipográfica com dados reais de lojas.
- **É robusta no mobile**: abaixo de 1024px, os capítulos empilham; não há pin, não há 300vh de scroll em tela pequena.
- **É acessível por construção**: todo o texto fica no DOM; a informação não depende do scroll.
- **Cabe no orçamento**: 2 fotos + 1 prancha tipográfica; WebP de referência ≈245 KB (31 + 22 + 192), sem biblioteca nova, sem 3D, sem filtros pesados.

**Não recomendo a Direção B** nesta entrega: o ganho cinematográfico não compensa o risco de parecer carrossel, o custo de implementação e o fallback mobile. A Direção C sozinha é bonita, mas depende de fotografia macro que ainda não foi produzida; usar A com enquadramento macro captura 80% do efeito com os assets atuais.

---

## 4. Mecânica da direção recomendada

### 4.1 Mapa narrativo

| Progresso | Ato | Imagem | Copy |
|---|---|---|---|
| 0–33% | 01 Curadoria | macro `motorola/edge70-1.webp` | “Selecionamos as marcas e os modelos que fazem sentido para o seu momento.” |
| 33–66% | 02 Acesso | `honor/magic8lite-3.webp` | “Até 24x no boleto, sem consulta, com condições claras.” |
| 66–100% | 03 Proximidade | prancha tipográfica com lojas reais | “Lojas em Piracicaba e Amparo, com um time que acompanha antes, durante e depois.” |

> **Antes de publicar:** alinhar a contagem de lojas. O briefing lista 5 lojas; `stores.js` e a copy atual têm 4. Não fixar “4” ou “5” no scroll; usar `STORES.length` ou uma frase sem número até Zeus decidir.

### 4.2 Estrutura sugerida

```html
<section id="experiencia" class="xp" aria-labelledby="xp-title">
  <div class="xp-stage">
    <header class="xp-head">
      <p class="eyebrow">A experiência Miplace</p>
      <h2 class="display" id="xp-title">Tecnologia que se sente.</h2>
    </header>

    <article class="xp-chapter is-active" data-xp-chapter="0">
      <figure class="xp-frame" aria-hidden="true">
        <img src="motorola/edge70-1.webp" alt="" loading="lazy" decoding="async">
      </figure>
      <div class="xp-text">
        <span class="xp-index">01</span>
        <h3>Curadoria</h3>
        <p>Selecionamos as marcas e os modelos que fazem sentido para o seu momento.</p>
      </div>
    </article>

    <article class="xp-chapter" data-xp-chapter="1">
      <figure class="xp-frame" aria-hidden="true">
        <img src="honor/magic8lite-3.webp" alt="" loading="lazy" decoding="async">
      </figure>
      <div class="xp-text">
        <span class="xp-index">02</span>
        <h3>Acesso</h3>
        <p>Até 24x no boleto, sem consulta, com condições claras.</p>
      </div>
    </article>

    <article class="xp-chapter xp-chapter--type" data-xp-chapter="2">
      <div class="xp-text">
        <span class="xp-index">03</span>
        <h3>Proximidade</h3>
        <p>Lojas em Piracicaba e Amparo, com um time que acompanha antes, durante e depois.</p>
        <!-- prancha tipográfica com as lojas reais de stores.js -->
      </div>
    </article>

    <div class="xp-rail" aria-hidden="true"><span></span></div>
    <p class="xp-count" aria-hidden="true"><strong>01</strong> / 03</p>
  </div>
</section>
```

- Manter `id="experiencia"` e o link da navegação.
- O texto dos três capítulos fica sempre no DOM e **não** recebe `aria-hidden`; só as imagens decorativas são ocultas.
- Contador e trilha são `aria-hidden`; a informação essencial está nos capítulos.

### 4.3 CSS

```css
.xp {
  --xp-progress: 0;
  position: relative;
  height: 300vh; /* fallback */
  height: 300svh;
  background: var(--forest);
  color: var(--paper);
  border-block: 1px solid var(--color-dark-border);
}

.xp-stage {
  position: sticky;
  top: 0;
  height: 100vh; /* fallback */
  height: 100svh;
  overflow: hidden;
  overflow: clip;
  contain: layout paint;
}

.xp-head {
  position: relative;
  z-index: 3;
  padding: var(--space-8) var(--gutter) 0;
}

.xp-chapter {
  position: absolute;
  inset: 0;
  opacity: 0;
  transform: translateY(18px);
  pointer-events: none;
  transition:
    opacity 520ms var(--ease-out),
    transform 520ms var(--ease-out);
}

.xp-chapter.is-active {
  opacity: 1;
  transform: none;
  pointer-events: auto;
}

.xp-frame {
  position: absolute;
  inset: 0;
}

.xp-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.03);
  transition: transform 1200ms var(--ease-out);
}

.xp-chapter.is-active .xp-frame img {
  transform: scale(1);
}

.xp-text {
  position: absolute;
  left: var(--gutter);
  bottom: var(--space-8);
  z-index: 2;
  max-width: 32rem;
  padding: var(--space-5) var(--space-6);
  background: var(--forest); /* faixa sólida, sem gradiente */
}

.xp-chapter--type .xp-text {
  top: 50%;
  bottom: auto;
  transform: translateY(-50%);
}

@media (max-width: 1023px) {
  .xp { height: auto; }
  .xp-stage { position: static; height: auto; }

  .xp-chapter {
    position: relative;
    inset: auto;
    opacity: 1;
    transform: none;
    pointer-events: auto;
    margin-bottom: var(--space-8);
  }

  .xp-frame { position: relative; height: 60svh; }

  .xp-text {
    position: relative;
    left: auto;
    bottom: auto;
    max-width: none;
    padding: var(--space-5) var(--gutter);
    background: var(--forest);
  }

  .xp-chapter--type .xp-text { top: auto; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .xp { height: auto; }
  .xp-stage { position: static; height: auto; }
  .xp-chapter { position: relative; inset: auto; opacity: 1; transform: none; }
  .xp-frame { position: relative; height: 60svh; }
  .xp-frame img { transform: none; transition: none; }
  .xp-text { position: relative; left: auto; bottom: auto; max-width: none; }
  .xp-chapter--type .xp-text { top: auto; }
}
```

Notas:
- `100svh` evita o salto da barra do navegador no mobile; manter fallback `100vh` para navegadores antigos.
- `overflow: clip` no palco evita scroll horizontal sem criar um novo contexto de rolagem.
- A animação usa apenas `opacity` e `transform`; não animar `top`, `height`, `filter` ou `box-shadow`.
- A trilha de progresso pode usar `transform: scaleX(var(--xp-progress))`, não `width`.

### 4.4 JS

```js
function initExperienceScroll() {
  const section = document.getElementById('experiencia');
  if (!section) return;

  const chapters = [...section.querySelectorAll('[data-xp-chapter]')];
  const rail = section.querySelector('.xp-rail span');
  const counter = section.querySelector('.xp-count strong');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce || !chapters.length) {
    section.classList.add('is-static');
    return;
  }

  let frame = 0;
  let near = false;

  const update = () => {
    frame = 0;
    const rect = section.getBoundingClientRect();
    const distance = Math.max(1, section.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / distance));
    const active = Math.min(chapters.length - 1, Math.floor(progress * chapters.length));

    section.style.setProperty('--xp-progress', String(progress));
    if (rail) rail.style.transform = `scaleX(${progress})`;
    if (counter) counter.textContent = String(active + 1).padStart(2, '0');

    chapters.forEach((el, i) => {
      el.classList.toggle('is-active', i === active);
      const image = el.querySelector('.xp-frame');
      if (image) image.classList.toggle('is-active', i === active);
    });
  };

  const requestUpdate = () => {
    if (frame) return;
    frame = requestAnimationFrame(update);
  };

  const io = new IntersectionObserver(([entry]) => {
    near = entry.isIntersecting;
    if (near) requestUpdate();
  }, { rootMargin: '50% 0px' });
  io.observe(section);

  addEventListener('scroll', () => { if (near) requestUpdate(); }, { passive: true });
  addEventListener('resize', () => { if (near) requestUpdate(); }, { passive: true });
  update();
}
```

- `requestAnimationFrame` + `passive: true`; nada de ler layout a cada evento sem agendamento.
- O `IntersectionObserver` evita trabalho quando a seção está longe.
- Em `prefers-reduced-motion`, o CSS já empilha; o JS nem é inicializado.
- Se o navegador suportar `animation-timeline: scroll()`, a trilha e o scale da imagem podem ser CSS puro; o JS continua sendo a fonte de verdade do capítulo ativo. Não é obrigatório.

### 4.5 Tipografia em movimento

- **Entrada do capítulo:** o título inteiro sobe 18px e aparece por `clip-path: inset(0 0 100% 0) → 0` em 520ms; nada de letra por letra.
- **Eyebrow e índice:** entram 60ms antes do título; o corpo, 60ms depois. A defasagem máxima é 180ms.
- **Números:** `font-variant-numeric: tabular-nums`; a troca 01→02→03 é um crossfade de 200ms, não um flip 3D.
- **Filete:** desenha da esquerda para a direita em 400ms; é o único “enfeite” em movimento.
- **Imagem:** escala de 1.03 para 1 durante o capítulo; sem parallax, sem rotação, sem blur.
- **Ritmo:** 3 capítulos, 3 respirações. Se houver um quarto, a seção vira apresentação de slides.

### 4.6 Mobile

- **Abaixo de 1024px:** sem pin, sem 300vh, sem 3D. Cada capítulo vira um bloco: imagem 60svh + copy; reveal único; `height: auto`.
- Se o time insistir em pin no mobile, o limite é **240vh**, imagem em 55% da tela e copy em faixa sólida; ainda assim, prefiro a versão estática.
- Testar 360×640, 390×844, 768×1024 e 1440×900; sem overflow horizontal; `100svh` para não cortar a barra do navegador.

---

## 5. Riscos e mitigação

| Risco | Como evitar |
|---|---|
| **Parecer um slideshow** | Máximo de 3 atos; uma imagem forte por ato; o terceiro ato é tipográfico; sem dots/setas. |
| **Sequestro de scroll** | Nenhum listener de `wheel`, nenhum `scroll-snap` global, nenhum `preventDefault`; o scroll nativo continua sendo o controle. |
| **Jank no mobile** | Sem pin abaixo de 1024px; ≤3 imagens (aqui, 2 fotos + 1 prancha); `opacity`/`transform`; sem `filter`, `backdrop-filter` ou 3D; `IntersectionObserver` + rAF. |
| **Conteúdo inacessível** | Todo o texto no DOM; não usar `aria-hidden` nos capítulos; contador/trilha decorativos; fallback estático. |
| **Fotografia fraca** | Usar `motorola/edge70-1.webp` e `honor/magic8lite-3.webp` (fundos escuros, boa leitura); são 1360×768, então limitar a 1280 ou usar crop, sem esticar em telas grandes; o terceiro ato é tipográfico. |
| **Contagem de lojas inconsistente** | Briefing: 5; `stores.js`: 4. Alinhar com Zeus e usar `STORES.length` ou copy sem número; não publicar número fixo. |
| **Choque com o catálogo** | Manter `#experiencia`, IDs, nav e scripts; substituir apenas `.phone-*`/`initPhoneShowcase`; catálogo, contato e PWA intocados. |
| **Peso/LCP** | Seção abaixo da dobra; imagens `loading="lazy"`, `decoding="async"`; total novo ≤350KB; sem preload das três. |
| **Motion sickness** | Escala ≤1.03; 600ms; sem parallax; `prefers-reduced-motion` desliga tudo; sem autoplay. |
| **Dependência de lib** | Não adicionar GSAP, Lenis, Locomotive ou Three.js para isso; CSS + ~40 linhas de JS resolvem. |

---

## 6. Critérios de aceite

### Direção de arte
- [ ] Nenhum `.phone-device`, notch, glow, borda de celular ou rotação 3D na seção.
- [ ] Três atos: Curadoria, Acesso, Proximidade; o terceiro pode ser prancha tipográfica.
- [ ] Playfair em títulos/números; DM Sans em copy; no máximo 3 níveis tipográficos.
- [ ] Forest + paper + um filete gold; sem gradiente, sombra pesada ou glassmorphism.
- [ ] Imagens reais existentes; nenhuma foto/logo inventado; sem banco de imagens.
- [ ] A seção continua parecendo uma página de revista quando o movimento é pausado.

### Comportamento
- [ ] Página inicia no topo; `forcePageTop` preservado.
- [ ] Sem `scroll-snap` global; sem `wheel`/`touchmove` interceptado.
- [ ] Desktop: 280–320vh, palco sticky, 3 capítulos; mobile <1024px: empilhado, altura automática.
- [ ] Troca de capítulo em 1/3 e 2/3; transição ≤600ms; sem flicker.
- [ ] Trilha e contador acompanham o progresso sem layout shift.
- [ ] Nenhum scroll horizontal no mobile; sem sobreposição com o header sticky.

### Performance
- [ ] ≤3 imagens novas; total ≤350KB; `lazy` + `async`.
- [ ] Apenas `opacity`/`transform`; sem `filter`/`backdrop-filter`/3D.
- [ ] 60fps no desktop; sem long tasks >50ms em emulação mobile.
- [ ] `prefers-reduced-motion` não inicializa o listener de scroll.

### Acessibilidade
- [ ] Todo o texto dos três capítulos no DOM e legível por leitor de tela.
- [ ] Um `h2` para a seção; `h3` por capítulo; hierarquia sem saltos.
- [ ] Contraste AA: paper/forest 10,99:1; copy sobre faixa sólida; nada de texto solto sobre área clara.
- [ ] Nenhuma informação essencial depende de scroll, hover ou movimento.
- [ ] Teclado não fica preso; foco visível; zoom 200% sem corte.
- [ ] Reduced motion: três blocos estáticos, sem sticky, sem transição.

### Preservação
- [ ] `#experiencia`, `#catalogo`, `#contato` e IDs do briefing intactos.
- [ ] `window.renderProducts`, `initCatalog`, modal, lightbox e wishlist intactos.
- [ ] i18n PT/EN/ES atualizado para as chaves da nova seção.
- [ ] `npm run build` e `npm test` passando; catálogo com 28 produtos.

---

## 7. Handoff para Afrodite

- **Substituir** o bloco `index.html:439-488` por `.xp-*`; manter `id="experiencia"`.
- **Substituir** `.phone-*` em `styles.css:2899-3233` por `.xp-*`; remover as variáveis de rotação/tilt/glow.
- **Substituir** `initPhoneShowcase()` por `initExperienceScroll()` em `modules/corporate.js:218-275` e no init (`474`).
- **Atualizar** `modules/i18n.js` se as chaves `phone.*` virarem `experience.*`; manter fallback PT e os três idiomas.
- **Não** adicionar bibliotecas; **não** tocar em `produtos.json`, catálogo, contato, PWA ou `vercel.json`.
- **Validar** em 360, 768, 1024 e 1440px; rodar `npm run build` e `npm test`; medir FPS e peso.
- **Esforço estimado:** M (1–2 dias) para a Direção A; G para a B; M para a C.

### O que faz parecer premium (e o que evitar)

**Faz parecer premium:** uma ideia por viewport; tipografia como imagem; muito espaço vazio; uma única cor de detalhe; crops intencionais; easing lento; ausência de chrome de interface; consistência entre fotografia, copy e ritmo.

**Evitar:** celular falso, notch, glow, rotação 3D, 10px de texto, mais de três capítulos, dots de carrossel, barras de progresso em toda parte, parallax em mobile, autoplay, letter-by-letter, bounce, blur pesado e “efeito” sem narrativa.
