// ============================================================
// MIPLACE — modules/concierge.js
// Concierge local: FAQ por palavras-chave, sem LLM e sem API externa.
// API exposta em window.MiplaceConcierge.
// @ts-check
// ============================================================

(() => {
    'use strict';

    const VERSION = '1.0.0';
    const FAQ_URL = 'content/concierge-faq.json';
    const SCORE_THRESHOLD = 4;
    const TIE_MARGIN = 0.5;
    const MAX_INPUT = 240;
    const MAX_ALTERNATIVES = 3;
    const MIN_SUGGESTION_SCORE = 2.5;

    /** @typedef {'anchor' | 'link' | 'whatsapp'} ConciergeActionType */

    /**
     * @typedef {Object} ConciergeAction
     * @property {ConciergeActionType} type
     * @property {string} label
     * @property {string} [href]
     * @property {string} [message]
     * @property {string} [storeId]
     */

    /**
     * @typedef {Object} ConciergeIntent
     * @property {string} id
     * @property {string} label
     * @property {string[]} questions
     * @property {string[]} keywords
     * @property {string} answer
     * @property {ConciergeAction[]} actions
     * @property {number} [priority]
     */

    /**
     * @typedef {Object} ConciergeFallback
     * @property {string} message
     * @property {ConciergeAction[]} actions
     */

    /**
     * @typedef {Object} ConciergeFAQ
     * @property {number} schemaVersion
     * @property {string} version
     * @property {string} locale
     * @property {string} brand
     * @property {string} updatedAt
     * @property {string[]} quickReplies
     * @property {ConciergeFallback} fallback
     * @property {ConciergeIntent[]} intents
     */

    /**
     * @typedef {Object} MatchResult
     * @property {ConciergeIntent | null} intent
     * @property {number} score
     * @property {ConciergeIntent[]} alternatives
     */

    /**
     * @typedef {Object} ConciergeEls
     * @property {HTMLElement} host
     * @property {HTMLButtonElement} launcher
     * @property {HTMLElement} panel
     * @property {HTMLElement} log
     * @property {HTMLElement} quick
     * @property {HTMLFormElement} form
     * @property {HTMLInputElement} input
     * @property {HTMLButtonElement} close
     */

    /**
     * @typedef {Object} ConciergeAPI
     * @property {string} version
     * @property {() => void} open
     * @property {() => void} close
     * @property {() => void} toggle
     * @property {(query: string, data?: ConciergeFAQ) => MatchResult} match
     * @property {() => ConciergeFAQ} getData
     */

    /** @type {ConciergeFAQ} */
    const FALLBACK_FAQ = {
        schemaVersion: 1,
        version: VERSION,
        locale: 'pt-BR',
        brand: 'Miplace',
        updatedAt: '2026-11-07',
        quickReplies: ['parcelamento', 'garantia', 'lojas', 'falar-atendente'],
        fallback: {
            message: 'Ainda não tenho essa resposta pronta. Posso te encaminhar para o time da loja — é só escolher o WhatsApp abaixo.',
            actions: [
                { type: 'whatsapp', label: 'Falar com a loja', message: 'Olá! Vim pelo site da Miplace e tenho uma dúvida.' },
                { type: 'anchor', label: 'Ver contato', href: '#contato' },
            ],
        },
        intents: [
            {
                id: 'parcelamento',
                label: 'Parcelamento',
                questions: ['Como funciona o parcelamento?', 'Quantas vezes posso parcelar?', 'O parcelamento é no boleto?', 'É sem consulta?'],
                keywords: ['parcelamento', 'parcelar', 'parcelado', 'boleto', '24x', '24 vezes', 'sem consulta', 'entrada', 'prestacao'],
                answer: 'O parcelamento é em até 24x no boleto, sem consulta. O valor da parcela e as condições são confirmados na loja, de acordo com o produto.',
                actions: [
                    { type: 'anchor', label: 'Ver catálogo', href: '#catalogo' },
                    { type: 'whatsapp', label: 'Falar com a loja', message: 'Olá! Vim pelo site e queria entender as condições de parcelamento.' },
                ],
            },
            {
                id: 'garantia',
                label: 'Garantia',
                questions: ['O aparelho tem garantia?', 'Qual é o prazo de garantia?', 'Como aciono a garantia?'],
                keywords: ['garantia', 'defeito', 'quebrou', 'conserto', 'assistencia', 'cobertura'],
                answer: 'A garantia varia por marca e modelo. Confirme o prazo e a cobertura na loja; a nota fiscal é o documento da compra.',
                actions: [
                    { type: 'whatsapp', label: 'Falar com a loja', message: 'Olá! Vim pelo site e tenho uma dúvida sobre a garantia de um aparelho.' },
                ],
            },
            {
                id: 'lojas',
                label: 'Lojas e endereços',
                questions: ['Onde ficam as lojas?', 'Quantas lojas vocês têm?', 'Qual o horário de funcionamento?'],
                keywords: ['endereco', 'onde fica', 'localizacao', 'como chegar', 'rua', 'avenida', 'cep', 'horario', 'piracicaba', 'amparo', 'lojas'],
                answer: 'São 4 lojas: 3 em Piracicaba (XV Prime, Honor e Realme) e 1 em Amparo (Premium). Endereços e contatos estão na seção Presença. Horários, confirme com a loja.',
                actions: [{ type: 'anchor', label: 'Ver lojas e endereços', href: '#presenca' }],
            },
            {
                id: 'produtos',
                label: 'Produtos',
                questions: ['Quais produtos vocês têm?', 'Vocês vendem tablets?', 'O que tem no catálogo?'],
                keywords: ['produtos', 'catalogo', 'modelos', 'celulares', 'smartphones', 'tablets', 'colecao'],
                answer: 'O catálogo reúne 27 produtos entre smartphones e tablets. A disponibilidade por loja é confirmada no atendimento.',
                actions: [
                    { type: 'anchor', label: 'Explorar o catálogo', href: '#catalogo' },
                    { type: 'whatsapp', label: 'Consultar disponibilidade', message: 'Olá! Vim pelo site e queria confirmar a disponibilidade de um modelo.' },
                ],
            },
            {
                id: 'falar-atendente',
                label: 'Falar com atendente',
                questions: ['Quero falar com uma pessoa.', 'Qual é o telefone ou WhatsApp da loja?', 'Como entro em contato?'],
                keywords: ['atendente', 'humano', 'vendedor', 'whatsapp', 'telefone', 'contato', 'falar com alguem', 'atendimento'],
                answer: 'Claro. Escolha a loja abaixo para falar no WhatsApp, ou use a seção Contato.',
                actions: [
                    { type: 'whatsapp', label: 'Escolher loja no WhatsApp', message: 'Olá! Vim pelo site da Miplace e gostaria de atendimento.' },
                    { type: 'anchor', label: 'Ver contato', href: '#contato' },
                ],
            },
            {
                id: 'privacidade',
                label: 'Privacidade',
                questions: ['Vocês guardam o que eu escrevo aqui?', 'Este chat coleta meus dados?'],
                keywords: ['privacidade', 'lgpd', 'dados pessoais', 'guarda', 'salva', 'conversa', 'cookie'],
                answer: 'Este concierge roda no seu navegador: não envia sua conversa para servidor, não salva dados pessoais e não pede cadastro. Veja a Política de Privacidade.',
                actions: [{ type: 'link', label: 'Política de Privacidade', href: 'privacidade.html' }],
            },
        ],
    };

    const STOPWORDS = new Set([
        'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
        'de', 'da', 'do', 'das', 'dos', 'em', 'no', 'na', 'nos', 'nas',
        'por', 'para', 'pra', 'com', 'sem', 'que', 'qual', 'quais',
        'como', 'onde', 'quando', 'quanto', 'quantas', 'quantos',
        'tem', 'ha', 'e', 'ou', 'eu', 'voce', 'voces', 'vcs', 'me',
        'meu', 'minha', 'queria', 'quero', 'gostaria', 'preciso',
        'posso', 'poderia', 'sobre', 'mais', 'muito', 'bom', 'boa',
        'dia', 'tarde', 'noite', 'ola', 'oi', 'the', 'and', 'of', 'to',
    ]);

    /** @type {ConciergeFAQ | null} */
    let faq = null;
    /** @type {ConciergeEls | null} */
    let els = null;
    let isOpen = false;
    let initialized = false;
    let reduceMotion = false;
    /** @type {HTMLElement | null} */
    let lastFocused = null;

    const DEBUG = typeof window !== 'undefined'
        && typeof window.location !== 'undefined'
        && new URLSearchParams(window.location.search).get('concierge') === 'debug';

    /**
     * Remove acentos, pontuação e espaços duplicados.
     * @param {string} value
     * @returns {string}
     */
    function normalize(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * @param {string} value
     * @returns {string[]}
     */
    function tokenize(value) {
        return normalize(value)
            .split(' ')
            .filter((token) => token.length >= 2 && !STOPWORDS.has(token));
    }

    /**
     * Pontua uma intenção contra a consulta normalizada.
     * @param {string} normQuery
     * @param {string[]} queryTokens
     * @param {ConciergeIntent} intent
     * @returns {number}
     */
    function scoreIntent(normQuery, queryTokens, intent) {
        const querySet = new Set(queryTokens);
        let score = 0;

        const intentTokens = tokenize(`${intent.label} ${intent.questions.join(' ')}`);
        let overlap = 0;
        new Set(intentTokens).forEach((token) => {
            if (querySet.has(token)) overlap += 1;
        });
        score += Math.min(overlap, 5) * 1.2;

        const matchedTokens = new Set();

        intent.keywords.forEach((keyword) => {
            const normKeyword = normalize(keyword);
            if (!normKeyword) return;
            if (normKeyword.includes(' ')) {
                if (` ${normQuery} `.includes(` ${normKeyword} `)) score += 4.5;
                return;
            }

            let hit = '';
            if (querySet.has(normKeyword)) {
                hit = normKeyword;
            } else if (normKeyword.length >= 4) {
                hit = queryTokens.find((token) => (
                    token.length >= 4 && (token.startsWith(normKeyword) || normKeyword.startsWith(token))
                )) || '';
            }

            if (hit && !matchedTokens.has(hit)) {
                score += 3;
                matchedTokens.add(hit);
            }
        });

        intent.questions.forEach((question) => {
            const normQuestion = normalize(question);
            if (!normQuestion) return;
            if (normQuery === normQuestion) score += 20;
            else if (normQuery.includes(normQuestion)) score += 6;
        });

        return score;
    }

    /**
     * Encontra a melhor intenção para a consulta.
     * @param {string} query
     * @param {ConciergeFAQ} [data]
     * @returns {MatchResult}
     */
    function match(query, data) {
        const source = data || getData();
        const normQuery = normalize(query);
        if (!normQuery) return { intent: null, score: 0, alternatives: [] };

        const queryTokens = tokenize(normQuery);
        const scored = source.intents.map((intent) => ({
            intent,
            score: scoreIntent(normQuery, queryTokens, intent),
            priority: intent.priority || 0,
        })).sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            if (b.priority !== a.priority) return b.priority - a.priority;
            return a.intent.id.localeCompare(b.intent.id);
        });

        const best = scored[0];
        const second = scored[1];
        const alternatives = scored
            .filter((item) => item.score >= MIN_SUGGESTION_SCORE)
            .slice(0, MAX_ALTERNATIVES)
            .map((item) => item.intent);

        if (!best || best.score < SCORE_THRESHOLD) {
            return { intent: null, score: best ? best.score : 0, alternatives };
        }

        if (second && second.score >= SCORE_THRESHOLD
            && (best.score - second.score) < TIE_MARGIN
            && best.priority === second.priority) {
            return { intent: null, score: best.score, alternatives };
        }

        return { intent: best.intent, score: best.score, alternatives: alternatives.filter((intent) => intent.id !== best.intent.id) };
    }

    /**
     * @returns {ConciergeFAQ}
     */
    function getData() {
        return faq || FALLBACK_FAQ;
    }

    /**
     * @param {any} data
     * @returns {data is ConciergeFAQ}
     */
    function isValidFAQ(data) {
        return !!data
            && Array.isArray(data.intents)
            && data.intents.length >= 12
            && data.intents.every((/** @type {any} */ intent) => (
                intent
                && typeof intent.id === 'string'
                && typeof intent.label === 'string'
                && typeof intent.answer === 'string'
                && Array.isArray(intent.questions)
                && Array.isArray(intent.keywords)
                && Array.isArray(intent.actions)
            ))
            && !!data.fallback
            && typeof data.fallback.message === 'string'
            && Array.isArray(data.fallback.actions);
    }

    /**
     * @param {string} href
     * @returns {string}
     */
    function safeHref(href) {
        const value = String(href || '').trim();
        if (value.startsWith('#') || value.startsWith('/') || value.startsWith('https://')) return value;
        if (/^[a-z0-9][a-z0-9-]*\.html$/i.test(value)) return value;
        return '#contato';
    }

    /**
     * @param {Store} store
     * @param {string} [message]
     * @returns {string}
     */
    function whatsappUrl(store, message) {
        const digits = String(store.whatsapp || '').replace(/\D/g, '');
        if (!digits) return '#contato';
        const text = message || 'Olá! Vim pelo site da Miplace e gostaria de atendimento.';
        return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
    }

    /**
     * @returns {Store[]}
     */
    function getStores() {
        return Array.isArray(window.STORES) ? window.STORES : [];
    }

    /**
     * @param {HTMLElement} container
     * @param {ConciergeAction[]} actions
     * @returns {void}
     */
    function renderActions(container, actions) {
        if (!actions || actions.length === 0) return;
        const wrap = document.createElement('div');
        wrap.className = 'c-actions';

        actions.forEach((action) => {
            if (action.type === 'whatsapp') {
                const store = action.storeId
                    ? getStores().find((item) => item.id === action.storeId)
                    : null;

                if (store) {
                    const link = document.createElement('a');
                    link.className = 'c-action c-action--primary';
                    link.href = whatsappUrl(store, action.message);
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                    link.textContent = action.label;
                    link.setAttribute('aria-label', `${action.label} — abre o WhatsApp em nova aba`);
                    wrap.appendChild(link);
                    return;
                }

                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'c-action c-action--primary';
                button.textContent = action.label;
                button.addEventListener('click', () => showStorePicker(action.message));
                wrap.appendChild(button);
                return;
            }

            const link = document.createElement('a');
            link.className = 'c-action';
            link.href = safeHref(action.href || '');
            link.textContent = action.label;
            const href = link.getAttribute('href') || '';
            if (href.startsWith('http')) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
            if (href.startsWith('#')) {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    close();
                    scrollToAnchor(href);
                });
            }
            wrap.appendChild(link);
        });

        container.appendChild(wrap);
    }

    /**
     * @param {string} text
     * @param {'bot' | 'user'} who
     * @returns {HTMLElement | null}
     */
    function addMessage(text, who) {
        if (!els) return null;
        const message = document.createElement('div');
        message.className = `c-msg c-msg--${who}`;
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        message.appendChild(paragraph);
        els.log.appendChild(message);
        els.log.scrollTop = els.log.scrollHeight;
        return message;
    }

    /**
     * @param {string} text
     * @param {ConciergeAction[]} [actions]
     * @returns {void}
     */
    function addBotMessage(text, actions) {
        const message = addMessage(text, 'bot');
        if (message && actions) renderActions(message, actions);
        if (els) els.log.scrollTop = els.log.scrollHeight;
    }

    /**
     * @param {ConciergeIntent[]} intents
     * @returns {void}
     */
    function addSuggestions(intents) {
        if (!els || intents.length === 0) return;
        const wrap = document.createElement('div');
        wrap.className = 'c-msg c-msg--bot c-msg--suggest';
        const paragraph = document.createElement('p');
        paragraph.textContent = 'Talvez seja:';
        wrap.appendChild(paragraph);

        const list = document.createElement('div');
        list.className = 'c-suggestions';
        intents.forEach((intent) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'c-chip';
            button.textContent = intent.label;
            button.addEventListener('click', () => handleQuery(intent.label, intent.id));
            list.appendChild(button);
        });

        wrap.appendChild(list);
        els.log.appendChild(wrap);
        els.log.scrollTop = els.log.scrollHeight;
    }

    /**
     * @param {string} [message]
     * @returns {void}
     */
    function showStorePicker(message) {
        if (!els) return;
        const stores = getStores();
        if (stores.length === 0) {
            addBotMessage('Não consegui carregar as lojas agora. Use a seção Contato.', [
                { type: 'anchor', label: 'Ver contato', href: '#contato' },
            ]);
            return;
        }

        const wrap = document.createElement('div');
        wrap.className = 'c-msg c-msg--bot';
        const paragraph = document.createElement('p');
        paragraph.textContent = 'Com qual loja você quer falar?';
        wrap.appendChild(paragraph);

        const list = document.createElement('div');
        list.className = 'c-stores';
        stores.forEach((store) => {
            const link = document.createElement('a');
            link.className = 'c-store';
            link.href = whatsappUrl(store, message);
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = `${store.name} · ${store.city}`;
            link.setAttribute('aria-label', `${store.name}, ${store.city} — abre o WhatsApp em nova aba`);
            list.appendChild(link);
        });

        wrap.appendChild(list);
        els.log.appendChild(wrap);
        els.log.scrollTop = els.log.scrollHeight;
    }

    /**
     * @param {string} href
     * @returns {void}
     */
    function scrollToAnchor(href) {
        const target = document.getElementById(href.slice(1));
        if (!target) {
            window.location.hash = href;
            return;
        }

        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        if (!target.hasAttribute('tabindex')) {
            target.setAttribute('tabindex', '-1');
            target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
        target.focus({ preventScroll: true });
    }

    /**
     * @param {MatchResult} result
     * @param {ConciergeFAQ} data
     * @returns {void}
     */
    function respond(result, data) {
        if (DEBUG) {
            console.info('[Concierge] match', {
                intent: result.intent ? result.intent.id : null,
                score: Math.round(result.score * 10) / 10,
            });
        }

        if (result.intent) {
            addBotMessage(result.intent.answer, result.intent.actions);
            return;
        }

        const ambiguous = result.score >= SCORE_THRESHOLD && result.alternatives.length > 0;
        const message = ambiguous
            ? 'Encontrei mais de uma possibilidade. Qual delas resolve melhor?'
            : data.fallback.message;
        addBotMessage(message, data.fallback.actions);
        if (result.alternatives.length > 0) addSuggestions(result.alternatives);
    }

    /**
     * @param {string} raw
     * @param {string} [forcedId]
     * @returns {void}
     */
    function handleQuery(raw, forcedId) {
        if (!els) return;
        const text = String(raw || '').trim().slice(0, MAX_INPUT);
        if (!text) return;

        addMessage(text, 'user');
        els.input.value = '';

        const data = getData();
        const forced = forcedId ? data.intents.find((intent) => intent.id === forcedId) : null;
        const result = forced
            ? { intent: forced, score: 99, alternatives: [] }
            : match(text, data);
        const delay = reduceMotion ? 0 : 180;
        window.setTimeout(() => respond(result, data), delay);
    }

    /**
     * @returns {void}
     */
    function renderQuickReplies() {
        if (!els) return;
        const ui = els;
        ui.quick.textContent = '';
        const data = getData();
        data.quickReplies.forEach((id) => {
            const intent = data.intents.find((item) => item.id === id);
            if (!intent) return;
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'c-chip';
            button.textContent = intent.label;
            button.addEventListener('click', () => handleQuery(intent.label, intent.id));
            ui.quick.appendChild(button);
        });
    }

    /**
     * @param {boolean} next
     * @returns {void}
     */
    function setOpen(next) {
        if (!els || next === isOpen) return;
        isOpen = next;
        els.launcher.setAttribute('aria-expanded', String(next));

        if (next) {
            const active = document.activeElement;
            lastFocused = active instanceof HTMLElement ? active : null;
            els.panel.hidden = false;
            window.setTimeout(() => {
                if (els) els.input.focus();
            }, 30);
            return;
        }

        els.panel.hidden = true;
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
        else els.launcher.focus();
    }

    /** @returns {void} */
    function close() {
        setOpen(false);
    }

    /** @returns {void} */
    function open() {
        if (!initialized) init();
        setOpen(true);
    }

    /** @returns {void} */
    function toggle() {
        if (!initialized) init();
        setOpen(!isOpen);
    }

    /**
     * @param {Event} event
     * @returns {void}
     */
    function onDocumentKeydown(event) {
        if (!isOpen) return;
        const key = /** @type {KeyboardEvent} */ (event).key;
        if (key === 'Escape') {
            event.preventDefault();
            close();
            if (els) els.launcher.focus();
        }
    }

    /**
     * @param {Event} event
     * @returns {void}
     */
    function onDocumentPointerDown(event) {
        if (!isOpen || !els) return;
        if (!event.composedPath().includes(els.host)) close();
    }

    /**
     * @returns {void}
     */
    function loadFAQ() {
        if (typeof fetch !== 'function') return;
        fetch(FAQ_URL, { credentials: 'same-origin', cache: 'no-cache' })
            .then((response) => {
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            })
            .then((data) => {
                if (!isValidFAQ(data)) {
                    console.warn('[Concierge] FAQ local inválido; usando fallback embutido.');
                    return;
                }
                faq = data;
                renderQuickReplies();
            })
            .catch((error) => {
                const message = error instanceof Error ? error.message : 'erro desconhecido';
                console.warn('[Concierge] FAQ local indisponível; usando fallback embutido.', message);
            });
    }

    /**
     * @returns {void}
     */
    function createUI() {
        if (typeof document === 'undefined' || !document.body) return;

        const host = document.createElement('div');
        host.id = 'miplace-concierge';
        host.setAttribute('data-concierge', VERSION);

        const shadow = host.attachShadow({ mode: 'open' });
        const style = document.createElement('style');
        style.textContent = `
            :host {
                --c-paper: #f5f2ea;
                --c-paper-2: #ebe7dd;
                --c-ink: #141414;
                --c-ink-2: #4a4641;
                --c-ink-3: #79736b;
                --c-accent: #8c1d1d;
                --c-gold: #b9965a;
                --c-forest: #173b32;
                --c-line: rgba(20, 20, 20, 0.14);
                --c-line-strong: rgba(20, 20, 20, 0.32);
                position: fixed;
                left: 24px;
                bottom: calc(24px + env(safe-area-inset-bottom, 0px));
                z-index: 45;
                font-family: "DM Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
                color: var(--c-ink);
            }
            :host(.c-host--offset) {
                bottom: calc(96px + env(safe-area-inset-bottom, 0px));
            }
            .c-launcher {
                min-height: 48px;
                padding: 0 18px 0 8px;
                display: flex;
                align-items: center;
                gap: 10px;
                background: var(--c-ink);
                color: var(--c-paper);
                border: 0;
                border-radius: 999px;
                cursor: pointer;
                box-shadow: 0 10px 30px rgba(20, 20, 20, 0.22);
                font: 700 11px/1 "DM Sans", system-ui, sans-serif;
                letter-spacing: 0.14em;
                text-transform: uppercase;
                transition: transform 180ms ease, box-shadow 180ms ease;
            }
            .c-launcher:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(20, 20, 20, 0.28); }
            .c-launcher__mark {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                background: var(--c-gold);
                color: var(--c-ink);
                display: grid;
                place-items: center;
                font: 700 16px/1 "Playfair Display", Georgia, serif;
                letter-spacing: 0;
            }
            .c-panel {
                position: absolute;
                left: 0;
                bottom: calc(100% + 12px);
                width: min(380px, calc(100vw - 32px));
                max-height: min(620px, calc(100dvh - 120px));
                display: flex;
                flex-direction: column;
                background: var(--c-paper);
                border: 1px solid var(--c-line);
                border-radius: 2px;
                box-shadow: 0 24px 60px rgba(20, 20, 20, 0.28);
                overflow: hidden;
            }
            .c-panel[hidden] { display: none; }
            .c-panel:not([hidden]) { animation: c-in 180ms ease-out; }
            @keyframes c-in {
                from { opacity: 0; transform: translateY(8px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .c-head {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 12px;
                padding: 18px 18px 16px;
                background: var(--c-forest);
                color: var(--c-paper);
            }
            .c-eyebrow {
                margin: 0 0 4px;
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 0.22em;
                text-transform: uppercase;
                color: var(--c-gold);
            }
            .c-title {
                margin: 0;
                font: 600 24px/1 "Playfair Display", Georgia, serif;
            }
            .c-close {
                width: 44px;
                height: 44px;
                margin: -8px -8px 0 0;
                display: grid;
                place-items: center;
                background: transparent;
                color: var(--c-paper);
                border: 0;
                border-radius: 50%;
                cursor: pointer;
            }
            .c-close:hover { background: rgba(245, 242, 234, 0.12); }
            .c-close svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.6; fill: none; }
            .c-log {
                flex: 1;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding: 16px;
                background: var(--c-paper);
                scroll-behavior: smooth;
            }
            .c-msg {
                max-width: 88%;
                padding: 10px 12px;
                border-radius: 10px;
                font-size: 14px;
                line-height: 1.45;
            }
            .c-msg p { margin: 0; }
            .c-msg--bot { align-self: flex-start; background: var(--c-paper-2); border: 1px solid var(--c-line); }
            .c-msg--user { align-self: flex-end; background: var(--c-ink); color: var(--c-paper); }
            .c-msg--suggest { max-width: 100%; }
            .c-actions, .c-suggestions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
            .c-action, .c-chip {
                min-height: 44px;
                display: inline-flex;
                align-items: center;
                padding: 0 12px;
                border: 1px solid var(--c-line-strong);
                border-radius: 2px;
                background: transparent;
                color: var(--c-accent);
                font: 700 10px/1.2 "DM Sans", system-ui, sans-serif;
                letter-spacing: 0.08em;
                text-transform: uppercase;
                text-decoration: none;
                cursor: pointer;
            }
            .c-action--primary { background: var(--c-accent); border-color: var(--c-accent); color: #fff; }
            .c-action:hover, .c-chip:hover { background: rgba(140, 29, 29, 0.08); }
            .c-action--primary:hover { background: #741717; }
            .c-chip { background: var(--c-paper); color: var(--c-ink); border-color: var(--c-line); text-transform: none; letter-spacing: 0.02em; font-size: 11px; }
            .c-quick { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px 12px; background: var(--c-paper); }
            .c-form {
                display: flex;
                gap: 8px;
                padding: 12px 16px 8px;
                border-top: 1px solid var(--c-line);
                background: var(--c-paper);
            }
            .c-input {
                flex: 1;
                min-width: 0;
                min-height: 44px;
                padding: 0 12px;
                border: 1px solid var(--c-line-strong);
                border-radius: 2px;
                background: #fff;
                color: var(--c-ink);
                font: 400 14px/1.3 "DM Sans", system-ui, sans-serif;
            }
            .c-input::placeholder { color: var(--c-ink-3); opacity: 1; }
            .c-send {
                width: 44px;
                height: 44px;
                flex: 0 0 44px;
                display: grid;
                place-items: center;
                border: 0;
                border-radius: 2px;
                background: var(--c-ink);
                color: var(--c-paper);
                cursor: pointer;
            }
            .c-send svg { width: 18px; height: 18px; stroke: currentColor; stroke-width: 1.8; fill: none; }
            .c-note {
                margin: 0;
                padding: 0 16px 12px;
                font-size: 10px;
                line-height: 1.4;
                color: var(--c-ink-3);
                background: var(--c-paper);
            }
            .c-stores { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
            .c-store {
                min-height: 44px;
                display: flex;
                align-items: center;
                padding: 0 12px;
                border: 1px solid var(--c-line);
                border-radius: 2px;
                color: var(--c-ink);
                font-size: 12px;
                font-weight: 700;
                text-decoration: none;
                background: var(--c-paper);
            }
            .c-store:hover { border-color: var(--c-accent); color: var(--c-accent); }
            .c-sr {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
            .c-launcher:focus-visible, .c-close:focus-visible, .c-action:focus-visible,
            .c-chip:focus-visible, .c-send:focus-visible, .c-input:focus-visible, .c-store:focus-visible {
                outline: 2px solid var(--c-accent);
                outline-offset: 2px;
            }
            .c-close:focus-visible { outline-color: var(--c-gold); }
            @media (max-width: 480px) {
                :host { left: 12px; bottom: calc(12px + env(safe-area-inset-bottom, 0px)); }
                .c-panel { width: calc(100vw - 24px); max-height: calc(100dvh - 96px); }
                .c-launcher {
                    width: 48px;
                    min-height: 48px;
                    padding: 0;
                    justify-content: center;
                }
                .c-launcher > span:last-child { display: none; }
            }
            @media (prefers-reduced-motion: reduce) {
                .c-panel, .c-launcher, .c-msg { animation: none !important; transition: none !important; }
                .c-log { scroll-behavior: auto; }
            }
        `;
        shadow.appendChild(style);

        const launcher = document.createElement('button');
        launcher.type = 'button';
        launcher.className = 'c-launcher';
        launcher.setAttribute('aria-label', 'Abrir concierge da Miplace');
        launcher.setAttribute('aria-expanded', 'false');
        launcher.setAttribute('aria-controls', 'c-panel');
        launcher.setAttribute('aria-haspopup', 'dialog');
        launcher.innerHTML = '<span class="c-launcher__mark" aria-hidden="true">M</span><span>Concierge</span>';
        launcher.addEventListener('click', () => setOpen(!isOpen));
        shadow.appendChild(launcher);

        const panel = document.createElement('section');
        panel.id = 'c-panel';
        panel.className = 'c-panel';
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-labelledby', 'c-title');
        panel.hidden = true;
        panel.innerHTML = `
            <header class="c-head">
                <div>
                    <p class="c-eyebrow">Miplace</p>
                    <h2 class="c-title" id="c-title">Concierge</h2>
                </div>
                <button type="button" class="c-close" aria-label="Fechar concierge">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>
                </button>
            </header>
            <div class="c-log" id="c-log" role="log" aria-live="polite" aria-relevant="additions"></div>
            <div class="c-quick" id="c-quick" aria-label="Perguntas rápidas"></div>
            <form class="c-form" id="c-form">
                <label class="c-sr" for="c-input">Escreva sua dúvida</label>
                <input class="c-input" id="c-input" name="duvida" type="text" autocomplete="off" maxlength="240" placeholder="Ex.: parcelamento, garantia, endereço">
                <button class="c-send" type="submit" aria-label="Enviar mensagem">
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 12h15M13 6l6 6-6 6"/></svg>
                </button>
            </form>
            <p class="c-note">Conversa local, sem cadastro. Não envie dados pessoais.</p>
        `;
        shadow.appendChild(panel);

        document.body.appendChild(host);

        const log = shadow.getElementById('c-log');
        const quick = shadow.getElementById('c-quick');
        const form = shadow.getElementById('c-form');
        const input = shadow.getElementById('c-input');
        const closeButton = shadow.querySelector('.c-close');

        if (!(log instanceof HTMLElement)
            || !(quick instanceof HTMLElement)
            || !(form instanceof HTMLFormElement)
            || !(input instanceof HTMLInputElement)
            || !(closeButton instanceof HTMLButtonElement)) {
            host.remove();
            return;
        }

        els = { host, launcher, panel, log, quick, form, input, close: closeButton };

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            handleQuery(input.value);
        });

        closeButton.addEventListener('click', () => {
            close();
            launcher.focus();
        });

        document.addEventListener('keydown', onDocumentKeydown);
        document.addEventListener('pointerdown', onDocumentPointerDown);

        const audioControl = document.getElementById('audio-control');
        if (audioControl && window.getComputedStyle(audioControl).display !== 'none') {
            host.classList.add('c-host--offset');
        }

        renderQuickReplies();
        addBotMessage('Olá! Sou o concierge da Miplace. Posso ajudar com parcelamento, garantia, lojas, produtos e atendimento. O que você procura?');
    }

    /** @returns {void} */
    function init() {
        if (initialized) return;
        initialized = true;
        reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        createUI();
        loadFAQ();
    }

    /** @type {ConciergeAPI} */
    const api = {
        version: VERSION,
        open,
        close,
        toggle,
        match,
        getData,
    };

    if (typeof window !== 'undefined') {
        /** @type {Window & { MiplaceConcierge?: ConciergeAPI }} */ (window).MiplaceConcierge = api;
    }

    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init, { once: true });
        } else {
            init();
        }
    }
})();
