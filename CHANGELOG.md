# Changelog

Todas as mudanças relevantes deste site são registradas aqui. O formato segue, como referência, o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/); o versionamento segue SemVer.

> Registro da versão 2.0.11 integrada e validada em 2026-11-08. Os itens de publicação dependem das pendências listadas em `docs/olimpo/PENDENCIAS.md`.

## [2.0.11] - 2026-11-08

### Corrigido

- O formulário agora mostra a mensagem real de validação da API em vez do erro genérico “Não foi possível enviar agora”.
- O campo Mensagem ganhou `minlength="10"`, alinhado à regra da API; textos curtos são bloqueados pelo navegador antes do envio.
- O aviso de fallback com e-mail/WhatsApp só aparece quando o envio realmente falha.
- FormSubmit ativado e testado em produção; mensagens válidas chegam a `contasgeraljack@gmail.com`.

### Alterado

- Versão dos assets para `?v=2.0.11`, `package.json` para `2.0.11` e `BUILD_TIMESTAMP` para `2026-11-08.13`.

## [2.0.10] - 2026-11-08

### Alterado

- Áudio volta a iniciar no primeiro clique em qualquer área da página, a pedido do usuário.
- Depois de iniciado, clicar fora do botão não pausa nem reinicia; a pausa acontece apenas no botão de música.
- O primeiro clique no próprio botão continua tocando, e o segundo pausa.
- Versão dos assets para `?v=2.0.10`, `package.json` para `2.0.10` e `BUILD_TIMESTAMP` para `2026-11-08.12`.

## [2.0.9] - 2026-11-08

### Corrigido

- Formulário de contato com fallback de envio: se a API `/api/contact` não estiver disponível (404), não estiver configurada (503) ou o Resend falhar (502), o navegador envia a mensagem pelo FormSubmit para `contasgeraljack@gmail.com`.
- O formulário volta a funcionar em servidor estático local e em qualquer host sem a função serverless, sem perder o caminho principal por Resend na Vercel.

### Alterado

- CSP libera `connect-src https://formsubmit.co` para o fallback.
- Política de privacidade registra o FormSubmit como operador de contingência do formulário.
- Versão dos assets para `?v=2.0.9`, `package.json` para `2.0.9` e `BUILD_TIMESTAMP` para `2026-11-08.11`.

### Nota de ativação

- O primeiro envio pelo FormSubmit exige uma ativação única no e-mail de destino; o link foi solicitado em 2026-11-08.

## [2.0.8] - 2026-11-08

### Corrigido

- O botão de música agora é o único gatilho de reprodução: o primeiro clique toca e o segundo pausa. O autoplay no primeiro clique em qualquer área da página foi removido, pois fazia o botão pausar uma trilha já iniciada.
- O botão mostra estado de carregamento com spinner e `aria-busy` enquanto o áudio é liberado pelo navegador.

### Alterado

- A trilha passou a usar `audio/peaceful-days.mp3` em 128 kbps (2,6 MB) como fonte principal, com o arquivo original em 320 kbps como fallback.
- O áudio é pré-carregado ao passar o mouse ou focar o botão, sem tocar antes do clique.
- Manifesto: o capítulo 02 (Acesso) passa a usar a foto 3 do Moto G06 (`motorola/g06-3.webp`) e o capítulo 03 (Proximidade) usa a foto 1 do Magic 7 Lite (`honor/magic7lite-1.webp`), a pedido do usuário.
- Versão dos assets para `?v=2.0.8`, `package.json` para `2.0.8` e `BUILD_TIMESTAMP` para `2026-11-08.10`.

## [2.0.7] - 2026-11-08

### Removido

- Objeto 3D facetado do Hero e de Compromissos, a pedido do usuário; markup do prisma, `symbol` SVG, estilos e referências de movimento foram eliminados.
- O restante do scroll editorial reversível foi preservado: título do Hero, réguas e títulos de seção, linha de progresso do Manifesto, régua de Números, watermarks e rodapé.

### Alterado

- Versão dos assets para `?v=2.0.7`, `package.json` para `2.0.7` e `BUILD_TIMESTAMP` para `2026-11-08.9`.

## [2.0.6] - 2026-11-08

### Adicionado

- Scroll cinematográfico global e reversível com `modules/scroll.js`: `--p` para os modos `hero`, `pin` e `cover` e `--pe` para a entrada de cada seção, atualizados por um único listener com `requestAnimationFrame`.
- Prisma facetado em CSS/SVG no Hero e em Compromissos, com rotação ligada ao progresso do scroll; escondido no mobile e em `prefers-reduced-motion`.
- Títulos e réguas de seção com assentamento curto, linha de progresso na mídia do Manifesto, régua na faixa de Números e watermarks editoriais em Negócios e Presença.
- O capítulo 01 do Manifesto volta a ser ativado quando a introdução da seção retorna à faixa central.

### Alterado

- O conteúdo mantém a revelação one-shot; apenas as camadas decorativas revertem ao subir.
- `IntersectionObserver` limita o cálculo de scroll às seções próximas, reduzindo leituras de layout.
- Versão dos assets para `?v=2.0.6`, `package.json` para `2.0.6` e `BUILD_TIMESTAMP` para `2026-11-08.8`.

### Preservado

- Catálogo, contato, formulário, PWA, início no topo e Manifesto sticky sem alteração estrutural.

## [2.0.5] - 2026-11-07

### Adicionado

- Manifesto editorial em três capítulos (Curadoria, Acesso, Proximidade) com mídia sticky, crossfade de imagens e contador 01/03.
- Navegação por `IntersectionObserver`, sem listener de scroll e sem alterar a arquitetura da página.
- No mobile, mídia estática e capítulos empilhados; em `prefers-reduced-motion`, tudo estático.

### Alterado

- Controles flutuantes de música e concierge ficam ocultos durante os capítulos para não cobrir o texto.
- Versão dos assets para `?v=2.0.5` e `package.json` para `2.0.5`.

## [2.0.4] - 2026-11-07

### Removido

- Seção "A experiência Miplace" e o mockup de celular 3D, a pedido do usuário; o layout anterior entre Manifesto e Números foi restaurado.
- CSS, JavaScript, chaves de i18n e referências documentais do showcase removidos.

### Mantido

- Início da página sempre no topo.
- Revelações por máscara, stagger, contador e demais animações de seção.
- Música, contato individual das lojas, formulário e catálogo intactos.

### Notas

- O estudo de um novo scroll premium está em elaboração com Íris, Afrodite e Atena; a direção aprovada será aplicada em uma próxima versão.

## [2.0.3] - 2026-11-07

### Adicionado

- Seção "A experiência Miplace" com celular 3D controlado pelo scroll: três slides, troca de imagens, contador e barra de progresso.
- Revelações por máscara e stagger entre as seções; título da experiência em PT/EN/ES.
- Página sempre inicia no topo: `scrollRestoration` manual e reset instantâneo no carregamento/volta do histórico.

### Alterado

- Controles flutuantes de música e concierge ficam ocultos na experiência e no contato para não cobrir conteúdo.
- O snap global foi removido porque puxava a página para 124 px; a sensação de slides fica no showcase do celular e nas transições de seção.
- Versão dos assets elevada para `?v=2.0.3` e `package.json` para `2.0.3`.

### Acessibilidade

- `prefers-reduced-motion` mostra os três slides estáticos, sem rotação do celular.
- Contador, slides e imagens têm estados `aria-hidden` coerentes.

## [2.0.2] - 2026-11-07

### Alterado

- Contato: lista individual das 4 lojas com WhatsApp e telefone, além do formulário com destino padrão `contasgeraljack@gmail.com`.
- Formulário: fallback por e-mail (`mailto`) e WhatsApp quando a API não estiver configurada.
- Hero: vídeo 1080×1080 com poster 1080, painel 1:1 e enquadramento sem corte; master 720p original mantido como fallback.
- Manifesto: imagem trocada para `honor/magic8lite-3.webp` (Honor Magic 8 Lite).
- Versão dos assets para `?v=2.0.2` e `package.json` para `2.0.2`.

### Notas

- O vídeo foi upscalado de 720p para 1080p com Lanczos; 4K real exige o master original em resolução maior.
- O envio automático do formulário para o Gmail depende de `RESEND_API_KEY` e `CONTACT_FROM_EMAIL` verificados na Vercel; sem isso, a API responde 503 e o site oferece e-mail/WhatsApp.

## [2.0.1] - 2026-11-07

### Alterado

- Hero sem moldura: o vídeo passou a ocupar o painel cinematográfico inteiro, com revelação por máscara, zoom lento e palavras animadas.
- Faixa de marcas em movimento entre o hero e o manifesto; títulos com revelação por máscara e stagger nos números e cards.
- Música de fundo restaurada com controle flutuante, volume baixo, fade-in e início apenas após interação do usuário.
- Loja Kassouf removida do grupo: agora são 4 lojas, 3 em Piracicaba e 1 em Amparo. Contagens, JSON-LD, FAQ, páginas legais e docs atualizados.
- Versão dos assets elevada para `?v=2.0.1` e `package.json` para `2.0.1`.

### Corrigido

- Service worker: scripts em network-first, CSS e MP3 fora do cache do worker e precache versionado.
- Contagem de lojas no bloco de números corrigida para 4.
- Concierge oculto no hero para não cobrir CTAs; aparece após o primeiro scroll.

## [2.0.0] - 2026-11-07

### Adicionado

- Home corporativa da Miplace Group com as seções A Miplace, Negócios, Marcas, Presença, Compromissos, Carreiras, Imprensa, Coleção e Contato.
- Páginas legais publicáveis: `privacidade.html`, `termos.html` e `acessibilidade.html`, com data de atualização e canal de contato pelo formulário.
- Documentação de entrega: `README.md`, `docs/olimpo/DOCS.md` e ampliação de `docs/olimpo/PENDENCIAS.md`.
- Camada corporativa em português, inglês e espanhol no módulo `modules/i18n.js`, carregada pelo `index.html`.
- Formulário de contato com validação, consentimento, honeypot e fallback por WhatsApp, integrado à API `POST /api/contact`.
- Declaração de acessibilidade com meta WCAG 2.2 AA, medidas adotadas, limitações conhecidas e canal para reportar barreiras.

### Alterado

- Posicionamento da marca de "catálogo local" para grupo de tecnologia, preservando a assinatura editorial Miplace Magazine na coleção.
- Navegação corporativa com âncoras estáveis e links para as páginas legais no rodapé.
- Identidade visual editorial: papel quente, tinta, oxblood e champagne; seções escuras em verde profundo.
- Experiência do catálogo preservada: 27 produtos, 9 marcas, busca, filtros, modal, lightbox e favoritos.
- Conteúdo institucional passou a usar linguagem de compromisso para temas ainda sem indicadores auditados.

### Corrigido

- Música de fundo restaurada com controle explícito, volume baixo e início apenas após interação.
- Ajustes de hierarquia de headings, foco visível e respeito a `prefers-reduced-motion`.
- Atualização das referências de cache dos assets para a versão 2.0.0.
- JSON-LD estático de `Organization`, `WebSite` e das 4 lojas, sem horários não confirmados.
- Service worker: URLs versionadas no precache e CSS fora do cache do worker para evitar resposta opaca no CSSOM.
- Rodapé com folga para os botões fixos e contraste AA no texto legal.
- Opções "Privacidade" e "Acessibilidade" no formulário e rótulo traduzido no fallback de WhatsApp.
- Hero sem moldura, com vídeo em painel cinematográfico, zoom lento, revelação por máscara e palavras animadas.
- Faixa de marcas em movimento e stagger nas seções, números e cards de negócios.
- Loja Kassouf removida do grupo: agora são 4 lojas, 3 em Piracicaba e 1 em Amparo.

### Segurança

- Headers de segurança e CSP mantidos em `vercel.json`.
- Formulário sem exposição de segredos no cliente; chaves da API permanecem no servidor.
- Política de privacidade passa a explicar coleta, finalidades, bases legais, retenção e direitos do titular.

### Notas

- Não há registro retroativo confiável das versões anteriores neste arquivo; o histórico está no Git do repositório.
- A versão de `package.json` é `2.0.0`; os assets usam `?v=2.0.0` e o `sw.js` usa `BUILD_TIMESTAMP` próprio.
- Razão social, CNPJ, encarregado de dados e prazos de retenção dependem de validação jurídica e estão registrados em `docs/olimpo/PENDENCIAS.md`.
- Textos legais são minutas sujeitas a revisão jurídica antes da publicação definitiva.
