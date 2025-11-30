import { useState, useRef } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCriarAvaliacaoPostural, uploadFotoPostural } from '@/hooks/useAvaliacoesPosturais';
import { useToast } from '@/hooks/use-toast';

interface AvaliacaoPosturalModalProps {
  isOpen: boolean;
  onClose: () => void;
  avaliacaoId: string;
  alunoId: string;
  dataAvaliacao: string;
}

export function AvaliacaoPosturalModal({
  isOpen,
  onClose,
  avaliacaoId,
  alunoId,
  dataAvaliacao,
}: AvaliacaoPosturalModalProps) {
  const { toast } = useToast();
  const criarAvaliacaoPostural = useCriarAvaliacaoPostural();

  const [observacoes, setObservacoes] = useState('');
  const [fotoFrente, setFotoFrente] = useState<File | null>(null);
  const [fotoCostas, setFotoCostas] = useState<File | null>(null);
  const [fotoLateralDir, setFotoLateralDir] = useState<File | null>(null);
  const [fotoLateralEsq, setFotoLateralEsq] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const frenteInputRef = useRef<HTMLInputElement>(null);
  const costasInputRef = useRef<HTMLInputElement>(null);
  const lateralDirInputRef = useRef<HTMLInputElement>(null);
  const lateralEsqInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione apenas arquivos de imagem',
          variant: 'destructive',
        });
        return;
      }
      setter(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let fotoFrenteUrl, fotoCostasUrl, fotoLateralDirUrl, fotoLateralEsqUrl;

      if (fotoFrente) {
        fotoFrenteUrl = await uploadFotoPostural(fotoFrente, alunoId, 'frente');
      }
      if (fotoCostas) {
        fotoCostasUrl = await uploadFotoPostural(fotoCostas, alunoId, 'costas');
      }
      if (fotoLateralDir) {
        fotoLateralDirUrl = await uploadFotoPostural(fotoLateralDir, alunoId, 'lateral_dir');
      }
      if (fotoLateralEsq) {
        fotoLateralEsqUrl = await uploadFotoPostural(fotoLateralEsq, alunoId, 'lateral_esq');
      }

      await criarAvaliacaoPostural.mutateAsync({
        avaliacaoId,
        observacoes,
        fotoFrenteUrl,
        fotoCostasUrl,
        fotoLateralDirUrl,
        fotoLateralEsqUrl,
      });

      toast({
        title: 'Sucesso',
        description: 'Avaliação postural salva com sucesso',
      });

      onClose();
    } catch (error) {
      console.error('Erro ao salvar avaliação postural:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar avaliação postural',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1f2e] border-b border-gray-700 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Avaliação Postural</h2>
            <p className="text-gray-400 text-sm mt-1">Data: {new Date(dataAvaliacao).toLocaleDateString('pt-BR')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Foto Frente */}
            <div className="space-y-2">
              <Label className="text-white">Foto Frontal</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                {fotoFrente ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(fotoFrente)}
                      alt="Frente"
                      className="w-full h-48 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFotoFrente(null)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => frenteInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm">Clique para adicionar</p>
                  </div>
                )}
                <input
                  ref={frenteInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setFotoFrente)}
                />
              </div>
            </div>

            {/* Foto Costas */}
            <div className="space-y-2">
              <Label className="text-white">Foto de Costas</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                {fotoCostas ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(fotoCostas)}
                      alt="Costas"
                      className="w-full h-48 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFotoCostas(null)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => costasInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm">Clique para adicionar</p>
                  </div>
                )}
                <input
                  ref={costasInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setFotoCostas)}
                />
              </div>
            </div>

            {/* Foto Lateral Direita */}
            <div className="space-y-2">
              <Label className="text-white">Foto Lateral Direita</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                {fotoLateralDir ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(fotoLateralDir)}
                      alt="Lateral Direita"
                      className="w-full h-48 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFotoLateralDir(null)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => lateralDirInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm">Clique para adicionar</p>
                  </div>
                )}
                <input
                  ref={lateralDirInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setFotoLateralDir)}
                />
              </div>
            </div>

            {/* Foto Lateral Esquerda */}
            <div className="space-y-2">
              <Label className="text-white">Foto Lateral Esquerda</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center">
                {fotoLateralEsq ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(fotoLateralEsq)}
                      alt="Lateral Esquerda"
                      className="w-full h-48 object-cover rounded"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFotoLateralEsq(null)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="cursor-pointer"
                    onClick={() => lateralEsqInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-400 text-sm">Clique para adicionar</p>
                  </div>
                )}
                <input
                  ref={lateralEsqInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, setFotoLateralEsq)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-white">
              Observações
            </Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione observações sobre a postura do aluno..."
              className="min-h-[100px] bg-[#0f1419] border-gray-700 text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {uploading ? 'Salvando...' : 'Salvar Avaliação'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
