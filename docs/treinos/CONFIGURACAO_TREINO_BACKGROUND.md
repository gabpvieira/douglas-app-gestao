# Configuração de Treino em Background

## Visão Geral

O treino agora funciona automaticamente em segundo plano sem necessidade de minimizar manualmente. Esta é a arquitetura simplificada que garante que timers e progresso continuem funcionando mesmo quando o usuário sai da tela.

## Arquitetura Técnica

### 1. Timer Baseado em Timestamp

**Implementação:**
```typescript
// Hook: useTreinoEmAndamento.ts
const calcularTempoDecorrido = useCallback(() => {
  if (!localTreino) return 0;
  
  if (localTreino.pausado) {
    return Math.max(0, localTreino.tempoAcumulado || 0);
  }
  
  const inicio = new Date(localTreino.tempoInicio);
  const agora = new Date();
  const diffMs = agora.getTime() - inicio.getTime();
  const diffSegundos = Math.floor(diffMs / 1000);
  
  return Math.max(0, (localTreino.tempoAcumulado || 0) + diffSegundos);
}, [localTreino]);
```

**Por que funciona:**
- Usa `Date.now()` como referência absoluta
- Não depende de `setInterval` contínuo
- Calcula diferença de tempo real entre início e agora
- Funciona mesmo se a aba ficar inativa por horas

### 2. Page Visibility API

**Implementação:**
```typescript
// TreinoExecucao.tsx
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden && treinoEmAndamento && !treinoEmAndamento.pausado) {
      // Atualizar imediatamente quando voltar à aba
      setTempoDecorrido(calcularTempoDecorrido());
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [treinoEmAndamento, calcularTempoDecorrido]);
```

**Benefícios:**
- Detecta quando usuário volta à aba
- Sincroniza estado visual imediatamente
- Evita dessincronia entre tempo real e UI

### 3. Persistência de Estado

**Três camadas de persistência:**

1. **Estado React (memória):**
   - Rápido e responsivo
   - Perdido ao recarregar página

2. **localStorage (navegador):**
   - Backup local imediato
   - Sobrevive a recarregamentos
   - Expira após 24h

3. **Supabase (banco de dados):**
   - Persistência permanente
   - Sincronizado entre dispositivos
   - Auto-save a cada 10 segundos

**Fluxo de salvamento:**
```typescript
// Auto-save periódico
useEffect(() => {
  if (!localTreino || localTreino.pausado) return;

  autoSaveRef.current = setInterval(() => {
    if (pendingUpdateRef.current) {
      salvarMutation.mutate(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
  }, AUTO_SAVE_INTERVAL); // 10 segundos

  return () => {
    if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }
  };
}, [localTreino?.pausado]);

// Salvar ao sair da página
useEffect(() => {
  const handleBeforeUnload = () => {
    if (localTreino) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(localTreino));
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [localTreino]);
```

### 4. Timer de Descanso em Background

**Implementação:**
```typescript
// RestTimer.tsx
const [startTime] = useState(() => Date.now());
const [duration] = useState(tempoInicial);

const calculateTimeRemaining = () => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const remaining = Math.max(0, duration - elapsed);
  return remaining;
};

// Atualizar a cada 100ms para precisão
useEffect(() => {
  if (completo) return;

  const interval = setInterval(() => {
    const remaining = calculateTimeRemaining();
    setTempoRestante(remaining);

    if (remaining <= 0 && !completo) {
      setCompleto(true);
    }
  }, 100);

  return () => clearInterval(interval);
}, [completo]);
```

**Notificações:**
```typescript
// Notificação quando completar
const sendNotification = () => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification('Descanso Completo! 💪', {
      body: exercicioNome 
        ? `Pronto para a próxima série de ${exercicioNome}`
        : 'Pronto para a próxima série',
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      vibrate: [200, 100, 200],
      tag: 'rest-timer',
      requireInteraction: false,
      silent: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};
```

## Configuração de Permissões

### Para o Usuário

#### 1. Notificações do Navegador

**Onde configurar:**
- Página: `/aluno/notificacoes`
- Ou: Configurações do navegador

**Como funciona:**
1. Usuário acessa página de notificações
2. Clica em "Ativar Notificações"
3. Navegador solicita permissão
4. Após autorizar, notificações funcionam em background

**Código da página:**
```typescript
// Página: client/src/pages/aluno/Notificacoes.tsx
const handleEnableNotifications = async () => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      toast({
        title: "Notificações ativadas! 🎉",
        description: "Você receberá alertas de descanso e lembretes.",
      });
    } else {
      toast({
        title: "Permissão negada",
        description: "Você pode ativar nas configurações do navegador.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};
```

#### 2. Service Worker (PWA)

**Registro automático:**
```typescript
// client/src/main.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}
```

**Não requer ação do usuário** - registrado automaticamente ao carregar o app.

### Para o Desenvolvedor

#### 1. Verificar Permissões

```typescript
// Verificar status de notificações
const checkNotificationPermission = () => {
  if (!('Notification' in window)) {
    return 'not-supported';
  }
  return Notification.permission; // 'granted', 'denied', 'default'
};

// Verificar Service Worker
const checkServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    return { supported: false };
  }
  
  const registration = await navigator.serviceWorker.getRegistration();
  return {
    supported: true,
    registered: !!registration,
    active: !!registration?.active,
  };
};
```

#### 2. Testar Background

**Cenários de teste:**

1. **Trocar de aba:**
   ```
   1. Iniciar treino
   2. Trocar para outra aba
   3. Aguardar 30 segundos
   4. Voltar à aba do treino
   5. Verificar se tempo está correto
   ```

2. **Minimizar navegador:**
   ```
   1. Iniciar treino
   2. Minimizar navegador
   3. Aguardar 1 minuto
   4. Restaurar navegador
   5. Verificar se tempo continuou
   ```

3. **Timer de descanso:**
   ```
   1. Completar uma série
   2. Iniciar timer de descanso
   3. Trocar de aba
   4. Aguardar timer completar
   5. Verificar se notificação chegou
   ```

4. **Bloquear tela:**
   ```
   1. Iniciar treino no mobile
   2. Bloquear tela do dispositivo
   3. Aguardar 2 minutos
   4. Desbloquear
   5. Verificar se tempo está correto
   ```

## Limitações e Workarounds

### 1. Safari iOS (sem PWA instalado)

**Problema:**
- Safari limita background após ~30 segundos
- Timers podem pausar quando app não está visível

**Workaround:**
- Recomendar instalação como PWA
- Ou manter app visível durante treino

**Código de detecção:**
```typescript
const isSafariIOS = () => {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const chrome = /CriOS|Chrome/.test(ua);
  return iOS && webkit && !chrome;
};

const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
};

// Mostrar aviso se necessário
if (isSafariIOS() && !isPWA()) {
  toast({
    title: "Dica para melhor experiência",
    description: "Instale o app na tela inicial para treinos em background.",
  });
}
```

### 2. Modo Economia de Energia

**Problema:**
- Dispositivos em economia de energia podem limitar background

**Workaround:**
- Usar timestamp (não afetado)
- Sincronizar ao voltar à aba

**Já implementado:**
```typescript
// Page Visibility API garante sincronização
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      setTempoDecorrido(calcularTempoDecorrido());
    }
  };
  // ...
}, []);
```

### 3. Notificações Bloqueadas

**Problema:**
- Usuário pode ter bloqueado notificações

**Workaround:**
- Mostrar instruções para desbloquear
- Oferecer alternativas (som, vibração)

**Código:**
```typescript
const showNotificationHelp = () => {
  if (Notification.permission === 'denied') {
    return (
      <Alert>
        <AlertTitle>Notificações bloqueadas</AlertTitle>
        <AlertDescription>
          Para receber alertas de descanso:
          1. Abra configurações do navegador
          2. Procure por "Notificações"
          3. Permita notificações deste site
        </AlertDescription>
      </Alert>
    );
  }
};
```

## Monitoramento e Debug

### Logs de Debug

```typescript
// Adicionar em desenvolvimento
if (import.meta.env.DEV) {
  console.log('[Treino] Estado:', {
    tempoDecorrido,
    pausado: treinoEmAndamento?.pausado,
    tempoInicio: treinoEmAndamento?.tempoInicio,
    tempoAcumulado: treinoEmAndamento?.tempoAcumulado,
  });
}
```

### Métricas de Performance

```typescript
// Medir precisão do timer
const measureTimerAccuracy = () => {
  const expectedTime = calcularTempoDecorrido();
  const displayedTime = tempoDecorrido;
  const diff = Math.abs(expectedTime - displayedTime);
  
  if (diff > 2) { // Mais de 2 segundos de diferença
    console.warn('[Treino] Timer dessincronia:', {
      expected: expectedTime,
      displayed: displayedTime,
      diff,
    });
  }
};
```

## Checklist de Implementação

- [x] Timer baseado em timestamp
- [x] Page Visibility API
- [x] Persistência em 3 camadas
- [x] Auto-save periódico
- [x] Notificações de descanso
- [x] Service Worker registrado
- [x] Remoção de código de minimização
- [x] Testes em múltiplos cenários
- [x] Documentação completa

## Próximos Passos

### Melhorias Futuras

1. **Sincronização entre dispositivos:**
   - Usar Supabase Realtime
   - Atualizar treino em tempo real

2. **Notificações mais ricas:**
   - Ações inline (pular, pausar)
   - Progresso visual na notificação

3. **Modo offline:**
   - Cache de dados com Service Worker
   - Sincronizar quando voltar online

4. **Analytics:**
   - Rastrear uso de background
   - Identificar problemas de sincronização

## Referências

- [Page Visibility API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [Notifications API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Worker API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Best Practices](https://web.dev/pwa/)
