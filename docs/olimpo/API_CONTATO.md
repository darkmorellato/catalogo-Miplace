# API de Contato — `POST /api/contact`

> Implementação: `api/contact.js` · Runtime: Vercel Node.js 22 (CommonJS)
> Contrato consumido pelo formulário da seção Contato. Sem persistência local: a API apenas valida e encaminha por e-mail.

## 1. Contrato

**Método:** `POST`
**Content-Type:** `application/json` (aceita `application/json; charset=utf-8`)
**Tamanho máximo do corpo:** 20 KB (20.480 bytes)

| Campo | Tipo | Obrigatório | Limite | Regra |
|---|---|---|---|---|
| `name` | string | sim | 2–100 | Texto aparado; não vazio |
| `email` | string | sim | 5–254 | Formato `usuario@dominio.tld` |
| `phone` | string | não | 30 | 8–15 dígitos; aceita `+`, espaços, `()`, `.` e `-` |
| `subject` | string | não | 120 | Padrão: `Contato pelo site` |
| `message` | string | sim | 10–5.000 | Texto aparado; quebras de linha preservadas |
| `consent` | boolean | sim | — | Precisa ser exatamente `true` |
| `website` | string | não | — | Honeypot: precisa estar vazio |

Campos desconhecidos são ignorados. O consentimento não é aceito como string (`"true"` é recusado).

```ts
type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  consent: true;
  website?: '';
};
```

## 2. Respostas

Todas as respostas são JSON, com `Content-Type: application/json; charset=utf-8` e `Cache-Control: no-store`.

| HTTP | `code` | Quando |
|---|---|---|
| 200 | `SENT` | E-mail aceito pelo Resend |
| 200 | `OK` | Honeypot preenchido; sucesso silencioso, sem envio |
| 400 | `VALIDATION_ERROR` | Campo inválido; inclui `errors[]` |
| 400 | `INVALID_JSON` | Corpo não é um objeto JSON válido |
| 400 | `EMPTY_BODY` | Corpo vazio |
| 405 | `METHOD_NOT_ALLOWED` | Método diferente de `POST`; envia `Allow: POST` |
| 413 | `PAYLOAD_TOO_LARGE` | Corpo acima de 20 KB |
| 415 | `UNSUPPORTED_MEDIA_TYPE` | Content-Type diferente de JSON |
| 429 | `RATE_LIMITED` | Mais de 5 requisições por IP em 10 minutos; envia `Retry-After` |
| 502 | `EMAIL_SEND_FAILED` | Resend recusou ou falhou de rede |
| 503 | `EMAIL_NOT_CONFIGURED` | Faltam variáveis de ambiente |
| 504 | `EMAIL_TIMEOUT` | Resend não respondeu em 10 s |
| 500 | `INTERNAL_ERROR` | Falha inesperada; sem stack trace na resposta |

**Sucesso**
```json
{ "ok": true, "code": "SENT" }
```

**Validação**
```json
{
  "ok": false,
  "code": "VALIDATION_ERROR",
  "message": "Revise os campos informados.",
  "errors": [
    { "field": "consent", "message": "É necessário autorizar o contato." }
  ]
}
```

**Sem configuração**
```json
{
  "ok": false,
  "code": "EMAIL_NOT_CONFIGURED",
  "message": "Envio por e-mail indisponível. Fale conosco pelo WhatsApp."
}
```

## 3. Variáveis de ambiente

Configurar em **Vercel → Project Settings → Environment Variables** (Production, Preview e Development) e refazer o deploy.

| Variável | Obrigatória | Descrição |
|---|---|---|
| `RESEND_API_KEY` | sim | Chave secreta do Resend. Nunca expor no cliente (`VITE_*`). |
| `CONTACT_TO_EMAIL` | não | Destinatário. Padrão: `contasgeraljack@gmail.com`. Aceita um ou mais endereços separados por vírgula; cada endereço é validado. |
| `CONTACT_FROM_EMAIL` | sim | Remetente verificado no Resend. Aceita `Nome <email@dominio>`; o domínio precisa estar verificado. Não há valor padrão. |

Sem as três variáveis, a API responde `503 EMAIL_NOT_CONFIGURED` e o formulário deve oferecer o WhatsApp.

> `CONTACT_FROM_EMAIL` é necessária porque o Resend exige um remetente e o código não pode inventar um endereço. Use o endereço oficial já verificado no Resend, por exemplo `Miplace Group <remetente-verificado@example.com>` (substituir pelo real).

### 3.1 Contingência de formulário

Se a API não estiver disponível (404), não estiver configurada (503) ou o Resend recusar o envio (502), o front-end tenta o FormSubmit em `https://formsubmit.co/ajax/contasgeraljack@gmail.com`. O primeiro envio exige uma ativação única no e-mail de destino. Em produção, prefira o caminho Resend; o fallback existe para o site estático local e para emergências. O CSP precisa manter `https://formsubmit.co` em `connect-src`.

## 4. Exemplos de uso

**Sucesso**
```bash
curl -i -X POST https://miplacemagazine.com.br/api/contact \
  -H 'Content-Type: application/json' \
  --data '{
    "name": "Ana Souza",
    "email": "ana@example.com",
    "phone": "(19) 99999-9999",
    "subject": "Troca de aparelho",
    "message": "Gostaria de saber como funciona a troca do meu aparelho.",
    "consent": true,
    "website": ""
  }'
```

**Erro de validação**
```bash
curl -i -X POST https://miplacemagazine.com.br/api/contact \
  -H 'Content-Type: application/json' \
  --data '{
    "name": "Ana",
    "email": "email-invalido",
    "message": "Curta",
    "consent": false
  }'
```

**Honeypot preenchido (simula bot)**
```bash
curl -i -X POST https://miplacemagazine.com.br/api/contact \
  -H 'Content-Type: application/json' \
  --data '{"name":"Bot","email":"bot@example.com","message":"spam de teste","consent":true,"website":"http://spam.example"}'
```

**Local com as Functions da Vercel**
```bash
npx vercel dev
curl -i -X POST http://localhost:3000/api/contact \
  -H 'Content-Type: application/json' \
  --data '{"name":"Ana Souza","email":"ana@example.com","message":"Mensagem de teste local.","consent":true,"website":""}'
```

## 5. Limites e comportamento

- **Rate limit em memória:** 5 requisições por IP a cada 10 minutos. O estado é por instância serverless; reinícios e múltiplas instâncias podem permitir mais tentativas. Para limite global, usar Redis/KV (Upstash, Vercel KV) com chave por IP.
- **IP:** lido de `x-forwarded-for` (primeiro valor) ou `x-real-ip`; em último caso, `req.socket.remoteAddress`.
- **Timeout do Resend:** 10 segundos. Não há retry automático para evitar e-mail duplicado; o front pode tentar novamente após erro.
- **Sem CORS:** o endpoint é same-origin. Não é necessário liberar cabeçalhos para o site.
- **Sem persistência:** nenhum dado é gravado em banco; o conteúdo segue apenas para o e-mail configurado.
- **Logs:** mínimo, sem PII. Erros de provedor registram apenas o status HTTP; erros inesperados registram apenas o nome do erro.
- **Honeypot:** campo `website` preenchido recebe `200 OK` sem envio; não revela a detecção ao bot.

## 6. Checklist LGPD

- [x] Consentimento explícito: `consent === true` é obrigatório e o e-mail registra “Consentimento LGPD: sim”.
- [x] Minimização: apenas nome, e-mail, telefone, assunto e mensagem; não solicitar CPF, dados de pagamento ou dados sensíveis.
- [x] Finalidade: responder ao contato e encaminhar ao time responsável.
- [x] Segurança: chave do Resend somente no servidor; TLS; headers `no-store`; honeypot; rate limit.
- [x] Sem PII nos logs da aplicação.
- [ ] Definir prazo de retenção das mensagens na caixa `CONTACT_TO_EMAIL` e no Resend; excluir após o prazo definido.
- [ ] Formalizar base legal e aviso de privacidade no formulário, com link para `privacidade.html` (Mnemósine/Íris).
- [ ] Verificar DPA/subprocessador e transferência internacional do Resend.
- [ ] Definir canal e prazo para direitos do titular (acesso, correção, exclusão).
- [ ] Revisão jurídica dos textos (PENDENCIAS #14).
- [ ] Confirmar o e-mail corporativo oficial e o domínio verificado (PENDENCIAS #5, #7 e #15).

> O e-mail recebido é o registro operacional do consentimento nesta versão. Se o jurídico exigir trilha auditável separada, criar um log com `consentAt`, versão do aviso e finalidade — sem armazenar IP em texto claro.

## 7. Integração no front

- Enviar `fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })`.
- `consent` deve ser booleano, não string.
- Em `200 SENT`: mostrar confirmação e limpar o formulário.
- Em `503 EMAIL_NOT_CONFIGURED` ou qualquer `5xx`: mostrar fallback de WhatsApp com a mensagem já preenchida.
- Em `400 VALIDATION_ERROR`: mapear `errors[].field` para as mensagens dos campos e usar `aria-live`.
- Em `429`: informar o tempo de espera de `Retry-After`.
- O campo `website` deve ser visualmente oculto e acessível apenas por bot (não usar `display:none` se isso impedir autofill; usar posicionamento fora da tela e `tabindex="-1"`).
- Nenhum segredo deve aparecer no HTML, JS ou `localStorage`.

## 8. Evidência de teste

```bash
node --check api/contact.js
node /tmp/opencode/test-contact.js
```

Resultado: **19/19 testes passaram**, cobrindo 405, 415, JSON inválido, corpo vazio, 413 por `Content-Length` e por stream, consentimento ausente e como string, e-mail inválido, honeypot, 503 sem configuração e com configuração inválida, envio com payload correto ao Resend, sanitização de assunto/HTML, 502 do provedor, 504 por timeout, rate limit na 6ª requisição, `Content-Type` com charset e corpo já parseado pela Vercel.

> O harness de teste fica fora do repositório (`/tmp/opencode/test-contact.js`) e não é commitado.
