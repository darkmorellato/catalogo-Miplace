// ============================================================
// MIPLACE GROUP — scroll.js
// Motor único de progresso de scroll para as camadas decorativas.
// Calcula --p (hero/pin/cover) e --pe (entrada da seção).
// Conteúdo permanece one-shot; apenas decoração reverte ao subir.
// @ts-check
// ============================================================

(() => {
    'use strict';

    const scenes = Array.from(document.querySelectorAll('[data-scroll]'));
    if (!scenes.length) return;

    const root = document.documentElement;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    /** @type {Set<Element>} */
    const near = new Set();
    /** @type {number} */
    let frame = 0;

    /**
     * @param {number} value
     * @param {number} min
     * @param {number} max
     * @returns {number}
     */
    const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

    /**
     * Calcula a posição da seção e grava as custom properties.
     * @param {Element} scene
     * @returns {void}
     */
    function apply(scene) {
        if (!(scene instanceof HTMLElement)) return;
        const rect = scene.getBoundingClientRect();
        const vh = Math.max(1, window.innerHeight);
        const mode = scene.dataset.scroll;

        let progress;
        if (mode === 'pin') {
            const total = Math.max(1, rect.height - vh);
            progress = clamp(-rect.top / total, 0, 1);
        } else if (mode === 'hero') {
            progress = clamp(1 + rect.top / vh, 0, 1);
        } else {
            const total = Math.max(1, vh + rect.height);
            progress = clamp((vh - rect.top) / total, 0, 1);
        }

        // Entrada: 0 quando o topo da seção está no rodapé da viewport,
        // 1 quando o topo já subiu 45% da tela. Reverte ao descer de volta.
        const entry = clamp((vh - rect.top) / (vh * 0.55), 0, 1);

        scene.style.setProperty('--p', progress.toFixed(4));
        scene.style.setProperty('--pe', entry.toFixed(4));
    }

    /** @returns {void} */
    function update() {
        frame = 0;
        near.forEach(apply);
    }

    /** @returns {void} */
    function requestUpdate() {
        if (frame) return;
        frame = window.requestAnimationFrame(update);
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                entry.target.classList.toggle('is-near', entry.isIntersecting);
                if (entry.isIntersecting) {
                    near.add(entry.target);
                } else {
                    near.delete(entry.target);
                }
                // Atualiza na entrada/saída para saltos por âncora não
                // dependerem de um novo evento de scroll.
                apply(entry.target);
            });
        }, { rootMargin: '30% 0px 30% 0px', threshold: 0 });

        scenes.forEach((scene) => {
            observer.observe(scene);
            apply(scene);
        });
    } else {
        scenes.forEach((scene) => {
            near.add(scene);
            apply(scene);
        });
    }

    const syncReduced = () => {
        root.classList.toggle('scroll-static', reduced.matches);
    };

    syncReduced();
    if (typeof reduced.addEventListener === 'function') {
        reduced.addEventListener('change', syncReduced);
    }

    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', () => {
        scenes.forEach(apply);
    }, { passive: true });
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) scenes.forEach(apply);
    });
})();
