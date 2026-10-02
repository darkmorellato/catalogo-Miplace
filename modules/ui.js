// ============================================================
// MIPLACE MAGAZINE — ui.js
// Utilitários: trapFocus, debounce, escapeHTML, áudio, menus, scroll reveal
// @ts-check
// ============================================================

(() => {
    'use strict';

    /**
     * Funcao compartilhada de escape HTML usada por catalog.js e modal.js.
     * Centralizada aqui para evitar duplicação e manter o JSDoc consistente.
     * @param {unknown} str
     * @returns {string}
     */
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Bloqueia a rolagem do body com técnica iOS-safe (position: fixed + scrollY).
     * @returns {() => void}
     */
    function lockBodyScroll() {
        const scrollY = window.scrollY || window.pageYOffset || 0;
        const orig = {
            overflow: document.body.style.overflow,
            position: document.body.style.position,
            top: document.body.style.top,
            width: document.body.style.width
        };
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        return () => {
            document.body.style.overflow = orig.overflow;
            document.body.style.position = orig.position;
            document.body.style.top = orig.top;
            document.body.style.width = orig.width;
            window.scrollTo(0, scrollY);
        };
    }


    /**
     * Registra o focus trap em um modal e retorna uma função para removê-lo.
     * Evita memory leak quando openModal/closeModal são chamados várias vezes.
     * @param {Element} modalEl
     * @returns {() => void}
     */
    function trapFocus(modalEl) {
        const focusable = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = /** @type {HTMLElement} */ (focusable[0]);
        const last = /** @type {HTMLElement} */ (focusable[focusable.length - 1]);

        /** @type {EventListener} */
        const handler = function(/** @type {Event} */ _e) {
            const e = /** @type {KeyboardEvent} */ (_e);
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        modalEl.addEventListener('keydown', handler);
        return () => modalEl.removeEventListener('keydown', handler);
    }

    /**
     * @template {(...args: any[]) => any} F
     * @param {F} fn
     * @param {number} delay
     * @returns {(...args: Parameters<F>) => void}
     */
    function debounce(fn, delay) {
        /** @type {ReturnType<typeof setTimeout> | undefined} */
        let timer;
        return function(/** @type {any[]} */ ...args) {
            // @ts-ignore — `this` é dinâmico, intencional
            const self = this;
            if (timer) clearTimeout(timer);
            timer = setTimeout(() => fn.apply(self, args), delay);
        };
    }

    /**
     * @param {string} eventName
     * @param {Record<string, any>} [_params]
     * @returns {void}
     */
    function trackEvent(eventName, _params = {}) {
        // Vercel Analytics é capturado automaticamente pelo script injetado
    }

    /** @type {AudioContext | null} */
    let audioCtx = null;
    /** @returns {AudioContext} */
    function getAudioCtx() {
        if (!audioCtx) {
            const Ctor = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
            audioCtx = new Ctor();
        }
        return audioCtx;
    }
    /** @returns {void} */
    function playUIClick() {
        try {
            const ctx = getAudioCtx();
            if (ctx.state === 'suspended') ctx.resume();
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
            osc.connect(gainNode);
            gainNode.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.05);
        } catch (_e) {}
    }

    /** @returns {void} */
    function toggleMobileMenu() {
        playUIClick();
        const menu = document.getElementById('mobile-menu');
        const btn = document.getElementById('hamburger-btn');
        if (!menu || !btn) return;
        const isOpen = menu.classList.contains('open');
        menu.classList.toggle('open', !isOpen);
        btn.classList.toggle('open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
    }

    /** @returns {void} */
    function closeMobileMenu() {
        playUIClick();
        const menu = document.getElementById('mobile-menu');
        const btn = document.getElementById('hamburger-btn');
        if (!menu || !btn) return;
        menu.classList.remove('open');
        btn.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    }

    /** @returns {void} */
    function toggleContato() {
        playUIClick();
        const menu = document.getElementById('contato-menu');
        const icon = document.getElementById('contato-icon');
        if (!menu) return;
        if (menu.classList.contains('opacity-0')) {
            menu.classList.remove('opacity-0', 'invisible');
            menu.classList.add('opacity-100', 'visible');
            if (icon) icon.style.transform = 'scale(1.2)';
        } else {
            menu.classList.add('opacity-0', 'invisible');
            menu.classList.remove('opacity-100', 'visible');
            if (icon) icon.style.transform = 'scale(1)';
        }
    }

    // Observador compartilhado de scroll reveal: dispara a entrada dos elementos
    // quando ficam visíveis na viewport (uma única vez, sem scroll listeners).
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            el.classList.add(el.hasAttribute('data-reveal') ? 'reveal-in' : 'active');
            revealObserver.unobserve(el);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    /** @returns {void} */
    function initScrollReveal() {
        document.querySelectorAll('.reveal, [data-reveal]').forEach(el => revealObserver.observe(el));
    }

    /**
     * Observa elementos de revelação dentro de um container recém-renderizado.
     * @param {ParentNode} container
     * @returns {void}
     */
    function initRevealIn(container) {
        if (!container) return;
        container.querySelectorAll('.reveal, [data-reveal]').forEach(el => revealObserver.observe(el));
    }

    /** @returns {boolean} */
    function prefersReducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    // ------------------------------------------------------------------
    // Parallax editorial dos renders (Fase 2 do plano de animação):
    // camadas de imagem deslizam via `translate` (propriedade independente),
    // somente enquanto visíveis, num único loop de rAF.
    // ------------------------------------------------------------------
    /** @type {HTMLElement[]} */
    let parallaxEls = [];
    let parallaxQueued = false;

    /** @returns {void} */
    function updateParallax() {
        parallaxQueued = false;
        const vh = window.innerHeight;
        for (const el of parallaxEls) {
            const rect = el.getBoundingClientRect();
            if (rect.bottom < -80 || rect.top > vh + 80) continue;
            const speed = parseFloat(el.getAttribute('data-speed') || '0.05');
            const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
            el.style.translate = '0 ' + (-progress * speed * 100).toFixed(2) + '%';
        }
    }

    /** @returns {void} */
    function queueParallax() {
        if (parallaxQueued) return;
        parallaxQueued = true;
        window.requestAnimationFrame(updateParallax);
    }

    /**
     * Tilt magnético 3D + reflexo especular seguidor de cursor.
     * @param {HTMLElement} card
     * @returns {void}
     */
    function bindTilt(card) {
        card.addEventListener('pointermove', (e) => {
            const evt = /** @type {PointerEvent} */ (/** @type {unknown} */ (e));
            const rect = card.getBoundingClientRect();
            const px = (evt.clientX - rect.left) / rect.width;
            const py = (evt.clientY - rect.top) / rect.height;
            const rx = (0.5 - py) * 7;
            const ry = (px - 0.5) * 9;
            card.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
            card.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
            card.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        });
        card.addEventListener('pointerleave', () => {
            const from = card.style.transform || 'none';
            card.style.transform = '';
            if (typeof card.animate === 'function') {
                card.animate(
                    [{ transform: from }, { transform: 'none' }],
                    { duration: 650, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
                );
            }
        });
    }

    let parallaxBound = false;

    /**
     * Liga tilt/specular nos cards e registra as camadas de parallax.
     * @param {ParentNode} container
     * @returns {void}
     */
    function initCardEffects(container) {
        if (!container) return;
        const reduced = prefersReducedMotion();
        const finePointer = window.matchMedia('(pointer: fine)').matches;
        if (!reduced && finePointer) {
            container.querySelectorAll('[data-tilt]').forEach(el => bindTilt(/** @type {HTMLElement} */ (el)));
        }
        parallaxEls = Array.from(document.querySelectorAll('[data-parallax]'));
        if (reduced) {
            parallaxEls.forEach(el => { el.style.translate = ''; });
            return;
        }
        if (!parallaxBound) {
            parallaxBound = true;
            window.addEventListener('scroll', queueParallax, { passive: true });
            window.addEventListener('resize', queueParallax, { passive: true });
        }
        queueParallax();
    }

    // Expor API usada por app.js e HTML inline
    window.escapeHTML = escapeHTML;
    window.trapFocus = trapFocus;
    window.debounce = debounce;
    window.trackEvent = trackEvent;
    window.playUIClick = playUIClick;
    window.toggleMobileMenu = toggleMobileMenu;
    window.closeMobileMenu = closeMobileMenu;
    window.toggleContato = toggleContato;
    window.initScrollReveal = initScrollReveal;
    window.initRevealIn = initRevealIn;
    window.initCardEffects = initCardEffects;
    window.lockBodyScroll = lockBodyScroll;
})();
