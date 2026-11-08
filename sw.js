// ============================================================
// MIPLACE GROUP — Service Worker (PWA)
// Estratégia:
//   - Network First para navegações e produtos.json (com timeout)
//   - Cache First para assets estáticos same-origin
//   - offline.html como fallback de navegação
//   - API e requisições cross-origin nunca são cacheadas
// IMPORTANTE: bump BUILD_TIMESTAMP a cada release.
// ============================================================

const BUILD_TIMESTAMP = '2026-11-08.14';
const CACHE_NAME = `miplace-v${BUILD_TIMESTAMP}`;
const ASSET_VERSION = '2.0.12';
const OFFLINE_URL = '/offline.html';
const NETWORK_TIMEOUT_MS = 4000;

// Assets locais críticos. Os módulos i18n.js e corporate.js podem ainda
// não existir no momento do install: o precache é tolerante a 404 para
// não abortar a instalação inteira. Eles entram no cache no primeiro
// acesso online (runtime) ou no próximo bump.
const V = `?v=${ASSET_VERSION}`;
const PRECACHE_URLS = [
    '/',
    '/index.html',
    `/stores.js${V}`,
    `/app.js${V}`,
    `/modules/ui.js${V}`,
    `/modules/catalog.js${V}`,
    `/modules/modal.js${V}`,
    `/modules/wishlist.js${V}`,
    `/modules/scroll.js${V}`,
    `/modules/i18n.js${V}`,
    `/modules/analytics.js${V}`,
    `/modules/corporate.js${V}`,
    `/modules/concierge.js${V}`,
    '/content/concierge-faq.json',
    '/produtos.json',
    OFFLINE_URL,
    '/favicon_io/site.webmanifest',
    '/favicon_io/android-chrome-192x192.png',
    '/favicon_io/android-chrome-512x512.png',
    '/favicon_io/apple-touch-icon.png',
    '/favicon_io/favicon-32x32.png',
    '/favicon_io/favicon-16x16.png',
    '/favicon_io/favicon.ico'
];

// INSTALL — pré-cache individual e tolerante a falhas.
// cache.addAll() é atômico: um único 404 derrubaria todo o precache.
self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        const results = await Promise.allSettled(
            PRECACHE_URLS.map(async (url) => {
                try {
                    const response = await fetch(url, { cache: 'reload' });
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    await cache.put(url, response);
                    return url;
                } catch (error) {
                    console.warn(`[SW] Não foi possível pré-cachear ${url}:`, error);
                    throw error;
                }
            })
        );

        const failed = results.filter((result) => result.status === 'rejected').length;
        console.info(`[SW] Precache concluído: ${PRECACHE_URLS.length - failed}/${PRECACHE_URLS.length} assets.`);
    })());

    self.skipWaiting();
});

// ACTIVATE — remove apenas caches antigos deste app.
self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames
                .filter((name) => name.startsWith('miplace-') && name !== CACHE_NAME)
                .map((name) => {
                    console.info('[SW] Removendo cache antigo:', name);
                    return caches.delete(name);
                })
        );
        await self.clients.claim();
    })());
});

/**
 * fetch com timeout para não segurar a navegação em redes ruins.
 * @param {Request} request
 * @param {number} timeoutMs
 * @returns {Promise<Response>}
 */
function fetchWithTimeout(request, timeoutMs) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    return fetch(request, { signal: controller.signal }).finally(() => {
        clearTimeout(timeoutId);
    });
}

/**
 * Network First: tenta a rede, atualiza o cache e, em falha/timeout,
 * devolve a versão cacheada. Para navegação sem cache, usa offline.html.
 * @param {Request} request
 * @param {boolean} isNavigation
 * @returns {Promise<Response>}
 */
async function networkFirst(request, isNavigation) {
    try {
        const response = await fetchWithTimeout(request, NETWORK_TIMEOUT_MS);

        if (response.ok && response.type === 'basic' && !response.redirected) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        const cached = await caches.match(request, { ignoreSearch: true });
        if (cached) return cached;

        if (isNavigation) {
            const { pathname } = new URL(request.url);
            if (pathname === '/' || pathname === '/index.html') {
                const shell = await caches.match('/index.html', { ignoreSearch: true })
                    || await caches.match('/', { ignoreSearch: true });
                if (shell) return shell;
            }

            const offline = await caches.match(OFFLINE_URL, { ignoreSearch: true });
            if (offline) return offline;
        }

        if (new URL(request.url).pathname.endsWith('/produtos.json')) {
            return new Response(JSON.stringify([]), {
                status: 503,
                statusText: 'Offline',
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            });
        }

        return new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
}

/**
 * Cache First para estáticos. ignoreSearch é essencial porque o HTML
 * referencia os módulos com ?v=2.0.0, mas o precache usa caminhos limpos.
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function cacheFirst(request) {
    const cached = await caches.match(request, { ignoreSearch: true });
    if (cached) return cached;

    try {
        const response = await fetch(request);

        if (response.ok && response.type === 'basic' && !response.headers.has('Content-Range')) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
        }

        return response;
    } catch (error) {
        if (request.destination === 'document') {
            const offline = await caches.match(OFFLINE_URL, { ignoreSearch: true });
            if (offline) return offline;
        }

        return new Response('', { status: 504, statusText: 'Offline' });
    }
}

// FETCH — somente GET same-origin. API, ranges e cross-origin passam direto.
self.addEventListener('fetch', (event) => {
    const { request } = event;

    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith('/api/')) return;
    if (url.pathname.startsWith('/_vercel/')) return;
    if (request.headers.has('range')) return;

    // CSS fica fora do SW: o navegador trata respostas de cache do worker
    // como opacas para o CSSOM em alguns casos. O CSS já é versionado (?v=)
    // e cacheado pelo CDN, então a rede + HTTP cache é a via correta.
    if (url.pathname.endsWith('.css')) return;

    // Áudio é grande (6,7 MB) e não deve entrar no cache do service worker.
    if (url.pathname.endsWith('.mp3')) return;

    // Scripts sempre tentam a rede primeiro: evita servir JS antigo ou
    // truncado de uma instalação anterior. O cache fica como fallback offline.
    if (request.destination === 'script') {
        event.respondWith(networkFirst(request, false));
        return;
    }

    const isNavigation = request.mode === 'navigate' || request.destination === 'document';
    const isDynamicData = url.pathname.endsWith('/produtos.json');

    if (isNavigation || isDynamicData) {
        event.respondWith(networkFirst(request, isNavigation));
        return;
    }

    event.respondWith(cacheFirst(request));
});
