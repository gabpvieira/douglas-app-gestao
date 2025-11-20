# Correção do Hot Module Replacement (HMR) e Servidor de Desenvolvimento

## Problema
O servidor parava completamente quando havia erros durante o desenvolvimento, impedindo o Hot Module Replacement (HMR) de funcionar corretamente.

## Soluções Implementadas

### 1. Configuração do Vite (vite.config.ts)
- Adicionado `hmr.overlay: true` para mostrar erros na tela sem parar o servidor
- Configurado `watch.usePolling: false` e `watch.interval: 100` para melhor detecção de mudanças

### 2. Servidor Vite (server/vite.ts)
- **REMOVIDO** `process.exit(1)` do logger de erros
- Agora os erros são apenas logados, permitindo que o HMR continue funcionando
- Mantido o overlay de erros para feedback visual

### 3. Servidor Express (server/index.ts)
- Adicionado tratamento de `uncaughtException` e `unhandledRejection` em desenvolvimento
- Erros não causam mais a parada do servidor em modo desenvolvimento
- Logs melhorados para identificar problemas

### 4. Scripts NPM (package.json)
- **Novo script principal**: `npm run dev` agora usa `tsx watch` com auto-restart
- **Script de debug**: `npm run dev:debug` para desenvolvimento sem watch
- Flag `--clear-screen=false` para melhor visualização dos logs

## Como Usar

### Desenvolvimento Normal (Recomendado)
```bash
npm run dev
```
- Auto-restart quando arquivos do servidor mudam
- HMR para mudanças no cliente
- Servidor não para em caso de erros

### Desenvolvimento com Debug
```bash
npm run dev:debug
```
- Sem auto-restart
- Útil para debugging com breakpoints

## Benefícios

✅ **Servidor nunca para** - Erros são mostrados mas não interrompem o desenvolvimento
✅ **HMR funciona sempre** - Mudanças no código refletem instantaneamente no navegador
✅ **Auto-restart inteligente** - Servidor reinicia automaticamente quando necessário
✅ **Melhor experiência de desenvolvimento** - Menos interrupções, mais produtividade

## Comportamento em Produção

Em produção (`NODE_ENV=production`), o comportamento permanece o mesmo:
- Erros críticos ainda causam a parada do servidor
- Sem HMR ou watch mode
- Otimizado para performance e estabilidade
