# Correção - Métricas dos Planos Alimentares

## Problema Identificado

As métricas exibidas nos cards e modais dos planos alimentares estavam inconsistentes:
- **Card**: Mostrava valores fixos (metas)
- **Modal**: Calculava valores reais das refeições

## Lógica Correta Implementada

### 1. Cálculo das Métricas (`PlanosAlimentares.tsx`)

```typescript
// Calcular macros totais das refeições
let totalCalorias = 0;
let totalProteinas = 0;
let totalCarboidratos = 0;
let totalGorduras = 0;

refeicoes.forEach((ref: any) => {
  if (ref.alimentos && Array.isArray(ref.alimentos)) {
    ref.alimentos.forEach((alim: any) => {
      totalCalorias += alim.calorias || 0;
      totalProteinas += alim.proteinas || 0;
      totalCarboidratos += alim.carboidratos || 0;
      totalGorduras += alim.gorduras || 0;
    });
  }
});

// Se houver refeições, usar valores calculados; senão, usar metas
calorias: totalCalorias > 0 ? Math.round(totalCalorias) : (dadosJson.calorias || 2000),
proteinas: totalProteinas > 0 ? Math.round(totalProteinas) : (dadosJson.proteinas || 150),
carboidratos: totalCarboidratos > 0 ? Math.round(totalCarboidratos) : (dadosJson.carboidratos || 250),
gorduras: totalGorduras > 0 ? Math.round(totalGorduras) : (dadosJson.gorduras || 70)
```

### 2. Exibição no Card (`PlanosAlimentaresList.tsx`)

Os cards agora exibem os valores já calculados:
- ✅ Calorias totais das refeições (ou meta se não houver refeições)
- ✅ Proteínas totais (ou meta)
- ✅ Carboidratos totais (ou meta)
- ✅ Número de refeições

### 3. Exibição no Modal (`PlanoDetalhesModal.tsx`)

O modal tem uma função `calcularTotalMacros()` que:
1. Se **não houver refeições**: retorna as metas do plano
2. Se **houver refeições**: soma todos os alimentos de todas as refeições

```typescript
const calcularTotalMacros = () => {
  if (!plano.refeicoes || plano.refeicoes.length === 0) {
    return {
      calorias: plano.calorias,
      proteinas: plano.proteinas,
      carboidratos: plano.carboidratos,
      gorduras: plano.gorduras
    };
  }

  // Soma todos os alimentos de todas as refeições
  const totais = plano.refeicoes.reduce((acc, refeicao) => {
    const refeicaoMacros = refeicao.alimentos.reduce((refAcc, alimento) => ({
      calorias: refAcc.calorias + alimento.calorias,
      proteinas: refAcc.proteinas + alimento.proteinas,
      carboidratos: refAcc.carboidratos + alimento.carboidratos,
      gorduras: refAcc.gorduras + alimento.gorduras
    }), { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 });

    return {
      calorias: acc.calorias + refeicaoMacros.calorias,
      proteinas: acc.proteinas + refeicaoMacros.proteinas,
      carboidratos: acc.carboidratos + refeicaoMacros.carboidratos,
      gorduras: acc.gorduras + refeicaoMacros.gorduras
    };
  }, { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 });

  return totais;
};
```

### 4. Indicador Visual no Modal

O modal mostra um aviso quando está exibindo metas vs valores calculados:

```typescript
{!temRefeicoes && (
  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
    <AlertCircle className="h-5 w-5 text-blue-400" />
    <p className="text-sm font-medium text-blue-400">Valores de Referência</p>
    <p className="text-xs text-gray-400">
      Os valores exibidos são as metas nutricionais do plano. 
      Para ver valores calculados, adicione refeições detalhadas ao plano.
    </p>
  </div>
)}
```

E nos cards de macros:
```typescript
<div className="text-xs text-gray-500">
  {temRefeicoes ? `Meta: ${plano.calorias} kcal` : 'Meta diária'}
</div>
```

## Estrutura de Dados

### Banco de Dados (Supabase)

```sql
-- Tabela principal
planos_alimentares (
  id,
  aluno_id,
  titulo,
  conteudo_html,
  observacoes,
  dados_json -- { objetivo, categoria, calorias (meta), proteinas (meta), etc }
)

-- Refeições
refeicoes_plano (
  id,
  plano_id,
  nome,
  horario,
  ordem,
  calorias_calculadas -- soma automática dos alimentos
)

-- Alimentos
alimentos_refeicao (
  id,
  refeicao_id,
  nome,
  quantidade,
  unidade,
  calorias,
  proteinas,
  carboidratos,
  gorduras
)
```

### Interface TypeScript

```typescript
interface PlanoAlimentar {
  id: string;
  nome: string;
  descricao: string;
  objetivo: 'emagrecimento' | 'ganho_massa' | 'manutencao' | 'definicao';
  calorias: number;        // Calculado das refeições OU meta
  proteinas: number;       // Calculado das refeições OU meta
  carboidratos: number;    // Calculado das refeições OU meta
  gorduras: number;        // Calculado das refeições OU meta
  refeicoes: Refeicao[];
  // ...
}
```

## Fluxo de Dados

1. **Criação/Edição do Plano**:
   - Usuário define metas no `dadosJson`
   - Usuário adiciona refeições com alimentos
   - Sistema calcula totais automaticamente

2. **Exibição**:
   - Se `refeicoes.length > 0`: mostra valores calculados
   - Se `refeicoes.length === 0`: mostra metas do `dadosJson`

3. **Consistência**:
   - Card e Modal sempre mostram os mesmos valores
   - Valores são calculados uma vez no componente principal
   - Componentes filhos apenas exibem os valores recebidos

## Resultado

✅ **Card e Modal agora mostram os mesmos valores**
✅ **Valores calculados das refeições quando disponíveis**
✅ **Metas exibidas quando não há refeições**
✅ **Indicador visual claro da origem dos dados**
✅ **Arredondamento consistente (Math.round)**

## Exemplo Visual

### Plano COM refeições:
```
Card:
Calorias: 2847 (calculado)
Proteínas: 185g (calculado)
Carboidratos: 312g (calculado)

Modal:
Calorias: 2847
Meta: 2000 kcal ← mostra comparação
```

### Plano SEM refeições:
```
Card:
Calorias: 2000 (meta)
Proteínas: 150g (meta)
Carboidratos: 250g (meta)

Modal:
Calorias: 2000
Meta diária ← indica que é meta
[Aviso azul explicando]
```
