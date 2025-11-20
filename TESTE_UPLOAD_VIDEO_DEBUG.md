# 🔍 Teste de Upload de Vídeo - Debug

## ✅ Correções Aplicadas

### 1. Limite de Body no Express
- Aumentado para 500MB em `server/index.ts`
- Antes: sem limite definido
- Agora: `{ limit: '500mb' }`

### 2. Logs Detalhados Adicionados

#### Frontend (client/src/hooks/useTreinosVideo.ts)
- ✅ Log antes da requisição
- ✅ Log da resposta (status e statusText)
- ✅ Log de erro detalhado
- ✅ Log de sucesso com resultado

#### Backend (server/routes/treinosVideo.ts)
- ✅ Log de início do upload
- ✅ Log de informações do arquivo
- ✅ Log de nome gerado
- ✅ Log de upload para storage
- ✅ Log de salvamento no banco
- ✅ Log de erro com stack trace

### 3. Indicador de Loading
- ✅ Botão mostra "Enviando vídeo..." durante upload
- ✅ Botão desabilitado durante processo
- ✅ Animação de loading (⏳)

### 4. Tratamento de Erros Melhorado
- ✅ Captura de erros detalhados
- ✅ Stack trace em desenvolvimento
- ✅ Mensagens claras para o usuário

## 📋 Como Testar Agora

### 1. Abra o Console do Navegador
Pressione `F12` e vá para a aba "Console"

### 2. Acesse a Página de Treinos Vídeo
- URL: http://localhost:5000
- Login como admin
- Menu: "Treinos Vídeo"

### 3. Faça o Upload
1. Clique em "Novo Treino"
2. Preencha:
   - **Título**: "Teste Upload 38MB"
   - **Divisão Muscular**: Qualquer opção
   - **Duração**: 30
3. Aba "Vídeo": Selecione seu arquivo de 38MB
4. Clique em "Criar Treino"

### 4. Observe os Logs

#### No Console do Navegador (F12)
Você deve ver algo como:
```
💾 Salvando treino... { titulo: "Teste Upload 38MB", ... }
📤 Fazendo upload de novo vídeo: { nome: "...", tamanho: 39845888, tipo: "video/mp4" }
🚀 Iniciando requisição de upload...
📡 Resposta recebida: 201 Created
✅ Upload bem-sucedido: { id: "...", nome: "...", ... }
✅ Upload concluído com sucesso! { id: "...", ... }
```

#### No Terminal do Servidor
Você deve ver algo como:
```
📹 Iniciando upload de vídeo...
File: video.mp4 (39845888 bytes)
Body: { nome: 'Teste Upload 38MB', objetivo: 'Peito', duracao: '30' }
📝 Nome do arquivo gerado: 1732067890_abc123_video.mp4
☁️  Fazendo upload para Supabase Storage...
📤 Uploading to bucket: treinos-video, path: ..., size: 39845888 bytes, type: video/mp4
✅ File uploaded successfully: 1732067890_abc123_video.mp4
💾 Salvando no banco de dados...
✅ Vídeo salvo com sucesso: uuid-do-video
POST /api/admin/treinos-video/upload 201 in XXXXms
```

## 🚨 Se Houver Erro

### Erro no Console do Navegador
Copie a mensagem completa que aparece em vermelho, incluindo:
- A mensagem de erro
- O stack trace (se houver)
- Qualquer log que apareça antes do erro

### Erro no Terminal do Servidor
Copie a mensagem completa que aparece com ❌, incluindo:
- A mensagem de erro
- O stack trace
- Todos os logs que aparecem antes do erro

## 🔍 Verificações Adicionais

### 1. Verificar se o vídeo foi salvo no banco
Após o upload, execute no Supabase:
```sql
SELECT * FROM treinos_video ORDER BY created_at DESC LIMIT 1;
```

### 2. Verificar se o arquivo foi salvo no storage
```sql
SELECT name, created_at FROM storage.objects 
WHERE bucket_id = 'treinos-video' 
ORDER BY created_at DESC LIMIT 1;
```

### 3. Verificar se aparece na lista
- A página deve recarregar automaticamente
- O novo vídeo deve aparecer na lista
- Deve mostrar uma notificação de sucesso

## 📊 Informações Úteis

### Configurações Atuais
- **Limite de upload**: 500MB (frontend e backend)
- **Formatos aceitos**: MP4, MOV, AVI, MPEG, WebM, OGG
- **Bucket**: treinos-video (privado)
- **Políticas**: 4 políticas de RLS ativas

### Servidor
- **Status**: ✅ Rodando na porta 5000
- **Conexão Supabase**: ✅ Conectado
- **Logs**: ✅ Ativados

## 💡 Dicas

1. **Aguarde o upload completar**: Vídeos de 38MB podem levar alguns segundos
2. **Não feche o modal**: Aguarde até ver a mensagem de sucesso
3. **Verifique sua conexão**: Upload pode ser lento em conexões lentas
4. **Tamanho do arquivo**: Confirme que o arquivo tem exatamente 38MB

## 🎯 Resultado Esperado

✅ Upload completa em 5-30 segundos (dependendo da conexão)
✅ Modal fecha automaticamente
✅ Vídeo aparece na lista
✅ Notificação de sucesso exibida
✅ Registro criado no banco de dados
✅ Arquivo salvo no Supabase Storage

---

**Servidor rodando**: ✅ Porta 5000
**Pronto para testar**: ✅ Sim
