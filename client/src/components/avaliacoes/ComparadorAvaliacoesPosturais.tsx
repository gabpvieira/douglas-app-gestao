import { useState } from 'react';
import { ArrowLeftRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagemComGrade } from './ImagemComGrade';
import { useAvaliacoesPosturaisAluno, AvaliacaoPosturalComData } from '@/hooks/useAvaliacoesPosturais';

interface ComparadorAvaliacoesPosturaisProps {
  alunoId: string;
}

export function ComparadorAvaliacoesPosturais({ alunoId }: ComparadorAvaliacoesPosturaisProps) {
  const { data: avaliacoes, isLoading } = useAvaliacoesPosturaisAluno(alunoId);
  const [avaliacao1, setAvaliacao1] = useState<string>('');
  const [avaliacao2, setAvaliacao2] = useState<string>('');
  const [tipoFoto, setTipoFoto] = useState<'frente' | 'costas' | 'lateral_dir' | 'lateral_esq'>('frente');

  if (isLoading) {
    return <div className="text-center py-8 text-gray-400">Carregando...</div>;
  }

  if (!avaliacoes || avaliacoes.length < 2) {
    return (
      <div className="text-center py-12 bg-[#0f1419] rounded-lg border border-gray-700">
        <ArrowLeftRight className="w-12 h-12 mx-auto text-gray-500 mb-3" />
        <p className="text-gray-400">
          É necessário ter pelo menos 2 avaliações para comparar
        </p>
      </div>
    );
  }

  const getAvaliacaoById = (id: string): AvaliacaoPosturalComData | undefined => {
    return avaliacoes.find((av) => av.id === id);
  };

  const getFotoUrl = (avaliacao: AvaliacaoPosturalComData | undefined): string | undefined => {
    if (!avaliacao) return undefined;
    switch (tipoFoto) {
      case 'frente':
        return avaliacao.fotoFrenteUrl;
      case 'costas':
        return avaliacao.fotoCostasUrl;
      case 'lateral_dir':
        return avaliacao.fotoLateralDirUrl;
      case 'lateral_esq':
        return avaliacao.fotoLateralEsqUrl;
    }
  };

  const av1 = getAvaliacaoById(avaliacao1);
  const av2 = getAvaliacaoById(avaliacao2);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Comparar Avaliações</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={avaliacao1} onValueChange={setAvaliacao1}>
          <SelectTrigger className="bg-[#0f1419] border-gray-700 text-white">
            <SelectValue placeholder="Selecione a 1ª avaliação" />
          </SelectTrigger>
          <SelectContent>
            {avaliacoes.map((av) => (
              <SelectItem key={av.id} value={av.id}>
                {new Date(av.dataAvaliacao).toLocaleDateString('pt-BR')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tipoFoto} onValueChange={(v: any) => setTipoFoto(v)}>
          <SelectTrigger className="bg-[#0f1419] border-gray-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="frente">Frontal</SelectItem>
            <SelectItem value="costas">Costas</SelectItem>
            <SelectItem value="lateral_dir">Lateral Direita</SelectItem>
            <SelectItem value="lateral_esq">Lateral Esquerda</SelectItem>
          </SelectContent>
        </Select>

        <Select value={avaliacao2} onValueChange={setAvaliacao2}>
          <SelectTrigger className="bg-[#0f1419] border-gray-700 text-white">
            <SelectValue placeholder="Selecione a 2ª avaliação" />
          </SelectTrigger>
          <SelectContent>
            {avaliacoes.map((av) => (
              <SelectItem key={av.id} value={av.id}>
                {new Date(av.dataAvaliacao).toLocaleDateString('pt-BR')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {avaliacao1 && avaliacao2 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avaliação 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Calendar className="w-4 h-4 text-blue-400" />
              <span className="font-medium">
                {av1 && new Date(av1.dataAvaliacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="bg-black rounded-lg overflow-hidden aspect-[3/4]">
              {getFotoUrl(av1) ? (
                <ImagemComGrade src={getFotoUrl(av1)!} alt="Avaliação 1" showGrid={true} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Foto não disponível
                </div>
              )}
            </div>
            {av1?.observacoes && (
              <div className="bg-[#0f1419] rounded p-3 border border-gray-700">
                <p className="text-gray-300 text-sm">{av1.observacoes}</p>
              </div>
            )}
          </div>

          {/* Avaliação 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Calendar className="w-4 h-4 text-green-400" />
              <span className="font-medium">
                {av2 && new Date(av2.dataAvaliacao).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <div className="bg-black rounded-lg overflow-hidden aspect-[3/4]">
              {getFotoUrl(av2) ? (
                <ImagemComGrade src={getFotoUrl(av2)!} alt="Avaliação 2" showGrid={true} />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Foto não disponível
                </div>
              )}
            </div>
            {av2?.observacoes && (
              <div className="bg-[#0f1419] rounded p-3 border border-gray-700">
                <p className="text-gray-300 text-sm">{av2.observacoes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
