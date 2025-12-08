import { useState } from "react";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVideosDisponiveis } from "@/hooks/useAlunoData";
import { VideoPlayerModal } from "@/components/VideoPlayerModal";
import {
  Video,
  Loader2,
  Search,
  Play,
  Clock,
  Filter,
} from "lucide-react";

export default function BibliotecaVideos() {
  const { data: videos, isLoading } = useVideosDisponiveis();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrupo, setSelectedGrupo] = useState<string>("todos");
  const [selectedVideo, setSelectedVideo] = useState<any>(null);

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
    const matchesSearch = video.titulo
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesGrupo =
      selectedGrupo === "todos" ||
      video.grupo_muscular?.toLowerCase() === selectedGrupo;
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

  if (isLoading) {
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
      <div className="min-h-screen bg-gray-950 p-3 sm:p-6 pb-20">
        <div className="w-full space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6">
            <h1 className="text-2xl font-semibold text-white mb-1">
              Biblioteca de Vídeos
            </h1>
            <p className="text-sm text-gray-400">
              Aprenda a executar os exercícios corretamente
            </p>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-4 flex items-center gap-4">
                <Video className="w-10 h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Total de Vídeos</p>
                  <p className="text-2xl font-bold text-white">{videos?.length || 0}</p>
                  <p className="text-xs text-gray-500">disponíveis</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-4 flex items-center gap-4">
                <Filter className="w-10 h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Filtrados</p>
                  <p className="text-2xl font-bold text-white">
                    {filteredVideos?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">vídeos</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-4 flex items-center gap-4">
                <Play className="w-10 h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Grupos</p>
                  <p className="text-2xl font-bold text-white">
                    {gruposMusculares.length - 1}
                  </p>
                  <p className="text-xs text-gray-500">musculares</p>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/40 transition-colors">
              <div className="p-4 flex items-center gap-4">
                <Clock className="w-10 h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-1">Duração Total</p>
                  <p className="text-2xl font-bold text-white">
                    {Math.round((videos?.length || 0) * 2.5)}
                  </p>
                  <p className="text-xs text-gray-500">minutos</p>
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
                </Button>
              ))}
            </div>
          </div>

          {/* Grid de Vídeos */}
          {!filteredVideos || filteredVideos.length === 0 ? (
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
                      {video.titulo}
                    </h3>
                    {video.descricao && (
                      <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                        {video.descricao}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {video.grupo_muscular && (
                        <Badge
                          variant="outline"
                          className={`text-[10px] px-2 py-0 h-5 border-0 ${getGrupoColor(
                            video.grupo_muscular
                          )}`}
                        >
                          {video.grupo_muscular}
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
          videoTitle={selectedVideo.titulo}
          videoDescription={selectedVideo.descricao}
          videoDuration={selectedVideo.duracao}
          videoObjective={selectedVideo.objetivo}
          videoDate={selectedVideo.data_upload}
        />
      )}
    </AlunoLayout>
  );
}
