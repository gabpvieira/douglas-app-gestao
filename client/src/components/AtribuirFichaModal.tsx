import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserPlus, X, Search, Trash2, Calendar } from 'lucide-react';
import { useAlunos } from '@/hooks/useAlunos';
import { useFichaAtribuicoes, useRemoverAtribuicao } from '@/hooks/useFichasTreino';
import { useToast } from '@/hooks/use-toast';

interface FichaTreino {
  id: string;
  nome: string;
  descricao: string;
  objetivo: string;
  nivel: string;
  duracaoSemanas: number;
}

interface AtribuirFichaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (alunosIds: string[], dataInicio: string, dataFim?: string, observacoes?: string) => void;
  ficha: FichaTreino;
}

export function AtribuirFichaModal({ isOpen, onClose, onConfirm, ficha }: AtribuirFichaModalProps) {
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([]);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: alunosSupabase = [] } = useAlunos();
  const { data: atribuicoes = [], refetch: refetchAtribuicoes } = useFichaAtribuicoes(ficha.id);
  const removerAtribuicao = useRemoverAtribuicao();

  // Resetar form ao abrir
  useEffect(() => {
    if (isOpen) {
      setAlunosSelecionados([]);
      setDataInicio('');
      setDataFim('');
      setObservacoes('');
      setSearchTerm('');
      refetchAtribuicoes();
    }
  }, [isOpen, refetchAtribuicoes]);

  // IDs dos alunos já atribuídos
  const alunosAtribuidosIds = atribuicoes.map((atr: any) => atr.aluno_id);

  // Todos os alunos
  const todosAlunos = alunosSupabase.map(aluno => ({
    id: aluno.id,
    nome: aluno.nome,
    email: aluno.email
  }));

  // Alunos disponíveis (não atribuídos)
  const alunosDisponiveis = todosAlunos.filter(aluno => 
    !alunosAtribuidosIds.includes(aluno.id)
  );

  // Alunos já atribuídos com detalhes
  const alunosAtribuidos = atribuicoes.map((atr: any) => {
    const aluno = todosAlunos.find(a => a.id === atr.aluno_id);
    return {
      ...atr,
      aluno
    };
  });

  const filteredAlunos = alunosDisponiveis.filter(aluno =>
    aluno.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aluno.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleAluno = (alunoId: string) => {
    setAlunosSelecionados(prev =>
      prev.includes(alunoId)
        ? prev.filter(id => id !== alunoId)
        : [...prev, alunoId]
    );
  };

  const handleConfirm = () => {
    if (alunosSelecionados.length === 0 || !dataInicio) return;
    onConfirm(alunosSelecionados, dataInicio, dataFim || undefined, observacoes || undefined);
  };

  // Calcular data fim sugerida baseada na duração
  const calcularDataFimSugerida = () => {
    if (!dataInicio) return '';
    const inicio = new Date(dataInicio);
    inicio.setDate(inicio.getDate() + (ficha.duracaoSemanas * 7));
    return inicio.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">
            Atribuir Ficha de Treino
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Info da Ficha */}
          <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">{ficha.nome}</h3>
            <p className="text-sm text-gray-400 mb-3">{ficha.descricao}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                {ficha.objetivo}
              </Badge>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {ficha.nivel}
              </Badge>
              <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
                {ficha.duracaoSemanas} semanas
              </Badge>
            </div>
          </div>

          {/* Datas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio" className="text-gray-300">Data de Início *</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dataInicio}
                onChange={(e) => {
                  setDataInicio(e.target.value);
                  if (!dataFim) {
                    setDataFim(calcularDataFimSugerida());
                  }
                }}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim" className="text-gray-300">
                Data de Término (sugerida)
              </Label>
              <Input
                id="dataFim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Busca de Alunos */}
          <div className="space-y-2">
            <Label className="text-gray-300">Selecionar Alunos *</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar aluno por nome ou email..."
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* Alunos Já Atribuídos */}
          {alunosAtribuidos.length > 0 && (
            <div className="space-y-2">
              <Label className="text-gray-300">Alunos Já Atribuídos</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-700 rounded-lg p-3 bg-gray-800/30">
                {alunosAtribuidos.map((atribuicao: any) => (
                  <div
                    key={atribuicao.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{atribuicao.aluno?.nome}</p>
                      <p className="text-xs text-gray-400">{atribuicao.aluno?.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-400">
                          {new Date(atribuicao.data_inicio).toLocaleDateString('pt-BR')}
                          {atribuicao.data_fim && ` até ${new Date(atribuicao.data_fim).toLocaleDateString('pt-BR')}`}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (window.confirm('Remover esta atribuição?')) {
                          try {
                            await removerAtribuicao.mutateAsync({
                              fichaId: ficha.id,
                              atribuicaoId: atribuicao.id
                            });
                            toast({
                              title: "Atribuição removida",
                              description: "O aluno foi removido da ficha com sucesso."
                            });
                            refetchAtribuicoes();
                          } catch (error) {
                            toast({
                              title: "Erro",
                              description: "Não foi possível remover a atribuição.",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Separator className="my-4 bg-gray-700" />
            </div>
          )}

          {/* Lista de Alunos Disponíveis */}
          <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-700 rounded-lg p-3 bg-gray-800/30">
            {filteredAlunos.length === 0 ? (
              <p className="text-center text-gray-500 text-sm py-4">
                {alunosDisponiveis.length === 0 
                  ? 'Todos os alunos já estão atribuídos a esta ficha'
                  : 'Nenhum aluno encontrado'}
              </p>
            ) : (
              filteredAlunos.map(aluno => (
                <div
                  key={aluno.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors cursor-pointer"
                  onClick={() => handleToggleAluno(aluno.id)}
                >
                  <Checkbox
                    checked={alunosSelecionados.includes(aluno.id)}
                    onCheckedChange={() => handleToggleAluno(aluno.id)}
                    className="border-gray-600"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{aluno.nome}</p>
                    <p className="text-xs text-gray-400">{aluno.email}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {alunosSelecionados.length > 0 && (
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <p className="text-sm text-blue-400">
                {alunosSelecionados.length} aluno(s) selecionado(s)
              </p>
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes" className="text-gray-300">Observações</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Observações ou instruções específicas para esta atribuição..."
              rows={3}
              className="bg-gray-800 border-gray-700 text-white resize-none"
            />
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
            onClick={handleConfirm}
            disabled={alunosSelecionados.length === 0 || !dataInicio}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Atribuir Ficha
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
