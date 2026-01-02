# Correção: Avaliações Posturais - Salvamento

## Problema Identificado

### Causa Raiz
O problema de salvamento das avaliações posturais (texto e fotos) estava relacionado ao **mapeamento incorreto de campos** entre o frontend (camelCase) e o banco de dados PostgreSQL (snake_case).

### Detalhes Técnicos

1. **Avaliação Postural (Texto)** - `ModulosAdicionaisModal.tsx`:
   - O `FormularioPostural` enviava campos em camelCase (ex: `cabecaAlinhamento`, `ombrosAlinhamento`)
   - O hook `useCreateAvaliacaoPostural` passava esses dados diretamente para o Supabase
   - O Supabase esperava campos em snake_case (ex: `cabeca`, `ombros`)
   - **Resultado**: Insert silencioso sem erro, mas campos não mapeados eram ignorados

2. **Avaliação Postural com Fotos** - `useAvaliacoesPosturais.ts`:
   - O hook já fazia o mapeamento correto para snake_case ✅
   - Porém faltava tratamento de erros adequado

---

## Correções Aplicadas

### 1. Hook `useAvaliacoesAdicionais.ts`
- Adicionadas funções de mapeamento `mapPosturalToDb()` e `mapPosturalFromDb()`
- Conversão automática camelCase ↔ snake_case
- Logs de debug para rastreamento
- Tratamento de erros com mensagens claras
- Validação de retorno após insert/update

### 2. Hook `useAvaliacoesPosturais.ts`
- Melhorado tratamento de erros no upload de fotos
- Adicionados logs detalhados
- Mensagens de erro específicas para problemas de bucket/permissão
- Path de upload padronizado: `avaliacoes/{alunoId}/{tipo}_{timestamp}.{ext}`

### 3. Componente `ModulosAdicionaisModal.tsx`
- Corrigido erro de sintaxe (falta de `};`)
- Adicionado `avaliacaoId` no payload de update
- Logs de debug para rastreamento
- Tratamento de tipos para anamnese (boolean vs string)

### 4. Componente `FormularioPostural.tsx`
- Adicionado estado de loading (`isLoading` prop)
- Botão desabilitado durante salvamento
- Feedback visual "Salvando..."

### 5. Componente `AvaliacaoPosturalModal.tsx`
- Já tinha tratamento de erros adequado ✅

---

## ✅ Ações Executadas no Supabase (via MCP)

### 1. RLS Policies Corrigidas
As seguintes migrations foram aplicadas automaticamente:

- `fix_avaliacoes_posturais_rls` - Corrigiu policies com WITH CHECK
- `fix_avaliacoes_neuromotoras_rls` - Corrigiu policies com WITH CHECK  
- `fix_anamneses_rls` - Corrigiu policies com WITH CHECK

### 2. Storage Policies
O bucket `fotos-progresso` já estava configurado corretamente:
- Bucket público: ✅
- Limite de tamanho: 5MB
- Tipos permitidos: JPEG, PNG, WebP
- Policies de upload/read/delete: ✅

### 3. Policies Ativas
```
avaliacoes_posturais:
  - admin_full_access_avaliacoes_posturais (ALL)
  - aluno_read_own_avaliacoes_posturais (SELECT)

avaliacoes_neuromotoras:
  - admin_full_access_avaliacoes_neuromotoras (ALL)
  - aluno_read_own_avaliacoes_neuromotoras (SELECT)

anamneses:
  - admin_full_access_anamneses (ALL)
  - aluno_read_own_anamneses (SELECT)
```

---

## Fluxo de Dados Corrigido

### Avaliação Postural (Texto)
```
FormularioPostural (camelCase)
    ↓
handlePosturalSubmit()
    ↓
useCreateAvaliacaoPostural / useUpdateAvaliacaoPostural
    ↓
mapPosturalToDb() → converte para snake_case
    ↓
Supabase INSERT/UPDATE
    ↓
mapPosturalFromDb() → converte para camelCase
    ↓
Retorno para o componente
```

### Avaliação Postural (Fotos)
```
AvaliacaoPosturalModal
    ↓
uploadFotoPostural() → Upload para Storage
    ↓
useCriarAvaliacaoPostural → INSERT com URLs
    ↓
Supabase INSERT
    ↓
Retorno com dados salvos
```

---

## Verificação

Para verificar se as correções funcionam:

1. Acesse `/admin/avaliacoes-fisicas`
2. Selecione um aluno e abra uma avaliação
3. Clique em "Módulos" e selecione "Postural (Texto)"
4. Preencha alguns campos e clique em "Salvar"
5. Verifique no console do navegador os logs de debug
6. Reabra a avaliação e confirme que os dados foram persistidos

Para fotos:
1. Clique em "Avaliação Postural com Fotos"
2. Adicione uma nova avaliação com fotos
3. Verifique se as fotos aparecem na galeria
4. Teste a comparação entre avaliações

---

## Arquivos Modificados

- `client/src/hooks/useAvaliacoesAdicionais.ts` - Mapeamento completo
- `client/src/hooks/useAvaliacoesPosturais.ts` - Tratamento de erros
- `client/src/components/avaliacoes/ModulosAdicionaisModal.tsx` - Correções de sintaxe e tipos
- `client/src/components/avaliacoes/FormularioPostural.tsx` - Estado de loading
- `scripts/fix-avaliacoes-posturais-rls.sql` - Script de RLS (NOVO)
