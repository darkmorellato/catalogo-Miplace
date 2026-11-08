# Plano de Projeto — Website Corporativo Miplace Group

**Versão:** 1.0 · **Sessão:** 2026-11-07 · **PM:** Hera · **Aprovação:** Zeus
**Objetivo:** primeira versão funcional do website corporativo nesta sessão, preservando catálogo, dados reais, stack estática e PWA.
**Prazo:** sem datas de negócio inventadas; avanço por gates. **Sessão atual** para produzir e validar; **pós-aprovação** para publicar.

## 1. Fases e milestones

| Fase | Quando | Objetivo | Entregas | Gate |
|---|---|---|---|---|
| **0. Contratos** | Sessão atual, antes de produzir | Fechar interfaces entre as frentes | `REQUISITOS`, `ARQUITETURA`, `DESIGN_SYSTEM`/tokens, `DADOS`/schema, `API_CONTATO`, critérios de QA e segurança | **M0:** Afrodite inicia sem bloqueio de copy, token, dado ou contrato |
| **1. Produção** | Sessão atual | Executar as 15 frentes na propriedade de arquivos do briefing | Home/catálogo, i18n, corporate, analytics, concierge, API, PWA, CI, docs, legal, QA | **M1:** cada frente entrega artefato + snippet + evidência; zero edição fora do escopo |
| **2. Integração** | Sessão atual, após M1 | Zeus pluga módulos; Afrodite dá suporte | `index.html` integrado, ordem de scripts, CSS, CSP/headers, catálogo preservado | **M2:** `npm run build` e `npm test` verdes; 27 produtos; IDs/contratos intactos |
| **3. Gate final** | Sessão atual, antes do go-live | Provar qualidade, segurança e conformidade | QA visual/funcional, WCAG AA, CSP/API/LGPD, páginas legais, docs e pendências | **M3:** zero P0/P1; Argos e Ártemis aprovam; Zeus aceita o DoD |
| **4. Go-live** | Pós-aprovação | Publicar com risco controlado | Deploy Vercel, smoke de produção, rollback, monitoramento | **M4:** usuário autoriza; site no ar com smoke verde |

## 2. Caminho crítico e atrasos previsíveis

**Caminho crítico:** M0 → **Afrodite** (home + catálogo) → **Zeus** (integração) → **Argos** (QA) → **Ártemis** (security gate) → aprovação do usuário → deploy.

- **Afrodite é o gargalo:** concentra `index.html`, `styles.css`, `app.js`, `stores.js`, catálogo e os módulos i18n/corporate. Mitigação: congelar escopo, entregar tokens/copy/contratos antes e deixar Zeus integrar analytics/concierge.
- **Zeus é o segundo gargalo:** quatro módulos no mesmo `index.html` podem conflitar em ordem de script, CSP e IDs. Mitigação: snippets obrigatórios, `INTEGRACAO.md` como checklist e uma única janela de integração.
- **Pendências de dados/copy** (CNPJ, imprensa, carreiras, analytics, provedor de contato) podem travar seções e go-live. Mitigação: `null`/`status: pendente`, copy de compromisso e fallback WhatsApp.
- **Performance/PWA:** áudio de 6,7 MB sob demanda, 3D, fontes externas e imagens pesadas. Mitigação: áudio sob demanda, lazy-load, orçamento e Lighthouse em 4G.
- **Segurança/legal e acessos:** gate tardio ou falta de Vercel/DNS atrasam a publicação. Mitigação: revisão antecipada de CSP/headers/API, minutas legais em paralelo e checklist de acessos antes de M3.

## 3. RACI e dependências

> **R** executa · **A** aprova · **C** consulta · **I** informa.

| Frente | R | A | C | I | Depende de / alimenta |
|---|---|---|---|---|---|
| Requisitos, copy e critérios | Apolo | Zeus | Hera, Íris | Afrodite | Briefing; libera front e docs |
| Design system e tokens | Íris | Zeus | Afrodite, Apolo | Hera | Briefing; libera Afrodite |
| Arquitetura, i18n e contratos | Atena | Zeus | Afrodite, Hefesto, Hécate | Hera | Briefing; libera integração |
| Home corporativa + catálogo | Afrodite | Zeus | Íris, Apolo, Atena, Hades | Todas | Tokens, copy, contratos, dados |
| API de contato | Hefesto | Zeus | Ártemis, Afrodite | Hera | Contrato do formulário; libera contato |
| PWA, service worker e offline | Daedalus | Zeus | Afrodite, Atlas | Hera | Lista de assets; libera go-live |
| Dados corporativos e schema | Hades | Zeus | Apolo, Mnemósine | Afrodite | Briefing; libera JSON-LD e seções |
| Analytics | Deméter | Zeus | Ártemis, Afrodite | Hera | Ferramenta escolhida; libera go-live |
| Segurança, CSP e LGPD | Ártemis | Zeus | Hefesto, Hermes, Mnemósine | Todas | `vercel.json`, API, legal; gate final |
| CI/CD | Hermes | Zeus | Argos, Atlas | Hera | Scripts existentes; roda em paralelo |
| Infra, Vercel, domínio e DNS | Atlas | Zeus | Hermes | Hera | Acessos do usuário; libera go-live |
| QA, E2E e acessibilidade | Argos | Zeus | Afrodite, Íris | Todas | M2 verde; gate final |
| Docs, README e páginas legais | Mnemósine | Zeus | Ártemis, Apolo | Todas | Copy e dados jurídicos |
| IA/concierge | Hécate | Zeus | Apolo, Ártemis | Afrodite | FAQ aprovado; módulo via snippet |
| Plano, status, riscos e DoD | Hera | Zeus | Todas | Todas | Contínuo; reporta a Zeus |
| Integração e aprovação final | Zeus | Zeus | Afrodite, Hera | Todas | M1 concluído; fecha M2/M3 |

## 4. Riscos

| Risco | Prob. | Impacto | Mitigação | Dono |
|---|---|---|---|---|
| Sobrecarga da Afrodite e fila no frontend | Alta | Alto | Congelar escopo; contratos prontos antes; Zeus integra módulos; sem novas features de UI | Hera + Zeus |
| Conflito de edição/integração no `index.html` | Alta | Alto | Propriedade do briefing; snippets; janela única; checklist `INTEGRACAO.md` | Zeus + Afrodite |
| Dados/copy pendentes (CNPJ, imprensa, carreiras, fotos) | Alta | Médio | `null`/`pendente`; copy de compromisso; `PENDENCIAS.md`; decisão do usuário | Apolo + Mnemósine |
| API de contato sem provedor/credencial | Média | Alto | Fallback WhatsApp; resposta 503 clara; decisão antes do go-live | Hefesto + Ártemis |
| Gate de segurança/legal tardio | Média | Alto | Revisão antecipada de CSP/headers/API e minutas legais; veto de Ártemis | Ártemis + Mnemósine |
| Performance: áudio, 3D, fontes e imagens | Média | Médio | Áudio sob demanda; lazy-load; budget; Lighthouse mobile 4G | Afrodite + Daedalus |
| i18n incompleto e SEO EN/ES limitado | Média | Médio | PT como fonte; fallback; cobertura de chaves; hreflang best effort e dívida registrada | Atena + Afrodite |
| Acesso a Vercel/domínio ou DNS | Média | Alto | Checklist de acessos antes de M3; deploy só pós-aprovação | Atlas + Hermes |
| Scope creep durante a sessão | Alta | Médio | Ideia nova vai para backlog pós-aprovação; não entra no M2 | Hera + Zeus |

## 5. Critérios de aceite

- Home com todas as seções e copy aprovada; catálogo, busca, filtros, modal, lightbox e wishlist funcionando.
- 27 produtos renderizados; `produtos.json` e `stores.js` preservados como fontes canônicas.
- PT/EN/ES na camada corporativa, fallback PT, `html lang`, título e meta description atualizados.
- Responsivo em 360, 768, 1024 e 1440 px; WCAG 2.2 AA; `prefers-reduced-motion` respeitado.
- `npm run build`, `npm test` e `node scripts/test-site.js` passando no commit aprovado.
- Formulário com validação, honeypot, `POST /api/contact` e fallback WhatsApp.
- Páginas legais publicadas; SEO com title/description/OG/canonical/JSON-LD/sitemap/hreflang.
- Headers/CSP sem violação; sem segredos no cliente; docs e `PENDENCIAS.md` atualizados.

## 6. Checklist de go-live

- [ ] Aprovação formal do usuário em M3 e autorização de deploy.
- [ ] Build reproduzível no commit aprovado; `npm test` verde.
- [ ] Backup do deployment anterior e rollback documentado.
- [ ] Smoke em produção: home, 27 produtos, busca, modal, wishlist, i18n, contato e legal.
- [ ] CSP/headers validados; zero erro de console em desktop e mobile.
- [ ] Service worker com cache bump e fallback offline; API fora do cache.
- [ ] Domínio/SSL/canonical, `robots.txt` e `sitemap.xml` conferidos.
- [ ] Analytics/monitoramento ativos ou ausência aceita explicitamente.
- [ ] `PENDENCIAS.md` sem bloqueador de publicação; demais itens com dono e prazo pós-aprovação.

## 7. Decisões do usuário

1. **Dados jurídicos:** informar razão social/CNPJ e revisar privacidade/termos, ou autorizar publicação com esses dados marcados como pendentes?
2. **Formulário:** qual provedor (Resend/SMTP), qual e-mail de destino e quem configura a credencial? A chave não entra em documento nem em chat.
3. **Analytics:** GA4, Plausible, Matomo ou lançar sem medição nesta versão?
4. **Publicação:** liberar acesso à Vercel/domínio e autorizar o deploy pós-aprovação?
