// ============================================================
// MIPLACE GROUP — corporate.js
// Home corporativa: sticky, menu mobile, contadores, reveal,
// acordeões, formulário de contato e ano dinâmico.
// @ts-check
// ============================================================

(() => {
    'use strict';

    /** @type {string} */
    let contactStatusKey = '';

    // Contingência quando a API própria não está disponível (ex.: site
    // estático local ou Vercel sem RESEND_API_KEY). Exige ativação única
    // no e-mail de destino antes do primeiro envio.
    const CONTACT_FALLBACK_ENDPOINT = 'https://formsubmit.co/ajax/contasgeraljack@gmail.com';

    // Espelha a validação de api/contact.js para o fallback também bloquear
    // domínios de exemplo e descartáveis quando a API não está rodando.
    const CONTACT_EMAIL_RE = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/;
    const CONTACT_BLOCKED_EMAIL_RE = /(^|\.)(example|test|teste|invalid|localhost|local|10minutemail|guerrillamail|mailinator|tempmail|temp-mail|yopmail|maildrop|throwawaymail|getnada|sharklasers|trashmail|fakeinbox|dispostable|mailnesia|moakt|mintemail|emailondeck)(\.|$)/i;

    /**
     * @param {string} key
     * @returns {string}
     */
    function t(key) {
        return window.MiplaceI18n ? window.MiplaceI18n.t(key) : key;
    }

    /**
     * Valida o formato e bloqueia domínios reservados ou descartáveis.
     * @param {string} value
     * @returns {boolean}
     */
    function isValidContactEmail(value) {
        const email = String(value || '').trim();
        if (!email || email.length > 254 || !CONTACT_EMAIL_RE.test(email)) return false;

        const at = email.lastIndexOf('@');
        if (at <= 0 || at === email.length - 1) return false;

        const local = email.slice(0, at);
        const domain = email.slice(at + 1).toLowerCase();

        if (local.length > 64) return false;
        if (local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
        if (domain.length > 253) return false;
        if (CONTACT_BLOCKED_EMAIL_RE.test(domain)) return false;

        const tld = domain.slice(domain.lastIndexOf('.') + 1);
        return /^[a-z]{2,24}$/.test(tld);
    }

    /**
     * @param {string} name
     * @param {Record<string, unknown>} [props]
     * @returns {void}
     */
    function track(name, props) {
        window.MiplaceAnalytics?.track(name, props);
    }

    /** @returns {void} */
    function initStickyHeader() {
        const header = document.getElementById('navbar');
        if (!header) return;
        let ticking = false;
        const update = () => {
            header.classList.toggle('is-stuck', window.scrollY > 12);
            ticking = false;
        };
        window.addEventListener('scroll', () => {
            if (ticking) return;
            ticking = true;
            window.requestAnimationFrame(update);
        }, { passive: true });
        update();
    }

    /** @returns {void} */
    function initMobileMenu() {
        const button = document.getElementById('hamburger-btn');
        const menu = document.getElementById('mobile-menu');
        if (!button || !menu) return;

        /**
         * @param {boolean} open
         * @returns {void}
         */
        const setOpen = (open) => {
            menu.classList.toggle('open', open);
            button.classList.toggle('open', open);
            button.setAttribute('aria-expanded', String(open));
            button.setAttribute('aria-label', t(open ? 'header.close' : 'header.menu'));
            menu.setAttribute('aria-hidden', String(!open));
            document.body.classList.toggle('menu-open', open);
        };

        button.addEventListener('click', event => {
            event.preventDefault();
            setOpen(!menu.classList.contains('open'));
        });

        menu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => setOpen(false));
        });

        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && menu.classList.contains('open')) {
                setOpen(false);
                button.focus();
            }
        });

        document.addEventListener('click', event => {
            const target = /** @type {Node} */ (event.target);
            if (!menu.classList.contains('open')) return;
            if (button.contains(target) || menu.contains(target)) return;
            setOpen(false);
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 900 && menu.classList.contains('open')) setOpen(false);
        }, { passive: true });

        menu.setAttribute('aria-hidden', 'true');
        setOpen(false);

        window.addEventListener('miplace:localechange', () => {
            button.setAttribute('aria-label', t(menu.classList.contains('open') ? 'header.close' : 'header.menu'));
        });
    }

    /** @returns {void} */
    function initCounters() {
        const counters = Array.from(document.querySelectorAll('[data-counter]'));
        if (!counters.length) return;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        /**
         * @param {Element} node
         * @returns {void}
         */
        const run = (node) => {
            if (!(node instanceof HTMLElement) || node.dataset.counted === '1') return;
            node.dataset.counted = '1';
            const target = Number(node.getAttribute('data-counter') || '0');
            if (!Number.isFinite(target)) return;
            if (reduced) {
                node.textContent = String(target);
                return;
            }
            const duration = 1400;
            const start = performance.now();
            const step = (/** @type {DOMHighResTimeStamp} */ now) => {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                node.textContent = String(Math.round(eased * target));
                if (progress < 1) window.requestAnimationFrame(step);
            };
            node.textContent = '0';
            window.requestAnimationFrame(step);
        };

        if (!('IntersectionObserver' in window)) {
            counters.forEach(run);
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                run(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.4 });
        counters.forEach(node => observer.observe(node));
    }

    /** @returns {void} */
    function initReveal() {
        const nodes = Array.from(document.querySelectorAll('[data-corp-reveal]'));
        if (!nodes.length) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
            nodes.forEach(node => node.classList.add('is-visible'));
            return;
        }
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        nodes.forEach(node => observer.observe(node));
    }

    /** @returns {void} */
    function initAccordions() {
        document.querySelectorAll('[data-accordion]').forEach(container => {
            const items = Array.from(container.querySelectorAll('.accordion-item'));

            /**
             * @param {Element} item
             * @param {boolean} open
             * @returns {void}
             */
            const setItem = (item, open) => {
                const trigger = item.querySelector('.accordion-trigger');
                const panel = item.querySelector('.accordion-panel');
                if (!(trigger instanceof HTMLElement) || !(panel instanceof HTMLElement)) return;
                item.classList.toggle('is-open', open);
                trigger.setAttribute('aria-expanded', String(open));
                panel.setAttribute('aria-hidden', String(!open));
                panel.style.maxHeight = open ? `${panel.scrollHeight}px` : '0px';
            };

            items.forEach(item => {
                const trigger = item.querySelector('.accordion-trigger');
                if (!(trigger instanceof HTMLElement)) return;
                setItem(item, item.classList.contains('is-open'));
                trigger.addEventListener('click', () => {
                    const willOpen = !item.classList.contains('is-open');
                    items.forEach(other => setItem(other, other === item && willOpen));
                });
            });
        });
    }

    /** @returns {void} */
    function initExperienceChapters() {
        const section = document.getElementById('sobre');
        if (!section) return;
        const chapters = Array.from(section.querySelectorAll('[data-exp-chapter]'));
        const frames = Array.from(section.querySelectorAll('[data-exp-frame]'));
        const counter = section.querySelector('#exp-index');
        if (!chapters.length || !frames.length) return;

        /** @param {number} index */
        const setActive = (index) => {
            const active = Math.max(0, Math.min(frames.length - 1, index));
            chapters.forEach((chapter, i) => chapter.classList.toggle('is-active', i === active));
            frames.forEach((frame, i) => frame.classList.toggle('is-active', i === active));
            if (counter) counter.textContent = String(active + 1).padStart(2, '0');
        };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
            setActive(0);
            return;
        }

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) setActive(Number(entry.target.getAttribute('data-exp-chapter')));
            });
        }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });
        chapters.forEach(chapter => observer.observe(chapter));

        // Ao voltar para o topo da seção, a introdução reativa o capítulo 01
        // em vez de manter o último capítulo visitado.
        const intro = section.querySelector('.exp-intro');
        if (intro) {
            const introObserver = new IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting)) setActive(0);
            }, { rootMargin: '-35% 0px -35% 0px', threshold: 0 });
            introObserver.observe(intro);
        }

        setActive(0);
    }

    /** @returns {void} */
    function initFloatingControls() {
        /** @type {HTMLElement[]} */
        const sections = [];
        ['contato'].forEach(id => {
            const section = document.getElementById(id);
            if (section) sections.push(section);
        });
        if (!sections.length || !('IntersectionObserver' in window)) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                document.body.classList.toggle('is-contact-visible', entry.isIntersecting);
            });
        }, { threshold: 0.12 });
        sections.forEach(section => observer.observe(section));

        const chapters = document.querySelector('.exp-chapters');
        if (chapters) {
            const chaptersObserver = new IntersectionObserver(entries => {
                document.body.classList.toggle('is-editorial-visible', entries[0].isIntersecting);
            }, { threshold: 0.12 });
            chaptersObserver.observe(chapters);
        }
    }

    /** @returns {void} */
    function splitHeroTitle() {
        const title = document.querySelector('.hero-title');
        if (!(title instanceof HTMLElement)) return;
        const text = (title.textContent || '').replace(/\s+/g, ' ').trim();
        if (!text) return;
        if (title.querySelector('.hero-word') && title.dataset.splitText === text) return;
        title.dataset.splitText = text;
        const words = text.split(' ');
        const fragment = document.createDocumentFragment();
        words.forEach((word, index) => {
            const outer = document.createElement('span');
            outer.className = 'hero-word';
            outer.style.setProperty('--i', String(index));
            const inner = document.createElement('span');
            inner.textContent = word;
            outer.appendChild(inner);
            fragment.appendChild(outer);
            if (index < words.length - 1) fragment.appendChild(document.createTextNode(' '));
        });
        title.replaceChildren(fragment);
        title.setAttribute('aria-label', text);
    }

    /** @returns {void} */
    function initScrollSpy() {
        const links = Array.from(document.querySelectorAll('.desktop-nav a[href^="#"]'));
        if (!links.length || !('IntersectionObserver' in window)) return;
        /** @type {Map<string, HTMLElement>} */
        const byId = new Map();
        links.forEach(link => {
            const id = (link.getAttribute('href') || '').replace('#', '');
            const section = id ? document.getElementById(id) : null;
            if (section) byId.set(section.id, /** @type {HTMLElement} */ (link));
        });
        if (!byId.size) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                links.forEach(link => link.removeAttribute('aria-current'));
                byId.get(entry.target.id)?.setAttribute('aria-current', 'true');
            });
        }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
        byId.forEach((_link, id) => {
            const section = document.getElementById(id);
            if (section) observer.observe(section);
        });
    }

    /**
     * @param {string} key
     * @param {'success' | 'error' | 'info'} type
     * @returns {void}
     */
    function setStatus(key, type) {
        const status = document.getElementById('contact-status');
        if (!status) return;
        contactStatusKey = key;
        status.textContent = key ? t(key) : '';
        status.classList.remove('is-success', 'is-error', 'is-info');
        if (type) status.classList.add(`is-${type}`);
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
    }

    /**
     * @param {string} text
     * @returns {string}
     */
    function whatsappUrl(text) {
        const store = window.STORES?.[0];
        if (!store) return '';
        return `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(text)}`;
    }

    /**
     * Envia o contato por um relay de formulário quando a API própria
     * não está configurada ou não está rodando.
     * @param {{ name: string, email: string, phone: string, message: string, website: string }} payload
     * @param {string} subjectLabel
     * @returns {Promise<boolean>}
     */
    async function sendViaContactFallback(payload, subjectLabel) {
        try {
            const response = await fetch(CONTACT_FALLBACK_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                body: JSON.stringify({
                    name: payload.name,
                    email: payload.email,
                    phone: payload.phone,
                    subject: subjectLabel,
                    message: payload.message,
                    _subject: `[Site Miplace] ${subjectLabel}`,
                    _template: 'table',
                    _captcha: 'false',
                    _honey: payload.website || ''
                })
            });

            if (!response.ok) return false;
            const result = await response.json().catch(() => null);
            if (result && (result.success === true || result.success === 'true')) return true;
            if (result && result.message) console.warn('[contact] fallback:', result.message);
            return false;
        } catch (error) {
            console.warn('[contact] fallback indisponível:', error);
            return false;
        }
    }

    /** @returns {void} */
    function initContactForm() {
        const form = /** @type {HTMLFormElement | null} */ (document.getElementById('contact-form'));
        if (!form) return;
        const submit = /** @type {HTMLButtonElement | null} */ (form.querySelector('button[type="submit"]'));
        const fallback = document.getElementById('contact-fallback');
        const emailInput = /** @type {HTMLInputElement | null} */ (form.querySelector('input[name="email"]'));
        const whatsappLinks = Array.from(document.querySelectorAll('[data-whatsapp-link]'));

        class ContactValidationError extends Error {
            /** @param {string} message */
            constructor(message) {
                super(message);
                this.name = 'ContactValidationError';
            }
        }

        /**
         * Mostra a mensagem real da API em vez do erro genérico.
         * @param {string} message
         * @returns {void}
         */
        const showValidationMessage = (message) => {
            const status = document.getElementById('contact-status');
            if (!status) return;
            contactStatusKey = '';
            status.textContent = message;
            status.classList.remove('is-success', 'is-error', 'is-info');
            status.classList.add('is-error');
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
        };
        whatsappLinks.forEach(link => {
            link.addEventListener('click', () => {
                track('contact_whatsapp', { source_name: link.id || 'contact' });
            });
        });

        /** @type {HTMLSelectElement | null} */
        const subject = /** @type {HTMLSelectElement | null} */ (document.querySelector('#contact-form select[name="subject"]'));
        document.querySelectorAll('[data-contact-subject]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const value = trigger.getAttribute('data-contact-subject') || '';
                if (subject && value) subject.value = value;
            });
        });

        // Telefone brasileiro: DDD (2) + 9 dígitos, exibido como (19) 98935-4849.
        const phoneInput = /** @type {HTMLInputElement | null} */ (form.querySelector('input[name="phone"]'));
        if (phoneInput) {
            const formatPhone = () => {
                let digits = phoneInput.value.replace(/\D/g, '');
                // Aceita colagem com código do país (+55) sem perder o DDD.
                if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
                digits = digits.slice(0, 11);

                let formatted = '';
                if (digits.length > 0) formatted = `(${digits.slice(0, 2)}`;
                if (digits.length >= 3) formatted += `) ${digits.slice(2, 7)}`;
                if (digits.length >= 8) formatted += `-${digits.slice(7, 11)}`;
                phoneInput.value = formatted;
            };

            phoneInput.addEventListener('input', formatPhone);
            phoneInput.addEventListener('blur', formatPhone);
            if (phoneInput.value) formatPhone();
        }

        form.addEventListener('submit', async event => {
            event.preventDefault();
            if (!form.reportValidity()) return;

            if (emailInput && !isValidContactEmail(emailInput.value)) {
                const message = window.MiplaceI18n?.t('contact.emailInvalid')
                    || 'Informe um e-mail válido, como nome@gmail.com.';
                showValidationMessage(message);
                emailInput.focus();
                return;
            }

            const data = new FormData(form);
            const payload = {
                name: String(data.get('name') || '').trim(),
                email: String(data.get('email') || '').trim(),
                phone: String(data.get('phone') || '').trim(),
                subject: String(data.get('subject') || '').trim(),
                message: String(data.get('message') || '').trim(),
                consent: data.get('consent') === 'on',
                website: String(data.get('website') || '').trim()
            };

            if (payload.website) {
                setStatus('contact.success', 'success');
                form.reset();
                return;
            }

            const subjectLabel = subject?.selectedOptions?.[0]?.textContent?.trim() || payload.subject;
            const text = `${payload.name}\n${payload.email} — ${payload.phone}\n${subjectLabel}\n\n${payload.message}`;
            const emailFallback = /** @type {HTMLAnchorElement | null} */ (document.getElementById('contact-email-fallback'));
            if (emailFallback) {
                emailFallback.href = `mailto:contasgeraljack@gmail.com?subject=${encodeURIComponent(`Contato pelo site — ${subjectLabel}`)}&body=${encodeURIComponent(text)}`;
            }
            const url = whatsappUrl(text);
            if (url) {
                whatsappLinks.forEach(link => {
                    if (link instanceof HTMLAnchorElement) link.href = url;
                });
            }

            if (submit) {
                submit.disabled = true;
                submit.dataset.label = submit.textContent || t('contact.submit');
                submit.textContent = t('contact.sending');
            }
            setStatus('', 'info');

            const controller = new AbortController();
            const timer = window.setTimeout(() => controller.abort(), 12000);
            try {
                let sent = false;
                let apiUnavailable = false;

                try {
                    const response = await fetch('/api/contact', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                        signal: controller.signal
                    });

                    if (response.ok) {
                        sent = true;
                    } else if ([404, 502, 503].includes(response.status)) {
                        apiUnavailable = true;
                    } else {
                        const body = await response.json().catch(() => null);
                        const fieldMessage = body
                            && Array.isArray(body.errors)
                            && body.errors[0]
                            && typeof body.errors[0].message === 'string'
                            ? body.errors[0].message
                            : (body && typeof body.message === 'string' ? body.message : '');
                        if (fieldMessage) throw new ContactValidationError(fieldMessage);
                        throw new Error(`HTTP ${response.status}`);
                    }
                } catch (error) {
                    const errorName = error && typeof error === 'object' && 'name' in error
                        ? String(error.name)
                        : '';
                    if (error instanceof TypeError || errorName === 'AbortError') {
                        apiUnavailable = true;
                    } else {
                        throw error;
                    }
                }

                if (!sent && apiUnavailable) {
                    sent = await sendViaContactFallback(payload, subjectLabel);
                }

                if (!sent) throw new Error('CONTACT_SEND_FAILED');

                track('generate_lead', { cta_name: payload.subject });
                setStatus('contact.success', 'success');
                form.reset();
                fallback?.classList.remove('is-visible');
            } catch (error) {
                if (error instanceof ContactValidationError) {
                    showValidationMessage(error.message);
                    fallback?.classList.remove('is-visible');
                } else {
                    setStatus('contact.error', 'error');
                    fallback?.classList.add('is-visible');
                }
            } finally {
                window.clearTimeout(timer);
                if (submit) {
                    submit.disabled = false;
                    submit.textContent = submit.dataset.label || t('contact.submit');
                }
            }
        });

        window.addEventListener('miplace:localechange', () => {
            if (contactStatusKey) setStatus(contactStatusKey, contactStatusKey === 'contact.success' ? 'success' : 'error');
            if (submit && !submit.disabled) submit.textContent = t('contact.submit');
        });
    }

    /** @returns {void} */
    function initBrandTiles() {
        document.querySelectorAll('[data-brand-link]').forEach(tile => {
            tile.addEventListener('click', () => {
                const brand = tile.getAttribute('data-brand-link') || 'Todos';
                if (typeof window.setFilter === 'function') window.setFilter(brand);
                const catalog = document.getElementById('catalogo');
                catalog?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    /** @returns {void} */
    function initYear() {
        const year = document.getElementById('year');
        if (year) year.textContent = String(new Date().getFullYear());
    }

    /** @returns {void} */
    function init() {
        window.MiplaceAnalytics?.page('home');
        initStickyHeader();
        initMobileMenu();
        initCounters();
        initReveal();
        initAccordions();
        initExperienceChapters();
        initFloatingControls();
        splitHeroTitle();
        initScrollSpy();
        initContactForm();
        initBrandTiles();
        initYear();
        window.addEventListener('miplace:localechange', () => {
            window.requestAnimationFrame(splitHeroTitle);
        });
    }

    window.refreshCorporateReveal = initReveal;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
