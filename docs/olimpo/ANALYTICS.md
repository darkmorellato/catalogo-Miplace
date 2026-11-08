# Analytics — Miplace

**Status:** módulo pronto para integração. O `index.html` não foi alterado; o snippet está na seção 6.
**Arquivo:** `modules/analytics.js` · **Versão:** 1.0.0

## 1. Princípios

- Sem cookies, sem `fetch`, sem bibliotecas externas e sem criar `window.dataLayer`.
- Sem PII: e-mail, telefone, nome de pessoa, CPF/CNPJ, endereço, mensagem e termo de busca nunca são enviados.
- Opt-out local em `localStorage['miplace-analytics-optout']` e respeito a `Do Not Track` / `Global Privacy Control`.
- Dois pontos de saída: `window.dataLayer` (se existir) e o evento `miplace:analytics`.
- Payload limitado: no máximo 20 props, chave de 40 caracteres, string de 120 e JSON de 2.048 bytes.
- A sessão/usuário é responsabilidade do provedor (GA4, Plausible, Matomo). O módulo não cria `session_id` nem cookie.

## 2. API

### `window.MiplaceAnalytics.track(name, props)`

Registra um evento e retorna `true` quando ele foi emitido; retorna `false` se o consentimento estiver negado ou o evento for inválido.

```js
window.MiplaceAnalytics.track('view_item', {
  item_id: '1',
  item_name: 'REALME P4 LITE',
  item_brand: 'Realme',
  item_category: 'Celular'
});
```

- `name` vira `snake_case`; nomes fora do padrão são normalizados.
- `props` aceita apenas `string`, `number`, `boolean` ou `null`; objetos e arrays são descartados.
- Chaves reservadas (`event`, `event_id`, `timestamp`, `page_path`, `section`) são controladas pelo módulo.
- O payload final inclui `event`, `event_id`, `timestamp`, `page_path`, `section` e as props limpas.

### `window.MiplaceAnalytics.page(section)`

Atualiza a seção atual e emite `page_view` com `section`. Use no carregamento inicial, em `hashchange` ou quando uma seção entrar na viewport.

```js
window.MiplaceAnalytics.page('catalogo');
```

### `window.MiplaceAnalytics.consent`

```js
window.MiplaceAnalytics.consent.granted; // boolean
window.MiplaceAnalytics.consent.status(); // 'granted' | 'denied'
window.MiplaceAnalytics.consent.revoke(); // grava o opt-out
window.MiplaceAnalytics.consent.grant();  // remove o opt-out
window.MiplaceAnalytics.consent.set(false);
```

- `revoke()` grava `localStorage['miplace-analytics-optout'] = '1'`.
- `grant()` remove a chave. Se `Do Not Track` ou `Global Privacy Control` estiverem ativos, `granted` continua `false`: é um bloqueio do navegador, não do site.
- `miplace:analytics-consent` é emitido com `detail.granted` para a UI ou para um provedor externo reagir.

### Compatibilidade

O módulo também substitui `window.trackEvent` por `track`, então as chamadas existentes em `catalog.js:56` (`filter_brand`) e `modal.js:244` (`view_item`) passam a funcionar sem edição. Carregue `modules/analytics.js` **depois** de `modules/ui.js` e **antes** de `modules/catalog.js`/`modules/modal.js`.

## 3. Privacidade e limites

### Nunca enviar

- `email`, `e-mail`, `phone`, `telefone`, `celular`, `whatsapp`;
- `name`, `nome`, `full_name`, `first_name`, `last_name`, `customer_name`;
- `cpf`, `cnpj`, `documento`, `address`, `endereco`, `cep`;
- `message`, `mensagem`, `query`, `search_term`;
- `password`, `senha`, `token`, `secret`;
- `url`, `href`, `link` (use um token de destino, não a URL).

O sanitizador também rejeita valores que parecem e-mail, telefone, CPF/CNPJ ou URL. `item_name` e `product_name` são permitidos **somente** para nome de produto do catálogo, nunca para nome de cliente.

### Limites aplicados

| Limite | Valor |
|---|---|
| Props por evento | 20 |
| Tamanho da chave | 40 caracteres |
| Tamanho de string | 120 caracteres |
| Payload JSON | 2.048 bytes |
| Nome do evento | 64 caracteres |

### O que não é feito

- Não lê `document.cookie`, não cria cookie e não faz chamada de rede.
- Não envia o texto digitado na busca; a busca é medida por tamanho, quantidade de termos e resultado.
- Não envia o telefone da loja nem o número do WhatsApp; use `store_id` e `store_city`.
- Não envia o conteúdo do formulário; use `subject`, `contact_channel` e `message_length`.

## 4. Dicionário de eventos

> **Status:** “existente” = já há chamada no código; “a instrumentar” = o módulo já aceita, falta Zeus adicionar a chamada no ponto indicado.

**Essenciais para a primeira versão:** `page_view` (entrada e seções), `view_item` (interesse no produto) e `contact_whatsapp` (conversão). `generate_lead` é a variante de conversão do formulário.

| Evento | Gatilho | Props permitidas | KPI | Status |
|---|---|---|---|---|
| `page_view` | `page(section)` no load, `hashchange` ou seção visível | `section`, `page_path` (automáticos) | Sessões e alcance por seção | a instrumentar |
| `view_item_list` | Catálogo renderizado ou seção `catalogo` visível | `list_name`, `item_count`, `filter_brand`, `results_count`, `has_results` | Alcance do catálogo | a instrumentar |
| `filter_brand` | Clique em um filtro de marca | `brand_name`, `results_count` | Interesse por marca | existente (`catalog.js:56`) |
| `search` | Busca com texto após o debounce | `search_length`, `terms_count`, `results_count`, `has_results` | Uso da busca e buscas sem resultado | a instrumentar |
| `select_item` | Clique no card antes de abrir o modal | `item_id`, `item_name`, `item_brand`, `item_category`, `position` | CTR lista → produto | a instrumentar |
| `view_item` | Modal de produto aberto | `item_id`, `item_name`, `item_brand`, `item_category`, `price_band` | Interesse no produto | existente (`modal.js:244`) |
| `add_to_wishlist` | Favoritar um produto | `item_id`, `item_name`, `item_brand`, `source` | Taxa de salvamento | a instrumentar |
| `remove_from_wishlist` | Remover dos favoritos | `item_id`, `item_brand`, `source` | Taxa de remoção | a instrumentar |
| `share` | Compartilhar a wishlist | `item_count`, `method` (`web_share`, `copy_link`, `native`) | Viralidade | a instrumentar |
| `contact_whatsapp` | Clique em qualquer link `wa.me` | `store_id`, `store_city`, `source`, `item_id`, `item_brand` | Conversão para WhatsApp e top lojas | a instrumentar |
| `contact_form_start` | Primeiro foco em campo do formulário | `form_id`, `source` | Início de preenchimento | a instrumentar |
| `generate_lead` | `POST /api/contact` com sucesso | `form_id`, `subject`, `contact_channel`, `message_length` | Leads e conversão do formulário | a instrumentar |
| `contact_form_error` | Falha no `POST /api/contact` | `form_id`, `error_type`, `fallback_offered` | Taxa de erro do formulário | a instrumentar |
| `contact_whatsapp_fallback` | Usuário escolhe o fallback por WhatsApp | `form_id`, `source` | Recuperação de falha | a instrumentar |
| `cta_click` | CTA corporativa clicada | `cta_id`, `section`, `destination`, `language` | CTR de CTA | a instrumentar |
| `language_change` | Troca PT/EN/ES | `language`, `source` | Adoção de idioma | a instrumentar |
| `outbound_click` | Link para Instagram, Facebook ou mapa | `network`, `section`, `store_id` | Tráfego de saída | a instrumentar |

### Exemplos de payload

```js
// Produto (já existe no modal; os dois últimos campos são opcionais)
window.MiplaceAnalytics.track('view_item', {
  item_id: '1',
  item_name: 'REALME P4 LITE',
  item_brand: 'Realme',
  item_category: 'Celular',
  price_band: '1k_2k'
});

// WhatsApp: não envie o telefone, apenas a loja
window.MiplaceAnalytics.track('contact_whatsapp', {
  store_id: 'xv-prime',
  store_city: 'Piracicaba',
  source: 'product_modal',
  item_id: '1',
  item_brand: 'Realme'
});

// Busca: não envie o texto digitado
window.MiplaceAnalytics.track('search', {
  search_length: 7,
  terms_count: 1,
  results_count: 3,
  has_results: true
});
```

## 5. Funil

| Etapa | Evento | Como disparar | Métrica |
|---|---|---|---|
| 1. Home | `page_view` | `page('inicio')` no load | Sessões na home |
| 2. Seção | `page_view` | `page(id)` ao entrar na seção ou mudar o hash | Alcance por seção |
| 3. Catálogo | `view_item_list` | após `renderProducts`, ou seção `catalogo` visível | Alcance do catálogo |
| 4. Produto | `select_item` ou `view_item` | clique no card / abertura do modal | Interesse no produto |
| 5. Contato | `contact_whatsapp` ou `generate_lead` | clique no WhatsApp / sucesso do formulário | Contato qualificado |

Fórmulas (use a mesma janela e o mesmo modelo de atribuição em todos os passos):

- `home → catálogo = view_item_list / page_view(section=inicio)`
- `catálogo → produto = view_item / view_item_list`
- `produto → contato = (contact_whatsapp + generate_lead) / view_item`
- `home → contato = (contact_whatsapp + generate_lead) / page_view(section=inicio)`

> Sem cookies, não existe `session_id` do módulo. GA4, Plausible e Matomo calculam sessão/usuário no servidor deles; não invente um funil baseado em `event_id` (ele é único por evento, não por pessoa).

## 6. KPIs

| KPI | Fórmula | Eventos | Observação |
|---|---|---|---|
| Alcance do catálogo | sessões com `view_item_list` / sessões | `page_view`, `view_item_list` | Use sessões do provedor |
| Interesse em produto | `view_item` / `view_item_list` | `view_item`, `view_item_list` | Taxa por evento ou por sessão; documente qual |
| Conversão para contato | `(contact_whatsapp + generate_lead)` / `view_item` | contato, `view_item` | Principal KPI comercial |
| Share do WhatsApp | `contact_whatsapp` / `(contact_whatsapp + generate_lead)` | contato | Mostra preferência de canal |
| Busca sem resultado | `search(has_results=false)` / `search` | `search` | Qualidade do catálogo e da busca |
| Taxa de wishlist | `add_to_wishlist` / `view_item` | wishlist, produto | Intenção de compra |
| Erro do formulário | `contact_form_error` / (`generate_lead` + `contact_form_error`) | formulário | Confiabilidade da API |
| CTR de CTA | `cta_click` / `page_view(section)` | CTA, `page_view` | Por seção |
| Top marcas | contagem de `filter_brand` por `brand_name` | `filter_brand` | Interesse declarado |
| Top lojas | contagem de `contact_whatsapp` por `store_id` | contato | Demanda por loja |

### Metas iniciais (hipóteses, não histórico)

Não há baseline histórico neste projeto. As faixas abaixo são **hipóteses para calibrar após 14 dias**, não benchmarks:

| KPI | Hipótese inicial |
|---|---|
| Home → catálogo | ≥ 25% |
| Catálogo → produto | ≥ 35% |
| Produto → contato | ≥ 8% |
| Busca sem resultado | ≤ 10% |
| Sucesso do formulário | ≥ 90% (com API disponível) |

## 7. Integração

### 7.1 Script

Inserir **depois** de `modules/ui.js` e **antes** de `modules/catalog.js`:

```html
<script src="modules/analytics.js?v=2.0.11" defer></script>
```

Ordem completa recomendada em `docs/olimpo/INTEGRACAO.md`:

```html
<script src="stores.js?v=2.0.11" defer></script>
<script src="modules/ui.js?v=2.0.11" defer></script>
<script src="modules/i18n.js?v=2.0.11" defer></script>
<script src="modules/analytics.js?v=2.0.11" defer></script>
<script src="modules/catalog.js?v=2.0.11" defer></script>
<script src="modules/modal.js?v=2.0.11" defer></script>
```

### 7.2 Page view inicial e por seção

```html
<script>
  window.addEventListener('DOMContentLoaded', function () {
    window.MiplaceAnalytics?.page('inicio');
  });

  window.addEventListener('hashchange', function () {
    var section = location.hash.replace('#', '') || 'inicio';
    window.MiplaceAnalytics?.page(section);
  });
</script>
```

Se preferir rastrear seções por scroll, use **um** dos dois caminhos abaixo para não duplicar `page_view`:

```html
<script>
  (function () {
    if (!('IntersectionObserver' in window)) return;
    var seen = Object.create(null);
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var id = entry.target.id;
        if (!entry.isIntersecting || seen[id]) return;
        seen[id] = true;
        window.MiplaceAnalytics?.page(id);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('main section[id]').forEach(function (section) {
      io.observe(section);
    });
  })();
</script>
```

### 7.3 Catálogo, busca e produto

- `view_item_list`: chamar após `window.renderProducts()` ou quando `#catalogo` entrar na viewport. Use `document.querySelectorAll('#products-grid > *').length` para `item_count`.
- `filter_brand`: já existe em `catalog.js:56`; opcionalmente acrescente `results_count`.
- `search`: chamar no `initSearch` após o debounce, somente se houver texto. Não envie o texto; calcule `search_length`, `terms_count` (split por espaço), `results_count` e `has_results`.
- `select_item`: no clique de `[data-open-product]`, antes de `window.openModal`.
- `view_item`: já existe em `modal.js:244`; opcionalmente acrescente `item_category` e `price_band`.

### 7.4 WhatsApp, formulário e CTAs

- `contact_whatsapp`: delegar clique em `a[href*="wa.me"]`; derivar `store_id`, `store_city` e `source` (`product_modal`, `store_card`, `contact_section`, `header`). Não leia o telefone do link.
- `contact_form_start`: no primeiro `focus` do formulário.
- `generate_lead`: no sucesso do `POST /api/contact`; enviar `form_id`, `subject` (apenas opção pré-definida), `contact_channel` (`email`, `phone` ou `whatsapp`) e `message_length`.
- `contact_form_error`: no `catch`/status de erro; `error_type` = `validation`, `network`, `http_4xx`, `http_5xx` ou `unknown`; `fallback_offered` = boolean.
- `contact_whatsapp_fallback`: no clique do fallback.
- `cta_click`: delegar em `[data-cta]`; `cta_id`, `section`, `destination` (ex.: `sobre`, `catalogo`, `whatsapp`, `mailto`) e `language`.
- `language_change`: no seletor PT/EN/ES; `language` = `pt`, `en` ou `es`; `source` = `header` ou `footer`.
- `outbound_click`: em links de Instagram, Facebook e mapas; `network`, `section`, `store_id`.

### 7.5 GA4 via GTM

O módulo já empurra para `window.dataLayer`, desde que o array exista antes do primeiro evento. No GTM:

1. Crie variáveis de camada de dados para `event`, `section`, `item_id`, `item_name`, `item_brand`, `store_id`, `subject` e `contact_channel`.
2. Crie um acionador “Evento personalizado” para cada evento da tabela.
3. Crie tags GA4 de evento. Para `page_view`, configure a tag de configuração GA4 com `send_page_view: false` e deixe o `page_view` do módulo representar a seção; assim não há duplicidade com o page view automático.
4. Marque `generate_lead` e `contact_whatsapp` como conversões.

> Se o GTM ainda não existir, o módulo não cria `dataLayer`; os eventos continuam no `CustomEvent`. Carregue o GTM antes do primeiro evento ou use o adaptador de `CustomEvent` abaixo.

### 7.6 Plausible

Plausible é cookieless; o adaptador abaixo só recebe eventos que já passaram pelo consentimento do módulo:

```js
window.addEventListener('miplace:analytics', function (event) {
  var d = event.detail;
  if (!window.plausible) return;
  window.plausible(d.event, {
    props: {
      section: d.section,
      item_brand: d.item_brand || '',
      item_id: d.item_id || '',
      store_id: d.store_id || ''
    }
  });
});
```

### 7.7 Matomo

Para modo sem cookies, chame `_paq.push(['disableCookies'])` antes de carregar o `matomo.js`; ainda assim, carregue o Matomo somente com consentimento:

```js
window.addEventListener('miplace:analytics', function (event) {
  var d = event.detail;
  window._paq = window._paq || [];
  window._paq.push([
    'trackEvent',
    d.section || 'site',
    d.event,
    d.item_name || d.item_brand || '',
    typeof d.value === 'number' ? d.value : undefined
  ]);
});
```

### 7.8 Consentimento para provedores externos

`MiplaceAnalytics.consent.revoke()` só para o módulo e grava o opt-out. Se o GA4/Matomo já estiver carregado, ele continua ativo até você integrar:

```js
window.addEventListener('miplace:analytics-consent', function (event) {
  if (!event.detail.granted) {
    // gtag('consent', 'update', { analytics_storage: 'denied' });
    // _paq.push(['forgetUser']);
    return;
  }
  // carregue o provedor aqui, uma única vez
});
```

**Regra:** não carregue script de terceiros antes de `consent.granted`. O módulo não faz esse carregamento por você.

## 8. Verificação

Checagem isolada do módulo (não depende dos arquivos de outros agentes):

```bash
npx tsc --noEmit --allowJs --checkJs --strict --target ES2022 \
  --module ES2022 --moduleResolution Bundler \
  --lib ES2022,DOM,DOM.Iterable \
  modules/analytics.js types/*.d.ts
npx eslint modules/analytics.js
```

O `npm run typecheck` completo pode falhar enquanto outros módulos estiverem em edição; quando o repositório estiver estável, rode-o também.

Teste manual no console (sem enviar PII):

```js
window.dataLayer = [];
window.MiplaceAnalytics.track('test_event', {
  item_id: '1',
  email: 'nao-deve-sair@example.com',
  name: 'Nao Deve Sair'
});
console.log(window.dataLayer.at(-1));
// { event: 'test_event', item_id: '1', ... } — sem email/name

localStorage.setItem('miplace-analytics-optout', '1');
window.MiplaceAnalytics.track('test_event', { item_id: '1' }); // false
localStorage.removeItem('miplace-analytics-optout');
```

> `types/global.d.ts` ainda não declara `MiplaceAnalytics`; para chamadas em módulos com `@ts-check`, use `/** @type {any} */ (window).MiplaceAnalytics` ou peça a quem owns `types/global.d.ts` para adicionar a interface. Não editei esse arquivo por escopo.
