# Melhorias nos Cards de Planos Alimentares

## Data: 22/11/2025

## Alterações Realizadas

### Redesign Completo dos Cards

Redesenhamos completamente os cards de planos alimentares para um estilo mais **compacto, profissional e minimalista**.

### Principais Mudanças

#### 1. Layout Compacto
- Redução do padding geral do card (de `p-6` para `p-4`)
- Espaçamento entre elementos reduzido (de `space-y-4` para `space-y-3`)
- Grid de cards com gap menor (de `gap-6` para `gap-4`)

#### 2. Descrição Limitada
- Implementado `line-clamp-2` para exibir apenas **2 linhas** da descrição
- Texto com `leading-relaxed` para melhor legibilidade
- Tamanho de fonte reduzido para `text-xs`

#### 3. Tema Escuro Profissional
- Background: `bg-gray-900/50` com `backdrop-blur`
- Bordas: `border-gray-800`
- Hover state: `hover:bg-gray-900/70`
- Transições suaves com `transition-all`

#### 4. Badges Minimalistas
- Tamanho reduzido: `text-[10px]`
- Estilo outline com cores sutis
- Objetivo: `border-blue-500/30 bg-blue-500/10 text-blue-400`
- Categoria: `border-purple-500/30 bg-purple-500/10 text-purple-400`

#### 5. Grid de Macros Redesenhado
- Layout em 4 colunas compactas
- Separadores verticais com `border-l border-gray-800`
- Labels em uppercase com `tracking-wide`
- Tamanho de fonte: labels `text-[10px]`, valores `text-sm`
- Bordas superior e inferior para destaque

#### 6. Footer Simplificado
- Exibe apenas o primeiro nome do aluno
- Ícones menores (`h-3.5 w-3.5`)
- Texto em `text-xs text-gray-500`

#### 7. Botões de Ação Compactos
- Altura reduzida: `h-8`
- Texto menor: `text-xs`
- Ícones menores: `h-3.5 w-3.5`
- Estilo consistente com tema escuro

#### 8. Menu Dropdown Atualizado
- Background: `bg-gray-800`
- Bordas: `border-gray-700`
- Hover states consistentes
- Separadores em `bg-gray-700`

### Elementos Removidos

Para tornar o card mais compacto, removemos:
- Seção de restrições alimentares (pode ser vista nos detalhes)
- Lista completa de alunos atribuídos (mostra apenas o primeiro)
- Informação de gorduras no grid de macros
- Badges de status redundantes

### Resultado

Os cards agora são:
- ✅ Mais compactos (ocupam menos espaço vertical)
- ✅ Mais profissionais (tema escuro consistente)
- ✅ Mais minimalistas (informações essenciais apenas)
- ✅ Melhor legibilidade (hierarquia visual clara)
- ✅ Descrição limitada a 2 linhas

### Arquivos Modificados

1. `client/src/components/PlanosAlimentaresList.tsx` - Cards da lista
2. `client/src/components/PlanoAlimentarModal.tsx` - Modal de edição/criação

## Melhorias no Modal de Edição

### Principais Mudanças no Modal

#### 1. Header Compacto
- Altura reduzida do ícone (de `h-10 w-10` para `h-9 w-9`)
- Título menor (de `text-2xl` para `text-lg`)
- Descrição com `line-clamp-1` e `text-xs`
- Padding reduzido (de `pb-4` para `pb-3`)

#### 2. Tabs Minimalistas
- Padding reduzido (de `p-1` para `p-0.5`)
- Texto menor (de padrão para `text-xs`)
- Altura reduzida (de padrão para `py-2`)
- Gap entre tabs: `gap-0.5`

#### 3. Cards Internos Compactos
- Background: `bg-gray-800/30` (mais sutil)
- Padding do header: `pb-3` (reduzido)
- Títulos: `text-base` (menor)
- Descrições: `text-xs`
- Ícones: `h-4 w-4` (menores)

#### 4. Inputs e Labels Compactos
- Labels: `text-xs` com `space-y-1.5`
- Inputs: `h-9` com `text-sm`
- Textareas: `rows={2}` (reduzido)
- Selects: `h-9` com `text-sm`

#### 5. Badges Minimalistas
- Tamanho: `text-xs` ou `text-[10px]`
- Cores sutis com transparência (ex: `bg-red-600/20 border-red-600/30`)
- Espaçamento reduzido: `gap-1.5`

#### 6. Botões Compactos
- Altura: `h-9` ou `h-8`
- Texto: `text-xs` ou `text-sm`
- Ícones: `h-3.5 w-3.5`
- Padding reduzido

#### 7. Grid de Macros Redesenhado
- Background: `bg-gray-700/50` com borda
- Padding: `p-3` (reduzido)
- Valores: `text-lg` (menor)
- Labels: `text-[10px]` com `uppercase tracking-wide`

#### 8. Seção de Refeições Compacta
- Cards: `bg-gray-800/30`
- Espaçamento: `space-y-3` e `gap-3`
- Inputs de alimentos com grid compacto
- Botões menores e mais discretos

#### 9. Seção de Atribuições Compacta
- Cards de alunos: `p-2.5` com `border border-gray-700`
- Texto: `text-sm` e `text-xs`
- Badges: `text-[10px]`
- Layout com `line-clamp-1` para evitar overflow

#### 10. Footer Compacto
- Padding: `mt-4 pt-3` (reduzido)
- Botões: `h-9` com `text-sm`
- Gap: `gap-2`

### Compatibilidade

- ✅ Totalmente responsivo
- ✅ Mantém todas as funcionalidades existentes
- ✅ Sem breaking changes
- ✅ Tema escuro consistente com o resto da aplicação
- ✅ Modal mais compacto e profissional
- ✅ Melhor aproveitamento do espaço vertical
