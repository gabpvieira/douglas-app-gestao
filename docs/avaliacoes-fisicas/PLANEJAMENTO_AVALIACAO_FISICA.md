# Planejamento - Sistema de Avaliação Física

## 1. Objetivo
Criar uma página completa para o personal trainer realizar avaliações físicas de seus alunos, tanto online quanto presencial, com registro de medidas antropométricas, composição corporal, testes físicos e fotos de progresso.

## 2. Estrutura de Dados

### Tabela: avaliacoes_fisicas
```sql
- id (uuid, PK)
- aluno_id (uuid, FK -> alunos.id)
- data_avaliacao (date)
- tipo (enum: 'online', 'presencial')
- status (enum: 'agendada', 'concluida', 'cancelada')

-- Medidas Antropométricas
- peso (decimal)
- altura (integer) -- cm
- imc (decimal) -- calculado
- circunferencia_pescoco (decimal) -- cm
- circunferencia_torax (decimal)
- circunferencia_cintura (decimal)
- circunferencia_abdomen (decimal)
- circunferencia_quadril (decimal)
- circunferencia_braco_direito (decimal)
- circunferencia_braco_esquerdo (decimal)
- circunferencia_antebraco_direito (decimal)
- circunferencia_antebraco_esquerdo (decimal)
- circunferencia_coxa_direita (decimal)
- circunferencia_coxa_esquerda (decimal)
- circunferencia_panturrilha_direita (decimal)
- circunferencia_panturrilha_esquerda (decimal)

-- Composição Corporal
- percentual_gordura (decimal)
- massa_gorda (decimal) -- kg
- massa_magra (decimal) -- kg
- massa_muscular (decimal) -- kg
- agua_corporal (decimal) -- %
- gordura_visceral (integer) -- nível

-- Dobras Cutâneas (mm)
- dobra_triceps (decimal)
- dobra_biceps (decimal)
- dobra_subescapular (decimal)
- dobra_suprailiaca (decimal)
- dobra_abdominal (decimal)
- dobra_coxa (decimal)
- dobra_panturrilha (decimal)

-- Testes Físicos
- flexao_bracos (integer) -- repetições
- abdominal (integer) -- repetições
- agachamento (integer) -- repetições
- prancha (integer) -- segundos
- teste_cooper (decimal) -- metros
- vo2_max (decimal) -- ml/kg/min

-- Pressão e Frequência
- pressao_arterial_sistolica (integer) -- mmHg
- pressao_arterial_diastolica (integer) -- mmHg
- frequencia_cardiaca_repouso (integer) -- bpm

-- Observações
- observacoes (text)
- objetivos (text)
- restricoes_medicas (text)

-- Fotos
- foto_frente_url (text)
- foto_costas_url (text)
- foto_lateral_direita_url (text)
- foto_lateral_esquerda_url (text)

-- Metadata
- created_at (timestamp)
- updated_at (timestamp)
```

## 3. Funcionalidades

### 3.1 Listagem de Avaliações
- Cards com informações resumidas de cada avaliação
- Filtros: aluno, data, tipo, status
- Busca por nome do aluno
- Ordenação por data (mais recente primeiro)
- Badge de status colorido
- Ações: visualizar, editar, deletar, comparar

### 3.2 Nova Avaliação
- Seleção do aluno (dropdown com busca)
- Seleção de data
- Tipo: online ou presencial
- Formulário em abas/seções:
  1. **Dados Básicos**: peso, altura, IMC (auto-calculado)
  2. **Circunferências**: todas as medidas de perímetro
  3. **Composição Corporal**: % gordura, massa magra, etc.
  4. **Dobras Cutâneas**: medidas em mm
  5. **Testes Físicos**: flexões, abdominais, etc.
  6. **Pressão e Frequência**: PA e FC
  7. **Fotos**: upload de 4 fotos (frente, costas, laterais)
  8. **Observações**: notas, objetivos, restrições

### 3.3 Visualização Detalhada
- Todas as informações da avaliação
- Gráficos de evolução (se houver avaliações anteriores)
- Comparação com avaliação anterior
- Galeria de fotos
- Botão para editar

### 3.4 Edição
- Mesmo formulário da criação, preenchido com dados existentes
- Possibilidade de atualizar fotos

### 3.5 Comparação de Avaliações
- Selecionar 2 avaliações do mesmo aluno
- Tabela comparativa lado a lado
- Indicadores de melhora/piora (setas, cores)
- Gráficos de evolução

## 4. Design Visual

### Padrão a seguir:
- Background: `bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950`
- Cards: `bg-gray-900/50 backdrop-blur border-gray-800`
- Botões primários: gradiente azul `from-blue-600 to-blue-700`
- Texto: branco/cinza claro
- Ícones: Lucide React
- Componentes: Radix UI (shadcn/ui)
- Responsivo: mobile-first

### Layout:
- PageHeader com título, descrição e botão "Nova Avaliação"
- Card de filtros (busca, filtro por aluno, data, tipo)
- Grid de cards de avaliações (responsivo)
- Modais para criar/editar/visualizar

## 5. Hooks e Integração

### Hook: `useAvaliacoesFisicas.ts`
```typescript
- useAvaliacoes() // listar todas
- useAvaliacoesByAluno(alunoId) // por aluno
- useAvaliacaoById(id) // detalhes
- useCreateAvaliacao() // criar
- useUpdateAvaliacao() // atualizar
- useDeleteAvaliacao() // deletar
- useCompareAvaliacoes(id1, id2) // comparar
```

### Integração Supabase:
- Queries diretas do frontend
- RLS policies para segurança
- Storage para fotos (bucket: `avaliacoes-fisicas`)

## 6. Validações

- Peso: 30-300 kg
- Altura: 100-250 cm
- Circunferências: 10-200 cm
- % Gordura: 3-60%
- Pressão: 60-250 mmHg
- FC: 30-220 bpm
- Fotos: max 5MB, formatos: jpg, png, webp

## 7. Cálculos Automáticos

- **IMC**: peso / (altura/100)²
- **Massa Gorda**: peso × (% gordura / 100)
- **Massa Magra**: peso - massa gorda
- **Classificação IMC**: abaixo do peso, normal, sobrepeso, obesidade

## 8. Arquivos a Criar

1. `scripts/create-avaliacoes-fisicas-table.sql` - Schema SQL
2. `client/src/pages/admin/AvaliacoesFisicas.tsx` - Página principal
3. `client/src/hooks/useAvaliacoesFisicas.ts` - Hook de dados
4. `client/src/components/AvaliacaoFisicaModal.tsx` - Modal criar/editar
5. `client/src/components/AvaliacaoFisicaDetalhes.tsx` - Modal visualização
6. Atualizar `shared/schema.ts` - Adicionar schema Drizzle
7. Atualizar `client/src/components/AdminSidebar.tsx` - Adicionar item menu
8. Atualizar `client/src/App.tsx` - Adicionar rota

## 9. Posição no Menu
- Após "Alunos" (segunda posição)
- Ícone: `ClipboardList` ou `Activity`
- Label: "Avaliações Físicas"
- Rota: `/admin/avaliacoes-fisicas`
- Gradiente: `from-indigo-500 to-purple-500`
