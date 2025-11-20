# 📅 Nova Estratégia - Agenda para Atendimento Presencial

## 🎯 Objetivo

Criar um sistema de agendamento simplificado para atendimentos presenciais, onde o profissional define:
- Dias da semana disponíveis
- Horário de início e fim
- Duração de cada atendimento
- Sistema gera slots automaticamente

## 💡 Conceito

### Antes (Complexo):
- Criar bloco por bloco manualmente
- Segunda 08:00-09:00
- Segunda 09:00-10:00
- Segunda 10:00-11:00
- ...

### Depois (Simples):
- Definir: **Segunda das 08:00 às 12:00, atendimentos de 60min**
- Sistema gera automaticamente: 08:00, 09:00, 10:00, 11:00

## 🏗️ Nova Estrutura

### 1. Tabela: `disponibilidade_semanal`
```sql
CREATE TABLE disponibilidade_semanal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  duracao_atendimento INTEGER NOT NULL, -- em minutos
  ativo BOOLEAN DEFAULT true,
  tipo TEXT DEFAULT 'presencial' CHECK (tipo IN ('presencial', 'online')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Tabela: `agendamentos_presenciais`
```sql
CREATE TABLE agendamentos_presenciais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  data_agendamento DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  status TEXT DEFAULT 'agendado' CHECK (status IN ('agendado', 'confirmado', 'cancelado', 'concluido')),
  tipo TEXT DEFAULT 'presencial' CHECK (tipo IN ('presencial', 'online')),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(data_agendamento, hora_inicio) -- Evita conflitos
);
```

## 🎨 Interface Proposta

### Configuração de Disponibilidade
```
┌─────────────────────────────────────────┐
│ Configurar Disponibilidade Semanal     │
├─────────────────────────────────────────┤
│                                         │
│ Dia da Semana: [Segunda-feira ▼]       │
│                                         │
│ Horário de Atendimento:                 │
│ Das [08:00] às [12:00]                  │
│                                         │
│ Duração de cada atendimento:            │
│ [60] minutos                            │
│                                         │
│ Tipo: ⚪ Presencial  ⚪ Online          │
│                                         │
│ Slots gerados automaticamente:          │
│ • 08:00 - 09:00                         │
│ • 09:00 - 10:00                         │
│ • 10:00 - 11:00                         │
│ • 11:00 - 12:00                         │
│                                         │
│         [Cancelar]  [Salvar]            │
└─────────────────────────────────────────┘
```

### Visualização Semanal
```
┌─────────────────────────────────────────┐
│ Disponibilidade Semanal                 │
├─────────────────────────────────────────┤
│                                         │
│ Segunda-feira                           │
│ 08:00 - 12:00 (4 slots de 60min)       │
│ Tipo: Presencial                        │
│ [Editar] [Desativar]                    │
│                                         │
│ Quarta-feira                            │
│ 14:00 - 18:00 (4 slots de 60min)       │
│ Tipo: Presencial                        │
│ [Editar] [Desativar]                    │
│                                         │
│ Sexta-feira                             │
│ 09:00 - 13:00 (4 slots de 60min)       │
│ Tipo: Online                            │
│ [Editar] [Desativar]                    │
│                                         │
│         [+ Nova Disponibilidade]        │
└─────────────────────────────────────────┘
```

### Agendar Atendimento
```
┌─────────────────────────────────────────┐
│ Novo Agendamento Presencial             │
├─────────────────────────────────────────┤
│                                         │
│ Aluno: [Selecione o aluno ▼]           │
│                                         │
│ Data: [25/11/2025]                      │
│                                         │
│ Horários disponíveis:                   │
│ ⚪ 08:00 - 09:00                        │
│ ⚪ 09:00 - 10:00                        │
│ ⚫ 10:00 - 11:00 (Ocupado)              │
│ ⚪ 11:00 - 12:00                        │
│                                         │
│ Tipo: ⚫ Presencial  ⚪ Online          │
│                                         │
│ Observações:                            │
│ [_________________________________]     │
│                                         │
│         [Cancelar]  [Agendar]           │
└─────────────────────────────────────────┘
```

## 🔄 Fluxo de Uso

### 1. Configurar Disponibilidade
```
1. Admin acessa "Configurações de Agenda"
   ↓
2. Clica em "Nova Disponibilidade"
   ↓
3. Seleciona:
   - Dia da semana: Segunda
   - Horário: 08:00 às 12:00
   - Duração: 60 minutos
   - Tipo: Presencial
   ↓
4. Sistema calcula e mostra slots:
   - 08:00-09:00
   - 09:00-10:00
   - 10:00-11:00
   - 11:00-12:00
   ↓
5. Admin confirma
   ↓
6. Disponibilidade salva
```

### 2. Criar Agendamento
```
1. Admin/Aluno acessa "Novo Agendamento"
   ↓
2. Seleciona aluno
   ↓
3. Seleciona data (ex: 25/11/2025 - Segunda)
   ↓
4. Sistema busca disponibilidade para Segunda
   ↓
5. Sistema verifica slots ocupados
   ↓
6. Mostra horários livres
   ↓
7. Usuário seleciona horário
   ↓
8. Confirma agendamento
   ↓
9. Sistema valida conflitos
   ↓
10. Agendamento criado
```

## 🎯 Vantagens

### 1. Simplicidade
- ✅ Configuração rápida
- ✅ Menos cliques
- ✅ Interface intuitiva

### 2. Flexibilidade
- ✅ Diferentes durações por dia
- ✅ Horários variados
- ✅ Presencial ou Online

### 3. Automação
- ✅ Slots gerados automaticamente
- ✅ Validação de conflitos
- ✅ Cálculo de disponibilidade

### 4. Escalabilidade
- ✅ Fácil adicionar novos dias
- ✅ Fácil modificar horários
- ✅ Fácil desativar temporariamente

## 📊 Exemplos de Uso

### Exemplo 1: Personal Trainer
```
Segunda: 06:00-10:00 (atendimentos de 60min) - Presencial
Quarta: 06:00-10:00 (atendimentos de 60min) - Presencial
Sexta:  06:00-10:00 (atendimentos de 60min) - Presencial
Sábado: 08:00-12:00 (atendimentos de 90min) - Presencial
```

### Exemplo 2: Nutricionista
```
Segunda: 14:00-18:00 (consultas de 45min) - Presencial
Terça:   09:00-12:00 (consultas de 45min) - Online
Quinta:  14:00-18:00 (consultas de 45min) - Presencial
```

### Exemplo 3: Fisioterapeuta
```
Segunda a Sexta: 08:00-12:00 (sessões de 30min) - Presencial
Segunda a Sexta: 14:00-18:00 (sessões de 30min) - Presencial
```

## 🚀 Implementação

### Fase 1: Backend
1. Criar tabelas no Supabase
2. Criar rotas da API
3. Implementar validações

### Fase 2: Hooks
1. Criar hooks React Query
2. Implementar mutations
3. Adicionar cache

### Fase 3: Interface
1. Tela de configuração
2. Tela de agendamento
3. Visualização de agenda

### Fase 4: Recursos Extras
1. Notificações por email
2. Lembretes automáticos
3. Relatórios de ocupação

## ✅ Próximos Passos

1. **Criar tabelas no Supabase**
2. **Implementar rotas da API**
3. **Criar hooks React Query**
4. **Desenvolver interface**
5. **Testar fluxo completo**

---

**Esta estratégia simplifica drasticamente o gerenciamento de agenda para atendimentos presenciais!**
