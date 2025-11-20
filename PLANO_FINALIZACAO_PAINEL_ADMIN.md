# 🎯 PLANO DE FINALIZAÇÃO - PAINEL ADMIN

## 📊 ANÁLISE ATUAL DO PROJETO

**Data**: 20/11/2025  
**Projeto**: Douglas Personal - Plataforma de Consultoria Fitness  
**Supabase Project**: cbdonvzifbkayrvnlskp (São Paulo - sa-east-1)

---

## ✅ STATUS ATUAL

### Backend (70% Completo)
- ✅ Banco de dados: 12 tabelas criadas
- ✅ Storage: 4 buckets configurados
- ✅ RLS: Ativado (políticas de desenvolvimento)
- ✅ APIs: 7 rotas implementadas
- ⏳ Upload de arquivos: Parcial
- ⏳ Integração completa: Faltam ajustes

### Frontend (40% Completo)
- ✅ Componentes UI: Base completa
- ✅ Hooks React Query: 3 de 10
- ⏳ Páginas integradas: 2 de 15
- ⏳ Autenticação: Mock (precisa real)
- ⏳ Upload de arquivos: Parcial

### Supabase (90% Completo)
- ✅ 12 Tabelas criadas e configuradas
- ✅ 4 Buckets de storage
- ✅ RLS ativado em todas as tabelas
- ⏳ Políticas de segurança restritivas
- ⏳ Supabase Auth configurado

---

## 📋 TABELAS DO BANCO DE DADOS

### ✅ Tabelas Criadas (12/12)
1. **users_profile** - Perfis de usuários
2. **alunos** - Dados dos alunos
3. **treinos_pdf** - PDFs de treino
4. **treinos_video** - Vídeos de treino
5. **planos_alimentares** - Planos alimentares
6. **evolucoes** - Evolução física
7. **fotos_progresso** - Fotos de progresso
8. **blocos_horarios** - Horários disponíveis
9. **agendamentos** - Agendamentos
10. **excecoes_disponibilidade** - Feriados/férias
11. **assinaturas** - Planos e assinaturas
12. **pagamentos** - Histórico de pagamentos

---

## 🗂️ ROTAS DO BACKEND

### ✅ Rotas Implementadas (7/7)

- `server/routes/assinaturas.ts`
- `server/routes/evolucoes.ts`
- `server/routes/fotosProgresso.ts`
- `server/routes/pagamentos.ts`
- `server/routes/planosAlimentares.ts`
- `server/routes/treinosPdf.ts`
- `server/routes/treinosVideo.ts`

---

## 🎯 FASES DE IMPLEMENTAÇÃO

---

# FASE 1: CONFIGURAÇÃO E DADOS INICIAIS (2-3 dias)

## 🎯 Objetivo
Configurar ambiente, criar dados de teste e validar conexões

## ✅ Tarefas

### 1.1 Configurar Variáveis de Ambiente
- [ ] Copiar `.env.example` para `.env`
- [ ] Validar todas as chaves do Supabase
- [ ] Testar conexão com banco de dados
- [ ] Verificar buckets de storage

### 1.2 Criar Dados de Teste via MCP
```bash
# Usar MCP Supabase para inserir dados
```

- [ ] Criar 1 usuário admin (Douglas Silva)
- [ ] Criar 5 alunos de teste
- [ ] Criar 3 blocos de horário
- [ ] Criar 2 vídeos de treino de exemplo
- [ ] Criar 1 assinatura ativa para cada aluno

### 1.3 Validar Storage Buckets
- [ ] Verificar bucket `treinos-pdf` (privado)
- [ ] Verificar bucket `treinos-video` (privado)
- [ ] Verificar bucket `fotos-perfil` (público)
- [ ] Verificar bucket `fotos-progresso` (privado)
- [ ] Testar upload manual de arquivo teste

### 1.4 Criar Views no Supabase (Opcional)
- [ ] View: `alunos_completos` (JOIN users_profile + alunos)
- [ ] View: `assinaturas_ativas` (filtro status='ativa')
- [ ] View: `agendamentos_futuros` (data >= hoje)

---

# FASE 2: BACKEND - ROTAS E UPLOAD (3-4 dias)

## 🎯 Objetivo
Completar todas as rotas do backend e implementar upload de arquivos

## ✅ Tarefas

### 2.1 Instalar Dependências
```bash
npm install multer @types/multer
```

### 2.2 Configurar Multer
- [ ] Criar `server/upload.ts`
- [ ] Configurar memoryStorage
- [ ] Adicionar validação de tipos
- [ ] Adicionar limite de tamanho
- [ ] Testar upload básico

### 2.3 Atualizar Rotas de Treinos PDF

- [ ] POST `/api/admin/treinos-pdf/upload` - Upload de PDF
- [ ] GET `/api/admin/treinos-pdf/:alunoId` - Listar PDFs do aluno
- [ ] GET `/api/treinos-pdf/:id/download` - Gerar URL assinada
- [ ] DELETE `/api/admin/treinos-pdf/:id` - Deletar PDF
- [ ] Testar todas as rotas com Postman/Thunder Client

### 2.4 Atualizar Rotas de Treinos Vídeo
- [ ] POST `/api/admin/treinos-video/upload` - Upload de vídeo
- [ ] GET `/api/treinos-video` - Listar vídeos (com filtro objetivo)
- [ ] GET `/api/treinos-video/:id/stream` - URL assinada para streaming
- [ ] PUT `/api/admin/treinos-video/:id` - Atualizar vídeo
- [ ] DELETE `/api/admin/treinos-video/:id` - Deletar vídeo
- [ ] Testar todas as rotas

### 2.5 Atualizar Rotas de Planos Alimentares
- [ ] POST `/api/admin/planos-alimentares` - Criar plano
- [ ] GET `/api/admin/planos-alimentares/:alunoId` - Listar planos do aluno
- [ ] GET `/api/aluno/plano-alimentar` - Obter plano atual
- [ ] PUT `/api/admin/planos-alimentares/:id` - Atualizar plano
- [ ] DELETE `/api/admin/planos-alimentares/:id` - Deletar plano
- [ ] Testar todas as rotas

### 2.6 Atualizar Rotas de Evolução
- [ ] POST `/api/aluno/evolucao` - Registrar evolução
- [ ] GET `/api/aluno/evolucao` - Histórico de evolução
- [ ] GET `/api/aluno/evolucao/stats` - Estatísticas
- [ ] PUT `/api/aluno/evolucao/:id` - Atualizar registro
- [ ] DELETE `/api/aluno/evolucao/:id` - Deletar registro
- [ ] Testar todas as rotas

### 2.7 Atualizar Rotas de Fotos de Progresso
- [ ] POST `/api/aluno/fotos-progresso/upload` - Upload de foto
- [ ] GET `/api/aluno/fotos-progresso` - Listar fotos
- [ ] GET `/api/aluno/fotos-progresso/:data` - Fotos por data
- [ ] DELETE `/api/aluno/fotos-progresso/:id` - Deletar foto
- [ ] Testar todas as rotas

### 2.8 Validar Rotas Existentes
- [ ] Testar rotas de alunos (CRUD completo)
- [ ] Testar rotas de agendamentos
- [ ] Testar rotas de blocos de horário
- [ ] Testar rotas de assinaturas
- [ ] Testar rotas de pagamentos

---

# FASE 3: FRONTEND - HOOKS E COMPONENTES (4-5 dias)

## 🎯 Objetivo
Criar todos os hooks React Query e componentes necessários

## ✅ Tarefas

### 3.1 Criar Hooks Faltantes

#### Hook: useTreinosVideo
- [ ] Criar `client/src/hooks/useTreinosVideo.ts`
- [ ] `useTreinosVideo(objetivo?)` - Listar vídeos
- [ ] `useUploadTreinoVideo()` - Upload de vídeo
- [ ] `useUpdateTreinoVideo()` - Atualizar vídeo
- [ ] `useDeleteTreinoVideo()` - Deletar vídeo
- [ ] `useStreamTreinoVideo()` - Obter URL de streaming

#### Hook: usePlanosAlimentares
- [ ] Criar `client/src/hooks/usePlanosAlimentares.ts`
- [ ] `usePlanosAlimentares(alunoId)` - Listar planos
- [ ] `useMyPlanoAlimentar()` - Plano atual do aluno
- [ ] `useCreatePlanoAlimentar()` - Criar plano
- [ ] `useUpdatePlanoAlimentar()` - Atualizar plano
- [ ] `useDeletePlanoAlimentar()` - Deletar plano

#### Hook: useFotosProgresso
- [ ] Criar `client/src/hooks/useFotosProgresso.ts`
- [ ] `useFotosProgresso(alunoId)` - Listar fotos
- [ ] `useUploadFotoProgresso()` - Upload de foto
- [ ] `useDeleteFotoProgresso()` - Deletar foto

#### Hook: useAssinaturas
- [ ] Criar `client/src/hooks/useAssinaturas.ts`
- [ ] `useAssinaturas()` - Listar todas (admin)
- [ ] `useMyAssinatura()` - Assinatura do aluno
- [ ] `useCreateAssinatura()` - Criar assinatura
- [ ] `useUpdateAssinatura()` - Atualizar assinatura
- [ ] `useCancelAssinatura()` - Cancelar assinatura

#### Hook: usePagamentos
- [ ] Criar `client/src/hooks/usePagamentos.ts`
- [ ] `usePagamentos(assinaturaId?)` - Listar pagamentos
- [ ] `useMyPagamentos()` - Pagamentos do aluno
- [ ] `useCreatePagamento()` - Registrar pagamento

#### Hook: useAgendamentos
- [ ] Criar `client/src/hooks/useAgendamentos.ts`
- [ ] `useAgendamentos(data?)` - Listar agendamentos
- [ ] `useMyAgendamentos()` - Agendamentos do aluno
- [ ] `useCreateAgendamento()` - Criar agendamento
- [ ] `useUpdateAgendamento()` - Atualizar agendamento
- [ ] `useCancelAgendamento()` - Cancelar agendamento

#### Hook: useBlocosHorarios
- [ ] Criar `client/src/hooks/useBlocosHorarios.ts`
- [ ] `useBlocosHorarios()` - Listar blocos
- [ ] `useCreateBlocoHorario()` - Criar bloco
- [ ] `useUpdateBlocoHorario()` - Atualizar bloco
- [ ] `useDeleteBlocoHorario()` - Deletar bloco

### 3.2 Criar Componentes de Upload

#### UploadTreinoVideo
- [ ] Criar `client/src/components/UploadTreinoVideo.tsx`
- [ ] Dialog modal
- [ ] Formulário (nome, objetivo, descrição, duração)
- [ ] Upload de vídeo com progress
- [ ] Validação de tamanho (max 500MB)
- [ ] Preview de vídeo

#### UploadFotoProgresso
- [ ] Criar `client/src/components/UploadFotoProgresso.tsx`
- [ ] Dialog modal
- [ ] Seleção de data
- [ ] Upload de 3 fotos (frente, lateral, costas)
- [ ] Preview de imagens
- [ ] Validação de tamanho (max 5MB)

### 3.3 Criar Componentes de Formulário

#### PlanoAlimentarForm
- [ ] Criar `client/src/components/PlanoAlimentarForm.tsx`
- [ ] Editor de texto rico (TipTap ou similar)
- [ ] Campo título
- [ ] Campo observações
- [ ] Botões salvar/cancelar

#### EvolucaoForm
- [ ] Criar `client/src/components/EvolucaoForm.tsx`
- [ ] Campos: peso, gordura corporal, massa muscular
- [ ] Campos de medidas (peito, cintura, quadril, braço, coxa)
- [ ] Campo observações
- [ ] Validação de valores

#### AssinaturaCard
- [ ] Criar `client/src/components/AssinaturaCard.tsx`
- [ ] Exibir tipo de plano
- [ ] Exibir datas (início/fim)
- [ ] Exibir status
- [ ] Botão cancelar (se ativa)

---

# FASE 4: FRONTEND - INTEGRAÇÃO DE PÁGINAS (3-4 dias)

## 🎯 Objetivo
Conectar todas as páginas às APIs reais

## ✅ Tarefas

### 4.1 Páginas Admin

#### TreinosVideo.tsx
- [ ] Substituir dados mock por `useTreinosVideo()`
- [ ] Integrar `UploadTreinoVideo`
- [ ] Adicionar filtro por objetivo
- [ ] Implementar edição de vídeo
- [ ] Implementar exclusão com confirmação

#### TreinosPdf.tsx
- [ ] Integrar `useTreinosPdf()`
- [ ] Integrar `UploadTreinoPdf`
- [ ] Implementar download de PDF
- [ ] Implementar exclusão com confirmação

#### PlanosAlimentares.tsx
- [ ] Integrar `usePlanosAlimentares()`
- [ ] Integrar `PlanoAlimentarForm`
- [ ] Implementar criação de plano
- [ ] Implementar edição de plano
- [ ] Implementar exclusão com confirmação

#### Pagamentos.tsx
- [ ] Integrar `usePagamentos()`
- [ ] Exibir lista de pagamentos
- [ ] Filtros por status
- [ ] Filtros por data
- [ ] Exportar relatório (CSV)

#### AgendaProfissional.tsx
- [ ] Integrar `useAgendamentos()`
- [ ] Integrar `useBlocosHorarios()`
- [ ] Visualização de calendário
- [ ] Criar/editar blocos de horário
- [ ] Gerenciar agendamentos

### 4.2 Páginas Aluno

#### MyWorkouts.tsx
- [ ] Integrar `useMyTreinosPdf()`
- [ ] Exibir lista de treinos
- [ ] Implementar download de PDF
- [ ] Exibir data de upload

#### Progresso.tsx
- [ ] Integrar `useEvolucao()`
- [ ] Integrar `useFotosProgresso()`
- [ ] Integrar `EvolucaoForm`
- [ ] Integrar `UploadFotoProgresso`
- [ ] Exibir gráficos de evolução
- [ ] Comparação de fotos

#### MySchedule.tsx
- [ ] Integrar `useMyAgendamentos()`
- [ ] Exibir agendamentos futuros
- [ ] Permitir cancelamento
- [ ] Visualização de calendário

#### PlanosAlimentares.tsx (Aluno)
- [ ] Integrar `useMyPlanoAlimentar()`
- [ ] Exibir plano atual
- [ ] Renderizar HTML do plano
- [ ] Exibir observações

---

# FASE 5: AUTENTICAÇÃO REAL (2-3 dias)

## 🎯 Objetivo
Implementar autenticação real com Supabase Auth

## ✅ Tarefas

### 5.1 Configurar Supabase Auth
- [ ] Ativar Email Auth no Supabase Dashboard
- [ ] Configurar templates de email
- [ ] Configurar redirect URLs
- [ ] Testar signup/login manual

### 5.2 Criar Context de Autenticação
- [ ] Criar `client/src/contexts/AuthContext.tsx`
- [ ] Provider com estado do usuário
- [ ] Funções: login, logout, signup
- [ ] Auto-refresh de token
- [ ] Persistência de sessão

### 5.3 Criar Páginas de Auth
- [ ] Criar `client/src/pages/Login.tsx`
- [ ] Criar `client/src/pages/Signup.tsx`
- [ ] Criar `client/src/pages/ForgotPassword.tsx`
- [ ] Formulários com validação
- [ ] Loading states
- [ ] Error handling

### 5.4 Proteger Rotas
- [ ] Criar `ProtectedRoute` component
- [ ] Proteger rotas `/admin/*`
- [ ] Proteger rotas `/aluno/*`
- [ ] Redirect para login se não autenticado
- [ ] Verificar tipo de usuário (admin/aluno)

### 5.5 Atualizar Backend
- [ ] Middleware de autenticação
- [ ] Validar JWT em todas as rotas protegidas
- [ ] Extrair userId do token
- [ ] Verificar permissões por tipo de usuário

---

# FASE 6: SEGURANÇA E RLS (2 dias)

## 🎯 Objetivo
Implementar políticas de segurança restritivas

## ✅ Tarefas

### 6.1 Criar Políticas RLS

#### users_profile
```sql
-- Admin: acesso total
-- Aluno: apenas próprio perfil
```
- [ ] SELECT: Admin vê todos, Aluno vê próprio
- [ ] UPDATE: Admin atualiza todos, Aluno atualiza próprio
- [ ] INSERT: Apenas sistema (signup)
- [ ] DELETE: Apenas admin

#### alunos
- [ ] SELECT: Admin vê todos, Aluno vê próprio
- [ ] UPDATE: Admin atualiza todos, Aluno atualiza próprio
- [ ] INSERT: Apenas admin
- [ ] DELETE: Apenas admin

#### treinos_pdf
- [ ] SELECT: Admin vê todos, Aluno vê próprios
- [ ] INSERT: Apenas admin
- [ ] DELETE: Apenas admin

#### treinos_video
- [ ] SELECT: Todos autenticados
- [ ] INSERT: Apenas admin
- [ ] UPDATE: Apenas admin
- [ ] DELETE: Apenas admin

#### planos_alimentares
- [ ] SELECT: Admin vê todos, Aluno vê próprio
- [ ] INSERT: Apenas admin
- [ ] UPDATE: Apenas admin
- [ ] DELETE: Apenas admin

#### evolucoes
- [ ] SELECT: Admin vê todos, Aluno vê próprio
- [ ] INSERT: Admin e próprio aluno
- [ ] UPDATE: Admin e próprio aluno
- [ ] DELETE: Admin e próprio aluno

#### fotos_progresso
- [ ] SELECT: Admin vê todos, Aluno vê próprias
- [ ] INSERT: Admin e próprio aluno
- [ ] DELETE: Admin e próprio aluno

#### agendamentos
- [ ] SELECT: Admin vê todos, Aluno vê próprios
- [ ] INSERT: Admin e próprio aluno
- [ ] UPDATE: Admin e próprio aluno (cancelar)
- [ ] DELETE: Apenas admin

#### assinaturas
- [ ] SELECT: Admin vê todas, Aluno vê própria
- [ ] INSERT: Apenas admin
- [ ] UPDATE: Apenas admin
- [ ] DELETE: Apenas admin

#### pagamentos
- [ ] SELECT: Admin vê todos, Aluno vê próprios
- [ ] INSERT: Apenas sistema (webhook)
- [ ] UPDATE: Apenas sistema

### 6.2 Configurar Storage Policies
- [ ] `treinos-pdf`: Admin upload, Aluno download próprios
- [ ] `treinos-video`: Admin upload, Todos download
- [ ] `fotos-perfil`: Usuário upload própria, Todos visualizam
- [ ] `fotos-progresso`: Admin e Aluno upload, Apenas próprio visualiza

### 6.3 Testar Segurança
- [ ] Tentar acessar dados de outro usuário
- [ ] Tentar fazer operações não permitidas
- [ ] Validar todas as políticas
- [ ] Testar com diferentes tipos de usuário

---

# FASE 7: TESTES E VALIDAÇÃO (2-3 dias)

## 🎯 Objetivo
Testar todas as funcionalidades end-to-end

## ✅ Tarefas

### 7.1 Testes de CRUD
- [ ] Testar criação de aluno
- [ ] Testar atualização de aluno
- [ ] Testar exclusão de aluno
- [ ] Testar upload de PDF
- [ ] Testar upload de vídeo
- [ ] Testar upload de foto
- [ ] Testar criação de plano alimentar
- [ ] Testar registro de evolução
- [ ] Testar criação de agendamento
- [ ] Testar criação de assinatura

### 7.2 Testes de Fluxo
- [ ] Fluxo completo: Cadastro de aluno
- [ ] Fluxo completo: Upload e download de treino
- [ ] Fluxo completo: Criação e visualização de plano
- [ ] Fluxo completo: Registro de evolução
- [ ] Fluxo completo: Agendamento de horário
- [ ] Fluxo completo: Criação de assinatura

### 7.3 Testes de Segurança
- [ ] Login como admin
- [ ] Login como aluno
- [ ] Tentar acessar área admin como aluno
- [ ] Tentar acessar dados de outro aluno
- [ ] Validar expiração de token

### 7.4 Testes de Performance
- [ ] Testar upload de arquivo grande (500MB)
- [ ] Testar listagem com muitos registros
- [ ] Testar queries complexas
- [ ] Verificar índices do banco

### 7.5 Testes de UI/UX
- [ ] Testar responsividade mobile
- [ ] Testar loading states
- [ ] Testar error states
- [ ] Testar toast notifications
- [ ] Testar navegação entre páginas

---

# FASE 8: MELHORIAS E POLISH (2-3 dias)

## 🎯 Objetivo
Adicionar melhorias de UX e funcionalidades extras

## ✅ Tarefas

### 8.1 Melhorias de UX
- [ ] Adicionar skeleton loaders
- [ ] Melhorar mensagens de erro
- [ ] Adicionar confirmações de ações críticas
- [ ] Melhorar feedback visual
- [ ] Adicionar animações suaves

### 8.2 Funcionalidades Extras
- [ ] Busca e filtros avançados
- [ ] Ordenação de listas
- [ ] Paginação de resultados
- [ ] Exportar dados (CSV/PDF)
- [ ] Notificações push (opcional)

### 8.3 Dashboard Analytics
- [ ] Total de alunos ativos
- [ ] Total de agendamentos do mês
- [ ] Receita mensal
- [ ] Gráfico de novos alunos
- [ ] Gráfico de pagamentos

### 8.4 Documentação
- [ ] Documentar APIs (Swagger/OpenAPI)
- [ ] Criar README completo
- [ ] Documentar variáveis de ambiente
- [ ] Criar guia de deploy
- [ ] Documentar estrutura do projeto

---

# 📊 RESUMO POR FASE

| Fase | Descrição | Duração | Prioridade |
|------|-----------|---------|------------|
| 1 | Configuração e Dados | 2-3 dias | 🔴 CRÍTICA |
| 2 | Backend - Rotas e Upload | 3-4 dias | 🔴 CRÍTICA |
| 3 | Frontend - Hooks e Componentes | 4-5 dias | 🔴 CRÍTICA |
| 4 | Frontend - Integração | 3-4 dias | 🟡 ALTA |
| 5 | Autenticação Real | 2-3 dias | 🟡 ALTA |
| 6 | Segurança e RLS | 2 dias | 🟡 ALTA |
| 7 | Testes e Validação | 2-3 dias | 🟢 MÉDIA |
| 8 | Melhorias e Polish | 2-3 dias | 🔵 BAIXA |

**TOTAL ESTIMADO**: 20-27 dias (4-5 semanas)

---

# 🎯 PRÓXIMOS PASSOS IMEDIATOS

## 1. Começar Fase 1 (HOJE)
```bash
# 1. Configurar .env
cp .env.example .env

# 2. Testar conexão
npm run dev

# 3. Verificar Supabase Dashboard
# https://supabase.com/dashboard/project/cbdonvzifbkayrvnlskp
```

## 2. Usar MCP para Criar Dados
- Criar alunos de teste
- Criar blocos de horário
- Criar vídeos de exemplo

## 3. Validar Storage
- Testar upload manual
- Verificar políticas

---

# 📝 NOTAS IMPORTANTES

## Dependências a Instalar
```bash
npm install multer @types/multer
npm install @tiptap/react @tiptap/starter-kit  # Editor de texto
npm install recharts  # Gráficos
npm install date-fns  # Manipulação de datas
```

## Variáveis de Ambiente Necessárias
```env
VITE_SUPABASE_URL=https://cbdonvzifbkayrvnlskp.supabase.co
VITE_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
PORT=5000
NODE_ENV=development
```

## Links Úteis
- **Supabase Dashboard**: https://supabase.com/dashboard/project/cbdonvzifbkayrvnlskp
- **Supabase Docs**: https://supabase.com/docs
- **React Query Docs**: https://tanstack.com/query/latest

---

**Última Atualização**: 20/11/2025  
**Status**: 📋 PLANO COMPLETO - PRONTO PARA EXECUÇÃO  
**Próxima Ação**: Iniciar Fase 1
