# Correção: Exibição de Dados do Supabase

## Problemas Identificados

### 1. Agenda Profissional - Horários não aparecendo
**Sintoma**: O card do agendamento não mostrava o horário (elemento circulado na imagem)

**Causa**: O código estava tentando acessar `agendamento.blocoHorario.horaInicio` mas os dados vêm diretamente como `agendamento.horaInicio`

**Correção**: Atualizado `client/src/pages/AgendaProfissional.tsx` para acessar os campos corretos:
```typescript
// ANTES (errado)
agendamento.blocoHorario?.horaInicio
agendamento.blocoHorario?.tipo

// DEPOIS (correto)
agendamento.horaInicio
agendamento.tipo
```

### 2. Treinos Vídeo - Vídeos não aparecendo
**Sintoma**: Página de treinos vídeo não mostrava os 5 vídeos existentes no banco

**Causa**: O Supabase retorna dados em snake_case (`url_video`, `thumbnail_url`) mas o código esperava camelCase (`urlVideo`, `thumbnailUrl`)

**Correção**: Adicionada conversão no hook `client/src/hooks/useTreinosVideo.ts`:
```typescript
// Converter snake_case para camelCase
const converted = (data || []).map((item: any) => ({
  id: item.id,
  nome: item.nome,
  objetivo: item.objetivo,
  descricao: item.descricao,
  urlVideo: item.url_video,        // ← Conversão
  thumbnailUrl: item.thumbnail_url, // ← Conversão
  duracao: item.duracao,
  dataUpload: item.data_upload,
  createdAt: item.created_at
}));
```

### 3. Planos Alimentares - Planos não aparecendo
**Sintoma**: Página de planos alimentares não mostrava os 10 planos existentes no banco

**Causa**: Falta de logs para diagnosticar o problema

**Correção**: Adicionados logs detalhados no hook `client/src/hooks/usePlanosAlimentares.ts`:
```typescript
console.log('🔍 [usePlanosAlimentares] Iniciando busca...', { alunoId });
console.log('📊 [usePlanosAlimentares] Resultado da query:', {
  sucesso: !error,
  erro: error,
  quantidadePlanos: data?.length,
  primeiroPlano: data?.[0]
});
console.log('✅ [usePlanosAlimentares] Dados convertidos:', converted);
```

## Dados Verificados no Supabase

### Agendamentos Presenciais
```sql
SELECT COUNT(*) FROM agendamentos_presenciais;
-- Resultado: 5 agendamentos criados
```

### Treinos Vídeo
```sql
SELECT COUNT(*) FROM treinos_video;
-- Resultado: 5 vídeos
```

Vídeos existentes:
1. Agachamento com Haltere (Pernas, 11s)
2. Remada com Haltere (Costas, 8s)
3. Remada no Banco Triangulo (Costas, 9s)
4. Ombros em Pé com Halteres (Ombros, 12s)
5. Agachamento com Halteres Vertical (Pernas, 14s)

### Planos Alimentares
```sql
SELECT COUNT(*) FROM planos_alimentares;
-- Resultado: 10 planos
```

## Padrão de Conversão snake_case ↔ camelCase

### Regra Geral
- **Supabase (PostgreSQL)**: usa snake_case (`aluno_id`, `created_at`, `url_video`)
- **Frontend (TypeScript)**: usa camelCase (`alunoId`, `createdAt`, `urlVideo`)

### Onde Fazer a Conversão
✅ **Nos hooks** (`client/src/hooks/*.ts`) - Camada de dados
- Converter ao receber dados do Supabase (snake_case → camelCase)
- Converter ao enviar dados para o Supabase (camelCase → snake_case)

❌ **Não fazer nas páginas** - Camada de apresentação
- As páginas devem trabalhar apenas com camelCase
- Mantém o código limpo e consistente

### Exemplo Completo

```typescript
// Hook (client/src/hooks/useAlgumaDados.ts)
export function useAlgumaDados() {
  return useQuery({
    queryKey: ['alguma-dados'],
    queryFn: async () => {
      // 1. Query com snake_case (como está no banco)
      const { data, error } = await supabase
        .from('alguma_tabela')
        .select('id, nome_completo, data_criacao, url_arquivo');
      
      if (error) throw error;
      
      // 2. Converter para camelCase
      return (data || []).map(item => ({
        id: item.id,
        nomeCompleto: item.nome_completo,     // ← Conversão
        dataCriacao: item.data_criacao,       // ← Conversão
        urlArquivo: item.url_arquivo          // ← Conversão
      }));
    }
  });
}

// Página (client/src/pages/AlgumaPagina.tsx)
export function AlgumaPagina() {
  const { data: dados = [] } = useAlgumaDados();
  
  return (
    <div>
      {dados.map(item => (
        <div key={item.id}>
          <h3>{item.nomeCompleto}</h3>        {/* ← camelCase */}
          <p>{item.dataCriacao}</p>           {/* ← camelCase */}
          <img src={item.urlArquivo} />       {/* ← camelCase */}
        </div>
      ))}
    </div>
  );
}
```

## Arquivos Modificados

- ✅ `client/src/pages/AgendaProfissional.tsx` - Corrigido acesso aos campos de horário
- ✅ `client/src/hooks/useTreinosVideo.ts` - Adicionada conversão snake_case → camelCase
- ✅ `client/src/hooks/usePlanosAlimentares.ts` - Adicionados logs detalhados

## Como Testar

### 1. Agenda Profissional
1. Acesse `/admin/agenda`
2. Navegue para 25-29 de novembro de 2025
3. Verifique se os horários aparecem nos cards (ex: "09:00")

### 2. Treinos Vídeo
1. Acesse `/admin/treinos-video`
2. Verifique se os 5 vídeos aparecem na lista
3. Verifique se as thumbnails carregam corretamente

### 3. Planos Alimentares
1. Acesse `/admin/planos-alimentares`
2. Abra o console do navegador (F12)
3. Verifique os logs:
   - `🔍 [usePlanosAlimentares] Iniciando busca...`
   - `📊 [usePlanosAlimentares] Resultado da query:`
   - `✅ [usePlanosAlimentares] Dados convertidos:`
4. Verifique se os 10 planos aparecem na lista

## Logs de Debug

Os logs seguem um padrão visual:
- 🔍 Início de operação
- 📊 Resultado de query
- ✅ Sucesso
- ❌ Erro
- ⚠️ Aviso

Exemplo de log esperado:
```
🔍 [useTreinosVideo] Buscando vídeos...
📊 [useTreinosVideo] Dados brutos: [{id: "...", url_video: "..."}]
✅ [useTreinosVideo] Dados convertidos: [{id: "...", urlVideo: "..."}]
```

## Status

✅ Agenda Profissional - Corrigido
✅ Treinos Vídeo - Corrigido
🔄 Planos Alimentares - Logs adicionados para diagnóstico
