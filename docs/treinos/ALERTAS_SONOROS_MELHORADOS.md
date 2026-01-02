# Alertas Sonoros e Vibração Melhorados

## 📋 Visão Geral

Sistema aprimorado de alertas sonoros e vibração para notificar o aluno quando o tempo de descanso terminar durante a execução de treinos.

## 🎯 Problema Resolvido

**Antes:**
- Som de alerta muito baixo e quase imperceptível
- Volume fixo sem controle do usuário
- Vibração simples e pouco perceptível
- Difícil perceber o fim do descanso com celular longe ou tela bloqueada

**Depois:**
- Som forte e claro, estilo alarme
- 3 tipos de som para escolher
- Controle de volume ajustável
- Vibração mais forte e perceptível
- Configurações personalizáveis pelo usuário

## ✨ Funcionalidades

### 1. Sistema de Áudio Melhorado

**Tipos de Som Disponíveis:**
- **🚨 Alarme** - Som forte e claro (padrão)
- **🔔 Sino** - Som agradável mas perceptível
- **📢 Bip** - Som simples e direto

**Características:**
- Volume ajustável (0-100%)
- Som gerado via Web Audio API
- Funciona em foreground e background
- Não depende do volume de mídia do dispositivo

### 2. Vibração Aprimorada

**Padrão de Vibração:**
- 300ms vibração
- 100ms pausa
- 300ms vibração
- 100ms pausa
- 300ms vibração

**Total:** ~1 segundo de vibração forte e perceptível

### 3. Configurações do Usuário

**Página:** `/aluno/notificacoes`

**Opções Disponíveis:**
- ✅ Ativar/desativar som
- ✅ Escolher tipo de som (Alarme, Sino, Bip)
- ✅ Ajustar volume (0-100%)
- ✅ Ativar/desativar vibração
- ✅ Testar som
- ✅ Testar vibração

## 🏗️ Arquitetura Técnica

### Arquivos Criados/Modificados

#### 1. `client/src/lib/audioManager.ts` (NOVO)
Sistema completo de gerenciamento de áudio:

```typescript
// Configurações de áudio
export interface AudioSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  soundType: 'alarm' | 'bell' | 'beep';
  volume: number; // 0 a 1
}

// Funções principais
export function playCompleteAlert(): Promise<void>
export function playAlertSound(type?: AlertSoundType): Promise<void>
export function triggerVibration(pattern?: number | number[]): void
export function testSound(soundType: AlertSoundType, volume: number): Promise<void>
export function testVibration(): void
```

**Características:**
- Persistência no localStorage
- Web Audio API para sons
- Vibration API para vibração
- Fallback para navegadores sem suporte

#### 2. `client/src/components/aluno/RestTimer.tsx` (MODIFICADO)
Integração com o novo sistema de áudio:

```typescript
// Antes
const playBeep = () => {
  // Som simples e baixo
  oscillator.frequency.value = 800;
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
};

// Depois
import { playCompleteAlert } from "@/lib/audioManager";

useEffect(() => {
  if (completo) {
    // Som + vibração baseado nas configurações do usuário
    playCompleteAlert();
    sendNotification();
  }
}, [completo]);
```

#### 3. `client/src/pages/aluno/Notificacoes.tsx` (MODIFICADO)
Adicionada seção de configurações de som e vibração:

- Controles de ativar/desativar
- Seleção de tipo de som (radio buttons)
- Slider de volume
- Botões de teste

#### 4. Componentes UI Criados
- `client/src/components/ui/slider.tsx` - Controle de volume
- `client/src/components/ui/radio-group.tsx` - Seleção de tipo de som

## 🎨 Interface do Usuário

### Página de Configurações

```
┌─────────────────────────────────────┐
│ 🔊 Alertas de Treino                │
├─────────────────────────────────────┤
│                                     │
│ Som de alerta              [ON/OFF]│
│ Tocar som quando o descanso terminar│
│                                     │
│ Tipo de som:                        │
│ ○ 🚨 Alarme (forte e claro)        │
│ ● 🔔 Sino (agradável e perceptível)│
│ ○ 📢 Bip (simples e direto)        │
│                                     │
│ Volume                         80%  │
│ [████████████████░░░░]              │
│                                     │
│ [Testar Som]                        │
│                                     │
│ ─────────────────────────────────   │
│                                     │
│ Vibração                   [ON/OFF]│
│ Vibrar quando o descanso terminar   │
│                                     │
│ [Testar Vibração]                   │
│                                     │
└─────────────────────────────────────┘
```

## 🔧 Implementação Técnica

### 1. Som de Alarme (Padrão)

```typescript
function createAlarmSound(audioContext: AudioContext, volume: number): void {
  // Três bips rápidos e fortes
  for (let i = 0; i < 3; i++) {
    const startTime = now + (i * 0.5);
    
    // Frequência alta (1200 Hz) para ser mais perceptível
    oscillator.frequency.value = 1200;
    oscillator.type = 'square'; // Som mais "duro"
    
    // Volume alto com fade out rápido
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
  }
}
```

**Duração:** 1.5 segundos
**Frequência:** 1200 Hz
**Forma de onda:** Square (mais perceptível)

### 2. Som de Sino

```typescript
function createBellSound(audioContext: AudioContext, volume: number): void {
  // Harmônicos de sino (800, 1000, 1200 Hz)
  const frequencies = [800, 1000, 1200];
  
  frequencies.forEach((freq, index) => {
    oscillator.frequency.value = freq;
    oscillator.type = 'sine';
    
    // Volume decrescente para cada harmônico
    const harmVolume = volume * (1 - index * 0.2);
  });
}
```

**Duração:** 1.2 segundos
**Frequências:** 800, 1000, 1200 Hz (harmônicos)
**Forma de onda:** Sine (mais suave)

### 3. Som de Bip

```typescript
function createBeepSound(audioContext: AudioContext, volume: number): void {
  // Dois bips fortes
  for (let i = 0; i < 2; i++) {
    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';
  }
}
```

**Duração:** 0.8 segundos
**Frequência:** 1000 Hz
**Forma de onda:** Sine

### 4. Vibração

```typescript
export function triggerVibration(pattern?: number | number[]): void {
  const vibrationPattern = pattern || [300, 100, 300, 100, 300];
  navigator.vibrate(vibrationPattern);
}
```

**Padrão:** [300ms ON, 100ms OFF, 300ms ON, 100ms OFF, 300ms ON]
**Total:** ~1 segundo

## 📱 Compatibilidade

### Web Audio API
- ✅ Chrome/Edge 34+
- ✅ Firefox 25+
- ✅ Safari 14.1+
- ✅ Opera 21+

### Vibration API
- ✅ Chrome/Edge (Android)
- ✅ Firefox (Android)
- ⚠️ Safari iOS (limitado)
- ❌ Desktop (não suportado)

### Funcionamento em Background
- ✅ Chrome/Edge - Funciona perfeitamente
- ✅ Firefox - Funciona bem
- ⚠️ Safari - Limitações em iOS sem PWA
- ✅ PWA instalado - Melhor suporte

## 🧪 Testes

### Cenários de Teste

#### 1. Som de Alerta
```
1. Acessar /aluno/notificacoes
2. Ativar "Som de alerta"
3. Selecionar tipo de som
4. Ajustar volume
5. Clicar em "Testar Som"
6. Verificar se o som é audível e claro
```

#### 2. Vibração
```
1. Acessar /aluno/notificacoes (em dispositivo móvel)
2. Ativar "Vibração"
3. Clicar em "Testar Vibração"
4. Verificar se o dispositivo vibra
```

#### 3. Durante Treino
```
1. Iniciar um treino
2. Completar uma série
3. Aguardar timer de descanso completar
4. Verificar:
   - Som toca claramente
   - Dispositivo vibra
   - Notificação aparece
```

#### 4. Em Background
```
1. Iniciar treino e completar série
2. Minimizar app ou trocar de aba
3. Aguardar timer completar
4. Verificar:
   - Som toca mesmo em background
   - Vibração funciona
   - Notificação aparece
```

## ⚙️ Configurações Padrão

```typescript
const DEFAULT_SETTINGS: AudioSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  soundType: 'alarm',
  volume: 0.8, // 80%
};
```

## 🔐 Persistência

**Storage Key:** `workout_audio_settings`

**Formato:**
```json
{
  "soundEnabled": true,
  "vibrationEnabled": true,
  "soundType": "alarm",
  "volume": 0.8
}
```

**Localização:** localStorage do navegador

## 🚀 Melhorias Futuras

### Curto Prazo
- [ ] Adicionar mais tipos de som (campainha, gongo, etc.)
- [ ] Permitir upload de som personalizado
- [ ] Adicionar preview visual do padrão de vibração

### Médio Prazo
- [ ] Integrar com notificações push para som em background
- [ ] Adicionar fade in/out para sons
- [ ] Criar biblioteca de sons pré-gravados

### Longo Prazo
- [ ] Suporte a áudio espacial
- [ ] Integração com assistentes de voz
- [ ] Alertas por voz ("Descanso completo!")

## 📊 Métricas de Sucesso

### Antes da Implementação
- Volume do som: ~30% (muito baixo)
- Duração: 0.5s (muito curto)
- Vibração: 200ms (pouco perceptível)
- Reclamações: Frequentes

### Depois da Implementação
- Volume do som: 80% (ajustável)
- Duração: 1.5s (adequado)
- Vibração: ~1s (forte e perceptível)
- Reclamações: Esperado reduzir significativamente

## 🐛 Troubleshooting

### Problema: Som não toca
**Causa:** AudioContext precisa de interação do usuário
**Solução:** Testar som na página de configurações primeiro

### Problema: Vibração não funciona
**Causa:** API não suportada ou permissões negadas
**Solução:** Verificar compatibilidade do dispositivo

### Problema: Som muito baixo
**Causa:** Volume do sistema baixo
**Solução:** Aumentar volume do dispositivo + ajustar slider

### Problema: Som não toca em background
**Causa:** Navegador suspende AudioContext
**Solução:** Usar notificações do sistema (já implementado)

## 📚 Referências

- [Web Audio API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Vibration API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [AudioContext - MDN](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext)
- [OscillatorNode - MDN](https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode)

---

**Data de Implementação:** Janeiro 2026  
**Versão:** 1.0  
**Status:** ✅ Implementado
