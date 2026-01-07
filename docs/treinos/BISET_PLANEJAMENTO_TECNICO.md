# Planejamento Técnico: Funcionalidade Bi-Set

## 1. Análise do Modelo Atual

### 1.1 Estrutura de Dados Existente

**Tabela `fichas_treino`**
- Armazena fichas de treino com nome, descrição, objetivo, nível e duração
- Relacionamento 1:N com `exercicios_ficha`

**Tabela `exercicios_ficha`**
```sql
- id: UUID (PK)
- ficha_id: UUID (FK → fichas_treino)
- video_id: UUID (opcional)
- nome: TEXT
- grupo_muscular: TEXT
- ordem: INTEGER          -- Define sequência de execução
- series: INTEGER
- repeticoes: TEXT        -- Ex: "12" ou "10-12" ou "até falha"
- descanso: INTEGER       -- Em segundos
- observacoes: TEXT
- tecnica: TEXT           -- Já existe! Valores: "Drop Set", "Bi-Set", "Tri-Set", etc.
```

**Observação Importante**: O campo `tecnica` já existe e aceita "Bi-Set" como valor, mas atualmente é apenas um marcador visual sem lógica de agrupamento.

### 1.2 Fluxo Atual
1. Personal cria ficha → adiciona exercícios individualmente
2. Cada exercício tem sua própria ordem, séries, repetições e descanso
3. Aluno executa exercícios sequencialmente, com timer de descanso entre séries
4. Não há conceito de "exercícios agrupados" que devem ser executados em sequência

---

## 2. Definição do Bi-Set

### 2.1 Conceito
Bi-set é uma técnica de treinamento onde **dois exercícios são executados em sequência, sem descanso entre eles**. O descanso ocorre apenas após completar ambos os exercícios.

**Exemplo prático:**
- Exercício A: Supino Reto (12 reps)
- Exercício B: Crucifixo (15 reps)
- → Executa A, imediatamente executa B, depois descansa 90s
- → Repete o ciclo para cada série

### 2.2 Requisitos Funcionais
1. Personal pode agrupar 2 exercícios como Bi-set
2. Bi-set compartilha: número de séries e tempo de descanso (após o par)
3. Cada exercício do Bi-set mantém suas próprias repetições
4. Aluno visualiza claramente que são exercícios agrupados
5. Timer de descanso só inicia após completar ambos exercícios do par

---

## 3. Modelo de Dados Proposto

### 3.1 Abordagem Escolhida: Campo de Agrupamento

Adicionar campo `biset_grupo_id` na tabela `exercicios_ficha` para vincular exercícios do mesmo Bi-set.

**Vantagens:**
- Mínima alteração no schema existente
- Compatibilidade total com treinos existentes (campo nullable)
- Flexível para futuras extensões (Tri-set, Giant-set)

### 3.2 Alteração no Schema

```sql
-- Migration: add_biset_support
ALTER TABLE exercicios_ficha 
ADD COLUMN biset_grupo_id UUID DEFAULT NULL;

-- Índice para consultas de agrupamento
CREATE INDEX idx_exercicios_biset_grupo ON exercicios_ficha(biset_grupo_id) 
WHERE biset_grupo_id IS NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN exercicios_ficha.biset_grupo_id IS 
'UUID compartilhado entre exercícios do mesmo Bi-set. NULL = exercício individual.';
```

### 3.3 Atualização no Drizzle Schema (`shared/schema.ts`)

```typescript
export const exerciciosFicha = pgTable("exercicios_ficha", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fichaId: varchar("ficha_id").notNull().references(() => fichasTreino.id, { onDelete: 'cascade' }),
  videoId: varchar("video_id"),
  nome: text("nome").notNull(),
  grupoMuscular: text("grupo_muscular").notNull(),
  ordem: integer("ordem").notNull(),
  series: integer("series").notNull(),
  repeticoes: text("repeticoes").notNull(),
  descanso: integer("descanso").notNull(),
  observacoes: text("observacoes"),
  tecnica: text("tecnica"),
  bisetGrupoId: varchar("biset_grupo_id"),  // NOVO CAMPO
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
```

### 3.4 Regras de Integridade

| Regra | Descrição |
|-------|-----------|
| R1 | `biset_grupo_id` deve ser compartilhado por exatamente 2 exercícios |
| R2 | Exercícios do mesmo Bi-set devem ter ordens consecutivas |
| R3 | Exercícios do mesmo Bi-set devem ter o mesmo número de séries |
| R4 | Apenas o segundo exercício do Bi-set define o descanso (após o par) |
| R5 | Exercícios do mesmo Bi-set devem pertencer à mesma ficha |

---

## 4. Fluxo de Funcionamento

### 4.1 Fluxo do Personal (Criação)

```
┌─────────────────────────────────────────────────────────────┐
│                    MODAL FICHA DE TREINO                     │
├─────────────────────────────────────────────────────────────┤
│  [Tab: Informações] [Tab: Exercícios]                       │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 1. Supino Reto          [Peito] 4x12  90s    [⋮]   │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 2. Crucifixo            [Peito] 4x15  60s    [⋮]   │    │
│  └─────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 3. Tríceps Testa        [Tríceps] 3x12 60s   [⋮]   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  [+ Adicionar Exercício]  [+ Criar Bi-Set]                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Ação "Criar Bi-Set":**
1. Abre modal de seleção
2. Personal seleciona 2 exercícios existentes OU adiciona 2 novos
3. Define: séries (compartilhado), repetições (individual), descanso (após o par)
4. Sistema gera `biset_grupo_id` único e atribui aos dois exercícios
5. Exercícios são reordenados para ficarem consecutivos

### 4.2 Fluxo do Sistema (Persistência)

```
Personal salva ficha
        │
        ▼
┌───────────────────┐
│ Validar Bi-sets   │
│ - 2 exercícios?   │
│ - Mesmas séries?  │
│ - Ordens válidas? │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Salvar exercícios │
│ com biset_grupo_id│
└───────────────────┘
        │
        ▼
┌───────────────────┐
│ Atualizar campo   │
│ tecnica = "Bi-Set"│
└───────────────────┘
```

### 4.3 Fluxo do Aluno (Execução)

```
┌─────────────────────────────────────────────────────────────┐
│                    EXECUÇÃO DE TREINO                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ BI-SET                                    4 séries  │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │ A. Supino Reto                           12 reps│ │    │
│  │ │    Série 1: [  kg] [  reps] [✓]                 │ │    │
│  │ │    Série 2: [  kg] [  reps] [ ]                 │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │ ┌─────────────────────────────────────────────────┐ │    │
│  │ │ B. Crucifixo                             15 reps│ │    │
│  │ │    Série 1: [  kg] [  reps] [ ]  ← Desbloqueia  │ │    │
│  │ │    Série 2: [  kg] [  reps] [ ]    após A      │ │    │
│  │ └─────────────────────────────────────────────────┘ │    │
│  │                                                     │    │
│  │ Descanso após completar par: 90s                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 3. Tríceps Testa                    3x12  60s      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Lógica de Execução:**
1. Sistema agrupa exercícios pelo `biset_grupo_id`
2. Exibe como card único com dois sub-exercícios
3. Série do exercício B só pode ser marcada após série correspondente do A
4. Timer de descanso inicia apenas quando ambas séries (A e B) do mesmo número estão completas

---

## 5. Alterações nos Componentes

### 5.1 Backend/Schema

| Arquivo | Alteração |
|---------|-----------|
| `shared/schema.ts` | Adicionar campo `bisetGrupoId` |
| `scripts/add-biset-support.sql` | Migration SQL |

### 5.2 Frontend - Admin

| Componente | Alteração |
|------------|-----------|
| `FichaTreinoModal.tsx` | Adicionar botão "Criar Bi-Set" |
| `ExerciciosList.tsx` | Agrupar visualmente exercícios com mesmo `bisetGrupoId` |
| `BiSetModal.tsx` | **NOVO** - Modal para criar/editar Bi-sets |
| `useFichasTreino.ts` | Lógica de validação e salvamento de Bi-sets |

### 5.3 Frontend - Aluno

| Componente | Alteração |
|------------|-----------|
| `TreinoExecucao.tsx` | Agrupar exercícios por `bisetGrupoId` |
| `ExercicioCard.tsx` | Suportar modo Bi-set (card agrupado) |
| `BiSetCard.tsx` | **NOVO** - Card específico para Bi-sets |
| `useTreinoEmAndamento.ts` | Lógica de conclusão de séries em par |

---

## 6. Interfaces TypeScript

### 6.1 Tipos Atualizados

```typescript
// shared/schema.ts ou types.ts

interface Exercicio {
  id?: string;
  nome: string;
  grupoMuscular: string;
  ordem: number;
  series: number;
  repeticoes: string;
  descanso: number;
  observacoes?: string;
  tecnica?: string;
  videoId?: string;
  bisetGrupoId?: string;  // NOVO
}

interface BiSetGroup {
  grupoId: string;
  exercicioA: Exercicio;
  exercicioB: Exercicio;
  series: number;
  descanso: number;  // Descanso após completar o par
}

// Para execução do aluno
interface ExercicioEmAndamento {
  id: string;
  nome: string;
  grupoMuscular: string;
  series: number;
  repeticoes: string;
  descanso: number;
  observacoes?: string;
  tecnica?: string;
  videoId?: string;
  bisetGrupoId?: string;  // NOVO
  bisetParceiro?: string; // ID do exercício parceiro no Bi-set
  bisetOrdem?: 'A' | 'B'; // Posição no Bi-set
  seriesRealizadas: SerieRealizada[];
}
```

---

## 7. Validações e Edge Cases

### 7.1 Validações na Criação

| Validação | Mensagem de Erro |
|-----------|------------------|
| Bi-set deve ter exatamente 2 exercícios | "Selecione exatamente 2 exercícios para o Bi-set" |
| Exercícios devem ter mesmo número de séries | "Os exercícios do Bi-set devem ter o mesmo número de séries" |
| Exercício já em outro Bi-set | "Este exercício já faz parte de outro Bi-set" |
| Ordens devem ser consecutivas | Sistema ajusta automaticamente |

### 7.2 Edge Cases

| Cenário | Tratamento |
|---------|------------|
| Excluir exercício de um Bi-set | Desfaz o Bi-set, exercício restante vira individual |
| Reordenar exercício de Bi-set | Move o par junto, mantendo consecutividade |
| Editar séries de um exercício do Bi-set | Atualiza ambos exercícios do par |
| Duplicar ficha com Bi-sets | Gera novos `biset_grupo_id` para os pares |
| Treino em andamento com Bi-set | Salva estado de ambos exercícios juntos |

### 7.3 Compatibilidade com Treinos Existentes

| Cenário | Comportamento |
|---------|---------------|
| Treinos sem Bi-set | Funcionam normalmente (`biset_grupo_id = NULL`) |
| Exercícios com `tecnica = "Bi-Set"` sem grupo | Exibem badge mas sem agrupamento |
| Migração de dados | Não necessária - campo é nullable |

---

## 8. Queries SQL de Referência

### 8.1 Buscar Exercícios com Agrupamento

```sql
SELECT 
  e.*,
  CASE 
    WHEN e.biset_grupo_id IS NOT NULL THEN 
      ROW_NUMBER() OVER (
        PARTITION BY e.biset_grupo_id 
        ORDER BY e.ordem
      )
    ELSE NULL 
  END as biset_posicao
FROM exercicios_ficha e
WHERE e.ficha_id = $1
ORDER BY e.ordem;
```

### 8.2 Validar Bi-sets de uma Ficha

```sql
SELECT 
  biset_grupo_id,
  COUNT(*) as total_exercicios,
  COUNT(DISTINCT series) as series_distintas
FROM exercicios_ficha
WHERE ficha_id = $1 AND biset_grupo_id IS NOT NULL
GROUP BY biset_grupo_id
HAVING COUNT(*) != 2 OR COUNT(DISTINCT series) > 1;
-- Retorna Bi-sets inválidos
```

---

## 9. Plano de Implementação

### Fase 1: Schema e Backend (1-2 dias)
1. Criar migration SQL
2. Atualizar `shared/schema.ts`
3. Atualizar hooks de CRUD (`useFichasTreino.ts`)

### Fase 2: Interface Admin (2-3 dias)
1. Criar `BiSetModal.tsx`
2. Atualizar `FichaTreinoModal.tsx`
3. Atualizar `ExerciciosList.tsx` para agrupamento visual
4. Testes de criação/edição

### Fase 3: Interface Aluno (2-3 dias)
1. Criar `BiSetCard.tsx`
2. Atualizar `TreinoExecucao.tsx`
3. Atualizar lógica de timer de descanso
4. Testes de execução

### Fase 4: Testes e Refinamentos (1-2 dias)
1. Testes de compatibilidade com treinos existentes
2. Testes de edge cases
3. Ajustes de UX baseados em feedback

---

## 10. Critérios de Aceite

- [x] Personal pode criar Bi-set selecionando 2 exercícios
- [x] Personal pode definir séries, repetições individuais e descanso do Bi-set
- [x] Bi-set é exibido como grupo visual na lista de exercícios (admin)
- [x] Personal pode desfazer Bi-set, voltando exercícios a individuais
- [x] Aluno visualiza Bi-set como card agrupado com indicação clara
- [x] Timer de descanso só inicia após completar ambos exercícios do par
- [x] Treinos existentes (sem Bi-set) continuam funcionando normalmente
- [x] Histórico de treinos registra corretamente exercícios de Bi-set
- [x] Reordenação de exercícios mantém integridade do Bi-set

---

## 11. Considerações Futuras

- **Tri-Set**: Mesmo modelo, permitindo 3 exercícios no grupo
- **Giant-Set**: 4+ exercícios no grupo
- **Super-Set**: Variação com grupos musculares antagonistas (pode usar mesmo modelo)
- **Estatísticas**: Métricas específicas para técnicas avançadas

---

## 12. Implementação Concluída

### Fase 1: Schema e Backend ✅
- Migration SQL aplicada (`scripts/add-biset-support.sql`)
- Campo `biset_grupo_id` adicionado à tabela `exercicios_ficha`
- Schema Drizzle atualizado (`shared/schema.ts`)
- Funções utilitárias em `useFichasTreino.ts`

### Fase 2: Interface Admin ✅
- `BiSetModal.tsx` - Modal para criar/editar Bi-sets
- `ExerciciosList.tsx` - Agrupamento visual de Bi-sets
- `FichaTreinoModal.tsx` - Botão "Criar Bi-Set" integrado
- `FichasTreino.tsx` - Conversão de dados atualizada

### Fase 3: Interface Aluno ✅
- `BiSetCard.tsx` - Card para execução de Bi-set
- `TreinoExecucao.tsx` - Renderização e lógica de Bi-sets
- Timer de descanso só após completar par A+B
- Bloqueio de série B até completar série A correspondente

### Fase 4: Testes e Refinamentos ✅
- `MeusTreinos.tsx` - Visualização de Bi-sets na lista de treinos
- Compatibilidade com treinos existentes verificada
- Todos os critérios de aceite atendidos
