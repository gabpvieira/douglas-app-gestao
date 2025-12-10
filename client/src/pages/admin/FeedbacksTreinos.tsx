import { useState, useMemo } from "react";
import { Star, Trash2, Filter, Calendar, User, Search, MessageSquare, TrendingUp, LayoutGrid, List } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useFeedbacksAdmin, useDeleteFeedback } from "@/hooks/useFeedbackTreinos";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

type ViewMode = 'grid' | 'list';

export default function FeedbacksTreinos() {
  const { data: feedbacks = [], isLoading } = useFeedbacksAdmin();
  const deleteFeedback = useDeleteFeedback();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstrelas, setFilterEstrelas] = useState<string>("all");
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [feedbackParaDeletar, setFeedbackParaDeletar] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Filtrar feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks.filter((feedback: any) => {
      const matchSearch = feedback.aluno_nome
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchEstrelas =
        filterEstrelas === "all" ||
        feedback.estrelas === parseInt(filterEstrelas);

      return matchSearch && matchEstrelas;
    });
  }, [feedbacks, searchTerm, filterEstrelas]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = feedbacks.length;
    const mediaEstrelas =
      total > 0
        ? feedbacks.reduce((acc: number, f: any) => acc + f.estrelas, 0) / total
        : 0;
    
    const distribuicao = [1, 2, 3, 4, 5].map((estrela) => ({
      estrela,
      count: feedbacks.filter((f: any) => f.estrelas === estrela).length,
    }));

    return { total, mediaEstrelas, distribuicao };
  }, [feedbacks]);

  const handleDelete = (feedback: any) => {
    setFeedbackParaDeletar(feedback);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (feedbackParaDeletar) {
      deleteFeedback.mutate(feedbackParaDeletar.id);
    }
    setFeedbackParaDeletar(null);
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "w-4 h-4",
              star <= count
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-950 p-3 sm:p-6">
      <div className="w-full space-y-4 sm:space-y-6">
        <PageHeader
          title="Feedbacks de Treinos"
          description="Visualize e gerencie os feedbacks dos alunos sobre seus treinos"
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
            </div>
          }
        />

        {/* Estatísticas */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3">
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-xs font-medium text-gray-400">
                Total de Feedbacks
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-xs font-medium text-gray-400">
                Média de Avaliação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center gap-2">
                <div className="text-2xl sm:text-3xl font-bold text-white">
                  {stats.mediaEstrelas.toFixed(1)}
                </div>
                <Star className="w-5 h-5 sm:w-6 sm:h-6 fill-yellow-400 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur col-span-2 sm:col-span-1">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-xs font-medium text-gray-400">
                Distribuição
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-1">
                {stats.distribuicao.reverse().map(({ estrela, count }) => (
                  <div key={estrela} className="flex items-center gap-2 text-xs">
                    <span className="w-3 text-gray-300">{estrela}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400"
                        style={{
                          width: `${stats.total > 0 ? (count / stats.total) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-400 w-8 text-right">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    placeholder="Buscar por aluno..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                </div>
              </div>
              <Select value={filterEstrelas} onValueChange={setFilterEstrelas}>
                <SelectTrigger className="w-full sm:w-[200px] bg-gray-800 border-gray-700 text-white">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estrelas" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">Todas as avaliações</SelectItem>
                  <SelectItem value="5">5 estrelas</SelectItem>
                  <SelectItem value="4">4 estrelas</SelectItem>
                  <SelectItem value="3">3 estrelas</SelectItem>
                  <SelectItem value="2">2 estrelas</SelectItem>
                  <SelectItem value="1">1 estrela</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || filterEstrelas !== "all") && (
              <p className="text-xs text-gray-400 mt-2">
                {filteredFeedbacks.length} {filteredFeedbacks.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Feedbacks */}
        {isLoading ? (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 text-sm">Carregando feedbacks...</p>
            </CardContent>
          </Card>
        ) : filteredFeedbacks.length > 0 ? (
          viewMode === 'list' ? (
            /* VISUALIZAÇÃO EM LISTA */
            <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
              <CardContent className="p-0">
                <div className="divide-y divide-gray-800">
                  {filteredFeedbacks.map((feedback: any) => (
                    <div
                      key={feedback.id}
                      className="p-3 sm:p-4 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        {/* Aluno e Avaliação */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <h3 className="font-semibold text-white truncate">{feedback.aluno_nome}</h3>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mb-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(feedback.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(feedback.estrelas)}
                              <span className="ml-1">({feedback.estrelas})</span>
                            </div>
                          </div>
                          {feedback.comentario && (
                            <div className="flex items-start gap-2 mt-2 p-2 bg-gray-800/50 rounded-lg">
                              <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-gray-300 line-clamp-2">{feedback.comentario}</p>
                            </div>
                          )}
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-gray-700 bg-gray-800/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-xs"
                            onClick={() => handleDelete(feedback)}
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Excluir</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            /* VISUALIZAÇÃO EM GRID */
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredFeedbacks.map((feedback: any) => (
                <Card 
                  key={feedback.id} 
                  className="border-gray-800 bg-gray-900/50 backdrop-blur hover:bg-gray-800/50 transition-all"
                >
                  <CardHeader className="p-3 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-sm flex items-center gap-1.5 text-white leading-tight">
                        <User className="h-3.5 w-3.5 flex-shrink-0" />
                        <span className="truncate">{feedback.aluno_nome}</span>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                        <Calendar className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {format(new Date(feedback.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2.5 p-3 pt-0">
                    {/* Avaliação */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-800">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-yellow-500" />
                          <span className="text-xs font-medium text-gray-300">Avaliação</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {renderStars(feedback.estrelas)}
                          <span className="text-xs text-gray-400 ml-1">({feedback.estrelas})</span>
                        </div>
                      </div>
                    </div>

                    {/* Comentário */}
                    {feedback.comentario && (
                      <div className="pt-2 border-t border-gray-800">
                        <div className="flex items-start gap-1.5 mb-1">
                          <MessageSquare className="h-3.5 w-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span className="text-xs font-medium text-gray-300">Comentário</span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-3 pl-5">{feedback.comentario}</p>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="pt-2 border-t border-gray-800">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-7 border-gray-700 bg-gray-800/50 text-red-400 hover:bg-red-900/20 hover:text-red-300 text-[10px]"
                        onClick={() => handleDelete(feedback)}
                      >
                        <Trash2 className="h-3 w-3 mr-1.5" />
                        Excluir Feedback
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card className="border-gray-800 bg-gray-900/50 backdrop-blur">
            <CardContent className="py-12 text-center p-6">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-white">
                {searchTerm || filterEstrelas !== "all" ? 'Nenhum feedback encontrado' : 'Nenhum feedback recebido'}
              </h3>
              <p className="text-gray-400 text-sm">
                {searchTerm || filterEstrelas !== "all"
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Os feedbacks dos alunos aparecerão aqui quando eles avaliarem seus treinos.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Dialog de Confirmação de Exclusão */}
        <ConfirmDialog
          open={confirmDeleteOpen}
          onOpenChange={setConfirmDeleteOpen}
          onConfirm={confirmDelete}
          title="Excluir Feedback"
          description={
            feedbackParaDeletar
              ? `Tem certeza que deseja excluir o feedback de ${feedbackParaDeletar.aluno_nome}? Esta ação não pode ser desfeita.`
              : ''
          }
          confirmText="Excluir"
          cancelText="Cancelar"
          variant="destructive"
        />
      </div>
    </div>
  );
}
