# [REMOVIDO] Funcionalidade: Minimizar Treino

> ⚠️ **ATENÇÃO:** Esta funcionalidade foi removida. O treino agora funciona automaticamente em background sem necessidade de minimizar manualmente.
> 
> Ver documentação atualizada em: `REMOCAO_MINIMIZAR_TREINO.md` e `CONFIGURACAO_TREINO_BACKGROUND.md`

---

# Funcionalidade: Minimizar Treino (LEGADO)

## 📋 Visão Geral

A funcionalidade "Minimizar Treino" permite que o aluno reduza a interface de execução do treino para uma **barra flutuante compacta**, possibilitando navegar livremente por outras páginas do aplicativo ou até mesmo usar outros aplicativos/abas do navegador, **sem interromper o treino em andamento**.

## 🎯 Objetivo e Propósito

### Por que existe?
Durante um treino, o aluno pode precisar:
- Consultar vídeos de técnica de outros exercícios
- Verificar seu plano alimentar
- Responder mensagens urgentes
- Usar redes sociais durante o descanso
- Consultar informações em outras abas

**Sem minimizar**: O aluno perderia o contexto do treino, teria que voltar manualmente, e poderia perder o controle do tempo.

**Com minimizar**: O treino continua ativo, visível e acessível de qualquer lugar, com todos os temporizadores funcionando normalmente.

## 🔧 Como Funciona

### 1. Ativação

**Localização**: Durante a execução do treino, logo abaixo do cabeçalho  
**Botão**: "Minimizar Treino" com ícone de minimizar (Minimize2)

```typescript
<Button onClick={handleMinimizar}>
  <Minimize2 className="h-4 w-4" />
  Minimizar Treino
</Button>
```

**Ação ao clicar**:
1. Interface completa do treino é ocultada
2. Barra flutuante compacta aparece no canto inferior direito
3. Toast de confirmação: "Treino minimizado - Continue navegando. O timer continuará rodando."

### 2. Barra Flutuante (Modo Minimizado)

**Aparência**:
- Posição: Canto inferior direito da tela
- Tamanho: ~280px de largura, altura variável
- Estilo: Fundo com gradiente, backdrop blur, borda com cor primária
- Animação: Slide suave de entrada (slide-in-from-bottom-5)
- Z-index: 50 (sempre visível sobre outros elementos)

**Informações Exibidas**:

#### Cabeçalho
- Nome da ficha de treino
- Status: "Em andamento" ou "Pausado"
- Botão de expandir (ícone Maximize2)

#### Tempo Total
- Label: "Tempo Total"
- Valor: Tempo decorrido desde o início do treino
- Formato: MM:SS ou H:MM:SS (se > 1 hora)
- Atualização: A cada 500ms (mesmo em background)

#### Timer de Descanso (quando ativo)
- Fundo: Verde esmeralda com animação pulse
- Label: "Descansando"
- Nome do exercício atual
- Tempo restante em destaque
- Formato: MM:SS

#### Controles
- **Botão Pausar/Retomar**: Alterna entre pausar e retomar o treino
- **Botão "Ver Treino"**: Expande de volta para a interface completa

### 3. Comportamento dos Temporizadores

#### ⏱️ Tempo Total do Treino

**Tecnologia**: Timer baseado em timestamp (não em contador)

```typescript
// Salva o momento de início
const inicio = new Date(treinoEmAndamento.tempoInicio);

// Calcula tempo decorrido baseado na diferença
const agora = new Date();
const diffSegundos = Math.floor((agora.getTime() - inicio.getTime()) / 1000);
const tempoTotal = tempoAcumulado + diffSegundos;
```

**Características**:
- ✅ Continua contando mesmo com app minimizado
- ✅ Continua contando em outra aba do navegador
- ✅ Continua contando com tela do celular bloqueada
- ✅ Precisão mantida independente do estado da aba
- ✅ Atualização visual a cada 500ms quando visível
- ✅ Sincronizado via localStorage e Supabase

**Quando pausado**:
- Timer congela no tempo atual
- Tempo acumulado é salvo
- Ao retomar, continua de onde parou

#### ⏱️ Timer de Descanso entre Séries

**Tecnologia**: Timer baseado em timestamp (não em contador)

```typescript
// Salva o momento de início do descanso
const [startTime] = useState(() => Date.now());
const [duration] = useState(tempoInicial);

// Calcula tempo restante baseado na diferença
const elapsed = Math.floor((Date.now() - startTime) / 1000);
const remaining = Math.max(0, duration - elapsed);
```

**Características**:
- ✅ Continua contando em background (app minimizado)
- ✅ Continua contando em outra aba
- ✅ Precisão de 100ms (atualiza a cada 100ms)
- ✅ Não é afetado por throttling do navegador
- ✅ Funciona mesmo com tela bloqueada

**Quando completa**:
1. **Notificação do Sistema**: "Descanso Completo! 💪"
2. **Som de alerta**: Beep gerado via Web Audio API
3. **Vibração**: 200ms, pausa 100ms, 200ms (em dispositivos móveis)
4. **Título da página**: Atualizado para indicar conclusão
5. **Auto-fechamento**: Após 3 segundos (pode ser pulado manualmente)

### 4. Notificações e Alertas

#### Notificação Web (Notifications API)

**Permissão**:
- Solicitada automaticamente no primeiro treino
- Apenas uma vez (não incomoda o usuário)
- Pode ser reativada nas configurações do navegador

**Conteúdo da Notificação**:
```
Título: "Descanso Completo! 💪"
Corpo: "Pronto para a próxima série de [Nome do Exercício]"
Ícone: /icon-192.png
Badge: /icon-72.png
Vibração: [200, 100, 200]
```

**Interação**:
- Clicar na notificação: Foca na aba do aplicativo
- Notificação fecha automaticamente após interação

**Compatibilidade**:
- ✅ Chrome Desktop/Android
- ✅ Firefox Desktop/Android
- ✅ Edge Desktop
- ⚠️ Safari iOS (suporte limitado)

#### Som de Alerta (Web Audio API)

**Características**:
- Frequência: 800Hz (tom agradável)
- Duração: 0.5 segundos
- Volume: 30% (não assusta)
- Tipo: Onda senoidal (som suave)
- Fade out: Exponencial para evitar corte abrupto

**Quando toca**:
- Ao completar o timer de descanso
- Independente de notificações (funciona mesmo se negadas)

#### Vibração (Vibration API)

**Padrão**: 200ms, pausa 100ms, 200ms  
**Dispositivos**: Apenas Android (iOS não suporta)  
**Uso**: Alerta tátil quando descanso completa

#### Título da Página (Document Title)

**Estados**:
- Treino ativo: `💪 [tempo] - Treino` (ex: "💪 5:23 - Treino")
- Descanso ativo: `⏱️ [tempo] - Descanso` (ex: "⏱️ 0:45 - Descanso")
- Treino pausado: `⏸️ Treino Pausado`

**Benefício**: Usuário vê o tempo na aba do navegador sem precisar abrir

### 5. Navegação e Persistência

#### Navegação Livre
- Aluno pode ir para qualquer página do app
- Barra flutuante permanece visível
- Estado do treino é preservado
- Temporizadores continuam funcionando

#### Persistência de Estado

**localStorage**:
```typescript
{
  fichaAlunoId: string,
  nomeFicha: string,
  tempoInicio: string, // ISO timestamp
  tempoAcumulado: number, // segundos
  pausado: boolean,
  exercicios: ExercicioEmAndamento[],
  alunoId: string
}
```

**Supabase** (salvamento automático):
- A cada 30 segundos (se houver mudanças)
- Ao pausar o treino
- Ao sair da página
- Ao finalizar o treino

**Recuperação**:
- Ao recarregar a página: Treino é retomado automaticamente
- Ao fechar e reabrir o navegador: Treino continua de onde parou
- Ao trocar de dispositivo: Sincronizado via Supabase

### 6. Expandir de Volta

**Formas de expandir**:
1. Clicar no botão "Ver Treino" na barra flutuante
2. Clicar no ícone de maximizar (Maximize2) no cabeçalho da barra

**Ação ao expandir**:
1. Barra flutuante desaparece
2. Interface completa do treino é restaurada
3. Estado exato é mantido (séries, pesos, tempo, etc.)
4. Nenhuma informação é perdida

## 🎨 Experiência do Usuário

### Fluxo Típico

```
1. Aluno inicia treino
   ↓
2. Completa primeira série de supino
   ↓
3. Timer de 90s inicia
   ↓
4. Aluno clica em "Minimizar Treino"
   ↓
5. Barra flutuante aparece no canto
   ↓
6. Aluno abre Instagram em outra aba
   ↓
7. Após 90s, recebe notificação
   ↓
8. Clica na notificação
   ↓
9. Volta ao app automaticamente
   ↓
10. Clica em "Ver Treino"
    ↓
11. Interface completa é restaurada
    ↓
12. Faz próxima série
```

### Casos de Uso Reais

#### Caso 1: Consultar Vídeo de Técnica
```
Problema: Aluno quer ver vídeo de outro exercício durante o treino
Solução: Minimiza treino → Navega para "Vídeos" → Assiste vídeo → 
         Barra flutuante mostra tempo → Volta ao treino quando pronto
```

#### Caso 2: Responder Mensagem Urgente
```
Problema: Aluno recebe mensagem importante durante descanso
Solução: Minimiza treino → Abre WhatsApp em outra aba → 
         Responde mensagem → Notificação avisa quando descanso acabar → 
         Volta ao treino
```

#### Caso 3: Treino Longo com Múltiplas Pausas
```
Problema: Treino de 60+ minutos com várias pausas para água/banheiro
Solução: Minimiza entre séries → Tempo total continua contando → 
         Notificações mantêm o ritmo → Tempo final sempre preciso
```

## 🔒 Garantias Técnicas

### O que NÃO acontece ao minimizar:

❌ Timer de descanso NÃO pausa  
❌ Tempo total NÃO para de contar  
❌ Estado do treino NÃO é perdido  
❌ Séries completadas NÃO são esquecidas  
❌ Pesos e repetições NÃO são apagados  
❌ Progresso NÃO é resetado  

### O que CONTINUA funcionando:

✅ Timer de descanso conta normalmente  
✅ Tempo total continua acumulando  
✅ Notificações são enviadas quando necessário  
✅ Estado é salvo automaticamente  
✅ Sincronização com servidor continua  
✅ Título da página é atualizado  

### Precisão dos Temporizadores

**Timer de Descanso**:
- Precisão: ±100ms
- Atualização visual: A cada 100ms
- Método: Timestamp-based (Date.now())
- Funciona em background: ✅

**Tempo Total**:
- Precisão: ±500ms
- Atualização visual: A cada 500ms
- Método: Timestamp-based (Date.now())
- Funciona em background: ✅

## 🛠️ Implementação Técnica

### Componentes Envolvidos

1. **TreinoExecucao.tsx** (Página principal)
   - Gerencia estado `minimizado`
   - Renderiza MinimizedWorkout quando minimizado
   - Controla transição entre modos

2. **MinimizedWorkout.tsx** (Barra flutuante)
   - Exibe informações compactas
   - Atualiza título da página
   - Fornece controles básicos

3. **RestTimer.tsx** (Timer de descanso)
   - Timer baseado em timestamp
   - Envia notificações
   - Toca som e vibra

4. **useTreinoEmAndamento.ts** (Hook de estado)
   - Gerencia estado global do treino
   - Persiste em localStorage e Supabase
   - Calcula tempo decorrido

### APIs Utilizadas

1. **Page Visibility API**
   - Detecta quando usuário volta à aba
   - Atualiza tempo imediatamente
   - Evita delay visual

2. **Notifications API**
   - Notificações do sistema operacional
   - Solicita permissão uma vez
   - Funciona em background

3. **Web Audio API**
   - Gera som de alerta
   - Controle de volume e duração
   - Fade out suave

4. **Vibration API**
   - Alerta tátil em dispositivos móveis
   - Padrão customizável
   - Apenas Android

5. **localStorage**
   - Persistência local do estado
   - Recuperação rápida
   - Sincronização entre abas

6. **Supabase Realtime** (futuro)
   - Sincronização entre dispositivos
   - Backup automático
   - Recuperação de desastres

## 📊 Métricas e Monitoramento

### Eventos Rastreados (futuro)

- `treino_minimizado`: Quando aluno minimiza
- `treino_expandido`: Quando aluno expande
- `notificacao_enviada`: Quando notificação é disparada
- `notificacao_clicada`: Quando usuário clica na notificação
- `timer_completado_background`: Timer completa em background

### Métricas de Sucesso

- Taxa de uso da funcionalidade de minimizar
- Tempo médio em modo minimizado
- Taxa de retorno após notificação
- Precisão dos temporizadores (diferença esperado vs real)

## 🐛 Problemas Conhecidos e Limitações

### iOS Safari
**Problema**: Notificações web têm suporte limitado  
**Impacto**: Notificações podem não aparecer  
**Workaround**: Som e vibração funcionam normalmente  
**Status**: Limitação da plataforma

### Múltiplas Abas
**Problema**: Abrir treino em 2 abas pode causar conflito  
**Impacto**: Estado pode ficar dessincronizado  
**Workaround**: Detectar e avisar usuário  
**Status**: Planejado para próxima versão

### Permissões Negadas
**Problema**: Usuário pode negar notificações  
**Impacto**: Apenas som tocará  
**Workaround**: Timer continua funcionando, som alerta  
**Status**: Comportamento esperado

## 🚀 Melhorias Futuras

### Fase 1 (Implementado) ✅
- Timer baseado em timestamp
- Notificações web
- Modo minimizado
- Som e vibração
- Título da página dinâmico

### Fase 2 (Planejado)
- Service Worker para timer persistente
- Notificações push (app fechado)
- Sincronização entre dispositivos
- Detecção de múltiplas abas

### Fase 3 (Futuro)
- Wake Lock API (manter tela ligada)
- Configurações personalizadas
- Sons customizados
- Estatísticas de descanso
- Widget de treino (PWA)

## 📚 Referências Técnicas

- [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API)
- [Notifications API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [Timer Throttling in Chrome](https://developer.chrome.com/blog/timer-throttling-in-chrome-88/)

## ✅ Critérios de Aceitação

### Funcionalidade
- [x] Botão "Minimizar Treino" visível e funcional
- [x] Barra flutuante aparece ao minimizar
- [x] Barra flutuante mostra tempo total
- [x] Barra flutuante mostra timer de descanso
- [x] Controles de pausar/retomar funcionam
- [x] Botão "Ver Treino" expande de volta

### Temporizadores
- [x] Tempo total continua em background
- [x] Timer de descanso continua em background
- [x] Notificação enviada quando descanso completa
- [x] Som toca quando descanso completa
- [x] Vibração funciona (Android)
- [x] Título da página atualiza com tempo

### Persistência
- [x] Estado salvo em localStorage
- [x] Estado salvo em Supabase
- [x] Treino recuperado ao recarregar
- [x] Nenhuma informação perdida

### UX
- [x] Transição suave entre modos
- [x] Feedback visual claro
- [x] Toast de confirmação ao minimizar
- [x] Animação de entrada da barra
- [x] Responsivo em mobile

## 🎓 Guia para Usuários

### Como Usar

1. **Iniciar treino normalmente**
2. **Clicar em "Minimizar Treino"** (botão abaixo do cabeçalho)
3. **Navegar livremente** (outras páginas, abas, apps)
4. **Aguardar notificação** quando descanso acabar
5. **Clicar em "Ver Treino"** para voltar

### Dicas

💡 Use durante o descanso para checar redes sociais  
💡 Minimize para consultar vídeos de técnica  
💡 Deixe minimizado enquanto bebe água  
💡 O tempo total sempre será preciso  
💡 Notificações te avisam quando voltar  

### Solução de Problemas

**Notificações não aparecem?**
- Verifique permissões do navegador
- Som continuará funcionando normalmente

**Tempo parece errado?**
- Recarregue a página
- Estado é recuperado automaticamente

**Barra flutuante sumiu?**
- Volte para a página do treino
- Estado está salvo e seguro

---

**Resumo**: A funcionalidade de minimizar treino permite que o aluno mantenha o treino ativo e visível enquanto navega livremente, com todos os temporizadores funcionando perfeitamente em segundo plano e notificações garantindo que ele nunca perca o ritmo do treino.
