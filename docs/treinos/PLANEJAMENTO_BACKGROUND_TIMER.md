# Planejamento: Timer em Segundo Plano e Minimização de Treino

## Problema Identificado

O cronômetro de descanso entre séries está pausando quando o app vai para segundo plano (usuário minimiza ou troca de aba). Isso acontece porque:

1. **`setInterval` é throttled em background**: Navegadores reduzem a frequência de execução de timers quando a aba não está ativa
2. **Sem persistência de estado**: O timer não salva quando iniciou, apenas conta regressivamente
3. **Falta de notificações**: Não há alertas quando o tempo acaba em background

## Solução Proposta

### 1. Timer Baseado em Timestamp (Não em Contador)

Em vez de decrementar um contador a cada segundo, vamos:
- Salvar o **timestamp de início** e **duração total**
- Calcular tempo restante baseado na diferença entre `Date.now()` e o início
- Funciona mesmo se o app ficar em background por minutos

### 2. Web Notifications API

Quando o timer completar em background:
- Enviar notificação do sistema operacional
- Tocar som de alerta
- Vibrar (em dispositivos móveis)

### 3. Service Worker para Background

Usar Service Worker para:
- Manter timer rodando mesmo com app fechado
- Enviar notificações push quando tempo acabar
- Sincronizar estado entre abas

### 4. Modo Minimizado

Adicionar botão "Minimizar Treino" que:
- Reduz a interface para uma barra flutuante compacta
- Mostra apenas tempo total e timer de descanso ativo
- Permite ao usuário navegar em outras abas/apps
- Pode ser expandido novamente com um clique

### 5. Wake Lock API (Opcional)

Prevenir que a tela desligue durante o treino:
- Usar `navigator.wakeLock.request('screen')`
- Manter tela ligada durante descanso ativo
- Liberar quando treino pausado

## Arquitetura Técnica

### Componentes a Modificar

1. **RestTimer.tsx**
   - Mudar de contador para timestamp-based
   - Adicionar suporte a notificações
   - Integrar com Service Worker

2. **TreinoExecucao.tsx**
   - Adicionar modo minimizado
   - Gerenciar permissões de notificação
   - Controlar Wake Lock

3. **Service Worker (sw.js)**
   - Adicionar handler para timers em background
   - Gerenciar notificações push
   - Sincronizar estado com página

4. **useTreinoEmAndamento.ts**
   - Salvar estado de timers ativos
   - Persistir timestamps no localStorage e DB

### Fluxo de Dados

```
Usuário completa série
  ↓
RestTimer inicia com timestamp
  ↓
Estado salvo em localStorage + DB
  ↓
Service Worker monitora tempo
  ↓
Quando completa:
  - Notificação do sistema
  - Som de alerta
  - Vibração
  ↓
Usuário retorna ao app
  ↓
Timer mostra "Completo!"
```

## Implementação por Etapas

### Fase 1: Timer Baseado em Timestamp ✅
- [ ] Refatorar RestTimer para usar timestamps
- [ ] Testar precisão em background
- [ ] Garantir que funciona após minimizar

### Fase 2: Notificações Web ✅
- [ ] Solicitar permissão de notificação
- [ ] Enviar notificação quando timer completar
- [ ] Adicionar som e vibração
- [ ] Testar em diferentes navegadores

### Fase 3: Service Worker ✅
- [ ] Atualizar sw.js com handler de timers
- [ ] Implementar comunicação página ↔ SW
- [ ] Sincronizar estado entre abas
- [ ] Testar com app fechado

### Fase 4: Modo Minimizado ✅
- [ ] Criar componente MinimizedWorkout
- [ ] Adicionar botão de minimizar
- [ ] Implementar barra flutuante
- [ ] Permitir expandir novamente

### Fase 5: Wake Lock (Opcional) ⚠️
- [ ] Implementar Wake Lock durante descanso
- [ ] Liberar quando pausado
- [ ] Adicionar toggle nas configurações

## Considerações de UX

### Permissões
- Solicitar permissão de notificação no primeiro treino
- Explicar benefício: "Receba alertas quando o descanso acabar"
- Permitir desabilitar nas configurações

### Feedback Visual
- Indicador claro quando timer está ativo em background
- Badge ou ícone na aba do navegador
- Animação ao retornar mostrando tempo decorrido

### Modo Minimizado
- Barra flutuante no canto inferior
- Mostra: tempo total + timer descanso
- Botão para expandir
- Não bloqueia interação com outras páginas

### Fallback
- Se notificações negadas, usar apenas som
- Se Service Worker não suportado, usar apenas timestamp
- Sempre funcionar, mesmo sem recursos avançados

## Testes Necessários

1. **Timer em Background**
   - Minimizar app por 2 minutos
   - Verificar se tempo continua correto
   - Confirmar notificação aparece

2. **Múltiplas Abas**
   - Abrir treino em 2 abas
   - Verificar sincronização
   - Testar conflitos de estado

3. **App Fechado**
   - Fechar navegador durante descanso
   - Reabrir após tempo acabar
   - Verificar estado correto

4. **Dispositivos Móveis**
   - Testar em iOS Safari
   - Testar em Android Chrome
   - Verificar vibração e notificações

5. **Modo Minimizado**
   - Minimizar e navegar em outras páginas
   - Verificar que não interfere
   - Testar expandir/minimizar múltiplas vezes

## Código de Exemplo

### Timer Baseado em Timestamp

```typescript
interface TimerState {
  startTime: number; // timestamp em ms
  duration: number; // duração em segundos
  active: boolean;
}

const calculateTimeRemaining = (state: TimerState): number => {
  if (!state.active) return state.duration;
  
  const elapsed = (Date.now() - state.startTime) / 1000;
  const remaining = Math.max(0, state.duration - elapsed);
  
  return Math.floor(remaining);
};
```

### Notificação Web

```typescript
const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
};

const sendNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      vibrate: [200, 100, 200],
      tag: 'rest-timer',
      requireInteraction: true,
    });
  }
};
```

### Service Worker Message

```typescript
// Em sw.js
self.addEventListener('message', (event) => {
  if (event.data.type === 'START_TIMER') {
    const { duration, exerciseName } = event.data;
    
    setTimeout(() => {
      self.registration.showNotification('Descanso Completo!', {
        body: `Pronto para a próxima série de ${exerciseName}`,
        icon: '/icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'rest-timer',
      });
    }, duration * 1000);
  }
});
```

### Modo Minimizado

```typescript
const MinimizedWorkout = ({ 
  tempoTotal, 
  timerAtivo, 
  onExpand 
}: MinimizedWorkoutProps) => {
  return (
    <div className="fixed bottom-4 right-4 bg-card border rounded-lg shadow-lg p-3 z-50">
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <div className="font-semibold">Treino em andamento</div>
          <div className="text-muted-foreground">{formatTime(tempoTotal)}</div>
        </div>
        
        {timerAtivo && (
          <div className="text-primary font-bold">
            {formatTime(timerAtivo.remaining)}
          </div>
        )}
        
        <Button size="sm" onClick={onExpand}>
          Expandir
        </Button>
      </div>
    </div>
  );
};
```

## Priorização

### Must Have (Fase 1 e 2)
- Timer baseado em timestamp
- Notificações web básicas
- Som de alerta

### Should Have (Fase 3 e 4)
- Service Worker
- Modo minimizado
- Sincronização entre abas

### Nice to Have (Fase 5)
- Wake Lock
- Notificações push avançadas
- Configurações personalizadas

## Próximos Passos

1. Implementar Fase 1 (Timer Timestamp)
2. Testar em diferentes cenários
3. Implementar Fase 2 (Notificações)
4. Solicitar feedback do Douglas e alunos
5. Iterar baseado no uso real
6. Implementar fases 3-5 conforme necessidade

## Referências

- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Wake Lock API](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API)
