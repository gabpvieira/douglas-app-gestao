import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, Activity, Users, ChefHat, Filter, Search, LayoutGrid, List, Eye, Edit, Trash2, Copy, Utensils } from 'lucide-react';
import { PlanoAlimentarModal } from '@/components/PlanoAlimentarModal';
import { PlanosAlimentaresList } from '@/components/PlanosAlimentaresList';
import { PlanoDetalhesModal } from '@/components/PlanoDetalhesModal';
import { useAlunos } from '@/hooks/useAlunos';
import { useToast } from '@/hooks/use-toast';
import { usePlanosAlimentares, useCreatePlanoAlimentar, useUpdatePlanoAlimentar, useDeletePlanoAlimentar } from '@/hooks/usePlanosAlimentares';
import PageHeader from '@/components/PageHeader';

type ViewMode = 'grid' | 'list';

// Interfaces
export interface PlanoAlimentar {
  id: string;
  nome: string;
  descricao: string;
  objetivo: 'emagrecimento' | 'ganho_massa' | 'manutencao' | 'definicao';
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  refeicoes: Refeicao[];
  alunosAtribuidos: string[];
  criadoEm: string;
  atualizadoEm: string;
  ativo: boolean;
  categoria: 'basico' | 'intermediario' | 'avancado';
  restricoes: string[];
  observacoes?: string;
}

export interface Refeicao {
  id: string;
  nome: string;
  horario: string;
  alimentos: Alimento[];
  calorias: number;
  observacoes?: string;
}

export interface Alimento {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  categoria: string;
}

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  objetivo: string;
  ativo: boolean;
}

export default function PlanosAlimentares() {
  const { data: alunosSupabase = [], isLoading: loadingAlunos } = useAlunos();
  const { toast } = useToast();
  const createPlano = useCreatePlanoAlimentar();
  const updatePlano = useUpdatePlanoAlimentar();
  const deletePlano = useDeletePlanoAlimentar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetalhesModalOpen, setIsDetalhesModalOpen] = useState(false);
  const [planoEditando, setPlanoEditando] = useState<PlanoAlimentar | null>(null);
  const [planoDetalhes, setPlanoDetalhes] = useState<PlanoAlimentar | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroObjetivo, setFiltroObjetivo] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState('planos');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  
  // Buscar todos os planos (sem filtro de aluno)
  const { data: planosSupabase = [], isLoading: loadingPlanos, error: errorPlanos } = usePlanosAlimentares();
  
  // Log para debug
  console.log('📊 [Planos] Estado:', {
    planosCount: planosSupabase?.length,
    loadingPlanos,
    errorPlanos,
    alunosCount: alunosSupabase?.length,
    loadingAlunos
  });
  
  const alunos: Aluno[] = alunosSupabase.map(aluno => ({
    id: aluno.id,
    nome: aluno.nome,
    email: aluno.email,
    telefone: '',
    objetivo: '',
    ativo: aluno.status === 'ativo'
  }));
  
  const planosAdaptados: PlanoAlimentar[] = planosSupabase.map(plano => {
    // Se tiver dados estruturados, usar eles; senão, usar valores padrão
    const dadosJson = plano.dadosJson || {};
    
    // Usar refeições do banco se disponíveis, senão usar do dadosJson
    const refeicoes = plano.refeicoes || dadosJson.refeicoes || [];
    
    // Calcular macros totais das refeições (SEMPRE usar valores calculados)
    let totalCalorias = 0;
    let totalProteinas = 0;
    let totalCarboidratos = 0;
    let totalGorduras = 0;
    
    refeicoes.forEach((ref: any) => {
      if (ref.alimentos && Array.isArray(ref.alimentos)) {
        ref.alimentos.forEach((alim: any) => {
          totalCalorias += alim.calorias || 0;
          totalProteinas += alim.proteinas || 0;
          totalCarboidratos += alim.carboidratos || 0;
          totalGorduras += alim.gorduras || 0;
        });
      }
    });
    
    return {
      id: plano.id,
      nome: plano.titulo,
      descricao: dadosJson.descricao || plano.conteudoHtml?.substring(0, 150) + '...' || 'Sem descrição',
      objetivo: dadosJson.objetivo || 'manutencao' as const,
      // SEMPRE usar valores calculados das refeições, nunca os valores de meta
      calorias: Math.round(totalCalorias),
      proteinas: Math.round(totalProteinas),
      carboidratos: Math.round(totalCarboidratos),
      gorduras: Math.round(totalGorduras),
      categoria: dadosJson.categoria || 'basico' as const,
      restricoes: dadosJson.restricoes || [],
      observacoes: plano.observacoes,
      refeicoes: refeicoes,
      alunosAtribuidos: [plano.alunoId],
      criadoEm: plano.dataCriacao?.split('T')[0] || '',
      atualizadoEm: plano.updatedAt?.split('T')[0] || '',
      ativo: true
    };
  });

  const planos = planosAdaptados;

  const handleCriarPlano = () => {
    setPlanoEditando(null);
    setIsModalOpen(true);
  };

  const handleEditarPlano = (plano: PlanoAlimentar) => {
    setPlanoEditando(plano);
    setIsModalOpen(true);
  };

  const handleSalvarPlano = async (planoData: Omit<PlanoAlimentar, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    try {
      // Gerar conteúdo formatado em texto simples
      let conteudoTexto = `🎯 OBJETIVO: ${planoData.objetivo.replace('_', ' ').toUpperCase()}\n\n`;
      conteudoTexto += `📊 MACROS DIÁRIOS\n`;
      conteudoTexto += `Calorias: ${planoData.calorias} kcal\n`;
      conteudoTexto += `Proteínas: ${planoData.proteinas}g\n`;
      conteudoTexto += `Carboidratos: ${planoData.carboidratos}g\n`;
      conteudoTexto += `Gorduras: ${planoData.gorduras}g\n\n`;
      
      if (planoData.refeicoes && planoData.refeicoes.length > 0) {
        planoData.refeicoes.forEach(ref => {
          conteudoTexto += `${ref.nome.toUpperCase()} (${ref.horario} - ${Math.round(ref.calorias)} kcal)\n`;
          ref.alimentos.forEach(alimento => {
            conteudoTexto += `• ${alimento.quantidade}${alimento.unidade} de ${alimento.nome}\n`;
          });
          if (ref.observacoes) {
            conteudoTexto += `Obs: ${ref.observacoes}\n`;
          }
          conteudoTexto += `\n`;
        });
      } else {
        conteudoTexto += planoData.descricao || 'Plano alimentar sem refeições detalhadas.';
      }
      
      if (planoData.restricoes && planoData.restricoes.length > 0) {
        conteudoTexto += `\n⚠️ RESTRIÇÕES ALIMENTARES\n`;
        planoData.restricoes.forEach(restricao => {
          conteudoTexto += `• ${restricao}\n`;
        });
      }
      
      // Preparar dados estruturados para salvar no banco
      const dadosJson = {
        objetivo: planoData.objetivo,
        categoria: planoData.categoria,
        calorias: planoData.calorias,
        proteinas: planoData.proteinas,
        carboidratos: planoData.carboidratos,
        gorduras: planoData.gorduras,
        restricoes: planoData.restricoes,
        descricao: planoData.descricao
      };
      
      if (planoEditando) {
          console.log('📝 [Salvar] Enviando atualização:', {
          id: planoEditando.id,
          titulo: planoData.nome,
          conteudoHtml: conteudoTexto.substring(0, 100) + '...',
          observacoes: planoData.observacoes,
          dadosJson,
          refeicoesCount: planoData.refeicoes?.length || 0
        });
        
        await updatePlano.mutateAsync({
          id: planoEditando.id,
          data: {
            titulo: planoData.nome,
            conteudoHtml: conteudoTexto,
            observacoes: planoData.observacoes,
            dadosJson: dadosJson,
            refeicoes: planoData.refeicoes
          }
        });
        
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar atualizado com sucesso!',
        });
      } else {
        if (planoData.alunosAtribuidos.length === 0) {
          toast({
            title: 'Erro',
            description: 'Selecione pelo menos um aluno',
            variant: 'destructive'
          });
          return;
        }
        
        await createPlano.mutateAsync({
          alunoId: planoData.alunosAtribuidos[0],
          titulo: planoData.nome,
          conteudoHtml: conteudoTexto,
          observacoes: planoData.observacoes,
          dadosJson: dadosJson,
          refeicoes: planoData.refeicoes
        });
        
        toast({
          title: 'Sucesso',
          description: 'Plano alimentar criado com sucesso!',
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao salvar plano alimentar. Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const handleExcluirPlano = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;
    
    try {
      await deletePlano.mutateAsync(id);
    } catch (error) {
      console.error('Erro ao excluir plano:', error);
    }
  };

  const handleToggleAtivo = async (id: string) => {
    toast({
      title: 'Aviso',
      description: 'Toggle de status ainda não implementado',
      variant: 'destructive'
    });
  };

  const handleDuplicarPlano = async (plano: PlanoAlimentar) => {
    toast({
      title: 'Aviso',
      description: 'Duplicação de planos ainda não implementada',
      variant: 'destructive'
    });
  };

  const handleVerDetalhes = (plano: PlanoAlimentar) => {
    setPlanoDetalhes(plano);
    setIsDetalhesModalOpen(true);
  };

  const planosFiltrados = useMemo(() => {
    return planos?.filter(plano => {
      const matchSearch = plano.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plano.descricao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchObjetivo = filtroObjetivo === 'todos' || plano.objetivo === filtroObjetivo;
      const matchCategoria = filtroCategoria === 'todos' || plano.categoria === filtroCategoria;
      
      return matchSearch && matchObjetivo && matchCategoria;
    }) || [];
  }, [planos, searchTerm, filtroObjetivo, filtroCategoria]);

  const estatisticas = {
    totalPlanos: planos?.length || 0,
    planosAtivos: planos?.filter(p => p.ativo).length || 0,
    alunosComPlanos: new Set(planos?.flatMap(p => p.alunosAtribuidos) || []).size,
    mediaCaloriasPorPlano: Math.round((planos?.reduce((acc, p) => acc + p.calorias, 0) || 0) / (planos?.length || 1))
  };
  
  const loading = loadingAlunos || loadingPlanos;

  // Mostrar erro se houver
  if (errorPlanos) {
    console.error('❌ [Planos] Erro ao carregar:', errorPlanos);
  }

  const getObjetivoBadgeColor = (objetivo: string) => {
    if (objetivo === 'emagrecimento') return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (objetivo === 'ganho_massa') return 'bg-green-500/10 text-green-500 border-green-500/20';
    if (objetivo === 'definicao') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const getObjetivoLabel = (objetivo: string) => {
    if (objetivo === 'emagrecimento') return 'Emagrecimento';
    if (objetivo === 'ganho_massa') return 'Ganho de Massa';
    if (objetivo === 'definicao') return 'Definição';
    if (objetivo === 'manutencao') return 'Manutenção';
    return objetivo;
  };

  return (
    <div className="min-h-screen bg-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        {errorPlanos && (
          <Card className="border-red-800 bg-red-900/20">
            <CardContent className="p-4">
              <p className="text-red-400">Erro ao carregar planos: {errorPlanos.message}</p>
            </CardContent>
          </Card>
        )}
        <PageHeader
          title="Planos Alimentares"
          description="Gerencie e crie planos alimentares para seus alunos"
          actions={
            <div className="flex items-center gap-2">
              {/* Toggle View Mode */}
              <div className="flex items-center gap-1 border border-gray-700 rounded-lg p-1 bg-gray-800/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={`h-7 sm:h-8 px-2 sm:px-3 ${
                    viewMode === 'grid'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={`h-7 sm:h-8 px-2 sm:px-3 ${
                    viewMode === 'list'
                      ? 'bg-gray-700 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
              
              <Button 
                onClick={handleCriarPlano}
                data-testid="button-add-plano"
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Novo Plano</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </div>
          }
        />

        {/* Stats Cards - Compact Design */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total de Planos */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <ChefHat className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Total de Planos</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{estatisticas.totalPlanos}</p>
                <p className="text-[10px] text-gray-500">{estatisticas.planosAtivos} ativos</p>
              </div>
            </div>
          </div>

          {/* Planos Ativos */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Planos Ativos</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{estatisticas.planosAtivos}</p>
                <p className="text-[10px] text-gray-500">em uso</p>
              </div>
            </div>
          </div>

          {/* Alunos com Planos */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Alunos com Planos</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{estatisticas.alunosComPlanos}</p>
                <p className="text-[10px] text-gray-500">alunos ativos</p>
              </div>
            </div>
          </div>

          {/* Média Calorias */}
          <div className="rounded-lg bg-gray-900/50 border border-gray-800/50 p-3 sm:p-4 hover:bg-gray-900/70 transition-colors">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-gray-400" strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Média Calorias</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{estatisticas.mediaCaloriasPorPlano}</p>
                <p className="text-[10px] text-gray-500">kcal/dia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros - Redesenhados */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur shadow-lg">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/80 border-gray-700 text-white placeholder:text-gray-500 text-sm h-11 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  data-testid="input-search-planos"
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                <Select value={filtroObjetivo} onValueChange={setFiltroObjetivo}>
                  <SelectTrigger className="bg-gray-800/80 border-gray-700 text-white text-sm h-11 min-w-[140px] hover:bg-gray-800 transition-colors">
                    <Target className="w-4 h-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Objetivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="todos" className="text-white hover:bg-gray-700">Todos Objetivos</SelectItem>
                    <SelectItem value="emagrecimento" className="text-white hover:bg-gray-700">Emagrecimento</SelectItem>
                    <SelectItem value="ganho_massa" className="text-white hover:bg-gray-700">Ganho de Massa</SelectItem>
                    <SelectItem value="manutencao" className="text-white hover:bg-gray-700">Manutenção</SelectItem>
                    <SelectItem value="definicao" className="text-white hover:bg-gray-700">Definição</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="bg-gray-800/80 border-gray-700 text-white text-sm h-11 min-w-[140px] hover:bg-gray-800 transition-colors">
                    <Filter className="w-4 h-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="todos" className="text-white hover:bg-gray-700">Todas Categorias</SelectItem>
                    <SelectItem value="basico" className="text-white hover:bg-gray-700">Básico</SelectItem>
                    <SelectItem value="intermediario" className="text-white hover:bg-gray-700">Intermediário</SelectItem>
                    <SelectItem value="avancado" className="text-white hover:bg-gray-700">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs - Redesenhadas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-3 bg-transparent border-0 p-0">
            <TabsTrigger 
              value="planos" 
              className="flex items-center justify-center gap-2 text-sm py-3 px-4 data-[state=active]:bg-blue-600 data-[state=inactive]:bg-gray-800/50 data-[state=inactive]:text-gray-400 data-[state=active]:text-white rounded-lg border border-gray-700 data-[state=active]:border-blue-500 transition-all hover:bg-gray-800/70"
            >
              <ChefHat className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold">Planos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="alunos" 
              className="flex items-center justify-center gap-2 text-sm py-3 px-4 data-[state=active]:bg-purple-600 data-[state=inactive]:bg-gray-800/50 data-[state=inactive]:text-gray-400 data-[state=active]:text-white rounded-lg border border-gray-700 data-[state=active]:border-purple-500 transition-all hover:bg-gray-800/70"
            >
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="font-semibold">Alunos</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="planos" className="space-y-3 sm:space-y-4 mt-6 sm:mt-4">
            {loading ? (
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
                <CardContent className="py-12 text-center">
                  <p className="text-gray-400 text-sm">Carregando planos...</p>
                </CardContent>
              </Card>
            ) : planosFiltrados.length === 0 ? (
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
                <CardContent className="py-12 text-center p-6">
                  <ChefHat className="h-12 w-12 mx-auto text-gray-600 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {searchTerm ? 'Nenhum plano encontrado' : 'Nenhum plano cadastrado'}
                  </h3>
                  <p className="text-gray-400 mb-4 text-sm">
                    {searchTerm 
                      ? 'Tente buscar por outro termo.'
                      : 'Comece criando o primeiro plano alimentar.'
                    }
                  </p>
                  {!searchTerm && (
                    <Button 
                      onClick={handleCriarPlano}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid="button-add-first-plano"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Plano
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === 'list' ? (
              /* VISUALIZAÇÃO EM LISTA */
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-800">
                    {planosFiltrados.map((plano) => (
                      <div
                        key={plano.id}
                        className="p-3 sm:p-4 hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                          {/* Nome e Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <ChefHat className="h-4 w-4 text-blue-500 flex-shrink-0" />
                              <h3 className="font-semibold text-white truncate">{plano.nome}</h3>
                              {!plano.ativo && (
                                <Badge variant="outline" className="border-gray-700 text-gray-500 text-xs">
                                  Inativo
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-2">
                              <Badge variant="outline" className={`${getObjetivoBadgeColor(plano.objetivo)} text-xs`}>
                                {getObjetivoLabel(plano.objetivo)}
                              </Badge>
                              <span className="flex items-center gap-1">
                                <Activity className="h-3 w-3" />
                                {plano.calorias} kcal
                              </span>
                              <span className="flex items-center gap-1">
                                <Utensils className="h-3 w-3" />
                                {plano.refeicoes?.length || 0} refeições
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1">{plano.descricao}</p>
                          </div>

                          {/* Macros */}
                          <div className="grid grid-cols-3 gap-3 sm:flex sm:items-center sm:gap-4">
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Proteínas</p>
                              <p className="text-sm font-semibold text-green-400">{plano.proteinas}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Carbos</p>
                              <p className="text-sm font-semibold text-blue-400">{plano.carboidratos}g</p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500 mb-1">Gorduras</p>
                              <p className="text-sm font-semibold text-yellow-400">{plano.gorduras}g</p>
                            </div>
                          </div>

                          {/* Ações */}
                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-initial border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                              onClick={() => handleVerDetalhes(plano)}
                            >
                              <Eye className="h-3.5 w-3.5 sm:mr-2" />
                              <span className="hidden sm:inline">Ver</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-initial border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                              onClick={() => handleEditarPlano(plano)}
                            >
                              <Edit className="h-3.5 w-3.5 sm:mr-2" />
                              <span className="hidden sm:inline">Editar</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 sm:flex-initial border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
                              onClick={() => handleDuplicarPlano(plano)}
                            >
                              <Copy className="h-3.5 w-3.5 sm:mr-2" />
                              <span className="hidden sm:inline">Duplicar</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-700 bg-gray-800/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-xs"
                              onClick={() => handleExcluirPlano(plano.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* VISUALIZAÇÃO EM GRID COMPACTO */
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {planosFiltrados.map((plano) => (
                  <Card 
                    key={plano.id} 
                    className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all"
                  >
                    <CardHeader className="p-3 pb-2">
                      <div className="space-y-1">
                        <CardTitle className="text-sm flex items-center gap-1.5 text-white leading-tight">
                          <ChefHat className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{plano.nome}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                          <Badge variant="outline" className={`${getObjetivoBadgeColor(plano.objetivo)} text-[10px] px-1.5 py-0 h-5`}>
                            {getObjetivoLabel(plano.objetivo)}
                          </Badge>
                          {!plano.ativo && (
                            <Badge variant="outline" className="border-gray-700 text-gray-500 text-[10px] px-1.5 py-0 h-5">
                              Inativo
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2.5 p-3 pt-0">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Calorias</span>
                          <span className="font-semibold text-white">{plano.calorias} kcal</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-800/50 rounded p-1.5">
                            <p className="text-[10px] text-gray-500 mb-0.5">Prot</p>
                            <p className="text-xs font-semibold text-green-400">{plano.proteinas}g</p>
                          </div>
                          <div className="bg-gray-800/50 rounded p-1.5">
                            <p className="text-[10px] text-gray-500 mb-0.5">Carb</p>
                            <p className="text-xs font-semibold text-blue-400">{plano.carboidratos}g</p>
                          </div>
                          <div className="bg-gray-800/50 rounded p-1.5">
                            <p className="text-[10px] text-gray-500 mb-0.5">Gord</p>
                            <p className="text-xs font-semibold text-yellow-400">{plano.gorduras}g</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Utensils className="h-3 w-3 flex-shrink-0" />
                          <span>{plano.refeicoes?.length || 0} refeições</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-800 space-y-1.5">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-7 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-[10px]"
                          onClick={() => handleVerDetalhes(plano)}
                        >
                          <Eye className="h-3 w-3 mr-1.5" />
                          Ver Detalhes
                        </Button>
                        <div className="grid grid-cols-2 gap-1.5">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-[10px]"
                            onClick={() => handleEditarPlano(plano)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 border-gray-700 bg-gray-800/50 text-gray-300 hover:bg-gray-800 hover:text-white text-[10px]"
                            onClick={() => handleDuplicarPlano(plano)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Duplicar
                          </Button>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full h-7 border-gray-700 bg-gray-800/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-[10px]"
                          onClick={() => handleExcluirPlano(plano.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1.5" />
                          Excluir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="alunos" className="space-y-3 sm:space-y-4 mt-6 sm:mt-4">
            {loading ? (
              <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
                <CardContent className="py-8">
                  <div className="text-center text-gray-500 text-sm">
                    Carregando alunos...
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {alunos?.map((aluno) => {
                  const planosDoAluno = planos?.filter(p => p.alunosAtribuidos?.includes(aluno.id)) || [];
                  return (
                    <Card key={aluno.id} className="border-gray-700 bg-gray-800/30 hover:bg-gray-800/50 transition-colors">
                      <CardHeader className="p-3 sm:p-4">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base sm:text-lg text-white truncate">{aluno.nome}</CardTitle>
                            <CardDescription className="text-xs sm:text-sm text-gray-400 truncate">{aluno.email}</CardDescription>
                          </div>
                          <Badge variant={aluno.ativo ? "default" : "secondary"} className="text-[10px] sm:text-xs flex-shrink-0">
                            {aluno.ativo ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-3 sm:p-4 pt-0">
                        <div className="space-y-2">
                          <p className="text-xs sm:text-sm text-gray-400">
                            <strong className="text-gray-300">Planos:</strong> {planosDoAluno.length}
                          </p>
                          {planosDoAluno.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {planosDoAluno.map(plano => (
                                <Badge key={plano.id} variant="outline" className="text-[10px] border-gray-600 text-gray-300">
                                  {plano.nome}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <PlanoAlimentarModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSalvarPlano}
          plano={planoEditando}
          alunos={alunos}
        />

        <PlanoDetalhesModal
          isOpen={isDetalhesModalOpen}
          onClose={() => setIsDetalhesModalOpen(false)}
          plano={planoDetalhes}
          alunos={alunos}
        />
      </div>
    </div>
  );
}
