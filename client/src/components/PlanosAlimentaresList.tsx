import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users, 
  Calendar, 
  Target, 
  Activity,
  Eye,
  Copy,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { PlanoAlimentar, Aluno } from '@/pages/PlanosAlimentares';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PlanosAlimentaresListProps {
  planos: PlanoAlimentar[];
  alunos: Aluno[];
  onEdit: (plano: PlanoAlimentar) => void;
  onDelete: (id: string) => void;
  onDuplicate: (plano: PlanoAlimentar) => void;
  onToggleStatus: (id: string) => void;
  onViewDetails: (plano: PlanoAlimentar) => void;
}

export function PlanosAlimentaresList({ 
  planos, 
  alunos, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onToggleStatus,
  onViewDetails 
}: PlanosAlimentaresListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroObjetivo, setFiltroObjetivo] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const planosFiltrados = planos.filter(plano => {
    const matchSearch = plano.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       plano.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchObjetivo = !filtroObjetivo || plano.objetivo === filtroObjetivo;
    const matchCategoria = !filtroCategoria || plano.categoria === filtroCategoria;
    const matchStatus = !filtroStatus || 
                       (filtroStatus === 'ativo' && plano.ativo) ||
                       (filtroStatus === 'inativo' && !plano.ativo);

    return matchSearch && matchObjetivo && matchCategoria && matchStatus;
  });

  const getObjetivoColor = (objetivo: PlanoAlimentar['objetivo']) => {
    const colors = {
      emagrecimento: 'bg-red-100 text-red-800',
      ganho_massa: 'bg-green-100 text-green-800',
      manutencao: 'bg-blue-100 text-blue-800',
      definicao: 'bg-purple-100 text-purple-800'
    };
    return colors[objetivo];
  };

  const getCategoriaColor = (categoria: PlanoAlimentar['categoria']) => {
    const colors = {
      basico: 'bg-gray-100 text-gray-800',
      intermediario: 'bg-yellow-100 text-yellow-800',
      avancado: 'bg-orange-100 text-orange-800'
    };
    return colors[categoria];
  };

  const getAlunosAtribuidos = (alunosIds: string[]) => {
    return alunos.filter(aluno => alunosIds.includes(aluno.id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFiltroObjetivo('');
    setFiltroCategoria('');
    setFiltroStatus('');
  };

  return (
    <div className="space-y-6">
      {/* Barra de Pesquisa e Filtros */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar planos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {(filtroObjetivo || filtroCategoria || filtroStatus) && (
              <Badge variant="secondary" className="ml-2">
                {[filtroObjetivo, filtroCategoria, filtroStatus].filter(Boolean).length}
              </Badge>
            )}
          </Button>
        </div>

        {showFilters && (
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Objetivo</label>
                  <select
                    value={filtroObjetivo}
                    onChange={(e) => setFiltroObjetivo(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="emagrecimento">Emagrecimento</option>
                    <option value="ganho_massa">Ganho de Massa</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="definicao">Definição</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Categoria</label>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todas</option>
                    <option value="basico">Básico</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Todos</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Lista de Planos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {planosFiltrados.map((plano) => {
          const alunosAtribuidos = getAlunosAtribuidos(plano.alunosAtribuidos);
          
          return (
            <Card key={plano.id} className={`hover:shadow-lg transition-shadow ${!plano.ativo ? 'opacity-75' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {plano.nome}
                      {plano.ativo ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {plano.descricao}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewDetails(plano)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(plano)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(plano)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(plano.id)}>
                        {plano.ativo ? (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => onDelete(plano.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Badges de Objetivo e Categoria */}
                <div className="flex gap-2">
                  <Badge className={getObjetivoColor(plano.objetivo)}>
                    {plano.objetivo.replace('_', ' ')}
                  </Badge>
                  <Badge className={getCategoriaColor(plano.categoria)}>
                    {plano.categoria}
                  </Badge>
                </div>

                {/* Informações Nutricionais */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-600">Calorias</p>
                    <p className="font-semibold">{plano.calorias} kcal</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">Refeições</p>
                    <p className="font-semibold">{plano.refeicoes.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">Proteínas</p>
                    <p className="font-semibold">{plano.proteinas}g</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-600">Carboidratos</p>
                    <p className="font-semibold">{plano.carboidratos}g</p>
                  </div>
                </div>

                {/* Restrições */}
                {plano.restricoes.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Restrições:</p>
                    <div className="flex flex-wrap gap-1">
                      {plano.restricoes.slice(0, 3).map((restricao, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {restricao}
                        </Badge>
                      ))}
                      {plano.restricoes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{plano.restricoes.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Alunos Atribuídos */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {alunosAtribuidos.length} aluno{alunosAtribuidos.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">
                      {formatDate(plano.criadoEm)}
                    </span>
                  </div>
                </div>

                {/* Alunos Atribuídos - Nomes */}
                {alunosAtribuidos.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Atribuído para:</p>
                    <div className="flex flex-wrap gap-1">
                      {alunosAtribuidos.slice(0, 2).map((aluno) => (
                        <Badge key={aluno.id} variant="secondary" className="text-xs">
                          {aluno.nome.split(' ')[0]}
                        </Badge>
                      ))}
                      {alunosAtribuidos.length > 2 && (
                        <Badge variant="secondary" className="text-xs">
                          +{alunosAtribuidos.length - 2}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Botões de Ação Rápida */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(plano)}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(plano)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mensagem quando não há resultados */}
      {planosFiltrados.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum plano encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filtroObjetivo || filtroCategoria || filtroStatus
                ? 'Tente ajustar os filtros para encontrar planos.'
                : 'Comece criando seu primeiro plano alimentar.'}
            </p>
            {(searchTerm || filtroObjetivo || filtroCategoria || filtroStatus) && (
              <Button variant="outline" onClick={clearFilters}>
                Limpar Filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}