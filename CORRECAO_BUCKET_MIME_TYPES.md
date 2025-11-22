# Correção: Bucket Supabase - MIME Types

## ❌ Problema

Erro ao fazer upload de thumbnails:

```
❌ Error uploading file to storage: StorageApiError: mime type image/jpeg is not supported
status: 400,
statusCode: '415'
```

## 🔍 Causa

O bucket `treinos-video` estava configurado para aceitar apenas vídeos:

```json
{
  "name": "treinos-video",
  "allowed_mime_types": [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo"
  ]
}
```

## ✅ Solução

Atualizar o bucket para aceitar também imagens (thumbnails):

```sql
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY[
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/mpeg',
  'video/webm',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
] 
WHERE name = 'treinos-video';
```

## 📊 Resultado

```json
{
  "name": "treinos-video",
  "allowed_mime_types": [
    "video/mp4",
    "video/quicktime",
    "video/x-msvideo",
    "video/mpeg",
    "video/webm",
    "image/jpeg",      // ✅ ADICIONADO
    "image/jpg",       // ✅ ADICIONADO
    "image/png",       // ✅ ADICIONADO
    "image/webp"       // ✅ ADICIONADO
  ]
}
```

## 🎯 Tipos MIME Permitidos

### Vídeos
- `video/mp4` - MP4
- `video/quicktime` - MOV
- `video/x-msvideo` - AVI
- `video/mpeg` - MPEG
- `video/webm` - WebM

### Imagens (Thumbnails)
- `image/jpeg` - JPEG
- `image/jpg` - JPG
- `image/png` - PNG
- `image/webp` - WebP

## 🧪 Testando

### 1. Upload de Novo Vídeo com Thumbnail

```bash
1. Selecionar vídeo MP4
2. Aguardar geração de thumbnail
3. Clicar em "Criar Treino"
4. Verificar logs do servidor:
   ✅ Upload vídeo: sucesso
   ✅ Upload thumbnail: sucesso
5. Card exibe thumbnail real ✅
```

### 2. Verificar no Supabase Storage

```bash
Acessar: Supabase Dashboard > Storage > treinos-video

Estrutura:
treinos-video/
├── video1.mp4
├── video2.mp4
└── thumbnails/
    ├── thumb1.jpg  ✅
    └── thumb2.jpg  ✅
```

## 📝 Notas

- Alteração feita diretamente no banco de dados
- Não requer restart do servidor
- Efeito imediato
- Bucket continua privado (requer signed URLs)

## ✅ Status

- ✅ Bucket configurado corretamente
- ✅ Aceita vídeos e imagens
- ✅ Upload de thumbnails funcionando
- ✅ Cards exibindo thumbnails reais
