/**
 * Gera thumbnail de um vídeo usando Canvas API
 * @param file Arquivo de vídeo
 * @param seekTo Tempo em segundos para capturar (padrão: 1)
 * @returns Promise com Blob da imagem
 */
export async function generateVideoThumbnail(
  file: File,
  seekTo: number = 1
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      reject(new Error('Não foi possível criar contexto do canvas'));
      return;
    }

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    video.onloadedmetadata = () => {
      // Definir tempo para captura
      video.currentTime = Math.min(seekTo, video.duration);
    };

    video.onseeked = () => {
      try {
        // Definir dimensões do canvas (HD)
        canvas.width = 1280;
        canvas.height = 720;

        // Calcular dimensões mantendo aspect ratio
        const videoAspect = video.videoWidth / video.videoHeight;
        const canvasAspect = canvas.width / canvas.height;

        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;

        if (videoAspect > canvasAspect) {
          // Vídeo mais largo que canvas
          drawHeight = canvas.width / videoAspect;
          offsetY = (canvas.height - drawHeight) / 2;
        } else {
          // Vídeo mais alto que canvas
          drawWidth = canvas.height * videoAspect;
          offsetX = (canvas.width - drawWidth) / 2;
        }

        // Preencher fundo preto
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Desenhar frame do vídeo
        context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

        // Converter para blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Falha ao gerar blob da imagem'));
            }
            
            // Limpar
            URL.revokeObjectURL(video.src);
          },
          'image/jpeg',
          0.85 // Qualidade 85%
        );
      } catch (error) {
        reject(error);
        URL.revokeObjectURL(video.src);
      }
    };

    video.onerror = () => {
      reject(new Error('Erro ao carregar vídeo'));
      URL.revokeObjectURL(video.src);
    };

    // Carregar vídeo
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Converte Blob para File
 */
export function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}
