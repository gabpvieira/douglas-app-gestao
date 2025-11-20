# Teste de Upload de Vídeos

## Passo a Passo para Testar

### 1. Verificar o Servidor
```bash
npm run dev
```

O servidor deve iniciar na porta 5000.

### 2. Acessar a Aplicação
Abra o navegador em: `http://localhost:5000`

### 3. Fazer Login como Admin
Use as credenciais de administrador.

### 4. Navegar para Treinos Vídeo
No menu lateral, clique em "Treinos Vídeo".

### 5. Criar Novo Treino
1. Clique no botão "Novo Treino"
2. Preencha os dados na aba "Dados":
   - **Título**: "Teste de Upload"
   - **Divisão Muscular**: Selecione qualquer opção (ex: "Peito")
   - **Nível**: Selecione qualquer opção (ex: "Iniciante")
   - **Duração**: Digite um número (ex: 30)
   - **Descrição**: (opcional) "Teste de upload de vídeo"

3. Vá para a aba "Vídeo":
   - Clique em "Escolher arquivo"
   - Selecione um arquivo de vídeo MP4, MOV ou AVI
   - Aguarde o preview aparecer

4. (Opcional) Configure alunos e tags nas outras abas

5. Clique em "Criar Treino"

### 6. Verificar os Logs

#### No Console do Navegador (F12)
Você deve ver:
```
💾 Salvando treino...
📤 Fazendo upload de novo vídeo: { nome: "Teste de Upload", tamanho: 12345678, tipo: "video/mp4" }
✅ Upload concluído com sucesso!
```

#### No Terminal do Servidor
Você deve ver:
```
📹 Iniciando upload de vídeo...
File: video.mp4 (12345678 bytes)
Body: { nome: 'Teste de Upload', objetivo: 'Peito', ... }
📝 Nome do arquivo gerado: 1732067890_abc123_video.mp4
☁️  Fazendo upload para Supabase Storage...
📤 Uploading to bucket: treinos-video, path: 1732067890_abc123_video.mp4, size: 12345678 bytes, type: video/mp4
✅ File uploaded successfully: 1732067890_abc123_video.mp4
💾 Salvando no banco de dados...
✅ Vídeo salvo com sucesso: uuid-do-video
```

### 7. Verificar o Resultado
- O modal deve fechar
- O novo vídeo deve aparecer na lista de treinos
- Você deve ver uma notificação de sucesso

## Troubleshooting

### Erro: "Nenhum arquivo enviado"
- Certifique-se de que selecionou um arquivo de vídeo
- Verifique se o arquivo não está corrompido

### Erro: "Falha ao fazer upload"
- Verifique se o arquivo é menor que 500 MB
- Verifique se o formato é MP4, MOV ou AVI
- Verifique os logs do servidor para mais detalhes

### Erro: "nome é obrigatório"
- Preencha o campo "Título" na aba "Dados"

### Erro: "Divisão muscular é obrigatória"
- Selecione uma opção no campo "Divisão Muscular"

### Erro: "Duração deve ser maior que zero"
- Digite um número maior que 0 no campo "Duração"

## Verificação no Supabase

Você pode verificar se o vídeo foi salvo corretamente:

### No Banco de Dados
```sql
SELECT * FROM treinos_video ORDER BY data_upload DESC LIMIT 1;
```

### No Storage
```sql
SELECT * FROM storage.objects WHERE bucket_id = 'treinos-video' ORDER BY created_at DESC LIMIT 1;
```

## Status Esperado
✅ Upload funcionando
✅ Vídeo salvo no storage
✅ Registro criado no banco
✅ Vídeo aparece na lista
✅ Logs detalhados disponíveis
