import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Play, Info, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface ExercicioVideoModalProps {
  open: boolean;
  onClose: () => void;
  exercicio: {
    id: string;
    nome: string;
    grupoMuscular: string;
    videoId?: string | null;
    observacoes?: string;
    tecnica?: string;
  };
}

export default function ExercicioVideoModal({
  open,
  onClose,
  exercicio,
}: ExercicioVideoModalProps) {
  // Buscar dados do vídeo se existir videoId
  const { data: video, isLoading } = useQuery({
    queryKey: ["video-exercicio", exercicio.videoId],
    queryFn: async () => {
      if (!exercicio.videoId) return null;
      
      const { data, error } = await supabase
        .from("treinos_video")
        .select("*")
        .eq("id", exercicio.videoId)
        .single();

      if (error) {
        console.error("Erro ao buscar vídeo:", error);
        return null;
      }

      // Gerar URL assinada para o vídeo
      if (data?.url_video) {
        const { data: signedData } = await supabase.storage
          .from("treinos-video")
          .createSignedUrl(data.url_video, 7200);
        
        return {
          ...data,
          signedUrl: signedData?.signedUrl || null,
        };
      }

      return data;
    },
    enabled: open && !!exercicio.videoId,
  });

  const temVideo = !!video?.signedUrl;
  const temInstrucoes = !!exercicio.observacoes || !!exercicio.tecnica;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl w-[95vw] p-0 gap-0 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3 min-w-0 pr-8">
            <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <Play className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg font-semibold text-zinc-100 truncate">
                {exercicio.nome}
              </DialogTitle>
              <span className="text-sm text-zinc-500">{exercicio.grupoMuscular}</span>
            </div>
          </div>
        </DialogHeader>

        {/* Conteúdo */}
        <div className="overflow-y-auto">
          {/* Player de Vídeo */}
          {isLoading ? (
            <div className="aspect-video bg-zinc-800 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
            </div>
          ) : temVideo ? (
            <div className="aspect-video bg-black">
              <video
                src={video.signedUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain"
              >
                Seu navegador não suporta vídeos.
              </video>
            </div>
          ) : (
            <div className="aspect-video bg-zinc-800 flex flex-col items-center justify-center gap-3 p-6">
              <div className="h-16 w-16 rounded-full bg-zinc-700 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-zinc-500" />
              </div>
              <div className="text-center">
                <p className="text-zinc-400 font-medium">Nenhum vídeo disponível</p>
                <p className="text-sm text-zinc-500 mt-1">
                  O personal ainda não adicionou um vídeo para este exercício
                </p>
              </div>
            </div>
          )}

          {/* Informações do Exercício */}
          {temInstrucoes && (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-zinc-400">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Instruções</span>
              </div>
              
              {exercicio.observacoes && (
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <p className="text-sm text-zinc-300">
                    💡 {exercicio.observacoes}
                  </p>
                </div>
              )}
              
              {exercicio.tecnica && (
                <div className="bg-zinc-800 p-3 rounded-lg">
                  <p className="text-sm text-zinc-300">
                    ⚡ <span className="text-blue-400">Técnica:</span> {exercicio.tecnica}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Mensagem quando não tem nada */}
          {!temVideo && !temInstrucoes && (
            <div className="p-4">
              <div className="bg-zinc-800 p-4 rounded-lg text-center">
                <p className="text-zinc-400 text-sm">
                  Nenhuma instrução adicional para este exercício.
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
