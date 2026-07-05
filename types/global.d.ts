// ============================================================
// types/global.d.ts
// Augmentations de Window com APIs expostas pelos módulos
// Arquivo de módulo (export vazio) para poder usar declare global
// ============================================================

export {};

declare global {
  interface Window {
    MiplaceState: AppState;
    MiplaceProducts: Product[];
    STORES: Store[];
    MiplaceWishlist: WishlistAPI;
    MiplaceCatalog: { getStore: () => CatalogState; brands: ('Todos' | ProductBrand)[] };

    initScrollReveal: () => void;
    initSearch: () => void;
    initModal: () => void;
    initCatalog: () => void;
    renderFilters: () => void;
    renderProducts: () => void;
    startGridCarousel: () => void;
    setFilter: (brand: string) => void;
    clearSearch: () => void;
    trapFocus: (el: Element) => () => void;
    escapeHTML: (str: unknown) => string;
    lockBodyScroll: () => () => void;
    debounce: <F extends (...args: any[]) => any>(fn: F, delay: number) => (...args: Parameters<F>) => void;
    trackEvent: (name: string, params?: Record<string, any>) => void;
    playUIClick: () => void;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
    toggleContato: () => void;
    openModal: (id: number) => void;
    closeModal: () => void;
    openLightbox: (src: string, idx?: number) => void;
    lightboxNavigate: (dir: number) => void;
    closeLightbox: () => void;
    injectSchemaOrg: () => void;
    renderContactDropdown: (id: string) => void;
    renderStoreCards: (id: string) => void;
  }
}
