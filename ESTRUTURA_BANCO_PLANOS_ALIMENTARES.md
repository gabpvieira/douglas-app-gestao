# Estrutura de Banco de Dados - Planos Alimentares

## Data: 22/11/2025

## Nova Arquitetura Normalizada

Implementada estrutura de banco de dados normalizada com tabelas separadas para maior eficiência e precisão.

## Estrutura de Tabelas

### 1. `planos_alimentares` (Tabela Principal)
```sql
- id (UUID, PK)
- aluno_id (UUID, FK -> alunos)
- titulo (TEXT)
- conteudo_html (TEXT) -- Para visualização
- observacoes (TEXT)
- dados_json (JSONB) -- Metadados (objetivo, categoria, restrições)
- data_criacao (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### 2. `refeicoes_plano` (Nova Tabela)
```sql
- id (UUID, PK)
- plano_id (UUID, FK -> planos_alimentares) ON DELETE CASCADE
- nome (TEXT) -- Ex: "Café da Manhã"
- horario (TIME) -- Ex: "07:00"
- ordem (INTEGER) -- Para ordenação
- calorias_calculadas (INTEGER) -- Soma automática
- observacoes (TEXT)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

### 3. `alimentos_refeicao` (Nova Tabela)
```sql
- id (UUID, PK)
- refeicao_id (UUID, FK -> refeicoes_plano) ON DELETE CASCADE
- nome (TEXT) -- Ex: "Peito de Frango"
- quantidade (NUMERIC) -- Ex: 150
- unidade (TEXT) -- Ex: "g"
- calorias (NUMERIC)
- proteinas (NUMERIC)
- carboidratos (NUMERIC)
- gorduras (NUMERIC)
- categoria (TEXT) -- Ex: "proteinas"
- ordem (INTEGER) -- Para ordenação
- created_at (TIMESTAMPTZ)
```

## Relacionamentos

```
planos_alimentares (1) ──< (N) refeicoes_plano (1) ──< (N) alimentos_refeicao
```

- Um plano tem várias refeições
- Uma refeição tem vários alimentos
- DELETE CASCADE: ao deletar plano, deleta refeições e alimentos

## Índices Criados

```sql
-- Performance em consultas
idx_refeicoes_plano_id (plano_id)
idx_refeicoes_ordem (plano_id, ordem)
idx_alimentos_refeicao_id (refeicao_id)
idx_alimentos_ordem (refeicao_id, ordem)
```

## Vantagens da Nova Estrutura

### ✅ Performance
- Consultas SQL diretas e eficientes
- Índices otimizados para buscas
- Sem parsing de JSON em queries complexas

### ✅ Integridade
- Constraints de FK garantem consistência
- CASCADE automático em deleções
- Tipos de dados específicos (NUMERIC, TIME)

### ✅ Escalabilidade
- Fácil adicionar novos campos
- Consultas agregadas eficientes (SUM, AVG)
- Suporte a relatórios complexos

### ✅ Manutenibilidade
- Estrutura clara e normalizada
- Fácil de entender e modificar
- Separação de responsabilidades

## Fluxo de Dados

### Criar Plano
1. Frontend envia: `{ titulo, conteudoHtml, dadosJson, refeicoes[] }`
2. Backend cria registro em `planos_alimentares`
3. Para cada refeição:
   - Cria registro em `refeicoes_plano`
   - Para cada alimento:
     - Cria registro em `alimentos_refeicao`

### Buscar Plano
1. Backend busca plano em `planos_alimentares`
2. JOIN com `refeicoes_plano` (ordenado por `ordem`)
3. JOIN com `alimentos_refeicao` (ordenado por `ordem`)
4. Retorna estrutura completa aninhada

### Atualizar Plano
1. Atualiza dados em `planos_alimentares`
2. DELETE CASCADE remove refeições antigas
3. Insere novas refeições e alimentos

## Exemplo de Dados

### Plano Alimentar
```json
{
  "id": "uuid-1",
  "titulo": "Plano de Emagrecimento",
  "alunoId": "uuid-aluno",
  "dadosJson": {
    "objetivo": "emagrecimento",
    "categoria": "basico",
    "restricoes": ["Lactose"]
  }
}
```

### Refeição
```json
{
  "id": "uuid-ref-1",
  "plano_id": "uuid-1",
  "nome": "Café da Manhã",
  "horario": "07:00",
  "ordem": 1,
  "calorias_calculadas": 375
}
```

### Alimento
```json
{
  "id": "uuid-alim-1",
  "refeicao_id": "uuid-ref-1",
  "nome": "Aveia",
  "quantidade": 30,
  "unidade": "g",
  "calorias": 117,
  "proteinas": 4,
  "carboidratos": 20,
  "gorduras": 2,
  "categoria": "cereais",
  "ordem": 1
}
```

## Consultas SQL Úteis

### Buscar plano com refeições e alimentos
```sql
SELECT 
  p.*,
  r.id as refeicao_id,
  r.nome as refeicao_nome,
  r.horario,
  a.id as alimento_id,
  a.nome as alimento_nome,
  a.quantidade,
  a.calorias
FROM planos_alimentares p
LEFT JOIN refeicoes_plano r ON r.plano_id = p.id
LEFT JOIN alimentos_refeicao a ON a.refeicao_id = r.id
WHERE p.id = 'uuid'
ORDER BY r.ordem, a.ordem;
```

### Calcular macros totais de um plano
```sql
SELECT 
  p.id,
  p.titulo,
  SUM(a.calorias) as total_calorias,
  SUM(a.proteinas) as total_proteinas,
  SUM(a.carboidratos) as total_carboidratos,
  SUM(a.gorduras) as total_gorduras
FROM planos_alimentares p
JOIN refeicoes_plano r ON r.plano_id = p.id
JOIN alimentos_refeicao a ON a.refeicao_id = r.id
WHERE p.id = 'uuid'
GROUP BY p.id, p.titulo;
```

## Arquivos Modificados

### Backend
- `server/routes/planosAlimentares.ts`
  - POST: Salva refeições e alimentos
  - PUT: Atualiza refeições e alimentos
  - GET: Retorna com refeições aninhadas

### Frontend
- `client/src/pages/PlanosAlimentares.tsx`
  - Envia `refeicoes[]` ao criar/atualizar
  - Calcula macros das refeições do banco
  - Usa refeições do banco quando disponíveis

- `client/src/hooks/usePlanosAlimentares.ts`
  - Adicionado campo `refeicoes` nas interfaces

### Banco de Dados
- Criadas tabelas: `refeicoes_plano`, `alimentos_refeicao`
- Criados índices para performance
- Configurado RLS e políticas

## Migração de Dados Antigos

Planos criados antes desta atualização:
- Continuam funcionando (campo `dados_json` mantido)
- Ao editar, serão migrados para nova estrutura
- Macros calculados do `dados_json` se refeições não existirem

## Testes Recomendados

- [x] Criar plano com múltiplas refeições
- [x] Criar plano com geração automática
- [x] Editar plano existente
- [x] Deletar plano (verificar cascade)
- [x] Visualizar plano com refeições
- [x] Calcular macros totais
- [x] Ordenação de refeições e alimentos
- [x] Performance com muitos planos
