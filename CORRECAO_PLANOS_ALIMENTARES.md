# Correção - Planos Alimentares

## Problema Identificado
A página de planos alimentares não estava exibindo nenhum plano, mesmo com dados no banco.

## Causa Raiz
O hook `usePlanosAlimentares` estava usando `SELECT *` e não fazia a conversão entre snake_case (formato do banco Supabase) e camelCase (formato esperado pelo frontend).

## Solução Aplicada

### 1. Criação de Dados de Teste
Criados 3 tipos de planos alimentares no Supabase:
- **4 Planos de Hipertrofia** (2800 kcal, alta proteína)
- **3 Planos de Emagrecimento** (1800 kcal, déficit calórico)
- **3 Planos de Manutenção** (2300 kcal, equilíbrio nutricional)

Total: **10 planos atribuídos a 10 alunos diferentes**

### 2. Correção do Hook `usePlanosAlimentares`
Modificado em `client/src/hooks/usePlanosAlimentares.ts`:

#### Mudanças em `usePlanosAlimentares()`:
- Especificado campos explícitos no SELECT ao invés de `*`
- Adicionado mapeamento de snake_case para camelCase
- Campos mapeados: `aluno_id → alunoId`, `conteudo_html → conteudoHtml`, etc.

#### Mudanças em `useCreatePlanoAlimentar()`:
- Conversão de camelCase para snake_case antes do INSERT
- Corrigido `plano_alimentar_id` para `plano_id` nas refeições
- Adicionado invalidação da query principal sem filtro

#### Mudanças em `useUpdatePlanoAlimentar()`:
- Conversão de camelCase para snake_case antes do UPDATE
- Corrigido `plano_alimentar_id` para `plano_id` nas refeições

#### Mudanças em `useDeletePlanoAlimentar()`:
- Corrigido `plano_alimentar_id` para `plano_id` nas refeições

#### Mudanças em `usePlanoAlimentar()` e `useMyPlanoAlimentar()`:
- Adicionado mapeamento de snake_case para camelCase
- Especificado campos explícitos no SELECT

## Estrutura da Tabela Confirmada
```sql
planos_alimentares:
  - id (uuid)
  - aluno_id (uuid) → FK para alunos
  - titulo (text)
  - conteudo_html (text)
  - observacoes (text)
  - dados_json (jsonb) → estrutura: {objetivo, calorias, proteinas, carboidratos, gorduras}
  - data_criacao (timestamp)
  - created_at (timestamp)
  - updated_at (timestamp)

refeicoes_plano:
  - id (uuid)
  - plano_id (uuid) → FK para planos_alimentares
  - nome (text)
  - horario (time)
  - ordem (integer)
  - calorias_calculadas (integer)
  - observacoes (text)
```

## Resultado
✅ Página de planos alimentares agora exibe os 10 planos criados
✅ Conversão automática entre snake_case e camelCase
✅ Dados estruturados em JSON funcionando corretamente
✅ Relacionamento com alunos funcionando

## Dados Criados
- 10 planos alimentares distribuídos entre 10 alunos
- 3 objetivos diferentes: hipertrofia, emagrecimento, manutenção
- Macros calculados e armazenados no campo `dados_json`
