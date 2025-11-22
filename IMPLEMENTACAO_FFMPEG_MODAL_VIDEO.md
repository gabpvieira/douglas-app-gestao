# Implementação: FFmpeg + Modal de Visualização de Vídeo

## ✅ Implementado

### 🎯 Funcionalidades

1. **Geração Automática de Thumbnails com FFmpeg**
2. **Modal Profissional de Visualização de Vídeo**
3. **Player de Vídeo Customizado**
4. **Integração Completa com Supabase**

---

## 🎬 Geração de Thumbnails com FFmpeg

### Instalação

```bash
npm install fluent-ffmpeg @types/fluent-ffmpeg
```

### Arquivo: `server/thumbnailGenerator.ts`

Função que gera thumbnail do primeiro segundo do vídeo:

```typescript
export async function generateThumbnail(
  videoBuffer: Buffer,
  videoFileName: string
): Promise<string> {
  // 1. Salva vídeo temporariamente
  // 2. Usa FFmpeg para capturar frame no segundo 1
  // 3. Gera imagem 1280x720 (HD)
  // 4. Faz upload para Supabase Storage
  // 5. Limpa arquivos temporários
  // 6. Retorna path da thumbnail
}
```

### Características

- ✅ Captura no segundo 1 do vídeo
- ✅ Resolução HD (1280x720)
- ✅ Formato JPEG otimizado
- ✅ Upload automático para Supabase
- ✅ Limpeza de arquivos temporários
- ✅ Fallback em caso de erro

### Integração nas Rotas

#### Upload de Novo Vídeo

```typescript
// Gerar thumbnail com FFmpeg
let thumbnailUrl: string;
try {
  console.log('🎬 Gerando thumbnail com FFmpeg...');
  const thumbnailPath = await generateThumbnail(req.file.buffer, fileName);
  thumbnailUrl = getThumbnailUrl(thumbnailPath, process.env.VITE_SUPABASE_URL!);
  console.log('✅ Thumbnail gerada:', thumbnailUrl);
} catch (error) {
  console.warn('⚠️  Erro ao gerar thumbnail, usando fallback:', error);
  // Fallback: usar URL do vídeo
  const { data: { publicUrl } } = supabase.storage
    .from('treinos-video')
    .getPublicUrl(path);
  thumbnailUrl = publicUrl;
}
```

#### Substituir Vídeo

Mesma lógica aplicada na rota `/replace` - gera nova thumbnail automaticamente.

---

## 🎥 Modal de Visualização de Vídeo

### Arquivo: `client/src/components/VideoPlayerModal.tsx`

Modal completo e profissional para assistir vídeos.

### Características

#### 1. **Player Customizado**

- ✅ Controles personalizados
- ✅ Play/Pause
- ✅ Mute/Unmute
- ✅ Barra de progresso interativa
- ✅ Fullscreen
- ✅ Indicador de tempo (atual / total)

#### 2. **Design Profissional**

- ✅ Fundo escuro (gray-950)
- ✅ Controles com gradiente
- ✅ Animações suaves
- ✅ Responsivo
- ✅ Ícones Lucide

#### 3. **Informações do Vídeo**

- ✅ Título
- ✅ Objetivo/Divisão Muscular
- ✅ Duração
- ✅ Data de upload
- ✅ Descrição completa

#### 4. **Estados de Loading**

- ✅ Spinner animado durante carregamento
- ✅ Mensagem de erro amigável
- ✅ Feedback visual claro

### Interface

```
┌─────────────────────────────────────────────────────┐
│ Treino de Peito - Iniciante              [X]       │
│ 🎯 Peito  ⏱️ 45 min  📅 20/11/2024                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│                  [VIDEO PLAYER]                     │
│                                                     │
│  ▶️  🔊  0:45 / 45:00                    ⛶         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Descrição                                           │
│ Treino completo de peito focado em hipertrofia...  │
└─────────────────────────────────────────────────────┘
```

### Controles

```typescript
// Play/Pause
<Button onClick={handlePlayPause}>
  {isPlaying ? <Pause /> : <Play />}
</Button>

// Mute/Unmute
<Button onClick={handleMuteToggle}>
  {isMuted ? <VolumeX /> : <Volume2 />}
</Button>

// Fullscreen
<Button onClick={handleFullscreen}>
  <Maximize />
</Button>

// Progress Bar
<input
  type="range"
  min="0"
  max={duration}
  value={currentTime}
  onChange={handleSeek}
/>
```

---

## 🎯 Integração nos Cards

### Botão "Ver Vídeo"

#### 1. **Overlay com Play**

Ao passar o mouse sobre o card, aparece overlay com botão play:

```typescript
<div 
  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100"
  onClick={() => onVerVideo(treino)}
>
  <div className="w-14 h-14 rounded-full bg-white/90">
    <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
  </div>
</div>
```

#### 2. **Menu Dropdown**

Opção "Ver Vídeo" no menu de ações:

```typescript
<DropdownMenuItem onClick={() => onVerVideo(treino)}>
  <Play className="h-4 w-4 mr-2" />
  Ver Vídeo
</DropdownMenuItem>
```

### Fluxo de Visualização

```
1. Usuário clica no overlay ou menu "Ver Vídeo"
2. handleVerVideo(treino) é chamado
3. treinoVisualizando é setado
4. Modal abre (isPlayerOpen = true)
5. Hook useStreamTreinoVideo busca URL assinada
6. Vídeo carrega e está pronto para assistir
```

---

## 🔄 Hook de Streaming

### `useStreamTreinoVideo(id)`

Busca URL assinada do vídeo (válida por 2 horas):

```typescript
export function useStreamTreinoVideo(id: string) {
  return useQuery<{ 
    id: string; 
    nome: string; 
    streamUrl: string; 
    duracao: number; 
    expiresIn: number 
  }>({
    queryKey: ['treino-video-stream', id],
    queryFn: async () => {
      const response = await fetch(`/api/treinos-video/${id}/stream`);
      if (!response.ok) throw new Error('Falha ao gerar URL de streaming');
      return response.json();
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 60 // 1 hora
  });
}
```

### Rota Backend

```typescript
app.get("/api/treinos-video/:id/stream", async (req, res) => {
  const { id } = req.params;
  
  const { data: video } = await supabase
    .from('treinos_video')
    .select('*')
    .eq('id', id)
    .single();

  // Gerar URL assinada válida por 2 horas
  const streamUrl = await getSignedUrl('treinos-video', video.url_video, 7200);

  res.json({
    id: video.id,
    nome: video.nome,
    streamUrl,
    duracao: video.duracao,
    expiresIn: 7200
  });
});
```

---

## 📁 Estrutura de Arquivos

### Backend

```
server/
├── thumbnailGenerator.ts      # ✅ NOVO - Geração de thumbnails
├── routes/
│   └── treinosVideo.ts        # ✅ ATUALIZADO - FFmpeg integrado
├── storageHelper.ts
└── upload.ts
```

### Frontend

```
client/src/
├── components/
│   ├── VideoPlayerModal.tsx   # ✅ NOVO - Modal de visualização
│   ├── TreinoVideosList.tsx   # ✅ ATUALIZADO - Botão "Ver"
│   └── TreinoVideoModal.tsx
├── pages/
│   └── TreinosVideo.tsx       # ✅ ATUALIZADO - Integração modal
└── hooks/
    └── useTreinosVideo.ts     # ✅ Hook de streaming
```

---

## 🎨 Estilos e Animações

### Progress Bar Customizada

```css
background: linear-gradient(
  to right, 
  #3b82f6 0%, 
  #3b82f6 ${(currentTime / duration) * 100}%, 
  #374151 ${(currentTime / duration) * 100}%, 
  #374151 100%
)
```

### Transições

- Overlay: `opacity-0 → opacity-100` (300ms)
- Botão Play: `scale-100 → scale-110` no hover
- Thumbnail: `scale-100 → scale-105` no hover

---

## 🧪 Testando

### 1. Upload com Thumbnail

```bash
1. Fazer upload de novo vídeo
2. Verificar logs do servidor:
   🎬 Gerando thumbnail com FFmpeg...
   ✅ Thumbnail gerada: thumbnails/...jpg
3. Ver card com thumbnail real
```

### 2. Visualizar Vídeo

```bash
1. Clicar no overlay do card (ou menu "Ver Vídeo")
2. Modal abre com loading
3. Vídeo carrega
4. Testar controles:
   - Play/Pause
   - Mute/Unmute
   - Seek (arrastar barra)
   - Fullscreen
```

### 3. Substituir Vídeo

```bash
1. Editar vídeo existente
2. Fazer upload de novo arquivo
3. Salvar
4. Verificar nova thumbnail gerada
5. Ver vídeo para confirmar substituição
```

---

## 🔧 Configuração FFmpeg

### Windows

```bash
# Instalar via Chocolatey
choco install ffmpeg

# Ou baixar de: https://ffmpeg.org/download.html
# Adicionar ao PATH
```

### Linux

```bash
sudo apt-get install ffmpeg
```

### Mac

```bash
brew install ffmpeg
```

### Verificar Instalação

```bash
ffmpeg -version
```

---

## 📊 Fluxo Completo

### Upload de Vídeo

```
1. Usuário seleciona arquivo MP4
2. Frontend envia para /api/admin/treinos-video/upload
3. Backend:
   a. Salva vídeo no Supabase Storage
   b. Gera thumbnail com FFmpeg
   c. Salva thumbnail no Storage
   d. Insere registro no banco com ambas URLs
4. Frontend atualiza lista com novo card
5. Card exibe thumbnail real
```

### Visualização de Vídeo

```
1. Usuário clica em "Ver Vídeo"
2. Modal abre
3. Hook busca URL assinada (/api/treinos-video/:id/stream)
4. Backend gera URL válida por 2h
5. Player carrega vídeo
6. Usuário assiste com controles customizados
```

---

## ✅ Checklist de Funcionalidades

### Thumbnails
- ✅ Geração automática com FFmpeg
- ✅ Captura no segundo 1
- ✅ Resolução HD (1280x720)
- ✅ Upload para Supabase
- ✅ Fallback em caso de erro
- ✅ Limpeza de arquivos temporários

### Modal de Vídeo
- ✅ Player customizado
- ✅ Controles (play, pause, mute, fullscreen)
- ✅ Barra de progresso interativa
- ✅ Indicador de tempo
- ✅ Loading state
- ✅ Error state
- ✅ Informações do vídeo
- ✅ Descrição completa
- ✅ Design responsivo

### Integração
- ✅ Botão "Ver Vídeo" no card
- ✅ Overlay com play no hover
- ✅ Menu dropdown com opção
- ✅ URL assinada do Supabase
- ✅ Expiração de 2 horas
- ✅ Cache de 1 hora

---

## 🚀 Melhorias Futuras

### Thumbnails Avançadas
- [ ] Múltiplas thumbnails (preview ao passar mouse)
- [ ] Seleção manual do frame
- [ ] Geração de GIF animado
- [ ] Thumbnails em diferentes resoluções

### Player Avançado
- [ ] Controle de velocidade (0.5x, 1x, 1.5x, 2x)
- [ ] Legendas/Closed Captions
- [ ] Picture-in-Picture
- [ ] Atalhos de teclado (espaço, setas)
- [ ] Qualidade adaptativa
- [ ] Marcadores de tempo
- [ ] Comentários com timestamp

### Analytics
- [ ] Rastrear visualizações
- [ ] Tempo assistido
- [ ] Taxa de conclusão
- [ ] Vídeos mais populares
- [ ] Relatórios de engajamento

---

## 📝 Notas Importantes

### FFmpeg
- Requer instalação no servidor
- Processo pode ser lento para vídeos grandes
- Considerar processamento assíncrono para produção
- Fallback garante funcionamento mesmo sem FFmpeg

### URLs Assinadas
- Válidas por 2 horas
- Renovadas automaticamente pelo hook
- Cache de 1 hora para performance
- Seguras e privadas

### Performance
- Thumbnails em HD (1280x720)
- Vídeos servidos via Supabase CDN
- Loading states para UX suave
- Limpeza automática de arquivos temp

---

## 🎯 Resultado Final

Sistema completo de vídeos com:
- ✅ Thumbnails reais geradas automaticamente
- ✅ Modal profissional de visualização
- ✅ Player customizado e responsivo
- ✅ Integração perfeita com Supabase
- ✅ UX moderna e intuitiva
- ✅ Performance otimizada
