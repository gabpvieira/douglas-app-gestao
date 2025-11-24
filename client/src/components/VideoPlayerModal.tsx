import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize,
  Clock,
  Calendar,
  Target,
  Loader2
} from 'lucide-react';
import { useStreamTreinoVideo } from '@/hooks/useTreinosVideo';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  videoDescription?: string;
  videoDuration?: number;
  videoObjective?: string;
  videoDate?: string;
}

export function VideoPlayerModal({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  videoDescription,
  videoDuration,
  videoObjective,
  videoDate
}: VideoPlayerModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);

  const { data: streamData, isLoading, error } = useStreamTreinoVideo(videoId);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [isOpen]);

  const handlePlayPause = () => {
    if (!videoElement) return;
    
    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleMuteToggle = () => {
    if (!videoElement) return;
    videoElement.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoElement) return;
    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoElement) return;
    setCurrentTime(videoElement.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoElement) return;
    setDuration(videoElement.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoElement) return;
    const time = parseFloat(e.target.value);
    videoElement.currentTime = time;
    setCurrentTime(time);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden bg-gray-950 border-gray-800 text-white p-0">
        {/* Header */}
        <DialogHeader className="p-4 sm:p-6 border-b border-gray-800">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl sm:text-2xl text-white mb-2">
                {videoTitle}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-400">
                {videoObjective && (
                  <div className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    <span>{videoObjective}</span>
                  </div>
                )}
                {videoDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{videoDuration} min</span>
                  </div>
                )}
                {videoDate && (() => {
                  try {
                    const date = new Date(videoDate);
                    if (!isNaN(date.getTime())) {
                      return (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{date.toLocaleDateString('pt-BR')}</span>
                        </div>
                      );
                    }
                  } catch (e) {
                    console.error('Data inválida:', videoDate);
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Video Player */}
        <div className="relative bg-black">
          {isLoading && (
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-400">Carregando vídeo...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="aspect-video flex items-center justify-center">
              <div className="text-center">
                <p className="text-red-400 mb-2">Erro ao carregar vídeo</p>
                <p className="text-gray-500 text-sm">Tente novamente mais tarde</p>
              </div>
            </div>
          )}

          {streamData && !isLoading && !error && (
            <>
              <video
                ref={setVideoElement}
                src={streamData.streamUrl}
                className="w-full aspect-video"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onClick={handlePlayPause}
              />

              {/* Custom Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                {/* Progress Bar */}
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 mb-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #374151 ${(currentTime / duration) * 100}%, #374151 100%)`
                  }}
                />

                {/* Controls */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="text-white hover:bg-white/20 h-10 w-10 p-0"
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5" fill="currentColor" />
                      ) : (
                        <Play className="w-5 h-5 ml-0.5" fill="currentColor" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMuteToggle}
                      className="text-white hover:bg-white/20 h-10 w-10 p-0"
                    >
                      {isMuted ? (
                        <VolumeX className="w-5 h-5" />
                      ) : (
                        <Volume2 className="w-5 h-5" />
                      )}
                    </Button>

                    <span className="text-sm text-white font-medium">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFullscreen}
                    className="text-white hover:bg-white/20 h-10 w-10 p-0"
                  >
                    <Maximize className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Description */}
        {videoDescription && (
          <div className="p-4 sm:p-6 border-t border-gray-800">
            <Card className="border-gray-800 bg-gray-900/50">
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Descrição</h3>
                <p className="text-sm text-gray-400 whitespace-pre-wrap">
                  {videoDescription}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
