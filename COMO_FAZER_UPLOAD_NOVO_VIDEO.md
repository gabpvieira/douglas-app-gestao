# 🎥 Como Fazer Upload de um NOVO Vídeo

## ⚠️ IMPORTANTE: Diferença entre EDITAR e NOVO UPLOAD

### ❌ O que você está fazendo (EDITAR):
1. Clica em um vídeo existente na lista
2. Clica em "Editar" (ícone de lápis)
3. Modifica os dados
4. Salva

**Resultado**: Apenas atualiza os dados (nome, descrição, etc), **NÃO faz upload de novo vídeo**

### ✅ O que você DEVE fazer (NOVO UPLOAD):
1. Clica no botão **"Novo Treino"** (botão verde no topo da página)
2. Preenche os dados
3. **Seleciona um arquivo de vídeo**
4. Salva

**Resultado**: Faz upload do vídeo para o Supabase Storage e cria novo registro

## 📋 Passo a Passo Correto

### 1. Clique em "Novo Treino"
- Botão verde no canto superior direito
- Ícone de "+" ao lado do texto
- **NÃO clique em editar um vídeo existente!**

### 2. Preencha a Aba "Dados"
- **Título**: Nome do treino (ex: "Treino de Peito Avançado")
- **Divisão Muscular**: Selecione uma opção
- **Nível**: Iniciante, Intermediário ou Avançado
- **Duração**: Tempo em minutos (ex: 45)
- **Descrição**: (opcional) Descrição do treino

### 3. Vá para a Aba "Vídeo"
- Clique na aba "Vídeo"
- Clique em "Escolher arquivo"
- **Selecione seu vídeo de 38MB**
- Aguarde o preview aparecer

### 4. (Opcional) Configure Alunos e Tags
- Aba "Alunos": Selecione quem terá acesso
- Aba "Tags": Adicione tags relevantes

### 5. Clique em "Criar Treino"
- Botão azul no final do modal
- **Aguarde o upload completar**
- Não feche o modal até ver a mensagem de sucesso

## 🔍 Logs Esperados no Console

Quando você fizer o upload CORRETO, verá:

```
🎬 PROCESSO DE SALVAMENTO DE TREINO
  📋 Dados recebidos: {...}
  🔍 Modo: NOVO UPLOAD  ← IMPORTANTE: Deve dizer "NOVO UPLOAD"
  
  📤 NOVO UPLOAD DE VÍDEO
    📹 Arquivo selecionado:
      - nome: "seu-video.mp4"
      - tamanho: "38.00 MB"
      - tipo: "video/mp4"
    
    📦 Dados do treino: {...}
    ⏳ Iniciando upload... (isso pode levar alguns segundos)
    
    🌐 REQUISIÇÃO HTTP - UPLOAD DE VÍDEO
      📦 FormData preparado: {...}
      🚀 Enviando requisição POST para /api/admin/treinos-video/upload...
      📡 Resposta recebida em X.XXs:
        - status: 201  ← IMPORTANTE: Deve ser 201 (Created)
        - statusText: "Created"
        - ok: true
      
      ✅ SUCESSO! Vídeo salvo: { id: "...", urlVideo: "..." }
    
    ✅ Upload concluído em X.XXs!
    🔄 Recarregando lista de treinos...
    ✅ Lista recarregada!
  
  🎉 Processo de upload concluído!
```

## 🚨 O que você estava vendo (EDIÇÃO):

```
🎬 PROCESSO DE SALVAMENTO DE TREINO
  🔍 Modo: EDIÇÃO  ← Isso significa que você está EDITANDO, não fazendo upload
  
  ✏️ EDITANDO TREINO EXISTENTE
    🆔 ID do treino: e7b9cd48-375a-4dd6-973e-feaa3b430838
    
    🌐 REQUISIÇÃO HTTP - ATUALIZAR VÍDEO
      🚀 Enviando requisição PUT...  ← PUT = edição, não upload
      📡 Resposta: 200 OK  ← 200 = atualização, não criação
```

## ✅ Checklist

Antes de clicar em "Criar Treino", verifique:

- [ ] Cliquei em "Novo Treino" (não em editar)
- [ ] Preenchi o Título
- [ ] Selecionei a Divisão Muscular
- [ ] Preenchi a Duração
- [ ] Fui na aba "Vídeo"
- [ ] Selecionei um arquivo de vídeo
- [ ] Vi o preview do vídeo
- [ ] Console do navegador está aberto (F12)
- [ ] Estou pronto para aguardar o upload

## 🎯 Teste Agora

1. **Limpe o console** (Ctrl+L)
2. **Clique em "Novo Treino"** (botão verde)
3. **Preencha os dados**
4. **Selecione o vídeo de 38MB**
5. **Clique em "Criar Treino"**
6. **Aguarde e observe os logs**

## 📊 Verificação de Sucesso

Após o upload, você deve ver:

- ✅ Logs mostrando "NOVO UPLOAD" (não "EDIÇÃO")
- ✅ Status 201 Created (não 200 OK)
- ✅ Novo vídeo aparece na lista
- ✅ Vídeo tem URL do Supabase (não URL fake)
- ✅ Notificação de sucesso

## 🔍 Verificar no Banco

Após o upload, execute no Supabase:

```sql
-- Ver o vídeo mais recente
SELECT * FROM treinos_video 
ORDER BY created_at DESC 
LIMIT 1;

-- Ver arquivos no storage
SELECT name, created_at 
FROM storage.objects 
WHERE bucket_id = 'treinos-video' 
ORDER BY created_at DESC 
LIMIT 1;
```

---

**Agora teste fazendo um NOVO UPLOAD e me mostre os logs!**
