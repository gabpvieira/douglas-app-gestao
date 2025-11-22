import ffmpeg from 'fluent-ffmpeg';
import { promises as fs } from 'fs';
import path from 'path';
import { uploadFileToStorage } from './storageHelper';

/**
 * Gera thumbnail de um vídeo usando FFmpeg
 * @param videoBuffer Buffer do arquivo de vídeo
 * @param videoFileName Nome do arquivo de vídeo
 * @returns Path da thumbnail no storage
 */
export async function generateThumbnail(
  videoBuffer: Buffer,
  videoFileName: string
): Promise<string> {
  const tempDir = path.join(process.cwd(), 'temp');
  const tempVideoPath = path.join(tempDir, `temp_${Date.now()}_${videoFileName}`);
  const thumbnailFileName = videoFileName.replace(/\.[^.]+$/, '.jpg');
  const tempThumbnailPath = path.join(tempDir, `thumb_${Date.now()}_${thumbnailFileName}`);

  try {
    // Criar diretório temp se não existir
    await fs.mkdir(tempDir, { recursive: true });

    // Salvar vídeo temporariamente
    console.log('💾 Salvando vídeo temporário:', tempVideoPath);
    await fs.writeFile(tempVideoPath, videoBuffer);

    // Gerar thumbnail
    console.log('🎬 Gerando thumbnail com FFmpeg...');
    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .screenshots({
          timestamps: ['00:00:01'], // Captura no segundo 1
          filename: path.basename(tempThumbnailPath),
          folder: tempDir,
          size: '1280x720' // HD
        })
        .on('end', () => {
          console.log('✅ Thumbnail gerada com sucesso');
          resolve();
        })
        .on('error', (err) => {
          console.error('❌ Erro ao gerar thumbnail:', err);
          reject(err);
        });
    });

    // Ler thumbnail gerada
    const thumbnailBuffer = await fs.readFile(tempThumbnailPath);

    // Upload da thumbnail para Supabase
    console.log('☁️  Fazendo upload da thumbnail...');
    const { path: thumbnailPath } = await uploadFileToStorage(
      'treinos-video',
      `thumbnails/${thumbnailFileName}`,
      thumbnailBuffer,
      'image/jpeg'
    );

    console.log('✅ Thumbnail salva:', thumbnailPath);

    // Limpar arquivos temporários
    await fs.unlink(tempVideoPath).catch(() => {});
    await fs.unlink(tempThumbnailPath).catch(() => {});

    return thumbnailPath;

  } catch (error) {
    console.error('❌ Erro ao gerar thumbnail:', error);
    
    // Limpar arquivos temporários em caso de erro
    await fs.unlink(tempVideoPath).catch(() => {});
    await fs.unlink(tempThumbnailPath).catch(() => {});
    
    throw error;
  }
}

/**
 * Gera URL pública da thumbnail
 */
export function getThumbnailUrl(thumbnailPath: string, supabaseUrl: string): string {
  return `${supabaseUrl}/storage/v1/object/public/treinos-video/${thumbnailPath}`;
}
