# 🧪 GUIA DE TESTE - PAINEL DO ALUNO

## ✅ Pré-requisitos
- [x] Servidor rodando em http://localhost:3174
- [x] Usuário aluno criado no Supabase Auth
- [x] Dados de teste no banco de dados

## 🚀 Passo a Passo

### 1. Acessar a Aplicação
```
http://localhost:3174
```

### 2. Fazer Login
**Credenciais:**
- Email: `eugabrieldpv@gmail.com`
- Senha: `@gab123654`

**Passos:**
1. Clicar em "Login" no header
2. Preencher email e senha
3. Clicar em "Entrar"
4. Aguardar redirecionamento

### 3. Verificar Dashboard

#### ✅ Header/Sidebar
- [ ] Logo "Meu Treino" visível
- [ ] Menu de navegação com 7 itens
- [ ] Ícones corretos em cada item
- [ ] Item "Dashboard" destacado (azul)
- [ ] Botão "Sair" no rodapé da sidebar

#### ✅ Cards de Estatísticas
- [ ] **Treinos Ativos**: Mostra "1"
- [ ] **Agendamentos**: Mostra "2"
- [ ] **Peso Atual**: Mostra "84kg"
- [ ] **Calorias/Dia**: Mostra "2800"

#### ✅ Seção Meus Treinos
- [ ] Título "Meus Treinos" visível
- [ ] Botão "Ver todos" presente
- [ ] Card com "Full Body Iniciante"
- [ ] Mostra quantidade de exercícios
- [ ] Data de término: "23/12/2025"
- [ ] Badge "Ativo" em verde

#### ✅ Seção Próximos Agendamentos
- [ ] Título "Próximos Agendamentos" visível
- [ ] Botão "Ver todos" presente
- [ ] **Agendamento 1**:
  - Data: 27/11/2025
  - Horário: 14:00 - 15:00
  - Observação: "Avaliação física mensal"
  - Badge de status
- [ ] **Agendamento 2**:
  - Data: 30/11/2025
  - Horário: 10:00 - 11:00
  - Observação: "Consultoria nutricional"
  - Badge "Confirmado" em verde

#### ✅ Seção Plano Alimentar
- [ ] Título "Plano Alimentar Atual" visível
- [ ] Botão "Ver detalhes" presente
- [ ] Título: "Plano Nutricional - Ganho de Massa"
- [ ] Observações sobre hidratação
- [ ] **4 Cards de Macros**:
  - Calorias: 2800
  - Proteínas: 180g
  - Carboidratos: 350g
  - Gorduras: 70g

### 4. Testar Navegação

#### ✅ Sidebar Desktop
- [ ] Clicar em cada item do menu
- [ ] Verificar se item fica destacado
- [ ] Verificar se URL muda

#### ✅ Sidebar Mobile
- [ ] Redimensionar para mobile (< 768px)
- [ ] Verificar se sidebar está oculta
- [ ] Clicar no ícone de menu (hambúrguer)
- [ ] Verificar se sidebar abre
- [ ] Clicar em um item
- [ ] Verificar se sidebar fecha automaticamente
- [ ] Clicar fora da sidebar
- [ ] Verificar se fecha com overlay

### 5. Testar Logout
- [ ] Clicar em "Sair" na sidebar
- [ ] Verificar se é redirecionado para "/"
- [ ] Verificar se não consegue acessar /aluno sem login

### 6. Testar Responsividade

#### Desktop (> 1024px)
- [ ] Sidebar sempre visível
- [ ] Cards em 4 colunas
- [ ] Seções em 2 colunas

#### Tablet (768px - 1024px)
- [ ] Sidebar colapsável
- [ ] Cards em 2 colunas
- [ ] Seções em 1 coluna

#### Mobile (< 768px)
- [ ] Header fixo no topo
- [ ] Sidebar oculta por padrão
- [ ] Cards em 1 coluna
- [ ] Seções em 1 coluna

## 🐛 Possíveis Problemas

### Problema: Não consegue fazer login
**Solução:**
1. Verificar se o servidor está rodando
2. Verificar credenciais (email/senha)
3. Verificar console do navegador para erros
4. Verificar se usuário existe no Supabase Auth

### Problema: Dashboard vazio ou com "-"
**Solução:**
1. Verificar se dados foram criados no banco
2. Verificar console para erros de query
3. Verificar se `aluno_id` está correto
4. Executar queries manualmente no Supabase

### Problema: Erro "Usuário não autenticado"
**Solução:**
1. Fazer logout e login novamente
2. Limpar cache do navegador
3. Verificar se sessão está ativa no Supabase

### Problema: Redirecionado para /admin
**Solução:**
1. Verificar tipo do usuário no banco
2. Deve ser `tipo = 'aluno'`
3. Atualizar se necessário:
```sql
UPDATE users_profile 
SET tipo = 'aluno' 
WHERE email = 'eugabrieldpv@gmail.com';
```

## 📊 Dados Esperados

### Treinos
- 1 ficha ativa: "Full Body Iniciante"
- Status: ativo
- Válida até: 23/12/2025

### Agendamentos
- 2 agendamentos futuros
- Datas: 27/11 e 30/11
- Tipos: presencial e online

### Evolução
- Peso atual: 84.0 kg
- Última medição: 25/11/2025

### Plano Alimentar
- 2800 kcal/dia
- 6 refeições configuradas
- Macros definidos

## ✅ Checklist Final

- [ ] Login funciona
- [ ] Dashboard carrega dados reais
- [ ] Todos os cards mostram valores corretos
- [ ] Navegação funciona
- [ ] Responsivo em mobile
- [ ] Logout funciona
- [ ] Sem dados mockados
- [ ] Sem erros no console
- [ ] Design consistente (dark mode)
- [ ] Loading states funcionam

## 🎯 Resultado Esperado

Ao completar todos os testes, você deve ter:
- ✅ Login funcionando
- ✅ Dashboard com dados reais
- ✅ Navegação fluida
- ✅ Design profissional
- ✅ Experiência mobile perfeita
- ✅ Zero erros

---

**Tempo estimado de teste**: 10-15 minutos
**Última atualização**: 25/11/2025
