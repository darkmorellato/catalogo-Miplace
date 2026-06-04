// ============================================================
// MIPLACE MAGAZINE — app.js
// Entrada principal: dados, inicialização e efeitos visuais
// Módulos: modules/ui.js, modules/catalog.js, modules/modal.js
// @ts-check
// ============================================================

(() => {
    'use strict';

    /** @type {AppState} */
    const state = {
        /** @type {HTMLElement | null} */
        backToTop: null,
        /** @type {HTMLElement | null} */
        scrollProgress: null,
        scrollTicking: false,
        /** @type {DOMRect | null} */
        parallaxRect: null,
        parallaxFrame: 0,
        parallaxX: 0,
        parallaxY: 0,
        /** @type {number} */
        navLinkFrame: 0,
        navLinkTargetX: 0,
        navLinkTargetY: 0,
        audio: {
            /** @type {HTMLAudioElement | null} */
            bg: null,
            /** @type {HTMLElement | null} */
            control: null,
            /** @type {HTMLElement | null} */
            icon: null,
            isPlaying: false
        }
    };

    /** @type {Product[]} */
    const productsData = [];

    /** @returns {Promise<void>} */
    async function loadPrecosFromJSON() {
        try {
            const response = await fetch('produtos.json');
            if (!response.ok) throw new Error('Falha ao carregar produtos.json');
            productsData.length = 0;
            const data = await response.json();
            productsData.push(...data);
        } catch (/** @type {unknown} */ err) {
            console.error('[Miplace] Erro ao carregar produtos.json:', /** @type {Error} */ (err).message);
        }
    }

    /** @returns {void} */
    function setupParallax() {
        const heroParallax = document.getElementById('hero-parallax');
        if (!(heroParallax instanceof HTMLElement)) return;

        const updateRect = () => {
            state.parallaxRect = heroParallax.getBoundingClientRect();
        };
        updateRect();
        window.addEventListener('scroll', updateRect, { passive: true });
        window.addEventListener('resize', updateRect, { passive: true });

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        document.addEventListener('mousemove', e => {
            if (reduced.matches || !state.parallaxRect) return;
            const r = state.parallaxRect;
            const cx = r.left + r.width / 2;
            const cy = r.top + r.height / 2;
            state.parallaxX = (e.clientX - cx) / window.innerWidth * 12;
            state.parallaxY = (e.clientY - cy) / window.innerHeight * 8;
            if (state.parallaxFrame) return;
            state.parallaxFrame = requestAnimationFrame(() => {
                heroParallax.style.transform = `translate(${state.parallaxX}px, ${state.parallaxY}px)`;
                state.parallaxFrame = 0;
            });
        }, { passive: true });
    }

    /** @returns {void} */
    function setupMagneticLinks() {
        const nav = document.querySelector('nav .hidden.md\\:flex');
        if (!(nav instanceof HTMLElement)) return;
        const links = nav.querySelectorAll('a');
        if (!links.length) return;
        links.forEach(l => l.classList.add('magnetic-link'));

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
        /** @type {Map<Element, DOMRect>} */
        const linkRects = new Map();
        /** @type {HTMLElement | null} */
        let currentLink = null;

        const invalidateRects = () => linkRects.clear();
        window.addEventListener('resize', invalidateRects, { passive: true });
        window.addEventListener('scroll', invalidateRects, { passive: true });

        nav.addEventListener('mousemove', e => {
            if (reduced.matches) return;
            const target = /** @type {Element} */ (/** @type {unknown} */ (e.target));
            const link = target.closest('a');
            if (!(link instanceof HTMLElement) || link === currentLink) return;
            if (currentLink) currentLink.style.transform = 'translate(0,0)';
            currentLink = link;
            let rect = linkRects.get(link);
            if (!rect) { rect = link.getBoundingClientRect(); linkRects.set(link, rect); }
            state.navLinkTargetX = (e.clientX - rect.left - rect.width / 2) * 0.25;
            state.navLinkTargetY = (e.clientY - rect.top - rect.height / 2) * 0.25;
            if (!state.navLinkFrame) {
                state.navLinkFrame = requestAnimationFrame(() => {
                    if (currentLink) {
                        currentLink.style.transform = `translate(${state.navLinkTargetX}px, ${state.navLinkTargetY}px)`;
                    }
                    state.navLinkFrame = 0;
                });
            }
        });

        nav.addEventListener('mouseleave', () => {
            if (currentLink instanceof HTMLElement) currentLink.style.transform = 'translate(0,0)';
            currentLink = null;
        });
    }

    /** @returns {void} */
    function setupRipple() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;
        grid.addEventListener('click', e => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            const target = /** @type {Element} */ (/** @type {unknown} */ (e.target));
            const card = target.closest('.img-zoom-container');
            if (!(card instanceof HTMLElement)) return;
            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.cssText = `
                width: ${size}px; height: ${size}px;
                left: ${e.clientX - rect.left - size/2}px;
                top:  ${e.clientY - rect.top  - size/2}px;
            `;
            card.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        });
    }

    /** @returns {void} */
    function setupScroll() {
        const onScroll = () => {
            if (state.scrollTicking) return;
            state.scrollTicking = true;
            requestAnimationFrame(() => {
                const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
                const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrolled = (winScroll / height) * 100;
                if (state.scrollProgress) state.scrollProgress.style.width = scrolled + '%';
                if (state.backToTop) {
                    const visible = winScroll > 400;
                    state.backToTop.style.opacity = visible ? '1' : '0';
                    state.backToTop.style.pointerEvents = visible ? 'auto' : 'none';
                }
                state.scrollTicking = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
    }

    /** @returns {void} */
    function setupAudio() {
        const bg = document.getElementById('bg-music');
        const control = document.getElementById('audio-control');
        const icon = document.getElementById('audio-icon');
        const pulse = document.getElementById('audio-pulse');
        if (!(bg instanceof HTMLAudioElement) || !(control instanceof HTMLElement) || !(icon instanceof HTMLElement)) return;
        state.audio.bg = bg;
        state.audio.control = control;
        state.audio.icon = icon;

        const toggle = () => {
            if (state.audio.isPlaying) {
                bg.pause();
                icon.classList.remove('fa-compact-disc', 'animate-spin-slow');
                icon.classList.add('fa-music');
                if (pulse) pulse.classList.remove('hidden');
                state.audio.isPlaying = false;
            } else {
                bg.volume = 0.05;
                bg.play().then(() => {
                    icon.classList.remove('fa-music');
                    icon.classList.add('fa-compact-disc', 'animate-spin-slow');
                    if (pulse) pulse.classList.add('hidden');
                    state.audio.isPlaying = true;
                }).catch(err => console.log('Autoplay bloqueado pelo navegador:', err));
            }
        };

        control.addEventListener('click', e => { e.stopPropagation(); toggle(); });
        document.body.addEventListener('click', function firstInteraction(e) {
            const target = /** @type {Node | null} */ (e.target);
            if (target && control.contains(target)) return;
            if (!state.audio.isPlaying) toggle();
        }, { once: true });
    }

    /** @returns {void} */
    function setupShimmer() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;
        grid.querySelectorAll('.img-zoom-container').forEach(el => el.classList.add('card-shimmer'));
    }

    /** @returns {void} */
    function setupCountUp() {
        const els = document.querySelectorAll('.count-up');
        if (!els.length) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCountUp(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        els.forEach(el => observer.observe(el));
    }

    /**
     * @param {Element} el
     * @returns {void}
     */
    function animateCountUp(el) {
        const target = parseInt(el.getAttribute('data-target') || '0', 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const start = performance.now();
        function step(/** @type {DOMHighResTimeStamp} */ now) {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(eased * target) + suffix;
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /** @returns {void} */
    function setupImageErrorFallback() {
        document.addEventListener('error', e => {
            const target = /** @type {EventTarget | null} */ (e.target);
            const img = /** @type {HTMLImageElement | null} */ (target);
            if (!img || img.tagName?.toLowerCase() !== 'img') return;
            const src = img.getAttribute('src');
            if (!src || img.src.startsWith('data:')) return;
            if (!img.dataset.originalSrc) img.dataset.originalSrc = src;
            const originalSrc = img.dataset.originalSrc;
            if (!originalSrc) return;
            if (!img.dataset.fallback) { img.dataset.fallback = 'lower'; img.src = originalSrc.toLowerCase(); }
            else if (img.dataset.fallback === 'lower') { img.dataset.fallback = 'jpg'; img.src = originalSrc.toLowerCase().replace('.png', '.jpg'); }
            else if (img.dataset.fallback === 'jpg') { img.dataset.fallback = 'upper'; img.src = originalSrc.replace('.png', '.PNG').replace('.jpg', '.JPG'); }
        }, false);
    }

    /** @returns {void} */
    function setupHeroTitleSplit() {
        const h1 = document.querySelector('h1.font-serif');
        if (!(h1 instanceof HTMLElement) || h1.dataset.splitDone) return;
        const text = h1.textContent?.trim() || '';
        h1.innerHTML = text.split('').map((ch, i) =>
            ch === ' '
                ? ' '
                : `<span class="split-letter" style="animation-delay:${i * 0.06}s">${ch}</span>`
        ).join('');
        h1.dataset.splitDone = '1';
    }

    /** @returns {void} */
    function setupContactDropdown() {
        document.addEventListener('click', e => {
            const target = /** @type {Node} */ (e.target);
            const container = document.querySelector('.dropdown-container');
            if (container && !container.contains(target)) {
                const menu = document.getElementById('contato-menu');
                const icon = document.getElementById('contato-icon');
                if (menu && !menu.classList.contains('opacity-0')) {
                    menu.classList.add('opacity-0', 'invisible');
                    menu.classList.remove('opacity-100', 'visible');
                    if (icon) icon.style.transform = 'scale(1)';
                }
            }
        });
    }

    /** @returns {void} */
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(reg => console.log('[PWA] Service Worker registrado:', reg.scope))
                .catch(err => console.warn('[PWA] Falha:', err));
        }
    }

    /** @returns {void} */
    function init() {
        state.backToTop = document.getElementById('back-to-top');
        state.scrollProgress = document.getElementById('scroll-progress');

        if (typeof window.injectSchemaOrg === 'function') window.injectSchemaOrg();
        if (typeof window.initCatalog === 'function') window.initCatalog();
        if (typeof window.initModal === 'function') window.initModal();
        if (typeof window.initSearch === 'function') window.initSearch();
        if (typeof window.initScrollReveal === 'function') window.initScrollReveal();
        loadPrecosFromJSON().then(() => {
            window.renderFilters();
            window.renderProducts();
            if (typeof window.startGridCarousel === 'function') window.startGridCarousel();
            if (window.MiplaceWishlist) window.MiplaceWishlist.refresh();
        });
        window.renderContactDropdown('contato-dropdown-content');
        window.renderStoreCards('stores-grid');
        document.querySelectorAll('#stores-grid .reveal').forEach(el => el.classList.add('active'));

        setupContactDropdown();
        registerServiceWorker();
        setupScroll();
        setupAudio();
        setupHeroTitleSplit();
        setupParallax();
        setupMagneticLinks();
        setupRipple();
        setupShimmer();
        setupCountUp();
        setupImageErrorFallback();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expor estado compartilhado para outros módulos sem poluir window com `var`
    window.MiplaceState = state;
    window.MiplaceProducts = productsData;
})();
