// ============================================================
// MIPLACE MAGAZINE — ui.js
// Utilitários: trapFocus, debounce, áudio, menus, scroll reveal
// @ts-check
// ============================================================

(() => {
    'use strict';

    /**
     * @param {Element} modalEl
     * @returns {void}
     */
    function trapFocus(modalEl) {
        const focusable = modalEl.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = /** @type {HTMLElement} */ (focusable[0]);
        const last = /** @type {HTMLElement} */ (focusable[focusable.length - 1]);
        modalEl.addEventListener('keydown', /** @type {EventListener} */ (function handler(/** @type {Event} */ _e) {
            const e = /** @type {KeyboardEvent} */ (_e);
            if (e.key !== 'Tab') return;
            if (e.shiftKey) {
                if (document.activeElement === first) { e.preventDefault(); last.focus(); }
            } else {
                if (document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        }));
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

    /** @returns {void} */
    function initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { entry.target.classList.add('active'); observer.unobserve(entry.target); }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // Expor API usada por app.js e HTML inline
    window.trapFocus = trapFocus;
    window.debounce = debounce;
    window.trackEvent = trackEvent;
    window.playUIClick = playUIClick;
    window.toggleMobileMenu = toggleMobileMenu;
    window.closeMobileMenu = closeMobileMenu;
    window.toggleContato = toggleContato;
    window.initScrollReveal = initScrollReveal;
})();
