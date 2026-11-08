# Documentação — Miplace Group

Este é o índice da documentação de entrega do site corporativo e catálogo da Miplace Group. A documentação é versionada junto com o código e deve ser atualizada no mesmo pull request que altera comportamento, dados ou contratos.

## 1. Documentos atuais

| Documento | Conteúdo | Dono | Status |
|---|---|---|---|
| [`README.md`](../../README.md) | Visão, stack, estrutura, comandos, deploy, i18n, contato e créditos | Mnemósine | Entregue |
| [`CHANGELOG.md`](../../CHANGELOG.md) | Histórico de versões no formato Keep a Changelog | Mnemósine | Entregue |
| [`BRIEFING.md`](BRIEFING.md) | Escopo, posicionamento, copy aprovada, arquitetura de informação e regras | Zeus | Aprovado |
| [`INTEGRACAO.md`](INTEGRACAO.md) | Checklist de integração e riscos conhecidos | Zeus | Ativo |
| [`PENDENCIAS.md`](PENDENCIAS.md) | Dados reais que o site não pode inventar e bloqueios de publicação | Todos | Vivo |
| [`privacidade.html`](../../privacidade.html), [`termos.html`](../../termos.html), [`acessibilidade.html`](../../acessibilidade.html) | Textos legais publicáveis | Mnemósine | Minuta 1.0 — revisão jurídica pendente |
| `DOCS.md` | Este índice, processo de manutenção e glossário | Mnemósine | Entregue |

## 2. Documentos por frente

Os arquivos abaixo foram publicados pelas frentes responsáveis na pasta `docs/olimpo/` e devem ter o status revisado na integração final.

| Documento | Frente | Dono | Status |
|---|---|---|---|
| [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) | Tokens, componentes, tipografia e acessibilidade visual | Íris | Entregue |
| [`PLANO_PROJETO.md`](PLANO_PROJETO.md) | Escopo, cronograma, riscos e priorização | Hera | Entregue |
| [`REQUISITOS.md`](REQUISITOS.md) | Jornadas, requisitos e critérios de aceite | Apolo | Entregue |
| [`ARQUITETURA.md`](ARQUITETURA.md) | Estrutura, módulos, fluxo de dados e decisões técnicas | Atena | Entregue |
| [`API_CONTATO.md`](API_CONTATO.md) | Contrato de `/api/contact`, erros e fallback | Hefesto | Entregue |
| [`PWA_MOBILE.md`](PWA_MOBILE.md) | Service worker, offline, instalabilidade e mobile | Daedalus | Entregue |
| [`DADOS.md`](DADOS.md) | Modelo de `produtos.json`, `stores.js` e `content/company.json` | Hades | Entregue |
| [`ANALYTICS.md`](ANALYTICS.md) | Eventos, ferramenta escolhida e privacidade | Deméter | Entregue |
| [`SEGURANCA.md`](SEGURANCA.md) | CSP, headers, threat model e tratamento de incidentes | Ártemis | Entregue |
| [`DEVOPS.md`](DEVOPS.md) | CI, deploy, rollback e cache | Hermes | Entregue |
| [`INFRA.md`](INFRA.md) | Hospedagem, domínio, CDN e continuidade | Atlas | Entregue |
| [`QA.md`](QA.md) | Plano de testes, acessibilidade e evidências | Argos | Entregue |
| `IA.md` | Concierge, dados, prompts, limites e privacidade | Hécate | A integrar |

## 3. Como manter

### Fonte de verdade

- **Comportamento do site:** código em `index.html`, `modules/`, `app.js` e `stores.js`.
- **Produtos:** `produtos.json`; não editar manualmente sem rodar `npm run validate:products` e `npm run test:snapshot`.
- **Lojas:** `stores.js`; novos campos são permitidos, remoções não.
- **Escopo e copy:** `BRIEFING.md`.
- **Lacunas e dados ausentes:** `PENDENCIAS.md`. Nunca preencher lacuna com dado fictício.
- **Textos legais:** as páginas `privacidade.html`, `termos.html` e `acessibilidade.html` são a versão publicada; a minuta e as decisões ficam registradas neste repositório e nas pendências.

### Quando atualizar

Atualize a documentação no mesmo PR quando:

- uma seção, página ou rota for criada, removida ou renomeada;
- um contrato de API, campo de formulário ou variável de ambiente mudar;
- um dado canônico (`produtos.json`, `stores.js`) for alterado;
- uma decisão de arquitetura, segurança ou privacidade for tomada;
- uma versão for publicada;
- uma pendência for resolvida ou uma nova lacuna for identificada.

### Checklist de PR

- [ ] O comportamento descrito na doc corresponde ao código.
- [ ] Links internos e externos funcionam.
- [ ] Nenhum segredo, token, senha, hash ou dado pessoal foi incluído.
- [ ] A página alterada tem dono e data de revisão.
- [ ] `PENDENCIAS.md` foi atualizado quando faltar dado real.
- [ ] Textos legais foram marcados para revisão jurídica quando aplicável.
- [ ] `CHANGELOG.md` foi atualizado em mudanças relevantes.

### Padrão editorial

- Português (Brasil) como idioma padrão; inglês e espanhol apenas na camada corporativa.
- Frases curtas, tom executivo e humano, sem superlativos vazios.
- Datas por extenso em páginas legais; ISO (`AAAA-MM-DD`) em documentação técnica.
- Nomes de arquivos, comandos e caminhos em `code`.
- Não copiar texto de concorrentes. Não inventar prêmios, certificações, números, CNPJ, e-mails ou depoimentos.
- Conteúdo legal é minuta até aprovação jurídica registrada em `PENDENCIAS.md`.

### Revisão e versionamento

- Cada documento tem um dono indicado na tabela.
- Revisão editorial a cada release; revisão de conteúdo legal antes de qualquer publicação.
- A documentação acompanha a versão do site (2.0.12 nesta entrega).
- O histórico de mudanças do produto fica no `CHANGELOG.md`; o histórico detalhado de implementação fica no Git.

## 4. Glossário PT/EN/ES

Termos recorrentes na camada corporativa e nas páginas legais.

| Português (BR) | English | Español | Uso |
|---|---|---|---|
| Grupo | Group | Grupo | Marca corporativa Miplace Group |
| Varejo | Retail | Comercio minorista | Frente de lojas físicas |
| Crediário | In-house financing | Crédito propio | Parcelamento próprio da loja |
| Curadoria | Curation | Curaduría | Seleção de marcas e modelos |
| Presença | Presence | Presencia | Seção de lojas e cidades |
| Compromissos | Commitments | Compromisos | Seção de temas em evolução |
| Acessibilidade | Accessibility | Accesibilidad | Declaração e práticas do site |
| Privacidade | Privacy | Privacidad | Política e tratamento de dados |
| Termos de uso | Terms of use | Términos de uso | Condições de navegação |
| Lojas | Stores | Tiendas | Unidades físicas |
| Atendimento | Customer service | Atención al cliente | Canal de contato |
| Parcelamento | Installments | Cuotas | Condição de pagamento |
| Boleto | Bank slip | Boleta bancaria (Brasil) | Meio de pagamento |
| Sem consulta | No credit check | Sin consulta de crédito | Condição comercial |
| Garantia | Warranty | Garantía | Cobertura do produto |
| Consumidor | Consumer | Consumidor | Titular de direitos do CDC |
| Titular dos dados | Data subject | Titular de los datos | Pessoa natural na LGPD |
| Encarregado de dados | Data protection officer (DPO) | Delegado de protección de datos | Canal de privacidade |
| Segurança | Security | Seguridad | Proteção de dados e do site |
| Marcas | Brands | Marcas | Fabricantes representadas |
| Produtos | Products | Productos | Itens do catálogo |
| Catálogo | Catalog | Catálogo | Coleção consultiva |

## 5. Registro de revisões

| Versão | Data | Mudança | Responsável |
|---|---|---|---|
| 1.0 | 2026-11-07 | Criação do índice, processo de manutenção e glossário | Mnemósine |
