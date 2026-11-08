# SCROLL GLOBAL — MIPLACE GROUP

> **Versão:** 1.0 · 2026-11-07
> **Owner:** Íris (UX/UI) · **Implementação:** Afrodite · **QA:** Argos
> **Objetivo:** adaptar a linguagem cinematográfica da referência para o site inteiro, sem copiar o showreel e sem perder a alma editorial.
> **Escopo:** proposta e mecânica. Nenhum arquivo de produção foi editado.

---

## 1. Leitura da referência e do projeto

### 1.1 O que a referência faz
O vídeo de 27,8s mostra fundo escuro, tipografia branca gigante, um poliedro facetado sticky e palavras que entram/saem com o scroll: “Scroll Effects”, “Com CSS puro”, “WEB DESIGN”, “WORDPRESS”, “PROGRAMAÇÃO”, “Siga para mais”. A força está em três coisas: **uma ideia por tela**, **contraste tipográfico extremo** e **um objeto que ancora a narrativa**. O risco é virar demo de efeitos.

### 1.2 O que o Miplace já tem
- Identidade paper/ink/forest/oxblood, Playfair + DM Sans, réguas finas e grids editoriais.
- Hero com vídeo, título que entra por palavras e zoom de mídia por `animation-timeline: view()` (`styles.css:1207-1344`; `styles.css:2692-2832`).
- Manifesto com capítulos sticky aprovados, mídia sticky e troca de frames (`index.html:401-441`; `styles.css:2905-3083`; `modules/corporate.js:199-227`). **Não mexer nessa estrutura.**
- Números em faixa forest, contadores one-shot; marcas em grade tipográfica; compromissos em acordeão; catálogo e contato funcionais.
- Início sempre no topo (`app.js:11-28`), sem `scroll-snap` global.

### 1.3 O que preservar e o que evitar
**Preservar:** editorial, contraste, tipografia grande, uma ideia por seção, o Manifesto sticky, o catálogo, o contato e a PWA.
**Evitar:** celular mockup, objeto metálico genérico, fundo preto puro, palavras girando sem narrativa, scroll sequestrado, pin em todas as seções, 3D em card de produto.

> **Decisão de escopo:** não recriar a antiga seção `#experiencia`. O Manifesto é o único bloco com pin longo; o resto do site recebe uma **camada de scroll leve**, não uma sequência de telas cheias.

---

## 2. Gramática site-wide

Quatro regras valem para todas as seções:

1. **A tipografia é a protagonista.** Títulos entram por máscara de linha, com deslocamento curto; nada de letra por letra.
2. **O objeto é pontuação, não narrador.** Um prisma facetado aparece no máximo em dois pontos; o resto é tipo, foto e régua.
3. **O conteúdo não desaparece ao subir.** Textos e cards aparecem uma vez e permanecem legíveis; só as camadas decorativas (linhas, índices, objeto, palavras de fundo) são reversíveis.
4. **Uma intenção por viewport.** Se o título, a imagem, o objeto e a régua se movem ao mesmo tempo, o efeito já é showreel.

### 2.1 Partitura de scroll

| Seção | Efeito principal | Reversível? | Objeto? |
|---|---|---|---|
| Hero | linhas do título sobem/descem; mídia escala 1→1.035; prisma pequeno gira 0–18° | sim | sim, pequeno |
| Manifesto | 3 capítulos sticky já aprovados; crossfade de imagem; linha de progresso | sim | não |
| Números | régua desenha; números entram por máscara; contador uma vez | linha sim; contador não | não |
| Negócios | cards entram em stagger; índice e linha deslocam 4–8 px | linha/índice sim | não |
| Marcas | 3 fileiras de tiles derivam ±10 px; hover/focus pausa | sim | não |
| Presença | índice de cidade sticky; cards entram; régua vertical desenha | sim | não |
| Compromissos | título por máscara; prisma watermark gira no canto; acordeão intacto | sim | sim, watermark |
| Carreiras | título e sublinhado do CTA desenham | sim | não |
| Imprensa | título e linha desenham; seta avança 4 px | sim | não |
| Catálogo | apenas cabeçalho/régua; grid de produtos intocado | cabeçalho sim | não |
| Contato | apenas cabeçalho/régua; formulário sem animação | sim | não |
| Rodapé | wordmark entra por clip/translate; linha final desenha | sim | não |

---

## 3. Três direções de adaptação

### Direção A — Continuum editorial (type-led)

**Narrativa.** O site vira uma revista em movimento: cada seção é uma página que se ajusta ao scroll, com títulos mascarados, réguas que desenham e imagens que respiram. Não há objeto 3D; o “efeito” é a composição tipográfica reagindo à posição.

**Direção de arte.**
- Paper/ink como base; forest nos dois intervalos escuros; oxblood só em ênfase e índices ativos.
- Títulos em Playfair com `translateY` de 0,25em e `clip-path` de linha; corpo permanece estável.
- Régua de 1 px desenha da esquerda para a direita; numeral de seção desloca 4–8 px.
- Imagens entram por máscara, com escala máxima 1.03; nada de parallax agressivo.

**Mecânica.** `--p` por seção + CSS; `IntersectionObserver` apenas para ativar/desativar o cálculo; `requestAnimationFrame` para o fallback. Conteúdo com reveal one-shot; camadas decorativas com `--p` reversível.

**Prós.** É a mais fiel à alma editorial; a mais barata; funciona no catálogo e no mobile; não cansa.
**Contras.** Menos “uau” que a referência; exige excelência de tipografia e ritmo, não de efeito.

---

### Direção B — Prisma Miplace (objeto como narrador)

**Narrativa.** Um prisma facetado de “papel” atravessa a página: começa pequeno no hero, desaparece no Manifesto e reaparece como watermark nos Compromissos. Ele gira e muda de face conforme o scroll, mas nunca assume o centro da tela nem cobre texto. É uma assinatura material, não um brinquedo 3D.

**Direção de arte.**
- Octaedro de 8 faces ou poliedro simples, com faces paper/ink/oxblood/forest e arestas de 1 px; sem chrome, sem neon, sem bloom.
- Tamanho: 160–220 px no hero; 280–360 px como watermark em Compromissos, com opacidade 0.18–0.28.
- Rotação máxima de 25° por eixo; escala 0.95–1.05; nunca gira rápido.
- Em reduced motion: SVG estático; em mobile: versão pequena ou nenhuma.

**Mecânica.** CSS 3D (`transform-style: preserve-3d`; faces com `clip-path`) alimentado por `--p`; fallback SVG. Three.js só se o time exigir um poliedro mais complexo, carregado em idle e desligado no mobile — **não recomendo** para um único motivo.

**Prós.** Dialoga com a referência; dá um fio visual ao site; pode render ótimos stills.
**Contras.** Alto risco de parecer showreel; se o objeto for metálico/genérico, quebra a identidade; custo de 3D e de acessibilidade.

---

### Direção C — Índice cinético (grid/editorial)

**Narrativa.** O site é um índice corporativo em movimento: números de seção, fileiras horizontais de palavras, réguas e blocos de imagem deslizam em ritmos diferentes. O objeto 3D não existe; no máximo, um selo facetado plano aparece como marca de seção. É a adaptação mais “relatório anual” e menos “portfolio de designer”.

**Direção de arte.**
- Numeração 01–09 grande no canto; títulos em faixas; marcas em três fileiras que deslizam em direções alternadas.
- Muito paper, muito ink, poucos acentos; imagens em janelas recortadas.
- O movimento é horizontal e contido; nada de pin longo fora do Manifesto.

**Mecânica.** `--p` + `translate3d` em fileiras; `clip-path` em títulos; `IntersectionObserver` para ativar; sem 3D.

**Prós.** Muito corporativo; escala bem; ótimo para números, marcas e presença; quase zero risco de showreel.
**Contras.** Menos emocional; pode parecer rígido; não entrega o “objeto” que a referência sugere.

### Comparativo

| Critério | A. Continuum | B. Prisma | C. Índice |
|---|---|---|---|
| Objeto 3D em cena | — | ✓ | — |
| Tipografia cinética | ✓ | ✓ | ✓ |
| Preserva a alma editorial | ✓ | ✓ | ✓ |
| Risco de showreel | — | ✓ | — |
| Funciona no catálogo | ✓ | — | ✓ |
| Custo/performance baixo | ✓ | — | ✓ |

---

## 4. Recomendação

**Direção A como base, com a Direção B em dois pontos de pontuação: Hero e Compromissos.**

- **O site inteiro** ganha a gramática tipográfica de A: títulos mascarados, réguas que desenham, índices que deslizam, imagens que respiram.
- **O prisma** entra só no Hero (pequeno, ao lado da mídia) e em Compromissos (watermark no canto vazio). No Manifesto, nos Números, nas Marcas, no Catálogo e no Rodapé, ele não aparece.
- **Não usar Three.js.** Um octaedro CSS de 8 faces resolve o motivo; se não ficar bom, usar um SVG facetado com rotação 2.5D. Three.js adiciona peso e draw calls para um objeto que deve ser discreto.
- **Não usar o prisma como celular.** Ele é abstrato, de papel, e nunca substitui produto ou foto.
- **O Manifesto permanece exatamente como está**: capítulos sticky, mídia sticky, três frames. Apenas ganha a linha de progresso e um leve ajuste de máscara no título, se necessário.

**Por que essa combinação:** a referência tem um objeto forte, mas o Miplace não é um estúdio de motion. A alma editorial está no papel, na tinta e na tipografia. O prisma é a citação; a tipografia é a voz.

---

## 5. Onde aplicar, seção por seção

### Hero
- Título: linhas entram por máscara; no scroll, deslocamento máximo de 18 px; ao subir, volta.
- Mídia: manter o zoom `animation-timeline` e o `heroDrift` existentes; não somar um terceiro parallax. Pausar fora da viewport e em reduced motion.
- Prisma: 160–220 px, 35% à direita da mídia, faces paper/ink; rotação 0–18°; `aria-hidden`.
- Métricas: entrada defasada em 60 ms; sem contador no hero.
- Prioridade do hero: **título + prisma**; o vídeo é ambiente, não mais um efeito concorrente.

### Manifesto
- Preservar o sticky de 3 capítulos; não adicionar segundo pin.
- Linha de progresso de 1 px na base da mídia; `scaleX(var(--p))`.
- Frames com crossfade 500 ms e escala 1.03→1; active por `IntersectionObserver` (já existe).
- Título do capítulo ativo: `clip-path` de linha, 400 ms; ao subir, o capítulo anterior volta naturalmente.
- Sem objeto.

### Números
- Régua superior desenha com `--p`; números entram por máscara de linha.
- Contadores: uma vez, ao entrar; não reiniciam ao subir (evita ansiedade e leitura repetida).
- Sem prisma; os números são o “objeto” desta faixa.

### Negócios
- Cards: stagger de 70 ms, uma vez; `translateY(18px)→0`.
- Linha horizontal e índice 01–04: deslocamento de 4–8 px com `--p`; reversível.
- Ícones: sem rotação; hover só no card.

### Marcas
- Três fileiras de tiles: `translateX` alternado de ±10 px conforme `--p`; pausa em hover/focus.
- Tiles continuam botões; foco visível; nada de movimento no texto individual.
- Em mobile: sem drift; grade estática.

### Presença
- Cabeçalho e cards: reveal one-shot.
- Índice “Piracicaba / Amparo” pode ser sticky dentro da seção, mas sem pin de viewport inteiro.
- Régua vertical desenha; sem prisma.
- Dados somente de `stores.js`; sem horários/fotos inventados.

### Compromissos
- Título e nota entram por máscara; acordeão intocado.
- Prisma watermark no canto direito, 280–360 px, opacidade 0.18–0.28, rotação 0–20°; nunca atrás do texto do acordeão.
- Em mobile/reduced motion: sem prisma; manter apenas a faixa forest.

### Carreiras e Imprensa
- Título por máscara; sublinhado do CTA desenha; seta avança 4 px.
- Sem pin, sem objeto; são respiros entre blocos densos.

### Catálogo
- **Não aplicar scroll effect nos cards de produto.** O grid é operacional: busca, filtro, modal, lightbox e wishlist precisam de estabilidade.
- Aplicar apenas no cabeçalho, na régua e no bloco de acessórios; reveal one-shot.
- Se o grid já tiver reveal, manter; não adicionar `--p` por card.

### Contato
- Cabeçalho e régua; formulário sem animação de scroll.
- Foco e `aria-live` intactos; nada de mover labels.

### Rodapé
- Wordmark “MIPLACE” entra por clip/translate; linha final desenha; sem objeto.
- Em mobile, wordmark estático para não competir com links.

---

## 6. Mecânica CSS/JS

### 6.1 Motor único, reversível

Um único motor calcula `--p` (0–1) para cada seção registrada. O valor sobe ao descer e desce ao subir; nada de `forwards` ou classe que só liga.

```js
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const sections = [...document.querySelectorAll('[data-scroll]')];
let raf = 0;

function update() {
  raf = 0;
  const vh = window.innerHeight;
  for (const el of sections) {
    const r = el.getBoundingClientRect();
    const mode = el.dataset.scroll;
    let p;

    if (mode === 'pin') {
      const total = Math.max(1, r.height - vh);
      p = clamp(-r.top / total, 0, 1);
    } else if (mode === 'hero') {
      p = clamp(1 - r.top / vh, 0, 1); // começa em 1 no topo
    } else {
      const total = Math.max(1, vh + r.height);
      p = clamp((vh - r.top) / total, 0, 1);
    }

    el.style.setProperty('--p', p.toFixed(4));
  }
}

addEventListener('scroll', () => {
  if (!raf) raf = requestAnimationFrame(update);
}, { passive: true });
addEventListener('resize', update, { passive: true });
update();
```

- `data-scroll="pin"` no Manifesto; `data-scroll="hero"` no Hero; `data-scroll="cover"` nas demais. O hero começa em `p=1` para o título já nascer no lugar.
- `IntersectionObserver` adiciona `.is-near` para limitar o cálculo às seções próximas; o motor não lê layout de 10 seções por frame.
- `document.visibilityState` pausa o loop; sem listeners por seção.
- Não usar `scroll` para mudar layout; só custom properties.

### 6.2 Tipografia cinética

```css
[data-scroll] .kinetic-title {
  transform: translate3d(0, calc((1 - var(--p)) * 18px), 0);
  opacity: clamp(0.35, calc(var(--p) * 2.2), 1);
  transition: none;
}

[data-scroll] .kinetic-rule {
  transform: scaleX(clamp(0, var(--p), 1));
  transform-origin: left center;
}
```

- `clip-path` de linha pode substituir a opacidade no primeiro terço, mas **nunca** deixe o título ilegível por completo.
- Sem `letter-spacing` animado: causa reflow e muda a largura do texto.
- `text-wrap: balance` nos títulos; `font-variant-numeric: tabular-nums` nos números.
- Títulos longos: no máximo 2 linhas; se quebrar, reduza o tamanho antes de animar.

### 6.3 Objeto facetado

**Decisão:** CSS 3D, sem Three.js.

- Octaedro de 8 faces; cada face é um triângulo com `clip-path`; faces paper/ink/oxblood/forest; arestas de 1 px.
- `transform: rotateX(calc(var(--p) * 18deg)) rotateY(calc(var(--p) * 24deg))`
- `transform-style: preserve-3d`; `will-change: transform` só enquanto `.is-near`.
- `aria-hidden="true"` e `pointer-events: none`.
- Fallback: SVG facetado estático quando `prefers-reduced-motion` ou `< 768px`.
- Se o time quiser um poliedro de 20 faces com iluminação real: Three.js lazy, DPR ≤1.5, render só quando visível. **Não é necessário** para o efeito.

### 6.4 Descida e subida

| Camada | Comportamento |
|---|---|
| Título, régua, índice, prisma | `--p` reversível; sobe ao descer, desce ao subir |
| Cards, imagens, números | reveal one-shot; permanecem legíveis na volta |
| Manifesto | capítulos ativos por `IntersectionObserver`; funciona nas duas direções |
| Contadores | animam uma vez; não reiniciam no scroll para cima |
| Marquee de marcas | auto, 44–60s; pausa em hover/focus e reduced motion; não duplicar com drift na mesma viewport |

**Por que não reverter tudo:** esconder conteúdo quando o usuário rola para cima atrapalha a leitura. O efeito cinematográfico fica nas camadas decorativas; o conteúdo é estável.

### 6.5 Mobile e reduced motion

- Pin apenas no Manifesto; abaixo de 900px ele já vira coluna (comportamento atual). Nenhum outro pin.
- Sem prisma em mobile; sem drift de marcas; sem parallax.
- `100svh` onde houver sticky; fallback `100vh`.
- `prefers-reduced-motion: reduce`: desligar motor, remover `--p`, mostrar todos os frames/capítulos, pausar vídeo do hero e marquee, contadores no valor final.
- Testar 360×640, 390×844, 768×1024, 1440×900; sem scroll horizontal.

### 6.6 Integração com o que já existe
- `initExperienceChapters()` continua dono do Manifesto; o motor global só adiciona `--p` para a linha de progresso.
- `initReveal()` continua one-shot; não substituir por `--p`.
- O hero já usa `animation-timeline` para zoom; manter e apenas acrescentar o prisma/título se necessário.
- `app.js:11-28` continua forçando topo; não usar `scrollRestoration` automático.
- Não usar `scroll-snap` em `html`, `body` ou `main`.

---

## 7. Riscos, performance e limites

| Risco | Mitigação |
|---|---|
| **Parecer showreel** | Máximo 2 aparições do prisma; uma ideia por viewport; sem objeto no catálogo/contato. |
| **Fadiga de movimento** | Conteúdo one-shot; decoração reversível; sem pin além do Manifesto. |
| **Jank mobile** | Sem prisma/drift no mobile; `transform`/`opacity`; `will-change` só perto; sem filtros pesados. |
| **Scroll listener global** | Um rAF, só seções próximas, pausa com `visibilitychange`; sem listener por elemento. |
| **CSS 3D feio/genérico** | Papel, não chrome; 8 faces; testar still; fallback SVG. |
| **Objeto cobrir texto** | `pointer-events:none`; só no canto vazio; opacidade baixa em Compromissos. |
| **Conteúdo inacessível** | Todo texto no DOM; sem `aria-hidden` em capítulos; reduced motion estático; contraste AA. |
| **Peso do hero** | O vídeo atual tem 9,8 MB; pausar fora da viewport e em reduced motion; não adicionar vídeo novo. |
| **Contagem de lojas** | Briefing 5 / `stores.js` 4; não fixar número no scroll; alinhar com Zeus. |
| **Conflito com Afrodite** | Não editar produção; handoff de classes e trechos; preservar IDs. |

**Orçamento:** zero bibliotecas novas; ≤1 motor JS (~2 KB); ≤2 aparições do prisma; nenhum novo asset de imagem; sem mudança no catálogo.

---

## 8. Critérios de aceite

### Narrativa e arte
- [ ] O site parece uma revista em movimento, não um showreel.
- [ ] Uma ideia por viewport; no máximo dois efeitos concorrentes.
- [ ] Prisma aparece no máximo no Hero e em Compromissos; nunca no catálogo/contato.
- [ ] Papel/ink/forest/oxblood preservados; sem preto puro, chrome ou neon.
- [ ] Manifesto sticky permanece com 3 capítulos e mídia sticky.

### Movimento
- [ ] Descida e subida funcionam nas camadas decorativas; conteúdo não desaparece.
- [ ] Títulos com deslocamento ≤24 px; sem letter-by-letter; sem `letter-spacing` animado.
- [ ] Contadores animam uma vez; não reiniciam ao subir.
- [ ] Nenhum `scroll-snap` global; nenhum `wheel`/`touchmove` interceptado.
- [ ] Página inicia no topo; `forcePageTop` preservado.

### 3D
- [ ] CSS 3D ou SVG; sem Three.js na entrega padrão.
- [ ] Se Three.js for exceção: lazy, DPR ≤1.5, desligado no mobile/reduced motion.
- [ ] Objeto `aria-hidden`, `pointer-events:none`, sem cobrir texto.

### Performance
- [ ] 60fps no desktop; sem long tasks >50 ms em emulação mobile.
- [ ] Apenas `transform`/`opacity`; sem filtros/backdrop-filter no motor.
- [ ] Nenhum layout shift; `width`/`height`/`aspect-ratio` definidos.
- [ ] Vídeo do hero pausado fora da viewport; nenhum autoplay de áudio.

### Acessibilidade
- [ ] `prefers-reduced-motion`: tudo estático, sem motor, sem prisma, vídeo pausado.
- [ ] Conteúdo legível em 200% de zoom e em 320 px.
- [ ] Contraste AA em paper/forest, inclusive durante o movimento.
- [ ] Foco visível; teclado não fica preso; nenhuma informação só no scroll.
- [ ] `aria-hidden` apenas em decoração; capítulos e títulos permanecem no DOM.

### Preservação
- [ ] `#sobre`, `#catalogo`, `#contato`, IDs e funções globais intactos.
- [ ] Busca, filtro, modal, lightbox e wishlist intactos.
- [ ] `npm run build` e `npm test` passando; 28 produtos.
- [ ] Nenhuma alteração em `produtos.json`, PWA, `vercel.json` ou API.

---

## 9. Handoff para Afrodite

- **Adicionar** `data-scroll="hero"` no `#inicio`, `data-scroll="cover"` nas demais seções e `data-scroll="pin"` no `#sobre`; um único motor em `modules/corporate.js` (ou módulo novo `modules/scroll.js`) com o código da seção 6.1.
- **CSS:** classes `is-near`, `--p`, `.kinetic-title`, `.kinetic-rule`, `.seal`; usar tokens existentes; sem valores novos de cor.
- **Prisma:** CSS 3D no Hero e watermark em Compromissos; SVG fallback; sem Three.js.
- **Manifesto:** manter `initExperienceChapters()`; só acrescentar `--p` na linha de progresso.
- **Catálogo/contato:** não aplicar `--p` em cards, inputs ou grid; preservar interações.
- **Reduced motion:** desligar motor e vídeo; mostrar tudo estático.
- **Validar:** 360/768/1024/1440; `npm run build`; `npm test`; FPS; contraste; teclado.
- **Esforço estimado:** M (1–2 dias) para a base A; +1 dia para o prisma CSS; Three.js opcional seria G e não recomendado.

### Em uma frase
**O Miplace não precisa de um poliedro girando no centro do site; precisa de tipografia que se move como uma revista e de um prisma de papel que aparece duas vezes, como uma assinatura.**
