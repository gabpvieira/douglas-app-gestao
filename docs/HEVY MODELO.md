# Sistema de Treino Inspirado no Hevy

## Visão Geral

O Hevy é um aplicativo de treino que se destaca pela simplicidade e eficiência no acompanhamento de exercícios. Este documento detalha o funcionamento do sistema de início de treino, pausas, design e fluxo de usuário.

---

## 1. Fluxo de Início de Treino

### 1.1 Tela Inicial
- **Botão Principal**: "Start Workout" em destaque (geralmente azul ou cor primária do app)
- **Opções**:
  - Iniciar treino vazio (adicionar exercícios durante o treino)
  - Selecionar treino pré-programado da biblioteca
  - Repetir último treino realizado
  - Iniciar treino de um template/rotina

### 1.2 Seleção de Treino
- Lista de treinos organizados por:
  - Treinos recentes
  - Rotinas criadas (ex: "Peito e Tríceps", "Pernas")
  - Templates prontos
- Preview mostrando exercícios incluídos
- Data do último treino realizado

### 1.3 Tela de Treino Ativo
Quando o treino é iniciado:
- **Header fixo** com:
  - Tempo decorrido do treino (cronômetro)
  - Nome do treino
  - Botão de pausa/finalizar
  - Botão de adicionar exercício
- **Corpo da tela**:
  - Lista de exercícios em cards expandíveis
  - Cada exercício mostra séries programadas

---

## 2. Sistema de Séries e Registro

### 2.1 Card de Exercício
Cada exercício é apresentado em um card que contém:
- **Nome do exercício** (com ícone/imagem opcional)
- **Histórico da última vez** (carga e repetições anteriores em texto menor)
- **Tabela de séries** com colunas:
  - SET (número da série)
  - PREVIOUS (série anterior - referência)
  - KG/LBS (peso utilizado)
  - REPS (repetições)
  - Checkbox para marcar série como completa

### 2.2 Preenchimento de Dados
- Campos pré-preenchidos com valores da última execução
- Teclado numérico otimizado para entrada rápida
- Possibilidade de ajustar peso e reps antes de marcar como completo
- Ao marcar checkbox, a série fica destacada (geralmente com fundo verde claro)

### 2.3 Adicionar Série
- Botão "+ Add Set" ao final de cada exercício
- Copia automaticamente os valores da última série como sugestão

---

## 3. Sistema de Pausas (Rest Timer)

### 3.1 Ativação Automática
- Ao completar uma série (marcar checkbox), o timer de descanso inicia automaticamente
- Configuração padrão: 60-90 segundos (personalizável)
- Cada exercício pode ter tempo de descanso específico

### 3.2 Interface do Timer
- **Notificação/Banner** aparece na parte superior ou inferior da tela:
  - Mostra countdown regressivo
  - Design não invasivo (banner fino)
  - Cor neutra que se torna mais vibrante perto do fim
  
- **Opções durante a pausa**:
  - Pular pausa (Skip)
  - Adicionar 30 segundos (+30s)
  - Pausar timer
  
### 3.3 Notificação de Conclusão
- Ao terminar o timer:
  - Vibração do celular (se habilitado)
  - Som sutil (opcional)
  - Banner muda de cor (ex: verde) indicando "Ready"
  - Mensagem: "Rest complete" ou "Ready for next set"

### 3.4 Comportamento Multi-exercício
- Se iniciar outro exercício durante pausa, o timer é cancelado
- Timer é pausado se o app vai para segundo plano
- Opção de continuar timer em background (com notificação push)

---

## 4. Design e UX

### 4.1 Paleta de Cores
- **Background**: Tons escuros (modo noturno padrão) ou claro
- **Destaques**: Azul para ações primárias
- **Sucesso**: Verde para séries completadas
- **Neutro**: Cinza para informações secundárias
- **Alerta**: Amarelo/laranja para avisos

### 4.2 Tipografia
- **Números grandes** para peso e repetições (fácil leitura durante treino)
- **Fonte clara e legível** (sans-serif)
- **Hierarquia visual clara** entre informações principais e secundárias

### 4.3 Componentes Principais

#### Card de Exercício
```
┌─────────────────────────────────────┐
│ 🏋️ Supino Reto                      │
│ Last: 80kg x 10, 10, 8              │
├─────────────────────────────────────┤
│ SET │ PREVIOUS │ KG  │ REPS │ ✓    │
├─────┼──────────┼─────┼──────┼──────┤
│  1  │ 80x10    │ 80  │ 10   │ [✓]  │
│  2  │ 80x10    │ 80  │ 10   │ [ ]  │
│  3  │ 80x8     │ 80  │ 8    │ [ ]  │
├─────────────────────────────────────┤
│         [+ Add Set]                 │
└─────────────────────────────────────┘
```

#### Timer de Descanso
```
┌─────────────────────────────────────┐
│ Rest: 1:30 [Skip] [+30s]           │
└─────────────────────────────────────┘
```

### 4.4 Interações
- **Swipe**: Deslizar para excluir série ou exercício
- **Long press**: Reordenar exercícios
- **Tap rápido**: Marcar série como completa
- **Animações suaves**: Transições entre estados

---

## 5. Funcionalidades Adicionais

### 5.1 Durante o Treino
- **Notas**: Adicionar observações em cada série ou exercício
- **Superset**: Marcar exercícios como conjunto (sem pausa entre eles)
- **Drop set**: Registrar múltiplas cargas na mesma série
- **Failure**: Marcar se a série foi até a falha

### 5.2 Finalizar Treino
- Botão "Finish Workout" sempre visível
- Resumo antes de finalizar:
  - Duração total
  - Exercícios realizados
  - Séries totais
  - Volume total (peso × reps)
- Opção de descartar treino

### 5.3 Após Finalizar
- Tela de resumo completo
- Comparação com treino anterior
- Opção de compartilhar (redes sociais)
- Salvar treino

---

## 6. Configurações Personalizáveis

### 6.1 Timer de Descanso
- Tempo padrão global
- Tempo específico por exercício
- Ativação automática on/off
- Som e vibração

### 6.2 Unidades
- Kg ou Lbs
- Sistema métrico ou imperial

### 6.3 Interface
- Tema escuro/claro
- Tamanho da fonte
- Ordem das colunas na tabela

---

## 7. Considerações Técnicas

### 7.1 Performance
- Salvar dados localmente a cada alteração (evitar perda de dados)
- Sincronização em background quando houver conexão
- App funciona offline

### 7.2 Dados Persistentes
- Histórico completo de treinos
- Gráficos de progresso por exercício
- Records pessoais (PR - Personal Records)

### 7.3 Notificações
- Lembrete de treinar (opcional)
- Timer de descanso em background
- Progresso semanal/mensal

---

## 8. Diferenciais do Hevy

- Interface minimalista e focada
- Entrada de dados extremamente rápida
- Timer de descanso inteligente e não invasivo
- Histórico sempre visível durante o treino
- App responsivo e fluido
- Foco total na experiência durante o treino

---

## Conclusão

O sistema do Hevy prioriza **velocidade, simplicidade e foco** durante o treino. O usuário passa menos tempo mexendo no celular e mais tempo treinando. Cada decisão de design e funcionalidade serve para tornar o registro de treino o mais eficiente poss