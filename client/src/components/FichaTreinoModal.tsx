import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, X } from 'lucide-react';
import { ExerciciosList } from './ExerciciosList';
import { ExercicioModal } from './ExercicioModal';

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

interface FichaTreino {
  id: string;
  nome: string;
  descricao: string;
  objetivo: string;
  nivel: 'iniciante' | 'intermediario' | 'avancado';
  duracaoSemanas: number;
  ativo: boolean;
  exercicios: Exercicio[];
}

interface FichaTreinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ficha: Partial<FichaTreino>) => void;
  ficha: FichaTreino | null;
}

export function FichaTreinoModal({ isOpen, onClose, onSave, ficha }: FichaTreinoModalProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [objetivo, setObjetivo] = useState('');
  const [nivel, setNivel] = useState<'iniciante' | 'intermediario' | 'avancado'>('iniciante');
  const [duracaoSemanas, setDuracaoSemanas] = useState(4);
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [isExercicioModalOpen, setIsExercicioModalOpen] = useState(false);
  const [exercicioEditando, setExercicioEditando] = useState<Exercicio | null>(null);

  useEffect(() => {
    if (ficha) {
      setNome(ficha.nome);
      setDescricao(ficha.descricao);
      setObjetivo(ficha.objetivo);
      setNivel(ficha.nivel);
      setDuracaoSemanas(ficha.duracaoSemanas);
      setExercicios(ficha.exercicios || []);
    } else {
      setNome('');
      setDescricao('');
      setObjetivo('');
      setNivel('iniciante');
      setDuracaoSemanas(4);
      setExercicios([]);
    }
  }, [ficha, isOpen]);

  const handleSave = () => {
    onSave({
      nome,
      descricao,
      objetivo,
      nivel,
      duracaoSemanas,
      exercicios
    });
  };

  const handleAdicionarExercicio = () => {
    setExercicioEditando(null);
    setIsExercicioModalOpen(true);
  };

  const handleEditarExercicio = (exercicio: Exercicio) => {
    setExercicioEditando(exercicio);
    setIsExercicioModalOpen(true);
  };

  const handleSalvarExercicio = (exercicioData: Exercicio) => {
    if (exercicioEditando) {
      // Usar id ou ordem para identificar o exercício sendo editado
      const identificador = exercicioEditando.id || `temp-${exercicioEditando.ordem}`;
      setExercicios(exercicios.map(ex => {
        const exId = ex.id || `temp-${ex.ordem}`;
        return exId === identificador ? { ...exercicioData, id: ex.id } : ex;
      }));
    } else {
      const novaOrdem = exercicios.length + 1;
      // Gerar um ID temporário único para novos exercícios
      const tempId = `temp-${Date.now()}-${novaOrdem}`;
      setExercicios([...exercicios, { ...exercicioData, id: tempId, ordem: novaOrdem }]);
    }
    setIsExercicioModalOpen(false);
    setExercicioEditando(null);
  };

  const handleExcluirExercicio = (exercicioId: string) => {
    // Filtrar pelo ID e reordenar
    const novosExercicios = exercicios
      .filter(ex => {
        const exId = ex.id || `temp-${ex.ordem}`;
        return exId !== exercicioId;
      })
      .map((ex, index) => ({ ...ex, ordem: index + 1 }));
    setExercicios(novosExercicios);
  };

  const handleReordenarExercicios = (exerciciosReordenados: Exercicio[]) => {
    setExercicios(exerciciosReordenados);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              {ficha ? 'Editar Ficha de Treino' : 'Nova Ficha de Treino'}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800">
              <TabsTrigger value="info" className="data-[state=active]:bg-blue-600">
                Informações
              </TabsTrigger>
              <TabsTrigger value="exercicios" className="data-[state=active]:bg-blue-600">
                Exercícios ({exercicios.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="nome" className="text-gray-300">Nome da Ficha *</Label>
                <Input
                  id="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Treino ABC - Hipertrofia"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao" className="text-gray-300">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva o objetivo e características desta ficha..."
                  rows={3}
                  className="bg-gray-800 border-gray-700 text-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="objetivo" className="text-gray-300">Objetivo</Label>
                  <Input
                    id="objetivo"
                    value={objetivo}
                    onChange={(e) => setObjetivo(e.target.value)}
                    placeholder="Ex: hipertrofia"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nivel" className="text-gray-300">Nível *</Label>
                  <Select value={nivel} onValueChange={(value: any) => setNivel(value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duracao" className="text-gray-300">Duração (semanas)</Label>
                  <Input
                    id="duracao"
                    type="number"
                    min="1"
                    value={duracaoSemanas}
                    onChange={(e) => setDuracaoSemanas(parseInt(e.target.value) || 4)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="exercicios" className="mt-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    {exercicios.length === 0 
                      ? 'Nenhum exercício adicionado' 
                      : `${exercicios.length} exercício(s) adicionado(s)`}
                  </p>
                  <Button
                    onClick={handleAdicionarExercicio}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Exercício
                  </Button>
                </div>

                <ExerciciosList
                  exercicios={exercicios}
                  onEditarExercicio={handleEditarExercicio}
                  onExcluirExercicio={handleExcluirExercicio}
                  onReordenar={handleReordenarExercicios}
                />
              </div>
            </TabsContent>
          </Tabs>

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
              disabled={!nome}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Ficha
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ExercicioModal
        isOpen={isExercicioModalOpen}
        onClose={() => {
          setIsExercicioModalOpen(false);
          setExercicioEditando(null);
        }}
        onSave={handleSalvarExercicio}
        exercicio={exercicioEditando}
      />
    </>
  );
}
