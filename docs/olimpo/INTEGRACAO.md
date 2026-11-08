# INTEGRAÇÃO — checklist do Zeus

> Uso interno. Rodar após o retorno das frentes.

## 1. Ordem de scripts no `index.html`

```html
<script src="stores.js?v=2.0.11" defer></script>
<script src="modules/ui.js?v=2.0.11" defer></script>
<script src="modules/i18n.js?v=2.0.11" defer></script>
<script src="modules/analytics.js?v=2.0.11" defer></script>
<script src="modules/catalog.js?v=2.0.11" defer></script>
<script src="modules/modal.js?v=2.0.11" defer></script>
<script src="modules/wishlist.js?v=2.0.11" defer></script>
<script src="modules/scroll.js?v=2.0.11" defer></script>
<script src="modules/corporate.js?v=2.0.11" defer></script>
<script src="modules/concierge.js?v=2.0.11" defer></script>
<script src="app.js?v=2.0.11" defer></script>
```

## 2. Checagens de integração

- [ ] Todos os IDs/contratos do briefing preservados.
- [ ] `#products-grid` renderiza 27 produtos.
- [ ] Busca, filtros, modal, lightbox e wishlist funcionando.
- [ ] i18n troca PT/EN/ES e persiste.
- [ ] Formulário faz POST em `/api/contact`; fallback WhatsApp funciona.
- [ ] Menu mobile abre/fecha; ESC fecha; foco retorna.
- [ ] Música só após interação; controle visível.
- [ ] JSON-LD `Organization` + `WebSite` válido.
- [ ] Remover `openingHoursSpecification` do JSON-LD até o cliente confirmar os horários reais das 4 lojas (hoje 09–18/09–13 é dado não confirmado).
- [ ] `sitemap.xml` inclui as páginas novas.
- [ ] `sw.js` não cacheia a API e faz fallback offline.
- [ ] Concierge integrado com `modules/concierge.js?v=2.0.11` e `content/concierge-faq.json` publicado; testar ESC, foco, mobile 360px e fallback WhatsApp.
- [ ] Analytics integrado com `modules/analytics.js?v=2.0.11`; disparar `page_view`, `view_item`, `contact_whatsapp` e `generate_lead`.
- [ ] `vercel.json`: `/sw.js` com `Cache-Control: no-cache`, `/api/*` com `no-store`, HTML com `must-revalidate`; assets `immutable` só com `?v=` bumped no mesmo release.
- [ ] `favicon_io/site.webmanifest` com `scope: "/"` e `start_url: "/"` (correto para manifest em subpasta).
- [ ] Sem erro de console em desktop e mobile.

## 3. Comandos

```bash
npm run build
npm test
node scripts/test-site.js
npx serve .   # smoke test local
```

## 4. QA visual

- 360px, 768px, 1024px, 1440px.
- Contraste AA, foco visível, teclado.
- `prefers-reduced-motion`.
- Imagens sem distorção; vídeo com poster.
- Lighthouse: Performance >= 85 mobile, Acessibilidade >= 95, Best Practices >= 95, SEO >= 95 (meta aspiracional; registrar medição real).

## 5. Riscos conhecidos

- Conflito de edição em `index.html` se algum agente ignorar a propriedade de arquivos.
- Service worker antigo servindo assets velhos: bump de `BUILD_TIMESTAMP` e hard refresh.
- CSP x import map inline: manter compatibilidade e documentar.
- Formulário sem `RESEND_API_KEY`: retorno 503 + fallback WhatsApp.
- i18n client-side: SEO de EN/ES limitado; aceitável nesta fase, registrar como evolução (SSG/rotas por idioma).
- Font Awesome e Google Fonts externos: performance/privacidade; registrar como dívida técnica.
- 3D (`three-hero.js`) pode não encontrar os seletores antigos; se quebrar, desativar o carregamento e manter fallback estático.
