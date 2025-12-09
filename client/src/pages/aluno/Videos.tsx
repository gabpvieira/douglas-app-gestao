import { useState } from "react";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAlunoProfile, useAlunoFichas } from "@/hooks/useAlunoData";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Video,
  Loader2,
  Search,
  Play,
  Clock,
  Filter,
  Dumbbell,
} from "lucide-react";

export default function VideosAluno() {
  const { data: profile, isLoading: loadingProfile } = useAlunoProfile();
  const alunoId = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]?.id
    : profile?.alunos?.id;

  const { data: fichas, isLoading: loadingFichas } = useAlunoFichas(alunoId);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrupo, setSelectedGrupo] = useState<string>("todos");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

  // Buscar vídeos dos exercícios das fichas do aluno
  const { data: videos, isLoading: loadingVideos } = useQuery({
    queryKey: ["videos-aluno", alunoId],
    queryFn: async () => {
      if (!alunoId || !fichas || fichas.length === 0) return [];

      // Coletar todos os IDs de exercícios das fichas ativas
      const exercicioIds = new Set<string>();
      fichas.forEach((ficha) => {
        if (ficha.status === "ativo" && ficha.fichas_treino?.exercicios_ficha) {
          ficha.fichas_treino.exercicios_ficha.forEach((ex: any) => {
            if (ex.video_id) {
              exercicioIds.add(ex.video_id);
            }
          });
        }
      });

      if (exercicioIds.size === 0) return [];

      // Buscar os vídeos correspondentes
      const { data, error } = await supabase
        .from("treinos_video")
        .select("*")
        .in("id", Array.from(exercicioIds))
        .order("nome", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!alunoId && !!fichas,
  });

  const gruposMusculares = [
    "todos",
    "peito",
    "costas",
    "pernas",
    "ombros",
    "bíceps",
    "tríceps",
    "abdômen",
  ];

  const filteredVideos = videos?.filter((video) => {
    const matchesSearch = video.nome
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGrupo =
      selectedGrupo === "todos" ||
      video.objetivo?.toLowerCase() === selectedGrupo;
    return matchesSearch && matchesGrupo;
  });

  const getGrupoColor = (grupo: string) => {
    const cores: Record<string, string> = {
      peito: "bg-red-500/10 text-red-400",
      costas: "bg-blue-500/10 text-blue-400",
      pernas: "bg-green-500/10 text-green-400",
      ombros: "bg-yellow-500/10 text-yellow-400",
      bíceps: "bg-purple-500/10 text-purple-400",
      tríceps: "bg-pink-500/10 text-pink-400",
      abdômen: "bg-orange-500/10 text-orange-400",
    };
    return cores[grupo?.toLowerCase()] || "bg-gray-500/10 text-gray-400";
  };

  // Contar vídeos por objetivo (grupo muscular)
  const videosPorGrupo = videos?.reduce((acc: Record<string, number>, video) => {
    const grupo = video.objetivo?.toLowerCase() || "outros";
    acc[grupo] = (acc[grupo] || 0) + 1;
    return acc;
  }, {});

  if (loadingProfile || loadingFichas || loadingVideos) {
    return (
      <AlunoLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      </AlunoLayout>
    );
  }

  return (
    <AlunoLayout>
      <div className="min-h-screen bg-gray-950 p-3 sm:p-6 pt-3 md:pt-6 pb-20">
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-white mb-1">
              Vídeos dos Meus Treinos
            </h1>
            <p className="text-sm text-gray-400">
              Vídeos dos exercícios das suas fichas ativas
            </p>
          </div>

          {/* KPIs - Layout 2x2 Mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <Video className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 truncate">Total</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">{videos?.length || 0}</p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">vídeos</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <Dumbbell className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 truncate">Fichas</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">
                    {fichas?.filter((f) => f.status === "ativo").length || 0}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">ativas</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <Filter className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 truncate">Filtrados</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">
                    {filteredVideos?.length || 0}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">vídeos</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-3 sm:p-4 flex items-center gap-2 sm:gap-4">
                <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] sm:text-xs text-gray-400 mb-0.5 sm:mb-1 truncate">Duração</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">
                    {Math.round((videos?.length || 0) * 2.5)}
                  </p>
                  <p className="text-[9px] sm:text-xs text-gray-500 truncate">minutos</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar vídeos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900/30 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {gruposMusculares.map((grupo) => (
                <Button
                  key={grupo}
                  variant={selectedGrupo === grupo ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedGrupo(grupo)}
                  className={
                    selectedGrupo === grupo
                      ? "bg-blue-600 hover:bg-blue-700 text-white border-0"
                      : "bg-gray-900/30 border-gray-800 text-gray-300 hover:bg-gray-900/50"
                  }
                >
                  {grupo.charAt(0).toUpperCase() + grupo.slice(1)}
                  {grupo !== "todos" && videosPorGrupo?.[grupo] && (
                    <span className="ml-1.5 text-xs opacity-60">
                      ({videosPorGrupo[grupo]})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Grid de Vídeos */}
          {!videos || videos.length === 0 ? (
            <Card className="border-gray-800 bg-gray-900/30">
              <div className="py-12 text-center">
                <Video className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-300 mb-2">
                  Nenhum vídeo disponível
                </h3>
                <p className="text-sm text-gray-400">
                  Os vídeos dos exercícios aparecerão aqui quando você tiver fichas de treino ativas.
                </p>
              </div>
            </Card>
          ) : !filteredVideos || filteredVideos.length === 0 ? (
            <Card className="border-gray-800 bg-gray-900/30">
              <div className="py-12 text-center">
                <Video className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-300 mb-2">
                  Nenhum vídeo encontrado
                </h3>
                <p className="text-sm text-gray-400">
                  Tente ajustar os filtros ou buscar por outro termo.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredVideos.map((video) => (
                <Card
                  key={video.id}
                  className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors cursor-pointer overflow-hidden group"
                  onClick={() => setSelectedVideo(video)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gray-800">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Video className="h-12 w-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center">
                        <Play className="h-6 w-6 text-white ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-medium text-white text-sm mb-2 line-clamp-2">
                      {video.nome}
                    </h3>
                    {video.descricao && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                        {video.descricao}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {video.objetivo && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0 h-5 border-0 ${getGrupoColor(
                            video.objetivo
                          )}`}
                        >
                          {video.objetivo}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>2:30</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayerModal
          isOpen={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          videoId={selectedVideo.id}
          videoTitle={selectedVideo.nome}
          videoDescription={selectedVideo.descricao}
          videoDuration={selectedVideo.duracao}
          videoObjective={selectedVideo.objetivo}
          videoDate={selectedVideo.data_upload}
        />
      )}
    </AlunoLayout>
  );
}
