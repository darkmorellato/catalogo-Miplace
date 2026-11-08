# REQUISITOS — Home corporativa Miplace Group

> Versão 1.0 · 2026-11-07 · Fonte: `docs/olimpo/BRIEFING.md` (aprovado) · Escopo: home corporativa, i18n, catálogo preservado, formulário e páginas legais.
> Premissa: nenhum dado de negócio fora do §2.1 do briefing. Lacunas marcadas em §5; não preencher com invenção.

## 1. Regras de negócio

| ID | Regra |
|---|---|
| RN-01 | Usar “até 24x no boleto, sem consulta”; proibido “sem juros”, “aprovação garantida”, “score” ou “parcela fixa”. |
| RN-02 | Só fatos do §2.1: 7 anos, 4 lojas, 2 cidades, 9 marcas, 28 produtos, 24x, Rockspace. Proibido criar executivos, CNPJ, prêmios, clientes, depoimentos, e-mails ou métricas. |
| RN-03 | Lacuna vira compromisso (“estamos estruturando”) ou `null`/`status: pendente`; registrar em `docs/olimpo/PENDENCIAS.md`. |
| RN-04 | `produtos.json` é a fonte canônica: 27 registros na entrega, sem alterar dados; preservar IDs e contratos do catálogo. |
| RN-05 | `stores.js` é a fonte canônica das 4 lojas; pode ganhar campos, não perder. Não criar endereço, telefone ou rede social. |
| RN-06 | PT-BR é padrão; EN e ES traduzem apenas a camada corporativa. Produtos, endereços e dados de `produtos.json` permanecem em PT. |
| RN-07 | Formulário exige consentimento; `website` é honeypot e deve chegar vazio; sem PII sensível em `localStorage`; falha da API oferece WhatsApp. |
| RN-08 | Razão social e CNPJ ausentes não podem ser inventados; páginas legais os marcam como pendentes até revisão jurídica. |
| RN-09 | Música só após interação; tema light-only; animações respeitam `prefers-reduced-motion`. |

## 2. Histórias de usuário

### RF-01 — Home corporativa navegável
**Como** visitante, **quero** percorrer a home por seções e âncoras estáveis, **para** encontrar informação sem rolar às cegas.

```gherkin
Cenário: seções e âncoras
  Dado que acesso "/"
  Quando percorro a página
  Então encontro as 11 seções do briefing com os IDs inicio, sobre, numeros, negocios, marcas, presenca, compromissos, carreiras, imprensa, catalogo e contato

Cenário: menu mobile
  Dado que estou em 360px
  Quando abro o menu, escolho uma seção e pressiono ESC
  Então o menu fecha, a página rola para a âncora e o foco retorna ao botão
```

### RF-02 — Hero, manifesto e números reais
**Como** visitante, **quero** entender a proposta e os indicadores do grupo, **para** confiar na marca.

```gherkin
Cenário: conteúdo aprovado e sem invenção
  Dado que acesso a home
  Quando leio hero, manifesto e faixa de números
  Então vejo o H1 "Tecnologia global. Cuidado local.", os 3 pilares e os indicadores 7 anos, 4 lojas, 9 marcas, 28 produtos, 24x e 2 cidades
  E não encontro CNPJ, executivo, prêmio, cliente, depoimento ou métrica fora do §2.1
```

### RF-03 — Negócios e marcas
**Como** visitante, **quero** entender as frentes do grupo e as marcas trabalhadas, **para** saber o que ele oferece.

```gherkin
Cenário: quatro frentes e nove marcas
  Dado que acesso as seções Negócios e Marcas
  Quando leio os cards e a parede tipográfica
  Então vejo Varejo, Crediário & Serviços, Digital & Curadoria e Parcerias, as 9 marcas e a nota Rockspace
  E a página usa tipografia, sem exibir logo de terceiro sem licença
```

### RF-04 — Presença e lojas reais
**Como** visitante, **quero** localizar as lojas e falar com a mais próxima, **para** visitar ou comprar.

```gherkin
Cenário: quatro lojas de stores.js
  Dado que a seção Presença carrega
  Quando a página renderiza os cards
  Então vejo as 4 lojas agrupadas em Piracicaba e Amparo, com endereço, CEP e canais vindos de stores.js
  E os links de mapa, WhatsApp, Instagram e Facebook abrem em nova aba com rel="noopener noreferrer"
```

### RF-05 — Compromissos
**Como** visitante, **quero** conhecer os compromissos do grupo, **para** avaliar sua postura.

```gherkin
Cenário: compromissos em evolução
  Dado que acesso a seção Compromissos
  Quando leio os quatro blocos
  Então vejo Acesso, Circularidade, Pessoas e Transparência com a nota "Compromissos em evolução"
  E não encontro número, meta, certificação ou prêmio de sustentabilidade
```

### RF-06 — Carreiras e imprensa
**Como** candidato ou jornalista, **quero** um caminho claro para falar com o grupo, **para** não cair em contato genérico.

```gherkin
Cenário: CTAs sem destino dedicado
  Dado que ainda não há e-mail de imprensa nem ATS
  Quando clico em "Banco de talentos" ou "Solicitar material"
  Então abro o formulário de contato com o assunto Carreiras ou Imprensa pré-selecionado
  E não encontro vaga, nome, e-mail ou telefone inventado
```

### RF-07 — Catálogo preservado
**Como** visitante, **quero** usar o catálogo como hoje, **para** pesquisar e escolher produtos.

```gherkin
Cenário: catálogo completo
  Dado que `produtos.json` tem 27 registros na entrega
  Quando a seção Coleção carrega
  Então a grade renderiza todos os produtos e busca, filtros, modal, lightbox e wishlist funcionam
  E `#products-grid`, `#category-filters`, `#search-input`, `#product-modal`, `#lightbox`, `#wishlist-drawer` e `window.renderProducts` continuam disponíveis
```

### RF-08 — Camada corporativa em PT/EN/ES
**Como** visitante internacional, **quero** ler a camada corporativa no meu idioma, **para** entender o grupo.

```gherkin
Cenário: troca e persistência
  Dado que estou na home em PT
  Quando seleciono EN ou ES no header ou footer
  Então os textos corporativos mudam sem reload, `<html lang>`, `<title>` e meta description são atualizados e a escolha persiste em `miplace-locale`

Cenário: fallback e escopo
  Dado que uma chave EN/ES está ausente
  Quando a página renderiza
  Então o texto cai para PT, sem chave crua visível; nomes de produtos e endereços continuam em PT
```

### RF-09 — Formulário de contato
**Como** visitante, **quero** enviar uma mensagem ao time certo, **para** tirar dúvidas, propor parceria ou falar com imprensa/carreiras.

```gherkin
Cenário: envio válido
  Dado que preencho nome, e-mail, assunto (Atendimento, Parcerias, Imprensa ou Carreiras), mensagem e aceito o consentimento
  Quando envio o formulário
  Então a página faz POST JSON em `/api/contact` com `{ name, email, phone, subject, message, consent, website }` e mostra confirmação em `aria-live`

Cenário: validação, honeypot e falha
  Dado que falta nome, e-mail, assunto, mensagem ou consentimento, o e-mail é inválido ou o honeypot está preenchido
  Quando tento enviar
  Então o envio é bloqueado com erro associado ao campo; se a API falhar, vejo mensagem clara e link de WhatsApp com texto pré-preenchido
```

### RF-10 — Páginas legais e rodapé
**Como** visitante, **quero** acessar privacidade, termos e acessibilidade, **para** saber como o site trata meus dados e minhas condições de uso.

```gherkin
Cenário: páginas publicadas e linkadas
  Dado que estou no rodapé
  Quando clico em Privacidade, Termos ou Acessibilidade
  Então abro `privacidade.html`, `termos.html` ou `acessibilidade.html`, com título, conteúdo e retorno à home
  E dados jurídicos ausentes aparecem como pendentes, sem valor inventado
```

## 3. Requisitos não funcionais

| ID | Categoria | Critério testável | Verificação |
|---|---|---|---|
| RNF-01 | Performance | LCP ≤ 2,5 s e CLS < 0,1 em 4G; Lighthouse mobile Performance ≥ 85; abaixo da dobra com lazy-load; sem biblioteca pesada nova | Lighthouse/WebPageTest em 360px e 1440px |
| RNF-02 | Acessibilidade | WCAG 2.2 AA; zero crítico/sério no axe; contraste ≥ 4,5:1; foco visível; alvos ≥ 44px; um `h1`; skip link; focus trap nos modais; `prefers-reduced-motion`; erros de formulário com `aria-live` | axe + inspeção manual por teclado e leitor de tela |
| RNF-03 | SEO | `title`/description únicos por idioma; canonical; OG/Twitter; JSON-LD `Organization` + `WebSite`; `sitemap.xml` com as páginas legais; `robots.txt` consistente | Rich Results Test + crawl local |
| RNF-04 | Segurança | Sem segredo no cliente; CSP e headers em `vercel.json`; validação também no servidor; honeypot; HTML dinâmico escapado; links externos com `noopener`; sem PII sensível em `localStorage` | Scan de headers + revisão do código + teste de abuso do formulário |
| RNF-05 | i18n | 3 locales; 100% das chaves corporativas traduzidas; nenhuma chave crua; fallback PT; persistência; `<html lang>`, `title` e description sincronizados | Script de troca de idioma + inspeção de chaves |
| RNF-06 | Responsividade | Layout íntegro em 360, 768, 1024 e 1440px; sem rolagem horizontal; menu mobile acessível; hierarquia preservada | Teste visual e de viewport |
| RNF-07 | Compatibilidade/PWA | Navegadores evergreen atuais e iOS/Android atuais; sem erro de console; SW e `offline.html` preservados; API não cacheada | Matriz de navegadores + teste offline |
| RNF-08 | Integridade de dados | 28 produtos, 9 marcas e 4 lojas vêm de `produtos.json`/`stores.js`; contagem confere; nenhum dado inventado; produtos em PT | `npm run validate:products` + `npm test` |

## 4. Matriz de rastreabilidade — seção → requisito

| Seção (ID) | Requisito | NFR |
|---|---|---|
| Hero (`inicio`) | RF-01, RF-02 | RNF-01, RNF-02, RNF-03 |
| Manifesto (`sobre`) | RF-02 | RNF-02, RNF-03 |
| Números (`numeros`) | RF-02 | RNF-02, RNF-08 |
| Negócios (`negocios`) | RF-03 | RNF-02, RNF-08 |
| Marcas (`marcas`) | RF-03 | RNF-02, RNF-08 |
| Presença (`presenca`) | RF-04 | RNF-01, RNF-02, RNF-06, RNF-08 |
| Compromissos (`compromissos`) | RF-05 | RNF-02, RNF-08 |
| Carreiras (`carreiras`) | RF-06 | RNF-02, RNF-04 |
| Imprensa (`imprensa`) | RF-06 | RNF-02, RNF-04 |
| Coleção (`catalogo`) | RF-07 | RNF-01, RNF-02, RNF-06, RNF-08 |
| Contato (`contato`) | RF-09 | RNF-02, RNF-04, RNF-06 |
| Rodapé/páginas legais | RF-10 | RNF-03, RNF-04, RNF-08 |
| Global/i18n | RF-08 | RNF-05 |

## 5. Lacunas e decisões pendentes

| ID | Lacuna | Impacto | Ação necessária |
|---|---|---|---|
| L-01 | Razão social e CNPJ | Rodapé, JSON-LD e páginas legais | Cliente informar dados oficiais |
| L-02 | E-mail/ATS de carreiras e imprensa | CTAs de RF-06 | Definir destino ou manter fallback para contato |
| L-03 | `hreflang` e URLs por idioma | SEO de EN/ES limitado com i18n client-side | Decidir evolução para rotas/SSG; registrar dívida |
| L-04 | Provedor de envio e deploy de `api/contact` | RF-09 depende de `RESEND_API_KEY`/SMTP | Definir provedor e configurar env |
| L-05 | Licença dos logos das marcas e fotos reais | Parede de marcas e Manifesto/Presença | Confirmar licenças; manter tipografia/omitir |
| L-06 | Analytics e política de cookies | Privacidade e RNF-03 | Definir ferramenta antes de medir; hoje não há cookies |

## 6. Fora de escopo desta entrega

Checkout, pagamento online, CMS, blog, login, dark mode automático, operação internacional e vagas reais. A camada “global” é comunicada por idiomas, marcas e padrão de atendimento, não por escritórios inexistentes.

---

**Gate de release (mínimo):** catálogo intacto com 28 produtos e contratos preservados; PT/EN/ES funcional com fallback e persistência; formulário válido, com honeypot, POST correto e fallback por WhatsApp.
