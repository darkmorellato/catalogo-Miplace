# DEVOPS — Catálogo Miplace

> Dono: Hermes (DevOps/SRE). Escopo: CI, preview/produção, release, rollback, observabilidade e SLOs.
> Última atualização: 2026-11-07. Não contém credenciais.

## 1. Objetivo

Entregar o site estático (HTML/CSS/JS + PWA + função `/api/contact`) na Vercel com:

- CI obrigatório e reproduzível em todo PR para `main`;
- preview deploy por PR e produção somente a partir de `main`;
- release com versão/cache coerentes, checklist e rollback em minutos;
- observabilidade mínima e SLOs explícitos para disponibilidade e LCP.

## 2. Estado atual

- **Stack:** site estático vanilla JS + Tailwind v4, `outputDirectory: "."` (`vercel.json:2`), PWA com Service Worker registrado em `app.js:383-384`.
- **CI:** criado em `.github/workflows/ci.yml`; roda em `push`/`pull_request` para `main`, com Node 22, cache npm, timeout e concorrência.
- **Deploy:** a integração Git da Vercel é a responsável por preview (branch/PR) e produção (`main`). O GitHub Actions **não** faz deploy e não guarda token da Vercel.
- **Cache:** `vercel.json` marca JS/CSS/imagens como `immutable` por 1 ano (`vercel.json:5-47`); por isso o bump de `?v=` e do `BUILD_TIMESTAMP` do SW é obrigatório a cada release.
- **Versões:** `package.json:3` está em `1.2.0`, o `index.html` referencia assets com `?v=1.2.0`, e o `sw.js` usa `BUILD_TIMESTAMP = '2026-11-07.1'`. São chaves de cache diferentes; alinhar na próxima release (SemVer no pacote/HTML e o mesmo identificador no SW).
- **Função de contato:** `api/contact.js` já existe e usa `RESEND_API_KEY`, `CONTACT_TO_EMAIL` e `CONTACT_FROM_EMAIL` no servidor.
- **Observabilidade:** Vercel Analytics e Speed Insights **não estão habilitados** no repositório; logs ficam no dashboard da Vercel. Não há alerta de indisponibilidade nem medição de LCP em produção.
- **Pendências:** `scripts/test-site.js` já existe (Argos), mas o `package.json` ainda não declara `test:site`. Rodá-lo agora falha em 4 checagens (3 páginas legais ausentes e JSON-LD vazio), então o CI o ignora via `--if-present` até a integração. O `build` atual executa `lint:fix` (`package.json:17`); não há `.nvmrc`; a CSP de `vercel.json:56` não lista o domínio citado no `AGENTS.md:113`.

## 3. Fluxo de branches e PRs

Modelo trunk-based com branches curtas:

| Branch | Uso | Deploy |
|---|---|---|
| `main` | sempre deployável; protegida | produção na Vercel |
| `feat/<tema>` | funcionalidade | preview por branch/PR |
| `fix/<tema>` | correção | preview por branch/PR |
| `docs/<tema>` | documentação | preview (sem impacto) |
| `hotfix/<tema>` | incidente SEV1/SEV2 | preview + merge expedito |

Regras:

1. Ninguém faz push direto em `main`; abrir PR pequeno e revisável.
2. O check obrigatório é `CI / Build e testes`; configurar branch protection para exigi-lo antes do merge.
3. Merge por squash; o título do PR vira a entrada do changelog (Mnemósine).
4. PR de risco (cache, SW, CSP, formulário, headers) exige revisão de Ártemis/Afrodite conforme o arquivo.
5. Após o merge, a Vercel inicia o deploy de produção; acompanhar até o smoke test.

## 4. CI — o que roda e por quê

Arquivo: `.github/workflows/ci.yml`.

| Etapa | Comando | Motivo |
|---|---|---|
| Checkout | `actions/checkout@v4` | código do PR |
| Node 22 + cache | `actions/setup-node@v4` com `cache: npm` | paridade com a Vercel e install mais rápido |
| Dependências | `npm ci` | instala exatamente o `package-lock.json` |
| Lint | `npm run lint` | falha antes do `lint:fix` do build |
| Typecheck | `npm run typecheck` | JSDoc + TypeScript strict (`jsconfig.json`) |
| Catálogo | `npm test` | schema, IDs, marcas, preços, WhatsApp e snapshot |
| Site (opcional) | `npm run test:site --if-present` | roda quando o script npm existir; hoje sai com 0 sem falhar |
| Build | `npm run build` | validação + CSS Tailwind minificado |

Notas:

- **`test:site`:** `--if-present` é intencional. `scripts/test-site.js` já existe, mas falta declarar `"test:site": "node scripts/test-site.js"` no `package.json`; quando isso for feito, o CI passa a executá-lo sem alteração no workflow. A execução atual falha por páginas legais ausentes e JSON-LD vazio, então a ativação deve ocorrer após a integração de Mnemósine/Afrodite.
- **`lint:fix` no build:** `package.json:17` usa `lint:fix`; o CI roda `npm run lint` antes para que erros reais falhem. Recomendação ao dono do `package.json`: trocar `lint:fix` por `lint` no build.
- **Sem deploy no Actions:** não há `VERCEL_TOKEN`. Se no futuro o deploy for migrado para o CI, criar secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID` e um job separado com aprovação; não fazer isso sem decisão de Zeus.
- **Cache npm:** a chave é o `package-lock.json`; não usar `npm install` no CI.
- **Timeout/concorrência:** 15 min por job e cancelamento de execuções antigas da mesma branch/PR.

## 5. Preview deploys

1. Conectar o repositório GitHub ao projeto Vercel (Import Project), caso ainda não esteja conectado.
2. Configurar **Production Branch = `main`**.
3. Build Command: `npm run build`; Output Directory: `.` (já em `vercel.json:2`); Install Command: `npm ci`.
4. Node.js Version: **22.x** nas configurações do projeto (ou `NODE_VERSION=22`).
5. Cada PR/branch recebe uma URL `*.vercel.app`; validar antes do merge:
   - home, catálogo, busca, filtros, modal, lightbox e wishlist;
   - formulário de contato e fallback WhatsApp;
   - console sem erros; SW atualizado (hard refresh);
   - 360, 768, 1024 e 1440 px.
6. Preview não é produção: dados e env vars de Preview podem ser diferentes; nunca usar dados reais de cliente em teste.

## 6. Variáveis de ambiente

Configurar em **Vercel → Project → Settings → Environment Variables**, por escopo:

| Variável | Escopo | Uso |
|---|---|---|
| `RESEND_API_KEY` | Production, Preview | envio do formulário (`api/contact.js`) |
| `CONTACT_TO_EMAIL` | Production, Preview | destinatário do contato |
| `CONTACT_FROM_EMAIL` | Production, Preview | remetente verificado no provedor |

Regras:

- Segredos **nunca** entram no repositório, em `vercel.json`, no `index.html` ou em logs do CI.
- Variáveis de servidor não devem ter prefixo público (`VITE_`, `NEXT_PUBLIC_`, etc.).
- Alterou env var? É necessário **redeploy** para o runtime enxergar o novo valor.
- Preview e Production devem ter valores separados; não copiar segredo de produção para preview.
- Rotação: revogar a chave antiga no provedor e atualizar na Vercel no mesmo dia.

## 7. Checklist de release

### Antes do merge

- [ ] `npm ci && npm run lint && npm run typecheck && npm test` passam localmente.
- [ ] `npm run build` passa e `tailwind.css` gerado é determinístico.
- [ ] CI verde no PR.
- [ ] Preview deploy revisado (desktop/mobile, catálogo e formulário).
- [ ] `package.json:3` incrementado (SemVer).
- [ ] Todos os `?v=` do `index.html` atualizados para a nova versão.
- [ ] `sw.js` (`BUILD_TIMESTAMP`) atualizado para o identificador da release.
- [ ] Nenhum segredo, `.env` ou credencial no diff.
- [ ] CSP/headers conferidos se o PR tocar `vercel.json` ou adicionar script externo.
- [ ] Changelog/release notes atualizados (Mnemósine).

### Depois do deploy de produção

> Enquanto `miplacemagazine.com.br` não resolver (NXDOMAIN registrado em `docs/olimpo/INFRA.md`), usar a URL de produção `*.vercel.app` nos comandos de smoke e só trocar para o domínio final após o DNS/TLS estabilizar.

- [ ] `curl -I https://miplacemagazine.com.br/` retorna 200.
- [ ] Home renderiza o hero e o catálogo carrega os 27 produtos.
- [ ] Busca, filtro por marca/Tablets, modal, lightbox e wishlist funcionam.
- [ ] Formulário de contato responde e o fallback WhatsApp aparece em falha.
- [ ] Service Worker novo assume o controle (Application → Service Workers).
- [ ] Vercel Analytics/Speed Insights registram a visita e o LCP.
- [ ] Monitorar 30 min; se erro, executar rollback (seção 9).

## 8. Versionamento e cache

- **SemVer** em `package.json`; releases `1.2.x` para correções e `1.3.0` para features.
- O `vercel.json` serve `app.js`, `stores.js`, `modules/*.js`, `styles.css` e `tailwind.css` com `max-age=31536000, immutable` (`vercel.json:5-23`). **Sem o bump de `?v=`, o usuário pode ficar até 1 ano com o JS antigo.**
- O `sw.js` usa `BUILD_TIMESTAMP` no `CACHE_NAME`; sem bump, o cache antigo continua servindo assets.
- O CI atual não valida essa consistência. Próximo passo recomendado (Argos/Hermes): teste que compara `package.json.version` com os `?v=` do `index.html` e com `sw.js:BUILD_TIMESTAMP`.
- `produtos.json` tem cache de 1 h com `stale-while-revalidate` (`vercel.json:25-26`); mudanças de catálogo podem levar até 1 h para todos os usuários.

## 9. Rollback

### Opção A — Vercel Instant Rollback (preferida)

1. Vercel → Project → **Deployments**.
2. Identificar o último deployment saudável anterior ao incidente.
3. **Promote to Production** (Instant Rollback) nesse deployment.
4. Validar home, catálogo e formulário; acompanhar logs por 15 min.

### Opção B — Reverter o código

1. `git revert <commit>` em branch `hotfix/...`.
2. Abrir PR, aguardar CI e preview.
3. Merge em `main`; a Vercel gera novo deployment de produção.

### Cuidados

- Rollback da Vercel **não** reverte variáveis de ambiente; se o incidente foi causado por env var, corrigir em Settings e redeployar.
- Clientes com Service Worker mais novo podem manter cache local; após rollback, orientar hard refresh ou aguardar a atualização do SW.
- Não fazer rollback às cegas: confirmar se o problema é deploy, Vercel, DNS, API de contato ou dispositivo do usuário.
- Registrar URL do deployment bom e do deployment ruim no incidente.

## 10. Observabilidade mínima

| Sinal | Ferramenta | Como habilitar | Uso |
|---|---|---|---|
| Page views e referrers | Vercel Analytics | Project → Analytics → Enable; se o site estático exigir snippet, pedir a Afrodite para incluir `/_vercel/insights/script.js` | tráfego e queda abrupta |
| LCP/INP/CLS | Vercel Speed Insights | Project → Speed Insights → Enable; snippet `/_vercel/speed-insights/script.js` se necessário | SLO de LCP |
| Build/runtime logs | Vercel Deployments → Logs | dashboard ou `vercel logs <deployment>` | erro de build, 5xx, função |
| Disponibilidade | monitor sintético externo | checar `/` e `/produtos.json` a cada 5 min | alerta de site fora |
| Deploy | notificações da Vercel | Project → Settings → Notifications | falha de build/deploy |

Dependências:

- A habilitação de Analytics/Speed Insights exige edição de `index.html` (Afrodite) e revisão de CSP (Ártemis). **Não foram alterados neste trabalho.**
- `AGENTS.md:113` cita `https://va.vercel-scripts.com` na CSP, mas `vercel.json:56` não o inclui; validar no console antes de considerar a coleta funcionando.
- A Vercel não fornece alerta de uptime com paginação por padrão; o monitor sintético é obrigatório para o SLO de disponibilidade.

## 11. SLOs

Proposta inicial; calibrar com 4 semanas de dados reais.

| SLI | SLO | Medição | Error budget |
|---|---|---|---|
| Disponibilidade da home + catálogo | **99,9%/mês** | HTTP 200 + marcador de conteúdo a cada 5 min | ~43 min/mês |
| LCP mobile (p75) | **≤ 2,5 s** | Speed Insights/CrUX, janela de 28 dias | meta: ≥75% "good" |
| Sucesso do formulário | **≥ 99%** (após validação) | logs da função `/api/contact` | ~7 h/mês |

Medir no host de produção ativo: o domínio final ou a URL `*.vercel.app` enquanto o DNS não estiver concluído (`docs/olimpo/INFRA.md`).

Política de error budget:

- Consumiu 50% antes da metade do mês: priorizar correções de confiabilidade sobre novas features.
- Esgotou o budget: congelar mudanças não críticas até recuperar; incidentes e correções continuam.
- Toda violação de SLO gera postmortem curto (seção 12).

## 12. Runbook de incidente

### Severidade

| Nível | Critério | Exemplo |
|---|---|---|
| SEV1 | site fora ou catálogo inutilizável para todos | home 5xx, JS quebrado, DNS |
| SEV2 | função crítica degradada | formulário 5xx, busca/filtros quebrados |
| SEV3 | cosmético/conteúdo | texto, imagem, espaçamento |

### Primeiros 10 minutos

1. **Confirmar:** abrir a home em aba anônima e checar `/produtos.json`; verificar se é geral ou de um dispositivo/rede.
2. **Correlacionar:** Vercel → Deployments (houve deploy agora?) e Logs (5xx, build, função).
3. **Classificar:** SEV1/2/3 e registrar horário de início.
4. **Mitigar:** se o último deploy é suspeito, Instant Rollback (seção 9); se env var, corrigir e redeployar; se Vercel/DNS, abrir status e comunicar.
5. **Validar:** home, catálogo, formulário e SW; confirmar logs sem erro novo.
6. **Comunicar:** uma atualização objetiva no canal da equipe (definido por Zeus/Hera), com impacto, mitigação e próximo update.
7. **Encerrar:** monitorar 30 min após a mitigação e registrar timeline.

### Postmortem (até 48 h)

- O que aconteceu, em uma frase.
- Linha do tempo (detecção, mitigação, recuperação).
- Causa raiz e por que o CI/preview não pegou.
- Ações com dono e prazo; atualizar este runbook e o checklist de release.

## 13. Pendências e próximos passos

| # | Pendência | Dono | Impacto |
|---|---|---|---|
| 1 | Conectar/confirmar projeto Vercel e Production Branch `main` | Atlas/Zeus | preview e produção |
| 2 | Declarar `test:site` no `package.json` e corrigir as 4 falhas atuais (legais + JSON-LD) | Argos/Mnemósine/Afrodite | cobertura de site no CI |
| 3 | Alinhar `package.json`, `?v=` e `sw.js` na mesma versão | Afrodite | cache/rollback |
| 4 | Trocar `lint:fix` por `lint` no build | dono do `package.json` | CI não deve mutar código |
| 5 | Adicionar `.nvmrc` com 22 | Hermes/dono | paridade local × CI × Vercel |
| 6 | Habilitar Analytics/Speed Insights + CSP | Afrodite/Ártemis | SLO de LCP |
| 7 | Monitor sintético + alerta | Hermes | SLO de disponibilidade |
| 8 | Branch protection exigindo `CI / Build e testes` | Zeus | gate de merge |

## 14. Comandos úteis

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run test:site --if-present
npm run build
npx serve .            # smoke local
curl -I https://miplacemagazine.com.br/
vercel logs <deployment-url>
```

Referências: `vercel.json`, `.github/workflows/ci.yml`, `AGENTS.md`, `docs/olimpo/INTEGRACAO.md`.
