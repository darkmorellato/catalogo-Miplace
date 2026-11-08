'use strict';

/**
 * POST /api/contact — formulário de contato do site Miplace Group.
 *
 * Runtime: Vercel Node.js 22 (CommonJS).
 * Dependências: apenas `fetch` nativo e variáveis de ambiente.
 *
 * Variáveis:
 * - RESEND_API_KEY
 * - CONTACT_TO_EMAIL
 * - CONTACT_FROM_EMAIL
 */

const MAX_BODY_BYTES = 20 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_MAX_KEYS = 10000;
const EMAIL_TIMEOUT_MS = 10000;
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

const EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
const BLOCKED_EMAIL_DOMAIN_RE = /(^|\.)(example|test|teste|invalid|localhost|local|10minutemail|guerrillamail|mailinator|tempmail|temp-mail|yopmail|maildrop|throwawaymail|getnada|sharklasers|trashmail|fakeinbox|dispostable|mailnesia|moakt|mintemail|emailondeck)(\.|$)/i;

/** @type {Map<string, number[]>} */
const rateLimitBuckets = new Map();

class ApiError extends Error {
    /**
     * @param {number} status
     * @param {string} code
     * @param {string} message
     */
    constructor(status, code, message) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
    }
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
function isPlainObject(value) {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        Object.prototype.toString.call(value) === '[object Object]'
    );
}

/**
 * @param {string} value
 * @returns {string}
 */
function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (character) => {
        switch (character) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#39;';
            default: return character;
        }
    });
}

/**
 * @param {unknown} value
 * @returns {string}
 */
function normalizeAddress(value) {
    const text = String(value || '').trim();
    const match = text.match(/<([^<>]+)>/);
    return (match ? match[1] : text).trim();
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isValidEmail(value) {
    const email = String(value || '').trim();
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) return false;

    const at = email.lastIndexOf('@');
    if (at <= 0 || at === email.length - 1) return false;

    const local = email.slice(0, at);
    const domain = email.slice(at + 1).toLowerCase();

    if (local.length > 64) return false;
    if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
    if (domain.length > 253) return false;
    if (BLOCKED_EMAIL_DOMAIN_RE.test(domain)) return false;

    const tld = domain.slice(domain.lastIndexOf('.') + 1);
    return /^[a-z]{2,24}$/.test(tld);
}

/**
 * @param {string} value
 * @returns {boolean}
 */
function isValidPhone(value) {
    const phone = String(value || '').trim();
    if (!/^\(\d{2}\) 9\d{4}-\d{4}$/.test(phone)) return false;

    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 11) return false;

    const ddd = Number(digits.slice(0, 2));
    return Number.isInteger(ddd) && ddd >= 11 && ddd <= 99;
}

/**
 * @param {Record<string, unknown>} input
 * @param {string} field
 * @param {string} label
 * @param {{ required?: boolean, min?: number, max?: number }} options
 * @returns {{ value: string, error?: string }}
 */
function readTextField(input, field, label, options = {}) {
    const { required = false, min = 0, max = Number.POSITIVE_INFINITY } = options;
    const raw = input[field];

    if (raw === undefined || raw === null) {
        return required
            ? { value: '', error: `${label} é obrigatório.` }
            : { value: '' };
    }

    if (typeof raw !== 'string') {
        return { value: '', error: `${label} deve ser texto.` };
    }

    const value = raw.trim();

    if (required && value.length === 0) {
        return { value: '', error: `${label} é obrigatório.` };
    }
    if (value.length > 0 && value.length < min) {
        return { value, error: `${label} deve ter pelo menos ${min} caracteres.` };
    }
    if (value.length > max) {
        return { value, error: `${label} deve ter no máximo ${max} caracteres.` };
    }

    return { value };
}

/**
 * @param {Record<string, unknown>} input
 * @returns {{ data: { name: string, email: string, phone: string, subject: string, message: string }, errors: Array<{ field: string, message: string }> }}
 */
function validatePayload(input) {
    /** @type {Array<{ field: string, message: string }>} */
    const errors = [];

    const name = readTextField(input, 'name', 'Nome', { required: true, min: 2, max: 100 });
    if (name.error) errors.push({ field: 'name', message: name.error });

    const email = readTextField(input, 'email', 'E-mail', { required: true, min: 5, max: 254 });
    if (email.error) {
        errors.push({ field: 'email', message: email.error });
    } else if (!isValidEmail(email.value)) {
        errors.push({ field: 'email', message: 'Informe um e-mail válido.' });
    }

    const phone = readTextField(input, 'phone', 'Telefone', { max: 30 });
    if (phone.error) {
        errors.push({ field: 'phone', message: phone.error });
    } else if (phone.value.length > 0 && !isValidPhone(phone.value)) {
        errors.push({ field: 'phone', message: 'Informe um telefone válido com DDD.' });
    }

    const subject = readTextField(input, 'subject', 'Assunto', { max: 120 });
    if (subject.error) errors.push({ field: 'subject', message: subject.error });

    const message = readTextField(input, 'message', 'Mensagem', { required: true, min: 10, max: 5000 });
    if (message.error) errors.push({ field: 'message', message: message.error });

    if (input.consent !== true) {
        errors.push({ field: 'consent', message: 'É necessário autorizar o contato.' });
    }

    return {
        data: {
            name: name.value,
            email: email.value,
            phone: phone.value,
            subject: subject.value,
            message: message.value,
        },
        errors,
    };
}

/**
 * Honeypot: qualquer preenchimento é tratado como bot e recebe sucesso silencioso.
 * @param {Record<string, unknown>} input
 * @returns {boolean}
 */
function isHoneypotFilled(input) {
    const value = input.website;
    if (value === undefined || value === null) return false;
    if (typeof value !== 'string') return true;
    return value.trim().length > 0;
}

/**
 * @param {string} headerValue
 * @returns {boolean}
 */
function isJsonContentType(headerValue) {
    return /^application\/json(?:\s*;|$)/i.test(headerValue);
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {string} name
 * @returns {string}
 */
function getHeader(req, name) {
    const headers = req && req.headers ? req.headers : {};
    const value = headers[name] || headers[name.toLowerCase()];
    if (Array.isArray(value)) return value.length > 0 ? String(value[0]) : '';
    return typeof value === 'string' ? value : '';
}

/**
 * @param {string} value
 * @returns {string}
 */
function normalizeIp(value) {
    const text = String(value || '').trim();
    return text.startsWith('::ffff:') ? text.slice(7) : text;
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {string}
 */
function getClientIp(req) {
    const forwarded = getHeader(req, 'x-forwarded-for');
    if (forwarded) {
        const first = forwarded.split(',')[0].trim();
        if (first) return normalizeIp(first);
    }

    const realIp = getHeader(req, 'x-real-ip');
    if (realIp) return normalizeIp(realIp);

    const remoteAddress = req && req.socket && typeof req.socket.remoteAddress === 'string'
        ? req.socket.remoteAddress
        : '';

    return normalizeIp(remoteAddress) || 'unknown';
}

/**
 * Rate limit em memória: 5 requisições por IP a cada 10 minutos.
 * Em serverless o estado é por instância; ver limitações na documentação.
 * @param {string} ip
 * @returns {{ allowed: boolean, retryAfter?: number }}
 */
function checkRateLimit(ip) {
    const now = Date.now();
    const previous = rateLimitBuckets.get(ip) || [];
    const active = previous.filter((timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS);

    if (active.length >= RATE_LIMIT_MAX) {
        const retryAfter = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - active[0])) / 1000));
        rateLimitBuckets.set(ip, active);
        return { allowed: false, retryAfter };
    }

    active.push(now);
    rateLimitBuckets.set(ip, active);

    if (rateLimitBuckets.size > RATE_LIMIT_MAX_KEYS) {
        const oldestKey = rateLimitBuckets.keys().next().value;
        if (oldestKey !== undefined) rateLimitBuckets.delete(oldestKey);
    }

    return { allowed: true };
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {void}
 */
function assertContentLength(req) {
    const raw = getHeader(req, 'content-length');
    if (!raw) return;

    const length = Number.parseInt(raw, 10);
    if (Number.isFinite(length) && length > MAX_BODY_BYTES) {
        throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'O corpo da requisição excede 20 KB.');
    }
}

/**
 * Lê o corpo tanto do body parser da Vercel quanto do stream do Node.
 * @param {import('http').IncomingMessage & { body?: unknown }} req
 * @returns {Promise<Buffer>}
 */
async function readRawBody(req) {
    if (req.body !== undefined && req.body !== null) {
        let buffer;

        if (Buffer.isBuffer(req.body)) {
            buffer = req.body;
        } else if (typeof req.body === 'string') {
            buffer = Buffer.from(req.body, 'utf8');
        } else if (typeof req.body === 'object') {
            let json;
            try {
                json = JSON.stringify(req.body);
            } catch {
                throw new ApiError(400, 'INVALID_JSON', 'Não foi possível ler o JSON enviado.');
            }
            buffer = Buffer.from(json, 'utf8');
        } else {
            throw new ApiError(400, 'INVALID_JSON', 'O corpo deve ser um objeto JSON.');
        }

        if (buffer.length > MAX_BODY_BYTES) {
            throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'O corpo da requisição excede 20 KB.');
        }
        return buffer;
    }

    /** @type {Buffer[]} */
    const chunks = [];
    let total = 0;

    for await (const chunk of req) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += buffer.length;
        if (total > MAX_BODY_BYTES) {
            throw new ApiError(413, 'PAYLOAD_TOO_LARGE', 'O corpo da requisição excede 20 KB.');
        }
        chunks.push(buffer);
    }

    return Buffer.concat(chunks);
}

/**
 * @param {Buffer} buffer
 * @returns {Record<string, unknown>}
 */
function parseJsonBody(buffer) {
    if (buffer.length === 0) {
        throw new ApiError(400, 'EMPTY_BODY', 'Envie um objeto JSON com os dados do contato.');
    }

    let parsed;
    try {
        const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
        parsed = JSON.parse(text);
    } catch {
        throw new ApiError(400, 'INVALID_JSON', 'JSON inválido.');
    }

    if (!isPlainObject(parsed)) {
        throw new ApiError(400, 'INVALID_JSON', 'O corpo deve ser um objeto JSON.');
    }

    return parsed;
}

/**
 * @returns {{ apiKey: string, to: string[], from: string } | null}
 */
function readEmailConfig() {
    const apiKey = String(process.env.RESEND_API_KEY || '').trim();
    const toRaw = String(process.env.CONTACT_TO_EMAIL || 'contasgeraljack@gmail.com').trim();
    const from = String(process.env.CONTACT_FROM_EMAIL || '').trim();

    if (!apiKey || !toRaw || !from) return null;
    if (/[\r\n]/.test(toRaw) || /[\r\n]/.test(from)) return null;

    const to = toRaw
        .split(',')
        .map((address) => address.trim())
        .filter(Boolean);

    if (to.length === 0) return null;
    if (!to.every((address) => isValidEmail(normalizeAddress(address)))) return null;
    if (!isValidEmail(normalizeAddress(from))) return null;

    return { apiKey, to, from };
}

/**
 * @param {{ name: string, email: string, phone: string, subject: string, message: string }} data
 * @returns {{ subject: string, text: string, html: string }}
 */
function buildEmail(data) {
    const subject = `[Site Miplace] ${data.subject || 'Contato pelo site'}`
        .replace(/[\r\n]+/g, ' ')
        .slice(0, 180);
    const receivedAt = new Date().toISOString();
    const resolvedSubject = data.subject || 'Contato pelo site';

    const lines = [
        `Nome: ${data.name}`,
        `E-mail: ${data.email}`,
        data.phone ? `Telefone: ${data.phone}` : null,
        `Assunto: ${resolvedSubject}`,
        '',
        'Mensagem:',
        data.message,
        '',
        'Consentimento LGPD: sim',
        `Recebido em: ${receivedAt}`,
    ].filter((line) => line !== null);

    const rows = [
        ['Nome', data.name],
        ['E-mail', data.email],
        ...(data.phone ? [['Telefone', data.phone]] : []),
        ['Assunto', resolvedSubject],
        ['Recebido em', receivedAt],
    ]
        .map(([label, value]) => (
            `<tr><th align="left" style="padding:4px 12px 4px 0;vertical-align:top;">${escapeHtml(label)}</th>` +
            `<td style="padding:4px 0;">${escapeHtml(value)}</td></tr>`
        ))
        .join('');

    const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#141414;line-height:1.5;">
  <h2 style="font-size:18px;margin:0 0 16px;">Novo contato pelo site</h2>
  <table style="border-collapse:collapse;">${rows}</table>
  <p style="margin:16px 0 4px;"><strong>Mensagem</strong></p>
  <div style="white-space:pre-wrap;border-left:3px solid #8c1d1d;padding-left:12px;">${escapeHtml(data.message)}</div>
  <p style="margin-top:16px;color:#79736b;font-size:12px;">Consentimento LGPD registrado no envio.</p>
</div>`;

    return { subject, text: lines.join('\n'), html };
}

/**
 * @param {{ apiKey: string, to: string[], from: string }} config
 * @param {{ name: string, email: string, phone: string, subject: string, message: string }} data
 * @returns {Promise<void>}
 */
async function sendEmail(config, data) {
    const email = buildEmail(data);
    const signal = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(EMAIL_TIMEOUT_MS)
        : undefined;

    const response = await fetch(RESEND_ENDPOINT, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: config.from,
            to: config.to,
            subject: email.subject,
            text: email.text,
            html: email.html,
            reply_to: data.email,
        }),
        signal,
    });

    if (!response.ok) {
        const error = new Error('Resend request failed');
        // @ts-ignore — status é apenas para log, sem expor ao cliente.
        error.status = response.status;
        throw error;
    }
}

/**
 * @param {import('http').ServerResponse} res
 * @param {number} status
 * @param {Record<string, unknown>} payload
 * @param {Record<string, string>} [extraHeaders]
 * @returns {void}
 */
function sendJson(res, status, payload, extraHeaders) {
    res.statusCode = status;

    if (typeof res.setHeader === 'function') {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store, max-age=0');
        res.setHeader('X-Content-Type-Options', 'nosniff');

        if (extraHeaders) {
            for (const [key, value] of Object.entries(extraHeaders)) {
                res.setHeader(key, value);
            }
        }
    }

    res.end(JSON.stringify(payload));
}

/**
 * @param {import('http').IncomingMessage & { body?: unknown }} req
 * @param {import('http').ServerResponse} res
 * @returns {Promise<void>}
 */
async function handler(req, res) {
    try {
        const method = String((req && req.method) || '').toUpperCase();

        if (method !== 'POST') {
            sendJson(res, 405, {
                ok: false,
                code: 'METHOD_NOT_ALLOWED',
                message: 'Use POST para enviar o formulário.',
            }, { Allow: 'POST' });
            return;
        }

        if (!isJsonContentType(getHeader(req, 'content-type'))) {
            sendJson(res, 415, {
                ok: false,
                code: 'UNSUPPORTED_MEDIA_TYPE',
                message: 'Envie o corpo como application/json.',
            });
            return;
        }

        const rateLimit = checkRateLimit(getClientIp(req));
        if (!rateLimit.allowed) {
            sendJson(res, 429, {
                ok: false,
                code: 'RATE_LIMITED',
                message: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
            }, {
                'Retry-After': String(rateLimit.retryAfter),
                'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
                'X-RateLimit-Remaining': '0',
            });
            return;
        }

        assertContentLength(req);
        const rawBody = await readRawBody(req);
        const input = parseJsonBody(rawBody);

        // Honeypot: resposta de sucesso para não ensinar o bot, sem envio real.
        if (isHoneypotFilled(input)) {
            sendJson(res, 200, { ok: true, code: 'OK' });
            return;
        }

        const validation = validatePayload(input);
        if (validation.errors.length > 0) {
            sendJson(res, 400, {
                ok: false,
                code: 'VALIDATION_ERROR',
                message: 'Revise os campos informados.',
                errors: validation.errors,
            });
            return;
        }

        const config = readEmailConfig();
        if (!config) {
            console.warn('[contact] email not configured');
            sendJson(res, 503, {
                ok: false,
                code: 'EMAIL_NOT_CONFIGURED',
                message: 'Envio por e-mail indisponível. Fale conosco pelo WhatsApp.',
            });
            return;
        }

        try {
            await sendEmail(config, validation.data);
        } catch (error) {
            if (error && error.name === 'TimeoutError') {
                console.error('[contact] resend timeout');
                sendJson(res, 504, {
                    ok: false,
                    code: 'EMAIL_TIMEOUT',
                    message: 'O envio demorou mais que o esperado. Tente novamente ou use o WhatsApp.',
                });
                return;
            }

            // @ts-ignore — status é apenas para log.
            const providerStatus = error && error.status ? error.status : 'network';
            console.error('[contact] resend failed', providerStatus);
            sendJson(res, 502, {
                ok: false,
                code: 'EMAIL_SEND_FAILED',
                message: 'Não foi possível enviar o e-mail agora. Tente novamente ou use o WhatsApp.',
            });
            return;
        }

        console.info('[contact] email sent');
        sendJson(res, 200, { ok: true, code: 'SENT' });
    } catch (error) {
        if (error instanceof ApiError) {
            sendJson(res, error.status, {
                ok: false,
                code: error.code,
                message: error.message,
            });
            return;
        }

        const errorName = error && typeof error === 'object' && 'name' in error
            ? String(error.name)
            : 'Error';
        console.error('[contact] internal error', errorName);
        sendJson(res, 500, {
            ok: false,
            code: 'INTERNAL_ERROR',
            message: 'Não foi possível processar a solicitação.',
        });
    }
}

module.exports = handler;
