// sw.js

const CACHE_NAME = 'evolucao-app-cache-v2'; // <-- MUDE A VERSÃO AQUI a cada atualização
const urlsToCache = [
    '/',
    '/index.html',
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
    '/icons/icon-192.png',
    '/icons/icon-512.png'
];

// Instalação: o novo SW é instalado
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME )
            .then(cache => {
                console.log('Cache aberto. Adicionando URLs ao cache.');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting(); // Força o novo Service Worker a se tornar ativo imediatamente
});

// Ativação: o novo SW limpa os caches antigos
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Limpando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim(); // Torna-se o controlador de todas as abas abertas
});

// Fetch: Estratégia "Stale-While-Revalidate"
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.open(CACHE_NAME).then(cache => {
            return cache.match(event.request).then(cachedResponse => {
                // Busca na rede em paralelo
                const fetchedResponsePromise = fetch(event.request).then(networkResponse => {
                    // Se a busca for bem-sucedida, atualiza o cache
                    if (networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                });

                // Retorna a resposta do cache imediatamente (se houver),
                // enquanto a busca na rede acontece em segundo plano.
                return cachedResponse || fetchedResponsePromise;
            });
        })
    );
});
