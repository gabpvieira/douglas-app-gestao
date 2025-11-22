# Correção: Refeições dos Planos Alimentares

## Data: 22/11/2025

## Problema Identificado

As refeições criadas nos planos alimentares não estavam sendo salvas corretamente no banco de dados. Quando o usuário:
- Criava refeições manualmente
- Gerava plano automático
- Salvava o plano

Os dados das refeições sumiam após salvar e não apareciam:
- Nos cards da lista
- Ao visualizar o plano
- Ao editar o plano novamente

## Causa Raiz

A tabela `planos_alimentares` no Supabase tinha apenas os campos básicos:
- `id`, `aluno_id`, `titulo`, `conteudo_html`, `observacoes`
- **Não havia campo para armazenar dados estruturados (JSON)**

O sistema estava salvando tudo como texto no campo `conteudo_html`, perdendo a estrutura das refeições, alimentos e macros.

## Solução Implementada

### 1. Alteração no Banco de Dados

Adicionado novo campo `dados_json` do tipo JSONB na tabela `planos_alimentares`:

```sql
ALTER TABLE planos_alimentares 
ADD COLUMN IF NOT EXISTS dados_json JSONB;

CREATE INDEX IF NOT EXISTS idx_planos_alimentares_dados_json 
ON planos_alimentares USING gin (dados_json);
```

### 2. Estrutura do JSON Salvo

O campo `dados_json` armazena:

```json
{
  "objetivo": "emagrecimento",
  "categoria": "basico",
  "calorias": 1500,
  "proteinas": 120,
  "carboidratos": 150,
  "gorduras": 50,
  "restricoes": ["Lactose", "Glúten"],
  "descricao": "Plano para emagrecimento...",
  "refeicoes": [
    {
      "id": "1",
      "nome": "Café da Manhã",
      "horario": "07:00",
      "calorias": 375,
      "observacoes": "",
      "alimentos": [
        {
          "id": "a1",
          "nome": "Aveia",
          "quantidade": 30,
          "unidade": "g",
          "calorias": 117,
          "proteinas": 4,
          "carboidratos": 20,
          "gorduras": 2,
          "categoria": "cereais"
        }
      ]
    }
  ]
}
```

### 3. Alterações no Backend

**Arquivo:** `server/routes/planosAlimentares.ts`

#### Criar Plano (POST)
- Adicionado parâmetro `dadosJson` no body
- Salvando `dados_json` no banco

#### Atualizar Plano (PUT)
- Adicionado parâmetro `dadosJson` no body
- Atualizando `dados_json` no banco

#### Listar Planos (GET)
- Retornando campo `dadosJson` nas respostas

### 4. Alterações no Frontend

**Arquivo:** `client/src/pages/PlanosAlimentares.tsx`

#### Função `handleSalvarPlano`
- Criando objeto `dadosJson` com todos os dados estruturados
- Enviando `dadosJson` junto com `conteudoHtml` e `observacoes`
- Mantendo `conteudoHtml` para visualização em texto

#### Adaptação dos Planos
- Função `planosAdaptados` agora lê dados de `dadosJson` quando disponível
- Fallback para valores padrão se `dadosJson` não existir (compatibilidade com planos antigos)

**Arquivo:** `client/src/hooks/usePlanosAlimentares.ts`

- Adicionado campo `dadosJson` nas interfaces:
  - `PlanoAlimentar`
  - `CreatePlanoData`
  - `UpdatePlanoData`

### 5. Compatibilidade com Dados Antigos

O sistema mantém compatibilidade com planos criados antes da correção:
- Se `dadosJson` não existir, usa valores padrão
- `conteudoHtml` continua sendo gerado para visualização
- Planos antigos podem ser editados e terão `dadosJson` criado

## Benefícios

✅ **Persistência Completa**: Todas as refeições e alimentos são salvos
✅ **Edição Preservada**: Ao editar um plano, todas as refeições aparecem
✅ **Visualização Correta**: Cards mostram dados reais (calorias, proteínas, etc.)
✅ **Performance**: Índice GIN no JSONB para consultas rápidas
✅ **Flexibilidade**: Estrutura JSON permite adicionar novos campos facilmente
✅ **Compatibilidade**: Planos antigos continuam funcionando

## Testes Recomendados

1. ✅ Criar novo plano com refeições manuais
2. ✅ Gerar plano automático
3. ✅ Salvar e verificar se refeições aparecem nos cards
4. ✅ Editar plano e verificar se refeições são carregadas
5. ✅ Visualizar detalhes do plano
6. ✅ Verificar cálculo de macros nos cards
7. ✅ Testar com planos antigos (sem dadosJson)

## Arquivos Modificados

1. `server/routes/planosAlimentares.ts` - Backend
2. `client/src/pages/PlanosAlimentares.tsx` - Página principal
3. `client/src/hooks/usePlanosAlimentares.ts` - Hooks
4. Banco de dados: Tabela `planos_alimentares` - Novo campo `dados_json`

## Próximos Passos

- [ ] Testar criação de planos com múltiplas refeições
- [ ] Testar edição de planos existentes
- [ ] Verificar visualização no modal de detalhes
- [ ] Validar cálculos de macros
- [ ] Testar geração automática de planos
