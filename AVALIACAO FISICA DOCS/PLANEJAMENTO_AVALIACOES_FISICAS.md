# Planejamento de Implementação - Sistema de Avaliações Físicas

## 📋 Visão Geral

Sistema completo de avaliação física com protocolos de dobras cutâneas, bioimpedância, perimetria, avaliação neuromotora e postural.

## 🎯 Arquitetura do Sistema

### Estrutura de Dados
- **Avaliação Principal**: Registro pai com tipo e protocolo
- **Módulos Especializados**: Morfológica, Neuromotora, Postural, Anamnese
- **Histórico e Evolução**: Comparação temporal e gráficos

### Protocolos Suportados
1. **Dobras Cutâneas**: Pollock 7 dobras (1984) e 3 dobras (1978)
2. **Bioimpedância**: Análise de composição corporal
3. **Perimetria**: Medidas corporais completas
4. **Neuromotora**: Testes de capacidade física
5. **Postural**: Avaliação de alinhamento corporal

---

## 🚀 FASE 1: Estrutura do Banco de Dados

### Objetivos
- Criar tabelas no Supabase
- Implementar schemas no Drizzle
- Configurar RLS policies
- Adicionar validações Zod

### Tarefas

#### 1.1 Script SQL para Supabase

Criar arquivo: `scripts/create-avaliacoes-fisicas-tables.sql`

**Tabelas principais:**
- `avaliacoes_fisicas` (pai)
- `avaliacoes_morfologicas`
- `dobras_cutaneas`
- `perimetria`
- `bioimpedancia`
- `avaliacoes_neuromotoras`
- `avaliacoes_posturais`
- `anamneses`

#### 1.2 Schema Drizzle
Adicionar em `shared/schema.ts`:
- Definições de tabelas
- Tipos TypeScript
- Validadores Zod
- Relações entre tabelas

#### 1.3 RLS Policies
- Admin: acesso total
- Aluno: apenas suas próprias avaliações (leitura)

**Entregáveis:**
- ✅ SQL executado no Supabase
- ✅ Schemas no código
- ✅ Policies configuradas

---

## 🧮 FASE 2: Lógica de Cálculos

### Objetivos
- Implementar fórmulas de Pollock
- Calcular composição corporal
- Validar resultados

### Tarefas

#### 2.1 Utilitários de Cálculo
Criar arquivo: `client/src/lib/avaliacaoCalculos.ts`

**Funções:**
```typescript
- calcularPollock7Dobras(dados, genero, idade)
- calcularPollock3Dobras(dados, genero, idade)
- calcularIMC(peso, altura)
- calcularPesoIdeal(altura, genero)
- calcularZonasCardiacas(idade, fcRepouso)
- classificarPercentualGordura(percentual, genero, idade)
```

#### 2.2 Testes Unitários
Criar: `client/src/lib/__tests__/avaliacaoCalculos.test.ts`
- Validar fórmulas com casos conhecidos
- Testar edge cases

**Entregáveis:**
- ✅ Biblioteca de cálculos
- ✅ Testes passando
- ✅ Documentação das fórmulas

---

## 🎨 FASE 3: Interface - Criação de Avaliação

### Objetivos
- Modal de nova avaliação
- Formulários por protocolo
- Exibição de resultados

### Tarefas

#### 3.1 Componentes Base


**Criar componentes:**
- `NovaAvaliacaoModal.tsx` - Modal principal
- `SelecionarProtocoloStep.tsx` - Escolha do tipo
- `FormularioPollock7Dobras.tsx` - Formulário 7 dobras
- `FormularioPollock3Dobras.tsx` - Formulário 3 dobras
- `FormularioBioimpedancia.tsx` - Formulário bioimpedância
- `FormularioPerimetria.tsx` - Medidas corporais
- `ResultadosAvaliacaoCard.tsx` - Exibição de resultados

#### 3.2 Hook de Gerenciamento
Criar: `client/src/hooks/useAvaliacoesFisicas.ts`

**Exports:**
```typescript
- useAvaliacoes(alunoId)
- useCreateAvaliacao()
- useUpdateAvaliacao()
- useDeleteAvaliacao()
- useAvaliacaoById(id)
```

#### 3.3 Página Principal
Atualizar: `client/src/pages/admin/AvaliacoesFisicas.tsx`
- Lista de avaliações
- Filtros por aluno/data
- Botão "Nova Avaliação"

**Entregáveis:**
- ✅ Modal funcional
- ✅ Formulários validados
- ✅ Cálculos automáticos
- ✅ Salvamento no Supabase

---

## 📊 FASE 4: Histórico e Gráficos

### Objetivos
- Visualização de evolução
- Gráficos comparativos
- Análise temporal

### Tarefas

#### 4.1 Componentes de Gráficos
Usar biblioteca: **Recharts**

**Criar componentes:**
- `GraficoEvolucaoPeso.tsx`
- `GraficoPercentualGordura.tsx`
- `GraficoMassaMagra.tsx`
- `GraficoPerimetria.tsx`
- `ComparacaoAvaliacoes.tsx`

#### 4.2 Página de Evolução
Criar: `client/src/pages/admin/EvolucaoAluno.tsx`
- Grid de gráficos (2x2)
- Seletor de período
- Exportar dados

#### 4.3 Comparação Entre Avaliações
Componente: `ComparacaoModal.tsx`
- Selecionar 2 avaliações
- Mostrar diferenças
- Destacar progressos

**Entregáveis:**
- ✅ Gráficos interativos
- ✅ Página de evolução
- ✅ Comparação funcional

---

## 🏃 FASE 5: Módulos Adicionais

### Objetivos
- Avaliação neuromotora
- Avaliação postural
- Anamnese

### Tarefas

#### 5.1 Avaliação Neuromotora


**Componentes:**
- `FormularioNeuromotor.tsx`
- `ResultadosNeuromotor.tsx`

**Testes incluídos:**
- Força (preensão manual)
- Resistência (flexões, abdominais)
- Flexibilidade (sentar e alcançar)
- Agilidade (shuttle run)
- Equilíbrio
- Potência (saltos)

#### 5.2 Avaliação Postural
**Componentes:**
- `FormularioPostural.tsx`
- `UploadFotosPosturais.tsx`
- `VisualizadorPostura.tsx`

**Recursos:**
- Upload de fotos (frente, lateral, costas)
- Marcações de alinhamento
- Observações textuais

#### 5.3 Anamnese
**Componentes:**
- `FormularioAnamnese.tsx`
- `VisualizadorAnamnese.tsx`

**Seções:**
- Dados pessoais
- Histórico de saúde
- Hábitos de vida
- Objetivos
- Limitações

**Entregáveis:**
- ✅ Formulários completos
- ✅ Upload de fotos
- ✅ Integração com avaliação principal

---

## 📱 FASE 6: Painel do Aluno

### Objetivos
- Aluno visualiza suas avaliações
- Gráficos de evolução pessoal
- Metas e objetivos

### Tarefas

#### 6.1 Página de Avaliações do Aluno
Criar: `client/src/pages/aluno/MinhasAvaliacoes.tsx`
- Lista de avaliações (somente leitura)
- Visualizar detalhes
- Gráficos de evolução

#### 6.2 Dashboard com Resumo
Adicionar em: `client/src/pages/aluno/Dashboard.tsx`
- Card com última avaliação
- Progresso em relação à meta
- Próxima avaliação agendada

#### 6.3 Sistema de Metas
**Componentes:**
- `MetasCard.tsx`
- `ProgressoMetaChart.tsx`

**Funcionalidades:**
- Admin define metas
- Aluno visualiza progresso
- Notificações de conquistas

**Entregáveis:**
- ✅ Visualização para aluno
- ✅ Sistema de metas
- ✅ Gráficos personalizados

---

## 📄 FASE 7: Relatórios e Exportação

### Objetivos
- Gerar PDFs profissionais
- Exportar dados
- Compartilhamento

### Tarefas

#### 7.1 Geração de PDF
Usar biblioteca: **react-pdf** ou **jsPDF**

**Componentes:**
- `RelatorioAvaliacaoPDF.tsx`
- `RelatorioEvolucaoPDF.tsx`

**Conteúdo:**
- Dados da avaliação
- Gráficos
- Comparação com anterior
- Recomendações

#### 7.2 Exportação de Dados
**Formatos:**
- CSV (para Excel)
- JSON (backup)
- PDF (relatório)

#### 7.3 Compartilhamento
- Enviar por email
- Link compartilhável
- Impressão direta

**Entregáveis:**
- ✅ PDFs gerados
- ✅ Exportação funcional
- ✅ Opções de compartilhamento

---

## 🔔 FASE 8: Notificações e Automações

### Objetivos
- Lembrete de reavaliação
- Notificações de progresso
- Alertas para admin

### Tarefas

#### 8.1 Sistema de Lembretes


**Funcionalidades:**
- Notificar aluno 30 dias após última avaliação
- Lembrar admin de agendar reavaliações
- Alertas de metas atingidas

#### 8.2 Integração com Sistema de Notificações
Usar: Sistema existente em `SISTEMA_NOTIFICACOES_PREMIUM.md`

**Tipos de notificação:**
- `avaliacao_agendada`
- `avaliacao_concluida`
- `meta_atingida`
- `lembrete_reavaliacao`

#### 8.3 Automações
- Criar avaliação recorrente (mensal/trimestral)
- Sugestão automática de metas
- Análise de tendências

**Entregáveis:**
- ✅ Notificações configuradas
- ✅ Lembretes automáticos
- ✅ Automações ativas

---

## 📱 FASE 9: Responsividade e UX

### Objetivos
- Interface mobile otimizada
- Experiência fluida
- Acessibilidade

### Tarefas

#### 9.1 Otimização Mobile
- Formulários em steps
- Gráficos responsivos
- Touch-friendly

#### 9.2 Melhorias de UX
- Loading states
- Feedback visual
- Validação em tempo real
- Tooltips explicativos

#### 9.3 Acessibilidade
- ARIA labels
- Navegação por teclado
- Contraste adequado
- Screen reader support

**Entregáveis:**
- ✅ Mobile otimizado
- ✅ UX polida
- ✅ Acessível

---

## 🧪 FASE 10: Testes e Documentação

### Objetivos
- Testes automatizados
- Documentação completa
- Guias de uso

### Tarefas

#### 10.1 Testes
- Unitários (cálculos)
- Integração (hooks)
- E2E (fluxos completos)

#### 10.2 Documentação Técnica
- API endpoints
- Schemas de dados
- Fórmulas utilizadas

#### 10.3 Guias de Usuário
- Como criar avaliação
- Como interpretar resultados
- Como definir metas

**Entregáveis:**
- ✅ Cobertura de testes >80%
- ✅ Documentação completa
- ✅ Guias publicados

---

## 📊 Cronograma Estimado

| Fase | Descrição | Tempo Estimado | Prioridade |
|------|-----------|----------------|------------|
| 1 | Banco de Dados | 2-3 dias | 🔴 Alta |
| 2 | Cálculos | 2 dias | 🔴 Alta |
| 3 | Interface Criação | 4-5 dias | 🔴 Alta |
| 4 | Gráficos | 3-4 dias | 🟡 Média |
| 5 | Módulos Adicionais | 5-6 dias | 🟡 Média |
| 6 | Painel Aluno | 2-3 dias | 🟡 Média |
| 7 | Relatórios PDF | 3-4 dias | 🟢 Baixa |
| 8 | Notificações | 2 dias | 🟢 Baixa |
| 9 | Responsividade | 2-3 dias | 🟡 Média |
| 10 | Testes/Docs | 3-4 dias | 🟡 Média |

**Total: 28-38 dias de desenvolvimento**

---

## 🎯 MVP (Mínimo Viável)

Para lançamento inicial, focar em:

### Escopo MVP


✅ **Fase 1**: Banco de dados completo
✅ **Fase 2**: Cálculos (Pollock 7 dobras + IMC)
✅ **Fase 3**: Interface de criação (protocolo 7 dobras)
✅ **Fase 4**: Gráficos básicos (peso, % gordura, massa magra)
✅ **Fase 6**: Visualização para aluno (somente leitura)

**Tempo MVP: 12-15 dias**

### Pós-MVP (Incrementos)
- Fase 5: Outros protocolos
- Fase 7: PDFs
- Fase 8: Notificações
- Fase 9: Polimento UX
- Fase 10: Testes completos

---

## 🛠️ Stack Técnico

### Frontend
- **React + TypeScript**
- **Radix UI** (componentes)
- **Recharts** (gráficos)
- **React Hook Form + Zod** (formulários)
- **TanStack Query** (data fetching)

### Backend
- **Supabase** (PostgreSQL + Storage)
- **Drizzle ORM** (schemas)
- **RLS Policies** (segurança)

### Bibliotecas Adicionais
- **date-fns** (manipulação de datas)
- **react-pdf** ou **jsPDF** (geração de PDFs)
- **recharts** (gráficos)

---

## 📁 Estrutura de Arquivos

```
client/src/
├── components/
│   ├── avaliacoes/
│   │   ├── NovaAvaliacaoModal.tsx
│   │   ├── SelecionarProtocoloStep.tsx
│   │   ├── FormularioPollock7Dobras.tsx
│   │   ├── FormularioPollock3Dobras.tsx
│   │   ├── FormularioBioimpedancia.tsx
│   │   ├── FormularioPerimetria.tsx
│   │   ├── FormularioNeuromotor.tsx
│   │   ├── FormularioPostural.tsx
│   │   ├── FormularioAnamnese.tsx
│   │   ├── ResultadosAvaliacaoCard.tsx
│   │   ├── ComparacaoModal.tsx
│   │   ├── GraficoEvolucaoPeso.tsx
│   │   ├── GraficoPercentualGordura.tsx
│   │   ├── GraficoMassaMagra.tsx
│   │   ├── GraficoPerimetria.tsx
│   │   └── MetasCard.tsx
│   └── ...
├── hooks/
│   ├── useAvaliacoesFisicas.ts
│   └── ...
├── lib/
│   ├── avaliacaoCalculos.ts
│   └── ...
├── pages/
│   ├── admin/
│   │   ├── AvaliacoesFisicas.tsx
│   │   └── EvolucaoAluno.tsx
│   └── aluno/
│       └── MinhasAvaliacoes.tsx
└── ...

scripts/
└── create-avaliacoes-fisicas-tables.sql

shared/
└── schema.ts (adicionar schemas de avaliações)
```

---

## 🔐 Segurança e Privacidade

### RLS Policies
```sql
-- Admin: acesso total
CREATE POLICY "Admin full access"
ON avaliacoes_fisicas
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE id = auth.uid() AND tipo = 'admin'
  )
);

-- Aluno: apenas suas avaliações (leitura)
CREATE POLICY "Aluno read own"
ON avaliacoes_fisicas
FOR SELECT
TO authenticated
USING (aluno_id = auth.uid());
```

### Dados Sensíveis
- Criptografia em repouso (Supabase)
- HTTPS obrigatório
- Logs de acesso
- Conformidade LGPD

---

## 📈 Métricas de Sucesso

### KPIs
- Tempo médio para criar avaliação: < 5 minutos
- Taxa de conclusão de formulários: > 90%
- Satisfação do usuário: > 4.5/5
- Precisão dos cálculos: 100%
- Uptime: > 99.5%

### Analytics
- Número de avaliações criadas
- Protocolos mais usados
- Frequência de reavaliações
- Engajamento com gráficos

---

## 🚨 Riscos e Mitigações

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Fórmulas incorretas | Alto | Testes unitários + validação científica |
| Performance com muitos dados | Médio | Paginação + cache + índices |
| Complexidade da UI | Médio | Wizard steps + tooltips |
| Privacidade de dados | Alto | RLS + criptografia + auditoria |

---

## ✅ Checklist de Implementação

### Fase 1: Banco de Dados
- [ ] Criar SQL script
- [ ] Executar no Supabase
- [ ] Adicionar schemas no Drizzle
- [ ] Configurar RLS policies
- [ ] Testar inserções

### Fase 2: Cálculos
- [ ] Implementar Pollock 7 dobras
- [ ] Implementar Pollock 3 dobras
- [ ] Implementar IMC e peso ideal
- [ ] Criar testes unitários
- [ ] Validar com casos reais

### Fase 3: Interface
- [ ] Modal de nova avaliação
- [ ] Formulário 7 dobras
- [ ] Cálculo automático
- [ ] Exibição de resultados
- [ ] Salvamento no banco

### Fase 4: Gráficos
- [ ] Instalar Recharts
- [ ] Gráfico de peso
- [ ] Gráfico de % gordura
- [ ] Gráfico de massa magra
- [ ] Página de evolução

---

## 🎓 Referências Científicas

1. **Pollock, M. L., & Jackson, A. S. (1984)**
   - Validation of clinical methods of assessing body composition

2. **Siri, W. E. (1961)**
   - Body composition from fluid spaces and density

3. **Jackson, A. S., & Pollock, M. L. (1978)**
   - Generalized equations for predicting body density

4. **ACSM Guidelines (2021)**
   - American College of Sports Medicine - Health-Related Physical Fitness

---

## 📞 Próximos Passos

1. **Revisar e aprovar** este planejamento
2. **Priorizar** fases (MVP vs. completo)
3. **Iniciar Fase 1** (banco de dados)
4. **Iterações semanais** com feedback

---

**Documento criado:** 28/11/2025
**Versão:** 1.0
**Status:** Aguardando aprovação para início
