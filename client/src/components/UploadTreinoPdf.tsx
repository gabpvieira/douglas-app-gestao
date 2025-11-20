import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileUpload } from './FileUpload';
import { useUploadTreinoPdf } from '@/hooks/useTreinosPdf';

interface UploadTreinoPdfProps {
  alunoId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UploadTreinoPdf({ alunoId, open, onOpenChange }: UploadTreinoPdfProps) {
  const [file, setFile] = useState<File | null>(null);
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  
  const uploadTreino = useUploadTreinoPdf();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !nome) {
      return;
    }

    try {
      await uploadTreino.mutateAsync({
        file,
        alunoId,
        nome,
        descricao
      });
      
      // Limpar form e fechar
      setFile(null);
      setNome('');
      setDescricao('');
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    }
  };

  const handleClear = () => {
    setFile(null);
    setNome('');
    setDescricao('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload de Treino PDF</DialogTitle>
            <DialogDescription>
              Envie um arquivo PDF com o treino personalizado do aluno
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Treino *</Label>
              <Input
                id="nome"
                placeholder="Ex: Treino A - Peito e Tríceps"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição (opcional)</Label>
              <Textarea
                id="descricao"
                placeholder="Descrição do treino..."
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                rows={3}
              />
            </div>

            <FileUpload
              accept="application/pdf"
              maxSize={50}
              onFileSelect={setFile}
              onClear={() => setFile(null)}
              label="Arquivo PDF *"
              description="Máximo 50MB"
              disabled={uploadTreino.isPending}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleClear();
                onOpenChange(false);
              }}
              disabled={uploadTreino.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!file || !nome || uploadTreino.isPending}
            >
              {uploadTreino.isPending ? 'Enviando...' : 'Enviar Treino'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
