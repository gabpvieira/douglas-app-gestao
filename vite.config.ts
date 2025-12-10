import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    // Compatibilidade com Chrome 109 (ES2020 é suportado)
    target: ['chrome109', 'es2020'],
    // Gera sourcemaps para debug
    sourcemap: false,
    // Configurações de minificação
    minify: 'esbuild',
    // CSS target para compatibilidade
    cssTarget: ['chrome109'],
    rollupOptions: {
      output: {
        // Garante compatibilidade de módulos
        format: 'es',
        // Evita chunks muito grandes
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
        },
      },
    },
  },
  // Otimizações de dependências
  optimizeDeps: {
    // Força inclusão de dependências problemáticas
    include: ['react', 'react-dom'],
  },
  server: {
    hmr: {
      overlay: true,
    },
    watch: {
      usePolling: false,
      interval: 100,
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  // Configuração de CSS
  css: {
    devSourcemap: true,
  },
});
