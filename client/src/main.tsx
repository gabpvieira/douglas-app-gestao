import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/legacyCompat.css";
import { initializePolyfills } from "./lib/polyfills";

// Inicializa polyfills e compatibilidade para browsers legados (Chrome 109)
initializePolyfills();

// Registra Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado com sucesso:', registration.scope);
        
        // Verifica atualizações a cada 60 segundos
        setInterval(() => {
          registration.update();
        }, 60000);
        
        // Força atualização quando novo SW está esperando
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Novo conteúdo disponível, força atualização
                if (confirm('Nova versão disponível! Deseja atualizar agora?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('[PWA] Erro ao registrar Service Worker:', error);
      });
    
    // Recarrega quando novo SW assume controle
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
