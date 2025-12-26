import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProgressoTreinos, useRankingSemanal, MetricasAluno } from "@/hooks/useProgressoTreinos";
import RankingDestaquesCard from "@/components/progresso/RankingDestaquesCard";
import AlunoProgressoCard from "@/components/progresso/AlunoProgressoCard";
import AlunoProgressoModal from "@/components/progresso/AlunoProgressoModal";
import PageHeader from "@/components/PageHeader";
import { Loader2, Search, TrendingUp, Users, AlertCircle } from "lucide-react";

type FiltroStatus = 'todos' | 'muito-ativo' | 'ativo' | 'moderado' | 'inativo';
type OrdenacaoTipo = 'nome' | 'dias' | 'treinos' | 'sequencia' | 'ultimo-treino';

export default function ProgressoTreinos() {
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('todos');
  const [ordenacao, setOrdenacao] = useState<OrdenacaoTipo>('dias');
  const [alunoSelecionado, setAlunoSelecionado] = useState<MetricasAluno | null>(null);
  
  const { data: alunos, isLoading } = useProgressoTreinos();
  const { data: ranking, isLoading: loadingRanking } = useRankingSemanal('dias');
  
  // Filtrar alunos
  const alunosFiltrados = alunos?.filter(aluno => {
    // Filtro de busca
    if (busca && !aluno.nome.toLowerCase().includes(busca.toLowerCase())) {
      return false;
    }
    
    // Filtro de status
    if (filtroStatus !== 'todos') {
      if (filtroStatus === 'muito-ativo' && aluno.diasTreinadosSemana < 5) return false;
      if (filtroStatus === 'ativo' && (aluno.diasTreinadosSemana < 3 || aluno.diasTreinadosSemana >= 5)) return false;
      if (filtroStatus === 'moderado' && (aluno.diasTreinadosSemana < 1 || aluno.diasTreinadosSemana >= 3)) return false;
      if (filtroStatus === 'inativo' && aluno.diasTreinadosSemana > 0) return false;
    }
    
    return true;
  }) || [];
  
  // Ordenar alunos
  const alunosOrdenados = [...alunosFiltrados].sort((a, b) => {
    switch (ordenacao) {
      case 'nome':
        return a.nome.localeCompare(b.nome);
      case 'dias':
        return b.diasTreinadosSemana - a.diasTreinadosSemana;
      case 'treinos':
        return b.treinosRealizadosSemana - a.treinosRealizadosSemana;
      case 'sequencia':
        return b.sequenciaAtual - a.sequenciaAtual;
      case 'ultimo-treino':
        if (!a.ultimoTreino) return 1;
        if (!b.ultimoTreino) return -1;
        return b.ultimoTreino.getTime() - a.ultimoTreino.getTime();
      default:
        return 0;
    }
  });
  
  // Calcular estatísticas gerais
  const totalAlunos = alunos?.length || 0;
  const alunosAtivos = alunos?.filter(a => a.diasTreinadosSemana >= 3).length || 0;
  const alunosInativos = alunos?.filter(a => a.diasTreinadosSemana === 0).length || 0;
  const taxaAtivacao = totalAlunos > 0 ? (alunosAtivos / totalAlunos) * 100 : 0;
  
  return (
    <div className="min-h-screen bg-gray-950 p-3 sm:p-6 pb-20 sm:pb-6">
      <PageHeader
        title="Progresso de Treinos"
        description="Acompanhe o desempenho e engajamento dos seus alunos"
      />
      
      <div className="space-y-4 sm:space-y-6">
        {/* Ranking de Destaques */}
        <RankingDestaquesCard alunos={ranking || []} isLoading={loadingRanking} />
        
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="border-gray-800 bg-gray-900/30 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-white">{totalAlunos}</div>
                <div className="text-xs sm:text-sm text-gray-400 truncate">Total de Alunos</div>
              </div>
            </div>
          </Card>
          
          <Card className="border-gray-800 bg-gray-900/30 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-green-600 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {alunosAtivos} ({taxaAtivacao.toFixed(0)}%)
                </div>
                <div className="text-xs sm:text-sm text-gray-400 truncate">Alunos Ativos</div>
              </div>
            </div>
          </Card>
          
          <Card className="border-gray-800 bg-gray-900/30 p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-white">
                  {alunosInativos} ({totalAlunos > 0 ? ((alunosInativos / totalAlunos) * 100).toFixed(0) : 0}%)
                </div>
                <div className="text-xs sm:text-sm text-gray-400 truncate">Alunos Inativos</div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Filtros e Busca */}
        <Card className="border-gray-800 bg-gray-900/30 p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar aluno..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white text-sm"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={filtroStatus} onValueChange={(v) => setFiltroStatus(v as FiltroStatus)}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white text-sm">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="muito-ativo">Muito Ativo (5+ dias)</SelectItem>
                  <SelectItem value="ativo">Ativo (3-4 dias)</SelectItem>
                  <SelectItem value="moderado">Moderado (1-2 dias)</SelectItem>
                  <SelectItem value="inativo">Inativo (0 dias)</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={ordenacao} onValueChange={(v) => setOrdenacao(v as OrdenacaoTipo)}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white text-sm">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nome">Nome (A-Z)</SelectItem>
                  <SelectItem value="dias">Dias Treinados</SelectItem>
                  <SelectItem value="treinos">Total de Treinos</SelectItem>
                  <SelectItem value="sequencia">Sequência Atual</SelectItem>
                  <SelectItem value="ultimo-treino">Último Treino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        
        {/* Lista de Alunos */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">
            Todos os Alunos ({alunosOrdenados.length})
          </h3>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : alunosOrdenados.length === 0 ? (
            <Card className="border-gray-800 bg-gray-900/30 p-6 sm:p-8">
              <div className="text-center text-gray-500">
                <Users className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm sm:text-base">Nenhum aluno encontrado</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {alunosOrdenados.map((aluno) => (
                <AlunoProgressoCard
                  key={aluno.alunoId}
                  aluno={aluno}
                  onVerDetalhes={() => setAlunoSelecionado(aluno)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Detalhes */}
      {alunoSelecionado && (
        <AlunoProgressoModal
          aluno={alunoSelecionado}
          onClose={() => setAlunoSelecionado(null)}
        />
      )}
    </div>
  );
}
