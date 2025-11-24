# Agendamentos Criados para Teste

## Resumo

Criados 5 agendamentos reais na tabela `agendamentos_presenciais` para testar a página de Agenda Profissional.

## Estrutura da Tabela

```sql
agendamentos_presenciais:
- id (uuid)
- aluno_id (uuid) → FK para alunos
- data_agendamento (date)
- hora_inicio (time)
- hora_fim (time)
- status (text) → 'agendado', 'confirmado', 'cancelado', 'concluido'
- tipo (text) → 'presencial', 'online'
- observacoes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

## Agendamentos Criados

### 1. Segunda-feira, 25/11/2025 - 09:00-10:00
- **Aluno**: Rodrigo Ferreira de Santana Silva
- **Status**: Confirmado ✅
- **Tipo**: Presencial
- **Observações**: Avaliação física mensal

### 2. Terça-feira, 26/11/2025 - 14:00-15:00
- **Aluno**: Sangella mylenna da Silva Xavier
- **Status**: Agendado 📅
- **Tipo**: Online
- **Observações**: Consultoria nutricional

### 3. Quarta-feira, 27/11/2025 - 10:00-11:00
- **Aluno**: Tânia Oliveira de Souza
- **Status**: Confirmado ✅
- **Tipo**: Presencial
- **Observações**: Treino personalizado

### 4. Quinta-feira, 28/11/2025 - 16:00-17:00
- **Aluno**: Waldimar Garcia da costa
- **Status**: Agendado 📅
- **Tipo**: Presencial
- **Observações**: Acompanhamento de evolução

### 5. Sexta-feira, 29/11/2025 - 11:00-12:00
- **Aluno**: Welinton Berto de Souza
- **Status**: Confirmado ✅
- **Tipo**: Online
- **Observações**: Revisão de plano alimentar

## Distribuição

- **Presenciais**: 3 agendamentos
- **Online**: 2 agendamentos
- **Confirmados**: 3 agendamentos
- **Agendados**: 2 agendamentos

## Query para Verificar

```sql
SELECT 
  ag.id,
  ag.data_agendamento,
  ag.hora_inicio,
  ag.hora_fim,
  ag.status,
  ag.tipo,
  ag.observacoes,
  up.nome as aluno_nome
FROM agendamentos_presenciais ag
JOIN alunos a ON ag.aluno_id = a.id
JOIN users_profile up ON a.user_profile_id = up.id
ORDER BY ag.data_agendamento, ag.hora_inicio;
```

## Como Testar

1. Acesse a página de Agenda Profissional no painel admin
2. Navegue para a semana de 25-29 de novembro de 2025
3. Você deve ver os 5 agendamentos distribuídos ao longo da semana
4. Teste as funcionalidades:
   - Visualizar detalhes do agendamento
   - Editar agendamento
   - Alterar status
   - Cancelar agendamento

## Status Possíveis

- `agendado` - Agendamento criado, aguardando confirmação
- `confirmado` - Agendamento confirmado pelo aluno
- `cancelado` - Agendamento cancelado
- `concluido` - Atendimento realizado

## Tipos de Atendimento

- `presencial` - Atendimento presencial no local
- `online` - Atendimento remoto por videochamada

## Observações

- Todos os agendamentos foram criados com alunos ativos do sistema
- As datas são da semana de 25-29 de novembro de 2025
- Os horários variam entre manhã, tarde e final da tarde
- Mix de tipos (presencial/online) e status (agendado/confirmado)
