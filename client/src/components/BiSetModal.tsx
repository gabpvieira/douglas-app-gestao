import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Save, X, Link2, AlertCircle } from 'lucide-react';
import { validarBiset } from '@/hooks/useFichasTreino';

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

interface BiSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercicioA: Exercicio, exercicioB: Exercicio, series: number, descanso: number) => void;
  exerciciosDisponiveis: Exercicio[];
  bisetEditando?: { exercicioA: Exercicio; exercicioB: Exercicio } | null;
}

const gruposMusculares = [
  'Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas',
  'Quadríceps', 'Posterior', 'Glúteos', 'Panturrilha', 'Abdômen', 'Antebraço'
];

export function BiSetModal({ isOpen, onClose, onSave, exerciciosDisponiveis, bisetEditando }: BiSetModalProps) {
  const [modo, setModo] = useState<'selecionar' | 'criar'>('selecionar');
  const [exercicioASelecionado, setExercicioASelecionado] = useState<string>('');
  const [exercicioBSelecionado, setExercicioBSelecionado] = useState<string>('');
  
  // Campos para criar novos exercícios
  const [nomeA, setNomeA] = useState('');
  const [grupoMuscularA, setGrupoMuscularA] = useState('');
  const [repeticoesA, setRepeticoesA] = useState('');
  const [nomeB, setNomeB] = useState('');
  const [grupoMuscularB, setGrupoMuscularB] = useState('');
  const [repeticoesB, setRepeticoesB] = useState('');
  
  // Campos compartilhados
  const [series, setSeries] = useState(3);
  const [descanso, setDescanso] = useState(90);
  
  const [erro, setErro] = useState<string | null>(null);

  // Filtrar exercícios disponíveis (sem Bi-set)
  const exerciciosSemBiset = exerciciosDisponiveis.filter(ex => !ex.bisetGrupoId);

  useEffect(() => {
    if (bisetEditando) {
      setModo('selecionar');
      setExercicioASelecionado(bisetEditando.exercicioA.id || '');
      setExercicioBSelecionado(bisetEditando.exercicioB.id || '');
      setSeries(bisetEditando.exercicioA.series);
      setDescanso(bisetEditando.exercicioB.descanso);
    } else {
      resetForm();
    }
  }, [bisetEditando, isOpen]);

  const resetForm = () => {
    setModo('selecionar');
    setExercicioASelecionado('');
    setExercicioBSelecionado('');
    setNomeA('');
    setGrupoMuscularA('');
    setRepeticoesA('');
    setNomeB('');
    setGrupoMuscularB('');
    setRepeticoesB('');
    setSeries(3);
    setDescanso(90);
    setErro(null);
  };

  const handleSave = () => {
    setErro(null);
    
    let exercicioA: Exercicio;
    let exercicioB: Exercicio;

    if (modo === 'selecionar') {
      const exA = exerciciosDisponiveis.find(e => e.id === exercicioASelecionado);
      const exB = exerciciosDisponiveis.find(e => e.id === exercicioBSelecionado);
      
      if (!exA || !exB) {
        setErro('Selecione dois exercícios');
        return;
      }

      exercicioA = { ...exA, series, repeticoes: exA.repeticoes };
      exercicioB = { ...exB, series, repeticoes: exB.repeticoes };
    } else {
      // Criar novos exercícios
      if (!nomeA || !grupoMuscularA || !repeticoesA) {
        setErro('Preencha todos os campos do Exercício A');
        return;
      }
      if (!nomeB || !grupoMuscularB || !repeticoesB) {
        setErro('Preencha todos os campos do Exercício B');
        return;
      }

      exercicioA = {
        nome: nomeA,
        grupoMuscular: grupoMuscularA,
        ordem: 0,
        series,
        repeticoes: repeticoesA,
        descanso: 0
      };

      exercicioB = {
        nome: nomeB,
        grupoMuscular: grupoMuscularB,
        ordem: 0,
        series,
        repeticoes: repeticoesB,
        descanso
      };
    }

    // Validar Bi-set (converter para snake_case para validação)
    const exAValidacao = { ...exercicioA, grupo_muscular: exercicioA.grupoMuscular, biset_grupo_id: undefined };
    const exBValidacao = { ...exercicioB, grupo_muscular: exercicioB.grupoMuscular, biset_grupo_id: undefined };
    
    // Não validar IDs iguais se estamos criando novos
    if (modo === 'selecionar') {
      if (exercicioASelecionado === exercicioBSelecionado) {
        setErro('Selecione dois exercícios diferentes');
        return;
      }
    }

    onSave(exercicioA, exercicioB, series, descanso);
    onClose();
  };

  const exercicioAInfo = exerciciosDisponiveis.find(e => e.id === exercicioASelecionado);
  const exercicioBInfo = exerciciosDisponiveis.find(e => e.id === exercicioBSelecionado);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center gap-2">
            <Link2 className="h-5 w-5 text-orange-500" />
            {bisetEditando ? 'Editar Bi-Set' : 'Criar Bi-Set'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Agrupe dois exercícios para serem executados em sequência, sem descanso entre eles.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Seletor de modo */}
          {!bisetEditando && exerciciosSemBiset.length >= 2 && (
            <div className="flex gap-2">
              <Button
                variant={modo === 'selecionar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setModo('selecionar')}
                className={modo === 'selecionar' ? 'bg-blue-600' : 'border-gray-700'}
              >
                Selecionar Existentes
              </Button>
              <Button
                variant={modo === 'criar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setModo('criar')}
                className={modo === 'criar' ? 'bg-blue-600' : 'border-gray-700'}
              >
                Criar Novos
              </Button>
            </div>
          )}

          {modo === 'selecionar' && exerciciosSemBiset.length >= 2 ? (
            /* Modo Selecionar Existentes */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Exercício A */}
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">A</Badge>
                    Primeiro Exercício
                  </Label>
                  <Select value={exercicioASelecionado} onValueChange={setExercicioASelecionado}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 max-h-60">
                      {exerciciosSemBiset
                        .filter(ex => ex.id !== exercicioBSelecionado)
                        .map(ex => (
                          <SelectItem key={ex.id} value={ex.id || ''}>
                            {ex.nome} ({ex.grupoMuscular})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {exercicioAInfo && (
                    <Card className="p-3 bg-gray-800/50 border-gray-700">
                      <p className="text-sm text-gray-300">{exercicioAInfo.nome}</p>
                      <p className="text-xs text-gray-500">{exercicioAInfo.repeticoes} reps</p>
                    </Card>
                  )}
                </div>

                {/* Exercício B */}
                <div className="space-y-2">
                  <Label className="text-gray-300 flex items-center gap-2">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">B</Badge>
                    Segundo Exercício
                  </Label>
                  <Select value={exercicioBSelecionado} onValueChange={setExercicioBSelecionado}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 max-h-60">
                      {exerciciosSemBiset
                        .filter(ex => ex.id !== exercicioASelecionado)
                        .map(ex => (
                          <SelectItem key={ex.id} value={ex.id || ''}>
                            {ex.nome} ({ex.grupoMuscular})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {exercicioBInfo && (
                    <Card className="p-3 bg-gray-800/50 border-gray-700">
                      <p className="text-sm text-gray-300">{exercicioBInfo.nome}</p>
                      <p className="text-xs text-gray-500">{exercicioBInfo.repeticoes} reps</p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Modo Criar Novos */
            <div className="space-y-4">
              {/* Exercício A */}
              <Card className="p-4 bg-gray-800/30 border-gray-700">
                <Label className="text-gray-300 flex items-center gap-2 mb-3">
                  <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">A</Badge>
                  Primeiro Exercício
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Nome do exercício"
                    value={nomeA}
                    onChange={(e) => setNomeA(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Select value={grupoMuscularA} onValueChange={setGrupoMuscularA}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Grupo muscular" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {gruposMusculares.map(grupo => (
                        <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Repetições (ex: 12)"
                    value={repeticoesA}
                    onChange={(e) => setRepeticoesA(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </Card>

              {/* Exercício B */}
              <Card className="p-4 bg-gray-800/30 border-gray-700">
                <Label className="text-gray-300 flex items-center gap-2 mb-3">
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">B</Badge>
                  Segundo Exercício
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Input
                    placeholder="Nome do exercício"
                    value={nomeB}
                    onChange={(e) => setNomeB(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <Select value={grupoMuscularB} onValueChange={setGrupoMuscularB}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Grupo muscular" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {gruposMusculares.map(grupo => (
                        <SelectItem key={grupo} value={grupo}>{grupo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Repetições (ex: 15)"
                    value={repeticoesB}
                    onChange={(e) => setRepeticoesB(e.target.value)}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </Card>
            </div>
          )}

          {/* Configurações compartilhadas */}
          <Card className="p-4 bg-blue-500/10 border-blue-500/30">
            <Label className="text-blue-400 mb-3 block">Configurações do Bi-Set</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Séries (ambos)</Label>
                <Input
                  type="number"
                  min="1"
                  value={series}
                  onChange={(e) => setSeries(parseInt(e.target.value) || 1)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">Descanso após o par (s)</Label>
                <Input
                  type="number"
                  min="0"
                  step="15"
                  value={descanso}
                  onChange={(e) => setDescanso(parseInt(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              💡 O descanso ocorre apenas após completar ambos exercícios (A → B → descanso)
            </p>
          </Card>

          {/* Erro */}
          {erro && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              {erro}
            </div>
          )}
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
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
          >
            <Save className="w-4 h-4 mr-2" />
            {bisetEditando ? 'Atualizar Bi-Set' : 'Criar Bi-Set'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
