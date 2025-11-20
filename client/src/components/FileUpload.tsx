import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, X, FileText, Video, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  accept: string;
  maxSize?: number; // em MB
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  accept,
  maxSize = 50,
  onFileSelect,
  onClear,
  label,
  description,
  disabled = false,
  className
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-8 h-8" />;
    if (type.includes('video')) return <Video className="w-8 h-8" />;
    if (type.includes('image')) return <ImageIcon className="w-8 h-8" />;
    return <FileText className="w-8 h-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    // Validar tamanho
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Arquivo muito grande. Máximo: ${maxSize}MB`;
    }

    // Validar tipo
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileType = file.type;
    const fileExtension = '.' + file.name.split('.').pop();

    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type;
      }
      if (type.endsWith('/*')) {
        const baseType = type.split('/')[0];
        return fileType.startsWith(baseType);
      }
      return fileType === type;
    });

    if (!isValidType) {
      return 'Tipo de arquivo não permitido';
    }

    return null;
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setError(null);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onClear?.();
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && <Label>{label}</Label>}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-6 transition-colors',
          dragActive && 'border-primary bg-primary/5',
          error && 'border-destructive',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-primary'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          disabled={disabled}
          className="hidden"
        />

        {!selectedFile ? (
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="w-10 h-10 text-muted-foreground mb-2" />
            <p className="text-sm font-medium">
              Clique para selecionar ou arraste o arquivo aqui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Máximo: {maxSize}MB
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-primary">
                {getFileIcon(selectedFile.type)}
              </div>
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              disabled={disabled}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

// Componente de Upload com Preview de Imagem
interface ImageUploadProps extends Omit<FileUploadProps, 'accept'> {
  previewUrl?: string;
}

export function ImageUpload({ previewUrl, ...props }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);

  const handleFileSelect = (file: File) => {
    // Criar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    props.onFileSelect(file);
  };

  const handleClear = () => {
    setPreview(null);
    props.onClear?.();
  };

  return (
    <div className="space-y-4">
      {preview && (
        <div className="relative w-32 h-32 rounded-lg overflow-hidden border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-1 right-1"
            onClick={handleClear}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}
      <FileUpload
        {...props}
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onFileSelect={handleFileSelect}
        onClear={handleClear}
      />
    </div>
  );
}
