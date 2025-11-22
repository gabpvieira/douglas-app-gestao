# Instruções para Criar Tabelas de Fichas de Treino no Supabase

## Passo 1: Acessar o SQL Editor do Supabase

1. Acesse: https://supabase.com/dashboard/project/cbdonvzifbkayrvnlskp
2. No menu lateral, clique em **SQL Editor**
3. Clique em **New Query**

## Passo 2: Executar o Script SQL

Copie e cole o conteúdo do arquivo `scripts/create-fichas-treino-tables.sql` no editor SQL e clique em **Run**.

Ou execute diretamente o SQL abaixo:

```sql
-- O script completo está em: scripts/create-fichas-treino-tables.sql
```

## Passo 3: Verificar Criação das Tabelas

Após executar o script, verifique se as seguintes tabelas foram criadas:

1. ✅ `fichas_treino` - Fichas de treino
2. ✅ `exercicios_ficha` - Exercícios de cada ficha
3. ✅ `fichas_alunos` - Atribuição de fichas aos alunos
4. ✅ `treinos_realizados` - Registro de treinos realizados
5. ✅ `series_realizadas` - Registro de séries realizadas

## Passo 4: Verificar Dados de Exemplo

O script já insere 3 fichas de exemplo:
- Treino ABC - Hipertrofia (com 4 exercícios)
- Full Body Iniciante
- Push Pull Legs

## Estrutura das Tabelas

### fichas_treino
- `id` (UUID) - Identificador único
- `nome` (TEXT) - Nome da ficha
- `descricao` (TEXT) - Descrição detalhada
- `objetivo` (TEXT) - Objetivo do treino (hipertrofia, emagrecimento, força, etc)
- `nivel` (TEXT) - Nível (iniciante, intermediario, avancado)
- `duracao_semanas` (INTEGER) - Duração em semanas
- `ativo` (TEXT) - Se está ativa (true/false)
- `created_at`, `updated_at` (TIMESTAMP)

### exercicios_ficha
- `id` (UUID) - Identificador único
- `ficha_id` (UUID) - Referência à ficha
- `video_id` (UUID) - Referência ao vídeo (opcional)
- `nome` (TEXT) - Nome do exercício
- `grupo_muscular` (TEXT) - Grupo muscular trabalhado
- `ordem` (INTEGER) - Ordem de execução
- `series` (INTEGER) - Número de séries
- `repeticoes` (TEXT) - Repetições (ex: "12" ou "10-12" ou "até falha")
- `descanso` (INTEGER) - Tempo de descanso em segundos
- `observacoes` (TEXT) - Observações adicionais
- `tecnica` (TEXT) - Técnica especial (drop set, bi-set, etc)
- `created_at`, `updated_at` (TIMESTAMP)

### fichas_alunos
- `id` (UUID) - Identificador único
- `ficha_id` (UUID) - Referência à ficha
- `aluno_id` (UUID) - Referência ao aluno
- `data_inicio` (DATE) - Data de início
- `data_fim` (DATE) - Data de término (opcional)
- `status` (TEXT) - Status (ativo, concluido, pausado)
- `observacoes` (TEXT) - Observações
- `created_at`, `updated_at` (TIMESTAMP)

### treinos_realizados
- `id` (UUID) - Identificador único
- `ficha_aluno_id` (UUID) - Referência à atribuição
- `exercicio_id` (UUID) - Referência ao exercício
- `data_realizacao` (TIMESTAMP) - Data e hora da realização
- `series_realizadas` (INTEGER) - Número de séries realizadas
- `observacoes` (TEXT) - Observações
- `created_at` (TIMESTAMP)

### series_realizadas
- `id` (UUID) - Identificador único
- `treino_realizado_id` (UUID) - Referência ao treino realizado
- `numero_serie` (INTEGER) - Número da série
- `carga` (TEXT) - Carga utilizada (em kg)
- `repeticoes` (INTEGER) - Repetições realizadas
- `concluida` (TEXT) - Se foi concluída (true/false)
- `observacoes` (TEXT) - Observações
- `created_at` (TIMESTAMP)

## Próximos Passos

Após criar as tabelas, você poderá:
1. ✅ Criar fichas de treino no painel admin
2. ✅ Adicionar exercícios às fichas
3. ✅ Vincular vídeos aos exercícios
4. ✅ Atribuir fichas aos alunos
5. ✅ Alunos poderão registrar seus treinos
6. ✅ Acompanhar progresso dos alunos

## Segurança (RLS)

As políticas de Row Level Security (RLS) estão configuradas para permitir acesso total por enquanto. Você pode ajustar conforme necessário para:
- Admins: acesso total
- Alunos: apenas suas próprias fichas e registros
