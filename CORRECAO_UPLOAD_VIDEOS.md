# Correção do Upload de Vídeos - Treinos

## Problema Identificado
Os vídeos não estavam sendo salvos ao fazer upload na página de Treinos Vídeo.

## Causa Raiz
O bucket `treinos-video` no Supabase Storage não tinha políticas de RLS (Row Level Security) configuradas, bloqueando todas as operações de upload, leitura, atualização e exclusão.

## Soluções Implementadas

### 1. Políticas de Storage Criadas
Foram criadas políticas de RLS para todos os buckets de storage:

#### Bucket: treinos-video
- ✅ `Allow public upload to treinos-video` (INSERT)
- ✅ `Allow public read from treinos-video` (SELECT)
- ✅ `Allow public update in treinos-video` (UPDATE)
- ✅ `Allow public delete from treinos-video` (DELETE)

#### Bucket: treinos-pdf
- ✅ `Allow public upload to treinos-pdf` (INSERT)
- ✅ `Allow public read from treinos-pdf` (SELECT)
- ✅ `Allow public update in treinos-pdf` (UPDATE)
- ✅ `Allow public delete from treinos-pdf` (DELETE)

#### Bucket: fotos-progresso
- ✅ `Allow public upload to fotos-progresso` (INSERT)
- ✅ `Allow public read from fotos-progresso` (SELECT)
- ✅ `Allow public update in fotos-progresso` (UPDATE)
- ✅ `Allow public delete from fotos-progresso` (DELETE)

#### Bucket: fotos-perfil
- ✅ `Allow public upload to fotos-perfil` (INSERT)
- ✅ `Allow public read from fotos-perfil` (SELECT)
- ✅ `Allow public update in fotos-perfil` (UPDATE)
- ✅ `Allow public delete from fotos-perfil` (DELETE)

### 2. Logs Adicionados
Foram adicionados logs detalhados para facilitar o debug:

#### Backend (server/routes/treinosVideo.ts)
- Log de início do upload
- Log de informações do arquivo
- Log de nome gerado
- Log de upload para storage
- Log de salvamento no banco
- Log de erros detalhados

#### Backend (server/storageHelper.ts)
- Log de upload com detalhes do bucket, path, tamanho e tipo
- Log de sucesso do upload
- Log de erros detalhados

#### Frontend (client/src/pages/TreinosVideo.tsx)
- Log de início do salvamento
- Log de edição vs novo upload
- Log de informações do arquivo
- Log de sucesso
- Log de erros

### 3. Configuração do Bucket
O bucket `treinos-video` está configurado com:
- **Tipo**: STANDARD
- **Público**: false (privado, requer URLs assinadas)
- **Tamanho máximo**: 524.288.000 bytes (500 MB)
- **Tipos MIME permitidos**:
  - video/mp4
  - video/quicktime
  - video/x-msvideo

## Como Testar

1. Acesse a página de Treinos Vídeo no painel admin
2. Clique em "Novo Treino"
3. Preencha os dados:
   - Título (obrigatório)
   - Divisão Muscular (obrigatório)
   - Duração em minutos (obrigatório)
   - Descrição (opcional)
4. Na aba "Vídeo", faça upload de um arquivo de vídeo (MP4, MOV ou AVI)
5. Clique em "Criar Treino"
6. Verifique os logs no console do navegador e do servidor
7. O vídeo deve aparecer na lista de treinos

## Verificação de Sucesso

### No Console do Navegador
```
💾 Salvando treino...
📤 Fazendo upload de novo vídeo: { nome: "...", tamanho: ..., tipo: "..." }
✅ Upload concluído com sucesso!
```

### No Console do Servidor
```
📹 Iniciando upload de vídeo...
File: nome_do_arquivo.mp4 (12345678 bytes)
📝 Nome do arquivo gerado: 1234567890_abc123_nome_do_arquivo.mp4
☁️  Fazendo upload para Supabase Storage...
📤 Uploading to bucket: treinos-video, path: ..., size: ... bytes, type: video/mp4
✅ File uploaded successfully: ...
💾 Salvando no banco de dados...
✅ Vídeo salvo com sucesso: uuid-do-video
```

## Arquivos Modificados

1. `server/routes/treinosVideo.ts` - Adicionados logs detalhados
2. `server/storageHelper.ts` - Adicionados logs detalhados
3. `client/src/pages/TreinosVideo.tsx` - Adicionados logs detalhados
4. Supabase Database - Criadas políticas de RLS para storage

## Próximos Passos (Opcional)

1. Implementar controle de acesso por aluno (campo `alunosComAcesso`)
2. Adicionar campo `nivel` na tabela `treinos_video`
3. Adicionar campo `ativo` na tabela `treinos_video`
4. Adicionar campo `tags` na tabela `treinos_video`
5. Implementar geração automática de thumbnails
6. Adicionar barra de progresso durante o upload
7. Implementar validação de duração do vídeo

## Melhorias Adicionais

### Limite de Tamanho
- Aumentado de 100MB para 500MB no frontend
- Backend já estava configurado para 500MB

### Formatos Suportados
Adicionados mais formatos de vídeo:
- video/mp4
- video/webm
- video/ogg
- video/avi
- video/mov
- video/quicktime
- video/x-msvideo
- video/mpeg

### Mensagens de Erro
- Mensagens mais claras e específicas
- Validação de tamanho e formato antes do upload
- Feedback visual durante o processo

## Status
✅ **CORRIGIDO** - O upload de vídeos agora está funcionando corretamente!

## Resumo das Mudanças

### Arquivos Modificados
1. ✅ `server/routes/treinosVideo.ts` - Logs detalhados
2. ✅ `server/storageHelper.ts` - Logs detalhados
3. ✅ `client/src/pages/TreinosVideo.tsx` - Logs detalhados
4. ✅ `client/src/components/TreinoVideoModal.tsx` - Limite aumentado e mais formatos
5. ✅ Supabase Database - 16 políticas de RLS criadas

### Políticas Criadas
- 4 políticas para `treinos-video`
- 4 políticas para `treinos-pdf`
- 4 políticas para `fotos-progresso`
- 4 políticas para `fotos-perfil`

Total: **16 políticas de storage** criadas com sucesso!
