// ============================================================
// MIPLACE MAGAZINE — modal.js
// Modal de produto, lightbox e navegação de imagens
// @ts-check
// ============================================================

(() => {
    'use strict';

    // Reutiliza a implementação centralizada em modules/ui.js (DRY)
    const escapeHTML = /** @type {(s: unknown) => string} */ (window.escapeHTML);

    /**
     * @type {ModalDOMRefs}
     */
    const dom = {
        modal: /** @type {HTMLElement | null} */ (null),
        modalContainer: /** @type {HTMLElement | null} */ (null),
        modalContent: /** @type {HTMLElement | null} */ (null),
        lightbox: /** @type {HTMLElement | null} */ (null),
        lightboxImg: /** @type {HTMLImageElement | null} */ (null),
        lightboxCounter: /** @type {HTMLElement | null} */ (null)
    };

    /** @type {ModalState} */
    const state = {
        lightboxImages: [],
        lightboxCurrentIdx: 0,
        touchStartX: 0,
        modalGallery: [],
        morphSource: null,
        releaseFocusTrap: null,
        releaseScrollLock: null
    };

    /** @returns {boolean} */
    function reducedMotion() {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    /**
     * FLIP shared-element: anima a imagem do modal a partir do retângulo da
     * imagem de origem (card/wishlist) — e vice-versa com `reverse`.
     * @param {HTMLImageElement | null} source
     * @param {HTMLImageElement | null} target
     * @param {number} duration
     * @param {boolean} [reverse]
     * @returns {void}
     */
    function flipMorph(source, target, duration, reverse) {
        if (!source || !target || typeof target.animate !== 'function') return;
        if (reducedMotion()) return;
        const from = source.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        if (from.width < 2 || to.width < 2) return;
        const sx = from.width / to.width;
        const sy = from.height / to.height;
        const dx = from.left - to.left;
        const dy = from.top - to.top;
        const morphed = 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px) scale(' + sx.toFixed(4) + ', ' + sy.toFixed(4) + ')';
        target.style.transformOrigin = 'top left';
        target.animate(
            reverse
                ? [{ transform: 'none' }, { transform: morphed }]
                : [{ transform: morphed }, { transform: 'none' }],
            { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
        );
    }

    // ---- Zoom dinâmico do lightbox (state module-level) ----
    let zoomScale = 1;
    let panX = 0;
    let panY = 0;

    /** @returns {void} */
    function applyZoom() {
        const img = dom.lightboxImg;
        if (!img) return;
        if (zoomScale <= 1) {
            img.classList.remove('is-zoomed');
            img.style.transform = '';
            img.style.transformOrigin = '';
            return;
        }
        img.classList.add('is-zoomed');
        img.style.transform = 'translate(' + panX.toFixed(1) + 'px, ' + panY.toFixed(1) + 'px) scale(' + zoomScale + ')';
    }

    /**
     * @param {number} [cx]
     * @param {number} [cy]
     * @returns {void}
     */
    function toggleZoom(cx, cy) {
        const img = dom.lightboxImg;
        if (!img) return;
        if (zoomScale > 1) {
            zoomScale = 1; panX = 0; panY = 0;
            applyZoom();
            return;
        }
        const rect = img.getBoundingClientRect();
        const px = typeof cx === 'number' ? ((cx - rect.left) / rect.width) * 100 : 50;
        const py = typeof cy === 'number' ? ((cy - rect.top) / rect.height) * 100 : 50;
        img.style.transformOrigin = px.toFixed(1) + '% ' + py.toFixed(1) + '%';
        zoomScale = 2;
        panX = 0; panY = 0;
        applyZoom();
    }

    /** @returns {void} */
    function resetZoom() {
        zoomScale = 1; panX = 0; panY = 0;
        applyZoom();
    }

    /**
     * Pan do zoom (limitado aos limites da imagem ampliada).
     * @param {number} dx
     * @param {number} dy
     * @returns {void}
     */
    function panBy(dx, dy) {
        const img = dom.lightboxImg;
        if (!img || zoomScale <= 1) return;
        const rect = img.getBoundingClientRect();
        const maxX = (rect.width * (zoomScale - 1)) / 2;
        const maxY = (rect.height * (zoomScale - 1)) / 2;
        panX = Math.max(-maxX, Math.min(maxX, panX + dx));
        panY = Math.max(-maxY, Math.min(maxY, panY + dy));
        applyZoom();
    }

    /**
     * @param {FrameRequestCallback} cb
     * @returns {void}
     */
    function nextFrame(cb) {
        requestAnimationFrame(() => requestAnimationFrame(cb));
    }

    /** @returns {Product[]} */
    function getProducts() { return window.MiplaceProducts || []; }

    /** @returns {StoresByCity} */
    function groupStoresByCity() {
        /** @type {StoresByCity} */
        const grouped = {};
        (window.STORES || []).forEach(store => {
            (grouped[store.city] ||= []).push(store);
        });
        return grouped;
    }

    /**
     * @param {string} productNameEncoded
     * @returns {string}
     */
    function buildContactsHTML(productNameEncoded) {
        /** @type {StoresByCity} */
        const grouped = groupStoresByCity();
        const cityKeys = Object.keys(grouped);

        const cityPanel = (/** @type {string} */ city) => {
            const id = 'contacts-' + city.toLowerCase().replace(/[^a-z]/g, '');
            const stores = grouped[city];
            const items = stores.map(/** @param {Store} store */ store => {
                const tel = store.whatsapp;
                const fmt = `(${tel.slice(2,4)}) ${tel.slice(4,9)}-${tel.slice(9)}`;
                return `
                <div class="p-4" style="background-color:#ebe7dd; border-left:4px solid #141414;">
                    <h5 class="font-serif font-bold text-lg mb-2" style="color:#141414;">${escapeHTML(store.name)}</h5>
                    <div class="flex flex-col gap-2">
                        <a href="https://wa.me/${tel}?text=${productNameEncoded}" target="_blank" rel="noopener noreferrer" class="text-sm font-sans font-bold flex items-center gap-2 w-max link-whatsapp" style="color:#141414;"><i class="fa-brands fa-whatsapp text-lg"></i> ${fmt}</a>
                        <a href="https://maps.google.com/?q=${store.address.mapsQuery}" target="_blank" rel="noopener noreferrer" class="text-xs font-sans flex items-center gap-2 w-max link-maps" style="color:#4a4641;"><i class="fa-solid fa-map-location-dot text-base"></i> ${escapeHTML(store.address.street)}</a>
                    </div>
                </div>`;
            }).join('');
            return `
            <div id="${id}" data-contacts-panel style="display:none; background-color:#f5f2ea; color:#141414;" class="absolute bottom-full left-0 w-full mb-4 flex-col gap-4 animate-slide-up p-6 border z-50 max-h-[50vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-2 pb-2" style="border-bottom:1px solid rgba(20,20,20,0.2);">
                    <span class="font-sans text-[10px] font-bold uppercase tracking-widest" style="color:#4a4641;">Lojas em ${escapeHTML(city)}</span>
                    <button type="button" data-contacts-close style="color:#141414;" title="Fechar" aria-label="Fechar lojas de ${escapeHTML(city)}"><i class="fa-solid fa-xmark"></i></button>
                </div>
                ${items}
            </div>`;
        };

        const buttons = cityKeys.map((city, i) => {
            const panel = `contacts-${city.toLowerCase().replace(/[^a-z]/g, '')}`;
            const filled = i === 0;
            return `
            <button type="button" data-contacts-toggle="${panel}" class="flex-1 font-sans uppercase tracking-widest font-bold text-xs px-4 py-4 flex items-center justify-center gap-2" style="${filled ? 'background-color:#141414; color:#f5f2ea;' : 'border:1px solid #141414; color:#141414; background-color:#f5f2ea;'}">
                <i class="fa-solid fa-location-dot"></i> ${escapeHTML(city)}
            </button>`;
        }).join('');

        const panels = cityKeys.map(cityPanel).join('');

        return panels + `<div class="flex flex-col sm:flex-row gap-4 mb-2">${buttons}</div>`;
    }

    /**
     * @param {string[]} galleryImages
     * @returns {string}
     */
    function buildGalleryHTML(galleryImages) {
        if (galleryImages.length === 0) {
            return `<div class="w-full flex items-center justify-center h-full"><i class="fa-solid fa-mobile-screen text-8xl" style="color:rgba(20,20,20,0.2);"></i></div>`;
        }
        return `<div class="w-full flex flex-col gap-3 p-3">${galleryImages.map((img, i) => `<div class="w-full aspect-video rounded-sm overflow-hidden relative cursor-zoom-in group transition-all duration-300 modal-thumb" style="background-color:#f5f2ea; border:1px solid rgba(20,20,20,0.1); --thumb-delay: ${Math.min(i, 6) * 80}ms;" data-lightbox-open="${i}" title="Clique para ampliar"><img ${i === 0 ? 'id="modal-hero-img" ' : ''}src="${escapeHTML(img)}" loading="${i === 0 ? 'eager' : 'lazy'}" decoding="async" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"><div class="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background-color:rgba(20,20,20,0.1);"><span class="text-[9px] font-sans uppercase tracking-widest px-2 py-1 rounded-sm" style="background-color:#141414; color:#f5f2ea;">Ampliar</span></div></div>`).join('')}</div>`;
    }

    /**
     * @param {ProductSpec[]} [specs]
     * @returns {string}
     */
    function buildSpecsHTML(specs) {
        if (!specs || !specs.length) return '';
        return `<div class="mt-8 pt-6" style="border-top:1px solid #141414;"><h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-4" style="color:#141414;">Ficha Técnica</h4><div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm font-sans">${specs.map(spec => `<div class="pb-2" style="border-bottom:1px solid rgba(20,20,20,0.1);"><span class="block text-[10px] uppercase tracking-widest" style="color:#4a4641;">${escapeHTML(spec.label)}</span><span class="font-medium" style="color:#141414;">${escapeHTML(spec.value)}</span></div>`).join('')}</div></div>`;
    }

    /**
     * @param {ProductHighlight[]} [highlights]
     * @returns {string}
     */
    function buildHighlightsHTML(highlights) {
        if (!highlights || !highlights.length) return '';
        return `<div class="mt-8"><h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-4" style="color:#141414;">Destaques</h4><ul class="space-y-4">${highlights.map(h => `<li class="font-sans text-sm"><strong class="block mb-1" style="color:#141414;">${escapeHTML(h.title)}</strong><span class="leading-relaxed" style="color:#4a4641;">${escapeHTML(h.text)}</span></li>`).join('')}</ul></div>`;
    }

    /**
     * @param {number} id
     * @param {HTMLImageElement | null} [sourceImg]
     * @returns {void}
     */
    function openModal(id, sourceImg) {
        if (!dom.modal || !dom.modalContainer || !dom.modalContent) return;
        window.playUIClick?.();
        const product = getProducts().find(p => p.id === id);
        if (!product) return;
        state.morphSource = sourceImg || null;
        document.title = `${product.name} | Miplace Magazine`;
        window.trackEvent?.('view_item', { item_id: String(product.id), item_name: product.name, item_brand: product.brand });

        const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : (product.image ? [product.image] : []);
        state.modalGallery = galleryImages.slice();
        const productNameEncoded = encodeURIComponent('Olá! Gostaria de saber mais sobre o ' + product.name + '.');

        const galleryHTML = buildGalleryHTML(galleryImages);
        const specsHTML = buildSpecsHTML(product.specs);
        const highlightsHTML = buildHighlightsHTML(product.highlights);
        const contactsHTML = buildContactsHTML(productNameEncoded);
        const wishlistActive = window.MiplaceWishlist?.has(product.id);
        const wishlistButton = `<button type="button" id="modal-wishlist-btn" data-wishlist-toggle="${product.id}" data-wishlist-source="modal" data-wishlist-name="${escapeHTML(product.name)}" aria-pressed="${wishlistActive ? 'true' : 'false'}" aria-label="${wishlistActive ? 'Remover' : 'Adicionar'} ${escapeHTML(product.name)} ${wishlistActive ? 'dos' : 'aos'} favoritos" class="wishlist-btn ${wishlistActive ? 'is-active' : ''}" style="top:16px;right:64px;width:44px;height:44px;">
            <i class="fa-regular fa-heart heart-outline" aria-hidden="true"></i>
            <i class="fa-solid fa-heart heart-filled" aria-hidden="true"></i>
        </button>`;

        if (product.description) {
            dom.modalContent.innerHTML = `
                <div class="w-full md:w-5/12 overflow-y-auto modal-scroll-pane" style="background-color:#ebe7dd; border-right:1px solid rgba(20,20,20,0.1); max-height:95vh;">
                    <div class="w-full">${galleryHTML}</div>
                </div>
                <div class="w-full md:w-7/12 px-8 py-10 md:px-14 md:py-12 flex flex-col overflow-y-auto modal-scroll-pane modal-cascade" style="background-color:#f5f2ea; color:#141414; max-height:95vh;">
                    <div class="mb-3"><span class="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style="color:#4a4641;">${escapeHTML(product.brand)}</span></div>
                    <h2 class="font-serif text-4xl md:text-5xl font-bold mb-5 leading-none" style="color:#141414;">${escapeHTML(product.name)}</h2>
                    ${product.price ? `<p class="font-sans text-xl font-bold pb-4 mb-8 inline-block w-max" style="color:#141414; border-bottom:2px solid #141414;">${escapeHTML(product.price)}</p>` : ''}
                    <p class="font-sans text-sm md:text-base leading-relaxed mb-8" style="color:#4a4641;">${escapeHTML(product.description)}</p>
                    ${highlightsHTML}${specsHTML}
                    <div class="mt-12 pt-10 w-full relative" style="border-top:1px solid #141414;">
                        <h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-5" style="color:#141414;">Escolha a cidade para comprar</h4>
                        <div class="relative w-full">${contactsHTML}</div>
                    </div>
                </div>
                ${wishlistButton}`;
        } else {
            dom.modalContent.innerHTML = `
                <div class="w-full p-12 flex flex-col items-center justify-center min-h-[40vh] text-center" style="background-color:#f5f2ea;">
                    <div class="w-32 h-32 rounded-full flex items-center justify-center mb-6" style="background-color:#ebe7dd;">
                        ${product.image ? `<img src="${escapeHTML(product.image)}" class="w-20 h-20 object-contain" decoding="async" alt="${escapeHTML(product.name)}">` : `<i class="fa-solid fa-mobile-screen text-4xl" style="color:rgba(20,20,20,0.2);"></i>`}
                    </div>
                    <h2 class="font-serif text-3xl font-bold mb-4" style="color:#141414;">${escapeHTML(product.name)}</h2>
                    <p class="font-sans mb-8" style="color:#4a4641;">Ainda estamos preparando os detalhes deste editorial.</p>
                    <div class="mt-8 pt-8 w-full text-left relative" style="border-top:1px solid #141414;">
                        <h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-4 text-center" style="color:#141414;">Escolha a cidade para comprar</h4>
                        <div class="relative w-full">${contactsHTML}</div>
                    </div>
                </div>
                ${wishlistButton}`;
        }

        dom.modal.classList.remove('hidden');
        dom.modal.classList.add('flex');
        // As classes base trazem opacity-0/scale-95 (estado fechado); removê-las
        // é o que torna o modal visível — o WAAPI entra por cima.
        dom.modal.classList.remove('opacity-0');
        dom.modalContainer.classList.remove('scale-95');

        // Véu gradual (blur + opacidade em camadas)
        const veil = dom.modal.querySelector('.modal-veil');
        if (veil instanceof HTMLElement) {
            nextFrame(() => veil.classList.add('is-on'));
        }

        // FLIP shared-element: a imagem do card expande até o hero do modal
        // (medida ANTES do movimento do painel, para o cálculo ficar exato).
        const heroImg = /** @type {HTMLImageElement | null} */ (document.getElementById('modal-hero-img'));
        flipMorph(state.morphSource, heroImg, 620, false);

        // Entrada do painel (WAAPI) mantendo o contexto visível sob o véu
        if (dom.modalContainer && typeof dom.modalContainer.animate === 'function' && !reducedMotion()) {
            dom.modalContainer.animate(
                [
                    { opacity: 0, transform: 'translateY(26px) scale(0.97)' },
                    { opacity: 1, transform: 'none' }
                ],
                // fill:forwards encadeia com a animação de fechamento (evita
                // que o estado persistido do fechar reaplique na reabertura)
                { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
            );
        }
        if (state.releaseFocusTrap) state.releaseFocusTrap();
        state.releaseFocusTrap = window.trapFocus(dom.modal);
        setTimeout(() => {
            const focusable = dom.modal?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable && focusable.length) {
                const first = focusable[0];
                if (first instanceof HTMLElement) first.focus();
            }
        }, 50);
        state.releaseScrollLock = window.lockBodyScroll();
    }

    /** @returns {void} */
    function closeModal() {
        if (!dom.modal || !dom.modalContainer || !dom.modalContent) return;
        window.playUIClick?.();
        if (state.releaseFocusTrap) {
            state.releaseFocusTrap();
            state.releaseFocusTrap = null;
        }
        if (state.releaseScrollLock) {
            state.releaseScrollLock();
            state.releaseScrollLock = null;
        }

        // Véu recolhe e a imagem devolve-se à posição do card (FLIP reverso)
        const veil = dom.modal.querySelector('.modal-veil');
        if (veil instanceof HTMLElement) veil.classList.remove('is-on');
        const heroImg = /** @type {HTMLImageElement | null} */ (document.getElementById('modal-hero-img'));
        flipMorph(state.morphSource, heroImg, 430, true);
        if (dom.modalContainer && typeof dom.modalContainer.animate === 'function' && !reducedMotion()) {
            dom.modalContainer.animate(
                [
                    { opacity: 1, transform: 'none' },
                    { opacity: 0, transform: 'translateY(20px) scale(0.97)' }
                ],
                { duration: 320, easing: 'cubic-bezier(0.4, 0, 1, 1)', fill: 'forwards' }
            );
        }

        setTimeout(() => {
            dom.modal?.classList.add('hidden');
            dom.modal?.classList.remove('flex');
            // Devolve o estado fechado (classes base) para a próxima abertura
            dom.modal?.classList.add('opacity-0');
            dom.modalContainer?.classList.add('scale-95');
            if (dom.modalContent) dom.modalContent.innerHTML = '';
            state.modalGallery = [];
            state.morphSource = null;
            document.title = 'MIPLACE MAGAZINE | Catálogo Exclusivo';
        }, 330);
    }

    /**
     * @param {string} src
     * @param {number} [idx]
     * @returns {void}
     */
    function openLightbox(src, idx) {
        if (!dom.modalContent || !dom.lightbox || !dom.lightboxImg) return;
        window.playUIClick?.();
        state.lightboxImages = state.modalGallery.length
            ? state.modalGallery.slice()
            : Array.from(dom.modalContent.querySelectorAll('.aspect-video img')).map(/** @param {Element} i */ i => /** @type {HTMLImageElement} */ (i).getAttribute('src') || '');
        state.lightboxCurrentIdx = (idx !== undefined && idx >= 0) ? idx : state.lightboxImages.indexOf(src);
        if (state.lightboxCurrentIdx < 0) state.lightboxCurrentIdx = 0;
        delete dom.lightboxImg.dataset.fallback;
        delete dom.lightboxImg.dataset.originalSrc;
        dom.lightboxImg.src = src;
        dom.lightbox.classList.remove('hidden');
        dom.lightbox.classList.add('flex');
        nextFrame(() => {
            dom.lightbox?.classList.remove('opacity-0');
            if (dom.lightboxImg && typeof dom.lightboxImg.animate === 'function' && !reducedMotion()) {
                dom.lightboxImg.animate(
                    [{ opacity: 0, transform: 'scale(0.94)' }, { opacity: 1, transform: 'none' }],
                    { duration: 380, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
                );
            }
        });
        if (dom.lightboxCounter && state.lightboxImages.length > 1) {
            dom.lightboxCounter.textContent = `${state.lightboxCurrentIdx + 1} / ${state.lightboxImages.length}`;
        }
    }

    // Guarda do crossfade/slide do lightbox: cliques rápidos não embaralham
    let lightboxSwapTimer = 0;
    let lightboxAnim = /** @type {Animation | null} */ (null);

    /**
     * @param {number} dir
     * @returns {void}
     */
    function lightboxNavigate(dir) {
        const img = dom.lightboxImg;
        if (!img) return;
        if (state.lightboxImages.length <= 1) return;
        window.playUIClick?.();
        resetZoom();
        state.lightboxCurrentIdx = (state.lightboxCurrentIdx + dir + state.lightboxImages.length) % state.lightboxImages.length;

        /** @returns {void} */
        const update = () => {
            if (!dom.lightboxImg) return;
            delete dom.lightboxImg.dataset.fallback;
            delete dom.lightboxImg.dataset.originalSrc;
            dom.lightboxImg.src = state.lightboxImages[state.lightboxCurrentIdx];
            if (dom.lightboxCounter && state.lightboxImages.length > 1) {
                dom.lightboxCounter.textContent = `${state.lightboxCurrentIdx + 1} / ${state.lightboxImages.length}`;
            }
        };

        if (typeof img.animate !== 'function' || reducedMotion()) {
            clearTimeout(lightboxSwapTimer);
            lightboxSwapTimer = setTimeout(update, 120);
            return;
        }

        if (lightboxAnim) { lightboxAnim.cancel(); lightboxAnim = null; }
        clearTimeout(lightboxSwapTimer);
        const out = img.animate(
            [
                { transform: 'translateX(0) scale(1)', opacity: 1 },
                { transform: 'translateX(' + (-dir * 18) + '%) scale(0.96)', opacity: 0 }
            ],
            { duration: 200, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
        );
        out.onfinish = () => {
            update();
            lightboxAnim = img.animate(
                [
                    { transform: 'translateX(' + (dir * 18) + '%) scale(0.96)', opacity: 0 },
                    { transform: 'translateX(0) scale(1)', opacity: 1 }
                ],
                { duration: 340, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
            );
        };
    }

    /** @returns {void} */
    function closeLightbox() {
        if (!dom.lightbox || !dom.lightboxImg) return;
        window.playUIClick?.();
        resetZoom();
        dom.lightbox.classList.add('opacity-0');
        setTimeout(() => {
            dom.lightbox?.classList.add('hidden');
            dom.lightbox?.classList.remove('flex');
        }, 300);
    }

    /** @returns {void} */
    function initModal() {
        dom.modal = document.getElementById('product-modal');
        dom.modalContainer = document.getElementById('modal-container');
        dom.modalContent = document.getElementById('modal-content');
        dom.lightbox = document.getElementById('lightbox');
        dom.lightboxImg = /** @type {HTMLImageElement | null} */ (document.getElementById('lightbox-img'));
        dom.lightboxCounter = document.getElementById('lightbox-counter');
        if (!dom.modal || !dom.lightbox || !dom.modalContent) return;

        // Arrasto com inércia + pan de zoom + duplo-toque (pointer events cobrem touch)
        const lbImg = dom.lightboxImg;
        if (lbImg) {
            let dragging = false;
            let dragMoved = false;
            let dragStartX = 0;
            let dragStartY = 0;
            let dragTime = 0;
            let lastTapTime = 0;

            lbImg.addEventListener('pointerdown', (e) => {
                const evt = /** @type {PointerEvent} */ (/** @type {unknown} */ (e));
                dragging = true;
                dragMoved = false;
                dragStartX = evt.clientX;
                dragStartY = evt.clientY;
                dragTime = performance.now();
                if (typeof lbImg.setPointerCapture === 'function') lbImg.setPointerCapture(evt.pointerId);
            });

            lbImg.addEventListener('pointermove', (e) => {
                if (!dragging) return;
                const evt = /** @type {PointerEvent} */ (/** @type {unknown} */ (e));
                const dx = evt.clientX - dragStartX;
                const dy = evt.clientY - dragStartY;
                if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved = true;
                if (zoomScale > 1) {
                    panBy(dx, dy);
                    dragStartX = evt.clientX;
                    dragStartY = evt.clientY;
                } else if (state.lightboxImages.length > 1) {
                    lbImg.style.transform = 'translateX(' + dx.toFixed(1) + 'px)';
                }
            });

            lbImg.addEventListener('pointerup', (e) => {
                if (!dragging) return;
                dragging = false;
                const evt = /** @type {PointerEvent} */ (/** @type {unknown} */ (e));
                const dx = evt.clientX - dragStartX;
                const dt = performance.now() - dragTime;
                const velocity = dt > 0 ? dx / dt : 0;

                if (zoomScale > 1) return;

                if ((Math.abs(dx) > 70 || Math.abs(velocity) > 0.45) && state.lightboxImages.length > 1) {
                    lbImg.style.transform = '';
                    lightboxNavigate(dx < 0 ? 1 : -1);
                } else if (dragMoved) {
                    const from = lbImg.style.transform || 'none';
                    lbImg.style.transform = '';
                    if (typeof lbImg.animate === 'function') {
                        lbImg.animate(
                            [{ transform: from }, { transform: 'none' }],
                            { duration: 380, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
                        );
                    }
                }

                // Duplo-toque em telas de toque = zoom dinâmico
                const now = performance.now();
                if (!dragMoved && evt.pointerType === 'touch') {
                    if (now - lastTapTime < 320) toggleZoom(evt.clientX, evt.clientY);
                    lastTapTime = now;
                }
            });

            lbImg.addEventListener('pointercancel', () => {
                dragging = false;
                lbImg.style.transform = '';
            });

            lbImg.addEventListener('dblclick', (e) => {
                const evt = /** @type {MouseEvent} */ (/** @type {unknown} */ (e));
                toggleZoom(evt.clientX, evt.clientY);
            });
        }

        // Delegation: lightbox open + wishlist toggle
        dom.modalContent.addEventListener('click', e => {
            const target = /** @type {Element} */ (/** @type {unknown} */ (e.target));
            const wishlistBtn = target.closest('[data-wishlist-toggle]');
            if (wishlistBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = parseInt(wishlistBtn.getAttribute('data-wishlist-toggle') || '0', 10);
                if (Number.isFinite(id) && window.MiplaceWishlist) {
                    window.MiplaceWishlist.toggle(id);
                }
                return;
            }
            const galleryTrigger = target.closest('[data-lightbox-open]');
            if (galleryTrigger) {
                const idx = parseInt(galleryTrigger.getAttribute('data-lightbox-open') || '0', 10);
                const img = galleryTrigger.querySelector('img');
                if (img) openLightbox(/** @type {HTMLImageElement} */ (img).getAttribute('src') || '', Number.isFinite(idx) ? idx : 0);
                return;
            }
        });

        // Delegation: close — o X e o backdrop ficam FORA de #modal-content
        // (irmãos em #product-modal), então o listener precisa estar no ancestral comum.
        dom.modal.addEventListener('click', e => {
            const target = /** @type {Element} */ (/** @type {unknown} */ (e.target));
            if (target.closest('[data-modal-close]')) closeModal();
        });

        // Delegation: contacts panel toggle
        dom.modalContent.addEventListener('click', e => {
            const target = /** @type {Element} */ (/** @type {unknown} */ (e.target));
            const toggle = target.closest('[data-contacts-toggle]');
            if (toggle) {
                const panelId = toggle.getAttribute('data-contacts-toggle');
                const panelEl = panelId && dom.modalContent?.querySelector('#' + panelId);
                if (!(panelEl instanceof HTMLElement)) return;
                const willOpen = panelEl.style.display !== 'flex';
                dom.modalContent?.querySelectorAll('[data-contacts-panel]').forEach(p => { if (p instanceof HTMLElement) p.style.display = 'none'; });
                if (willOpen) {
                    panelEl.style.display = 'flex';
                    setTimeout(() => {
                        const scrollPanes = dom.modalContent?.querySelectorAll('.modal-scroll-pane');
                        const rightPane = scrollPanes && scrollPanes[scrollPanes.length - 1];
                        if (rightPane instanceof HTMLElement) {
                            rightPane.scrollTo({ top: rightPane.scrollHeight, behavior: 'smooth' });
                        }
                    }, 60);
                }
                return;
            }
            const close = target.closest('[data-contacts-close]');
            if (close) {
                const panel = close.closest('[data-contacts-panel]');
                if (panel instanceof HTMLElement) panel.style.display = 'none';
            }
        });

        // Delegation: lightbox navigate
        dom.lightbox.addEventListener('click', e => {
            const target = /** @type {Element} */ (/** @type {unknown} */ (e.target));
            if (target.closest('[data-lightbox-close]')) { closeLightbox(); return; }
            if (target.closest('[data-lightbox-prev]')) { lightboxNavigate(-1); return; }
            if (target.closest('[data-lightbox-next]')) { lightboxNavigate(1); return; }
        });

        document.addEventListener('keydown', e => {
            if (!dom.lightbox || !dom.modal) return;
            const lightboxOpen = !dom.lightbox.classList.contains('hidden');
            if (e.key === 'Escape') {
                if (lightboxOpen) {
                    // Zoom ativo: o primeiro ESC só desfaz o zoom
                    if (zoomScale > 1) { resetZoom(); return; }
                    closeLightbox();
                    return;
                }
                if (!dom.modal.classList.contains('hidden')) closeModal();
            }
            if (lightboxOpen) {
                if (e.key === 'ArrowRight') lightboxNavigate(1);
                if (e.key === 'ArrowLeft') lightboxNavigate(-1);
            }
        });
    }

    // Expor API pública usada por app.js e pelo HTML inline.
    // O Object.assign silencia os avisos de `no-unused-vars` do ESLint
    // (variáveis que só são usadas via window.* não são detectadas).
    Object.assign(window, {
        openModal,
        closeModal,
        openLightbox,
        lightboxNavigate,
        closeLightbox,
        initModal
    });
})();
