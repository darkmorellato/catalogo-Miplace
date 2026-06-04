// ============================================================
// MIPLACE MAGAZINE — modal.js
// Modal de produto, lightbox e navegação de imagens
// @ts-check
// ============================================================

(() => {
    'use strict';

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

    /** @type {{ lightboxImages: string[]; lightboxCurrentIdx: number; touchStartX: number; }} */
    const state = {
        lightboxImages: [],
        lightboxCurrentIdx: 0,
        touchStartX: 0
    };

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
                <div class="p-4" style="background-color:#eaeaeb; border-left:4px solid #1c1917;">
                    <h5 class="font-serif font-bold text-lg mb-2" style="color:#1c1917;">${escapeHTML(store.name)}</h5>
                    <div class="flex flex-col gap-2">
                        <a href="https://wa.me/${tel}?text=${productNameEncoded}" target="_blank" rel="noopener noreferrer" class="text-sm font-sans font-bold flex items-center gap-2 w-max link-whatsapp" style="color:#1c1917;"><i class="fa-brands fa-whatsapp text-lg"></i> ${fmt}</a>
                        <a href="https://maps.google.com/?q=${store.address.mapsQuery}" target="_blank" rel="noopener noreferrer" class="text-xs font-sans flex items-center gap-2 w-max link-maps" style="color:#44403c;"><i class="fa-solid fa-map-location-dot text-base"></i> ${escapeHTML(store.address.street)}</a>
                    </div>
                </div>`;
            }).join('');
            return `
            <div id="${id}" data-contacts-panel style="display:none; background-color:#f4f4f0; color:#1c1917;" class="absolute bottom-full left-0 w-full mb-4 flex-col gap-4 animate-slide-up p-6 border z-50 max-h-[50vh] overflow-y-auto">
                <div class="flex justify-between items-center mb-2 pb-2" style="border-bottom:1px solid rgba(28,25,23,0.2);">
                    <span class="font-sans text-[10px] font-bold uppercase tracking-widest" style="color:#44403c;">Lojas em ${escapeHTML(city)}</span>
                    <button type="button" data-contacts-close style="color:#1c1917;" title="Fechar" aria-label="Fechar lojas de ${escapeHTML(city)}"><i class="fa-solid fa-xmark"></i></button>
                </div>
                ${items}
            </div>`;
        };

        const buttons = cityKeys.map((city, i) => {
            const panel = `contacts-${city.toLowerCase().replace(/[^a-z]/g, '')}`;
            const filled = i === 0;
            return `
            <button type="button" data-contacts-toggle="${panel}" class="flex-1 font-sans uppercase tracking-widest font-bold text-xs px-4 py-4 flex items-center justify-center gap-2" style="${filled ? 'background-color:#1c1917; color:#f4f4f0;' : 'border:1px solid #1c1917; color:#1c1917; background-color:#f4f4f0;'}">
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
            return `<div class="w-full flex items-center justify-center h-full"><i class="fa-solid fa-mobile-screen text-8xl" style="color:rgba(28,25,23,0.2);"></i></div>`;
        }
        return `<div class="w-full flex flex-col gap-3 p-3">${galleryImages.map((img, i) => `<div class="w-full aspect-video rounded overflow-hidden relative cursor-zoom-in group transition-all duration-300" style="background-color:#f4f4f0; border:1px solid rgba(28,25,23,0.1);" data-lightbox-open="${i}" title="Clique para ampliar"><img src="${escapeHTML(img)}" loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"><div class="absolute inset-0 flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style="background-color:rgba(28,25,23,0.1);"><span class="text-[9px] font-sans uppercase tracking-widest px-2 py-1 rounded" style="background-color:#1c1917; color:#f4f4f0;">Ampliar</span></div></div>`).join('')}</div>`;
    }

    /**
     * @param {ProductSpec[]} [specs]
     * @returns {string}
     */
    function buildSpecsHTML(specs) {
        if (!specs || !specs.length) return '';
        return `<div class="mt-8 pt-6" style="border-top:1px solid #1c1917;"><h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-4" style="color:#1c1917;">Ficha Técnica</h4><div class="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm font-sans">${specs.map(spec => `<div class="pb-2" style="border-bottom:1px solid rgba(28,25,23,0.1);"><span class="block text-[10px] uppercase tracking-widest" style="color:#44403c;">${escapeHTML(spec.label)}</span><span class="font-medium" style="color:#1c1917;">${escapeHTML(spec.value)}</span></div>`).join('')}</div></div>`;
    }

    /**
     * @param {ProductHighlight[]} [highlights]
     * @returns {string}
     */
    function buildHighlightsHTML(highlights) {
        if (!highlights || !highlights.length) return '';
        return `<div class="mt-8"><h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-4" style="color:#1c1917;">Destaques</h4><ul class="space-y-4">${highlights.map(h => `<li class="font-sans text-sm"><strong class="block mb-1" style="color:#1c1917;">${escapeHTML(h.title)}</strong><span class="leading-relaxed" style="color:#44403c;">${escapeHTML(h.text)}</span></li>`).join('')}</ul></div>`;
    }

    /**
     * @param {number} id
     * @returns {void}
     */
    function openModal(id) {
        if (!dom.modal || !dom.modalContainer || !dom.modalContent) return;
        window.playUIClick?.();
        const product = getProducts().find(p => p.id === id);
        if (!product) return;
        document.title = `${product.name} | Miplace Magazine`;
        window.trackEvent?.('view_item', { item_id: String(product.id), item_name: product.name, item_brand: product.brand });

        const galleryImages = product.gallery && product.gallery.length > 0 ? product.gallery : (product.image ? [product.image] : []);
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
                <div class="w-full md:w-5/12 overflow-y-auto modal-scroll-pane" style="background-color:#eaeaeb; border-right:1px solid rgba(28,25,23,0.1); max-height:95vh;">
                    <div class="w-full">${galleryHTML}</div>
                </div>
                <div class="w-full md:w-7/12 px-8 py-10 md:px-14 md:py-12 flex flex-col overflow-y-auto modal-scroll-pane" style="background-color:#f4f4f0; color:#1c1917; max-height:95vh;">
                    <div class="mb-3"><span class="font-sans text-[10px] font-bold uppercase tracking-[0.2em]" style="color:#44403c;">${escapeHTML(product.brand)}</span></div>
                    <h2 class="font-serif text-4xl md:text-5xl font-bold mb-5 leading-none" style="color:#1c1917;">${escapeHTML(product.name)}</h2>
                    ${product.price ? `<p class="font-sans text-xl font-bold pb-4 mb-8 inline-block w-max" style="color:#1c1917; border-bottom:2px solid #1c1917;">${escapeHTML(product.price)}</p>` : ''}
                    <p class="font-sans text-sm md:text-base leading-relaxed mb-8" style="color:#44403c;">${escapeHTML(product.description)}</p>
                    ${highlightsHTML}${specsHTML}
                    <div class="mt-12 pt-10 w-full relative" style="border-top:1px solid #1c1917;">
                        <h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-5" style="color:#1c1917;">Escolha a cidade para comprar</h4>
                        <div class="relative w-full">${contactsHTML}</div>
                    </div>
                </div>
                ${wishlistButton}`;
        } else {
            dom.modalContent.innerHTML = `
                <div class="w-full p-12 flex flex-col items-center justify-center min-h-[40vh] text-center" style="background-color:#f4f4f0;">
                    <div class="w-32 h-32 rounded-full flex items-center justify-center mb-6" style="background-color:#eaeaeb;">
                        ${product.image ? `<img src="${escapeHTML(product.image)}" class="w-20 h-20 object-contain" alt="${escapeHTML(product.name)}">` : `<i class="fa-solid fa-mobile-screen text-4xl" style="color:rgba(28,25,23,0.2);"></i>`}
                    </div>
                    <h2 class="font-serif text-3xl font-bold mb-4" style="color:#1c1917;">${escapeHTML(product.name)}</h2>
                    <p class="font-sans mb-8" style="color:#44403c;">Ainda estamos preparando os detalhes deste editorial.</p>
                    <div class="mt-8 pt-8 w-full text-left relative" style="border-top:1px solid #1c1917;">
                        <h4 class="font-sans text-xs uppercase tracking-[0.2em] font-bold mb-4 text-center" style="color:#1c1917;">Escolha a cidade para comprar</h4>
                        <div class="relative w-full">${contactsHTML}</div>
                    </div>
                </div>
                ${wishlistButton}`;
        }

        dom.modal.classList.remove('hidden');
        dom.modal.classList.add('flex');
        dom.modalContainer.classList.add('scale-95');
        dom.modal.classList.add('opacity-0');
        nextFrame(() => {
            dom.modal?.classList.remove('opacity-0');
            dom.modalContainer?.classList.remove('scale-95');
        });
        trapFocus(dom.modal);
        setTimeout(() => {
            const focusable = dom.modal?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusable && focusable.length) {
                const first = focusable[0];
                if (first instanceof HTMLElement) first.focus();
            }
        }, 50);
        document.body.style.overflow = 'hidden';
    }

    /** @returns {void} */
    function closeModal() {
        if (!dom.modal || !dom.modalContainer || !dom.modalContent) return;
        window.playUIClick?.();
        dom.modal.classList.add('opacity-0');
        dom.modalContainer.classList.add('scale-95');
        setTimeout(() => {
            dom.modal?.classList.add('hidden');
            dom.modal?.classList.remove('flex');
            if (dom.modalContent) dom.modalContent.innerHTML = '';
            document.body.style.overflow = 'auto';
            document.title = 'MIPLACE MAGAZINE | Catálogo Exclusivo';
        }, 300);
    }

    /**
     * @param {string} src
     * @param {number} [idx]
     * @returns {void}
     */
    function openLightbox(src, idx) {
        if (!dom.modalContent || !dom.lightbox || !dom.lightboxImg) return;
        window.playUIClick?.();
        const modalImgs = Array.from(dom.modalContent.querySelectorAll('.aspect-video img'));
        state.lightboxImages = modalImgs.map(/** @param {Element} i */ i => /** @type {HTMLImageElement} */ (i).getAttribute('src') || '');
        state.lightboxCurrentIdx = (idx !== undefined && idx >= 0) ? idx : state.lightboxImages.indexOf(src);
        if (state.lightboxCurrentIdx < 0) state.lightboxCurrentIdx = 0;
        delete dom.lightboxImg.dataset.fallback;
        delete dom.lightboxImg.dataset.originalSrc;
        dom.lightboxImg.src = src;
        dom.lightbox.classList.remove('hidden');
        dom.lightbox.classList.add('flex');
        nextFrame(() => {
            dom.lightbox?.classList.remove('opacity-0');
            dom.lightboxImg?.classList.remove('scale-95');
            dom.lightboxImg?.classList.add('scale-100');
        });
        if (dom.lightboxCounter && state.lightboxImages.length > 1) {
            dom.lightboxCounter.textContent = `${state.lightboxCurrentIdx + 1} / ${state.lightboxImages.length}`;
        }
    }

    /**
     * @param {number} dir
     * @returns {void}
     */
    function lightboxNavigate(dir) {
        if (!dom.lightboxImg) return;
        if (state.lightboxImages.length <= 1) return;
        window.playUIClick?.();
        state.lightboxCurrentIdx = (state.lightboxCurrentIdx + dir + state.lightboxImages.length) % state.lightboxImages.length;
        dom.lightboxImg.style.opacity = '0';
        dom.lightboxImg.style.transform = 'scale(0.95)';
        setTimeout(() => {
            if (!dom.lightboxImg) return;
            delete dom.lightboxImg.dataset.fallback;
            delete dom.lightboxImg.dataset.originalSrc;
            dom.lightboxImg.src = state.lightboxImages[state.lightboxCurrentIdx];
            dom.lightboxImg.style.opacity = '1';
            dom.lightboxImg.style.transform = 'scale(1)';
            if (dom.lightboxCounter && state.lightboxImages.length > 1) {
                dom.lightboxCounter.textContent = `${state.lightboxCurrentIdx + 1} / ${state.lightboxImages.length}`;
            }
        }, 200);
    }

    /** @returns {void} */
    function closeLightbox() {
        if (!dom.lightbox || !dom.lightboxImg) return;
        window.playUIClick?.();
        dom.lightbox.classList.add('opacity-0');
        dom.lightboxImg.classList.remove('scale-100');
        dom.lightboxImg.classList.add('scale-95');
        setTimeout(() => {
            dom.lightbox?.classList.add('hidden');
            dom.lightbox?.classList.remove('flex');
        }, 300);
    }

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

    /** @returns {void} */
    function initModal() {
        dom.modal = document.getElementById('product-modal');
        dom.modalContainer = document.getElementById('modal-container');
        dom.modalContent = document.getElementById('modal-content');
        dom.lightbox = document.getElementById('lightbox');
        dom.lightboxImg = /** @type {HTMLImageElement | null} */ (document.getElementById('lightbox-img'));
        dom.lightboxCounter = document.getElementById('lightbox-counter');
        if (!dom.modal || !dom.lightbox || !dom.modalContent) return;

        dom.lightbox.addEventListener('touchstart', e => { state.touchStartX = e.changedTouches[0].screenX; }, { passive: true });
        dom.lightbox.addEventListener('touchend', e => {
            const diff = state.touchStartX - e.changedTouches[0].screenX;
            if (Math.abs(diff) > 50) lightboxNavigate(diff > 0 ? 1 : -1);
        }, { passive: true });

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
            const closeBtn = target.closest('[data-modal-close]');
            if (closeBtn) closeModal();
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
                    // Auto-scroll: garantir que o painel (acima dos botoes) fique
                    // visivel sem o usuario precisar rolar manualmente.
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
                if (lightboxOpen) { closeLightbox(); return; }
                if (!dom.modal.classList.contains('hidden')) closeModal();
            }
            if (lightboxOpen) {
                if (e.key === 'ArrowRight') lightboxNavigate(1);
                if (e.key === 'ArrowLeft') lightboxNavigate(-1);
            }
        });
    }

    window.openModal = openModal;
    window.closeModal = closeModal;
    window.openLightbox = openLightbox;
    window.lightboxNavigate = lightboxNavigate;
    window.closeLightbox = closeLightbox;
    window.initModal = initModal;
})();
