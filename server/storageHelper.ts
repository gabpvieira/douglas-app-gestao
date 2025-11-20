import { supabase } from './supabase';

/**
 * Upload de arquivo para o Supabase Storage
 */
export async function uploadFileToStorage(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<{ path: string; publicUrl?: string }> {
  console.log(`📤 Uploading to bucket: ${bucket}, path: ${path}, size: ${file.length} bytes, type: ${contentType}`);
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: false
    });

  if (error) {
    console.error('❌ Error uploading file to storage:', error);
    throw new Error(`Falha ao fazer upload: ${error.message}`);
  }

  console.log('✅ File uploaded successfully:', data.path);

  // Se o bucket for público, retornar URL pública
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: bucket === 'fotos-perfil' ? publicUrl : undefined
  };
}

/**
 * Gerar URL assinada para arquivo privado
 */
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600 // 1 hora por padrão
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    console.error('Error creating signed URL:', error);
    throw new Error(`Falha ao gerar URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Deletar arquivo do Storage
 */
export async function deleteFileFromStorage(
  bucket: string,
  path: string
): Promise<boolean> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    console.error('Error deleting file:', error);
    return false;
  }

  return true;
}

/**
 * Listar arquivos de um bucket
 */
export async function listFiles(
  bucket: string,
  path: string = ''
): Promise<any[]> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path);

  if (error) {
    console.error('Error listing files:', error);
    return [];
  }

  return data;
}

/**
 * Gerar nome único para arquivo
 */
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(`.${extension}`, '').replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${timestamp}_${random}_${nameWithoutExt}.${extension}`;
}
