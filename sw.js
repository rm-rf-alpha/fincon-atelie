// sw.js
const CACHE_NAME = 'atelie-cache-v1';

self.addEventListener('install', (e) => {
    console.log('[Service Worker] Instalado');
});

self.addEventListener('fetch', (e) => {
    // Apenas repassa a requisição normalmente para a rede
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
