# DADOS — camada de conteúdo corporativo

> **Arquivo:** `content/company.json`
> **Contrato:** `content/schema/company.schema.json` (JSON Schema draft 2020-12)
> **Versão:** 0.1.0 — 2026-11-07
> **Responsável:** Hades (dados/DBA). Consumo: Afrodite (frontend), Mnemósine (textos), Deméter (BI).

## 1. Objetivo

`company.json` é a fonte única dos **fatos corporativos** do site Miplace Group: identidade, posicionamento, números, unidades de negócio, marcas, condições comerciais, lojas (snapshot), canais, compromissos, governança, internacional e links.

Ele **não substitui** `produtos.json` nem `stores.js`. Produtos continuam em `produtos.json`; lojas continuam em `stores.js`. Este arquivo apenas expõe a camada corporativa de forma validável e sem dados inventados.

## 2. Fontes de verdade

| Fonte | Autoridade | O que fornece | Não pode |
|---|---|---|---|
| `produtos.json` | Canônica de produtos | 28 produtos, 9 marcas, preços, specs, imagens | Ser alterado por esta camada |
| `stores.js` | Canônica de lojas | 4 lojas, endereços, telefones, WhatsApp, Instagram, Facebook, geolocalização | Perder campos; é editado por Afrodite |
| `docs/olimpo/BRIEFING.md` | Aprovada por Zeus | Posicionamento, copy, fatos permitidos, proibições | Ser contrariada |
| `index.html` | Site atual | Domínio, canonical, texto de 7 anos e condições do boleto | Ser fonte de dados jurídicos |
| `content/company.json` | Derivada | Camada corporativa pronta para consumo | Inventar ou duplicar produtos/lojas |

Hierarquia em conflito: **produtos.json / stores.js > briefing > index.html > company.json**. Se um fato divergir, prevalece a fonte canônica e a divergência vira pendência.

## 3. Convenções

### 3.1 Status

| Status | Significado |
|---|---|
| `confirmado` | Existe fonte verificável e o dado está pronto para publicar |
| `parcial` | O bloco tem parte confirmada e parte pendente |
| `pendente` | O dado não existe em nenhuma fonte; valor `null` |
| `em_evolucao` | Compromisso declarado, sem métrica ou meta pública |
| `planejado` | Estrutura definida no briefing, ainda não publicada |

### 3.2 Regras de preenchimento

1. Dado ausente = `null`, nunca `""`, `"N/A"` ou texto inventado.
2. Todo `null` precisa aparecer em `_meta.pending` e, quando for dado do cliente, em `docs/olimpo/PENDENCIAS.md`.
3. Todo bloco com `null` tem `status: "parcial"` ou `"pendente"`.
4. Todo fato precisa de `source` com `arquivo:linha`, `arquivo` ou URL + data de captura.
5. `validUntil` é de 90 dias. Após essa data, revalidar antes de publicar.
6. `schemaVersion` só muda em breaking change; `contentVersion` muda a cada edição de conteúdo.
7. Não gravar dados pessoais, credenciais, CNPJ, e-mails ou telefones novos sem fonte e autorização.

## 4. Dicionário de dados

| Caminho | Tipo | Origem | Regra de atualização |
|---|---|---|---|
| `_meta.schemaVersion` | string semver | Este contrato | Mudar só em quebra de schema |
| `_meta.contentVersion` | string semver | Este arquivo | Incrementar a cada edição |
| `_meta.status` | status | Agregação | `parcial` enquanto houver pendência |
| `_meta.generatedAt` | date | Geração | Data da primeira criação |
| `_meta.updatedAt` | date | Edição | Data da última alteração |
| `_meta.validUntil` | date | Revisão | `updatedAt` + 90 dias |
| `_meta.sources[]` | array | Arquivos reais | Incluir `id`, `path`, `capturedAt` |
| `_meta.pending[]` | array | Lacunas | Sincronizar com todo `null` |
| `identity.legalName` | string \| null | PENDENCIAS #1 | Razão social oficial; hoje `null` |
| `identity.corporateBrand` | string | Briefing §2 | “Miplace Group” |
| `identity.retailBrand` | string | Briefing §2 | “Miplace” |
| `identity.editorialSignature` | string | Briefing §2 | “Miplace Magazine” |
| `identity.cnpj` | string \| null | PENDENCIAS #1 | 14 dígitos, sem máscara; hoje `null` |
| `identity.foundationYear` | integer \| null | PENDENCIAS #2 | Ano de fundação; hoje `null` |
| `tagline` | string | Briefing §2 | “Tecnologia global. Cuidado local.” |
| `descriptor` | string | Briefing §2 | Descritor aprovado |
| `positioning.category` | string | Briefing §2 | Categoria corporativa |
| `positioning.attributes` | string[] | Briefing §2 | Curadoria, acesso, proximidade |
| `positioning.tone` | string[] | Briefing §2 | Diretriz de tom, não copy |
| `positioning.languages` | enum[] | Briefing §5 | `pt-BR`, `en`, `es` |
| `positioning.primaryLocale` | enum | Briefing §5 | `pt-BR` |
| `facts.yearsInMarket` | integer | index.html:234 | Revisar anualmente; hoje 7 |
| `facts.stores` | integer | stores.js | Contagem de lojas; hoje 5 |
| `facts.cities` | integer | stores.js | Cidades distintas; hoje 2 |
| `facts.brands` | integer | produtos.json | Marcas distintas; hoje 9 |
| `facts.products` | integer | produtos.json | Produtos no array; hoje 27 |
| `facts.asOf` | date | Produtos/stores | Data da contagem |
| `businessUnits.items[]` | objeto[] | Briefing §2.4 | 4 frentes aprovadas |
| `brands.items[]` | objeto[] | produtos.json + briefing | 9 marcas; `catalogBrand` liga à marca do catálogo |
| `brands.accessories[]` | objeto[] | Briefing §2.1 | Rockspace; sem itens em produtos.json |
| `commerce.installments.max` | integer | Briefing §2.1 | 24 |
| `commerce.installments.method` | enum | Briefing §2.1 | `boleto` |
| `commerce.installments.creditCheck` | boolean | Briefing §2.1 | `false` = sem consulta |
| `commerce.notes[]` | string[] | index.html:304 | Condições e ressalvas |
| `stores.canonicalSource` | string | stores.js | Sempre `stores.js` |
| `stores.items[]` | objeto[] | stores.js:7-93 | Snapshot; não editar dado de loja aqui |
| `stores.items[].openingHours` | objeto \| null | Nenhuma fonte | Horário real por loja; hoje `null` |
| `channels.website.url` | URL | index.html:33 | Domínio canônico |
| `channels.contactForm` | objeto | Briefing §6 | `POST /api/contact`; status planejado |
| `channels.storeWhatsapp` | objeto | stores.js | Link `wa.me/{whatsapp}` |
| `channels.storeInstagram` | objeto | stores.js | Perfil por loja |
| `channels.storeFacebook` | objeto | stores.js | Página por loja |
| `channels.generalEmail` | string \| null | Nenhuma fonte | E-mail geral; hoje `null` |
| `channels.generalPhone` | string \| null | Nenhuma fonte | Telefone geral; hoje `null` |
| `channels.press` | objeto | PENDENCIAS #5 | E-mail, telefone e kit; hoje `null` |
| `channels.careers` | objeto | PENDENCIAS #6 | E-mail e ATS; hoje `null` |
| `commitments.items[]` | objeto[] | Briefing §2.4 | 4 compromissos, sem métricas |
| `commitments.metricsStatus` | status | Briefing §2.4 | `pendente` até métricas auditadas |
| `governance.leadership` | string \| null | PENDENCIAS #3 | Nomes/cargos; hoje `null` |
| `governance.board` | string \| null | PENDENCIAS #3 | Conselho; hoje `null` |
| `international.operation` | string \| null | PENDENCIAS #4 | Operação internacional; hoje `null` |
| `international.confirmedCountries` | string[] | stores.js | Só `BR` confirmado |
| `international.ambition` | enum | Briefing §2.3 | `global` como posicionamento |
| `links.catalog` | string | Briefing §3 | `#catalogo` |
| `links.stores` | string | Briefing §3 | `#presenca` |
| `links.legal.*` | string | Briefing §3 | Caminhos planejados das páginas legais |
| `links.press` / `links.careers` | string | Briefing §3 | `#imprensa` / `#carreiras` |

## 5. Como `produtos.json` se relaciona

- `produtos.json` é um **array** de 27 objetos. Campos relevantes: `id`, `brand`, `name`, `image`, `price`, `description`, `specs`, `highlights`, `gallery`, `category` (opcional; `Tablet` explícito, `Celular` implícito), `specialPrice`, `highlight`.
- `company.json` **não copia** nome, preço, foto ou spec de produto. Copiar criaria duas verdades.
- `facts.products` é apenas a contagem no momento de `facts.asOf`; se o catálogo mudar, atualizar a contagem e a data.
- `facts.brands` é a contagem de `brand` distintos. Hoje: Realme, Honor, Motorola, Redmi, Poco, iPhone, Samsung, Infinix, Tecno = 9.
- `brands.items[].catalogBrand` faz a ponte: a marca corporativa **Apple** corresponde ao valor `iPhone` em `produtos.json`. As demais são iguais.
- A parede corporativa de marcas usa `brands.items[].name`; o catálogo continua filtrando por `produtos.json.brand`.
- Produtos permanecem em PT-BR nesta versão; não traduzir `name`, `description` ou `specs` no i18n.

## 6. Como `stores.js` se relaciona

- `stores.js` contém `STORES` com 4 lojas e é a fonte canônica. `company.json.stores.items` é um **snapshot** para consumo corporativo, com os mesmos IDs, endereços, contatos e geolocalização.
- `company.json` não edita `stores.js`. Mudou loja? Afrodite atualiza `stores.js` preservando todos os dados; Hades reflete o snapshot e atualiza `_meta.updatedAt`.
- `stores.js` não tem horário por loja. O JSON-LD em `stores.js:200-203` usa horário fixo (seg–sex 09–18, sáb 09–13) **não confirmado**; por isso `openingHours` é `null` em todas as lojas.
- O link de mapa é derivado de `address.mapsQuery`; o link de WhatsApp é `https://wa.me/{whatsapp}`. Não gravar URL de mapa “nova”.
- `company.json.stores.count` e `cities[].storeCount` precisam bater com `STORES`: 4 lojas, 3 em Piracicaba, 1 em Amparo.

## 7. Processo de atualização

1. Identificar a fonte canônica do fato (`produtos.json`, `stores.js`, briefing ou documento jurídico).
2. Alterar `company.json` apenas no campo correspondente; não duplicar dados de produto/loja.
3. Atualizar `source`, `status`, `_meta.pending`, `_meta.updatedAt` e `_meta.validUntil`.
4. Se o fato for do cliente e continuar ausente, registrar/atualizar em `docs/olimpo/PENDENCIAS.md`.
5. Validar com o comando da seção 8.
6. Em caso de breaking change, subir `schemaVersion`; caso contrário, subir `contentVersion` (patch/minor).
7. Revisão trimestral obrigatória, mesmo sem mudança: revalidar `validUntil` e fontes.

## 8. Validação

```bash
cd /home/dark/Desktop/codes/catalogo-Miplace-main
node -e "
const fs=require('fs');
const Ajv2020=require('ajv/dist/2020');
const schema=JSON.parse(fs.readFileSync('content/schema/company.schema.json','utf8'));
const data=JSON.parse(fs.readFileSync('content/company.json','utf8'));
const validate=new Ajv2020({allErrors:true,strict:false}).compile(schema);
if(validate(data)) console.log('OK: company.json válido');
else { console.error(JSON.stringify(validate.errors,null,2)); process.exit(1); }
"
```

Resultado esperado: `OK: company.json válido`. O comando só lê os dois arquivos; não altera nada.

## 9. LGPD e segurança

- Este arquivo contém apenas dados públicos de empresa e de lojas. Não há CPF, e-mail pessoal, senha, token ou dado de cliente.
- `cnpj`, `legalName`, e-mails e telefones novos permanecem `null` até o cliente enviar e autorizar.
- Nomes de liderança e conselho não podem ser publicados sem autorização de uso (PENDENCIAS #3).
- O site deve consumir `company.json` como dado público; qualquer campo futuro com PII precisa de classificação e base legal antes de entrar aqui.

## 10. Histórico

| Data | Versão | Mudança |
|---|---|---|
| 2026-11-07 | 0.1.0 | Criação da camada corporativa, schema draft 2020-12 e dicionário; lacunas marcadas como pendentes |
