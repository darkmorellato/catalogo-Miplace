// ============================================================
// types/dom.d.ts
// Helpers e tipos auxiliares para DOM
// Declarações globais (arquivo NÃO é módulo: sem import/export)
// ============================================================

type Subscriber = (ids: Set<number>) => void;

interface WishlistAPI {
  has(id: number): boolean;
  toggle(id: number): boolean;
  add(id: number): void;
  remove(id: number): void;
  clear(): void;
  size(): number;
  list(): number[];
  subscribe(fn: Subscriber): () => void;
  refresh(): void;
}

interface AudioState {
  bg: HTMLAudioElement | null;
  control: HTMLElement | null;
  icon: HTMLElement | null;
  isPlaying: boolean;
}

interface AppState {
  backToTop: HTMLElement | null;
  scrollProgress: HTMLElement | null;
  scrollTicking: boolean;
  parallaxRect: DOMRect | null;
  parallaxFrame: number;
  parallaxX: number;
  parallaxY: number;
  navLinkFrame: number;
  navLinkTargetX: number;
  navLinkTargetY: number;
  audio: AudioState;
}

interface ModalDOMRefs {
  modal: HTMLElement | null;
  modalContainer: HTMLElement | null;
  modalContent: HTMLElement | null;
  lightbox: HTMLElement | null;
  lightboxImg: HTMLImageElement | null;
  lightboxCounter: HTMLElement | null;
}

interface CatalogState {
  currentFilter: 'Todos' | ProductBrand;
  currentSearch: string;
  gridCarouselInterval: number | null;
  kbToggle: boolean;
  visibleIds: Set<HTMLElement>;
  intersectionObserver: IntersectionObserver | null;
  visibilityPaused: boolean;
}

interface WishlistState {
  ids: Set<number>;
  subscribers: Set<Subscriber>;
  storageAvailable: boolean;
}

interface WishlistDrawerRefs {
  fab: HTMLElement | null;
  fabCount: HTMLElement | null;
  overlay: HTMLElement | null;
  panel: HTMLElement | null;
  closeBtn: HTMLElement | null;
  content: HTMLElement | null;
  count: HTMLElement | null;
  footer: HTMLElement | null;
  clearBtn: HTMLElement | null;
  shareBtn: HTMLElement | null;
  isOpen: boolean;
  lastFocused: Element | null;
}
