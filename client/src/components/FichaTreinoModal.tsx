import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Save, X, Link2 } from 'lucide-react';
import { ExerciciosList } from './ExerciciosList';
import { ExercicioModal } from './ExercicioModal';
import { BiSetModal } from './BiSetModal';
import { gerarBisetGrupoId, desfazerBiset } from '@/hooks/useFichasTreino';

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
  bisetGrupoId?: string;
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
  const [isBiSetModalOpen, setIsBiSetModalOpen] = useState(false);
  const [bisetEditando, setBisetEditando] = useState<{ exercicioA: Exercicio; exercicioB: Exercicio } | null>(null);

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
      const identificador = exercicioEditando.id || `temp-${exercicioEditando.ordem}`;
      setExercicios(exercicios.map(ex => {
        const exId = ex.id || `temp-${ex.ordem}`;
        if (exId === identificador) {
          // Preservar bisetGrupoId se existir
          return { 
            ...exercicioData, 
            id: ex.id,
            bisetGrupoId: ex.bisetGrupoId,
            tecnica: ex.bisetGrupoId ? 'Bi-Set' : exercicioData.tecnica
          };
        }
        return ex;
      }));
    } else {
      const novaOrdem = exercicios.length + 1;
      const tempId = `temp-${Date.now()}-${novaOrdem}`;
      setExercicios([...exercicios, { ...exercicioData, id: tempId, ordem: novaOrdem }]);
    }
    setIsExercicioModalOpen(false);
    setExercicioEditando(null);
  };

  const handleExcluirExercicio = (exercicioId: string) => {
    // Verificar se o exercício faz parte de um Bi-set
    const exercicio = exercicios.find(ex => (ex.id || `temp-${ex.ordem}`) === exercicioId);
    
    let novosExercicios = exercicios;
    
    if (exercicio?.bisetGrupoId) {
      // Desfazer o Bi-set antes de excluir - converter para snake_case
      const exerciciosSnakeCase = exercicios.map(ex => ({
        id: ex.id,
        nome: ex.nome,
        grupo_muscular: ex.grupoMuscular,
        ordem: ex.ordem,
        series: ex.series,
        repeticoes: ex.repeticoes,
        descanso: ex.descanso,
        observacoes: ex.observacoes,
        tecnica: ex.tecnica,
        video_id: ex.videoId,
        biset_grupo_id: ex.bisetGrupoId
      }));
      const exerciciosSemBiset = desfazerBiset(exerciciosSnakeCase, exercicio.bisetGrupoId);
      // Converter de volta para camelCase
      novosExercicios = exerciciosSemBiset.map(ex => ({
        id: ex.id,
        nome: ex.nome,
        grupoMuscular: ex.grupo_muscular,
        ordem: ex.ordem,
        series: ex.series,
        repeticoes: ex.repeticoes,
        descanso: ex.descanso,
        observacoes: ex.observacoes,
        tecnica: ex.tecnica,
        videoId: ex.video_id,
        bisetGrupoId: ex.biset_grupo_id
      }));
    }
    
    // Filtrar e reordenar
    novosExercicios = novosExercicios
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

  // Handlers para Bi-Set
  const handleCriarBiSet = () => {
    setBisetEditando(null);
    setIsBiSetModalOpen(true);
  };

  const handleSalvarBiSet = (
    exercicioA: Exercicio, 
    exercicioB: Exercicio, 
    series: number, 
    descanso: number
  ) => {
    const grupoId = gerarBisetGrupoId();
    
    // Verificar se estamos editando exercícios existentes ou criando novos
    const exAExistente = exercicios.find(ex => ex.id === exercicioA.id);
    const exBExistente = exercicios.find(ex => ex.id === exercicioB.id);
    
    if (exAExistente && exBExistente) {
      // Atualizar exercícios existentes com o Bi-set
      setExercicios(exercicios.map(ex => {
        if (ex.id === exercicioA.id) {
          return {
            ...ex,
            series,
            bisetGrupoId: grupoId,
            tecnica: 'Bi-Set',
            descanso: 0 // Sem descanso após o primeiro
          };
        }
        if (ex.id === exercicioB.id) {
          return {
            ...ex,
            series,
            bisetGrupoId: grupoId,
            tecnica: 'Bi-Set',
            descanso // Descanso após o par
          };
        }
        return ex;
      }));
      
      // Reordenar para garantir que estejam consecutivos
      reordenarParaBiset(exercicioA.id!, exercicioB.id!);
    } else {
      // Criar novos exercícios
      const novaOrdemA = exercicios.length + 1;
      const novaOrdemB = exercicios.length + 2;
      
      const novoExercicioA: Exercicio = {
        ...exercicioA,
        id: `temp-${Date.now()}-A`,
        ordem: novaOrdemA,
        series,
        bisetGrupoId: grupoId,
        tecnica: 'Bi-Set',
        descanso: 0
      };
      
      const novoExercicioB: Exercicio = {
        ...exercicioB,
        id: `temp-${Date.now()}-B`,
        ordem: novaOrdemB,
        series,
        bisetGrupoId: grupoId,
        tecnica: 'Bi-Set',
        descanso
      };
      
      setExercicios([...exercicios, novoExercicioA, novoExercicioB]);
    }
    
    setIsBiSetModalOpen(false);
    setBisetEditando(null);
  };

  const reordenarParaBiset = (idA: string, idB: string) => {
    setExercicios(prev => {
      const indexA = prev.findIndex(ex => ex.id === idA);
      const indexB = prev.findIndex(ex => ex.id === idB);
      
      if (indexA === -1 || indexB === -1) return prev;
      
      // Se já estão consecutivos, não fazer nada
      if (Math.abs(indexA - indexB) === 1) {
        return prev.map((ex, i) => ({ ...ex, ordem: i + 1 }));
      }
      
      // Mover B para logo após A
      const resultado = [...prev];
      const [exercicioB] = resultado.splice(indexB, 1);
      const novoIndexA = resultado.findIndex(ex => ex.id === idA);
      resultado.splice(novoIndexA + 1, 0, exercicioB);
      
      return resultado.map((ex, i) => ({ ...ex, ordem: i + 1 }));
    });
  };

  const handleDesfazerBiset = (grupoId: string) => {
    // Converter para snake_case
    const exerciciosSnakeCase = exercicios.map(ex => ({
      id: ex.id,
      nome: ex.nome,
      grupo_muscular: ex.grupoMuscular,
      ordem: ex.ordem,
      series: ex.series,
      repeticoes: ex.repeticoes,
      descanso: ex.descanso,
      observacoes: ex.observacoes,
      tecnica: ex.tecnica,
      video_id: ex.videoId,
      biset_grupo_id: ex.bisetGrupoId
    }));
    
    const exerciciosSemBiset = desfazerBiset(exerciciosSnakeCase, grupoId);
    
    // Converter de volta para camelCase
    setExercicios(exerciciosSemBiset.map(ex => ({
      id: ex.id,
      nome: ex.nome,
      grupoMuscular: ex.grupo_muscular,
      ordem: ex.ordem,
      series: ex.series,
      repeticoes: ex.repeticoes,
      descanso: ex.descanso,
      observacoes: ex.observacoes,
      tecnica: ex.biset_grupo_id ? 'Bi-Set' : undefined,
      videoId: ex.video_id,
      bisetGrupoId: ex.biset_grupo_id
    })));
  };

  const handleEditarBiset = (grupoId: string) => {
    const exerciciosDoBiset = exercicios
      .filter(ex => ex.bisetGrupoId === grupoId)
      .sort((a, b) => a.ordem - b.ordem);
    
    if (exerciciosDoBiset.length === 2) {
      setBisetEditando({
        exercicioA: exerciciosDoBiset[0],
        exercicioB: exerciciosDoBiset[1]
      });
      setIsBiSetModalOpen(true);
    }
  };

  // Contar Bi-sets
  const bisetGrupos = new Set(exercicios.filter(ex => ex.bisetGrupoId).map(ex => ex.bisetGrupoId));
  const totalBisets = bisetGrupos.size;

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
                {totalBisets > 0 && (
                  <span className="ml-1 text-orange-400">• {totalBisets} bi-set{totalBisets > 1 ? 's' : ''}</span>
                )}
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
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <p className="text-sm text-gray-400">
                    {exercicios.length === 0 
                      ? 'Nenhum exercício adicionado' 
                      : `${exercicios.length} exercício(s) adicionado(s)`}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCriarBiSet}
                      size="sm"
                      variant="outline"
                      className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300"
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Criar Bi-Set
                    </Button>
                    <Button
                      onClick={handleAdicionarExercicio}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Exercício
                    </Button>
                  </div>
                </div>

                <ExerciciosList
                  exercicios={exercicios}
                  onEditarExercicio={handleEditarExercicio}
                  onExcluirExercicio={handleExcluirExercicio}
                  onReordenar={handleReordenarExercicios}
                  onDesfazerBiset={handleDesfazerBiset}
                  onEditarBiset={handleEditarBiset}
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

      <BiSetModal
        isOpen={isBiSetModalOpen}
        onClose={() => {
          setIsBiSetModalOpen(false);
          setBisetEditando(null);
        }}
        onSave={handleSalvarBiSet}
        exerciciosDisponiveis={exercicios}
        bisetEditando={bisetEditando}
      />
    </>
  );
}
