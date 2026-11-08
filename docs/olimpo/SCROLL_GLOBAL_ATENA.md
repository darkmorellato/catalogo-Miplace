# Scroll Global — Adaptação da Referência para o Site Miplace

> **Status:** proposta de arquitetura; não altera produção.
> **Data:** 2026-11-08 · **Autora:** Atena (Tech Lead & Arquiteta)
> **Referência:** `recording_20261107_23-51-35.mp4` (27,8 s) — fundo escuro, tipografia gigante, poliedro facetado sticky, textos entrando/saindo com scroll reversível.
> **Escopo:** linguagem de scroll para a home inteira, preservando identidade editorial, catálogo, contato, PWA e o Manifesto com capítulos sticky já aprovado.
> **Fontes:** `BRIEFING.md`, `DESIGN_SYSTEM.md`, `index.html`, `styles.css`, `modules/corporate.js`, `app.js`, `SCROLL_PREMIUM_ATENA.md`.

## 1. Leitura da referência

- **O que define a linguagem:** campo escuro, tipografia sem serifa em escala gigante, um objeto facetado monolítico no centro, poucos rótulos e muito espaço negativo.
- **O que faz o efeito:** o objeto é sticky; o scroll muda rotação, escala e posição; o texto entra e sai com máscara, opacidade e um blur curto; a leitura funciona nos dois sentidos porque é **scroll-linked**, não uma animação de entrada disparada uma vez.
- **O que não copiar:** preto/neon, webcam/browser chrome da gravação, objeto sempre no centro, texto atrás de tudo, scroll sequestrado e estética de “agência de web design”.
- **Tradução para a Miplace:** mesma gramática de **escala, máscara, sticky e objeto facetado**, mas com paleta paper/ink/forest/oxblood/gold, tipografia Playfair + DM Sans, conteúdo real e movimento mais contido.
- **Restrição de marca:** o design system pede “movimento discreto” (160–400 ms, uma intenção por interação) e restringe 3D/tilt às seções legadas. A adaptação precisa de uma exceção explícita e limitada, não de uma página inteira em modo showreel.

## 2. Princípio de arquitetura

**Estado atual:** o site já tem `initReveal` reversível (`corporate.js:149-166`) e capítulos sticky com IO (`corporate.js:197-226`), mas convive com cinco listeners de scroll (`app.js:140`, `app.js:175`, `app.js:246`, `ui.js:280`, `corporate.js:40`). O novo sistema não pode adicionar um listener por seção; no máximo, um único global para fallback/progresso, e o ideal é consolidar os existentes.

**Um motor de scroll, três camadas, uma intenção por seção.**

```
HTML semântico (conteúdo sempre presente)
  └─ data-scene / data-scene-layer
       ├─ scroll.js  → detecta suporte, reduz motion, observa cenas (IO)
       ├─ CSS         → view()/scroll(), sticky, transforms, máscaras
       └─ tokens      → duração, easing, cores, tipografia
```

- **Contínuo:** o que deve acompanhar o dedo usa `animation-timeline: view()` ou `scroll()`; por definição, descer e subir são simétricos.
- **Discreto:** o que troca de estado (capítulo ativo, seção visível, contador) usa `IntersectionObserver` + `classList.toggle`, não `add`; assim também reverte.
- **Conteúdo:** nada de texto gerado por JS; sem JS, a página continua legível e completa.
- **Uma exceção:** o Manifesto já é o momento sticky aprovado; o novo sistema não cria outro palco sticky na mesma dobra. No máximo, Números ganha um segundo momento.
- **Catálogo e Contato são zonas de conversão:** não recebem pin, parallax ou transform em cards; a estabilidade vale mais que o efeito.

**Regra de ouro:** “site todo” significa **coerência de linguagem em todas as seções**, não animação em todos os elementos. Se tudo se move, o catálogo perde legibilidade e o efeito deixa de ser premium.

## 3. Três direções

### Direção A — Atos Editoriais (recomendada)

**Conceito:** a home vira uma sequência de atos com a mesma gramática, mas intensidade variável. Cada seção recebe **uma** camada de movimento: tipo gigante, linha que se desenha, mídia que respira, número que entra. O poliedro aparece só em **Números** (protagonista) e **Compromissos** (acento pequeno), nunca em catálogo/contato.

**Cobertura:** Hero, Manifesto (preservado), Números, Negócios, Marcas, Presença, Compromissos e Rodapé. Carreiras/Imprensa recebem reveal simples; Catálogo/Contato ficam estáveis.

**Mecânica:** CSS scroll-driven para contínuos; IO para estados; um único `scroll.js`; sem pin novo além do Manifesto e de uma faixa de Números (140–160svh). O objeto é um prisma CSS/SVG, não Three.js.

**Prós:** cobre o site inteiro sem parecer template; mantém a identidade editorial; menor custo e menor risco; reversível; catálogo intacto.
**Contras:** menos “uau” que um objeto contínuo; exige direção de arte fina para o tipo gigante não competir com o conteúdo.

### Direção B — Objeto Contínuo

**Conceito:** um único poliedro fixo/sticky acompanha a página inteira; cada seção muda seu material, escala e posição; a página vira um único scrollytelling. É a adaptação mais literal da referência.

**Cobertura:** todas as seções, com o objeto como camada de fundo; catálogo/contato precisariam desativá-lo.

**Mecânica:** objeto `position: fixed` ou `sticky`; `animation-timeline: scroll(root)` para rotação; IO para trocar `data-material`; o objeto se move entre âncoras; fallback estático no mobile.

**Prós:** assinatura forte e imediata; máxima fidelidade à referência.
**Contras:** o objeto sempre na tela cansa e compete com texto; custo de GPU/bateria; risco de cobrir conteúdo e foco; catálogo e formulário não combinam com um objeto em movimento; no mobile vira um bloco pesado. **Não recomendo para a home inteira.**

### Direção C — Cinema em Blocos

**Conceito:** aplicar a linguagem completa só em **3 blocos-âncora**: Hero, Números e Compromissos. Cada um é um palco sticky de 180–220svh com tipo gigante e objeto; o resto da página mantém o editorial atual com reveals discretos.

**Cobertura:** 3 blocos; o restante é A-lite. O efeito viaja pela tipografia e pelas transições de cor, não por um objeto onipresente.

**Prós:** alto impacto com escopo controlado; cada bloco pode ser entregue e medido separadamente; menor risco de regressão global.
**Contras:** não é “site todo” no sentido literal; adiciona altura de página; três palcos sticky podem cansar; exige coreografia entre blocos para não parecer três templates.

## 4. Onde aplicar

| Seção | Efeito | Técnica | Objeto 3D? | Custo |
|---|---|---|---|---|
| **Hero** (`inicio`) | H1 em máscaras; mídia sai com zoom/opacidade; CTA fixo | `view()` para saída; entrada por máscara uma vez | Não | Baixo |
| **Manifesto** (`sobre`) | Capítulos sticky já aprovados; régua e contador | IO + CSS transitions | Não | Baixo (preservar) |
| **Números** (`numeros`) | Números gigantes; prisma facetado gira/escala | `view()` + `position: sticky` em 140–160svh | **Sim (CSS/SVG)** | Médio |
| **Negócios** (`negocios`) | Watermark “NEGÓCIOS” em parallax curto; cards em stagger | `view()` + IO | Não | Baixo |
| **Marcas** (`marcas`) | 3 fileiras tipográficas com velocidades leves; sem logos | `view()` | Não | Baixo |
| **Presença** (`presenca`) | Linha de rota SVG se desenha; cards entram | `stroke-dashoffset` + IO | Não | Médio |
| **Compromissos** (`compromissos`) | Título grande; segundo prisma pequeno; 4 blocos | `view()` + IO | **Sim (acento)** | Baixo/médio |
| **Carreiras/Imprensa** | Reveal simples; sem pin | IO | Não | Baixo |
| **Catálogo** (`catalogo`) | **Nenhum** scroll effect novo; filtros e cards estáveis | — | Não | Zero |
| **Contato** (`contato`) | **Nenhum**; formulário imóvel e focável | — | Não | Zero |
| **Rodapé** | Wordmark “MIPLACE” em máscara/parallax curto | `view()` | Não | Baixo |

**Cobertura:** 8 de 11 seções com movimento; 3 zonas estáveis por decisão (catálogo, contato, carreiras/imprensa com reveal mínimo). Isso é “site todo” com ritmo, não animação indiscriminada.

## 5. Recomendação

**A — Atos Editoriais.** É a única direção que cobre a home inteira sem transformar o site em um showreel, preserva o Manifesto aprovado e mantém catálogo/contato como zonas de conversão. O poliedro entra como **pontuação em dois lugares**, não como personagem onipresente.

Se depois do A o usuário quiser mais impacto, a evolução é **C para Números**: transformar apenas a faixa de Números em um bloco cinematográfico de 180svh. O resto continua A. B fica como experimento isolado, nunca como home inteira.

## 6. Mecânica CSS/JS

### 6.1 Motor de scroll

Preferir um módulo pequeno, `modules/scroll.js` (80–120 linhas), carregado antes de `corporate.js`. Se a integração não puder adicionar script, a mesma função pode viver em `corporate.js`, mas o arquivo já tem 491 linhas e não deve virar god module.

```js
// modules/scroll.js — esboço
(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const supportsTimeline = CSS.supports('animation-timeline: view()');
  const root = document.documentElement;

  const syncMode = () => {
    root.classList.toggle('scroll-static', reduced.matches || !supportsTimeline);
  };
  syncMode();
  reduced.addEventListener?.('change', syncMode);

  const scenes = Array.from(document.querySelectorAll('[data-scene]'));
  if (!scenes.length || !('IntersectionObserver' in window)) return;

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      // toggle, não add: o estado precisa voltar ao subir
      entry.target.classList.toggle('is-inview', entry.isIntersecting);
    }
  }, { rootMargin: '-20% 0px -20% 0px', threshold: 0 });

  scenes.forEach((scene) => io.observe(scene));
})();
```

- **Não** criar um listener de scroll por seção. O único listener global necessário é o do header/progresso atual; ele pode continuar em `rAF`, mas não deve alimentar transforms de seção.
- **Não** usar `once: true` em observadores que precisam reverter. `initReveal` atual já usa `toggle` (`corporate.js:149-166`) e é o padrão correto.
- **Contadores** continuam one-shot: recontar ao subir distrai e não agrega. O resto (texto, mídia, objeto, réguas) reverte.

### 6.2 CSS scroll-driven (contínuo e reversível)

```css
[data-scene="numeros"] {
  view-timeline-name: --numeros;
  view-timeline-axis: block;
}

@supports (animation-timeline: view()) {
  [data-scene="numeros"] .prism {
    animation: prism-turn 1ms linear both;
    animation-timeline: --numeros;
    animation-range: entry 10% cover 90%;
    transform-origin: 50% 55%;
  }

  @keyframes prism-turn {
    from { transform: rotateX(10deg) rotateY(-18deg) scale(.92); }
    to   { transform: rotateX(-10deg) rotateY(18deg) scale(1.04); }
  }
}
```

- `view()` é uma função da posição da seção no viewport: descer avança, subir volta. Não há estado acumulado. A API é Baseline 2026 segundo o [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timeline); versões anteriores recebem o fallback estático.
- `animation-range` define quando começa/termina; sem ele, a animação pode rodar antes da seção aparecer.
- `@supports` garante que navegador sem suporte receba o layout estático, não uma cena quebrada.
- Para texto em máscara, o mesmo padrão: linha com `overflow: clip`, `span` interno com `translateY(110%)`, animação `view()` até `0`; o texto continua no DOM e no leitor de tela.

### 6.3 Sticky e IO (discreto)

- O Manifesto atual é o modelo: mídia sticky + capítulos em fluxo + IO com `rootMargin: '-35% 0px -35% 0px'`.
- Para Números, usar o mesmo desenho: `.scene-stage { position: sticky; top: 0; height: 100svh; }` dentro de uma seção de 140–160svh; não criar 300vh.
- O estado ativo deve ser uma classe (`is-active`) e um `aria-current` quando houver navegação; não esconder texto com `opacity: 0` sem `inert`/`aria-hidden`.
- `svh` em vez de `vh`; testar iOS. Se o sticky falhar, `@media (max-width: 900px)` remove o palco e empilha.

### 6.4 Objeto facetado: CSS/SVG, não Three.js

**Recomendação:** um único **octaedro/dodecaedro CSS 3D** (8–12 faces em `div` com `clip-path: polygon(...)`, `transform-style: preserve-3d`), animado por `rotate3d`/`scale` via scroll timeline. As faces usam gradientes de `--paper`, `--forest`, `--gold` e `--accent`; a luz é sugerida por contraste entre faces, sem shader. Se a geometria 3D não compensar o custo de montagem, a alternativa é um SVG isométrico com rotação 2.5D — menos fiel à referência, porém mais simples.

- **Por que não Three.js:** o vendor já existe (≈790 KB no disco, `vendor/three.*`) e o `three-hero.js` está dormente; reativá-lo adiciona WebGL, contexto de GPU, resize/render loop e risco de bateria. Para **dois** momentos, o custo não se paga.
- **Onde faz sentido:** Números (protagonista, 320–420 px) e Compromissos (acento, 120–180 px). No Hero, o vídeo já é o protagonista; no catálogo/contato, o objeto atrapalha.
- **Fallback:** mobile, `prefers-reduced-motion` e navegador sem `animation-timeline` recebem o SVG estático, sem rotação. `aria-hidden="true"`, sem tabindex, sem interação.
- **Se o usuário exigir vidro/refração real:** aí sim Three.js, apenas desktop, `pointer: fine`, WebGL gate, render sob demanda (não loop contínuo), fallback SVG; registrar como exceção no design system.

### 6.5 Descida e subida

| Efeito | Como reverte |
|---|---|
| Tipo em máscara | `view()` + `animation-range`; volta ao sair da faixa |
| Objeto girando | `view()`; rotação é função da posição |
| Mídia com escala | `view()`; volta ao `scale(1)` no range inverso |
| Capítulo ativo | IO com `classList.toggle`; o capítulo anterior reativa ao subir |
| Linha SVG | `stroke-dashoffset` com `view()` ou IO; volta ao subir |
| Contador | One-shot; não reanima (decisão de UX) |
| Header/progresso | `rAF` único; não afeta conteúdo |

**Regra:** se o estado não é uma função da posição (ou de uma classe alternável), ele não é reversível. Evitar `IntersectionObserver` com `unobserve` para efeitos que devem voltar; usar `unobserve` só para contadores e entrada do hero.

## 7. Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Performance mobile | No máximo 2 palcos sticky (Manifesto + Números); transforms/opacity; sem filtros em áreas grandes; `content-visibility` fora das cenas; medir long tasks |
| Regressão no catálogo/contato | Escopar tudo em `[data-scene]`; não tocar em `body`/`html`; catálogo/contato sem `data-scene`; `test-site.js` e smoke manual |
| Movimento excessivo | `prefers-reduced-motion` desliga timeline e transforms; `scroll-static`; reveals visíveis; sem parallax mobile |
| Conteúdo invisível | Texto sempre no HTML; `opacity:0` só em camadas decorativas; nada focável escondido; fallback sem JS |
| Blur/filtros em texto grande | Preferir máscara + opacidade + translate; se usar blur, só desktop e por trecho curto; medir paint/long task |
| Suporte a `animation-timeline` | Baseline 2026; `@supports` + fallback estático; não usar polyfill pesado |
| iOS sticky/`svh` | Testar iPhone real; `100svh`; fallback `position: static`; evitar `100vh` |
| i18n e quebra de linha | Preservar chaves; reaplicar `MiplaceI18n.apply()` após split; testar PT/EN/ES; não animar texto traduzido com largura diferente sem reflow |
| Início no topo | Manter `forcePageTop()` (`app.js:8-22`); não adicionar hash; não usar `scrollIntoView`/autofocus no load |
| Página longa | Cap de altura; sem scroll-snap; não pinar catálogo/contato; medir tempo até CTA |
| Tom “agência/showreel” | Paleta editorial; tipo serifado; objeto só 2 vezes; sem preto/neon; sem copiar labels da referência |
| Manutenção | Um módulo de scroll; data attributes; CSS por cena; sem dependências novas |

## 8. Critérios de aceite

- [ ] A página inicia no topo em reload, `pageshow` e navegação normal; nenhum auto-scroll para seção.
- [ ] Nenhum `scroll-snap` global; roda do mouse e gesto touch rolam normalmente; sem sequestro.
- [ ] Descer e voltar ao mesmo ponto restaura o mesmo estado visual (tipo, objeto, capítulo, linha).
- [ ] `prefers-reduced-motion`: sem timeline/transform; todo o conteúdo visível e legível.
- [ ] Sem JS: texto, imagens e CTAs aparecem; nenhuma seção em branco.
- [ ] Mobile 360/390: sem overflow horizontal; sticky não prende; catálogo/contato intactos.
- [ ] Catálogo renderiza 27 produtos; busca, filtros, modal, lightbox e wishlist inalterados.
- [ ] Manifesto mantém os 3 capítulos sticky e a copy aprovada.
- [ ] Objeto facetado só em Números e Compromissos; `aria-hidden`; estático em mobile/reduced.
- [ ] Performance: Lighthouse mobile ≥85; LCP ≤2,5 s; CLS <0,1; sem long task >50 ms por scroll.
- [ ] Acessibilidade: um `h1`, headings sem saltos, foco visível, contraste AA, teclado completo; nada focável escondido.
- [ ] i18n PT/EN/ES sem chave crua; `html lang`, `title` e description atualizados.
- [ ] `npm run build`, `npm test` e `node scripts/test-site.js` verdes; sem erro de console em desktop/mobile.
- [ ] Nenhuma biblioteca nova; `vendor/three.*` não é reativado sem decisão explícita.

## 9. Fases sugeridas

| Fase | Entrega | Critério de saída |
|---|---|---|
| 0 — Fundação | `modules/scroll.js`, `data-scene` no HTML, `scroll-static`, reduced motion, fallback | Nada muda visualmente; tudo estático e acessível |
| 1 — Âncoras | Hero, Números (prisma), Manifesto (régua/contador) | 2 palcos no máximo; Lighthouse mobile ≥85 |
| 2 — Ritmo | Negócios, Marcas, Presença, Compromissos, Rodapé | Reversível; sem regressão no catálogo |
| 3 — Polimento | Ajuste de ranges, microcopy, QA em iOS/Android | Aceite completo; decisão sobre C em Números |

## 10. O que não fazer

- Não colocar o objeto facetado fixo na home inteira; ele cansa e compete com o conteúdo.
- Não usar preto/neon, webcam, labels de “WEB DESIGN” ou qualquer copy da referência.
- Não usar `scroll-snap` global, scroll hijack, `scroll-behavior: smooth` global ou pin no catálogo/contato.
- Não animar cards de produto com transform/parallax; o catálogo precisa de estabilidade para clique e leitura.
- Não esconder conteúdo com `opacity: 0` e deixá-lo focável; não criar texto só em imagem.
- Não reativar Three.js para dois efeitos; o vendor é grande e o design system restringe 3D nas novas seções.
- Não usar 300vh no mobile; não usar `100vh` puro no iOS.
