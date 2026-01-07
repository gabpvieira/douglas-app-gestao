# Planejamento Técnico: Persistência Inteligente de Cargas

## 1. Análise do Modelo Atual

### 1.1 Estrutura de Dados Existente

**Tabela `treinos_realizados`**
```sql
- id: UUID (PK)
- ficha_aluno_id: UUID (FK → fichas_alunos)
- exercicio_id: UUID (FK → exercicios_ficha)
- data_realizacao: TIMESTAMP
- series_realizadas: INTEGER
- observacoes: TEXT
```

**Tabela `series_realizadas`**
```sql
- id: UUID (PK)
- treino_realizado_id: UUID (FK → treinos_realizados)
- numero_serie: INTEGER
- carga: TEXT              -- peso em kg (já existe!)
- repeticoes: INTEGER
- concluida: TEXT
- observacoes: TEXT
```

**Observação Importante**: O modelo atual JÁ salva a carga por série na tabela `series_realizadas`. O que falta é:
1. Buscar a última carga ao iniciar um novo treino
2. Pré-preencher os campos de peso com esses valores

### 1.2 Fluxo Atual (Problema)
1. Aluno inicia treino → campos de peso vazios
2. Aluno digita peso manualmente para cada série
3. Aluno finaliza treino → dados salvos em `series_realizadas`
4. Próximo treino → campos vazios novamente (dados não reaproveitados)

---

## 2. Solução Proposta

### 2.1 Conceito
Criar uma tabela de "última carga" por aluno/exercício que serve como cache de referência rápida, atualizada automaticamente ao finalizar cada treino.

### 2.2 Abordagem: Tabela de Referência de Cargas

**Vantagens:**
- Consulta rápida (não precisa buscar em histórico)
- Estrutura simples e direta
- Fácil manutenção e atualização
- Não afeta performance do histórico existente

---

## 3. Modelo de Dados Proposto

### 3.1 Nova Tabela: `ultima_carga_exercicio`

```sql
CREATE TABLE ultima_carga_exercicio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  exercicio_id UUID NOT NULL REFERENCES exercicios_ficha(id) ON DELETE CASCADE,
  
  -- Última carga registrada (por série)
  cargas_por_serie JSONB NOT NULL DEFAULT '[]',
  -- Exemplo: [{"serie": 1, "carga": "40"}, {"serie": 2, "carga": "42.5"}, {"serie": 3, "carga": "45"}]
  
  -- Metadados
  ultima_atualizacao TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  treino_referencia_id UUID REFERENCES treinos_realizados(id),
  
  -- Constraint única: um registro por aluno/exercício
  UNIQUE(aluno_id, exercicio_id),
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para consultas rápidas
CREATE INDEX idx_ultima_carga_aluno ON ultima_carga_exercicio(aluno_id);
CREATE INDEX idx_ultima_carga_exercicio ON ultima_carga_exercicio(exercicio_id);
CREATE INDEX idx_ultima_carga_aluno_exercicio ON ultima_carga_exercicio(aluno_id, exercicio_id);
```

### 3.2 Estrutura do JSONB `cargas_por_serie`

```typescript
interface CargaSerie {
  serie: number;      // Número da série (1, 2, 3...)
  carga: string;      // Peso em kg (string para suportar decimais como "42.5")
  repeticoes?: number; // Repetições realizadas (opcional, para referência)
}

// Exemplo de valor armazenado:
[
  { "serie": 1, "carga": "40", "repeticoes": 12 },
  { "serie": 2, "carga": "42.5", "repeticoes": 10 },
  { "serie": 3, "carga": "45", "repeticoes": 8 },
  { "serie": 4, "carga": "45", "repeticoes": 6 }
]
```

### 3.3 Atualização no Drizzle Schema (`shared/schema.ts`)

```typescript
// Tabela para última carga por exercício/aluno
export const ultimaCargaExercicio = pgTable("ultima_carga_exercicio", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alunoId: varchar("aluno_id").notNull().references(() => alunos.id, { onDelete: 'cascade' }),
  exercicioId: varchar("exercicio_id").notNull().references(() => exerciciosFicha.id, { onDelete: 'cascade' }),
  cargasPorSerie: jsonb("cargas_por_serie").notNull().default([]),
  ultimaAtualizacao: timestamp("ultima_atualizacao").notNull().default(sql`CURRENT_TIMESTAMP`),
  treinoReferenciaId: varchar("treino_referencia_id").references(() => treinosRealizados.id),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
```

---

## 4. Fluxo de Funcionamento

### 4.1 Fluxo: Finalizar Treino → Salvar Referência

```
Aluno finaliza treino
        │
        ▼
┌───────────────────────────────────┐
│ Para cada exercício com séries    │
│ concluídas:                       │
│                                   │
│ 1. Extrair cargas das séries      │
│ 2. Montar array cargas_por_serie  │
│ 3. UPSERT em ultima_carga_exercicio│
└───────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│ Dados salvos:                     │
│ - aluno_id                        │
│ - exercicio_id                    │
│ - cargas_por_serie (JSONB)        │
│ - ultima_atualizacao              │
│ - treino_referencia_id            │
└───────────────────────────────────┘
```

### 4.2 Fluxo: Iniciar Treino → Carregar Referência

```
Aluno inicia novo treino
        │
        ▼
┌───────────────────────────────────┐
│ Buscar exercícios da ficha        │
└───────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│ Para cada exercício:              │
│                                   │
│ SELECT cargas_por_serie           │
│ FROM ultima_carga_exercicio       │
│ WHERE aluno_id = ? AND            │
│       exercicio_id = ?            │
└───────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────┐
│ Inicializar seriesRealizadas:     │
│                                   │
│ - Se tem referência: usar carga   │
│ - Se não tem: campo vazio         │
│ - Sempre: concluida = false       │
└───────────────────────────────────┘
```

### 4.3 Diagrama de Sequência

```
┌─────────┐     ┌─────────────┐     ┌──────────────────────┐     ┌─────────────┐
│  Aluno  │     │ TreinoExec  │     │ ultima_carga_exercicio│     │ Supabase DB │
└────┬────┘     └──────┬──────┘     └──────────┬───────────┘     └──────┬──────┘
     │                 │                       │                        │
     │ Iniciar Treino  │                       │                        │
     │────────────────>│                       │                        │
     │                 │                       │                        │
     │                 │ Buscar últimas cargas │                        │
     │                 │──────────────────────>│                        │
     │                 │                       │ SELECT WHERE aluno_id  │
     │                 │                       │───────────────────────>│
     │                 │                       │<───────────────────────│
     │                 │<──────────────────────│                        │
     │                 │                       │                        │
     │                 │ Preencher campos peso │                        │
     │<────────────────│                       │                        │
     │                 │                       │                        │
     │ Executar treino │                       │                        │
     │ (ajustar cargas)│                       │                        │
     │────────────────>│                       │                        │
     │                 │                       │                        │
     │ Finalizar       │                       │                        │
     │────────────────>│                       │                        │
     │                 │                       │                        │
     │                 │ Salvar treino         │                        │
     │                 │───────────────────────────────────────────────>│
     │                 │                       │                        │
     │                 │ UPSERT últimas cargas │                        │
     │                 │──────────────────────>│                        │
     │                 │                       │ UPSERT                 │
     │                 │                       │───────────────────────>│
     │                 │                       │<───────────────────────│
     │                 │<──────────────────────│                        │
     │                 │                       │                        │
     │ Treino salvo ✓  │                       │                        │
     │<────────────────│                       │                        │
```

---

## 5. Alterações nos Componentes

### 5.1 Backend/Schema

| Arquivo | Alteração |
|---------|-----------|
| `shared/schema.ts` | Adicionar tabela `ultimaCargaExercicio` |
| `scripts/add-ultima-carga.sql` | Migration SQL |

### 5.2 Frontend - Hooks

| Arquivo | Alteração |
|---------|-----------|
| `useUltimasCargasExercicios.ts` | **NOVO** - Hook para buscar/salvar cargas |
| `useTreinoEmAndamento.ts` | Integrar carregamento de cargas anteriores |

### 5.3 Frontend - Componentes

| Arquivo | Alteração |
|---------|-----------|
| `TreinoExecucao.tsx` | Carregar cargas ao iniciar treino |
| `ExercicioCard.tsx` | Indicador visual de "carga anterior" |
| `BiSetCard.tsx` | Mesmo tratamento para Bi-sets |

---

## 6. Interfaces TypeScript

### 6.1 Tipos para Cargas

```typescript
// Hook de últimas cargas
interface CargaSerie {
  serie: number;
  carga: string;
  repeticoes?: number;
}

interface UltimaCargaExercicio {
  id: string;
  alunoId: string;
  exercicioId: string;
  cargasPorSerie: CargaSerie[];
  ultimaAtualizacao: string;
  treinoReferenciaId?: string;
}

// Mapa de cargas por exercício (para uso no componente)
type MapaCargasExercicios = Record<string, CargaSerie[]>;
// Exemplo: { "exercicio-uuid-1": [{serie: 1, carga: "40"}, ...], ... }
```

### 6.2 Atualização em ExercicioEmAndamento

```typescript
interface SerieRealizada {
  numero: number;
  peso: string;
  repeticoes: number;
  concluida: boolean;
  pesoAnterior?: string;  // NOVO: referência visual
}

interface ExercicioEmAndamento {
  // ... campos existentes ...
  cargaAnteriorCarregada?: boolean;  // NOVO: flag de carregamento
}
```

---

## 7. Implementação Detalhada

### 7.1 Hook: `useUltimasCargasExercicios.ts`

```typescript
// Buscar últimas cargas para múltiplos exercícios
export function useUltimasCargasExercicios(alunoId: string, exercicioIds: string[]) {
  return useQuery({
    queryKey: ['ultimas-cargas', alunoId, exercicioIds],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ultima_carga_exercicio')
        .select('*')
        .eq('aluno_id', alunoId)
        .in('exercicio_id', exercicioIds);
      
      if (error) throw error;
      
      // Converter para mapa
      const mapa: MapaCargasExercicios = {};
      data?.forEach(item => {
        mapa[item.exercicio_id] = item.cargas_por_serie;
      });
      
      return mapa;
    },
    enabled: !!alunoId && exercicioIds.length > 0,
  });
}

// Salvar últimas cargas após finalizar treino
export function useSalvarUltimasCargas() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dados: {
      alunoId: string;
      exercicios: Array<{
        exercicioId: string;
        cargasPorSerie: CargaSerie[];
        treinoReferenciaId?: string;
      }>;
    }) => {
      // UPSERT para cada exercício
      for (const ex of dados.exercicios) {
        await supabase
          .from('ultima_carga_exercicio')
          .upsert({
            aluno_id: dados.alunoId,
            exercicio_id: ex.exercicioId,
            cargas_por_serie: ex.cargasPorSerie,
            ultima_atualizacao: new Date().toISOString(),
            treino_referencia_id: ex.treinoReferenciaId,
          }, {
            onConflict: 'aluno_id,exercicio_id'
          });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ultimas-cargas'] });
    },
  });
}
```

### 7.2 Alteração em `TreinoExecucao.tsx`

```typescript
// Buscar últimas cargas quando ficha carregar
const exercicioIds = ficha?.fichas_treino?.exercicios_ficha?.map(e => e.id) || [];
const { data: ultimasCargas } = useUltimasCargasExercicios(alunoId, exercicioIds);

// Ao inicializar exercícios, preencher com cargas anteriores
const exerciciosIniciais: ExercicioEmAndamento[] = ficha.fichas_treino.exercicios_ficha
  .map((ex: any) => {
    const cargasAnteriores = ultimasCargas?.[ex.id] || [];
    
    return {
      id: ex.id,
      nome: ex.nome,
      // ... outros campos ...
      seriesRealizadas: Array.from({ length: ex.series }, (_, i) => {
        const cargaAnterior = cargasAnteriores.find(c => c.serie === i + 1);
        return {
          numero: i + 1,
          peso: cargaAnterior?.carga || "",  // Preencher com carga anterior!
          repeticoes: 0,
          concluida: false,
          pesoAnterior: cargaAnterior?.carga,  // Referência visual
        };
      }),
      cargaAnteriorCarregada: cargasAnteriores.length > 0,
    };
  });
```

### 7.3 Alteração em `handleFinalizarTreino`

```typescript
const salvarUltimasCargas = useSalvarUltimasCargas();

const handleFinalizarTreino = async () => {
  // ... código existente de salvar treino ...
  
  // Após salvar treino, atualizar referência de cargas
  const exerciciosComCargas = exercicios
    .filter(ex => ex.seriesRealizadas.some(s => s.concluida && s.peso))
    .map(ex => ({
      exercicioId: ex.id,
      cargasPorSerie: ex.seriesRealizadas
        .filter(s => s.concluida)
        .map(s => ({
          serie: s.numero,
          carga: s.peso,
          repeticoes: s.repeticoes,
        })),
    }));
  
  if (exerciciosComCargas.length > 0) {
    await salvarUltimasCargas.mutateAsync({
      alunoId,
      exercicios: exerciciosComCargas,
    });
  }
};
```

---

## 8. Edge Cases e Validações

### 8.1 Cenários Especiais

| Cenário | Tratamento |
|---------|------------|
| Primeiro treino do aluno | Campos de peso vazios (sem referência) |
| Exercício novo na ficha | Campo vazio para esse exercício específico |
| Troca de ficha | Cargas são por exercício, não por ficha - mantém referência |
| Exercício removido da ficha | Referência permanece no banco (pode ser útil se voltar) |
| Número de séries alterado | Usa cargas das séries existentes, novas séries ficam vazias |
| Aluno não completa série | Série não concluída não atualiza referência |

### 8.2 Validações

| Validação | Descrição |
|-----------|-----------|
| V1 | Só salvar carga se série foi concluída |
| V2 | Só salvar carga se valor não está vazio |
| V3 | Manter histórico completo em `series_realizadas` |
| V4 | `ultima_carga_exercicio` é apenas cache de referência |

### 8.3 Compatibilidade

| Cenário | Comportamento |
|---------|---------------|
| Treinos existentes | Funcionam normalmente, sem cargas pré-preenchidas |
| Após primeiro treino com nova feature | Próximo treino terá cargas preenchidas |
| Migração de dados | Opcional - pode popular tabela com último treino de cada exercício |

---

## 9. Queries SQL de Referência

### 9.1 Buscar Últimas Cargas para um Aluno

```sql
SELECT 
  exercicio_id,
  cargas_por_serie,
  ultima_atualizacao
FROM ultima_carga_exercicio
WHERE aluno_id = $1
  AND exercicio_id = ANY($2::uuid[]);
```

### 9.2 UPSERT de Última Carga

```sql
INSERT INTO ultima_carga_exercicio (
  aluno_id, 
  exercicio_id, 
  cargas_por_serie, 
  ultima_atualizacao,
  treino_referencia_id
)
VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4)
ON CONFLICT (aluno_id, exercicio_id) 
DO UPDATE SET 
  cargas_por_serie = EXCLUDED.cargas_por_serie,
  ultima_atualizacao = CURRENT_TIMESTAMP,
  treino_referencia_id = EXCLUDED.treino_referencia_id,
  updated_at = CURRENT_TIMESTAMP;
```

### 9.3 Popular Tabela com Dados Existentes (Migração Opcional)

```sql
-- Inserir última carga de cada exercício baseado no histórico existente
INSERT INTO ultima_carga_exercicio (aluno_id, exercicio_id, cargas_por_serie, ultima_atualizacao, treino_referencia_id)
SELECT DISTINCT ON (fa.aluno_id, tr.exercicio_id)
  fa.aluno_id,
  tr.exercicio_id,
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'serie', sr.numero_serie,
        'carga', sr.carga,
        'repeticoes', sr.repeticoes
      ) ORDER BY sr.numero_serie
    )
    FROM series_realizadas sr
    WHERE sr.treino_realizado_id = tr.id
  ) as cargas_por_serie,
  tr.data_realizacao as ultima_atualizacao,
  tr.id as treino_referencia_id
FROM treinos_realizados tr
JOIN fichas_alunos fa ON tr.ficha_aluno_id = fa.id
WHERE EXISTS (
  SELECT 1 FROM series_realizadas sr 
  WHERE sr.treino_realizado_id = tr.id 
    AND sr.carga IS NOT NULL 
    AND sr.carga != ''
    AND sr.carga != '0'
)
ORDER BY fa.aluno_id, tr.exercicio_id, tr.data_realizacao DESC
ON CONFLICT (aluno_id, exercicio_id) DO NOTHING;
```

---

## 10. Plano de Implementação

### Fase 1: Schema e Backend (1 dia)
1. Criar migration SQL
2. Atualizar `shared/schema.ts`
3. Criar hook `useUltimasCargasExercicios.ts`

### Fase 2: Integração no Treino (1-2 dias)
1. Atualizar `TreinoExecucao.tsx` para carregar cargas
2. Atualizar `handleFinalizarTreino` para salvar referência
3. Testar fluxo completo

### Fase 3: UX e Refinamentos (1 dia)
1. Indicador visual de "carga anterior" nos inputs
2. Tooltip ou badge mostrando referência
3. Testes de edge cases

### Fase 4: Migração de Dados (Opcional)
1. Script para popular tabela com histórico existente
2. Validação de dados migrados

---

## 11. Critérios de Aceite

- [x] Ao finalizar treino, cargas são salvas em `ultima_carga_exercicio`
- [x] Ao iniciar novo treino, campos de peso são pré-preenchidos
- [x] Aluno pode ajustar carga manualmente (sobrescreve referência)
- [x] Séries iniciam desmarcadas (checklist limpo)
- [x] Primeiro treino funciona normalmente (campos vazios)
- [x] Exercícios novos na ficha têm campos vazios
- [x] Histórico completo permanece em `series_realizadas`
- [x] Performance: carregamento rápido das referências
- [x] Indicadores visuais de cargas anteriores em ExercicioCard
- [x] Indicadores visuais de cargas anteriores em BiSetCard

---

## 12. Considerações de UX

### 12.1 Indicadores Visuais (Sugestão)

```
┌─────────────────────────────────────────────────────────────┐
│ Supino Reto                                    4 séries     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  SET   PESO (kg)           REPS                             │
│  ───   ─────────────────   ────                             │
│   1    [ 40 ]  ← anterior  [ 12 ]  [ ]                      │
│   2    [ 42.5 ] ← anterior [ 10 ]  [ ]                      │
│   3    [ 45 ]  ← anterior  [  8 ]  [ ]                      │
│   4    [ 45 ]  ← anterior  [  6 ]  [ ]                      │
│                                                             │
│  💡 Cargas do último treino (15/01/2026)                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 12.2 Comportamento do Input

- Campo pré-preenchido com valor anterior
- Placeholder mostra "Último: 40kg" se campo for limpo
- Cor diferenciada para indicar que é referência
- Ao editar, valor se torna "atual" (sem indicador)

---

## 13. Considerações Futuras

- **Progressão automática**: Sugerir aumento de carga baseado em histórico
- **Gráficos de evolução**: Mostrar progressão de carga por exercício
- **Alertas de estagnação**: Notificar se carga não aumenta há X semanas
- **Comparativo**: Mostrar diferença entre treino atual e anterior
- **Exportação**: Relatório de evolução de cargas para o personal
