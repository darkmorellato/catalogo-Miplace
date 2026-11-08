# DESIGN SYSTEM — MIPLACE GROUP

> **Versão:** 1.0 · 2026-11-07
> **Owner:** Íris (UX/UI) · **Implementação:** Afrodite · **QA:** Argos
> **Fonte de verdade:** `BRIEFING.md` (aprovado por Zeus) + `design/tokens.css`
> **Escopo:** camada corporativa da home e páginas legais. O catálogo existente é preservado em estrutura, IDs e contratos.

---

## 0. Como usar este documento

1. Leia os fundamentos antes de abrir o código: grid, tipo, cor e ritmo definem 80% do resultado.
2. Consuma **somente** `design/tokens.css`; não crie valores novos no meio de um componente.
3. Novas classes da camada corporativa usam o prefixo `mg-` para não colidir com `styles.css`/Tailwind do catálogo.
4. O catálogo mantém as classes e os IDs atuais (`#products-grid`, `#category-filters`, `#search-input`, `#product-modal`, `#lightbox`, `#wishlist-*`).
5. Em caso de conflito entre este documento e o briefing, o briefing vence. Em caso de dúvida de marca, Zeus decide.

### Integração com Tailwind v4

```css
/* src/input.css — exemplo de ponte, não de layout */
@import "tailwindcss" source(none);
@import "../design/tokens.css";

@source "../index.html";
@source "../app.js";
@source "../stores.js";
@source "../modules";

@theme inline {
  --color-paper: var(--paper);
  --color-paper-2: var(--paper-2);
  --color-ink: var(--ink);
  --color-ink-2: var(--ink-2);
  --color-ink-3: var(--ink-3);
  --color-accent: var(--accent);
  --color-gold: var(--gold);
  --color-gold-text: var(--gold-text);
  --color-forest: var(--forest);
  --font-sans: var(--font-sans-stack);
  --font-serif: var(--font-display-stack);
}
```

> Breakpoints não podem ser custom properties em `@media`. Use os valores documentados na seção 2. Não duplique stacks de fonte: `--font-sans-stack` e `--font-display-stack` existem para a ponte com o Tailwind.

---

## 1. Princípios

1. **Editorial corporativo, não revista local.** Papel quente, tinta quase preta, oxblood e champagne; hierarquia grande e muito respiro. O exagero editorial fica na tipografia e nas réguas, não em efeitos.
2. **Padrão global, alma local.** A ambição internacional aparece em governança, clareza, acessibilidade e experiência em três idiomas — nunca em escritórios, prêmios ou operações que não existem.
3. **Uma cor de ação.** O ink conduz a interface; o oxblood marca ênfase e ação; o champagne é detalhe. Se tudo grita, nada é premium.
4. **Prova, não adorno.** Só entram números, lojas, marcas, produtos e imagens reais. Lacuna vira linguagem de compromisso ou `null`, nunca invenção.
5. **Acessibilidade é o acabamento.** Contraste, foco, alvo de 44 px, hierarquia e teclado fazem parte do design, não são uma etapa posterior.
6. **Movimento discreto.** 160–400 ms, uma intenção por interação, música só após gesto, com controle visível. `prefers-reduced-motion` desliga sem quebrar o layout.

---

## 2. Grid e layout

### 2.1 Estrutura

| Faixa | Colunas | Gutter | Gap | Container |
|---|---:|---|---:|---|
| Desktop ≥ 1280 px | 12 | 48 px | 24 px | 1280 px |
| Desktop 1024–1279 px | 12 | `clamp(20px, 4vw, 48px)` | 24 px | 1280 px |
| Tablet 768–1023 px | 8 | 32 px | 20 px | fluido |
| Mobile < 768 px | 4 | 20 px | 16 px | fluido |

- `--max: 1280px`; `--gutter: clamp(20px, 4vw, 48px)`; `--section: clamp(72px, 10vw, 140px)`.
- Remover a moldura de 12 px nas laterais do `body` (briefing 4.2). O respiro vem do container, não de bordas fixas.
- Seções escuras podem ser **full-bleed**; o conteúdo interno continua no container.
- Assimetria editorial é bem-vinda: 7/5, 5/7, 8/4. Evite tudo centralizado e do mesmo tamanho.
- Âncoras com `scroll-margin-top` de 96 px no desktop e 80 px no mobile, por causa do header sticky.

### 2.2 Ritmo vertical

| Token | Uso |
|---|---|
| `--section` | intervalo entre seções (72–140 px) |
| `--section-tight` | subseções e blocos de CTA (48–88 px) |
| `--space-8` / `--space-7` | respiro interno de blocos grandes |
| `--space-5` / `--space-6` | títulos, listas e cards |
| `--space-3` / `--space-4` | labels, metadados e botões |

- Título → lead: 24 px. Lead → conteúdo: 32–48 px. Conteúdo → CTA: 32 px.
- Não use margens arbitrárias (`mt-[37px]`); use a escala.

---

## 3. Tipografia

### 3.1 Famílias e papéis

| Família | Token | Papel | Nunca |
|---|---|---|---|
| **Playfair Display** | `--font-display` | display, H1, H2, números grandes, assinatura editorial | corpo, botões, labels, tabelas |
| **DM Sans** | `--font-sans` | corpo, lead, navegação, botões, formulários, dados | display principal |

Pesos disponíveis: Playfair 400/600/800; DM Sans 400/500/700. Não carregar pesos extras.

### 3.2 Escala

| Token | Tamanho | Line-height | Tracking | Uso |
|---|---|---|---|---|
| `--text-display` | 48–96 px | `--leading-display` 0.98 | `-0.02em` | Hero e números-âncora |
| `--text-h1` | 40–72 px | 1.05 | `-0.02em` | Título único da página |
| `--text-h2` | 32–56 px | 1.05 | `-0.01em` | Título de seção |
| `--text-h3` | 24–36 px | 1.1 | `-0.01em` | Título de card/bloco |
| `--text-h4` | 20 px | 1.2 | 0 | Subtítulo |
| `--text-lead` | 18–22 px | 1.55 | 0 | Lead, max `60ch` |
| `--text-body` | 16 px | 1.65 | 0 | Corpo, max `68ch` |
| `--text-small` | 14 px | 1.5 | 0 | Apoio, metadados densos |
| `--text-caption` | 12 px | 1.4 | 0 | Legenda, legal, ref. |
| `--text-eyebrow` | 12 px | 1.4 | `0.18em` | Eyebrow, 700, caixa alta |

Regras:
- **Um único `h1` por página.** Na home, o `h1` é “Tecnologia global. Cuidado local.”. O wordmark “Miplace” é link/`div`, nunca `h1`.
- Não pule níveis: `h1 → h2 → h3`; cards usam `h3` ou `h4` conforme o contexto.
- Caixa alta só em eyebrow, navegação, botões e labels curtos. Nunca em parágrafos.
- Piso de **12 px** para qualquer texto informativo; 9–10 px não são aceitáveis no corpo. Eyebrow, legendas e metadados usam 12 px com contraste AA.
- Playfair abaixo de 24 px só em itálico decorativo pontual; para leitura, DM Sans.

### 3.3 Exemplos aprovados

- Eyebrow: `Grupo brasileiro • Curadoria global`
- H1: `Tecnologia global. Cuidado local.`
- Lead: `Conectamos pessoas à melhor tecnologia do mundo com curadoria especializada, acesso facilitado e um atendimento que só uma operação próxima pode oferecer.`
- H2 de seção: `Uma empresa de tecnologia com alma de bairro.`

---

## 4. Cor

### 4.1 Paleta e papéis

| Token | Hex | Papel | Contraste sobre `--paper` |
|---|---|---|---|
| `--paper` | `#f5f2ea` | fundo base, superfície | — |
| `--paper-2` | `#ebe7dd` | fundo alternativo, imagem, faixa | 1,10:1 (só superfície) |
| `--ink` | `#141414` | texto principal, botão primário, réguas | 16,47:1 |
| `--ink-2` | `#4a4641` | texto secundário, lead, labels | 8,37:1 |
| `--ink-3` | `#79736b` | texto terciário grande, borda funcional | 4,19:1 (só ≥18,66 px bold ou 24 px) |
| `--accent` | `#8c1d1d` | links, ênfase, erro, ação de marca | 8,13:1 |
| `--gold` | `#b9965a` | filetes, detalhe, ícone grande em fundo escuro | 2,48:1 (decorativo) |
| `--gold-text` | `#7d6234` | texto pequeno/ícone sobre papel | 5,12:1 |
| `--forest` | `#173b32` | seções escuras, sucesso | 10,99:1 |
| `--line` | `rgba(20,20,20,.14)` | régua decorativa | não é texto |
| `--line-strong` | `rgba(20,20,20,.32)` | régua de ênfase | não é texto |
| `--color-border-functional` | `--ink-3` | borda de input/card interativo | 4,19:1 |

Extras derivados, documentados em `tokens.css`: `--color-brand-hover` `#741717` (10,0:1), `--color-forest-deep` `#0f2a23` (13,6:1), `--color-gold-text` `#7d6234` (5,12:1).

### 4.2 Regras de uso

- Proporção 60/30/10: papel 60%, tinta 30%, oxblood + champagne 10%. Forest entra em 1–2 seções, não no site inteiro.
- **Botão primário = ink/paper.** O oxblood é link, ênfase e estado de erro; não é o fundo padrão de CTA.
- **Champagne nunca é texto pequeno sobre papel.** Use `--gold-text`; `--gold` puro só em filete, ícone grande ou fundo escuro.
- **Nunca paper sobre gold** (2,48:1). Se precisar de botão dourado em seção escura, use ink sobre gold (6,64:1) e confirme o contexto.
- Em `--forest`: texto sempre `--paper` ou `--color-dark-muted`; oxblood não é legível (1,35:1); champagne só em detalhe ou texto grande (4,43:1).
- Sem gradientes, sem neon, sem preto puro `#000`, sem branco puro `#fff`, sem glassmorphism. Papel e tinta são a identidade.
- Status reutilizam a paleta: sucesso = forest, erro = accent, aviso = gold-text, info = ink-2. Sempre acompanhados de texto/ícone, nunca só cor.

### 4.3 Tabela de contraste (pares aprovados)

| Par | Ratio | Uso |
|---|---:|---|
| ink / paper | 16,47:1 | corpo, títulos, botão |
| ink-2 / paper | 8,37:1 | lead, secundário |
| accent / paper | 8,13:1 | link, erro |
| paper / accent | 8,13:1 | botão accent |
| paper / forest | 10,99:1 | seção escura |
| forest / paper | 10,99:1 | sucesso |
| gold-text / paper | 5,12:1 | metadado dourado |
| gold / forest | 4,43:1 | detalhe/texto grande |
| gold / ink | 6,64:1 | detalhe em fundo ink |
| ink-3 / paper | 4,19:1 | só texto grande/terciário |
| paper / gold | 2,48:1 | **proibido para texto** |

---

## 5. Espaçamento, bordas e sombras

- Escala base 4 px: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`.
- Seções: `--section`; sub-blocos: `--section-tight`; cards: 24–32 px; listas: 16–24 px.
- Raio: `--radius: 2px` em cards, botões, inputs e imagens. `--radius-pill` só para ícones circulares e dots de status; nunca em cards.
- Réguas: 1 px (`--line`) para separação; 3 px (`--line-strong`/ink) para abertura de seção ou assinatura editorial.
- Sombra: praticamente nenhuma. `--shadow-soft` só para elevação sutil; `--shadow-modal` só em modal. Card não usa sombra pesada.
- Não usar bordas laterais de 12 px no body; a moldura é editorial, mas não deve engessar o layout.

---

## 6. Componentes

### 6.1 Utility bar
- Altura 40–44 px; fundo `--paper-2`; borda inferior 1 px; DM Sans 12 px/700, caixa alta, tracking `0.12em`.
- Conteúdo aprovado: `Miplace Group` · `Tecnologia global. Cuidado local.` · `Imprensa` · `Carreiras` · `PT / EN / ES`.
- Mobile: manter marca, seletor de idioma e “Contato”; esconder a tagline se faltar espaço.
- Idioma: botões com `aria-pressed`; não usar bandeiras como única informação.

### 6.2 Header e navegação
- Sticky; fundo paper; borda inferior 1 px ink; altura 88 px desktop / 64 px mobile; z-index `--z-header`.
- Wordmark “Miplace” como link tipográfico (Playfair, 28–32 px), nunca `h1`.
- Navegação aprovada: `A Miplace · Negócios · Marcas · Coleção · Presença · Compromissos · Carreiras · Contato`.
- Item ativo: régua inferior 2 px accent + `aria-current="page"`; hover 200 ms; foco visível.
- Mobile: drawer de altura total, fundo paper, fecha com Esc e no link; foco preso; botão fechar 44 px. Nunca depender de hover.

### 6.3 Eyebrow
- DM Sans 12 px/700, caixa alta, tracking `0.18em`; cor `--ink-2` ou `--gold-text` em papel; `--color-dark-muted` em forest.
- Opcional: filete de 24 px antes do texto. Não usar como pill colorida nem repetir em todos os blocos.

### 6.4 Display
- Playfair 400/600/800; `--text-display` ou `--text-h1`; line-height 0.98–1.05; tracking `-0.02em`.
- Máximo de 12 palavras; quebras de linha intencionais; não usar caixa alta no display (exceto wordmark).
- Em seção escura, paper; nunca oxblood.

### 6.5 Lead
- DM Sans `--text-lead`; line-height 1.55; `--ink-2`; máximo `60ch`.
- Não justificar; não usar negrito no parágrafo inteiro. Links em accent com sublinhado.

### 6.6 Rule
- 1 px `--line` para separar conteúdo; 3 px ink para abrir seção. Pode ser full-bleed ou alinhada ao container.
- Não usar como decoração repetida em cada card.

### 6.7 Botões

| Variante | Fundo | Texto | Borda | Uso |
|---|---|---|---|---|
| Primário | ink | paper | 1 px ink | ação principal |
| Secundário (ghost) | transparente | ink | 1 px ink | ação alternativa |
| Texto + seta | transparente | ink | sublinhado 1 px | “Explorar a coleção” |
| Inverso (dark) | paper | ink | 1 px paper | CTA em forest |
| Perigo | accent | paper | 1 px accent | ação destrutiva |

- Altura 48 px (mínimo 44); padding horizontal 24–32 px; raio 2 px; DM Sans 12 px/700, caixa alta, tracking `0.08em`.
- Hover: primário → accent; ghost → ink com texto paper; 200 ms. Focus: anel 2 px accent, offset 3 px; em dark, anel gold.
- Disabled: opacidade 0.45 + `cursor: not-allowed`; loading: spinner 16 px + “Enviando…” + `aria-busy="true"`.
- Proibido: gradiente, pill, sombra pesada, botão dourado como CTA principal.

### 6.8 Links
- Accent, sublinhado 1 px, `text-underline-offset: 3px`. Hover `--color-brand-hover`; foco com anel.
- Link externo: ícone 16 px + `rel="noopener noreferrer"`; o texto deve fazer sentido fora de contexto (“Conheça a Miplace”, não “clique aqui”).
- Não usar cor como único indicador de link.

### 6.9 Section head
- Grid 12: eyebrow + título (8 col) + lead (5–6 col) + link/ação (3–4 col, alinhado à direita quando couber).
- Régua inferior 1 px ink; margem 24 px abaixo do eyebrow, 16 px entre título e lead.
- Mobile: empilhar na ordem eyebrow → título → lead → ação; nunca colocar o link ao lado de um título quebrado.

### 6.10 Cards

**Card de conteúdo**
- Superfície paper sobre `--paper-2` ou borda 1 px `--line`; raio 2 px; padding 24–32 px; sem sombra.
- Hover: borda `--ink-3` e translateY(-2px) em 200 ms; foco visível se for link.
- Título em Playfair 24–32 px; texto 16 px; CTA texto no rodapé.

**Card de catálogo (preservar estrutura atual)**
- Sem caixa: imagem 16:9 em `--paper-2`, régua inferior 1 px, marca 12 px/700 caixa alta, referência 12 px, título Playfair 24–48 px, micro-specs 12 px, preço 16 px/700.
- Hover: zoom máximo 1.04 na imagem, sem tilt 3D nas novas seções; o catálogo legado pode manter o efeito atual com `prefers-reduced-motion`.
- Card em destaque ocupa 2 colunas no desktop; no mobile, 1 coluna.
- Wishlist e seta de detalhe: alvo 44 px; `aria-label` específico; não dependem de hover.

### 6.11 Stats
- Número em Playfair 56–72 px (mobile 40–48); label DM Sans 12 px/700 caixa alta, tracking `0.18em`; régua superior 1 px.
- Grade de 6 itens: 6 colunas no desktop, 3 no tablet, 2 no mobile.
- Usar somente fatos aprovados: `7 anos`, `4 lojas`, `9 marcas globais`, `27 produtos`, `24x no boleto`, `2 cidades`.
- Contadores só uma vez por seção; reduced motion mostra o número final imediatamente.

### 6.12 Brand tiles
- Parede tipográfica 3×3 no desktop, 2 colunas no mobile; célula com borda 1 px; altura 96–120 px; DM Sans 20–24 px/700, caixa alta.
- Marcas aprovadas: `Apple · Samsung · Motorola · Realme · Honor · Redmi · Poco · Infinix · Tecno`.
- **Sem logos não licenciados.** Não criar símbolos, monogramas ou marcas d'água. Se o tile filtrar o catálogo, usar `<button>`/link com `aria-label` (“Ver produtos Apple”).
- Hover: fundo ink, texto paper; foco visível; sem animação de escala.

### 6.13 Seção escura
- Fundo `--forest`; texto `--paper`; secundário `--color-dark-muted`; réguas `--color-dark-border`.
- Usar no máximo 2 seções por página (sugestão: Números e Compromissos). Não é dark mode; é contraste editorial intencional.
- CTA inverso paper/ink; foco gold; não usar oxblood em texto; champagne só em detalhe ou número grande.
- Inputs e cards dentro da seção escura seguem a mesma regra de contraste; não herdar cores do tema claro sem revisar.

### 6.14 Store card
- Dados exclusivamente de `stores.js`: nome, endereço, CEP, telefone, WhatsApp, Instagram, Facebook e link de mapa.
- 4 lojas: 3 em Piracicaba, 1 em Amparo. Não inventar horários, e-mails, fotos ou serviços.
- Estrutura: nome (Playfair 24), cidade/eyebrow, endereço (14–16), telefone, ações de 44 px (WhatsApp, mapa, redes). Logo da loja só se for o arquivo existente e autorizado; caso contrário, cartão tipográfico.
- Grid 3+2 no desktop; 1 coluna no mobile; não usar carrossel automático.

### 6.15 Formulários
- Label acima, explícito, 13 px/600; placeholder é exemplo, nunca substitui label.
- Input/select/textarea: altura 48 px; fundo paper; borda 1 px `--ink-3`; raio 2 px; padding 12–16 px; foco 2 px accent + offset 2 px.
- Erro: borda accent + mensagem 12–14 px abaixo, com ícone e `aria-describedby`; `aria-invalid="true"`. Sucesso: mensagem inline com `aria-live="polite"`.
- Checkbox de consentimento: 24 px, label clicável, texto claro; honeypot `website` oculto visualmente e fora da tabulação.
- Botão de envio: largura total no mobile; loading e erro com retry; fallback WhatsApp visível quando a API falhar.

### 6.16 Modal e lightbox
- Manter os diálogos existentes com `role="dialog"`, `aria-modal="true"` e `aria-labelledby`.
- Overlay ink 50–60% + blur 8 px; container paper; raio 2 px; sombra `--shadow-modal`; fechar 44 px.
- Foco preso, Esc fecha, foco retorna ao gatilho, scroll do body travado. Não empilhar modais.
- Imagem com alt; botões anterior/próxima com `aria-label`; contador visível.

### 6.17 Footer
- Fundo ink; texto paper; wordmark “Miplace” em Playfair, grande, como assinatura (não `h1`).
- Colunas: navegação, legal, contato, idioma; links 12–14 px, caixa alta; foco gold.
- Copy aprovada: `Miplace Group © 2026. Todos os direitos reservados.` e `Marcas mencionadas pertencem aos seus respectivos proprietários.`
- Links: `Privacidade · Termos · Acessibilidade · Contato · Carreiras · Imprensa`.

---

## 7. Estados

| Estado | Regra |
|---|---|
| Default | Repouso; sem sombra; borda/rule quando necessário para separar. |
| Hover | Só em ponteiro fino; 160–240 ms; cor/régua/translate ≤2 px; nunca esconder informação essencial. |
| Focus | Sempre visível: anel 2 px `--accent`, offset 3 px; em dark, `--gold`. Não remover outline sem substituto. |
| Active | Pressão: translateY(1px) ou escurecer 8%; sem mudança de layout. |
| Disabled | Opacidade 0.45; `aria-disabled` quando aplicável; não usar só cor. |
| Loading | Skeleton ou spinner no controle; `aria-busy`; manter dimensões para não pular layout. |
| Error | Texto + ícone + borda accent; mensagem associada ao campo; `role="alert"`/`aria-live` quando global. |
| Success | Inline, com texto; não usar confete/emoji; desaparece só depois de o usuário ler. |
| Empty | Título curto + explicação + ação primária; sem ilustração inventada; pode usar ícone SVG simples. |
| Selected | Régua/realce + `aria-pressed`/`aria-selected`; não depender só de cor. |
| Expanded | `aria-expanded`; ícone gira 180° em 200 ms; conteúdo não deve saltar. |

Regras transversais:
- Nenhuma ação crítica só no hover. Em touch, todo controle tem alvo visível.
- Erro nunca em `alert()`/`confirm()` nativo; usar inline ou diálogo do sistema de design.
- Loading de página inteira só no primeiro carregamento; atualizações usam skeleton local.

---

## 8. Motion

| Token | Valor | Uso |
|---|---|---|
| `--duration-fast` | 160 ms | hover, foco, ícones |
| `--duration-base` | 240 ms | botões, cards, accordions |
| `--duration-slow` | 400 ms | reveal de seção |
| `--ease-standard` | `cubic-bezier(.2,0,0,1)` | UI geral |
| `--ease-out` | `cubic-bezier(.16,1,.3,1)` | entrada editorial |
| `--reveal-shift` | 24 px | deslocamento máximo do reveal |
| `--stagger` | 70 ms | sequência de cards |

- Reveal: opacidade 0→1 + translateY 24 px, 400 ms, uma vez; não repetir a cada scroll.
- Hover de imagem: escala ≤1.04, 240 ms; sem parallax em mobile.
- Contadores: 800 ms, uma vez; reduced motion mostra o valor final.
- 3D/tilt: restrito ao catálogo legado, ponteiro fino e sem reduced motion; novas seções corporativas não usam.
- Ticker/marquee: só como assinatura decorativa, nunca informação essencial; pausar no hover/focus, duplicar com `aria-hidden` e desligar em reduced motion.
- Áudio: música opcional, sem autoplay antes de gesto; o vídeo do hero é mudo, em loop, com poster e botão de música visível.
- `prefers-reduced-motion: reduce`: transições para 0 ms, reveals visíveis, sem parallax, sem contadores animados.

---

## 9. Acessibilidade WCAG 2.2 AA

### 9.1 Contraste
- Texto normal: ≥4,5:1; texto grande (≥24 px ou ≥18,66 px bold): ≥3:1; UI/bordas funcionais: ≥3:1.
- Pares aprovados na seção 4.3. `--ink-3` só em texto grande; `--gold` nunca em texto pequeno sobre papel.

### 9.2 Estrutura e teclado
- Um `h1` por página; headings sem saltos; landmarks `header`, `nav`, `main`, `footer`.
- Skip link “Ir para o conteúdo” como primeiro elemento focável.
- Foco visível em todos os controles; ordem de tabulação segue o visual; nada de `tabindex` positivo.
- Menu mobile e modais com focus trap, Esc, retorno de foco e `aria-expanded`/`aria-modal`.
- Alvos de toque ≥44×44 px, com espaçamento mínimo de 8 px entre ações adjacentes.
- Não usar hover como único caminho para ação; toda ação tem equivalente por teclado/touch.

### 9.3 Formulários e conteúdo
- Labels explícitos e associados (`for`/`id`); erros com `aria-describedby` + `aria-invalid`; status com `aria-live`.
- Link com texto descritivo; imagens com `alt` (decorativas com `alt=""`); vídeo sem áudio e com pausa.
- Idioma da página em `<html lang>`; ao trocar PT/EN/ES, atualizar `lang`, `title` e `meta description`.
- Suportar zoom 200% e reflow em 320 px sem scroll horizontal; texto não pode ficar cortado.
- Não usar cor como única informação; status sempre com texto/ícone.
- Respeitar `prefers-reduced-motion` e `prefers-contrast`.

### 9.4 Critérios de aceite
- Nenhum texto abaixo de 12 px informativo.
- Nenhum par de contraste abaixo de 4,5:1 para corpo; 3:1 para grande/UI.
- Navegação completa por teclado; foco sempre visível.
- Nenhum `alert()`/`confirm()` nativo em fluxo novo.
- Modal e drawer com foco preso e restaurado.

---

## 10. Foto e ilustração

- **Usar apenas acervo real existente:** fotos de produto em `/<marca>/*.webp`, `moldura-celular.webp`, `videos/hero.mp4`, `videos/hero-poster-1080.webp`, logos de loja em `/logo/` quando autorizados.
- **Não criar** logos, selos, prêmios, escritórios, equipes, depoimentos ou pessoas geradas por IA. Não usar banco de imagens genérico para simular operação.
- Parede de marcas é **tipográfica**; não usar logos de fabricantes sem licença.
- Fotos de loja, time e bastidores estão pendentes (PENDENCIAS #11): até chegarem, usar composição tipográfica, cor e produto — nunca placeholder de pessoa.
- Direção: luz natural/quente, fundos paper/paper-2, produto centrado, sombra suave real, sem filtros pesados, sem texto embutido na imagem.
- Proporções: produto 4:5 ou 1:1; hero 16:9 ou 4:3; card de catálogo 16:9. Consistência por seção.
- Performance: `loading="lazy"` abaixo da dobra; hero com `fetchpriority="high"` e poster; WebP/AVIF; não pré-carregar dezenas de imagens.
- Alt: descrever o produto e o contexto (“Smartphone Realme C85 na cor azul, sobre fundo claro”), não repetir o nome do arquivo.

---

## 11. Conteúdo e i18n

- Copy aprovada no briefing é a única fonte; não criar manchetes, números, depoimentos ou dados novos.
- PT-BR padrão; EN/ES na camada corporativa; produtos permanecem em PT-BR nesta versão.
- Tom: executivo, confiante, humano, frases curtas; sem “sinergia”, “disrupção” ou superlativos vazios.
- Lacunas: linguagem de compromisso (“estamos estruturando”) ou `null`/`"status": "pendente"`; registrar em `PENDENCIAS.md`.
- Nunca citar executivos, fundadores, CNPJ, faturamento, prêmios ou operação internacional inexistente.
- i18n: `data-i18n` e `data-i18n-attr`; persistir `miplace-locale`; fallback PT; seletor com `aria-pressed`.
- Linhas: lead 60ch, corpo 68ch; evitar palavras órfãs em títulos com `text-wrap: balance` quando suportado.

---

## 12. Anti-padrões

1. Dark mode automático ou toggle de tema; o site é light-only com seções forest intencionais.
2. Moldura fixa de 12 px nas laterais do body.
3. Preto puro, branco puro, neon, gradientes, glassmorphism ou sombras difusas em cards.
4. Dourado como texto pequeno sobre papel, ou paper sobre dourado.
5. Playfair em corpo, botões, tabelas ou labels.
6. Texto informativo abaixo de 12 px; 9–10 px em metadados.
7. Cards com raio 24–40 px, pills em tudo, botões com sombra pesada.
8. Ícones sem rótulo em ações críticas; ações críticas só no hover.
9. `alert()`, `confirm()` ou `prompt()` nativos em fluxos novos.
10. Carrossel automático para conteúdo essencial; marquee com informação que o usuário precisa ler.
11. Vídeo com som, parallax em mobile.
12. Logos de marcas não licenciados, fotos de banco de imagens, pessoas geradas por IA, escritórios fictícios.
13. Números, prêmios, certificações, depoimentos ou clientes inventados.
14. “Multinacional” como operação existente; usar ambição/compromisso, nunca fato não comprovado.
15. Múltiplas fontes display ou pesos extras sem necessidade.

---

## 13. Handoff para Afrodite

### 13.1 Contrato de implementação
- Não alterar IDs, `window.renderProducts`, `window.initCatalog`, `window.Module` ou contratos listados no briefing.
- Novas seções corporativas entram **acima de `#catalogo`**; o catálogo existente permanece com sua estrutura e classes.
- Usar `design/tokens.css` como única fonte de valores; nenhum hex novo em `index.html`/`styles.css` para a camada corporativa.
- Classes novas com prefixo `mg-`; classes do catálogo não são renomeadas.
- Ícones: SVG inline; Font Awesome pode permanecer onde já é usado no catálogo.
- Não alterar `produtos.json`, `stores.js` (exceto campos permitidos), `vercel.json`, `sw.js`, `api/` ou `docs/` de outros agentes.

### 13.2 Estrutura sugerida de classes
`mg-utility`, `mg-header`, `mg-nav`, `mg-eyebrow`, `mg-display`, `mg-lead`, `mg-rule`, `mg-btn`, `mg-btn--ghost`, `mg-btn--inverse`, `mg-section-head`, `mg-card`, `mg-stat`, `mg-brand-tile`, `mg-dark`, `mg-store-card`, `mg-field`, `mg-footer`.

### 13.3 Snippet de integração
- Importar tokens em `src/input.css` (exemplo na seção 0) **ou** linkar `design/tokens.css` antes de `styles.css` no `index.html`.
- Se usar link direto, manter `?v=` para cache bust, conforme padrão do projeto.
- Mapear os tokens no `@theme inline`; não redefinir os valores no `@theme`.
- Validar com `npm run build` e QA visual em 360, 768, 1024 e 1440 px.

### 13.4 Três decisões que não se negociam
1. **Tipografia:** Playfair Display só em display/títulos/números; DM Sans em todo o resto. Um `h1` por página, e o `h1` é a manchete — não o wordmark.
2. **Cor:** papel/ink são a base; oxblood é ênfase e ação; forest é seção escura; champagne é detalhe. Nunca paper sobre gold nem gold em texto pequeno.
3. **Forma:** grid 12 colunas com max 1280 px, raio 2 px, réguas de 1 px, alvos de 44 px, sem gradientes/sombras pesadas. O catálogo mantém sua anatomia; a camada corporativa usa essa linguagem.

---

## 14. Wireframe textual da home

### Desktop — 12 colunas

| Bloco | Colunas | Conteúdo |
|---|---|---|
| Utility bar | 12 | marca · tagline · imprensa · carreiras · PT/EN/ES |
| Header | 12 | wordmark 3 · nav 6 · contato/idioma 3 |
| Hero `#inicio` | 12 | mídia 7 · copy 5 (eyebrow, h1, lead, 2 CTAs, 4 indicadores) |
| Manifesto `#sobre` | 12 | copy 5 · imagem 7; 3 pilares em 3 colunas abaixo |
| Números `#numeros` | 12 | seção forest; 6 stats em 6 colunas |
| Negócios `#negocios` | 12 | 4 cards de 3 colunas |
| Marcas `#marcas` | 12 | 9 brand tiles em 3×3 |
| Presença `#presenca` | 12 | 5 store cards: 3 + 2 |
| Compromissos `#compromissos` | 12 | seção forest; 4 cards de 3 colunas + nota |
| Carreiras `#carreiras` | 12 | copy 7 · CTA 5 |
| Imprensa `#imprensa` | 12 | copy 7 · CTA 5 |
| Coleção `#catalogo` | 12 | catálogo existente: filtros, busca, grid 3 colunas |
| Contato `#contato` | 12 | formulário 7 · informações/lojas 5 |
| Footer | 12 | wordmark + 4 colunas + legal |

### Mobile — 4 colunas

| Bloco | Colunas | Conteúdo |
|---|---|---|
| Utility bar | 4 | marca · idioma · contato |
| Header | 4 | wordmark + hambúrguer |
| Hero | 4 | mídia · copy · CTAs empilhados · stats 2×2 |
| Manifesto | 4 | copy · imagem · pilares 1 coluna |
| Números | 4 | stats 2×2 |
| Negócios | 4 | cards 1 coluna |
| Marcas | 4 | tiles 2 colunas |
| Presença | 4 | cards 1 coluna |
| Compromissos | 4 | cards 1 coluna |
| Carreiras / Imprensa | 4 | copy · CTA full-width |
| Coleção | 4 | grid 1 coluna; filtros com scroll horizontal |
| Contato | 4 | formulário · informações |
| Footer | 4 | acordeões/colunas empilhadas |

Regras: ordem de leitura igual à do desktop; CTAs com 44 px; nada de texto sobre imagem sem contraste; seções escuras full-bleed com conteúdo no gutter.

---

## 15. Checklist de QA visual

### Estrutura e tipografia
- [ ] Um `h1` por página; hierarquia sem saltos.
- [ ] Grid alinhado nas 12 colunas; nenhum elemento “quase” alinhado.
- [ ] Playfair só em display/título/número; DM Sans no resto.
- [ ] Nenhum texto informativo abaixo de 12 px.
- [ ] Títulos sem viúvas/órfãs graves; `text-wrap: balance` onde suportado.

### Cor e contraste
- [ ] Nenhum par abaixo de 4,5:1 em corpo; 3:1 em texto grande/UI.
- [ ] `--gold` não é texto pequeno sobre papel.
- [ ] `--ink-3` só em texto grande.
- [ ] Seção forest usa paper/muted; sem oxblood em texto.
- [ ] Nenhum gradiente, preto puro ou branco puro.

### Componentes e estados
- [ ] Botões com 44 px, foco visível, hover/active/disabled/loading.
- [ ] Cards sem raio grande/sombra pesada; hover discreto.
- [ ] Brand tiles sem logos não licenciados.
- [ ] Store cards usam apenas dados de `stores.js`.
- [ ] Formulários com label, erro associado, `aria-live` e fallback WhatsApp.
- [ ] Modal/drawer com foco preso, Esc e retorno de foco.
- [ ] Empty/error/success claros, sem `alert()`.

### Responsivo e movimento
- [ ] 360, 768, 1024 e 1440 px sem scroll horizontal.
- [ ] Menu mobile abre/fecha; links fecham; foco retorna.
- [ ] `prefers-reduced-motion` desliga reveal/parallax/contadores.
- [ ] Vídeo do hero é mudo; música só após gesto e com controle visível.
- [ ] Imagens sem distorção; alt correto; lazy abaixo da dobra.

### Catálogo preservado
- [ ] 27 produtos renderizam em `#products-grid`.
- [ ] Busca, filtros, modal, lightbox e wishlist funcionam.
- [ ] IDs e funções globais do briefing intactos.
- [ ] Nenhum dado de `produtos.json` ou `stores.js` foi inventado/removido.

> Dúvidas de marca, copy ou dado ausente: escalating para Zeus; não preencher lacuna com invenção.
