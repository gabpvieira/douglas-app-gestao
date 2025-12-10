/**
 * Service Worker com compatibilidade para Chrome 109 (Windows 7)
 * Versão: 1.1.0 - Atualização do ícone PWA
 */

var CACHE_VERSION = 'app-v3';
var STATIC_CACHE = 'static-' + CACHE_VERSION;
var DYNAMIC_CACHE = 'dynamic-' + CACHE_VERSION;

// Assets estáticos para cache
var STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/icone-pwa.png',
  '/apple-touch-icon.png'
];

// Instalação do Service Worker
self.addEventListener('install', function(event) {
  console.log('[SW] Installing Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(function() {
        // Força ativação imediata
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', function(event) {
  console.log('[SW] Activating Service Worker v' + CACHE_VERSION);
  
  event.waitUntil(
    caches.keys()
      .then(function(cacheNames) {
        return Promise.all(
          cacheNames
            .filter(function(cacheName) {
              // Remove caches antigos
              return cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE;
            })
            .map(function(cacheName) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(function() {
        // Assume controle de todas as páginas imediatamente
        return self.clients.claim();
      })
  );
});

// Interceptação de requisições (Network First com fallback para cache)
self.addEventListener('fetch', function(event) {
  var request = event.request;
  
  // Ignora requisições não-GET
  if (request.method !== 'GET') {
    return;
  }
  
  // Ignora requisições para APIs externas e Supabase
  var url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Ignora requisições de API
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  event.respondWith(
    fetch(request)
      .then(function(response) {
        // Clona a resposta para cache
        var responseClone = response.clone();
        
        caches.open(DYNAMIC_CACHE)
          .then(function(cache) {
            cache.put(request, responseClone);
          });
        
        return response;
      })
      .catch(function() {
        // Fallback para cache se offline
        return caches.match(request)
          .then(function(cachedResponse) {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // Fallback para página principal se for navegação
            if (request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Listener para mensagens (atualização forçada)
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    });
  }
});
