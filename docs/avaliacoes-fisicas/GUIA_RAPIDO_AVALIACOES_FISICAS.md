# Guia Rápido - Avaliações Físicas

## 🚀 Setup Inicial

### 1. Criar Tabela no Supabase

Acesse o Supabase SQL Editor e execute:

```sql
-- Cole o conteúdo de: scripts/create-avaliacoes-fisicas-table.sql
```

Ou execute via linha de comando:
```bash
# Se tiver o Supabase CLI configurado
supabase db push
```

### 2. Verificar Permissões RLS

As policies já estão criadas no script SQL:
- ✅ Admins podem criar, ler, atualizar e deletar todas as avaliações
- ✅ Alunos podem apenas visualizar suas próprias avaliações

## 📋 Como Usar

### Acessar a Página
1. Faça login como **admin**
2. No menu lateral, clique em **"Avaliações Físicas"** (abaixo de "Alunos")
3. Ou acesse diretamente: `http://localhost:3174/admin/avaliacoes-fisicas`

### Criar Nova Avaliação

1. **Clique em "Nova Avaliação"**

2. **Preencha os dados básicos:**
   - Selecione o aluno
   - Data da avaliação
   - Tipo: Online ou Presencial
   - Status: Concluída, Agendada ou Cancelada

3. **Navegue pelas abas:**

   **Aba "Básico":**
   - Peso (kg)
   - Altura (cm)
   - IMC é calculado automaticamente

   **Aba "Circunferências":**
   - Pescoço, Tórax, Cintura, Abdômen, Quadril
   - Braços, Antebraços, Coxas, Panturrilhas (direito/esquerdo)

   **Aba "Composição":**
   - % Gordura
   - Massa Gorda, Massa Magra, Massa Muscular
   - Água Corporal, Gordura Visceral

   **Aba "Testes":**
   - Flexões, Abdominais, Prancha
   - Pressão Arterial (sistólica/diastólica)
   - Frequência Cardíaca de Repouso
   - Observações, Objetivos, Restrições Médicas

4. **Clique em "Salvar Avaliação"**

### Visualizar Detalhes

1. Na lista de avaliações, clique no **ícone de olho** 👁️
2. Veja todos os dados organizados em cards
3. Classificação automática do IMC com cores
4. Clique em "Editar" para modificar

### Editar Avaliação

1. Clique no **ícone de lápis** ✏️ na lista
2. Ou clique em "Editar" no modal de detalhes
3. Modifique os campos desejados
4. Salve as alterações

### Deletar Avaliação

1. Clique no **ícone de lixeira** 🗑️
2. Confirme a exclusão
3. A avaliação será removida permanentemente

### Buscar Avaliações

- Use a barra de busca para filtrar por nome do aluno
- A busca é em tempo real

## 📊 Campos Disponíveis

### Medidas Antropométricas
- Peso, Altura, IMC
- 12 circunferências corporais

### Composição Corporal
- Percentual de gordura
- Massa gorda, magra e muscular
- Água corporal
- Gordura visceral

### Dobras Cutâneas (7 pontos)
- Tríceps, Bíceps
- Subescapular, Suprailiaca
- Abdominal, Coxa, Panturrilha

### Testes Físicos
- Flexões de braço
- Abdominais
- Agachamentos
- Prancha (segundos)
- Teste de Cooper
- VO2 Max

### Pressão e Frequência
- Pressão Arterial (sistólica/diastólica)
- Frequência Cardíaca de Repouso

### Observações
- Observações gerais
- Objetivos do aluno
- Restrições médicas

## 💡 Dicas

### Cálculo Automático de IMC
- Ao preencher peso e altura, o IMC é calculado automaticamente
- Classificação: Abaixo do peso, Normal, Sobrepeso, Obesidade (I, II, III)

### Campos Opcionais
- Todos os campos são opcionais, exceto:
  - Aluno (obrigatório)
  - Data (obrigatório)
  - Tipo (obrigatório)
  - Status (obrigatório)

### Organização
- Avaliações são ordenadas por data (mais recente primeiro)
- Use badges coloridos para identificar status rapidamente

### Responsividade
- Interface totalmente responsiva
- Funciona perfeitamente em mobile, tablet e desktop

## 🎨 Padrão Visual

- **Status Concluída:** Badge verde
- **Status Agendada:** Badge amarelo
- **Status Cancelada:** Badge vermelho
- **Tipo Online:** Badge outline
- **Tipo Presencial:** Badge outline

## 🔐 Segurança

- RLS (Row Level Security) ativo
- Admins: acesso total
- Alunos: apenas visualização das próprias avaliações
- Todas as queries passam pelo Supabase com validação

## 📱 Acesso do Aluno

**Nota:** Atualmente implementado apenas no painel admin. Para adicionar ao painel do aluno:

1. Criar página `client/src/pages/aluno/MinhasAvaliacoes.tsx`
2. Usar hook `useAvaliacoesByAluno(alunoId)`
3. Adicionar rota no App.tsx
4. Adicionar item no StudentSidebar

## ❓ Troubleshooting

### Erro ao salvar avaliação
- Verifique se a tabela foi criada no Supabase
- Confirme que as RLS policies estão ativas
- Verifique o console do navegador para erros

### Avaliações não aparecem
- Confirme que você está logado como admin
- Verifique se há avaliações cadastradas
- Teste criar uma nova avaliação

### IMC não calcula
- Certifique-se de preencher peso E altura
- Use valores numéricos válidos
- Peso: 30-300 kg
- Altura: 100-250 cm

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique os logs do console (F12)
2. Consulte `AVALIACAO_FISICA_IMPLEMENTADA.md`
3. Revise `PLANEJAMENTO_AVALIACAO_FISICA.md`
