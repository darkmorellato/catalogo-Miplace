# Miplace Group — site corporativo e catálogo

Site institucional e catálogo digital da Miplace Group, grupo de varejo de tecnologia com operação em Piracicaba e Amparo (SP). A versão 2.0.10 mantém o reposicionamento corporativo, o scroll editorial reversível, o áudio com início no primeiro clique e o formulário com fallback de envio, sem objeto 3D, sem remover o catálogo, a busca, os filtros e a experiência de compra assistida.

- **Produção:** https://miplacemagazine.com.br/
- **Versão de entrega:** 2.0.10 (8 de novembro de 2026)
- **Stack:** HTML, CSS e JavaScript vanilla, Tailwind CSS v4, PWA e Vercel
- **Idioma padrão:** português (Brasil), com camada corporativa em inglês e espanhol

## Visão

A Miplace reúne marcas globais de smartphones, tablets e acessórios com curadoria, parcelamento em até 24x no boleto e atendimento presencial. O site cumpre dois papéis:

1. apresentar o grupo, as lojas, as marcas e os compromissos institucionais;
2. manter o catálogo consultivo que o cliente já conhece, com busca, filtros, detalhes do produto, galeria e lista de favoritos.

O catálogo é informativo. A compra e a contratação do parcelamento acontecem nas lojas físicas ou pelos canais de atendimento autorizados.

## O que está incluído

- Home corporativa com as seções A Miplace, Negócios, Marcas, Presença, Compromissos, Carreiras, Imprensa, Coleção e Contato.
- Catálogo com 27 produtos, 9 marcas e filtros por marca e categoria.
- Busca, modal de produto, galeria com lightbox e lista de favoritos local.
- Páginas legais: [Privacidade](privacidade.html), [Termos de uso](termos.html) e [Acessibilidade](acessibilidade.html), em versão 1.0 sujeita a revisão jurídica.
- Camada corporativa PT/EN/ES em `modules/i18n.js`, carregada no `index.html`.
- Formulário de contato com validação, consentimento, honeypot e fallback por WhatsApp e e-mail, integrado à API `POST /api/contact`.
- PWA com service worker e página offline.
- SEO básico com metadados, JSON-LD, canonical e sitemap.

## Stack

| Camada | Tecnologia | Observação |
|---|---|---|
| Interface | HTML5, CSS e JavaScript vanilla | Sem framework de UI; módulos IIFE e ES module |
| Estilos | Tailwind CSS v4 + `styles.css` | `tailwind.css` é gerado por `npm run build:css` |
| Tipografia e ícones | Google Fonts e Font Awesome | Carregados por CDN; dependem de rede |
| Dados | `produtos.json` e `stores.js` | Fontes canônicas de produtos e lojas |
| PWA | `sw.js`, `favicon_io/site.webmanifest` | Cache versionado por `BUILD_TIMESTAMP` |
| API de contato | Vercel Node.js 22 + Resend | `api/contact.js`, sem persistência local |
| Deploy | Vercel | `vercel.json` define headers, cache e CSP |
| Qualidade | ESLint, TypeScript via JSDoc, scripts de validação | `npm run lint`, `npm run typecheck`, `npm test` |

## Estrutura

```text
catalogo-Miplace-main/
├── index.html                  # home corporativa + catálogo
├── privacidade.html            # política de privacidade (LGPD)
├── termos.html                 # termos de uso
├── acessibilidade.html         # declaração de acessibilidade
├── app.js                      # orquestrador da aplicação
├── stores.js                   # dados canônicos das 4 lojas
├── produtos.json               # dados canônicos dos 27 produtos
├── styles.css                  # estilos editoriais e componentes
├── tailwind.css                # build gerado do Tailwind
├── src/input.css               # fonte do Tailwind
├── modules/
│   ├── ui.js                   # utilidades compartilhadas
│   ├── i18n.js                 # camada corporativa PT/EN/ES
│   ├── corporate.js            # comportamento da home corporativa
│   ├── catalog.js              # filtros, busca e grade de produtos
│   ├── modal.js                # modal e lightbox
│   ├── wishlist.js             # favoritos em localStorage
│   └── three-hero.js           # experiência 3D progressiva
├── api/contact.js              # API de contato (Vercel + Resend)
├── types/                      # tipos globais em JSDoc
├── scripts/                    # validação, snapshot e imagens
├── docs/olimpo/                # documentação de entrega e pendências
├── sw.js                       # service worker
├── vercel.json                 # headers, cache e CSP
└── package.json
```

## Requisitos

- Node.js 20 ou superior e npm.
- Navegador moderno com JavaScript habilitado.
- Conexão com a internet para Google Fonts, Font Awesome e WhatsApp.

## Instalação e desenvolvimento

```bash
npm install
npm run dev
```

`npm run dev` executa o watch do Tailwind e um servidor local. Para gerar apenas o CSS:

```bash
npm run build:css
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Watch do Tailwind + servidor local |
| `npm run serve` | Serve a pasta atual com `npx serve .` |
| `npm run build:css` | Gera `tailwind.css` minificado |
| `npm run lint` | Executa o ESLint em JS |
| `npm run lint:fix` | Corrige automaticamente o que for seguro |
| `npm run typecheck` | Checa JavaScript com TypeScript strict via JSDoc |
| `npm run validate:products` | Valida `produtos.json` e a existência das imagens |
| `npm run test:snapshot` | Testa IDs, marcas, WhatsApp e galerias do catálogo |
| `npm test` | Valida produtos + snapshot |
| `npm run build` | Pipeline completo: produtos → lint fix → typecheck → CSS |

> `npm run build` executa `lint:fix` e pode reescrever arquivos JS. Revise o diff antes de commitar.

## Build e deploy

O deploy é estático na Vercel, com `outputDirectory: "."` em `vercel.json`. Não há bundling de HTML ou JavaScript: o build local valida os dados, roda lint/typecheck e gera o CSS.

```bash
npm run build
npm test
```

Antes de publicar, confirme que o `sitemap.xml` inclui `privacidade.html`, `termos.html` e `acessibilidade.html`. Os links do rodapé já estão implementados; a atualização do sitemap está registrada em `docs/olimpo/PENDENCIAS.md`.

## Internacionalização (i18n)

A camada corporativa PT/EN/ES está implementada em `modules/i18n.js` e carregada pelo `index.html`.

- Textos traduzíveis usam `data-i18n`; atributos usam `data-i18n-attr`.
- O idioma inicial é `pt-BR` e a preferência é persistida em `localStorage` na chave `miplace-locale`.
- O módulo atualiza `<html lang>`, `<title>` e a meta description ao trocar de idioma.
- Chaves ausentes caem para português.
- Nomes de produtos, endereços e dados de `produtos.json` permanecem em português nesta versão.
- O seletor `PT · EN · ES` usa `aria-pressed` e está disponível no header e no footer.

O catálogo e os dados de produto permanecem em português; a tradução alcança apenas a camada corporativa.

## Contato

O formulário da seção `#contato` envia `POST /api/contact` com JSON:

```json
{
  "name": "Nome",
  "email": "email@exemplo.com",
  "phone": "telefone",
  "subject": "assunto",
  "message": "mensagem",
  "consent": true,
  "website": ""
}
```

`website` é um campo honeypot e deve permanecer invisível para pessoas. Em caso de falha da API, a interface deve oferecer fallback por WhatsApp e e-mail com mensagem clara.

A API está implementada em `api/contact.js` (Vercel Node.js 22) e usa as variáveis:

```bash
RESEND_API_KEY=...
CONTACT_TO_EMAIL=contasgeraljack@gmail.com  # opcional; este é o padrão
CONTACT_FROM_EMAIL=...                      # remetente verificado no Resend
```

Sem `RESEND_API_KEY` e `CONTACT_FROM_EMAIL`, a API responde `503` e a interface mantém o fallback por e-mail/WhatsApp. O modelo está em `.env.example`. Nenhum segredo deve ser exposto no cliente.

Canais oficiais: formulário em `index.html#contato`, WhatsApp individual das 4 lojas e endereços em `index.html#presenca` e em `stores.js`.

## Acessibilidade

A meta é WCAG 2.2 nível AA, com HTML semântico, um único `h1` por página, navegação por teclado, foco visível, contraste adequado, textos alternativos, alvos de toque ampliados e respeito a `prefers-reduced-motion`.

A declaração completa, incluindo limitações conhecidas e canal para reportar barreiras, está em [acessibilidade.html](acessibilidade.html). Não há certificação externa de acessibilidade nesta versão.

## Dados e privacidade

- `produtos.json` é a fonte canônica dos produtos. Não altere dados de produto sem rodar `npm run validate:products` e `npm run test:snapshot`.
- `stores.js` é a fonte canônica das lojas. Novos campos são permitidos; a remoção de dados existentes não é.
- Dados pessoais enviados pelo formulário seguem a [Política de Privacidade](privacidade.html).
- A lista de favoritos e o idioma ficam no `localStorage` do navegador e não são enviados ao servidor.

## Documentação

O índice completo, o processo de manutenção e o glossário PT/EN/ES estão em [docs/olimpo/DOCS.md](docs/olimpo/DOCS.md).

- [Briefing mestre](docs/olimpo/BRIEFING.md)
- [Checklist de integração](docs/olimpo/INTEGRACAO.md)
- [Pendências e dados que não podem ser inventados](docs/olimpo/PENDENCIAS.md)

## Créditos

- **Concepção, conteúdo e operação:** Miplace Group.
- **Documentação de entrega:** equipe Olímpo.
- **Marcas:** Apple/iPhone, Samsung, Motorola, Realme, Honor, Redmi, Poco, Infinix e Tecno pertencem aos seus respectivos proprietários. Acessórios e proteção Rockspace seguem a mesma regra.
- **Imagens de produtos:** usadas para identificação dos modelos; direitos reservados aos titulares.

## Licença

Conteúdo proprietário. Todos os direitos reservados. A reprodução de textos, layout e identidade visual não é permitida sem autorização, salvo uso pessoal ou citação com atribuição.
