// ============================================================
// MIPLACE MAGAZINE — modules/wishlist.js
// Store reativo de favoritos com localStorage.
// API exposta em window.MiplaceWishlist.
// @ts-check
// ============================================================

(() => {
    'use strict';

    const STORAGE_KEY = 'miplace:wishlist:v1';
    /** @type {Set<Subscriber>} */
    const subscribers = new Set();
    /** @type {Set<number>} */
    let ids = load();
    let storageAvailable = true;

    /** @returns {Set<number>} */
    function load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return new Set();
            const parsed = JSON.parse(raw);
            if (!Array.isArray(parsed)) return new Set();
            return new Set(parsed.filter(/** @returns {n is number} */ n => Number.isInteger(n) && /** @type {number} */ (n) > 0));
        } catch (_e) {
            storageAvailable = false;
            return new Set();
        }
    }

    /** @returns {void} */
    function persist() {
        if (!storageAvailable) return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
        } catch (/** @type {unknown} */ e) {
            storageAvailable = false;
            console.warn('[Wishlist] localStorage indisponível:', /** @type {Error} */ (e).message);
        }
    }

    /** @returns {void} */
    function notify() {
        subscribers.forEach(fn => {
            try { fn(new Set(ids)); }
            catch (e) { console.error('[Wishlist] subscriber error:', e); }
        });
    }

    /**
     * @param {number} id
     * @returns {boolean}
     */
    function has(id) { return ids.has(id); }

    /**
     * @param {number} id
     * @returns {boolean} Novo estado (true = favoritado)
     */
    function toggle(id) {
        if (!Number.isInteger(id) || id < 1) return false;
        let nowActive;
        if (ids.has(id)) { ids.delete(id); nowActive = false; }
        else { ids.add(id); nowActive = true; }
        persist();
        notify();
        return nowActive;
    }

    /**
     * @param {number} id
     * @returns {void}
     */
    function add(id) {
        if (!Number.isInteger(id) || id < 1) return;
        if (ids.has(id)) return;
        ids.add(id);
        persist();
        notify();
    }

    /**
     * @param {number} id
     * @returns {void}
     */
    function remove(id) {
        if (!ids.has(id)) return;
        ids.delete(id);
        persist();
        notify();
    }

    /** @returns {void} */
    function clear() {
        if (ids.size === 0) return;
        ids = new Set();
        persist();
        notify();
    }

    /** @returns {number} */
    function size() { return ids.size; }

    /** @returns {number[]} */
    function list() { return [...ids]; }

    /**
     * @param {Subscriber} fn
     * @returns {() => void} Unsubscriber
     */
    function subscribe(fn) {
        subscribers.add(fn);
        try { fn(new Set(ids)); } catch {}
        return () => subscribers.delete(fn);
    }

    /**
     * Importa lista via URL (?wishlist=1,5,7)
     * @returns {Set<number> | null}
     */
    function importFromURL() {
        try {
            const params = new URLSearchParams(window.location.search);
            const raw = params.get('wishlist');
            if (!raw) return null;
            const incoming = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => Number.isInteger(n) && /** @type {number} */ (n) > 0);
            if (!incoming.length) return null;
            return new Set(incoming);
        } catch { return null; }
    }

    /** @returns {void} */
    function clearImportFromURL() {
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete('wishlist');
            window.history.replaceState({}, '', url);
        } catch {}
    }

    // Sincronização entre abas
    window.addEventListener('storage', e => {
        if (e.key !== STORAGE_KEY) return;
        ids = load();
        notify();
    });

    const api = { has, toggle, add, remove, clear, size, list, subscribe, importFromURL, clearImportFromURL, refresh: () => renderDrawer(ids) };
    window.MiplaceWishlist = api;

    // Inicialização automática — se houver ?wishlist=, pergunta ao usuário
    function maybePromptImport() {
        const incoming = importFromURL();
        if (!incoming) return;

        const incomingCount = incoming.size;
        const currentCount = ids.size;
        let action = 'cancel';

        if (currentCount === 0) {
            action = window.confirm(
                `Deseja adicionar ${incomingCount} produto${incomingCount > 1 ? 's' : ''} aos seus favoritos?`
            ) ? 'replace' : 'cancel';
        } else {
            action = window.confirm(
                `Você tem ${currentCount} favorito${currentCount > 1 ? 's' : ''} salvo${currentCount > 1 ? 's' : ''}.\n\n` +
                `OK = Mesclar com a lista importada (${incomingCount} item${incomingCount > 1 ? 'ns' : ''})\n` +
                `Cancelar = Não importar`
            ) ? 'merge' : 'cancel';
        }

        if (action === 'replace') {
            ids = new Set(incoming);
        } else if (action === 'merge') {
            incoming.forEach(id => ids.add(id));
        } else {
            clearImportFromURL();
            return;
        }

        persist();
        notify();
        clearImportFromURL();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            maybePromptImport();
            setupDrawer();
        });
    } else {
        setTimeout(() => { maybePromptImport(); setupDrawer(); }, 0);
    }

    // ============================================================
    // DRAWER — UI da Wishlist
    // ============================================================
    /** @type {WishlistDrawerRefs} */
    const drawer = {
        fab: null,
        fabCount: null,
        overlay: null,
        panel: null,
        closeBtn: null,
        content: null,
        count: null,
        footer: null,
        clearBtn: null,
        shareBtn: null,
        isOpen: false,
        lastFocused: null
    };

    function setupDrawer() {
        drawer.fab = document.getElementById('wishlist-fab');
        drawer.fabCount = document.getElementById('wishlist-fab-count');
        drawer.overlay = document.getElementById('wishlist-drawer-overlay');
        drawer.panel = document.getElementById('wishlist-drawer');
        drawer.closeBtn = document.getElementById('wishlist-drawer-close');
        drawer.content = document.getElementById('wishlist-drawer-content');
        drawer.count = document.getElementById('wishlist-drawer-count');
        drawer.footer = document.getElementById('wishlist-drawer-footer');
        drawer.clearBtn = document.getElementById('wishlist-clear');
        drawer.shareBtn = document.getElementById('wishlist-share');
        if (!drawer.fab || !drawer.panel) return;

        drawer.fab.addEventListener('click', openDrawer);
        drawer.closeBtn?.addEventListener('click', closeDrawer);
        drawer.overlay?.addEventListener('click', closeDrawer);
        drawer.clearBtn?.addEventListener('click', () => {
            if (ids.size === 0) return;
            if (window.confirm(`Remover todos os ${ids.size} favoritos?`)) clear();
        });
        drawer.shareBtn?.addEventListener('click', shareList);

        // Delegation no conteúdo do drawer: abrir modal e remover item
        drawer.content?.addEventListener('click', e => {
            const target = /** @type {Element} */ (/** @type {unknown} */ (e.target));
            const removeBtn = target.closest('[data-wishlist-remove]');
            if (removeBtn) {
                e.preventDefault();
                e.stopPropagation();
                const id = parseInt(removeBtn.getAttribute('data-wishlist-remove') || '0', 10);
                if (Number.isFinite(id)) remove(id);
                return;
            }
            const item = target.closest('.wishlist-item[data-open-product]');
            if (item) {
                const id = parseInt(item.getAttribute('data-open-product') || '0', 10);
                if (Number.isFinite(id) && typeof window.openModal === 'function') {
                    closeDrawer();
                    window.openModal(id);
                }
            }
        });

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && drawer.isOpen) {
                e.preventDefault();
                closeDrawer();
            }
        });

        subscribe(renderDrawer);
        renderDrawer(ids);
    }

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
     * @param {number} id
     * @returns {Product | undefined}
     */
    function getProductById(id) {
        return (window.MiplaceProducts || []).find(p => p.id === id);
    }

    /** @returns {void} */
    function openDrawer() {
        if (drawer.isOpen) return;
        if (!drawer.panel || !drawer.fab) return;
        drawer.lastFocused = /** @type {Element | null} */ (document.activeElement);
        drawer.isOpen = true;
        drawer.overlay?.classList.add('open');
        drawer.panel.classList.add('open');
        drawer.panel.setAttribute('aria-hidden', 'false');
        drawer.fab.setAttribute('aria-expanded', 'true');
        requestAnimationFrame(() => drawer.closeBtn?.focus());
        document.body.style.overflow = 'hidden';
    }

    /** @returns {void} */
    function closeDrawer() {
        if (!drawer.isOpen) return;
        if (!drawer.panel || !drawer.fab) return;
        drawer.isOpen = false;
        drawer.overlay?.classList.remove('open');
        drawer.panel.classList.remove('open');
        drawer.panel.setAttribute('aria-hidden', 'true');
        drawer.fab.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        const lastFocused = drawer.lastFocused;
        if (lastFocused) {
            try { (/** @type {HTMLElement} */ (lastFocused)).focus(); } catch {}
        }
    }

    /**
     * @param {Set<number>} activeIds
     * @returns {void}
     */
    function renderDrawer(activeIds) {
        const count = activeIds.size;
        if (drawer.fab) {
            drawer.fab.classList.toggle('wishlist-fab-hidden', count === 0);
        }
        if (drawer.fabCount) {
            drawer.fabCount.textContent = count > 99 ? '99+' : String(count);
        }
        if (drawer.count) {
            drawer.count.textContent = count === 0
                ? 'Nenhum favorito salvo'
                : `${count} ${count === 1 ? 'produto favoritado' : 'produtos favoritados'}`;
        }
        if (drawer.footer) {
            drawer.footer.classList.toggle('wishlist-drawer-footer-hidden', count === 0);
        }
        if (!drawer.content) return;
        if (count === 0) {
            drawer.content.innerHTML = `
                <div id="wishlist-empty" class="flex flex-col items-center justify-center h-full text-center py-12">
                    <i class="fa-regular fa-heart text-5xl mb-4" style="color:rgba(28,25,23,0.2);" aria-hidden="true"></i>
                    <h3 class="font-serif text-xl mb-2" style="color:#1c1917;">Sua lista está vazia</h3>
                    <p class="font-sans text-xs" style="color:#44403c;">Toque no coração em qualquer produto para favoritá-lo.</p>
                </div>`;
            return;
        }

        const items = [...activeIds].map(id => {
            const p = getProductById(id);
            if (!p) return '';
            const price = p.specialPrice || p.price || 'Consulte';
            return `
            <div class="wishlist-item" data-open-product="${p.id}">
                <div class="wishlist-item-image">
                    ${p.image ? `<img src="${escapeHTML(p.image)}" alt="${escapeHTML(p.name)}" loading="lazy">` : `<i class="fa-solid fa-mobile-screen" style="color:rgba(28,25,23,0.2);"></i>`}
                </div>
                <div class="wishlist-item-info">
                    <div class="wishlist-item-brand">${escapeHTML(p.brand)}</div>
                    <div class="wishlist-item-name">${escapeHTML(p.name)}</div>
                    <div class="wishlist-item-price">${escapeHTML(price)}</div>
                </div>
                <button type="button" class="wishlist-item-remove" data-wishlist-remove="${p.id}" aria-label="Remover ${escapeHTML(p.name)} dos favoritos" title="Remover">
                    <i class="fa-solid fa-xmark text-xs" aria-hidden="true"></i>
                </button>
            </div>`;
        }).join('');

        drawer.content.innerHTML = `<div role="list">${items}</div>`;
    }

    /** @returns {void} */
    function shareList() {
        if (ids.size === 0) return;
        const url = new URL(window.location.href);
        url.searchParams.set('wishlist', [...ids].join(','));
        const link = url.toString();
        const text = `Confira minha lista de ${ids.size} favorito${ids.size > 1 ? 's' : ''} na Miplace Magazine!`;

        if (navigator.share) {
            navigator.share({ title: 'Meus favoritos — Miplace', text, url: link }).catch(() => fallbackShare(link, text));
        } else {
            fallbackShare(link, text);
        }
    }

    /**
     * @param {string} link
     * @param {string} text
     * @returns {void}
     */
    function fallbackShare(link, text) {
        const whatsapp = `https://wa.me/?text=${encodeURIComponent(text + '\n' + link)}`;
        if (window.confirm('Compartilhar via WhatsApp? Cancelar = copiar link.')) {
            window.open(whatsapp, '_blank', 'noopener,noreferrer');
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(
                () => alert('Link copiado para a área de transferência!'),
                () => prompt('Copie o link:', link)
            );
        } else {
            prompt('Copie o link:', link);
        }
    }
})();
