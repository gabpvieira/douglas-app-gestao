# 🏋️ PLANEJAMENTO - MODO TREINO ESTILO HEVY

## 🎯 Objetivo
Implementar sistema completo de execução de treino inspirado no Hevy, com registro de séries, timer de descanso, vídeos de execução e salvamento de progresso.

## 📋 Funcionalidades Principais

### 1. Iniciar Treino
- Botão "Iniciar Treino" em cada ficha ativa
- Redireciona para página de execução (`/aluno/treino/:fichaAlunoId`)
- Carrega exercícios da ficha
- Inicia cronômetro do treino

### 2. Tela de Execução
- **Header fixo**:
  - Cronômetro do treino (tempo total)
  - Nome da ficha
  - Botão pausar/finalizar
  - Progresso (X/Y exercícios)

- **Lista de Exercícios**:
  - Cards expandíveis
  - Nome do exercício
  - Botão para ver vídeo
  - Histórico da última execução
  - Tabela de séries

### 3. Registro de Séries
- **Colunas**:
  - SET (número)
  - ANTERIOR (referência)
  - PESO (kg)
  - REPS (repetições)
  - ✓ (checkbox completar)

- **Funcionalidades**:
  - Pré-preencher com valores anteriores
  - Editar peso e reps
  - Marcar como completa
  - Adicionar série extra
  - Remover série

### 4. Timer de Descanso
- Inicia automaticamente ao completar série
- Banner não invasivo no topo/rodapé
- Countdown regressivo
- Botões: Skip, +30s, Pausar
- Notificação ao terminar (vibração opcional)
- Som sutil (opcional)

### 5. Vídeos de Execução
- Botão "Ver Vídeo" em cada exercício
- Modal com player de vídeo
- Busca vídeo por nome do exercício
- Controles: play, pause, fullscreen
- Fechar modal e voltar ao treino

### 6. Finalizar Treino
- Botão "Finalizar Treino" sempre visível
- Modal de confirmação com resumo:
  - Duração total
  - Exercícios realizados
  - Séries completadas
  - Volume total (peso × reps)
- Salvar no banco de dados
- Redirecionar para resumo

### 7. Resumo Pós-Treino
- Tela de parabéns
- Estatísticas completas
- Comparação com treino anterior
- Botão voltar para Meus Treinos

## 🗂️ Estrutura de Arquivos

```
client/src/
├── pages/aluno/
│   ├── TreinoExecucao.tsx          # Página principal de execução
│   └── TreinoResumo.tsx            # Resumo pós-treino
├── components/aluno/
│   ├── ExercicioCard.tsx           # Card de exercício com séries
│   ├── SerieRow.tsx                # Linha da tabela de série
│   ├── RestTimer.tsx               # Banner de timer de descanso
│   ├── TreinoHeader.tsx            # Header com cronômetro
│   └── VideoExercicioModal.tsx     # Modal com vídeo
└── hooks/
    ├── useTreinoExecucao.ts        # Hook para gerenciar treino
    └── useRestTimer.ts             # Hook para timer de descanso
```

## 💾 Estrutura de Dados

### Estado do Treino (Local)
```typescript
interface TreinoEmExecucao {
  fichaAlunoId: string;
  dataInicio: Date;
  exercicios: ExercicioExecucao[];
  tempoDecorrido: number;
  status: 'em_andamento' | 'pausado' | 'finalizado';
}

interface ExercicioExecucao {
  exercicioId: string;
  nome: string;
  grupoMuscular: string;
  videoId?: string;
  seriesRealizadas: SerieRealizada[];
  concluido: boolean;
}

interface SerieRealizada {
  numero: number;
  peso: number;
  repeticoes: number;
  concluida: boolean;
  observacoes?: string;
}
```

### Banco de Dados (Supabase)
Usar tabelas existentes:
- `treinos_realizados`: Registro do treino completo
- `series_realizadas`: Cada série executada

## 🎨 Design (Dark Mode)

### Cores
- Background: `bg-gray-950`
- Cards: `bg-gray-900`
- Série completa: `bg-green-500/10` com borda `border-green-500/20`
- Timer ativo: `bg-blue-500/10`
- Timer completo: `bg-green-500/10`
- Botão primário: `bg-blue-500`
- Botão perigo: `bg-red-500`

### Componentes
- Input numérico grande (fácil digitação)
- Checkbox grande para marcar série
- Botões com feedback visual
- Animações suaves
- Modal de vídeo fullscreen

## 🔄 Fluxo de Usuário

### 1. Iniciar
```
Meus Treinos → Clicar "Iniciar Treino" → Tela de Execução
```

### 2. Durante o Treino
```
Ver exercício → Ver vídeo (opcional) → Preencher série → 
Marcar completa → Timer inicia → Aguardar/Skip → 
Próxima série → Repetir
```

### 3. Finalizar
```
Clicar "Finalizar" → Confirmar → Salvar dados → 
Tela de Resumo → Voltar para Meus Treinos
```

## 📊 Queries Supabase

### Buscar Histórico do Exercício
```sql
SELECT sr.*, tr.data_realizacao
FROM series_realizadas sr
JOIN treinos_realizados tr ON tr.id = sr.treino_realizado_id
WHERE tr.exercicio_id = 'xxx'
  AND tr.ficha_aluno_id = 'xxx'
ORDER BY tr.data_realizacao DESC
LIMIT 1;
```

### Salvar Treino Realizado
```sql
-- 1. Inserir treino_realizado para cada exercício
INSERT INTO treinos_realizados (
  ficha_aluno_id, 
  exercicio_id, 
  data_realizacao, 
  series_realizadas
) VALUES (...);

-- 2. Inserir cada série
INSERT INTO series_realizadas (
  treino_realizado_id,
  numero_serie,
  carga,
  repeticoes,
  concluida
) VALUES (...);
```

### Buscar Vídeo por Nome do Exercício
```sql
SELECT * FROM treinos_video
WHERE LOWER(nome) LIKE LOWER('%nome_exercicio%')
LIMIT 1;
```

## 🚀 Implementação em Fases

### FASE 1: Estrutura Básica ✅
- [x] Criar página TreinoExecucao
- [x] Criar componente TreinoHeader
- [x] Criar componente ExercicioCard
- [x] Listar exercícios da ficha
- [x] Cronômetro do treino

### FASE 2: Registro de Séries
- [ ] Criar componente SerieRow
- [ ] Tabela de séries editável
- [ ] Marcar série como completa
- [ ] Adicionar/remover séries
- [ ] Buscar histórico anterior

### FASE 3: Timer de Descanso
- [ ] Criar componente RestTimer
- [ ] Hook useRestTimer
- [ ] Iniciar automaticamente
- [ ] Botões Skip e +30s
- [ ] Notificação ao terminar

### FASE 4: Vídeos
- [ ] Criar VideoExercicioModal
- [ ] Buscar vídeo por nome
- [ ] Player com controles
- [ ] Abrir/fechar modal

### FASE 5: Finalizar e Salvar
- [ ] Modal de confirmação
- [ ] Calcular estatísticas
- [ ] Salvar no Supabase
- [ ] Página de resumo

### FASE 6: Melhorias
- [ ] Salvar progresso local (localStorage)
- [ ] Recuperar treino interrompido
- [ ] Animações e transições
- [ ] Feedback tátil (vibração)
- [ ] Sons opcionais

## 🎯 Métricas de Sucesso

- Tempo médio para registrar uma série: < 10 segundos
- Taxa de conclusão de treinos: > 80%
- Satisfação do usuário com timer: > 90%
- Uso de vídeos durante treino: > 50%

## 📝 Notas Técnicas

### Performance
- Salvar estado no localStorage a cada alteração
- Debounce em inputs numéricos
- Lazy load de vídeos
- Otimizar re-renders

### Acessibilidade
- Labels claros em inputs
- Feedback visual em ações
- Botões grandes (min 44x44px)
- Contraste adequado

### Mobile First
- Design otimizado para celular
- Inputs numéricos nativos
- Gestos touch-friendly
- Orientação portrait

---

**Próximo Passo**: Implementar FASE 1 - Estrutura Básica
