# PENDÊNCIAS — dados que o site não pode inventar

> Atualizar ao final da entrega. Tudo aqui é dado real que só o cliente pode confirmar.

| # | Pendência | Onde impacta | Como resolver |
|---|---|---|---|
| 1 | Razão social e CNPJ | Rodapé, páginas legais, JSON-LD | Informar dados jurídicos oficiais |
| 2 | Ano de fundação | Seção "A Miplace" | Confirmar (o site informa 7 anos de mercado) |
| 3 | Nomes e bios da liderança | Governança / "Nosso time" | Enviar nomes, cargos e autorização de uso |
| 4 | Escritórios/operação internacional | Seção Presença | Confirmar países, endereços e datas; hoje só há lojas no Brasil |
| 5 | E-mail e telefone de imprensa | Central de Imprensa | Informar canais oficiais |
| 6 | E-mail/ATS de carreiras | Banco de talentos | Informar destino dos currículos |
| 7 | Provedor de envio do formulário | `api/contact.js` | Destino definido: `contasgeraljack@gmail.com`; fallback FormSubmit implementado. Falta clicar na ativação enviada ao e-mail de destino e, para o caminho principal, configurar `RESEND_API_KEY` e `CONTACT_FROM_EMAIL` verificado no Resend |
| 8 | Ferramenta de analytics | `modules/analytics.js` | Definir GA4/Plausible/Matomo e IDs |
| 9 | Métricas e metas ESG | Seção Compromissos | Enviar indicadores auditados antes de publicar números |
| 10 | Logos oficiais das marcas | Parede de marcas | Confirmar licença de uso; por ora usar tipografia |
| 11 | Fotos de loja, time e bastidores | Manifesto/Presença | Enviar acervo com direitos de uso |
| 12 | Vagas abertas | Carreiras | Integrar ATS ou listar vagas reais |
| 13 | Política de cookies | Privacidade | Definir se haverá rastreamento; hoje não há cookies de analytics |
| 14 | Revisão jurídica | Privacidade, Termos e Acessibilidade | Validar os três textos com advogado(a) e registrar a aprovação e a data |
| 15 | Domínio e e-mail corporativos | Site inteiro | Confirmar `miplacemagazine.com.br` e aliases |
| 16 | E-mail geral de atendimento | `company.json.channels.generalEmail`, rodapé e Contato | Informar e-mail oficial ou confirmar que o atendimento é só por formulário/WhatsApp |
| 17 | Horário de funcionamento por loja | `company.json.stores.items[].openingHours`, JSON-LD e seção Presença | Confirmar horário real das 4 lojas; `stores.js` não traz e o JSON-LD usa 09–18/09–13 fixo |
| 18 | URL do kit de imprensa | `company.json.channels.press.kitUrl`, seção Imprensa | Informar URL do material ou confirmar que será enviado sob solicitação |
| 19 | Encarregado de dados (DPO) | Política de Privacidade | Indicar nome/canal ou confirmar dispensa legal; publicar na política |
| 20 | Transferência internacional e contratos com operadores | Política de Privacidade | Validar Vercel, Google Fonts e cdnjs; firmar DPA se necessário |
| 21 | Prazo de retenção do formulário e dos logs | Política de Privacidade | Definir prazos com jurídico e operação |
| 22 | Foro e lei aplicável nos Termos | Termos de Uso | Validar a cláusula de foro com jurídico |
| 23 | Sitemap das páginas legais | SEO | Links do rodapé já implementados; Hermes/Atlas devem incluir as três páginas no `sitemap.xml` |
| 24 | Versão 2.0.0 no `package.json` e nos assets | Release | Elevar a versão e as query strings na integração final |
| 25 | Publicação das páginas legais | Release | Aprovar a revisão jurídica e publicar; manter a data de atualização |
| 26 | Assuntos "Privacidade" e "Acessibilidade" no formulário | Contato e páginas legais | Afrodite inclui as opções no `select`; API já aceita `subject` livre |
| 27 | DNS e projeto Vercel | Publicação | `miplacemagazine.com.br` e `www` estão NXDOMAIN; criar zona DNS, conectar o projeto e validar TLS/redirects |
| 28 | Credenciais de envio do formulário | `api/contact.js` | Configurar `RESEND_API_KEY` e `CONTACT_FROM_EMAIL` (remetente verificado); `CONTACT_TO_EMAIL` já tem padrão `contasgeraljack@gmail.com`. Sem as duas, a API responde 503 e o front-end usa o fallback FormSubmit (após ativação única no e-mail de destino) |
| 29 | Teste runtime/E2E | Catálogo, formulário e PWA | Playwright/Cypress em fase 2; hoje há teste Node de estrutura + smoke manual em Chromium |
| 30 | HSTS `preload` e subdomínios | Segurança/SEO | Auditar todos os subdomínios antes de submeter o domínio à lista de preload |

## Resolvidos na integração 2.0.0

- **23 — Sitemap:** `sitemap.xml` agora inclui as três páginas legais.
- **24 — Versão:** `package.json`/`package-lock.json` em `2.0.0` e assets com `?v=2.0.0`.
- **26 — Assuntos do formulário:** opções "Privacidade" e "Acessibilidade" adicionadas em PT/EN/ES.
- **17 — Horários:** `openingHoursSpecification` removido do JSON-LD até confirmação; a seção Presença continua exibindo os endereços reais.
- **Vazamento de arquivos internos:** `.vercelignore` exclui docs, scripts de desenvolvimento, design, CI e o MP3 não referenciado.

## Regra

Enquanto a pendência não for resolvida, o site usa linguagem de compromisso, `null` em JSON ou omite a informação. Nunca preencher com dado fictício.
