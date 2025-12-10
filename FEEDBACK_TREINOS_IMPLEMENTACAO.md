# Implementação de Feedback de Treinos

## 📋 Visão Geral

Sistema completo de feedback de treinos que permite aos alunos avaliarem seus treinos após a finalização, e aos administradores visualizarem e gerenciarem todos os feedbacks recebidos.

## 🗄️ Estrutura do Banco de Dados

### Tabela: `feedback_treinos`

```sql
CREATE TABLE feedback_treinos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  treino_id UUID NOT NULL,
  estrelas INTEGER NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos:**
- `id`: Identificador único do feedback
- `aluno_id`: Referência ao aluno que deu o feedback
- `treino_id`: ID da sessão de treino (ficha_aluno_id)
- `estrelas`: Avaliação de 1 a 5 estrelas (obrigatório)
- `comentario`: Comentário opcional do aluno
- `created_at`: Data e hora do feedback

**Índices:**
- `idx_feedback_treinos_aluno_id`: Busca por aluno
- `idx_feedback_treinos_treino_id`: Busca por treino
- `idx_feedback_treinos_created_at`: Ordenação por data
- `idx_feedback_treinos_estrelas`: Filtro por avaliação

### Políticas RLS (Row Level Security)

1. **Alunos podem criar seus feedbacks**
   - Permite INSERT apenas para o próprio aluno

2. **Alunos podem ver seus feedbacks**
   - Permite SELECT apenas dos próprios feedbacks

3. **Admins podem ver todos os feedbacks**
   - Permite SELECT para usuários com tipo 'admin'

4. **Admins podem deletar feedbacks**
   - Permite DELETE para usuários com tipo 'admin'

## 📁 Arquivos Criados/Modificados

### 1. Schema TypeScript
**Arquivo:** `shared/schema.ts`

```typescript
export const feedbackTreinos = pgTable("feedback_treinos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  alunoId: varchar("aluno_id").notNull().references(() => alunos.id, { onDelete: 'cascade' }),
  treinoId: varchar("treino_id").notNull(),
  estrelas: integer("estrelas").notNull(),
  comentario: text("comentario"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertFeedbackTreinoSchema = createInsertSchema(feedbackTreinos).omit({
  id: true,
  createdAt: true,
}).extend({
  estrelas: z.number().min(1).max(5),
  comentario: z.string().optional(),
});

export type InsertFeedbackTreino = z.infer<typeof insertFeedbackTreinoSchema>;
export type FeedbackTreino = typeof feedbackTreinos.$inferSelect;
```

### 2. Hook Customizado
**Arquivo:** `client/src/hooks/useFeedbackTreinos.ts`

**Funções exportadas:**
- `useFeedbacksByAluno(alunoId)`: Busca feedbacks de um aluno
- `useFeedbackByTreino(treinoId)`: Busca feedback de um treino específico
- `useFeedbacksAdmin()`: Busca todos os feedbacks (admin) com join de alunos
- `useCreateFeedback()`: Mutation para criar feedback
- `useDeleteFeedback()`: Mutation para deletar feedback (admin)

**Características:**
- Usa TanStack Query para cache e invalidação
- Tratamento de erros com toast notifications
- Query keys organizadas para invalidação eficiente

### 3. Modal de Feedback (Aluno)
**Arquivo:** `client/src/components/FeedbackTreinoModal.tsx`

**Funcionalidades:**
- Avaliação por estrelas (1-5) com hover effect
- Campo de comentário opcional (máx. 500 caracteres)
- Validação: estrelas obrigatórias
- Feedback visual da avaliação (Muito ruim → Excelente)
- Responsivo e acessível

**Props:**
```typescript
interface FeedbackTreinoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (estrelas: number, comentario?: string) => void;
  isLoading?: boolean;
}
```

### 4. Página Admin de Feedbacks
**Arquivo:** `client/src/pages/admin/FeedbacksTreinos.tsx`

**Funcionalidades:**
- Dashboard com estatísticas:
  - Total de feedbacks
  - Média de avaliação
  - Distribuição por estrelas (gráfico de barras)
- Filtros:
  - Busca por nome do aluno
  - Filtro por quantidade de estrelas
- Tabela de feedbacks com:
  - Nome e email do aluno
  - Avaliação em estrelas
  - Comentário (com line-clamp)
  - Data e hora
  - Ação de deletar
- Confirmação antes de deletar
- Responsivo e paginado

### 5. Integração no Fluxo de Treino
**Arquivo:** `client/src/pages/aluno/TreinoExecucao.tsx`

**Modificações:**
- Importação do `FeedbackTreinoModal` e `useCreateFeedback`
- Estado para controlar modal de feedback
- Após finalizar treino com sucesso:
  1. Fecha modal de finalização
  2. Abre modal de feedback
  3. Salva feedback (opcional)
  4. Redireciona para lista de treinos
- Permite pular feedback (fecha modal e redireciona)

**Fluxo:**
```
Finalizar Treino → Salvar Dados → Modal Feedback → [Enviar/Pular] → Lista de Treinos
```

### 6. Roteamento
**Arquivo:** `client/src/App.tsx`

Adicionada rota:
```typescript
<Route path="/admin/feedbacks" component={FeedbacksTreinos} />
```

### 7. Menu Admin
**Arquivo:** `client/src/components/AdminSidebar.tsx`

Adicionado item de menu:
```typescript
{ 
  icon: Star, 
  label: "Feedbacks de Treinos", 
  href: "/admin/feedbacks"
}
```

## 🎯 Fluxo de Uso

### Painel do Aluno

1. **Durante o Treino:**
   - Aluno executa exercícios normalmente
   - Registra séries, pesos e repetições

2. **Ao Finalizar:**
   - Clica em "Finalizar Treino"
   - Vê resumo do treino (tempo, exercícios, séries, volume)
   - Confirma finalização

3. **Modal de Feedback:**
   - Aparece automaticamente após salvar treino
   - Aluno seleciona de 1 a 5 estrelas (obrigatório)
   - Pode adicionar comentário opcional
   - Opções:
     - "Enviar Feedback": Salva e redireciona
     - "Cancelar" ou fechar modal: Pula feedback e redireciona

### Painel do Admin

1. **Acessar Feedbacks:**
   - Menu lateral → "Feedbacks de Treinos"

2. **Visualizar Dashboard:**
   - Cards com estatísticas gerais
   - Gráfico de distribuição de estrelas

3. **Filtrar e Buscar:**
   - Campo de busca por nome do aluno
   - Dropdown para filtrar por quantidade de estrelas

4. **Gerenciar:**
   - Ver detalhes de cada feedback na tabela
   - Deletar feedbacks indesejados (com confirmação)

## 🔒 Segurança

### RLS Policies
- Alunos só podem criar e ver seus próprios feedbacks
- Admins podem ver e deletar todos os feedbacks
- Validação no banco: estrelas entre 1 e 5

### Validação Frontend
- Zod schema valida dados antes de enviar
- Comentário limitado a 500 caracteres
- Estrelas obrigatórias (botão desabilitado se não selecionado)

### Sanitização
- Supabase RLS garante isolamento de dados
- Queries parametrizadas previnem SQL injection
- Toast notifications para feedback de erros

## 📊 Queries e Performance

### Índices Criados
```sql
CREATE INDEX idx_feedback_treinos_aluno_id ON feedback_treinos(aluno_id);
CREATE INDEX idx_feedback_treinos_treino_id ON feedback_treinos(treino_id);
CREATE INDEX idx_feedback_treinos_created_at ON feedback_treinos(created_at DESC);
CREATE INDEX idx_feedback_treinos_estrelas ON feedback_treinos(estrelas);
```

### Query Admin (com JOIN)
```typescript
const { data } = await supabase
  .from("feedback_treinos")
  .select(`
    *,
    alunos!inner(
      id,
      user_profile_id,
      users_profile!inner(
        nome,
        email
      )
    )
  `)
  .order("created_at", { ascending: false });
```

### Cache Strategy
- TanStack Query com stale time configurado
- Invalidação automática após mutations
- Query keys organizadas por contexto:
  - `["feedbacks"]`: Todos os feedbacks
  - `["feedbacks", "aluno", alunoId]`: Por aluno
  - `["feedbacks", "treino", treinoId]`: Por treino
  - `["feedbacks", "admin"]`: Admin view

## 🎨 UI/UX

### Componentes Radix UI Utilizados
- Dialog (modais)
- Button
- Input
- Select
- Textarea
- Label
- Table
- AlertDialog (confirmação de exclusão)
- Badge

### Responsividade
- Mobile-first design
- Breakpoints: `sm:`, `md:`, `lg:`
- Tabelas com scroll horizontal em mobile
- Modais adaptados para telas pequenas

### Acessibilidade
- Labels associados a inputs
- Botões com estados disabled
- Feedback visual de hover e focus
- Mensagens de erro claras
- Confirmação antes de ações destrutivas

## 🧪 Testes Sugeridos

### Testes Funcionais
1. ✅ Criar feedback após finalizar treino
2. ✅ Criar feedback apenas com estrelas (sem comentário)
3. ✅ Pular feedback e verificar redirecionamento
4. ✅ Visualizar feedbacks no painel admin
5. ✅ Filtrar feedbacks por aluno
6. ✅ Filtrar feedbacks por estrelas
7. ✅ Deletar feedback (admin)
8. ✅ Verificar estatísticas no dashboard

### Testes de Segurança
1. ✅ Aluno não pode ver feedbacks de outros alunos
2. ✅ Aluno não pode deletar feedbacks
3. ✅ Validação de estrelas (1-5)
4. ✅ RLS policies funcionando corretamente

### Testes de Performance
1. ✅ Índices criados corretamente
2. ✅ Queries otimizadas com JOINs
3. ✅ Cache do TanStack Query funcionando

## 📝 Notas de Implementação

### Decisões Técnicas

1. **treino_id como UUID genérico:**
   - Permite flexibilidade para diferentes tipos de treino
   - Atualmente usa `ficha_aluno_id`
   - Pode ser expandido para outros tipos no futuro

2. **Comentário opcional:**
   - Reduz fricção no fluxo do aluno
   - Aumenta taxa de resposta
   - Ainda captura dados valiosos (estrelas)

3. **Modal após finalização:**
   - Momento ideal para capturar feedback
   - Aluno está engajado e com treino fresco na memória
   - Permite pular sem bloquear o fluxo

4. **Estatísticas no admin:**
   - Visão rápida da satisfação geral
   - Identifica tendências e problemas
   - Ajuda na tomada de decisões

### Possíveis Melhorias Futuras

1. **Análise de Sentimento:**
   - Processar comentários com NLP
   - Identificar padrões e temas comuns

2. **Notificações:**
   - Alertar admin sobre feedbacks negativos
   - Lembrar alunos de dar feedback

3. **Relatórios:**
   - Exportar feedbacks para CSV/PDF
   - Gráficos de evolução temporal
   - Comparação entre alunos/treinos

4. **Gamificação:**
   - Recompensar alunos por dar feedback
   - Badges por consistência

5. **Feedback por Exercício:**
   - Permitir avaliar exercícios individuais
   - Identificar exercícios problemáticos

## 🚀 Deploy

### Checklist
- [x] Tabela criada no Supabase
- [x] RLS policies configuradas
- [x] Índices criados
- [x] Schema TypeScript atualizado
- [x] Hooks implementados
- [x] Componentes criados
- [x] Rotas configuradas
- [x] Menu atualizado
- [x] Testes manuais realizados

### Comandos
```bash
# Verificar tipos
npm run check

# Build
npm run build

# Deploy (Vercel)
git push origin main
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs do Supabase
2. Verificar console do navegador
3. Testar RLS policies no Supabase Dashboard
4. Verificar invalidação de cache do TanStack Query

## 📄 Licença

Este código faz parte do projeto Consultoria Fitness Douglas.
