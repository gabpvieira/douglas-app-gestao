# 🎨 GUIA DE ESTILO - PAINEL DO ALUNO

**Versão:** 1.0  
**Data:** 07/12/2025  
**Objetivo:** Manter consistência visual em todas as páginas do painel do aluno

---

## 📐 PADRÃO DE DESIGN FLAT MINIMALISTA

### 🎯 Princípios Gerais

1. **Background Principal:** `bg-gray-950` com padding `p-3 sm:p-6`
2. **Cards:** `bg-gray-900/30` com `border-gray-800`
3. **Hover States:** `hover:bg-gray-900/40 transition-colors`
4. **Sem Sombras:** Design completamente flat, sem shadows
5. **Ícones:** Sempre `text-gray-400` sem backgrounds coloridos

---

## 📊 KPIs / STATS CARDS

### Estilo Horizontal Compacto

```tsx
<Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
  <div className="p-4 flex items-center gap-4">
    <IconComponent className="w-10 h-10 text-gray-400 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-400 mb-1">Label</p>
      <p className="text-2xl font-bold text-white">Valor</p>
      <p className="text-xs text-gray-500">subtítulo</p>
    </div>
  </div>
</Card>
```

**Características:**
- Layout horizontal (ícone à esquerda, texto à direita)
- Ícone: `w-10 h-10 text-gray-400` (sem container colorido)
- Grid responsivo: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3`
- Padding: `p-4`
- Gap entre elementos: `gap-4`

---

## 🎴 QUICK ACTIONS / AÇÕES RÁPIDAS

### Estilo Elegante com Gradiente

```tsx
<button
  className="group relative overflow-hidden rounded-xl border border-gray-800/50 bg-gradient-to-b from-gray-900/40 to-gray-900/20 hover:border-gray-700/50 transition-all duration-300 cursor-pointer"
  onClick={() => setLocation("/rota")}
>
  <div className="p-6 flex flex-col items-center text-center">
    <div className="mb-4 p-3 rounded-lg bg-gray-800/30 group-hover:bg-gray-800/50 transition-colors">
      <IconComponent className="h-6 w-6 text-gray-400 group-hover:text-white transition-colors" />
    </div>
    <h3 className="text-sm font-medium text-white mb-1">Título</h3>
    <p className="text-xs text-gray-500">Descrição</p>
  </div>
</button>
```

**Características:**
- Botão nativo (não Card component)
- Gradiente sutil: `from-gray-900/40 to-gray-900/20`
- Border radius maior: `rounded-xl`
- Ícone em container com hover effect
- Transições suaves: `duration-300`

---

## 📋 SEÇÕES DE CONTEÚDO

### Header de Seção

```tsx
<div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
  <h1 className="text-2xl font-semibold text-white mb-1">Título</h1>
  <p className="text-sm text-gray-400">Descrição</p>
</div>
```

### Cards de Lista

```tsx
<Card className="border-gray-800 bg-gray-900/30">
  <div className="p-5 border-b border-gray-800">
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-base font-medium text-white">Título</h2>
      <Button variant="ghost" size="sm" className="text-xs text-gray-400 hover:text-white">
        Ver todos
        <ArrowRight className="w-3 h-3 ml-1" />
      </Button>
    </div>
  </div>
  
  <div className="divide-y divide-gray-800">
    {/* Items da lista */}
  </div>
</Card>
```

---

## 🎨 PALETA DE CORES

### Backgrounds
- **Principal:** `bg-gray-950`
- **Cards:** `bg-gray-900/30`
- **Hover:** `bg-gray-900/40`
- **Seções:** `bg-gray-900/50`
- **Items:** `bg-gray-800/50`

### Borders
- **Padrão:** `border-gray-800`
- **Hover:** `border-gray-700`
- **Sutil:** `border-gray-800/50`

### Textos
- **Título:** `text-white`
- **Label:** `text-gray-400`
- **Subtítulo:** `text-gray-500`
- **Ícones:** `text-gray-400`

### Badges (sem bordas)
- **Ativo:** `bg-green-500/10 text-green-400 border-0`
- **Pausado:** `bg-yellow-500/10 text-yellow-400 border-0`
- **Concluído:** `bg-blue-500/10 text-blue-400 border-0`

---

## 📱 RESPONSIVIDADE

### Breakpoints Padrão
```tsx
// Mobile-first approach
grid-cols-1           // < 768px
md:grid-cols-2        // 768px - 1024px
lg:grid-cols-4        // > 1024px
```

### Padding Responsivo
```tsx
p-3 sm:p-6           // Padding principal
p-4                  // Cards internos
p-5                  // Seções maiores
```

---

## 🔤 TIPOGRAFIA

### Tamanhos
- **Título Principal:** `text-2xl font-semibold`
- **Título Seção:** `text-base font-medium`
- **Valor KPI:** `text-2xl font-bold`
- **Label:** `text-xs`
- **Descrição:** `text-sm`
- **Label Uppercase:** `text-[10px] uppercase tracking-wide`

### Pesos
- **Bold:** Valores, títulos principais
- **Semibold:** Títulos de seção
- **Medium:** Labels, subtítulos
- **Normal:** Textos descritivos

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

Ao criar/atualizar uma página, verificar:

- [ ] Background principal é `bg-gray-950`
- [ ] Cards usam `bg-gray-900/30` e `border-gray-800`
- [ ] Hover states com `hover:bg-gray-900/40`
- [ ] Ícones são `text-gray-400` sem backgrounds coloridos
- [ ] KPIs seguem layout horizontal compacto
- [ ] Quick Actions usam gradiente e rounded-xl
- [ ] Badges sem bordas (`border-0`)
- [ ] Tipografia consistente (text-xs, text-sm, text-2xl)
- [ ] Grid responsivo (1 col mobile, 2-4 cols desktop)
- [ ] Padding uniforme (p-3 sm:p-6 no container)
- [ ] Transições suaves (`transition-colors`, `duration-300`)
- [ ] Sem sombras (design flat)

---

## 📝 EXEMPLO COMPLETO DE PÁGINA

```tsx
export default function MinhaPage() {
  return (
    <AlunoLayout>
      <div className="min-h-screen bg-gray-950 p-3 sm:p-6">
        <div className="w-full space-y-4 sm:space-y-6">
          
          {/* Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-white mb-1">Título</h1>
            <p className="text-sm text-gray-400">Descrição</p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Cards horizontais compactos */}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Botões com gradiente */}
          </div>

          {/* Conteúdo */}
          <Card className="border-gray-800 bg-gray-900/30">
            {/* Conteúdo da página */}
          </Card>

        </div>
      </div>
    </AlunoLayout>
  );
}
```

---

## 🚀 PROMPT PARA ATUALIZAÇÃO

**Use este texto ao solicitar atualizações:**

> "Atualize a página [NOME_DA_PÁGINA] seguindo o guia de estilo do painel do aluno (GUIA_ESTILO_PAINEL_ALUNO.md). Aplique:
> 
> 1. Design flat minimalista com bg-gray-950
> 2. KPIs horizontais compactos (ícone cinza à esquerda, sem containers coloridos)
> 3. Quick Actions com gradiente e rounded-xl
> 4. Cards com bg-gray-900/30 e border-gray-800
> 5. Hover states suaves
> 6. Badges sem bordas
> 7. Tipografia consistente
> 8. Grid responsivo
> 
> Mantenha a mesma harmonia visual das páginas Dashboard e MeusTreinos."

---

**Fim do Guia de Estilo**
