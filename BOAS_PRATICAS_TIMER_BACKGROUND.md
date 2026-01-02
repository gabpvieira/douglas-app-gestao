# Boas Práticas: Timers em Background e Notificações

## 🎯 Objetivo

Este documento consolida as boas práticas técnicas aprendidas durante a implementação da funcionalidade de minimizar treino, servindo como referência para futuras implementações similares.

## ⏱️ Timers em Background

### ❌ Abordagem Incorreta (Não Usar)

```typescript
// PROBLEMA: setInterval é throttled em background
const [tempo, setTempo] = useState(60);

useEffect(() => {
  const interval = setInterval(() => {
    setTempo(prev => prev - 1); // ❌ Para em background
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

**Por que não funciona?**
- Navegadores reduzem frequência de `setInterval` em abas inativas
- Timer pode executar a cada 1 segundo, 5 segundos, ou até parar completamente
- Tempo fica incorreto após minimizar

### ✅ Abordagem Correta (Usar)

```typescript
// SOLUÇÃO: Timer baseado em timestamp
const [startTime] = useState(() => Date.now());
const [duration] = useState(60);
const [tempoRestante, setTempoRestante] = useState(60);

const calculateTimeRemaining = () => {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  return Math.max(0, duration - elapsed);
};

useEffect(() => {
  const interval = setInterval(() => {
    const remaining = calculateTimeRemaining();
    setTempoRestante(remaining);
    
    if (remaining <= 0) {
      // Timer completou
      onComplete();
    }
  }, 100); // Atualiza a cada 100ms para maior precisão
  
  return () => clearInterval(interval);
}, []);
```

**Por que funciona?**
- Cálculo baseado em `Date.now()` (sempre preciso)
- Não depende da frequência de execução do `setInterval`
- Funciona mesmo se `setInterval` for throttled
- Precisão mantida independente do estado da aba

### 📊 Comparação de Precisão

| Abordagem | Precisão (aba ativa) | Precisão (background) | Confiabilidade |
|-----------|---------------------|----------------------|----------------|
| Contador decremental | ±1s | ❌ Impreciso | Baixa |
| Timestamp-based | ±100ms | ✅ ±100ms | Alta |

## 🔔 Notificações Web

### Solicitar Permissão

```typescript
// ✅ Solicitar apenas uma vez, no momento apropriado
useEffect(() => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}, []); // Apenas no mount

// ❌ Não solicitar repetidamente
// ❌ Não solicitar antes do usuário interagir
```

### Enviar Notificação

```typescript
const sendNotification = (title: string, body: string) => {
  // Verificar suporte e permissão
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-72.png',
      vibrate: [200, 100, 200],
      tag: 'unique-tag', // Evita duplicatas
      requireInteraction: false, // Auto-fecha após alguns segundos
      silent: false, // Permite som do sistema
    });

    // Focar na aba quando clicar
    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }
};
```

### Fallback para Permissões Negadas

```typescript
const alertUser = () => {
  // Tentar notificação primeiro
  if ('Notification' in window && Notification.permission === 'granted') {
    sendNotification('Título', 'Mensagem');
  }
  
  // Sempre tocar som (funciona sem permissão)
  playBeep();
  
  // Vibrar se disponível (funciona sem permissão)
  if (navigator.vibrate) {
    navigator.vibrate([200, 100, 200]);
  }
};
```

## 🔊 Som de Alerta (Web Audio API)

### Implementação Correta

```typescript
const playBeep = () => {
  try {
    // Criar contexto de áudio
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    // Conectar nós
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configurar som
    oscillator.frequency.value = 800; // Hz (tom agradável)
    oscillator.type = "sine"; // Onda senoidal (suave)

    // Configurar volume com fade out
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01, 
      audioContext.currentTime + 0.5
    );

    // Tocar
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (error) {
    console.error('Erro ao tocar som:', error);
    // Não quebrar a aplicação se falhar
  }
};
```

### Boas Práticas de Som

- ✅ Volume moderado (0.3 = 30%)
- ✅ Duração curta (0.5s)
- ✅ Fade out suave (evita corte abrupto)
- ✅ Frequência agradável (800Hz)
- ✅ Try-catch para evitar erros
- ❌ Não usar sons muito altos
- ❌ Não usar sons muito longos
- ❌ Não tocar som em operações frequentes

## 📱 Vibração (Vibration API)

### Implementação

```typescript
const vibrate = () => {
  if (navigator.vibrate) {
    // Padrão: vibra 200ms, pausa 100ms, vibra 200ms
    navigator.vibrate([200, 100, 200]);
  }
};
```

### Compatibilidade

- ✅ Android Chrome/Firefox
- ❌ iOS Safari (não suporta)
- ✅ Sempre verificar disponibilidade

## 📄 Título da Página Dinâmico

### Implementação

```typescript
useEffect(() => {
  const originalTitle = document.title;
  
  // Atualizar título baseado no estado
  if (timerAtivo) {
    document.title = `⏱️ ${formatTime(tempo)} - Descanso`;
  } else if (treinoAtivo) {
    document.title = `💪 ${formatTime(tempoTotal)} - Treino`;
  } else if (pausado) {
    document.title = `⏸️ Treino Pausado`;
  }

  // Restaurar título original ao desmontar
  return () => {
    document.title = originalTitle;
  };
}, [timerAtivo, treinoAtivo, pausado, tempo, tempoTotal]);
```

### Boas Práticas

- ✅ Usar emojis para identificação visual
- ✅ Mostrar tempo atualizado
- ✅ Restaurar título original ao sair
- ✅ Atualizar baseado no estado
- ❌ Não atualizar muito frequentemente (causa flickering)

## 👁️ Page Visibility API

### Detectar Quando Usuário Volta

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (!document.hidden) {
      // Usuário voltou à aba
      // Atualizar estado imediatamente
      setTempo(calculateTimeRemaining());
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, []);
```

### Benefícios

- ✅ Atualização imediata ao voltar
- ✅ Sem delay visual
- ✅ Melhor experiência do usuário

## 💾 Persistência de Estado

### localStorage

```typescript
// Salvar estado
const saveState = (state: TreinoState) => {
  try {
    localStorage.setItem('treino-em-andamento', JSON.stringify(state));
  } catch (error) {
    console.error('Erro ao salvar estado:', error);
  }
};

// Carregar estado
const loadState = (): TreinoState | null => {
  try {
    const saved = localStorage.getItem('treino-em-andamento');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Erro ao carregar estado:', error);
    return null;
  }
};

// Limpar estado
const clearState = () => {
  try {
    localStorage.removeItem('treino-em-andamento');
  } catch (error) {
    console.error('Erro ao limpar estado:', error);
  }
};
```

### Boas Práticas

- ✅ Sempre usar try-catch
- ✅ Validar dados ao carregar
- ✅ Limpar ao finalizar
- ✅ Usar JSON.stringify/parse
- ❌ Não armazenar dados sensíveis
- ❌ Não armazenar dados muito grandes

### Supabase (Backup)

```typescript
// Salvar no servidor (debounced)
const saveToSupabase = useCallback(
  debounce(async (state: TreinoState) => {
    try {
      await supabase
        .from('treinos_em_andamento')
        .upsert({
          aluno_id: state.alunoId,
          ficha_aluno_id: state.fichaAlunoId,
          estado: state,
          updated_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Erro ao salvar no Supabase:', error);
    }
  }, 30000), // Salvar a cada 30 segundos
  []
);
```

### Estratégia de Sincronização

1. **localStorage**: Salvamento imediato (recuperação rápida)
2. **Supabase**: Salvamento debounced (backup e sincronização)
3. **Prioridade**: localStorage primeiro, Supabase como fallback

## 🎨 UI/UX Best Practices

### Feedback Visual

```typescript
// ✅ Indicar estado claramente
{salvando && (
  <div className="flex items-center gap-2 text-sm text-gray-400">
    <Save className="h-4 w-4 animate-pulse" />
    Salvando progresso...
  </div>
)}

// ✅ Animações suaves
<div className="animate-in slide-in-from-bottom-5">
  {/* Conteúdo */}
</div>

// ✅ Estados de loading
{isLoading ? (
  <Spinner />
) : (
  <Content />
)}
```

### Toast/Notificações In-App

```typescript
// ✅ Mensagens claras e concisas
toast({
  title: "Treino minimizado",
  description: "Continue navegando. O timer continuará rodando.",
});

// ❌ Evitar mensagens genéricas
toast({
  title: "Sucesso", // Muito vago
});
```

## 🔒 Segurança e Privacidade

### Dados Sensíveis

```typescript
// ✅ Não armazenar dados sensíveis em localStorage
const state = {
  fichaAlunoId: '123',
  tempoInicio: Date.now(),
  exercicios: [...],
  // ❌ Não incluir: senhas, tokens, dados pessoais
};

// ✅ Limpar dados ao fazer logout
const handleLogout = async () => {
  localStorage.clear();
  await supabase.auth.signOut();
};
```

### Validação de Dados

```typescript
// ✅ Sempre validar dados carregados
const loadState = (): TreinoState | null => {
  try {
    const saved = localStorage.getItem('treino-em-andamento');
    if (!saved) return null;
    
    const state = JSON.parse(saved);
    
    // Validar estrutura
    if (!state.fichaAlunoId || !state.tempoInicio) {
      console.warn('Estado inválido, descartando');
      return null;
    }
    
    return state;
  } catch (error) {
    console.error('Erro ao carregar estado:', error);
    return null;
  }
};
```

## 📊 Performance

### Otimização de Re-renders

```typescript
// ✅ Usar useCallback para funções
const calculateTime = useCallback(() => {
  // Cálculo
}, [dependencies]);

// ✅ Usar useMemo para valores computados
const tempoFormatado = useMemo(() => {
  return formatTime(tempo);
}, [tempo]);

// ✅ Atualizar apenas quando necessário
useEffect(() => {
  if (!ativo) return; // Não atualizar se inativo
  
  const interval = setInterval(() => {
    // Atualização
  }, 100);
  
  return () => clearInterval(interval);
}, [ativo]);
```

### Frequência de Atualização

| Tipo | Frequência | Justificativa |
|------|-----------|---------------|
| Timer de descanso | 100ms | Precisão visual importante |
| Tempo total | 500ms | Suficiente para UX |
| Salvamento local | Imediato | Recuperação rápida |
| Salvamento servidor | 30s | Evitar sobrecarga |

## 🧪 Testes

### Cenários Críticos

```typescript
// 1. Timer em background
test('timer continua contando em background', async () => {
  // Iniciar timer
  // Simular aba inativa
  // Aguardar tempo
  // Verificar precisão
});

// 2. Recuperação de estado
test('estado é recuperado ao recarregar', () => {
  // Salvar estado
  // Simular reload
  // Verificar recuperação
});

// 3. Notificações
test('notificação é enviada quando timer completa', async () => {
  // Iniciar timer
  // Aguardar completar
  // Verificar notificação
});
```

## 📚 Referências

### APIs Utilizadas

1. **Date.now()**: Timestamp preciso
2. **setInterval()**: Atualização periódica
3. **Notifications API**: Notificações do sistema
4. **Web Audio API**: Som customizado
5. **Vibration API**: Feedback tátil
6. **Page Visibility API**: Detectar visibilidade
7. **localStorage**: Persistência local

### Documentação Oficial

- [MDN - Timers](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout)
- [MDN - Notifications](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [MDN - Web Audio](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [MDN - Page Visibility](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)

## ✅ Checklist de Implementação

Ao implementar funcionalidade similar, verificar:

### Timers
- [ ] Usar timestamp-based (não contador)
- [ ] Calcular tempo baseado em Date.now()
- [ ] Atualizar com frequência adequada
- [ ] Funcionar em background

### Notificações
- [ ] Solicitar permissão apropriadamente
- [ ] Implementar fallback (som)
- [ ] Configurar corretamente
- [ ] Focar aba ao clicar

### Persistência
- [ ] Salvar em localStorage
- [ ] Backup em servidor
- [ ] Validar ao carregar
- [ ] Limpar ao finalizar

### UX
- [ ] Feedback visual claro
- [ ] Animações suaves
- [ ] Estados de loading
- [ ] Mensagens informativas

### Performance
- [ ] Otimizar re-renders
- [ ] Frequência adequada
- [ ] Cleanup de recursos
- [ ] Debounce quando necessário

### Testes
- [ ] Timer em background
- [ ] Recuperação de estado
- [ ] Notificações
- [ ] Edge cases

---

**Conclusão**: Seguindo estas boas práticas, você garante que timers e notificações funcionem perfeitamente em background, proporcionando uma experiência confiável e fluida para os usuários.
