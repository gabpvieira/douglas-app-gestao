import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, Activity, Users, ChefHat, Filter, Search } from 'lucide-react';
import { PlanoAlimentarModal } from '@/components/PlanoAlimentarModal';
import { PlanosAlimentaresList } from '@/components/PlanosAlimentaresList';
import { PlanoDetalhesModal } from '@/components/PlanoDetalhesModal';
import { useAlunos } from '@/hooks/useAlunos';
import { useToast } from '@/hooks/use-toast';
import { usePlanosAlimentares, useCreatePlanoAlimentar, useUpdatePlanoAlimentar, useDeletePlanoAlimentar } from '@/hooks/usePlanosAlimentares';
import PageHeader from '@/components/PageHeader';

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
    
    // Calcular macros totais das refeições
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
      calorias: totalCalorias > 0 ? Math.round(totalCalorias) : (dadosJson.calorias || 2000),
      proteinas: totalProteinas > 0 ? Math.round(totalProteinas) : (dadosJson.proteinas || 150),
      carboidratos: totalCarboidratos > 0 ? Math.round(totalCarboidratos) : (dadosJson.carboidratos || 250),
      gorduras: totalGorduras > 0 ? Math.round(totalGorduras) : (dadosJson.gorduras || 70),
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

  const planosFiltrados = planos?.filter(plano => {
    const matchSearch = plano.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       plano.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchObjetivo = filtroObjetivo === 'todos' || plano.objetivo === filtroObjetivo;
    const matchCategoria = filtroCategoria === 'todos' || plano.categoria === filtroCategoria;
    
    return matchSearch && matchObjetivo && matchCategoria;
  }) || [];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-3 sm:p-6">
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
            <Button 
              onClick={handleCriarPlano}
              data-testid="button-add-plano"
              className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Novo Plano</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Total de Planos</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{estatisticas.totalPlanos}</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600">
                <ChefHat className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Planos Ativos</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{estatisticas.planosAtivos}</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600">
                <Target className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Alunos com Planos</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{estatisticas.alunosComPlanos}</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-600">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="p-3 sm:p-6 border-gray-800 bg-gray-900/50 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-400">Média Calorias</p>
                <p className="text-lg sm:text-2xl font-bold text-white mt-1">{estatisticas.mediaCaloriasPorPlano}</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600">
                <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-3 h-3 sm:w-4 sm:h-4" />
                <Input
                  placeholder="Buscar planos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 sm:pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 text-xs sm:text-sm"
                  data-testid="input-search-planos"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Select value={filtroObjetivo} onValueChange={setFiltroObjetivo}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-xs sm:text-sm">
                    <SelectValue placeholder="Objetivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="todos" className="text-white hover:bg-gray-700">Todos</SelectItem>
                    <SelectItem value="emagrecimento" className="text-white hover:bg-gray-700">Emagrecimento</SelectItem>
                    <SelectItem value="ganho_massa" className="text-white hover:bg-gray-700">Ganho de Massa</SelectItem>
                    <SelectItem value="manutencao" className="text-white hover:bg-gray-700">Manutenção</SelectItem>
                    <SelectItem value="definicao" className="text-white hover:bg-gray-700">Definição</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white text-xs sm:text-sm">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="todos" className="text-white hover:bg-gray-700">Todas</SelectItem>
                    <SelectItem value="basico" className="text-white hover:bg-gray-700">Básico</SelectItem>
                    <SelectItem value="intermediario" className="text-white hover:bg-gray-700">Intermediário</SelectItem>
                    <SelectItem value="avancado" className="text-white hover:bg-gray-700">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 gap-2 bg-gray-800 border-gray-700 p-1 sm:p-1.5">
            <TabsTrigger 
              value="planos" 
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 data-[state=active]:bg-gray-700 rounded-md"
            >
              <ChefHat className="h-4 w-4 flex-shrink-0" />
              <span>Planos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="alunos" 
              className="flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 px-2 sm:px-3 data-[state=active]:bg-gray-700 rounded-md"
            >
              <Users className="h-4 w-4 flex-shrink-0" />
              <span>Alunos</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="planos" className="space-y-3 sm:space-y-4 mt-6 sm:mt-4">
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl text-white">
                  Lista de Planos ({planosFiltrados.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Carregando planos...</p>
                  </div>
                ) : planosFiltrados.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">
                      {searchTerm ? 'Nenhum plano encontrado.' : 'Nenhum plano cadastrado.'}
                    </p>
                    {!searchTerm && (
                      <Button 
                        onClick={handleCriarPlano}
                        className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                        data-testid="button-add-first-plano"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Plano
                      </Button>
                    )}
                  </div>
                ) : (
                  <PlanosAlimentaresList
                    planos={planosFiltrados}
                    alunos={alunos}
                    onEdit={handleEditarPlano}
                    onDelete={handleExcluirPlano}
                    onToggleStatus={handleToggleAtivo}
                    onDuplicate={handleDuplicarPlano}
                    onViewDetails={handleVerDetalhes}
                  />
                )}
              </CardContent>
            </Card>
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
