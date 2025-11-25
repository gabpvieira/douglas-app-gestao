# PAINEL DO ALUNO - PLANEJAMENTO COMPLETO

## 📋 OBJETIVO
Construir painel do aluno com dados reais do Supabase, removendo todos os dados mockados, usando o mesmo tema escuro e design do painel admin.

## 👤 USUÁRIO ALUNO CRIADO
- **Email**: eugabrieldpv@gmail.com
- **Tipo**: aluno
- **Status**: Será criado via SQL

## 🎯 FUNCIONALIDADES DO PAINEL DO ALUNO

### 1. Dashboard Principal (`/aluno/dashboard`)
**Visualizações:**
- Resumo de treinos ativos
- Próximos agendamentos
- Plano alimentar atual
- Progresso recente (peso, medidas)
- Vídeos de treino disponíveis

### 2. Meus Treinos (`/aluno/treinos`)
**Funcionalidades:**
- Listar fichas de treino atribuídas pelo admin
- Ver detalhes de cada ficha (exercícios, séries, repetições)
- Marcar treinos como realizados
- Registrar cargas e repetições executadas
- Ver vídeos dos exercícios
- Histórico de treinos realizados

### 3. Plano Alimentar (`/aluno/nutricao`)
**Funcionalidades:**
- Visualizar plano alimentar atribuído
- Ver refeições e alimentos
- Macros e calorias por refeição
- Observações do nutricionista

### 4. Minha Agenda (`/aluno/agenda`)
**Funcionalidades:**
- Ver agendamentos confirmados
- Solicitar novos agendamentos (se disponível)
- Cancelar agendamentos
- Ver histórico de atendimentos

### 5. Meu Progresso (`/aluno/progresso`)
**Funcionalidades:**
- Gráficos de evolução (peso, gordura, massa muscular)
- Fotos de progresso (frente, lateral, costas)
- Histórico de medidas
- Comparação temporal

### 6. Biblioteca de Vídeos (`/aluno/videos`)
**Funcionalidades:**
- Acessar todos os vídeos de treino
- Filtrar por objetivo/grupo muscular
- Player de vídeo com controles

### 7. Perfil (`/aluno/perfil`)
**Funcionalidades:**
- Ver dados pessoais
- Atualizar foto de perfil
- Ver status da assinatura
- Histórico de pagamentos

## 🗂️ ESTRUTURA DE ARQUIVOS

```
client/src/
├── pages/aluno/
│   ├── Dashboard.tsx          # Dashboard principal
│   ├── MeusTreinos.tsx        # Fichas de treino
│   ├── TreinoDetalhes.tsx     # Detalhes de uma ficha
│   ├── PlanoAlimentar.tsx     # Plano nutricional
│   ├── MinhaAgenda.tsx        # Agendamentos
│   ├── MeuProgresso.tsx       # Evolução e fotos
│   ├── BibliotecaVideos.tsx   # Vídeos disponíveis
│   └── MeuPerfil.tsx          # Perfil e assinatura
├── components/aluno/
│   ├── FichaTreinoCard.tsx    # Card de ficha de treino
│   ├── ExercicioItem.tsx      # Item de exercício
│   ├── ProgressChart.tsx      # Gráfico de progresso
│   ├── AgendamentoCard.tsx    # Card de agendamento
│   └── RefeicaoCard.tsx       # Card de refeição
└── hooks/
    ├── useAlunoTreinos.ts     # Hook para treinos do aluno
    ├── useAlunoProgresso.ts   # Hook para progresso
    └── useAlunoAgenda.ts      # Hook para agenda
```

## 🎨 DESIGN SYSTEM (MESMO DO ADMIN)

### Cores (Dark Mode)
- Background: `bg-gray-950`
- Cards: `bg-gray-900`
- Borders: `border-gray-800`
- Text Primary: `text-gray-100`
- Text Secondary: `text-gray-400`
- Accent: `text-blue-500`
- Success: `text-green-500`
- Warning: `text-yellow-500`

### Componentes UI
- Usar mesmos componentes do admin: Button, Card, Badge, Dialog, etc.
- Layout responsivo mobile-first
- Sidebar com navegação
- Header com avatar e notificações

## 📊 QUERIES SUPABASE

### Dados do Aluno
```typescript
// Buscar perfil do aluno logado
const { data: profile } = await supabase
  .from('users_profile')
  .select('*, alunos(*)')
  .eq('auth_uid', user.id)
  .single();

// Buscar fichas de treino atribuídas
const { data: fichas } = await supabase
  .from('fichas_alunos')
  .select(`
    *,
    fichas_treino(
      *,
      exercicios_ficha(*, treinos_video(*))
    )
  `)
  .eq('aluno_id', alunoId)
  .eq('status', 'ativo');

// Buscar plano alimentar
const { data: plano } = await supabase
  .from('planos_alimentares')
  .select(`
    *,
    refeicoes_plano(
      *,
      alimentos_refeicao(*)
    )
  `)
  .eq('aluno_id', alunoId)
  .order('data_criacao', { ascending: false })
  .limit(1)
  .single();

// Buscar agendamentos
const { data: agendamentos } = await supabase
  .from('agendamentos_presenciais')
  .select('*')
  .eq('aluno_id', alunoId)
  .gte('data_agendamento', new Date().toISOString())
  .order('data_agendamento', { ascending: true });

// Buscar evolução
const { data: evolucoes } = await supabase
  .from('evolucoes')
  .select('*')
  .eq('aluno_id', alunoId)
  .order('data', { ascending: false });

// Buscar fotos de progresso
const { data: fotos } = await supabase
  .from('fotos_progresso')
  .select('*')
  .eq('aluno_id', alunoId)
  .order('data', { ascending: false });

// Buscar assinatura
const { data: assinatura } = await supabase
  .from('assinaturas')
  .select('*, pagamentos(*)')
  .eq('aluno_id', alunoId)
  .eq('status', 'ativa')
  .single();
```

## 🔐 AUTENTICAÇÃO E PROTEÇÃO

### Middleware de Autenticação
- Verificar se usuário está logado
- Verificar se tipo === 'aluno'
- Redirecionar para login se não autenticado
- Redirecionar para /admin se tipo === 'admin'

### RLS Policies (Já configuradas)
- Alunos só veem seus próprios dados
- Queries filtradas por `aluno_id`

## 📱 ROTAS DO ALUNO

```typescript
// App.tsx - Adicionar rotas
<Route path="/aluno/dashboard" component={AlunoDashboard} />
<Route path="/aluno/treinos" component={MeusTreinos} />
<Route path="/aluno/treinos/:id" component={TreinoDetalhes} />
<Route path="/aluno/nutricao" component={PlanoAlimentar} />
<Route path="/aluno/agenda" component={MinhaAgenda} />
<Route path="/aluno/progresso" component={MeuProgresso} />
<Route path="/aluno/videos" component={BibliotecaVideos} />
<Route path="/aluno/perfil" component={MeuPerfil} />
```

## 🚀 ETAPAS DE IMPLEMENTAÇÃO

### FASE 1: Setup e Autenticação ✅
1. Criar usuário aluno no Supabase
2. Criar dados de teste (ficha, plano, agendamento)
3. Configurar proteção de rotas

### FASE 2: Layout e Navegação
1. Criar layout base do aluno (Sidebar + Header)
2. Implementar navegação entre páginas
3. Adicionar componente de avatar e menu

### FASE 3: Dashboard Principal
1. Criar página Dashboard
2. Implementar cards de resumo
3. Conectar com dados reais do Supabase

### FASE 4: Meus Treinos
1. Criar página de listagem de fichas
2. Criar página de detalhes da ficha
3. Implementar registro de treinos realizados
4. Integrar vídeos dos exercícios

### FASE 5: Plano Alimentar
1. Criar página de visualização do plano
2. Exibir refeições e alimentos
3. Mostrar macros e calorias

### FASE 6: Agenda
1. Criar página de agendamentos
2. Listar próximos atendimentos
3. Implementar solicitação de novos agendamentos

### FASE 7: Progresso
1. Criar página de evolução
2. Implementar gráficos de peso/medidas
3. Galeria de fotos de progresso

### FASE 8: Biblioteca de Vídeos
1. Criar página de vídeos
2. Implementar filtros
3. Player de vídeo

### FASE 9: Perfil
1. Criar página de perfil
2. Exibir dados pessoais
3. Mostrar status da assinatura

### FASE 10: Testes e Ajustes
1. Testar todas as funcionalidades
2. Ajustar responsividade
3. Otimizar performance

## 📝 DADOS DE TESTE A CRIAR

```sql
-- Será executado após criar o usuário
-- 1. Criar perfil de usuário
-- 2. Criar registro de aluno
-- 3. Atribuir ficha de treino
-- 4. Criar plano alimentar
-- 5. Criar agendamento
-- 6. Criar evolução inicial
-- 7. Criar assinatura ativa
```

## ✅ CHECKLIST DE VALIDAÇÃO

- [ ] Usuário aluno criado e pode fazer login
- [ ] Dados de teste criados no banco
- [ ] Rotas protegidas funcionando
- [ ] Dashboard exibindo dados reais
- [ ] Fichas de treino carregando
- [ ] Plano alimentar visível
- [ ] Agendamentos listados
- [ ] Progresso com gráficos
- [ ] Vídeos reproduzindo
- [ ] Perfil e assinatura exibidos
- [ ] Design consistente com admin
- [ ] Responsivo em mobile
- [ ] Sem dados mockados

## 🎯 PRÓXIMOS PASSOS

1. ✅ Criar usuário aluno via SQL
2. ✅ Criar dados de teste
3. Implementar FASE 2 (Layout)
4. Implementar FASE 3 (Dashboard)
5. Continuar fases seguintes...
