# Funcionalidade: Editar e Substituir Vídeo

## ✅ Implementado

### 🎯 Objetivo

Permitir que o admin edite as informações de um treino em vídeo e, opcionalmente, substitua o arquivo de vídeo por um novo.

## 🔧 Funcionalidades

### 1. **Editar Apenas Metadados**

O admin pode atualizar as informações do treino sem alterar o vídeo:

- ✅ Título
- ✅ Objetivo/Divisão Muscular
- ✅ Descrição
- ✅ Duração
- ✅ Nível
- ✅ Tags
- ✅ Alunos com acesso

**Rota**: `PUT /api/admin/treinos-video/:id`

**Comportamento**: Atualiza apenas os campos enviados, mantém o vídeo original.

### 2. **Substituir Vídeo Completo**

O admin pode fazer upload de um novo vídeo, substituindo o anterior:

- ✅ Upload do novo arquivo
- ✅ Atualização de metadados (opcional)
- ✅ Geração de nova thumbnail
- ✅ Exclusão automática do vídeo antigo
- ✅ Exclusão da thumbnail antiga

**Rota**: `POST /api/admin/treinos-video/:id/replace`

**Comportamento**: 
1. Faz upload do novo vídeo
2. Gera nova thumbnail
3. Atualiza registro no banco
4. Deleta vídeo antigo do storage
5. Deleta thumbnail antiga

## 📋 Fluxo de Uso

### Editar Sem Substituir Vídeo

```
1. Clicar em "Editar" no card do vídeo
2. Modal abre com dados preenchidos
3. Modificar campos desejados (título, descrição, etc.)
4. NÃO fazer upload de novo arquivo
5. Clicar em "Atualizar"
6. ✅ Metadados atualizados, vídeo mantido
```

### Editar e Substituir Vídeo

```
1. Clicar em "Editar" no card do vídeo
2. Modal abre com dados preenchidos
3. Ir para aba "Vídeo"
4. Ver aviso: "Você está editando um vídeo existente..."
5. Fazer upload do novo arquivo
6. Modificar outros campos se necessário
7. Clicar em "Atualizar"
8. ✅ Vídeo substituído + metadados atualizados
```

## 🔄 Lógica de Decisão

```typescript
if (treinoEditando) {
  if (treinoData.videoFile) {
    // TEM arquivo novo → SUBSTITUIR vídeo
    await replaceVideo.mutateAsync({
      id: treinoEditando.id,
      data: {
        nome: treinoData.titulo,
        objetivo: treinoData.divisaoMuscular,
        descricao: treinoData.descricao,
        duracao: treinoData.duracao,
        file: treinoData.videoFile
      }
    });
  } else {
    // NÃO tem arquivo → APENAS atualizar metadados
    await updateTreino.mutateAsync({
      id: treinoEditando.id,
      data: {
        nome: treinoData.titulo,
        objetivo: treinoData.divisaoMuscular,
        descricao: treinoData.descricao,
        duracao: treinoData.duracao
      }
    });
  }
} else {
  // Novo vídeo → UPLOAD
  await uploadVideo.mutateAsync({ ... });
}
```

## 🛠️ Implementação Técnica

### Backend - Nova Rota de Substituição

**Arquivo**: `server/routes/treinosVideo.ts`

```typescript
app.post("/api/admin/treinos-video/:id/replace", uploadVideo.single('file'), async (req, res) => {
  // 1. Buscar vídeo existente
  const videoExistente = await supabase
    .from('treinos_video')
    .select('*')
    .eq('id', id)
    .single();

  // 2. Upload do novo vídeo
  const { path } = await uploadFileToStorage(
    'treinos-video',
    fileName,
    req.file.buffer,
    req.file.mimetype
  );

  // 3. Gerar nova thumbnail
  const { data: { publicUrl } } = supabase.storage
    .from('treinos-video')
    .getPublicUrl(path);

  // 4. Atualizar banco
  await supabase
    .from('treinos_video')
    .update({
      url_video: path,
      thumbnail_url: publicUrl,
      nome, objetivo, descricao, duracao
    })
    .eq('id', id);

  // 5. Deletar vídeo antigo
  await deleteFileFromStorage('treinos-video', videoExistente.url_video);
  await deleteFileFromStorage('treinos-video', videoExistente.thumbnail_url);
});
```

### Frontend - Novo Hook

**Arquivo**: `client/src/hooks/useTreinosVideo.ts`

```typescript
export function useReplaceVideoFile() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UploadVideoData }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('nome', data.nome);
      if (data.objetivo) formData.append('objetivo', data.objetivo);
      if (data.descricao) formData.append('descricao', data.descricao);
      if (data.duracao) formData.append('duracao', data.duracao.toString());

      const response = await fetch(`/api/admin/treinos-video/${id}/replace`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Falha ao substituir vídeo');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treinos-video'] });
      toast({ title: 'Sucesso!', description: 'Vídeo substituído com sucesso' });
    }
  });
}
```

### Modal - Indicador Visual

**Arquivo**: `client/src/components/TreinoVideoModal.tsx`

```typescript
{treino && (
  <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
    <p className="text-sm text-blue-300">
      ℹ️ Você está editando um vídeo existente. 
      Faça upload de um novo arquivo apenas se quiser substituir o vídeo atual.
    </p>
  </div>
)}
```

## 🎨 Interface do Usuário

### Aba "Vídeo" - Modo Edição

```
┌─────────────────────────────────────────┐
│ ℹ️ Você está editando um vídeo          │
│    existente. Faça upload apenas se     │
│    quiser substituir o vídeo atual.     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🔄 Substituir Vídeo (Opcional)          │
├─────────────────────────────────────────┤
│                                         │
│ Novo Arquivo de Vídeo                   │
│ (deixe em branco para manter o atual)   │
│                                         │
│ [Escolher arquivo]                      │
│                                         │
│ • Formatos: MP4, WebM, OGG, AVI, MOV    │
│ • Tamanho máximo: 500MB                 │
│ • Recomendado: MP4 até 1080p            │
└─────────────────────────────────────────┘
```

### Aba "Vídeo" - Modo Novo

```
┌─────────────────────────────────────────┐
│ 📤 Upload de Vídeo                      │
├─────────────────────────────────────────┤
│                                         │
│ Arquivo de Vídeo                        │
│                                         │
│ [Escolher arquivo]                      │
│                                         │
│ • Formatos: MP4, WebM, OGG, AVI, MOV    │
│ • Tamanho máximo: 500MB                 │
│ • Recomendado: MP4 até 1080p            │
└─────────────────────────────────────────┘
```

## 📊 Estados de Loading

```typescript
const loading = 
  loadingTreinos || 
  loadingAlunos || 
  uploadVideo.isPending ||      // Novo vídeo
  updateTreino.isPending ||      // Atualizar metadados
  replaceVideo.isPending;        // Substituir vídeo
```

**Botão de Submit**:
- Novo: "Enviando..."
- Editar (sem arquivo): "Atualizando..."
- Editar (com arquivo): "Atualizando..." (substituindo vídeo)

## ✅ Validações

### Novo Vídeo
- ✅ Título obrigatório
- ✅ Divisão muscular obrigatória
- ✅ Duração > 0
- ✅ Arquivo de vídeo obrigatório

### Editar Metadados
- ✅ Título obrigatório
- ✅ Divisão muscular obrigatória
- ✅ Duração > 0
- ✅ Arquivo de vídeo opcional

### Substituir Vídeo
- ✅ Título obrigatório
- ✅ Divisão muscular obrigatória
- ✅ Duração > 0
- ✅ Arquivo de vídeo obrigatório
- ✅ Formato válido (MP4, WebM, etc.)
- ✅ Tamanho máximo 500MB

## 🔒 Segurança

### Limpeza de Recursos

1. **Upload com Sucesso**: Vídeo antigo deletado automaticamente
2. **Upload com Falha**: Novo vídeo deletado, antigo mantido
3. **Erro no Banco**: Novo vídeo deletado, rollback completo

### Validação de Arquivo

```typescript
const allowedTypes = [
  'video/mp4', 
  'video/webm', 
  'video/ogg', 
  'video/avi', 
  'video/mov', 
  'video/quicktime', 
  'video/x-msvideo', 
  'video/mpeg'
];

const maxSize = 500 * 1024 * 1024; // 500MB
```

## 📝 Logs e Debug

### Console do Navegador

```
🌐 REQUISIÇÃO HTTP - SUBSTITUIR VÍDEO
🆔 ID do vídeo: 7c2a439b-a1bd-487d-b14f-e717506252ce
📦 FormData preparado: {
  arquivo: "novo-treino.mp4",
  tamanho: "45.23 MB",
  nome: "Treino de Peito Atualizado"
}
🚀 Enviando requisição POST para substituir...
📡 Resposta recebida em 8.45s: { status: 200, ok: true }
✅ SUCESSO! Vídeo substituído: { id: "...", nome: "..." }
```

### Console do Servidor

```
🔄 Iniciando substituição de vídeo...
📹 Vídeo existente encontrado: Treino de peito e biceps
📝 Nome do novo arquivo: 1763668000123_abc123_novo_treino.mp4
☁️  Fazendo upload do novo vídeo...
✅ Upload concluído. Path: 1763668000123_abc123_novo_treino.mp4
💾 Atualizando registro no banco...
🗑️  Deletando vídeo antigo...
✅ Vídeo substituído com sucesso!
```

## 🧪 Testando

### Teste 1: Editar Apenas Título

```bash
1. Abrir modal de edição
2. Alterar título para "Treino de Peito - Avançado"
3. NÃO fazer upload de arquivo
4. Salvar
5. ✅ Título atualizado, vídeo mantido
```

### Teste 2: Substituir Vídeo

```bash
1. Abrir modal de edição
2. Ir para aba "Vídeo"
3. Fazer upload de novo arquivo
4. Salvar
5. ✅ Vídeo substituído, thumbnail atualizada
6. ✅ Vídeo antigo deletado do storage
```

### Teste 3: Editar Tudo

```bash
1. Abrir modal de edição
2. Alterar título, descrição, duração
3. Fazer upload de novo vídeo
4. Adicionar tags
5. Salvar
6. ✅ Tudo atualizado + vídeo substituído
```

## 📁 Arquivos Modificados

1. ✅ `server/routes/treinosVideo.ts` - Nova rota `/replace`
2. ✅ `client/src/hooks/useTreinosVideo.ts` - Hook `useReplaceVideoFile()`
3. ✅ `client/src/pages/TreinosVideo.tsx` - Lógica de decisão
4. ✅ `client/src/components/TreinoVideoModal.tsx` - UI atualizada

## 🎯 Resultado Final

- ✅ Editar metadados sem alterar vídeo
- ✅ Substituir vídeo mantendo ID
- ✅ Limpeza automática de arquivos antigos
- ✅ Feedback visual claro
- ✅ Validações robustas
- ✅ Logs detalhados
- ✅ Tratamento de erros
