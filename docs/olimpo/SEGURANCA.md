# Segurança e Privacidade — Miplace Group

> **Status:** revisão estática concluída em 2026-11-07.
> **Escopo:** `index.html`, `app.js`, `stores.js`, `modules/`, `sw.js`, `api/contact.js`, `vercel.json` e dependências.
> **Fora do escopo:** pentest ativo, teste de carga, auditoria de histórico git (o diretório não é um repositório git) e verificação em produção (o domínio não resolveu no ambiente da revisão).
> **Natureza:** análise de lacunas técnicas e de privacidade; não é parecer jurídico nem certificação.

## 1. Veredito

- **Nenhuma vulnerabilidade crítica** foi encontrada. Não há segredo no cliente, injeção direta de HTML com dado de usuário, `eval`/`document.write` ou dependência de runtime vulnerável.
- **2 riscos P1 de lançamento:** a política de privacidade existe, mas ainda não identifica CNPJ/controlador completo, prazo de retenção nem canal "Privacidade" no formulário; e a proteção antiabuso é só honeypot + rate limit em memória por instância.
- **4 riscos P2:** CSP com `unsafe-inline`, cache imutável de assets sem fingerprint, `outputDirectory: "."` expondo documentação interna e terceiros de fonte/CDN.
- **Dependências de runtime:** `npm audit --omit=dev` retornou **0 vulnerabilidades**. No total (incluindo dev), há 6 avisos, 2 high (`serve`, `compression`), todos de ferramentas locais.
- **`vercel.json` foi endurecido** sem remover headers existentes: CSP mais estreita, COOP/CORP, `X-Permitted-Cross-Domain-Policies`, `no-store` na API e revalidação de HTML/SW. `index.html` e código não foram alterados.

## 2. Ativos e superfície

| Ativo | Onde vive | Exposição |
|---|---|---|
| Conteúdo institucional e catálogo | `index.html`, `produtos.json`, `stores.js` | Público, somente leitura |
| Formulário de contato | `index.html:494-535` + `api/contact.js` | Público, POST same-origin |
| Dados pessoais do contato | Corpo do POST e e-mail para `CONTACT_TO_EMAIL` | Nome, e-mail, telefone, assunto, mensagem, consentimento, IP |
| Favoritos | `localStorage` | Apenas IDs de produto; não é PII |
| Service worker e cache | `sw.js` | Assets locais, navegação e `produtos.json` |
| Credenciais de envio | Vercel Environment Variables | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` |
| Deploy e headers | Vercel + `vercel.json` | Público |

## 3. Threat model (STRIDE resumido)

| Componente | Ameaça | Cenário | Controle atual | Lacuna |
|---|---|---|---|---|
| Site estático | **Tampering** | Asset ou CDN comprometido altera JS/CSS | HTTPS, SRI nas 3 folhas do cdnjs, CSP | Google Fonts sem SRI; cache imutável sem fingerprint |
| Formulário | **Spoofing / DoS** | Bot envia milhares de contatos e esgota Resend/inbox | Honeypot, 5 req/10 min por IP, corpo de 20 KB | Rate limit em memória por instância; IP vem de `X-Forwarded-For`; sem CAPTCHA/Turnstile |
| Formulário | **Injection** | HTML/CRLF no nome, assunto ou mensagem | Validação de tipos/tamanho; `escapeHtml` no HTML; assunto sem CRLF; `reply_to` validado | Nenhuma injeção identificada; revisar se o front mudar o contrato |
| `api/contact.js` | **Information disclosure** | Erro interno devolve stack, chave ou detalhe do provedor | Respostas genéricas; logs sem PII; `no-store` | Confirmar que logs da Vercel não retêm corpo/PII além do necessário |
| PWA / cache | **Tampering / stale** | SW antigo serve JS vulnerável após correção | `BUILD_TIMESTAMP`, network-first em navegação, `skipWaiting` | Assets com `immutable` de 1 ano e URLs sem hash; correção só chega com bump manual |
| Terceiros | **Information disclosure** | Google Fonts recebe IP/navegador do visitante | CSP restrita, preconnect | Sem SRI viável em CSS dinâmico; considerar self-host |
| Visitante | **Elevation / XSS** | HTML injetado executa script no contexto do site | `escapeHTML` em catálogo/modal; CSP; sem `eval`; `target=_blank` com `noopener` | `script-src 'unsafe-inline'` mantém defesa XSS parcial |
| Deploy | **Repudiation** | Alteração publicada sem rastro | Vercel deployments | Sem CI de segurança, sem revisão obrigatória de headers; documentar rollback |

## 4. OWASP Top 10 aplicável

| Categoria | Aplicabilidade | Situação |
|---|---|---|
| A01 Broken Access Control | Baixa (site público, sem auth) | Sem rotas privadas; proteger conta Vercel e acesso ao e-mail |
| A02 Cryptographic Failures | Média | HTTPS/HSTS; nenhum segredo no cliente; e-mail usa Resend/TLS |
| A03 Injection | Média | DOM XSS mitigado por `escapeHTML`; formulário validado no servidor; CSP com `unsafe-inline` |
| A04 Insecure Design | Média | Falta CAPTCHA/limite distribuído; falta política de retenção formal |
| A05 Security Misconfiguration | Média | Headers fortes, mas `outputDirectory: "."` expõe docs; CSP ainda permissiva |
| A06 Vulnerable Components | Baixa | Runtime 0; dev com 2 high (`serve`, `compression`); cdnjs com SRI |
| A07 Auth Failures | Baixa | Não há login; MFA na conta Vercel/Resend é obrigatório |
| A08 Software/Data Integrity | Média | SRI no cdnjs; Google Fonts sem SRI; build/deploy sem attestation |
| A09 Logging/Monitoring | Média | Logs genéricos na API; sem alerta de abuso/CSP report |
| A10 SSRF | Baixa | API só envia para Resend fixo; não busca URL fornecida pelo usuário |

## 5. Achados por severidade

### P0 — crítico
Nenhum.

### P1 — alto (bloqueia lançamento)

#### F-01. Política de privacidade publicada, mas incompleta para lançamento
- **Evidência:** `privacidade.html:346-350` identifica "Miplace Group" como controladora, mas não traz CNPJ nem razão social; `privacidade.html:436-443` não fixa prazo concreto de retenção; `privacidade.html:460,477` orientam usar o assunto "Privacidade", mas o select do formulário (`index.html:511-517`) não tem essa opção; `docs/olimpo/PENDENCIAS.md:7,20` confirmam CNPJ e revisão jurídica pendentes.
- **Risco:** consentimento sem controlador plenamente identificado, prazo definido e canal efetivo; um pedido de privacidade não pode ser classificado no próprio formulário.
- **Ação:** preencher razão social, CNPJ, endereço, encarregado/canal e prazos concretos; adicionar a opção "Privacidade" ao select e mapeá-la no backend; concluir a revisão jurídica antes do lançamento.

#### F-02. Antiabuso insuficiente para formulário público
- **Evidência:** `api/contact.js:16-18` (5 req/10 min), `:248-273` (Map em memória), `:230-244` (primeiro IP de `X-Forwarded-For`), `:190-195` (honeypot). Em serverless, cada instância tem seu próprio Map e o estado morre no cold start; `X-Forwarded-For` pode ser forjado se a borda não o sobrescrever.
- **Risco:** spam, email bombing e consumo de cota do Resend; um atacante distribuído contorna o limite.
- **Ação:** rate limit distribuído (Vercel Firewall/Upstash) + Cloudflare Turnstile ou hCaptcha; validar o IP confiável na borda (`x-real-ip`/`request.ip`) e testar spoof de `X-Forwarded-For`; alerta de pico de envios.

### P2 — médio

#### F-03. CSP mantém `'unsafe-inline'` para scripts e estilos
- **Evidência:** `index.html:18-31` (script inline de tema), `:83` (JSON-LD inline, não executável), `stores.js:124,153` (`onerror` inline), 24 atributos `style=` no HTML e blocos `<style>` nas páginas legais; `vercel.json:75` mantém `script-src 'self' 'unsafe-inline'` e `style-src 'self' 'unsafe-inline'`.
- **Risco:** qualquer injeção de HTML que passe pelos escapes existentes executa script; `unsafe-inline` anula boa parte do ganho do CSP.
- **Ação:** fase 1, manter e documentar; fase 2, mover o script de tema para `theme.js` e trocar `onerror` por `addEventListener('error')`; fase 3, substituir os estilos inline por classes e remover `style-src 'unsafe-inline'`. Validar primeiro em preview com `Content-Security-Policy-Report-Only`.

#### F-04. Cache imutável em assets sem fingerprint
- **Evidência:** `vercel.json:5-23` marca `app.js`, `stores.js`, `styles.css`, `tailwind.css` e módulos com `max-age=31536000, immutable`, mas as URLs usam `?v=2.0.0` e não hash de conteúdo (`index.html:85-93`); `sw.js:11-12` depende de bump manual de `BUILD_TIMESTAMP`.
- **Risco:** uma correção de segurança publicada sem bump de query/SW pode não chegar a usuários com cache antigo; o site continua vulnerável na prática.
- **Ação:** conteúdo com hash no nome ou `Cache-Control: no-cache` para JS/CSS mutável; automatizar bump de `BUILD_TIMESTAMP` e das queries no build; teste de atualização com SW instalado.

#### F-05. `outputDirectory: "."` publica arquivos internos
- **Evidência:** `vercel.json:2`; não existe `.vercelignore`; o repositório contém `AGENTS.md`, `docs/olimpo/*`, `package.json`, `package-lock.json`, `scripts/`, `types/` e `src/`.
- **Risco:** informação interna (planejamento, pendências, convenções, estrutura) acessível publicamente; não há segredo encontrado, mas amplia reconhecimento para atacantes.
- **Ação:** `.vercelignore` excluindo `docs/`, `scripts/`, `types/`, `src/`, `AGENTS.md`, `package*.json`, `jsconfig.json`, `eslint.config.js`; validar com `vercel build`/preview que o site continua servindo apenas os assets necessários.

#### F-06. Dependências de terceiros e privacidade de fontes
- **Evidência:** `index.html:76-78` carrega Font Awesome do cdnjs **com SRI sha384** (bom); `index.html:80` carrega Google Fonts sem SRI (CSS dinâmico); `index.html:68-70` faz preconnect para ambos. `api/contact.js` usa somente `fetch` nativo.
- **Risco:** disponibilidade/privacidade dependem de CDNs; Google Fonts recebe IP e user-agent do visitante (transferência internacional). Comprometimento do cdnjs é mitigado pelo SRI, mas não eliminado.
- **Ação:** manter SRI e versão fixa do Font Awesome; self-host das fontes (DM Sans/Playfair) para eliminar terceiro e melhorar privacidade; se mantiver Google Fonts, declarar no aviso de privacidade e monitorar disponibilidade.

### P3 — baixo

#### F-07. Dependências de desenvolvimento desatualizadas
- **Evidência:** `npm audit` completo: 6 avisos, 2 high em `serve` e `compression`, 4 moderate (`eslint`, `minimatch`, `fast-uri`, `@eslint/config-array`); `package.json:19-30`.
- **Risco:** `serve` é usado em `npm run dev`/`npm run serve`; se exposto na rede local, há risco de DoS/execução conforme advisory. Não vai para produção.
- **Ação:** atualizar `serve`/`compression`; rodar `npm audit --audit-level=high` no CI; não expor `serve` em `0.0.0.0` fora de desenvolvimento.

#### F-08. HSTS preload não verificável
- **Evidência:** `vercel.json:71` envia `max-age=63072000; includeSubDomains; preload`; o domínio não resolveu no ambiente da revisão (`getent hosts`/`curl`), então não foi possível confirmar HTTPS, redirect e submissão ao preload.
- **Risco:** `includeSubDomains` força HTTPS em todos os subdomínios; se algum subdomínio legítimo for HTTP, quebra. `preload` só vale após submissão e remoção exige meses.
- **Ação:** confirmar todos os subdomínios em HTTPS antes de submeter; validar `curl -I` em produção; manter o header.

#### F-09. Falta `security.txt`, relatório CSP e contato de segurança
- **Evidência:** não há `/.well-known/security.txt` nem `report-to`/`report-uri` na CSP (`vercel.json:75`).
- **Risco:** pesquisador não tem canal para reportar; violações de CSP não geram telemetria.
- **Ação:** publicar `security.txt` com contato e validade; avaliar endpoint de relatório CSP (Sentry/Report-To) sem coletar PII.

## 6. CSP e headers

### 6.1 Estado após a mudança (`vercel.json:64-77`)

| Diretiva | Valor | Cobre |
|---|---|---|
| `default-src` | `'self'` | Fallback para recursos não listados |
| `script-src` | `'self' 'unsafe-inline'` | Scripts locais, tema inline e `onerror` inline gerado por `stores.js` |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com` | Tailwind local, estilos inline, Font Awesome, Google Fonts |
| `font-src` | `'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:` | Fontes do Google, webfonts do Font Awesome, data URIs |
| `img-src` | `'self' data:` | Todas as imagens do catálogo e logos locais; **antes era `https:` amplo** |
| `media-src` | `'self'` | Vídeo hero local |
| `connect-src` | `'self'` | `fetch('produtos.json')` e `POST /api/contact` |
| `frame-src` | `'none'` | Nenhum iframe; mapa é link, não embed |
| `form-action` | `'self'` | Formulário para `/api/contact` |
| `base-uri` | `'self'` | Bloqueia `<base>` injetado |
| `object-src` | `'none'` | Sem Flash/objetos |
| `frame-ancestors` | `'none'` | Anti-clickjacking |
| `upgrade-insecure-requests` | ativo | Força HTTPS em subrecursos |

### 6.2 Mudanças aplicadas

| Mudança | Antes | Depois | Motivo |
|---|---|---|---|
| `script-src` | incluía `https://cdnjs.cloudflare.com` | `'self' 'unsafe-inline'` | Não há JS no cdnjs; só CSS. Reduz superfície de script |
| `img-src` | `'self' data: https:` | `'self' data:` | Todas as imagens são locais e validadas por `scripts/validate-products.js`; fecha exfiltração por imagem |
| COOP | ausente | `Cross-Origin-Opener-Policy: same-origin` | Isola contexto de janela; compatível com `window.open(..., noopener)` |
| CORP | ausente | `Cross-Origin-Resource-Policy: same-origin` | Evita incorporação de recursos por terceiros |
| Política de domínios | ausente | `X-Permitted-Cross-Domain-Policies: none` | Bloqueia política cross-domain legada |
| Permissions-Policy | `interest-cohort=()` | inclui `browsing-topics=()` | Cobre Topics API além do FLoC |
| API | sem regra de cache | `Cache-Control: no-store` em `/api/(.*)` | Impede cache de respostas com PII |
| HTML/SW | cache implícito da Vercel | `max-age=0, must-revalidate` em `/`, `/index.html`, `/sw.js` | Garante atualização de HTML e service worker |

**Não removi nenhum header existente.** HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy` foram preservados.

### 6.3 Compatibilidade verificada

- **Google Fonts:** CSS em `fonts.googleapis.com` (`style-src`) e arquivos em `fonts.gstatic.com` (`font-src`) — cobertos.
- **Font Awesome/cdnjs:** CSS em `cdnjs` (`style-src`) e webfonts em `cdnjs` (`font-src`) — cobertos; SRI preservado em `index.html:76-78`.
- **Scripts self:** `stores.js`, `modules/*.js` e `app.js` — cobertos por `'self'`.
- **Imagens:** todas locais (`produtos.json` usa caminhos relativos; `validate-products` exige arquivo no disco) — cobertas por `'self' data:`.
- **API:** `fetch('/api/contact')` e `POST` same-origin — cobertos por `connect-src 'self'` e `form-action 'self'`.
- **Sem iframes/objetos:** `frame-src 'none'` e `object-src 'none'` não quebram nada no snapshot.
- **Risco de regressão:** `Cross-Origin-Opener-Policy` pode afetar o toolbar de preview da Vercel; testar em preview, não em produção. Se houver embed de mapa no futuro, `frame-src` precisará de exceção.

### 6.4 O que falta para uma CSP mais estrita

1. Externalizar o script de tema e substituir `onerror` inline por listeners (`stores.js:124,153`).
2. Trocar os 24 `style=` e os blocos `<style>` das páginas legais por classes e remover `style-src 'unsafe-inline'`.
3. Adicionar `Content-Security-Policy-Report-Only` em preview antes de remover `'unsafe-inline'`.
4. Se o módulo 3D/import map voltar ao HTML, testar hash/nonce em navegador real; hoje ele não está carregado.
5. Se analytics for aprovado (`PENDENCIAS.md:14`), incluir apenas a origem escolhida em `script-src`/`connect-src`; não liberar `https:` genérico.
6. Se mapa embutido for aprovado, liberar somente `https://www.google.com/maps/` em `frame-src`, não `frame-src *`.

## 7. LGPD

### 7.1 Inventário de dados

| Dado | Origem | Finalidade | Obrigatório | Retenção sugerida |
|---|---|---|---|---|
| Nome | Formulário | Responder e identificar o contato | Sim | 12 meses após a última interação |
| E-mail | Formulário | Responder | Sim | 12 meses |
| Telefone | Formulário | Responder/WhatsApp | Sim no HTML atual; API aceita vazio | 12 meses |
| Assunto | Formulário | Triagem | Não | 12 meses |
| Mensagem | Formulário | Atendimento | Sim | 12 meses |
| Consentimento | Formulário | Prova de autorização | Sim | Enquanto durar o tratamento + prazo legal |
| IP e user-agent | Logs da Vercel/API | Segurança e antiabuso | Automático | 30–90 dias, se possível |
| IDs de favoritos | `localStorage` | Preferência local | Não | Até o usuário limpar |

**Não coletar** CPF, endereço, dados de cartão, saúde ou outros dados sensíveis pelo formulário; se o usuário enviar por conta própria, orientar canal seguro e evitar persistir.

### 7.2 Base legal e transparência

- **Consentimento** (LGPD art. 7º, I) para responder e manter contato; o checkbox é exigido em `api/contact.js:169-171`.
- **Legítimo interesse** (art. 7º, IX) para logs de segurança, antiabuso e prevenção a fraude, com teste de proporcionalidade.
- **Obrigação legal/regulatória**, se houver prazo de guarda aplicável; confirmar com jurídico.
- O aviso de privacidade deve informar controlador, CNPJ, contato do encarregado, finalidade, base legal, retenção, compartilhamentos, transferência internacional e direitos. A política existe (`privacidade.html`), mas ainda não traz CNPJ/razão social, encarregado nem prazos concretos (`privacidade.html:346-350,436-443`).

### 7.3 Direitos do titular

- Confirmação, acesso, correção, anonimização/bloqueio, eliminação, portabilidade, informação sobre compartilhamento e revogação do consentimento.
- Canal: formulário/WhatsApp e e-mail oficial (pendente em `PENDENCIAS.md:22`). O formulário ainda não oferece o assunto "Privacidade" citado na política (`index.html:511-517`); incluir antes do lançamento. Prazo operacional sugerido: 15 dias, com registro da solicitação.
- Não usar dados do formulário para marketing sem consentimento específico e separado.

### 7.4 Compartilhamento e transferência internacional

| Operador | Função | Dados | Observação |
|---|---|---|---|
| Vercel | Hospedagem, logs, CDN | IP, user-agent, requisições | Pode envolver EUA; verificar DPA e região |
| Resend | Envio de e-mail | Nome, e-mail, telefone, mensagem | Pode envolver EUA; verificar DPA |
| Google Fonts | Fonte | IP, user-agent | Transferência internacional; self-host elimina |
| cdnjs/Cloudflare | CDN de CSS/fontes | IP, user-agent | SRI mitiga integridade; verificar DPA |

O aviso de privacidade precisa listar esses operadores e a base de transferência. Se o site usar analytics no futuro, só após decisão de base legal e banner de consentimento quando exigido.

### 7.5 Segurança do tratamento

- TLS/HSTS em todo o site; `no-store` na API; validação de tamanho/tipo no servidor.
- Nenhum dado pessoal em `localStorage`; wishlist só guarda IDs.
- Acesso à inbox e ao painel Resend com MFA; menor privilégio; rotação de chave.
- Não registrar corpo do formulário em logs; logs só com código/status.
- Plano de resposta a incidente com avaliação de risco aos titulares e comunicação à ANPD quando aplicável (LGPD art. 48).

## 8. Checklist de segredos

- [x] Nenhuma chave/token/senha encontrada no repositório (grep por `api_key`, `secret`, `token`, `Bearer`, `sk-`, `AIza`, `ghp_`; excluindo `node_modules` e lockfile).
- [x] `RESEND_API_KEY` é lida só no servidor (`api/contact.js:364`) e nunca devolvida ao cliente.
- [x] Nenhum `.env`/`.env.local` no diretório; `.gitignore` cobre `.env` e variantes.
- [x] Nenhum `.map` no diretório de produção analisado; confirmar no build da Vercel.
- [x] Erros da API não expõem stack, chave ou status do provedor ao cliente (`api/contact.js:590-608`).
- [ ] Confirmar variáveis só em Production/Preview da Vercel, com escopo mínimo.
- [ ] Ativar secret scanning (gitleaks/GitHub) no CI.
- [ ] Auditar histórico git quando o projeto for versionado; hoje não há `.git`.
- [ ] Definir rotação da `RESEND_API_KEY` e do acesso ao e-mail.

## 9. Dependências

```text
npm audit --omit=dev  -> 0 vulnerabilidades (0 low, 0 moderate, 0 high, 0 critical)
npm audit             -> 6 (2 high, 4 moderate)
```

- **High (dev):** `serve` e `compression` — usados em `npm run serve`/`dev`, não no bundle publicado. Não expor o servidor de desenvolvimento na rede.
- **Moderate (dev):** `eslint`, `minimatch`, `fast-uri`, `@eslint/config-array` — ferramentas de build/lint.
- **Runtime:** apenas `fetch` nativo na API e JS estático no browser; sem dependência npm de runtime.
- **Integridade de terceiros:** Font Awesome tem SRI sha384; Google Fonts não permite SRI fixo por ser CSS dinâmico. Self-host é a mitigação mais forte.

## 10. Plano de resposta a incidente (resumo)

| Fase | Ações |
|---|---|
| **Detecção** | Alerta de pico de erros/429/envios no Vercel/Resend; relato de spam; alerta de dependência; CSP report se habilitado |
| **Contenção** | Desabilitar formulário/API (remover env ou feature flag), bloquear IP no Vercel Firewall, rotacionar `RESEND_API_KEY`, rollback do deployment |
| **Erradicação** | Corrigir validação/rate limit, atualizar dependência, remover asset comprometido, revisar cache/SW |
| **Recuperação** | Republicar com `BUILD_TIMESTAMP` novo, invalidar cache, monitorar 24–72 h, testar formulário e e-mail |
| **Comunicação** | Avaliar risco aos titulares; se aplicável, comunicar ANPD e titulares com apoio jurídico; não prometer prazo sem validação |
| **Postmortem** | Causa raiz, linha do tempo, o que falhou, ação corretiva com dono e prazo; atualizar este documento |

**Papéis:** Zeus coordena; Ártemis lidera segurança; Hefesto corrige API; Hermes executa deploy/rollback; Mnemósine comunica; jurídico valida notificação. Nenhuma comunicação externa sem aprovação do usuário/Zeus.

## 11. O que o usuário precisa configurar

1. **DNS/domínio:** `miplacemagazine.com.br` não resolveu na revisão; configurar na Vercel e validar HTTPS/redirect.
2. **Vercel Environment Variables:** `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`; domínio remetente verificado no Resend; SPF, DKIM e DMARC do domínio.
3. **Jurídico/LGPD:** razão social, CNPJ, encarregado/canal de direitos, prazos de retenção e revisão de `privacidade.html`/`termos.html` (publicados, mas incompletos).
4. **Antiabuso:** Vercel Firewall/rate limit distribuído + Turnstile/hCaptcha; decidir orçamento e provedor.
5. **Analytics:** escolher GA4/Plausible/Matomo (`PENDENCIAS.md:14`); se usar, atualizar CSP e avaliar consentimento de cookies.
6. **Exposição de arquivos:** criar `.vercelignore` para `docs/`, `scripts/`, `types/`, `src/`, `AGENTS.md`, `package*.json` (Hermes/Atlas).
7. **HSTS:** confirmar que todos os subdomínios são HTTPS antes de submeter ao preload.
8. **Contato de segurança:** publicar `/.well-known/security.txt` e definir caixa de recebimento.

## 12. Evidências e limitações

- **Comandos executados:** `npm audit --omit=dev --json`, `npm audit --json`, `node -e "JSON.parse(...)"`, `grep` de origens/sinks/segredos, `curl -I https://miplacemagazine.com.br/` (falhou por DNS), `getent hosts`.
- **Arquivos alterados:** `vercel.json` e este `docs/olimpo/SEGURANCA.md`. Nenhum `index.html`, JS, CSS ou `api/` foi editado.
- **Arquivos temporários:** `/tmp/opencode/miplace-audit-prod.json` e `/tmp/opencode/miplace-audit-all.json` (resultados brutos do audit).
- **Não verificado:** headers reais na Vercel (domínio não resolve), comportamento do CSP em navegador real, carga/abuso do formulário, histórico git e configuração do Resend/DNS de e-mail.
- **Teste recomendado antes do merge:** preview da Vercel com DevTools aberto, navegar catálogo/modal/lightbox/páginas legais/offline, conferir zero violações de CSP e testar `POST /api/contact` com payload inválido, honeypot e 429.
