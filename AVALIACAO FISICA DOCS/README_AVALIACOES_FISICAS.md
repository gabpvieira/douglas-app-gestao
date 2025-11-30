# 🏋️ Sistema de Avaliações Físicas

## 📋 Visão Geral

Sistema completo para personal trainers gerenciarem avaliações físicas de seus alunos, com suporte para avaliações online e presenciais.

## ✨ Funcionalidades

### 📊 Medidas Completas
- **Antropométricas:** Peso, altura, IMC, 12 circunferências
- **Composição Corporal:** % gordura, massa magra, massa gorda, massa muscular
- **Dobras Cutâneas:** 7 pontos de medição
- **Testes Físicos:** Flexões, abdominais, prancha, Cooper, VO2 Max
- **Saúde:** Pressão arterial, frequência cardíaca

### 🎯 Recursos
- ✅ Criar, editar, visualizar e deletar avaliações
- ✅ Cálculo automático de IMC com classificação
- ✅ Busca em tempo real por aluno
- ✅ Filtros por status e tipo
- ✅ Design responsivo (mobile, tablet, desktop)
- ✅ Segurança com RLS (Row Level Security)

## 🚀 Quick Start

### 1. Criar Tabela no Supabase
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: scripts/create-avaliacoes-fisicas-table.sql
```

### 2. Acessar o Sistema
```
http://localhost:3174/admin/avaliacoes-fisicas
```

### 3. Criar Primeira Avaliação
1. Clique em "Nova Avaliação"
2. Selecione o aluno
3. Preencha peso e altura (mínimo)
4. Salve

## 📁 Estrutura de Arquivos

```
├── scripts/
│   └── create-avaliacoes-fisicas-table.sql    # Schema SQL
├── shared/
│   └── schema.ts                               # Schema Drizzle + Zod
├── client/src/
│   ├── pages/admin/
│   │   └── AvaliacoesFisicas.tsx              # Página principal
│   ├── components/
│   │   ├── AvaliacaoFisicaModal.tsx           # Modal criar/editar
│   │   └── AvaliacaoFisicaDetalhes.tsx        # Modal visualização
│   └── hooks/
│       └── useAvaliacoesFisicas.ts            # Hook de dados
└── docs/
    ├── PLANEJAMENTO_AVALIACAO_FISICA.md       # Planejamento completo
    ├── AVALIACAO_FISICA_IMPLEMENTADA.md       # Documentação técnica
    ├── GUIA_RAPIDO_AVALIACOES_FISICAS.md      # Guia de uso
    └── CHECKLIST_SETUP_AVALIACOES_FISICAS.md  # Setup passo a passo
```

## 🎨 Interface

### Página Principal
- Lista de avaliações com cards
- Busca por aluno
- Badges de status (concluída, agendada, cancelada)
- Métricas principais visíveis (peso, IMC, % gordura)
- Ações rápidas (visualizar, editar, deletar)

### Modal de Criação/Edição
- Formulário organizado em 4 abas:
  - **Básico:** Peso, altura, IMC
  - **Circunferências:** 12 medidas corporais
  - **Composição:** % gordura, massas
  - **Testes:** Testes físicos, pressão, observações

### Modal de Detalhes
- Visualização completa organizada em cards
- Classificação de IMC com cores
- Todas as métricas agrupadas por categoria
- Botão para editar direto

## 🔐 Segurança

### RLS Policies
- **Admins:** Acesso total (CRUD)
- **Alunos:** Apenas visualização das próprias avaliações

### Validações
- Peso: 30-300 kg
- Altura: 100-250 cm
- % Gordura: 3-60%
- Pressão: 60-250 mmHg
- FC: 30-220 bpm

## 📊 Campos Disponíveis

### Obrigatórios
- Aluno
- Data da avaliação
- Tipo (online/presencial)
- Status (agendada/concluída/cancelada)

### Opcionais (40+ campos)
- Medidas antropométricas
- Composição corporal
- Dobras cutâneas
- Testes físicos
- Pressão e frequência
- Observações e objetivos

## 🎯 Cálculos Automáticos

### IMC (Índice de Massa Corporal)
```
IMC = peso (kg) / altura (m)²
```

### Classificação
- < 18.5: Abaixo do peso
- 18.5 - 24.9: Peso normal
- 25.0 - 29.9: Sobrepeso
- 30.0 - 34.9: Obesidade Grau I
- 35.0 - 39.9: Obesidade Grau II
- ≥ 40.0: Obesidade Grau III

## 🛠️ Tecnologias

- **Frontend:** React 18 + TypeScript
- **State:** TanStack Query (React Query)
- **Database:** Supabase (PostgreSQL)
- **UI:** Radix UI (shadcn/ui)
- **Forms:** React Hook Form + Zod
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## 📱 Responsividade

- **Mobile:** < 640px
- **Tablet:** 640px - 1024px
- **Desktop:** > 1024px

Design mobile-first com breakpoints otimizados.

## 🎨 Padrão Visual

### Cores
- **Background:** Gradiente dark (gray-950 → gray-900)
- **Cards:** Glass effect (gray-900/50 + backdrop-blur)
- **Primário:** Gradiente indigo-purple
- **Status Concluída:** Verde
- **Status Agendada:** Amarelo
- **Status Cancelada:** Vermelho

### Ícones
- **Menu:** Activity (raio)
- **Peso:** Scale (balança)
- **Circunferências:** Ruler (régua)
- **Composição:** Droplet (gota)
- **Testes:** Activity (atividade)
- **Saúde:** Heart (coração)

## 📈 Métricas de Performance

- **Queries:** Otimizadas com índices
- **RLS:** Segurança em nível de linha
- **Cache:** TanStack Query com invalidação automática
- **Loading:** Estados de loading em todas as operações

## 🔄 Fluxo de Dados

```
1. Usuário preenche formulário
2. Validação com Zod
3. Cálculo de IMC (se peso + altura)
4. Envio para Supabase
5. RLS valida permissões
6. Dados salvos
7. Cache invalidado
8. Lista atualizada automaticamente
```

## 🧪 Como Testar

### Teste Básico
1. Criar avaliação com dados mínimos
2. Verificar IMC calculado
3. Visualizar detalhes
4. Editar peso
5. Verificar IMC atualizado

### Teste Completo
1. Preencher todos os campos
2. Navegar por todas as abas
3. Salvar
4. Visualizar todos os dados organizados
5. Buscar por aluno
6. Deletar avaliação

### Teste de Segurança
1. Login como aluno
2. Tentar acessar `/admin/avaliacoes-fisicas`
3. Verificar redirecionamento/erro

## 📚 Documentação Completa

- **[Planejamento](PLANEJAMENTO_AVALIACAO_FISICA.md)** - Design e arquitetura
- **[Implementação](AVALIACAO_FISICA_IMPLEMENTADA.md)** - Detalhes técnicos
- **[Guia de Uso](GUIA_RAPIDO_AVALIACOES_FISICAS.md)** - Como usar
- **[Checklist](CHECKLIST_SETUP_AVALIACOES_FISICAS.md)** - Setup passo a passo

## 🚀 Próximas Melhorias

### Fase 2 (Opcional)
- [ ] Upload de fotos (4 ângulos)
- [ ] Comparação entre avaliações
- [ ] Gráficos de evolução
- [ ] Exportar PDF da avaliação
- [ ] Histórico completo do aluno

### Fase 3 (Opcional)
- [ ] Painel do aluno (visualizar próprias avaliações)
- [ ] Notificações de nova avaliação
- [ ] Metas e objetivos com progresso
- [ ] Integração com fichas de treino

## 💡 Dicas de Uso

### Para Personal Trainers
- Faça avaliações regulares (mensal/bimestral)
- Use as observações para registrar detalhes importantes
- Documente restrições médicas
- Defina objetivos claros

### Boas Práticas
- Preencha o máximo de campos possível
- Mantenha consistência nas medições
- Use o mesmo horário para avaliações
- Registre condições especiais (jejum, pós-treino, etc.)

## 🆘 Suporte

### Problemas Comuns
1. **Tabela não existe:** Execute o SQL de criação
2. **Sem permissão:** Verifique RLS policies
3. **IMC não calcula:** Preencha peso E altura
4. **Servidor não inicia:** Mate processo na porta 3174

### Logs
- **Frontend:** Console do navegador (F12)
- **Backend:** Terminal do servidor
- **Database:** Supabase Dashboard → Logs

## ✅ Status

**IMPLEMENTAÇÃO COMPLETA** - Sistema 100% funcional e pronto para uso!

---

**Desenvolvido para:** Personal Douglas Fitness Platform
**Versão:** 1.0.0
**Data:** Janeiro 2024
