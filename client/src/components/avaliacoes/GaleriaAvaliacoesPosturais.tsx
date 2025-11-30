import { useState } from 'react';
import { Calendar, Eye, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImagemComGrade } from './ImagemComGrade';
import { AvaliacaoPosturalModal } from './AvaliacaoPosturalModal';
import { VisualizarAvaliacaoPosturalModal } from './VisualizarAvaliacaoPosturalModal';
import { useAvaliacoesPosturaisAluno, useDeletarAvaliacaoPostural } from '@/hooks/useAvaliacoesPosturais';
import { useToast } from '@/hooks/use-toast';

interface GaleriaAvaliacoesPosturaisProps {
  alunoId: string;
  avaliacaoFisicaId: string;
  dataAvaliacao: string;
}

export function GaleriaAvaliacoesPosturais({
  alunoId,
  avaliacaoFisicaId,
  dataAvaliacao,
}: GaleriaAvaliacoesPosturaisProps) {
  const { toast } = useToast();
  const { data: avaliacoes, isLoading } = useAvaliacoesPosturaisAluno(alunoId);
  const deletarAvaliacao = useDeletarAvaliacaoPostural();

  const [modalAberto, setModalAberto] = useState(false);
  const [visualizarModal, setVisualizarModal] = useState(false);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<any>(null);

  const handleDeletar = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar esta avaliação postural?')) return;

    try {
      await deletarAvaliacao.mutateAsync(id);
      toast({
        title: 'Sucesso',
        description: 'Avaliação postural deletada com sucesso',
      });
    } catch (error) {
      console.error('Erro ao deletar avaliação:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao deletar avaliação postural',
        variant: 'destructive',
      });
    }
  };

  const handleVisualizar = (avaliacao: any) => {
    setAvaliacaoSelecionada(avaliacao);
    setVisualizarModal(true);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Carregando avaliações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-white">Avaliações Posturais</h3>
        <Button
          onClick={() => setModalAberto(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Avaliação
        </Button>
      </div>

      {!avaliacoes || avaliacoes.length === 0 ? (
        <div className="text-center py-12 bg-[#0f1419] rounded-lg border border-gray-700">
          <Calendar className="w-12 h-12 mx-auto text-gray-500 mb-3" />
          <p className="text-gray-400">Nenhuma avaliação postural registrada</p>
          <Button
            onClick={() => setModalAberto(true)}
            variant="outline"
            className="mt-4"
          >
            Adicionar primeira avaliação
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {avaliacoes.map((avaliacao) => (
            <div
              key={avaliacao.id}
              className="bg-[#0f1419] rounded-lg border border-gray-700 overflow-hidden hover:border-blue-500 transition-colors"
            >
              <div className="p-4 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">
                      {new Date(avaliacao.dataAvaliacao).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleVisualizar(avaliacao)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeletar(avaliacao.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4">
                {avaliacao.fotoFrenteUrl && (
                  <div className="aspect-[3/4] bg-black rounded overflow-hidden">
                    <ImagemComGrade
                      src={avaliacao.fotoFrenteUrl}
                      alt="Frente"
                      showGrid={false}
                    />
                  </div>
                )}
                {avaliacao.fotoCostasUrl && (
                  <div className="aspect-[3/4] bg-black rounded overflow-hidden">
                    <ImagemComGrade
                      src={avaliacao.fotoCostasUrl}
                      alt="Costas"
                      showGrid={false}
                    />
                  </div>
                )}
                {avaliacao.fotoLateralDirUrl && (
                  <div className="aspect-[3/4] bg-black rounded overflow-hidden">
                    <ImagemComGrade
                      src={avaliacao.fotoLateralDirUrl}
                      alt="Lateral Direita"
                      showGrid={false}
                    />
                  </div>
                )}
                {avaliacao.fotoLateralEsqUrl && (
                  <div className="aspect-[3/4] bg-black rounded overflow-hidden">
                    <ImagemComGrade
                      src={avaliacao.fotoLateralEsqUrl}
                      alt="Lateral Esquerda"
                      showGrid={false}
                    />
                  </div>
                )}
              </div>

              {avaliacao.observacoes && (
                <div className="p-4 border-t border-gray-700">
                  <p className="text-gray-400 text-sm line-clamp-2">
                    {avaliacao.observacoes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AvaliacaoPosturalModal
        isOpen={modalAberto}
        onClose={() => setModalAberto(false)}
        avaliacaoId={avaliacaoFisicaId}
        alunoId={alunoId}
        dataAvaliacao={dataAvaliacao}
      />

      {avaliacaoSelecionada && (
        <VisualizarAvaliacaoPosturalModal
          isOpen={visualizarModal}
          onClose={() => {
            setVisualizarModal(false);
            setAvaliacaoSelecionada(null);
          }}
          avaliacao={avaliacaoSelecionada}
        />
      )}
    </div>
  );
}
