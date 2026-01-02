# Planejamento: Progresso de Treinos - Painel Admin

## 📋 Visão Geral

Sistema completo para o personal trainer visualizar e acompanhar o progresso de treinos dos alunos, com ranking semanal, estatísticas individuais e geração automática de mensagens motivacionais para compartilhar no WhatsApp.

**Inspiração**: MFIT Personal - Sistema de gamificação e reconhecimento de alunos destaque.

---

## 🎯 Objetivos

1. **Visualização Individual**: Ver progresso detalhado de cada aluno
2. **Ranking Semanal**: Identificar alunos destaque da semana
3. **Motivação**: Gerar mensagens prontas para compartilhar no grupo
4. **Análise**: Estatísticas de frequência, consistência e engajamento
5. **Premiação**: Base de dados para criar sistema de recompensas

---

## 📊 Estrutura de Dados

### Dados Existentes (já implementados)
```typescript
// Tabela: treinos_realizados
{
  id: string
  ficha_aluno_id: string
  exercicio_id: string
  data_realizacao: timestamp
  series_realizadas: number
  observacoes: string
}

// Tabela: fichas_alunos
{
  id: string
  ficha_id: string
  aluno_id: string
  data_inicio: date
  data_fim: date
  status: string
}
```

### Métricas Calculadas
```typescript
interface MetricasAluno {
  alunoId: string
  nome: string
  fotoUrl: string | null
  
  // Semana Atual
  diasTreinadosSemana: number
  treinosRealizadosSemana: number
  exerciciosCompletadosSemana: number
  
  // Histórico
  sequenciaAtual: number // dias consecutivos
  melhorSequencia: number
  totalTreinosRealizados: number
  
  // Engajamento
  taxaFrequencia: number // % de dias treinados na semana
  mediaExerciciosPorTreino: number
  ultimoTreino: Date | null
}

interface RankingSemanal {
  periodo: {
    inicio: Date
    fim: Date
  }
  alunos: AlunoDestaque[]
  criterio: 'dias_consecutivos' | 'total_treinos' | 'exercicios'
}

interface AlunoDestaque {
  posicao: number
  alunoId: string
  nome: string
  fotoUrl: string | null
  pontuacao: number
  diasTreinados: number
  treinosRealizados: number
  badge: 'ouro' | 'prata' | 'bronze' | null
}
```

---

## 🎨 Interface - Página Principal

### Layout: `/admin/progresso-treinos`

```
┌─────────────────────────────────────────────────────────┐
│  📊 Progresso de Treinos                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🔥 ALUNOS DESTAQUE DA SEMANA                   │   │
│  │  [Filtro: Esta Semana ▼] [Critério: Dias ▼]    │   │
│  │                                                  │   │
│  │  🥇 1º Carlos - 6 dias consecutivos             │   │
│  │  🥈 2º Clea - 5 dias consecutivos               │   │
│  │  🥉 3º Dayanne - 5 dias consecutivos            │   │
│  │  🔥 Francilene - 5 dias                         │   │
│  │  🔥 Juscilene - 5 dias                          │   │
│  │  ... (mostrar top 10)                           │   │
│  │                                                  │   │
│  │  [📱 GERAR MENSAGEM WHATSAPP]                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────┬──────────────┬──────────────┐        │
│  │ 📈 Total     │ 🎯 Ativos    │ ⚠️ Inativos  │        │
│  │ 45 alunos    │ 38 (84%)     │ 7 (16%)      │        │
│  └──────────────┴──────────────┴──────────────┘        │
│                                                          │
│  📋 Todos os Alunos                                     │
│  [Buscar...] [Filtro: Todos ▼] [Ordenar: Nome ▼]      │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 👤 Carlos Silva                    🔥 6 dias    │   │
│  │    D S T Q Q S S                                │   │
│  │    ✓ ✓ ✓ ✓ ✓ ✓ ○                               │   │
│  │    Último treino: Hoje às 08:30                 │   │
│  │    [Ver Detalhes]                               │   │
│  ├─────────────────────────────────────────────────┤   │
│  │ 👤 Clea Santos                     🔥 5 dias    │   │
│  │    D S T Q Q S S                                │   │
│  │    ○ ✓ ✓ ✓ ✓ ✓ ○                               │   │
│  │    Último treino: Ontem às 19:00                │   │
│  │    [Ver Detalhes]                               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Interface - Detalhes do Aluno

### Modal/Página: `/admin/progresso-treinos/:alunoId`

```
┌─────────────────────────────────────────────────────────┐
│  👤 Carlos Silva                              [✕ Fechar]│
│  ┌─────────────────────────────────────────────────┐   │
│  │  📸 [Foto]  Carlos Silva                        │   │
│  │             carlos@email.com                    │   │
│  │             Ativo desde: 15/01/2024             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  📊 Estatísticas da Semana                              │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │ 🔥 Dias  │ 💪 Treinos│ 🎯 Exerc.│ ⏱️ Tempo │         │
│  │ 6/7      │ 8        │ 64       │ 6h 20min │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                                                          │
│  📅 Calendário Semanal                                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │  D   S   T   Q   Q   S   S                      │   │
│  │  ✓   ✓   ✓   ✓   ✓   ✓   ○                     │   │
│  │  1   2   1   2   1   1   -                      │   │
│  │  treino(s) por dia                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  📈 Histórico de Treinos (Últimos 30 dias)             │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [Gráfico de barras - treinos por dia]          │   │
│  │  ████ ██ ████ ██ ████ ████ ██                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  🏆 Conquistas                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🔥 Sequência Atual: 6 dias consecutivos        │   │
│  │  🏅 Melhor Sequência: 12 dias                   │   │
│  │  💪 Total de Treinos: 87                        │   │
│  │  📅 Taxa de Frequência: 85%                     │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  📋 Últimos Treinos Realizados                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  26/12 - 08:30 - Treino A (Peito/Tríceps)      │   │
│  │  8 exercícios • 45 minutos                      │   │
│  │  ────────────────────────────────────────────   │   │
│  │  25/12 - 18:00 - Treino B (Costas/Bíceps)      │   │
│  │  7 exercícios • 50 minutos                      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Modal de Mensagem WhatsApp

```
┌─────────────────────────────────────────────────────────┐
│  📱 Mensagem para WhatsApp                    [✕ Fechar]│
│  ┌─────────────────────────────────────────────────┐   │
│  │  Período: 20/12 a 26/12/2024                    │   │
│  │  Critério: Dias consecutivos (mínimo 5 dias)    │   │
│  │  Alunos selecionados: 8                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  Pré-visualização:                                      │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🔥 ALUNOS DESTAQUE DA SEMANA! 🔥               │   │
│  │                                                  │   │
│  │  Esses nomes aqui merecem MUITO reconhecimento! │   │
│  │  Foram 5 dias seguidos treinando firme no      │   │
│  │  aplicativo, mostrando dedicação, disciplina    │   │
│  │  e foco no processo!                            │   │
│  │                                                  │   │
│  │  Destaques:                                     │   │
│  │  • Carlos (6 dias)                              │   │
│  │  • Clea (5 dias)                                │   │
│  │  • Dayanne (5 dias)                             │   │
│  │  • Francilene (5 dias)                          │   │
│  │  • Juscilene (5 dias)                           │   │
│  │  • Léia (5 dias)                                │   │
│  │  • Sangella (5 dias)                            │   │
│  │  • Yasmin (5 dias)                              │   │
│  │                                                  │   │
│  │  Parabéns, time! A consistência de vocês       │   │
│  │  inspira e mostra que o resultado é apenas     │   │
│  │  consequência de quem faz o básico todos os    │   │
│  │  dias! 💪🔥                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  Opções:                                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ☑ Incluir número de dias de cada aluno        │   │
│  │  ☑ Incluir emojis                               │   │
│  │  ☐ Incluir total de treinos                     │   │
│  │  ☐ Incluir mensagem personalizada              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                          │
│  [📋 COPIAR TEXTO]  [📱 ABRIR NO WHATSAPP]             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Componentes Técnicos

### 1. Hook: `useProgressoTreinos.ts`

```typescript
// Buscar métricas de todos os alunos
export function useProgressoTreinos(periodo?: 'semana' | 'mes')

// Buscar métricas de um aluno específico
export function useProgressoAluno(alunoId: string, periodo?: 'semana' | 'mes')

// Buscar ranking semanal
export function useRankingSemanal(criterio?: 'dias' | 'treinos' | 'exercicios')

// Buscar histórico de treinos do aluno
export function useHistoricoTreinos(alunoId: string, dias?: number)
```

### 2. Componente: `ProgressoTreinosPage.tsx`

Página principal com:
- Card de destaques da semana
- Estatísticas gerais
- Lista de todos os alunos com progresso
- Filtros e ordenação

### 3. Componente: `AlunoProgressoModal.tsx`

Modal com detalhes do aluno:
- Estatísticas detalhadas
- Calendário semanal (reutilizar `WeekDaysTracker`)
- Gráfico de histórico
- Lista de treinos realizados

### 4. Componente: `RankingDestaquesCard.tsx`

Card de destaques com:
- Top 10 alunos
- Badges (ouro, prata, bronze)
- Botão para gerar mensagem

### 5. Componente: `MensagemWhatsAppModal.tsx`

Modal para gerar mensagem:
- Pré-visualização
- Opções de personalização
- Botões de copiar e abrir WhatsApp

### 6. Componente: `WeekProgressTracker.tsx`

Calendário semanal reutilizável (baseado no `WeekDaysTracker` do aluno):
- Mostrar dias treinados
- Indicar número de treinos por dia
- Versão compacta para lista
- Versão expandida para detalhes

---

## 📱 Funcionalidades Especiais

### 1. Geração de Mensagem WhatsApp

**Critérios de Seleção:**
- Mínimo de dias consecutivos (configurável: 3, 4, 5, 6, 7)
- Mínimo de treinos na semana (configurável)
- Período: semana atual ou personalizado

**Templates de Mensagem:**

```typescript
const templates = {
  padrao: `🔥 ALUNOS DESTAQUE DA SEMANA! 🔥

Esses nomes aqui merecem MUITO reconhecimento! Foram {dias} dias seguidos treinando firme no aplicativo, mostrando dedicação, disciplina e foco no processo!

Destaques:
{lista_alunos}

Parabéns, time! A consistência de vocês inspira e mostra que o resultado é apenas consequência de quem faz o básico todos os dias! 💪🔥`,

  motivacional: `💪 GUERREIROS DA SEMANA! 💪

Essa galera não brinca em serviço! {dias} dias de treino pesado, sem desculpas, sem frescura!

Os monstros:
{lista_alunos}

Continuem assim! O shape não se constrói sozinho! 🔥💯`,

  celebracao: `🎉 CELEBRANDO OS CAMPEÕES! 🎉

Mais uma semana de vitórias! Esses alunos mandaram muito bem com {dias} dias de treino!

Aplausos para:
{lista_alunos}

Vocês são inspiração! Sigam firmes! 🏆✨`
}
```

**Botão "Abrir no WhatsApp":**
```typescript
const abrirWhatsApp = (mensagem: string) => {
  const texto = encodeURIComponent(mensagem)
  window.open(`https://wa.me/?text=${texto}`, '_blank')
}
```

### 2. Sistema de Badges

```typescript
const badges = {
  ouro: {
    emoji: '🥇',
    cor: 'text-yellow-500',
    criterio: 'Posição 1'
  },
  prata: {
    emoji: '🥈',
    cor: 'text-gray-400',
    criterio: 'Posição 2'
  },
  bronze: {
    emoji: '🥉',
    cor: 'text-orange-600',
    criterio: 'Posição 3'
  },
  fogo: {
    emoji: '🔥',
    cor: 'text-orange-500',
    criterio: '5+ dias consecutivos'
  },
  estrela: {
    emoji: '⭐',
    cor: 'text-yellow-400',
    criterio: '10+ treinos na semana'
  }
}
```

### 3. Filtros e Ordenação

**Filtros:**
- Status: Todos / Ativos / Inativos / Destaque
- Período: Esta semana / Semana passada / Últimos 30 dias / Personalizado
- Frequência: Alta (5+ dias) / Média (3-4 dias) / Baixa (1-2 dias) / Sem treinos

**Ordenação:**
- Nome (A-Z)
- Dias treinados (maior → menor)
- Total de treinos (maior → menor)
- Último treino (mais recente → mais antigo)
- Sequência atual (maior → menor)

---

## 🎯 Queries Supabase

### Query 1: Métricas da Semana Atual

```typescript
async function buscarMetricasSemana(alunoId: string) {
  const inicioSemana = getInicioSemana()
  const fimSemana = getFimSemana()
  
  // 1. Buscar fichas do aluno
  const { data: fichas } = await supabase
    .from('fichas_alunos')
    .select('id')
    .eq('aluno_id', alunoId)
  
  const fichaIds = fichas?.map(f => f.id) || []
  
  // 2. Buscar treinos realizados na semana
  const { data: treinos } = await supabase
    .from('treinos_realizados')
    .select('data_realizacao, exercicio_id')
    .in('ficha_aluno_id', fichaIds)
    .gte('data_realizacao', inicioSemana.toISOString())
    .lte('data_realizacao', fimSemana.toISOString())
  
  // 3. Calcular métricas
  const diasUnicos = new Set(
    treinos?.map(t => new Date(t.data_realizacao).toDateString())
  )
  
  return {
    diasTreinados: diasUnicos.size,
    totalTreinos: treinos?.length || 0,
    exerciciosCompletados: treinos?.length || 0
  }
}
```

### Query 2: Ranking Semanal

```typescript
async function buscarRankingSemanal() {
  const inicioSemana = getInicioSemana()
  const fimSemana = getFimSemana()
  
  // 1. Buscar todos os alunos
  const { data: alunos } = await supabase
    .from('alunos')
    .select(`
      id,
      users_profile!inner(nome, foto_url)
    `)
    .eq('status', 'ativo')
  
  // 2. Para cada aluno, calcular métricas
  const ranking = await Promise.all(
    alunos.map(async (aluno) => {
      const metricas = await buscarMetricasSemana(aluno.id)
      return {
        alunoId: aluno.id,
        nome: aluno.users_profile.nome,
        fotoUrl: aluno.users_profile.foto_url,
        diasTreinados: metricas.diasTreinados,
        totalTreinos: metricas.totalTreinos
      }
    })
  )
  
  // 3. Ordenar por dias treinados
  return ranking
    .sort((a, b) => b.diasTreinados - a.diasTreinados)
    .slice(0, 10)
}
```

### Query 3: Sequência de Dias Consecutivos

```typescript
async function calcularSequenciaConsecutiva(alunoId: string) {
  const { data: fichas } = await supabase
    .from('fichas_alunos')
    .select('id')
    .eq('aluno_id', alunoId)
  
  const fichaIds = fichas?.map(f => f.id) || []
  
  // Buscar todos os treinos (últimos 90 dias)
  const dataLimite = new Date()
  dataLimite.setDate(dataLimite.getDate() - 90)
  
  const { data: treinos } = await supabase
    .from('treinos_realizados')
    .select('data_realizacao')
    .in('ficha_aluno_id', fichaIds)
    .gte('data_realizacao', dataLimite.toISOString())
    .order('data_realizacao', { ascending: false })
  
  // Extrair dias únicos
  const diasTreinados = Array.from(
    new Set(treinos?.map(t => 
      new Date(t.data_realizacao).toDateString()
    ))
  ).map(d => new Date(d))
  
  // Calcular sequência atual
  let sequenciaAtual = 0
  let melhorSequencia = 0
  let sequenciaTemp = 0
  
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 90; i++) {
    const dia = new Date(hoje)
    dia.setDate(hoje.getDate() - i)
    
    const treinouNesteDia = diasTreinados.some(d => 
      d.toDateString() === dia.toDateString()
    )
    
    if (treinouNesteDia) {
      sequenciaTemp++
      if (i === 0 || sequenciaAtual > 0) {
        sequenciaAtual = sequenciaTemp
      }
      melhorSequencia = Math.max(melhorSequencia, sequenciaTemp)
    } else {
      if (sequenciaAtual > 0) break
      sequenciaTemp = 0
    }
  }
  
  return { sequenciaAtual, melhorSequencia }
}
```

---

## 🎨 Design System

### Cores

```typescript
const cores = {
  destaque: {
    ouro: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    prata: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
    bronze: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
    fogo: 'bg-orange-500/10 text-orange-500 border-orange-500/20'
  },
  status: {
    ativo: 'bg-green-500/10 text-green-500',
    inativo: 'bg-red-500/10 text-red-500',
    moderado: 'bg-yellow-500/10 text-yellow-500'
  }
}
```

### Ícones

```typescript
const icones = {
  dias: '🔥',
  treinos: '💪',
  exercicios: '🎯',
  tempo: '⏱️',
  sequencia: '🏆',
  frequencia: '📊',
  ranking: '🏅'
}
```

---

## 📦 Estrutura de Arquivos

```
client/src/
├── pages/admin/
│   └── ProgressoTreinos.tsx          # Página principal
├── components/progresso/
│   ├── RankingDestaquesCard.tsx      # Card de destaques
│   ├── AlunoProgressoCard.tsx        # Card resumido do aluno
│   ├── AlunoProgressoModal.tsx       # Modal com detalhes
│   ├── WeekProgressTracker.tsx       # Calendário semanal
│   ├── MensagemWhatsAppModal.tsx     # Modal de mensagem
│   ├── ProgressoStats.tsx            # Cards de estatísticas
│   └── HistoricoGrafico.tsx          # Gráfico de histórico
├── hooks/
│   └── useProgressoTreinos.ts        # Hook principal
└── lib/
    └── progressoUtils.ts             # Funções auxiliares
```

---

## 🚀 Roadmap de Implementação

### Fase 1: Estrutura Base (2-3 horas)
- [ ] Criar hook `useProgressoTreinos`
- [ ] Implementar queries básicas
- [ ] Criar página `ProgressoTreinos.tsx`
- [ ] Adicionar rota no App.tsx

### Fase 2: Componentes de Visualização (3-4 horas)
- [ ] `RankingDestaquesCard` - Top 10 alunos
- [ ] `AlunoProgressoCard` - Card resumido
- [ ] `WeekProgressTracker` - Calendário semanal
- [ ] `ProgressoStats` - Cards de estatísticas

### Fase 3: Detalhes do Aluno (2-3 horas)
- [ ] `AlunoProgressoModal` - Modal completo
- [ ] `HistoricoGrafico` - Gráfico de treinos
- [ ] Integrar com dados reais
- [ ] Calcular sequências consecutivas

### Fase 4: Mensagem WhatsApp (2 horas)
- [ ] `MensagemWhatsAppModal` - Modal de geração
- [ ] Templates de mensagem
- [ ] Opções de personalização
- [ ] Integração com WhatsApp Web

### Fase 5: Filtros e Refinamentos (2 horas)
- [ ] Filtros de status e período
- [ ] Ordenação múltipla
- [ ] Busca por nome
- [ ] Responsividade mobile

### Fase 6: Testes e Ajustes (1-2 horas)
- [ ] Testar com dados reais
- [ ] Ajustar performance
- [ ] Validar cálculos
- [ ] Documentação

**Tempo Total Estimado: 12-16 horas**

---

## 🎯 Características do MFIT Personal

### Funcionalidades Inspiradoras:

1. **Dashboard de Engajamento**
   - Visualização clara de alunos ativos vs inativos
   - Métricas de frequência semanal
   - Alertas de alunos sem treinar há X dias

2. **Sistema de Gamificação**
   - Badges e conquistas
   - Ranking público (opcional)
   - Metas semanais/mensais
   - Desafios entre alunos

3. **Comunicação Integrada**
   - Mensagens automáticas de parabéns
   - Notificações de conquistas
   - Compartilhamento em redes sociais

4. **Análise de Dados**
   - Gráficos de evolução
   - Comparação de períodos
   - Identificação de padrões
   - Relatórios exportáveis

5. **Motivação e Retenção**
   - Reconhecimento público
   - Sistema de pontos
   - Premiações periódicas
   - Feedback positivo constante

---

## 💡 Melhorias Futuras

### Curto Prazo:
- [ ] Notificações push para alunos destaque
- [ ] Exportar ranking em PDF
- [ ] Gráficos mais avançados (Chart.js)
- [ ] Comparação entre alunos

### Médio Prazo:
- [ ] Sistema de pontos e recompensas
- [ ] Desafios semanais/mensais
- [ ] Integração com Instagram Stories
- [ ] Certificados digitais de conquistas

### Longo Prazo:
- [ ] IA para prever abandono de alunos
- [ ] Sugestões automáticas de intervenção
- [ ] Dashboard de retenção
- [ ] Análise preditiva de engajamento

---

## 📝 Notas Técnicas

### Performance:
- Cachear métricas calculadas (React Query)
- Calcular ranking em background
- Paginar lista de alunos (50 por página)
- Lazy loading de modais

### Segurança:
- RLS policies para dados de alunos
- Validar permissões de admin
- Sanitizar dados antes de compartilhar

### UX:
- Loading states em todas as queries
- Skeleton loaders
- Feedback visual imediato
- Animações suaves (Framer Motion)

---

## ✅ Checklist de Qualidade

- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Acessível (ARIA labels, keyboard navigation)
- [ ] Performance otimizada (< 3s load time)
- [ ] Dados em tempo real
- [ ] Tratamento de erros
- [ ] Estados vazios (empty states)
- [ ] Documentação completa
- [ ] Testes básicos

---

**Documento criado em: 26/12/2024**
**Versão: 1.0**
**Status: Planejamento Completo ✅**
