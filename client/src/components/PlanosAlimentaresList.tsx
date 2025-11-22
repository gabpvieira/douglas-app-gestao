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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {planosFiltrados.map((plano) => {
          const alunosAtribuidos = getAlunosAtribuidos(plano.alunosAtribuidos);
          
          return (
            <Card 
              key={plano.id} 
              className={`border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-900/70 transition-all ${!plano.ativo ? 'opacity-60' : ''}`}
            >
              <CardContent className="p-4 space-y-3">
                {/* Header com título e menu */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white truncate flex items-center gap-2">
                      {plano.nome}
                      {plano.ativo && (
                        <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {plano.descricao}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-800">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                      <DropdownMenuLabel className="text-gray-300">Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem onClick={() => onViewDetails(plano)} className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(plano)} className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDuplicate(plano)} className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700">
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onToggleStatus(plano.id)} className="text-gray-300 hover:bg-gray-700 focus:bg-gray-700">
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
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem 
                        onClick={() => onDelete(plano.id)}
                        className="text-red-400 hover:bg-gray-700 focus:bg-gray-700 focus:text-red-400"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Badges compactas */}
                <div className="flex gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-blue-500/30 bg-blue-500/10 text-blue-400">
                    {plano.objetivo.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5 border-purple-500/30 bg-purple-500/10 text-purple-400">
                    {plano.categoria}
                  </Badge>
                </div>

                {/* Macros em grid compacto */}
                <div className="grid grid-cols-4 gap-2 py-2 border-y border-gray-800">
                  <div className="text-center">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Calorias</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{plano.calorias}</p>
                  </div>
                  <div className="text-center border-l border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Refeições</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{plano.refeicoes.length}</p>
                  </div>
                  <div className="text-center border-l border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Proteínas</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{plano.proteinas}g</p>
                  </div>
                  <div className="text-center border-l border-gray-800">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Carbos</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{plano.carboidratos}g</p>
                  </div>
                </div>

                {/* Footer com aluno e data */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>
                      {alunosAtribuidos.length > 0 
                        ? alunosAtribuidos[0].nome.split(' ')[0]
                        : '1 aluno'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>{formatDate(plano.criadoEm)}</span>
                  </div>
                </div>

                {/* Botões de ação */}
                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewDetails(plano)}
                    className="flex-1 h-8 text-xs bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1.5" />
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(plano)}
                    className="flex-1 h-8 text-xs bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1.5" />
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