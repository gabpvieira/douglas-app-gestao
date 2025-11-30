# Guia de Implementação - Sistema de Avaliação Física Completa

## 📋 Visão Geral

Este documento orienta a implementação de um sistema completo de avaliação física inspirado no MFIT Personal, incluindo protocolos de dobras cutâneas, bioimpedância, dados morfológicos, neuromotores e posturais.

---

## 🎯 Estrutura Principal do Sistema

### 1. Módulos de Avaliação

```
📦 Avaliações Físicas
├── 📊 Morfológica (Composição Corporal)
├── 🏃 Neuromotores (Capacidades Físicas)
├── 🧍 Postural (Avaliação Postural)
└── 📝 Anamnese (Histórico de Saúde)
```

---

## 🔬 1. AVALIAÇÃO MORFOLÓGICA

### 1.1 Protocolo de 7 Dobras Cutâneas (Pollock, 1984)

#### Pontos de Medição:
1. **Tríceps** - dobra vertical na parte posterior do braço
2. **Subescapular** - dobra oblíqua abaixo da escápula
3. **Peitoral** - dobra diagonal entre axila e mamilo
4. **Axilar Média** - dobra horizontal na linha axilar média
5. **Supra-ilíaca** - dobra diagonal acima da crista ilíaca
6. **Abdominal** - dobra vertical ao lado do umbigo
7. **Coxa** - dobra vertical na face anterior da coxa

#### Fórmulas de Cálculo:

**Para Homens:**
```
Densidade Corporal = 1.112 - (0.00043499 × ΣDobras) + 
                     (0.00000055 × ΣDobras²) - 
                     (0.00028826 × Idade)
```

**Para Mulheres:**
```
Densidade Corporal = 1.097 - (0.00046971 × ΣDobras) + 
                     (0.00000056 × ΣDobras²) - 
                     (0.00012828 × Idade)
```

**% Gordura (Fórmula de Siri):**
```
% Gordura = (495 / Densidade) - 450
```

#### Campos do Banco de Dados:

```typescript
interface DobrasPollock7 {
  id: string;
  alunoId: string;
  data: Date;
  tipo: 'pollock_7_dobras';
  
  // Dados básicos
  idade: number;
  peso: number;
  altura: number;
  genero: 'masculino' | 'feminino';
  
  // 7 Dobras Cutâneas (mm)
  triceps: number;
  subescapular: number;
  peitoral: number;
  axilarMedia: number;
  suprailiaca: number;
  abdominal: number;
  coxa: number;
  
  // Resultados calculados
  somaDobras: number;
  densidadeCorporal: number;
  percentualGordura: number;
  massaGorda: number;      // kg
  massaMagra: number;      // kg
  pesoIdeal: number;       // kg
  
  // Classificação
  classificacao: string;   // Ex: "Excelente", "Bom", "Regular"
}
```

---

### 1.2 Protocolo de 3 Dobras Cutâneas (Pollock, 1978)

#### Para Homens:
- Peitoral
- Abdominal  
- Coxa

#### Para Mulheres:
- Tríceps
- Supra-ilíaca
- Coxa

#### Fórmulas:

**Homens:**
```
Densidade = 1.10938 - (0.0008267 × ΣDobras) + 
            (0.0000016 × ΣDobras²) - 
            (0.0002574 × Idade)
```

**Mulheres:**
```
Densidade = 1.0994921 - (0.0009929 × ΣDobras) + 
            (0.0000023 × ΣDobras²) - 
            (0.0001392 × Idade)
```

---

### 1.3 Perimetria Corporal

```typescript
interface Perimetria {
  // Cabeça e Pescoço
  pescoco: number;        // cm
  
  // Tronco
  ombro: number;          // cm
  torax: number;          // cm
  cintura: number;        // cm
  abdomen: number;        // cm
  quadril: number;        // cm
  
  // Membros Superiores
  bracoRelaxadoDir: number;
  bracoRelaxadoEsq: number;
  bracoContraidoDir: number;
  bracoContraidoEsq: number;
  antebracoDir: number;
  antebracoEsq: number;
  punhoDir: number;
  punhoEsq: number;
  
  // Membros Inferiores
  coxaProximalDir: number;
  coxaProximalEsq: number;
  coxaMedialDir: number;
  coxaMedialEsq: number;
  coxaDistalDir: number;
  coxaDistalEsq: number;
  pernaDir: number;
  pernaEsq: number;
  tornozeloDir: number;
  tornozeloEsq: number;
}
```

---

### 1.4 Bioimpedância

```typescript
interface Bioimpedancia {
  id: string;
  alunoId: string;
  data: Date;
  tipo: 'bioimpedancia';
  
  // Dados básicos
  peso: number;
  altura: number;
  idade: number;
  genero: 'masculino' | 'feminino';
  
  // Medições
  resistencia: number;     // Ohms
  reatancia: number;       // Ohms
  
  // Resultados
  percentualGordura: number;
  massaGorda: number;      // kg
  massaMagra: number;      // kg
  massaMuscular: number;   // kg
  aguaCorporal: number;    // litros
  percentualAgua: number;
  massaOssea: number;      // kg
  taxaMetabolicaBasal: number; // kcal/dia
  idadeMetabolica: number;
  gorduraVisceral: number; // nível 1-59
}
```

---

## 🏃 2. AVALIAÇÃO NEUROMOTORA

### 2.1 Testes de Capacidade Física

```typescript
interface AvaliacaoNeuromotora {
  id: string;
  alunoId: string;
  data: Date;
  
  // Força
  forcaPreensaoManualDir: number;  // kg
  forcaPreensaoManualEsq: number;  // kg
  
  // Resistência Muscular
  flexaoBraco: number;             // repetições
  abdominal: number;               // repetições em 1 min
  agachamento: number;             // repetições
  
  // Flexibilidade
  sentarAlcancar: number;          // cm (Banco de Wells)
  flexaoQuadril: number;           // graus
  
  // Agilidade
  shuttleRun: number;              // segundos
  teste3Cones: number;             // segundos
  
  // Equilíbrio
  apoioUnicoPerna: number;         // segundos
  
  // Velocidade
  corrida20m: number;              // segundos
  corrida40m: number;              // segundos
  
  // Potência
  saltoVertical: number;           // cm
  saltoHorizontal: number;         // cm
  
  // Coordenação
  arremessoBola: number;           // metros
}
```

---

## 🧍 3. AVALIAÇÃO POSTURAL

```typescript
interface AvaliacaoPostural {
  id: string;
  alunoId: string;
  data: Date;
  
  // Vista Anterior
  cabeca: 'alinhada' | 'inclinada_direita' | 'inclinada_esquerda';
  ombros: 'nivelados' | 'elevado_direito' | 'elevado_esquerdo';
  clavicula: 'niveladas' | 'desnivel';
  
  // Vista Lateral
  curvaturaLombar: 'normal' | 'hiperlordose' | 'retificada';
  curvaturaDorsal: 'normal' | 'hipercifose' | 'retificada';
  curvaturaServical: 'normal' | 'hiperlordose' | 'retificada';
  
  // Membros Inferiores
  joelhos: 'normal' | 'varo' | 'valgo';
  pes: 'normal' | 'plano' | 'cavo';
  
  // Observações
  observacoes: string;
  
  // Fotos (URLs)
  fotoFrente?: string;
  fotoLateralDir?: string;
  fotoLateralEsq?: string;
  fotoCostas?: string;
}
```

---

## 📝 4. ANAMNESE

```typescript
interface Anamnese {
  id: string;
  alunoId: string;
  data: Date;
  
  // Dados Pessoais
  profissao: string;
  nivelAtividade: 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
  
  // Histórico de Saúde
  doencasPreExistentes: string[];
  cirurgias: string;
  lesoes: string;
  medicamentos: string[];
  
  // Hábitos
  fumante: boolean;
  consumoAlcool: 'nao' | 'social' | 'regular' | 'diario';
  horasSono: number;
  qualidadeSono: 'ruim' | 'regular' | 'boa' | 'excelente';
  
  // Histórico de Atividade Física
  praticaAtividade: boolean;
  tipoAtividade: string[];
  frequenciaSemanal: number;
  tempoSessao: number;
  
  // Objetivos
  objetivoPrincipal: string;
  objetivosSecundarios: string[];
  
  // Limitações
  restricoesMedicas: string;
  limitacoesMovimento: string;
  
  // Cardíaco
  pressaoArterialRepouso: string;  // Ex: "120/80"
  fcRepouso: number;
  fcMaxima: number;
  
  // Observações
  observacoes: string;
}
```

---

## 💓 5. DADOS CARDIOVASCULARES

```typescript
interface DadosCardiovasculares {
  // Frequência Cardíaca
  fcRepouso: number;              // bpm
  fcMaxima: number;               // 220 - idade (fórmula básica)
  fcMaximaReal?: number;          // bpm (se medida em teste)
  
  // Zonas de Treino (% FCmáx)
  zona1_50_60: [number, number];  // Recuperação
  zona2_60_70: [number, number];  // Aeróbico leve
  zona3_70_80: [number, number];  // Aeróbico moderado
  zona4_80_90: [number, number];  // Limiar anaeróbico
  zona5_90_100: [number, number]; // Máximo esforço
  
  // VO2 Máximo
  vo2max?: number;                // ml/kg/min
  vo2maxEstimado: number;         // calculado
  classificacaoVo2: string;       // "Excelente", "Bom", etc.
  
  // Pressão Arterial
  pressaoSistolica: number;       // mmHg
  pressaoDiastolica: number;      // mmHg
}
```

---

## 📊 6. ESTRUTURA DO BANCO DE DADOS

### Tabelas Principais:

```sql
-- Tabela de Avaliações (Pai)
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY,
  aluno_id UUID REFERENCES alunos(id),
  tipo_avaliacao VARCHAR(50), -- 'dobras', 'bioimpedancia', 'online', 'personalizado'
  protocolo VARCHAR(50),       -- 'pollock_7_dobras', 'pollock_3_dobras', etc.
  data_avaliacao DATE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Dados Morfológicos
CREATE TABLE avaliacoes_morfologicas (
  id UUID PRIMARY KEY,
  avaliacao_id UUID REFERENCES avaliacoes(id),
  peso DECIMAL(5,2),
  altura DECIMAL(5,2),
  imc DECIMAL(5,2),
  percentual_gordura DECIMAL(5,2),
  massa_gorda DECIMAL(5,2),
  massa_magra DECIMAL(5,2),
  -- ... outros campos
);

-- Dobras Cutâneas
CREATE TABLE dobras_cutaneas (
  id UUID PRIMARY KEY,
  avaliacao_id UUID REFERENCES avaliacoes(id),
  triceps DECIMAL(5,2),
  subescapular DECIMAL(5,2),
  peitoral DECIMAL(5,2),
  axilar_media DECIMAL(5,2),
  suprailiaca DECIMAL(5,2),
  abdominal DECIMAL(5,2),
  coxa DECIMAL(5,2),
  -- Campos para 3 dobras também
);

-- Perimetria
CREATE TABLE perimetria (
  id UUID PRIMARY KEY,
  avaliacao_id UUID REFERENCES avaliacoes(id),
  pescoco DECIMAL(5,2),
  ombro DECIMAL(5,2),
  torax DECIMAL(5,2),
  cintura DECIMAL(5,2),
  abdomen DECIMAL(5,2),
  quadril DECIMAL(5,2),
  -- ... membros superiores e inferiores
);

-- Avaliação Neuromotora
CREATE TABLE avaliacoes_neuromotoras (
  id UUID PRIMARY KEY,
  avaliacao_id UUID REFERENCES avaliacoes(id),
  -- campos de força, resistência, flexibilidade, etc.
);

-- Avaliação Postural
CREATE TABLE avaliacoes_posturais (
  id UUID PRIMARY KEY,
  avaliacao_id UUID REFERENCES avaliacoes(id),
  -- campos de alinhamento e postura
);

-- Anamnese
CREATE TABLE anamneses (
  id UUID PRIMARY KEY,
  aluno_id UUID REFERENCES alunos(id),
  -- campos de histórico de saúde
);
```

---

## 🎨 7. INTERFACE DO USUÁRIO

### 7.1 Modal de Nova Avaliação

**Etapa 1: Escolha do Protocolo**
```
┌─────────────────────────────────────────┐
│  Nova Avaliação Física                  │
├─────────────────────────────────────────┤
│                                         │
│  ○ Dobras Cutâneas                      │
│    └─ • 7 Dobras (Pollock, 1984)       │
│       • 3 Dobras (Pollock, 1978)       │
│                                         │
│  ○ Bioimpedância                        │
│    └─ Análise corporal por corrente    │
│                                         │
│  ○ Avaliação Online                     │
│    └─ Dados fornecidos pelo aluno      │
│                                         │
│  ○ Personalizado                        │
│    └─ Criar protocolo customizado      │
│                                         │
│         [Cancelar]  [Continuar →]      │
└─────────────────────────────────────────┘
```

**Etapa 2: Formulário de Dados**

Para **7 Dobras Cutâneas**:

```
┌─────────────────────────────────────────┐
│  Informações Básicas                    │
├─────────────────────────────────────────┤
│  Aluno: [Selecione o aluno ▼]          │
│  Data: [28/11/2025 📅]                  │
│  Tipo: [Presencial ▼]                   │
├─────────────────────────────────────────┤
│  Dados Antropométricos                  │
├─────────────────────────────────────────┤
│  Peso (kg):   [Ex: 75.5]                │
│  Altura (cm): [Ex: 175]                 │
├─────────────────────────────────────────┤
│  Dobras Cutâneas (mm)                   │
├─────────────────────────────────────────┤
│  Tríceps:        [___]                  │
│  Subescapular:   [___]                  │
│  Peitoral:       [___]                  │
│  Axilar Média:   [___]                  │
│  Supra-ilíaca:   [___]                  │
│  Abdominal:      [___]                  │
│  Coxa:           [___]                  │
├─────────────────────────────────────────┤
│  Perimetria (opcional) [Expandir ▼]    │
├─────────────────────────────────────────┤
│                                         │
│      [← Voltar]  [Calcular e Salvar]   │
└─────────────────────────────────────────┘
```

**Etapa 3: Resultados**

```
┌─────────────────────────────────────────┐
│  Resultados da Avaliação                │
├─────────────────────────────────────────┤
│  Protocolo: Pollock, 1984 – 7 Dobras    │
│                                         │
│  Densidade Corporal: 1.0534             │
│  % Gordura: 18.5%                       │
│                                         │
│  Massa Gorda: 14.0 kg                   │
│  Massa Magra: 61.5 kg                   │
│  Peso Ideal: 73.2 kg                    │
│                                         │
│  Classificação: BOM                     │
│                                         │
│  [Ver Comparação]  [Imprimir]  [Fechar] │
└─────────────────────────────────────────┘
```

---

### 7.2 Página de Histórico e Gráficos

**Layout dos Gráficos** (similar ao MFIT):

```
┌──────────────────────┬──────────────────────┐
│  Peso Corporal       │  % Gordura           │
│  [Gráfico de linha]  │  [Gráfico de linha]  │
└──────────────────────┴──────────────────────┘

┌──────────────────────┬──────────────────────┐
│  Massa Magra         │  Massa Gorda         │
│  [Gráfico de linha]  │  [Gráfico de linha]  │
└──────────────────────┴──────────────────────┘

┌──────────────────────┬──────────────────────┐
│  Perimetria: Tórax   │  Perimetria: Cintura │
│  [Gráfico de linha]  │  [Gráfico de linha]  │
└──────────────────────┴──────────────────────┘

... (mais gráficos de perimetria)
```

---

## 🔧 8. FUNCIONALIDADES ADICIONAIS

### 8.1 Comparação de Avaliações

```typescript
function compararAvaliacoes(
  avaliacaoAtual: Avaliacao,
  avaliacaoAnterior: Avaliacao
): ComparacaoResultado {
  return {
    peso: {
      atual: avaliacaoAtual.peso,
      anterior: avaliacaoAnterior.peso,
      diferenca: avaliacaoAtual.peso - avaliacaoAnterior.peso,
      percentual: ((avaliacaoAtual.peso - avaliacaoAnterior.peso) / avaliacaoAnterior.peso) * 100
    },
    // ... outros campos
  };
}
```

### 8.2 Relatórios em PDF

- Gerar PDF com dados da avaliação
- Incluir gráficos evolutivos
- Recomendações e objetivos
- Comparação com avaliação anterior

### 8.3 Metas e Objetivos

```typescript
interface MetaAluno {
  id: string;
  alunoId: string;
  pesoAlvo: number;
  percentualGorduraAlvo: number;
  dataAlvo: Date;
  prazo: number; // semanas
}
```

---

## 📱 9. RESPONSIVIDADE

### Desktop
- Layout de 2 colunas para formulários
- Gráficos lado a lado (2x2)

### Tablet
- Layout de 1-2 colunas adaptativo
- Gráficos empilhados

### Mobile
- Layout de 1 coluna
- Formulários em steps/accordion
- Gráficos full-width empilhados

---

## 🚀 10. PLANO DE IMPLEMENTAÇÃO

### Fase 1: Backend e Banco de Dados
1. Criar models e migrations
2. Implementar cálculos (Pollock 3 e 7 dobras)
3. Criar endpoints da API
4. Testes unitários das fórmulas

### Fase 2: Interface Básica
1. Modal de criação de avaliação
2. Formulário de 7 dobras
3. Página de listagem
4. Visualização de resultado individual

### Fase 3: Gráficos e Histórico
1. Integração com biblioteca de gráficos (Chart.js/Recharts)
2. Página de evolução do aluno
3. Comparação entre avaliações

### Fase 4: Protocolos Adicionais
1. Bioimpedância
2. Avaliação online
3. Protocolos personalizados

### Fase 5: Funcionalidades Extras
1. Exportação para PDF
2. Sistema de metas
3. Notificações de reavaliação
4. Dashboard com estatísticas

---

## 📚 REFERÊNCIAS

- **Pollock, M. L., & Jackson, A. S. (1984).** Research progress in validation of clinical methods of assessing body composition.
- **Siri, W. E. (1961).** Body composition from fluid spaces and density.
- **Jackson, A. S., & Pollock, M. L. (1978).** Generalized equations for predicting body density of men.

---

## 💡 OBSERVAÇÕES IMPORTANTES

1. **Validação de Dados**: Implementar validação rigorosa nos campos numéricos
2. **Precisão das Medições**: As dobras cutâneas devem ser medidas 3 vezes e usar a média
3. **Treinamento**: O avaliador deve ser treinado para garantir precisão
4. **Privacidade**: Dados de saúde são sensíveis - implementar LGPD/GDPR
5. **Backup**: Fazer backup regular dos dados de avaliação

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Banco de dados estruturado
- [ ] Cálculos de Pollock 7 dobras
- [ ] Cálculos de Pollock 3 dobras
- [ ] Interface de cadastro
- [ ] Página de listagem
- [ ] Sistema de gráficos
- [ ] Comparação de avaliações
- [ ] Exportação PDF
- [ ] Testes automatizados
- [ ] Documentação da API
- [ ] Responsividade mobile
- [ ] Sistema de backup

---

**Desenvolvido para: Douglas Personal**  
**Data: Novembro 2025**  
**Versão: 1.0**