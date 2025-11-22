import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, Play } from 'lucide-react';
import { useTreinosVideo } from '@/hooks/useTreinosVideo';

interface Exercicio {
  id?: string;
  nome: string;
  grupoMuscular: string;
  ordem: number;
  series: number;
  repeticoes: string;
  descanso: number;
  observacoes?: string;
  tecnica?: string;
  videoId?: string;
}

interface ExercicioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercicio: Exercicio) => void;
  exercicio: Exercicio | null;
}

const gruposMusculares = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Quadríceps',
  'Posterior',
  'Glúteos',
  'Panturrilha',
  'Abdômen',
  'Antebraço'
];

const tecnicas = [
  'Normal',
  'Drop Set',
  'Bi-Set',
  'Tri-Set',
  'Super Set',
  'Rest-Pause',
  'Pirâmide',
  'Até Falha'
];

export function ExercicioModal({ isOpen, onClose, onSave, exercicio }: ExercicioModalProps) {
  const [nome, setNome] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState('');
  const [series, setSeries] = useState(3);
  const [repeticoes, setRepeticoes] = useState('');
  const [descanso, setDescanso] = useState(60);
  const [observacoes, setObservacoes] = useState('');
  const [tecnica, setTecnica] = useState('Normal');
  const [videoId, setVideoId] = useState('none');
  
  // Buscar vídeos disponíveis
  const { data: videosSupabase = [], isLoading: loadingVideos } = useTreinosVideo();

  useEffect(() => {
    if (exercicio) {
      setNome(exercicio.nome);
      setGrupoMuscular(exercicio.grupoMuscular);
      setSeries(exercicio.series);
      setRepeticoes(exercicio.repeticoes);
      setDescanso(exercicio.descanso);
      setObservacoes(exercicio.observacoes || '');
      setTecnica(exercicio.tecnica || 'Normal');
      setVideoId(exercicio.videoId || 'none');
    } else {
      setNome('');
      setGrupoMuscular('');
      setSeries(3);
      setRepeticoes('');
      setDescanso(60);
      setObservacoes('');
      setTecnica('Normal');
      setVideoId('none');
    }
  }, [exercicio, isOpen]);

  const handleSave = () => {
    onSave({
      nome,
      grupoMuscular,
      ordem: exercicio?.ordem || 0,
      series,
      repeticoes,
      descanso,
      observacoes,
      tecnica: tecnica !== 'Normal' ? tecnica : undefined,
      videoId: videoId && videoId !== 'none' ? videoId : undefined
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            {exercicio ? 'Editar Exercício' : 'Novo Exercício'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nome" className="text-gray-300">Nome do Exercício *</Label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: Supino Reto"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="grupo" className="text-gray-300">Grupo Muscular *</Label>
              <Select value={grupoMuscular} onValueChange={setGrupoMuscular}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {gruposMusculares.map(grupo => (
                    <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tecnica" className="text-gray-300">Técnica</Label>
              <Select value={tecnica} onValueChange={setTecnica}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {tecnicas.map(tec => (
                    <SelectItem key={tec} value={tec}>{tec}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="series" className="text-gray-300">Séries *</Label>
              <Input
                id="series"
                type="number"
                min="1"
                value={series}
                onChange={(e) => setSeries(parseInt(e.target.value) || 1)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repeticoes" className="text-gray-300">Repetições *</Label>
              <Input
                id="repeticoes"
                value={repeticoes}
                onChange={(e) => setRepeticoes(e.target.value)}
                placeholder="Ex: 12 ou 10-12"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descanso" className="text-gray-300">Descanso (s) *</Label>
              <Input
                id="descanso"
                type="number"
                min="0"
                step="15"
                value={descanso}
                onChange={(e) => setDescanso(parseInt(e.target.value) || 0)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-gray-300">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Dicas de execução, cuidados, etc..."
              rows={3}
              className="bg-gray-800 border-gray-700 text-white resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="videoId" className="text-gray-300">
              Vídeo de Referência (opcional)
            </Label>
            <Select value={videoId} onValueChange={setVideoId} disabled={loadingVideos}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder={loadingVideos ? "Carregando vídeos..." : "Selecione um vídeo..."} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 max-h-[300px]">
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <span>Nenhum vídeo</span>
                  </div>
                </SelectItem>
                {videosSupabase.map((video) => (
                  <SelectItem key={video.id} value={video.id}>
                    <div className="flex items-center gap-2">
                      <Play className="w-3 h-3 text-blue-400" />
                      <span className="truncate">{video.nome}</span>
                      {video.objetivo && (
                        <span className="text-xs text-gray-500">• {video.objetivo}</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
                {videosSupabase.length === 0 && !loadingVideos && (
                  <div className="px-2 py-3 text-sm text-gray-500 text-center">
                    Nenhum vídeo cadastrado ainda
                  </div>
                )}
              </SelectContent>
            </Select>
            {videoId && videoId !== 'none' && (
              <p className="text-xs text-gray-500">
                💡 O aluno poderá assistir este vídeo para ver a execução correta do exercício
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-800">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={!nome || !grupoMuscular || !repeticoes}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Exercício
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
