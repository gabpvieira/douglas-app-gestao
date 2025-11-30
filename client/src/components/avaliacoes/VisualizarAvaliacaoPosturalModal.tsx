import { useState } from 'react';
import { X, Grid3x3, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImagemComGrade } from './ImagemComGrade';
import { AvaliacaoPosturalComData } from '@/hooks/useAvaliacoesPosturais';

interface VisualizarAvaliacaoPosturalModalProps {
  isOpen: boolean;
  onClose: () => void;
  avaliacao: AvaliacaoPosturalComData;
}

export function VisualizarAvaliacaoPosturalModal({
  isOpen,
  onClose,
  avaliacao,
}: VisualizarAvaliacaoPosturalModalProps) {
  const [mostrarGrade, setMostrarGrade] = useState(true);

  if (!isOpen) return null;

  const fotos = [
    { url: avaliacao.fotoFrenteUrl, label: 'Frontal' },
    { url: avaliacao.fotoCostasUrl, label: 'Costas' },
    { url: avaliacao.fotoLateralDirUrl, label: 'Lateral Direita' },
    { url: avaliacao.fotoLateralEsqUrl, label: 'Lateral Esquerda' },
  ].filter((foto) => foto.url);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1f2e] rounded-lg w-full max-w-7xl max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1f2e] border-b border-gray-700 p-6 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-white">Avaliação Postural</h2>
            <p className="text-gray-400 text-sm mt-1">
              Data: {new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMostrarGrade(!mostrarGrade)}
              className="flex items-center gap-2"
            >
              {mostrarGrade ? (
                <>
                  <ImageIcon className="w-4 h-4" />
                  Ocultar Grade
                </>
              ) : (
                <>
                  <Grid3x3 className="w-4 h-4" />
                  Mostrar Grade
                </>
              )}
            </Button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {fotos.map((foto, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-white font-medium">{foto.label}</h3>
                <div className="bg-black rounded-lg overflow-hidden aspect-[3/4]">
                  <ImagemComGrade
                    src={foto.url!}
                    alt={foto.label}
                    showGrid={mostrarGrade}
                  />
                </div>
              </div>
            ))}
          </div>

          {avaliacao.observacoes && (
            <div className="bg-[#0f1419] rounded-lg p-4 border border-gray-700">
              <h3 className="text-white font-medium mb-2">Observações</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{avaliacao.observacoes}</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#1a1f2e] border-t border-gray-700 p-6 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}
