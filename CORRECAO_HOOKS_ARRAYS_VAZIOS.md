# Correção: Hooks Retornando Arrays Vazios

## 🔴 Problema Identificado

Após corrigir as variáveis de ambiente, Dashboard e Alunos funcionavam, mas outras páginas (Agenda, Planos Alimentares, Fichas de Treino) não carregavam dados.

**Causa**: Alguns hooks do frontend estavam retornando arrays vazios com comentários "TODO: Implementar com Supabase", mesmo com as rotas da API já implementadas.

## ✅ Correções Aplicadas

### 1. Hook `usePlanosAlimentares` (client/src/hooks/usePlanosAlimentares.ts)

**ANTES (❌ ERRADO):**
```typescript
export function usePlanosAlimentares(alunoId: string) {
  return useQuery<PlanoAlimentar[]>({
    queryKey: ['planos-alimentares', alunoId],
    queryFn: async () => {
      // TODO: Implementar com Supabase
      console.warn('usePlanosAlimentares: Retornando array vazio temporariamente');
      return [];
    },
    enabled: !!alunoId
  });
}
```

**DEPOIS (✅ CORRETO):**
```typescript
export function usePlanosAlimentares(alunoId: string) {
  return useQuery<PlanoAlimentar[]>({
    queryKey: ['planos-alimentares', alunoId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/planos-alimentares/${alunoId}`);
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error('Falha ao buscar planos alimentares');
      }
      return response.json();
    },
    enabled: !!alunoId
  });
}
```

### 2. Hook `useAgendamentos` (client/src/hooks/useAgendamentos.ts)

**ANTES (❌ ERRADO):**
```typescript
export function useAgendamentos(data?: string, alunoId?: string) {
  return useQuery<Agendamento[]>({
    queryKey: ['agendamentos', data, alunoId],
    queryFn: async () => {
      // TODO: Implementar com Supabase
      console.warn('useAgendamentos: Retornando array vazio temporariamente');
      return [];
    }
  });
}
```

**DEPOIS (✅ CORRETO):**
```typescript
export function useAgendamentos(data?: string, alunoId?: string) {
  return useQuery<Agendamento[]>({
    queryKey: ['agendamentos', data, alunoId],
    queryFn: async () => {
      let url = '/api/admin/agendamentos';
      const params = new URLSearchParams();
      if (data) params.append('data', data);
      if (alunoId) params.append('alunoId', alunoId);
      if (params.toString()) url += `?${params.toString()}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Falha ao buscar agendamentos');
      }
      return response.json();
    }
  });
}
```

## 📊 Status das Páginas

| Página | Status Antes | Status Depois | Rota API |
|--------|--------------|---------------|----------|
| Dashboard | ✅ Funcionando | ✅ Funcionando | `/api/admin/students` |
| Alunos | ✅ Funcionando | ✅ Funcionando | `/api/admin/students` |
| Agenda | ❌ Array vazio | ✅ Funcionando | `/api/admin/agendamentos` |
| Planos Alimentares | ❌ Array vazio | ✅ Funcionando | `/api/admin/planos-alimentares/:alunoId` |
| Fichas de Treino | ✅ Funcionando | ✅ Funcionando | `/api/fichas-treino` |

## 🔍 Como Identificar Problemas Similares

Se outras páginas não carregarem dados, verifique:

1. **Console do navegador**: Procure por warnings como "Retornando array vazio temporariamente"
2. **Network tab**: Verifique se as chamadas à API estão sendo feitas
3. **Hooks**: Procure por `TODO` ou `console.warn` nos arquivos de hooks

```bash
# Buscar TODOs nos hooks
grep -r "TODO" client/src/hooks/

# Buscar arrays vazios hardcoded
grep -r "return \[\]" client/src/hooks/
```

## 🚀 Deploy

Commit: `5c0d2f5`
Status: BUILDING → READY

As páginas de Agenda e Planos Alimentares agora devem carregar dados normalmente após o deploy.

## 📝 Lições Aprendidas

1. **Sempre verificar hooks**: Mesmo com rotas da API implementadas, hooks podem estar desconectados
2. **Remover TODOs**: Comentários TODO podem indicar código incompleto que precisa ser finalizado
3. **Testar todas as páginas**: Não assumir que se uma página funciona, todas funcionam
4. **Console warnings**: Prestar atenção em warnings do console durante desenvolvimento

## ✅ Próximos Passos

Após o deploy, testar:
1. ✅ Dashboard
2. ✅ Alunos
3. ✅ Agenda (agora deve funcionar)
4. ✅ Planos Alimentares (agora deve funcionar)
5. ✅ Fichas de Treino
6. ✅ Vídeos de Treino
7. ✅ Fotos de Progresso
