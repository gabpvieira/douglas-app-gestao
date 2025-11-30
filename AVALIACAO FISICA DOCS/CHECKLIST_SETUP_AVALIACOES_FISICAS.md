# ✅ Checklist - Setup Avaliações Físicas

## Passo a Passo para Ativar o Sistema

### 1️⃣ Criar Tabela no Supabase

**Acesse:** [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)

**Execute o SQL:**
```bash
# Copie todo o conteúdo do arquivo:
scripts/create-avaliacoes-fisicas-table.sql
```

**O que será criado:**
- ✅ Tabela `avaliacoes_fisicas` com 40+ campos
- ✅ Índices para performance
- ✅ RLS Policies (segurança)
- ✅ Trigger para updated_at

### 2️⃣ Verificar Criação

**Execute no SQL Editor:**
```sql
-- Verificar se a tabela existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'avaliacoes_fisicas';

-- Verificar colunas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'avaliacoes_fisicas'
ORDER BY ordinal_position;

-- Verificar RLS está ativo
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'avaliacoes_fisicas';
```

**Resultado esperado:**
- ✅ Tabela encontrada
- ✅ 50+ colunas listadas
- ✅ RLS = true

### 3️⃣ Testar Permissões

**Como Admin:**
```sql
-- Deve retornar vazio (sem erro)
SELECT * FROM avaliacoes_fisicas LIMIT 1;
```

**Como Aluno:**
```sql
-- Deve retornar apenas avaliações do próprio aluno
SELECT * FROM avaliacoes_fisicas WHERE aluno_id = 'seu_aluno_id';
```

### 4️⃣ Acessar a Aplicação

1. **Abra o navegador:** `http://localhost:3174`

2. **Faça login como admin:**
   - Email: `admin@personal.com` (ou seu admin)
   - Senha: sua senha

3. **Navegue até Avaliações Físicas:**
   - Menu lateral → "Avaliações Físicas"
   - Ou acesse: `http://localhost:3174/admin/avaliacoes-fisicas`

### 5️⃣ Criar Primeira Avaliação

1. **Clique em "Nova Avaliação"**

2. **Preencha os dados mínimos:**
   - Selecione um aluno
   - Data: hoje
   - Tipo: Presencial
   - Status: Concluída
   - Peso: 75
   - Altura: 175

3. **Clique em "Salvar Avaliação"**

4. **Verifique:**
   - ✅ Avaliação aparece na lista
   - ✅ IMC calculado automaticamente (24.49)
   - ✅ Badge verde "Concluída"

### 6️⃣ Testar Funcionalidades

**Visualizar:**
- Clique no ícone de olho 👁️
- Verifique todos os dados
- Veja a classificação do IMC

**Editar:**
- Clique no ícone de lápis ✏️
- Modifique o peso para 80
- Salve e veja o IMC atualizar

**Buscar:**
- Digite o nome do aluno na busca
- Veja a filtragem em tempo real

**Deletar:**
- Clique no ícone de lixeira 🗑️
- Confirme a exclusão

## 🔍 Troubleshooting

### ❌ Erro: "relation avaliacoes_fisicas does not exist"
**Solução:** Execute o SQL de criação da tabela no Supabase

### ❌ Erro: "permission denied for table avaliacoes_fisicas"
**Solução:** Verifique se as RLS policies foram criadas:
```sql
SELECT * FROM pg_policies WHERE tablename = 'avaliacoes_fisicas';
```

### ❌ Avaliações não aparecem
**Solução:** 
1. Verifique se você está logado como admin
2. Abra o console do navegador (F12) e veja erros
3. Verifique se há avaliações cadastradas

### ❌ IMC não calcula
**Solução:**
- Preencha peso E altura
- Use valores válidos (peso: 30-300, altura: 100-250)

### ❌ Servidor não inicia
**Solução:**
```bash
# Mate processos na porta 3174
Get-NetTCPConnection -LocalPort 3174 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force

# Reinicie
npm run dev
```

## 📊 Dados de Teste

### Avaliação Completa de Exemplo:

```json
{
  "aluno_id": "uuid-do-aluno",
  "data_avaliacao": "2024-01-15",
  "tipo": "presencial",
  "status": "concluida",
  "peso": 75.5,
  "altura": 175,
  "circunferencia_pescoco": 38,
  "circunferencia_torax": 95,
  "circunferencia_cintura": 82,
  "circunferencia_abdomen": 85,
  "circunferencia_quadril": 98,
  "circunferencia_braco_direito": 32,
  "circunferencia_braco_esquerdo": 31.5,
  "percentual_gordura": 18.5,
  "massa_gorda": 14.0,
  "massa_magra": 61.5,
  "massa_muscular": 58.3,
  "flexao_bracos": 25,
  "abdominal": 40,
  "prancha": 90,
  "pressao_arterial_sistolica": 120,
  "pressao_arterial_diastolica": 80,
  "frequencia_cardiaca_repouso": 65,
  "observacoes": "Cliente apresentou boa evolução",
  "objetivos": "Reduzir % de gordura para 15%"
}
```

## ✅ Checklist Final

- [ ] Tabela criada no Supabase
- [ ] RLS policies ativas
- [ ] Servidor rodando (porta 3174)
- [ ] Login como admin funcionando
- [ ] Menu "Avaliações Físicas" visível
- [ ] Criar avaliação funciona
- [ ] Visualizar detalhes funciona
- [ ] Editar avaliação funciona
- [ ] Deletar avaliação funciona
- [ ] Busca por aluno funciona
- [ ] IMC calcula automaticamente
- [ ] Design responsivo (teste no mobile)

## 🎉 Pronto!

Se todos os itens acima estão ✅, o sistema está **100% funcional**!

## 📚 Documentação

- **Planejamento:** `PLANEJAMENTO_AVALIACAO_FISICA.md`
- **Implementação:** `AVALIACAO_FISICA_IMPLEMENTADA.md`
- **Guia de Uso:** `GUIA_RAPIDO_AVALIACOES_FISICAS.md`
- **SQL Schema:** `scripts/create-avaliacoes-fisicas-table.sql`

## 🚀 Próximos Passos (Opcional)

1. Adicionar upload de fotos
2. Criar gráficos de evolução
3. Comparar avaliações
4. Exportar PDF
5. Adicionar ao painel do aluno
