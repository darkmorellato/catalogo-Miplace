// ============================================================
// MIPLACE — analytics.js
// Analytics privacy-first: sem cookies, sem PII e sem dependências.
// Expõe window.MiplaceAnalytics e mantém window.trackEvent compatível.
// @ts-check
// ============================================================

(() => {
    'use strict';

    const VERSION = '1.0.0';
    const OPT_OUT_KEY = 'miplace-analytics-optout';
    const EVENT_BUS = 'miplace:analytics';
    const CONSENT_EVENT = 'miplace:analytics-consent';
    const MAX_EVENT_NAME = 64;
    const MAX_KEY_LENGTH = 40;
    const MAX_STRING_LENGTH = 120;
    const MAX_PROPS = 20;
    const MAX_PAYLOAD_BYTES = 2048;
    const RESERVED_KEYS = new Set(['event', 'event_id', 'timestamp', 'page_path', 'section']);

    /** @typedef {string | number | boolean | null} AnalyticsValue */
    /** @typedef {Record<string, AnalyticsValue>} AnalyticsPayload */
    /** @typedef {Record<string, unknown>} AnalyticsProps */

    /**
     * @typedef {Object} MiplaceAnalyticsConsent
     * @property {boolean} granted
     * @property {() => void} grant
     * @property {() => void} revoke
     * @property {(value: boolean) => void} set
     * @property {() => 'granted' | 'denied'} status
     */

    /**
     * @typedef {Object} MiplaceAnalyticsApi
     * @property {(name: string, props?: AnalyticsProps) => boolean} track
     * @property {(section: string) => boolean} page
     * @property {MiplaceAnalyticsConsent} consent
     * @property {string} version
     */

    const win = /** @type {Window & {
        dataLayer?: unknown[],
        MiplaceAnalytics?: MiplaceAnalyticsApi
    }} */ (window);

    // ─── Chaves e valores que nunca podem sair ────────────────────────────────
    // Nomes de produto/marca são permitidos; nome de pessoa nunca é.
    const SAFE_NAME_KEYS = new Set([
        'item_name',
        'product_name',
        'brand_name',
        'section_name',
        'page_name',
        'store_name',
        'cta_name',
        'list_name',
        'source_name',
        'event_name',
        'message_length'
    ]);

    const SENSITIVE_KEY_TOKENS = [
        'email',
        'mail',
        'phone',
        'telefone',
        'celular',
        'whatsapp',
        'cpf',
        'cnpj',
        'documento',
        'address',
        'endereco',
        'cep',
        'nascimento',
        'birth',
        'dob',
        'password',
        'senha',
        'token',
        'secret',
        'message',
        'mensagem',
        'query',
        'search_term',
        'url',
        'href',
        'link'
    ];

    const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
    const PHONE_RE = /(?:\+?55[\s.-]?)?(?:\(?\d{2}\)?[\s.-]?)?9?\d{4}[\s.-]?\d{4}/;
    const CPF_RE = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/;
    const CNPJ_RE = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/;
    const URL_RE = /^https?:\/\//i;

    /** @type {string} */
    let currentSection = '';

    // ─── Consentimento e opt-out ──────────────────────────────────────────────

    /**
     * Sinaliza opt-out explícito no navegador (DNT/GPC).
     * @returns {boolean}
     */
    function browserOptOut() {
        try {
            const nav = /** @type {Navigator & { globalPrivacyControl?: boolean }} */ (win.navigator);
            const dnt = nav.doNotTrack;
            return dnt === '1' || dnt === 'yes' || nav.globalPrivacyControl === true;
        } catch (_e) {
            return false;
        }
    }

    /**
     * Lê o opt-out local. Qualquer falha de storage não deve quebrar o site.
     * @returns {boolean}
     */
    function readOptOut() {
        try {
            const value = win.localStorage.getItem(OPT_OUT_KEY);
            return value === '1' || value === 'true' || value === 'yes';
        } catch (_e) {
            return false;
        }
    }

    /** @returns {boolean} */
    function isOptedOut() {
        return browserOptOut() || readOptOut();
    }

    /**
     * @param {boolean} value
     * @returns {void}
     */
    function writeOptOut(value) {
        try {
            if (value) win.localStorage.setItem(OPT_OUT_KEY, '1');
            else win.localStorage.removeItem(OPT_OUT_KEY);
        } catch (_e) {
            // Safari private mode / quota: não há o que persistir.
        }
    }

    /** @returns {'granted' | 'denied'} */
    function consentStatus() {
        return isOptedOut() ? 'denied' : 'granted';
    }

    /**
     * @param {boolean} granted
     * @returns {void}
     */
    function emitConsent(granted) {
        try {
            win.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: { granted } }));
        } catch (_e) {
            // Evento é opcional; não interrompe o fluxo.
        }
    }

    /** @returns {void} */
    function grant() {
        writeOptOut(false);
        emitConsent(true);
    }

    /** @returns {void} */
    function revoke() {
        writeOptOut(true);
        emitConsent(false);
    }

    /**
     * @param {boolean} value
     * @returns {void}
     */
    function setConsent(value) {
        if (value) grant();
        else revoke();
    }

    /** @type {MiplaceAnalyticsConsent} */
    const consent = {
        get granted() {
            return !isOptedOut();
        },
        grant,
        revoke,
        set: setConsent,
        status: consentStatus
    };

    // ─── Sanitização ──────────────────────────────────────────────────────────

    /**
     * Normaliza uma chave para comparar com a lista de bloqueio.
     * @param {string} key
     * @returns {string}
     */
    function normalizeKey(key) {
        return key
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, MAX_KEY_LENGTH);
    }

    /**
     * Rejeita chaves que costumam carregar PII ou payload livre.
     * @param {string} key
     * @returns {boolean}
     */
    function isSensitiveKey(key) {
        const norm = normalizeKey(key);
        if (!norm) return true;
        if (SAFE_NAME_KEYS.has(norm)) return false;
        if (norm === 'name' || (norm.endsWith('_name') && !SAFE_NAME_KEYS.has(norm))) return true;

        return SENSITIVE_KEY_TOKENS.some((token) =>
            norm === token || norm.endsWith('_' + token) || norm.startsWith(token + '_') || norm.includes('_' + token + '_')
        );
    }

    /**
     * Remove PII óbvia e limita o tamanho de strings.
     * @param {unknown} value
     * @returns {AnalyticsValue | undefined}
     */
    function sanitizeValue(value) {
        if (value === null) return null;

        if (typeof value === 'boolean') return value;

        if (typeof value === 'number') {
            return Number.isFinite(value) ? value : undefined;
        }

        if (typeof value !== 'string') return undefined;

        const clean = value
            .replace(/[\u0000-\u001F\u007F]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        if (!clean) return undefined;
        if (EMAIL_RE.test(clean) || PHONE_RE.test(clean) || CPF_RE.test(clean) || CNPJ_RE.test(clean)) return undefined;
        if (URL_RE.test(clean)) return undefined;

        return clean.slice(0, MAX_STRING_LENGTH);
    }

    /**
     * @param {string} value
     * @param {number} maxLength
     * @returns {string}
     */
    function sanitizeToken(value, maxLength) {
        if (typeof value !== 'string') return '';
        return value
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/^#/, '')
            .replace(/[^a-z0-9_-]+/g, '_')
            .replace(/^_+|_+$/g, '')
            .slice(0, maxLength);
    }

    /**
     * @param {string} name
     * @returns {string}
     */
    function sanitizeEventName(name) {
        return sanitizeToken(name, MAX_EVENT_NAME);
    }

    /** @returns {string} */
    function getPagePath() {
        try {
            const path = win.location && typeof win.location.pathname === 'string'
                ? win.location.pathname
                : '/';
            const clean = path.replace(/[^\w./-]/g, '').slice(0, 200);
            return clean || '/';
        } catch (_e) {
            return '/';
        }
    }

    /** @returns {string} */
    function makeEventId() {
        try {
            if (win.crypto && typeof win.crypto.randomUUID === 'function') {
                return win.crypto.randomUUID();
            }
        } catch (_e) {
            // fallback abaixo
        }
        return 'evt_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    }

    /**
     * @param {string} name
     * @param {AnalyticsProps} props
     * @returns {AnalyticsPayload | null}
     */
    function buildPayload(name, props) {
        const event = sanitizeEventName(name);
        if (!event) return null;

        /** @type {Record<string, AnalyticsValue>} */
        const clean = {};
        let explicitSection = '';
        let count = 0;

        for (const [rawKey, rawValue] of Object.entries(props)) {
            if (count >= MAX_PROPS) break;
            if (RESERVED_KEYS.has(normalizeKey(rawKey))) {
                if (normalizeKey(rawKey) === 'section') {
                    explicitSection = sanitizeToken(String(rawValue), 64);
                }
                continue;
            }
            if (isSensitiveKey(rawKey)) continue;

            const key = normalizeKey(rawKey);
            if (!key) continue;

            const value = sanitizeValue(rawValue);
            if (value === undefined) continue;

            clean[key] = value;
            count++;
        }

        /** @type {AnalyticsPayload} */
        const payload = {
            event,
            event_id: makeEventId(),
            timestamp: new Date().toISOString(),
            page_path: getPagePath(),
            section: explicitSection || currentSection || 'unknown',
            ...clean
        };

        const optionalKeys = Object.keys(clean);
        while (JSON.stringify(payload).length > MAX_PAYLOAD_BYTES && optionalKeys.length > 0) {
            const key = optionalKeys.pop();
            if (key) delete payload[key];
        }

        return JSON.stringify(payload).length <= MAX_PAYLOAD_BYTES ? payload : null;
    }

    /**
     * @param {AnalyticsPayload} payload
     * @returns {void}
     */
    function emit(payload) {
        try {
            if (Array.isArray(win.dataLayer)) win.dataLayer.push(payload);
        } catch (_e) {
            // dataLayer externo pode estar em estado inválido.
        }

        try {
            if (typeof CustomEvent === 'function') {
                win.dispatchEvent(new CustomEvent(EVENT_BUS, { detail: payload }));
            }
        } catch (_e) {
            // Barramento é opcional; dataLayer já recebeu o evento.
        }
    }

    // ─── API pública ──────────────────────────────────────────────────────────

    /**
     * Registra um evento. Retorna false quando o consentimento está negado.
     * @param {string} name
     * @param {AnalyticsProps} [props]
     * @returns {boolean}
     */
    function track(name, props = {}) {
        try {
            if (isOptedOut()) return false;
            const safeProps = props && typeof props === 'object' && !Array.isArray(props) ? props : {};
            const payload = buildPayload(name, safeProps);
            if (!payload) return false;
            emit(payload);
            return true;
        } catch (_e) {
            return false;
        }
    }

    /**
     * Marca a seção atual e emite page_view.
     * @param {string} section
     * @returns {boolean}
     */
    function page(section) {
        const clean = sanitizeToken(section, 64);
        if (!clean) return false;
        currentSection = clean;
        return track('page_view', { section: clean });
    }

    /** @type {MiplaceAnalyticsApi} */
    const api = {
        track,
        page,
        consent,
        version: VERSION
    };

    // Seção inicial vem do hash (ex.: #catalogo) sem emitir nada ainda.
    try {
        currentSection = sanitizeToken(String(win.location.hash || '').replace(/^#/, ''), 64);
    } catch (_e) {
        currentSection = '';
    }

    win.MiplaceAnalytics = api;

    // Compatibilidade: catalog.js e modal.js já chamam window.trackEvent.
    // analytics.js deve carregar depois de ui.js e antes dos módulos de catálogo.
    win.trackEvent = track;
})();
