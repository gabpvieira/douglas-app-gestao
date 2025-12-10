import { useState } from "react";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FeedbackTreinoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (estrelas: number, comentario?: string) => void;
  isLoading?: boolean;
}

export function FeedbackTreinoModal({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
}: FeedbackTreinoModalProps) {
  const [estrelas, setEstrelas] = useState<number>(0);
  const [comentario, setComentario] = useState("");
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  const handleSubmit = () => {
    if (estrelas === 0) return;
    onSubmit(estrelas, comentario.trim() || undefined);
    handleClose();
  };

  const handleClose = () => {
    setEstrelas(0);
    setComentario("");
    setHoveredStar(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[calc(100%-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Como foi seu treino?</DialogTitle>
          <DialogDescription className="text-sm">
            Avalie seu treino e deixe um comentário opcional sobre como se sentiu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          {/* Avaliação por Estrelas */}
          <div className="space-y-2 sm:space-y-3">
            <Label className="text-sm sm:text-base font-medium">
              Avaliação <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center justify-center gap-1 sm:gap-2 px-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEstrelas(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded p-1"
                  disabled={isLoading}
                >
                  <Star
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 transition-colors",
                      (hoveredStar >= star || estrelas >= star)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                </button>
              ))}
            </div>
            {estrelas > 0 && (
              <p className="text-center text-xs sm:text-sm text-muted-foreground">
                {estrelas === 1 && "Muito ruim"}
                {estrelas === 2 && "Ruim"}
                {estrelas === 3 && "Regular"}
                {estrelas === 4 && "Bom"}
                {estrelas === 5 && "Excelente"}
              </p>
            )}
          </div>

          {/* Comentário Opcional */}
          <div className="space-y-2 sm:space-y-3">
            <Label htmlFor="comentario" className="text-sm sm:text-base font-medium">
              Comentário <span className="text-muted-foreground text-xs sm:text-sm">(opcional)</span>
            </Label>
            <Textarea
              id="comentario"
              placeholder="Como você se sentiu durante o treino? Teve alguma dificuldade?"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={isLoading}
              className="resize-none text-base"
            />
            <p className="text-xs text-muted-foreground text-right">
              {comentario.length}/500 caracteres
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 flex-col sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={estrelas === 0 || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Enviando..." : "Enviar Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
