// ============================================================
// MIPLACE MAGAZINE — catalog.js
// Catálogo: filtros, busca, renderização de produtos, carrossel
// @ts-check
// ============================================================

(() => {
    'use strict';

    const productsData = () => window.MiplaceProducts || [];

    /** @type {CatalogState} */
    const state = {
        currentFilter: 'Todos',
        currentSearch: '',
        gridCarouselInterval: null,
        kbToggle: false,
        visibleIds: /** @type {Set<HTMLElement>} */ (new Set()),
        intersectionObserver: null,
        visibilityPaused: false
    };

    /** @type {('Todos' | ProductBrand)[]} */
    const brands = ['Todos', 'Realme', 'Honor', 'Motorola', 'Redmi', 'Poco', 'iPhone'];

    /**
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

    /** @returns {typeof state} */
    function getStore() { return state; }

    /** @returns {void} */
    function renderFilters() {
        const container = document.getElementById('category-filters');
        if (!container) return;
        container.innerHTML = brands.map(brand => `
            <button type="button" data-brand="${escapeHTML(brand)}" class="filter-btn relative pb-1 transition-colors" style="color:${state.currentFilter === brand ? '#1c1917' : '#44403c'}; ${state.currentFilter === brand ? 'border-bottom: 2px solid #1c1917;' : ''}">
                ${escapeHTML(brand)}
            </button>
        `).join('');
    }

    /**
     * @param {string} brand
     * @returns {void}
     */
    function setFilter(brand) {
        state.currentFilter = /** @type {CatalogState['currentFilter']} */ (brand);
        window.trackEvent?.('filter_brand', { brand_name: brand });
        renderFilters();
        const grid = document.getElementById('products-grid');
        if (grid) {
            grid.innerHTML = Array.from({ length: 6 }).map(() => `
                <div class="pb-8 flex flex-col gap-4" style="border-bottom:1px solid rgba(28,25,23,0.2);">
                    <div class="w-full aspect-video rounded animate-pulse" style="background-color:#eaeaeb;"></div>
                    <div class="h-3 rounded w-1/3 animate-pulse" style="background-color:#eaeaeb;"></div>
                    <div class="h-6 rounded w-3/4 animate-pulse" style="background-color:#eaeaeb;"></div>
                    <div class="h-3 rounded w-1/2 animate-pulse" style="background-color:#eaeaeb;"></div>
                </div>`).join('');
        }
        requestAnimationFrame(() => {
            renderProducts();
            startGridCarousel();
        });
    }

    /** @returns {void} */
    function clearSearch() {
        const input = document.getElementById('search-input');
        const clearBtn = document.getElementById('search-clear');
        const searchIcon = document.getElementById('search-icon');
        if (input instanceof HTMLInputElement) input.value = '';
        state.currentSearch = '';
        clearBtn?.classList.add('hidden');
        searchIcon?.classList.remove('hidden');
        renderProducts();
        startGridCarousel();
    }

    /**
     * @param {string} term
     * @returns {string}
     */
    function renderEmptyState(term) {
        return `<div class="col-span-full flex flex-col items-center justify-center py-24 text-center">
            <i class="fa-solid fa-magnifying-glass text-4xl mb-6" style="color:rgba(28,25,23,0.2);"></i>
            <h3 class="font-serif text-3xl mb-3" style="color:#1c1917;">Nenhum produto encontrado</h3>
            <p class="font-sans text-sm mb-8" style="color:#44403c;">Não há produtos para <strong>${escapeHTML(term)}</strong> no momento.</p>
            <button type="button" data-action="reset-search" class="font-sans uppercase tracking-widest text-xs font-bold px-8 py-3 btn-hover-ink-border">
                Ver todos os produtos
            </button>
        </div>`;
    }

    /** @returns {void} */
    function renderProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;
        const searchCount = document.getElementById('search-count');
        const data = productsData();
        /** @type {Product[]} */
        let filtered = state.currentFilter === 'Todos' ? data : data.filter(/** @param {Product} p */ p => p.brand === state.currentFilter);
        if (state.currentSearch.length > 0) {
            const q = state.currentSearch;
            filtered = filtered.filter(/** @param {Product} p */ p => {
                const searchableText = [p.name, p.brand, p.description || '', ...(p.specs || []).map(/** @param {ProductSpec} s */ s => s.value), p.price || ''].join(' ').toLowerCase();
                return searchableText.includes(q);
            });
        }
        if (searchCount) {
            searchCount.textContent = state.currentSearch.length > 0
                ? `${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`
                : '';
        }
        if (filtered.length === 0) {
            container.innerHTML = renderEmptyState(state.currentSearch.length > 0 ? `"${state.currentSearch}"` : state.currentFilter);
            return;
        }
        container.innerHTML = filtered.map(/** @param {Product} p, @param {number} index */ (p, index) => {
            const isFeatured = index === 0;
            const gridClass = isFeatured ? "md:col-span-2 lg:col-span-2 pb-8 md:pb-0 md:pr-8" : "pb-8";
            const titleSize = isFeatured ? "text-4xl md:text-5xl" : "text-2xl";
            const imageContent = p.gallery && p.gallery.length > 1
                ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy" class="w-full h-full object-cover img-zoom transition-opacity duration-500 grid-gallery-img" data-product-id="${p.id}" data-current-idx="0">`
                : (p.image
                    ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy" class="w-full h-full object-cover img-zoom">`
                    : `<i class="fa-solid fa-mobile-screen text-5xl img-zoom" style="color:rgba(28,25,23,0.2);"></i>`);
            const microSpecs = p.specs && p.specs.length > 0
                ? p.specs.slice(0, 2).map(/** @param {ProductSpec} s */ s => s.value.split(' ')[0] + ' ' + (s.value.split(' ')[1] || '')).join(' • ')
                : '';
            const wishlistActive = window.MiplaceWishlist?.has(p.id);
            return `
            <div class="${gridClass} group flex flex-col justify-between h-full stagger-item" style="border-bottom:1px solid rgba(28,25,23,0.2); animation-delay: ${index * 0.05}s;">
                <div>
                    <div class="product-img-wrap w-full aspect-video flex items-center justify-center mb-6 img-zoom-container card-shimmer relative cursor-pointer overflow-hidden" style="background-color:#eaeaeb;" data-open-product="${p.id}">
                        ${p.highlight ? '<span class="absolute top-4 left-4 text-[10px] uppercase tracking-widest px-3 py-1.5" style="background-color:#1c1917;color:#f4f4f0;z-index:30;">Destaque</span>' : ''}
                        <div class="w-full h-full relative" style="z-index:0;">${imageContent}</div>
                        <div class="ver-detalhes-overlay absolute inset-0 flex items-center justify-center" style="background-color:rgba(28,25,23,0.45); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px); z-index:20;">
                            <span class="ver-detalhes-label font-sans uppercase tracking-[0.2em] text-xs font-bold px-6 py-3" style="color:#f4f4f0; border:1px solid #f4f4f0; background-color:rgba(28,25,23,0.55);">Ver Detalhes</span>
                        </div>
                        <button type="button" data-wishlist-toggle="${p.id}" data-wishlist-source="card" aria-pressed="${wishlistActive ? 'true' : 'false'}" aria-label="${wishlistActive ? 'Remover' : 'Adicionar'} ${escapeHTML(p.name)} ${wishlistActive ? 'dos' : 'aos'} favoritos" class="wishlist-btn ${wishlistActive ? 'is-active' : ''}">
                            <i class="fa-regular fa-heart heart-outline" aria-hidden="true"></i>
                            <i class="fa-solid fa-heart heart-filled" aria-hidden="true"></i>
                        </button>
                    </div>
                    <div class="flex justify-between items-end mb-3 pb-2" style="border-bottom:1px solid rgba(28,25,23,0.1);">
                        <span class="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style="color:#44403c;">${escapeHTML(p.brand)}</span>
                        <span class="font-sans text-[9px] uppercase tracking-widest" style="color:#57534e;">Ref. ${String(p.id).padStart(3, '0')}</span>
                    </div>
                    <h4 class="font-serif ${titleSize} leading-none tracking-tight mb-2" style="color:#1c1917;">${escapeHTML(p.name)}</h4>
                    ${microSpecs ? `<p class="font-sans text-[10px] uppercase tracking-[0.15em] truncate" style="color:#57534e;">${escapeHTML(microSpecs)}</p>` : ''}
                </div>
                <div class="mt-6 flex items-end justify-between pt-4" style="border-top:1px solid rgba(28,25,23,0.1);">
                    <div class="font-sans text-sm">
                        ${p.specialPrice
                            ? `<span class="font-bold" style="color:#1c1917;">${escapeHTML(p.specialPrice)}</span>`
                            : p.price
                                ? `<span class="block text-[10px] uppercase tracking-widest mb-1" style="color:#44403c;">A partir de</span><span class="font-bold text-base leading-tight block" style="color:#1c1917;">${escapeHTML(p.price.replace('A partir de ', ''))}</span>`
                                : `<span class="block text-[10px] uppercase tracking-widest mb-1" style="color:#44403c;">Entre em Contato</span><span class="font-bold text-xs leading-tight block" style="color:#1c1917;">Confirmar disponibilidade</span>`
                        }
                    </div>
                    <button type="button" data-open-product="${p.id}" aria-label="Ver detalhes de ${escapeHTML(p.name)}" class="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300" style="border:1px solid rgba(28,25,23,0.3); color:#1c1917;" title="Ver detalhes">
                        <i class="fa-solid fa-arrow-right text-[10px]"></i>
                    </button>
                </div>
            </div>`;
        }).join('');
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

    /** @returns {void} */
    function initSearch() {
        const input = document.getElementById('search-input');
        const clearBtn = document.getElementById('search-clear');
        const searchIcon = document.getElementById('search-icon');
        if (!(input instanceof HTMLInputElement)) return;

        const debouncedSearch = debounce(() => {
            state.currentSearch = input.value.trim().toLowerCase();
            if (state.currentSearch.length > 0) {
                clearBtn?.classList.remove('hidden');
                searchIcon?.classList.add('hidden');
            } else {
                clearBtn?.classList.add('hidden');
                searchIcon?.classList.remove('hidden');
            }
            renderProducts();
            startGridCarousel();
        }, 200);

        input.addEventListener('input', debouncedSearch);
    }

    /**
     * @param {HTMLImageElement} img
     * @param {number} delay
     * @returns {void}
     */
    function transitionCard(img, delay) {
        const productId = parseInt(img.getAttribute('data-product-id') || '0', 10);
        const product = productsData().find(/** @param {Product} p */ p => p.id === productId);
        const gallery = product?.gallery;
        if (!gallery || gallery.length <= 1) return;
        const group = img.closest('.group');
        if (group && group.matches(':hover')) return;
        const currentIdx = parseInt(img.getAttribute('data-current-idx') || '0', 10);
        let randomIdx;
        do { randomIdx = Math.floor(Math.random() * gallery.length); }
        while (randomIdx === currentIdx && gallery.length > 1);
        setTimeout(() => {
            img.style.opacity = '0';
            img.style.transform = 'scale(1.0) translate(0,0)';
            img.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s ease';
            setTimeout(() => {
                if (!img.isConnected) return;
                delete img.dataset.fallback;
                delete img.dataset.originalSrc;
                img.src = gallery[randomIdx];
                img.setAttribute('data-current-idx', String(randomIdx));
                img.style.transition = 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1), transform 8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                img.style.opacity = '1';
                const kbClass = state.kbToggle ? 'kb-active' : 'kb-alt';
                img.classList.remove('kb-active', 'kb-alt');
                void img.offsetWidth;
                img.classList.add(kbClass);
            }, 850);
        }, delay);
    }

    /**
     * @template T
     * @param {T[]} arr
     * @returns {T[]}
     */
    function shuffle(arr) {
        const copy = arr.slice();
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    /** @returns {void} */
    function startGridCarousel() {
        if (state.gridCarouselInterval) {
            clearInterval(state.gridCarouselInterval);
            state.gridCarouselInterval = null;
        }
        /** @type {HTMLImageElement[]} */
        const images = Array.from(document.querySelectorAll('.grid-gallery-img'));
        if (!images.length) return;
        images.forEach((img, i) => img.classList.add(i % 2 === 0 ? 'kb-active' : 'kb-alt'));
        state.visibleIds = new Set(images.map(/** @param {HTMLImageElement} i */ i => i));

        if (state.intersectionObserver) state.intersectionObserver.disconnect();
        state.intersectionObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) state.visibleIds.add(/** @type {HTMLElement} */ (entry.target));
                else state.visibleIds.delete(/** @type {HTMLElement} */ (entry.target));
            });
        }, { threshold: 0.1 });
        images.forEach(img => state.intersectionObserver?.observe(img));

        const tick = () => {
            if (state.visibilityPaused) return;
            const visible = images.filter(i => state.visibleIds.has(i));
            if (!visible.length) return;
            state.kbToggle = !state.kbToggle;
            const shuffled = shuffle(visible);
            shuffled.slice(0, Math.min(15, shuffled.length)).forEach((img, i) => transitionCard(img, i * (300 + Math.random() * 400)));
        };
        state.gridCarouselInterval = setInterval(tick, 7000);
    }

    /** @returns {void} */
    function pauseCarousel() { state.visibilityPaused = true; }
    /** @returns {void} */
    function resumeCarousel() { state.visibilityPaused = false; }

    /** @returns {void} */
    function setupDelegation() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;
        grid.addEventListener('click', e => {
            const target = /** @type {HTMLElement} */ (e.target);
            const wishlistBtn = target.closest('[data-wishlist-toggle]');
            if (wishlistBtn instanceof HTMLElement) {
                e.preventDefault();
                e.stopPropagation();
                const id = parseInt(wishlistBtn.getAttribute('data-wishlist-toggle') || '0', 10);
                if (Number.isFinite(id) && window.MiplaceWishlist) {
                    window.MiplaceWishlist.toggle(id);
                }
                return;
            }
            const trigger = target.closest('[data-open-product]');
            if (!(trigger instanceof HTMLElement)) return;
            const id = parseInt(trigger.getAttribute('data-open-product') || '0', 10);
            if (!Number.isFinite(id)) return;
            if (typeof window.openModal === 'function') window.openModal(id);
        });

        const filters = document.getElementById('category-filters');
        if (filters) {
            filters.addEventListener('click', e => {
                const target = /** @type {HTMLElement} */ (e.target);
                const btn = target.closest('.filter-btn');
                if (!(btn instanceof HTMLElement)) return;
                setFilter(btn.getAttribute('data-brand') || 'Todos');
            });
        }

        document.addEventListener('click', e => {
            const target = /** @type {HTMLElement} */ (e.target);
            const reset = target.closest('[data-action="reset-search"]');
            if (!reset) return;
            setFilter('Todos');
            clearSearch();
        });

        // Reagir a mudanças globais na wishlist: atualizar estado visual dos botões
        if (window.MiplaceWishlist) {
            window.MiplaceWishlist.subscribe(updateWishlistButtons);
        }
    }

    /**
     * @param {Set<number>} activeIds
     * @returns {void}
     */
    function updateWishlistButtons(activeIds) {
        document.querySelectorAll('[data-wishlist-toggle]').forEach(btn => {
            if (!(btn instanceof HTMLElement)) return;
            const id = parseInt(btn.getAttribute('data-wishlist-toggle') || '0', 10);
            const active = activeIds.has(id);
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-pressed', active ? 'true' : 'false');
            const name = btn.getAttribute('data-wishlist-name') || '';
            btn.setAttribute('aria-label', `${active ? 'Remover' : 'Adicionar'} ${name} ${active ? 'dos' : 'aos'} favoritos`);
        });
    }

    /** @returns {void} */
    function setupVisibility() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) pauseCarousel();
            else resumeCarousel();
        });
    }

    // Expor API pública usada por app.js e pelo HTML inline
    window.MiplaceCatalog = { getStore, brands };
    window.renderFilters = renderFilters;
    window.renderProducts = renderProducts;
    window.startGridCarousel = startGridCarousel;
    window.setFilter = setFilter;
    window.clearSearch = clearSearch;
    window.initSearch = initSearch;
    window.initCatalog = () => { setupDelegation(); setupVisibility(); };
})();
