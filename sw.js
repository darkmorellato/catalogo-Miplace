// ============================================================
// MIPLACE MAGAZINE — Service Worker (PWA)
// Estratégia: Cache First para assets estáticos,
//             Network First para dados dinâmicos (produtos.json)
// Versão gerada automaticamente por timestamp de build
// ============================================================

const BUILD_TIMESTAMP = '__BUILD_TIMESTAMP__';
const CACHE_NAME = `miplace-v${BUILD_TIMESTAMP}`;

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/produtos.json',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:ital,wght@0,400;0,600;0,800;1,400;1,600&display=swap'
];

// INSTALL — Pré-cacheia os assets principais
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log(`[SW] Cacheando assets (cache: ${CACHE_NAME})...`);
            return cache.addAll(ASSETS_TO_CACHE);
        }).catch(err => console.warn('[SW] Falha ao cachear alguns assets:', err))
    );
    self.skipWaiting();
});

// ACTIVATE — Remove todos os caches antigos automaticamente
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter(name => name.startsWith('miplace-') && name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Removendo cache antigo:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    self.clients.claim();
});

// FETCH — Estratégia híbrida
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Network First para produtos.json (dados dinâmicos)
    if (url.pathname.endsWith('produtos.json')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                    return response;
                })
                .catch(() => caches.match(request))
        );
        return;
    }

    // Cache First para todo o resto
    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                if (!response || response.status !== 200 || response.type === 'opaque') {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                return response;
            });
        }).catch(() => {
            // Fallback offline: retorna a página principal
            if (request.destination === 'document') {
                return caches.match('/index.html');
            }
        })
    );
});
