import { useState, useMemo, useRef, useEffect } from 'react';
import { Check, ChevronsUpDown, Play, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

interface Video {
  id: string;
  nome: string;
  objetivo?: string | null;
  grupoMuscular?: string;
}

interface VideoSearchComboboxProps {
  videos: Video[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function VideoSearchCombobox({
  videos,
  value,
  onValueChange,
  placeholder = "Buscar vídeo...",
  disabled = false,
  className
}: VideoSearchComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focar no input quando o popover abrir
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  // Limpar busca quando fechar
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  // Filtrar vídeos baseado no termo de busca
  const filteredVideos = useMemo(() => {
    if (!searchTerm.trim()) {
      // Se não houver busca, mostrar apenas os primeiros 20 vídeos
      return videos.slice(0, 20);
    }

    const term = searchTerm.toLowerCase().trim();
    
    return videos
      .filter(video => {
        const nomeMatch = video.nome.toLowerCase().includes(term);
        const objetivoMatch = video.objetivo?.toLowerCase().includes(term);
        const grupoMatch = video.grupoMuscular?.toLowerCase().includes(term);
        
        return nomeMatch || objetivoMatch || grupoMatch;
      })
      .slice(0, 50); // Limitar a 50 resultados para performance
  }, [videos, searchTerm]);

  // Encontrar vídeo selecionado
  const selectedVideo = useMemo(() => {
    if (!value || value === 'none') return null;
    return videos.find(v => v.id === value);
  }, [value, videos]);

  const handleSelect = (videoId: string) => {
    onValueChange(videoId);
    setOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onValueChange('none');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-gray-800 border-gray-700 text-white hover:bg-gray-750 hover:text-white",
            !selectedVideo && "text-gray-400",
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selectedVideo ? (
              <>
                <Play className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <span className="truncate">{selectedVideo.nome}</span>
                {selectedVideo.objetivo && (
                  <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs flex-shrink-0">
                    {selectedVideo.objetivo}
                  </Badge>
                )}
              </>
            ) : (
              <span className="truncate">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {selectedVideo && (
              <X
                className="h-4 w-4 text-gray-400 hover:text-white"
                onClick={handleClear}
              />
            )}
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0 bg-gray-800 border-gray-700"
        align="start"
      >
        <div className="flex flex-col">
          {/* Campo de Busca */}
          <div className="flex items-center border-b border-gray-700 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
            <Input
              ref={inputRef}
              placeholder="Digite para buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 border-0 bg-transparent text-white placeholder:text-gray-500 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-gray-700"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Lista de Resultados */}
          <div className="max-h-[300px] overflow-y-auto">
            {/* Opção "Nenhum vídeo" */}
            <button
              onClick={() => handleSelect('none')}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700 transition-colors text-left",
                (!value || value === 'none') && "bg-gray-700"
              )}
            >
              <Check
                className={cn(
                  "h-4 w-4 flex-shrink-0",
                  (!value || value === 'none') ? "opacity-100" : "opacity-0"
                )}
              />
              <span className="text-gray-400">Nenhum vídeo</span>
            </button>

            {/* Resultados Filtrados */}
            {filteredVideos.length > 0 ? (
              filteredVideos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => handleSelect(video.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-700 transition-colors text-left",
                    value === video.id && "bg-gray-700"
                  )}
                >
                  <Check
                    className={cn(
                      "h-4 w-4 flex-shrink-0",
                      value === video.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <Play className="h-3 w-3 text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-white">{video.nome}</span>
                      {video.objetivo && (
                        <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs flex-shrink-0">
                          {video.objetivo}
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-8 text-center text-sm text-gray-500">
                {searchTerm ? (
                  <>
                    <p>Nenhum vídeo encontrado</p>
                    <p className="text-xs mt-1">Tente outro termo de busca</p>
                  </>
                ) : (
                  <>
                    <p>Nenhum vídeo disponível</p>
                    <p className="text-xs mt-1">Cadastre vídeos primeiro</p>
                  </>
                )}
              </div>
            )}

            {/* Indicador de mais resultados */}
            {searchTerm && filteredVideos.length === 50 && (
              <div className="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-700">
                Mostrando 50 resultados. Refine sua busca para ver mais.
              </div>
            )}

            {/* Dica quando não há busca */}
            {!searchTerm && videos.length > 20 && (
              <div className="px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-700">
                💡 Digite para buscar entre {videos.length} vídeos
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
