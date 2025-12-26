import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Copy, MessageCircle } from "lucide-react";
import { AlunoDestaque } from "@/hooks/useProgressoTreinos";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface MensagemWhatsAppModalProps {
  alunos: AlunoDestaque[];
  onClose: () => void;
}

export default function MensagemWhatsAppModal({ alunos, onClose }: MensagemWhatsAppModalProps) {
  const { toast } = useToast();
  const [incluirDias, setIncluirDias] = useState(true);
  const [incluirEmojis, setIncluirEmojis] = useState(true);
  
  const gerarMensagem = () => {
    const emoji = incluirEmojis ? '🔥' : '';
    const emojiPoder = incluirEmojis ? '💪🔥' : '';
    
    let mensagem = `${emoji} ALUNOS DESTAQUE DA SEMANA! ${emoji}\n\n`;
    mensagem += `Esses nomes aqui merecem MUITO reconhecimento! `;
    mensagem += `Foram 5 dias ou mais seguidos treinando firme no aplicativo, `;
    mensagem += `mostrando dedicação, disciplina e foco no processo!\n\n`;
    mensagem += `Destaques:\n`;
    
    alunos.forEach(aluno => {
      if (incluirDias) {
        mensagem += `• ${aluno.nome} (${aluno.diasTreinados} dias)\n`;
      } else {
        mensagem += `• ${aluno.nome}\n`;
      }
    });
    
    mensagem += `\nParabéns, time! A consistência de vocês inspira e mostra que o resultado é apenas consequência de quem faz o básico todos os dias! ${emojiPoder}`;
    
    return mensagem;
  };
  
  const copiarTexto = () => {
    const mensagem = gerarMensagem();
    navigator.clipboard.writeText(mensagem);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência"
    });
  };
  
  const abrirWhatsApp = () => {
    const mensagem = gerarMensagem();
    const texto = encodeURIComponent(mensagem);
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  };
  
  const inicioSemana = new Date();
  inicioSemana.setDate(inicioSemana.getDate() - inicioSemana.getDay());
  const fimSemana = new Date(inicioSemana);
  fimSemana.setDate(inicioSemana.getDate() + 6);
  
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Mensagem para WhatsApp
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Info do período */}
          <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="text-sm text-gray-400">
              <div>Período: {inicioSemana.toLocaleDateString('pt-BR')} a {fimSemana.toLocaleDateString('pt-BR')}</div>
              <div>Critério: Dias consecutivos (mínimo 5 dias)</div>
              <div>Alunos selecionados: {alunos.length}</div>
            </div>
          </div>
          
          {/* Opções */}
          <div className="space-y-3">
            <Label className="text-white">Opções:</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="incluir-dias" 
                checked={incluirDias}
                onCheckedChange={(checked) => setIncluirDias(checked as boolean)}
              />
              <label
                htmlFor="incluir-dias"
                className="text-sm text-gray-300 cursor-pointer"
              >
                Incluir número de dias de cada aluno
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="incluir-emojis" 
                checked={incluirEmojis}
                onCheckedChange={(checked) => setIncluirEmojis(checked as boolean)}
              />
              <label
                htmlFor="incluir-emojis"
                className="text-sm text-gray-300 cursor-pointer"
              >
                Incluir emojis
              </label>
            </div>
          </div>
          
          {/* Pré-visualização */}
          <div>
            <Label className="text-white mb-2 block">Pré-visualização:</Label>
            <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">
                {gerarMensagem()}
              </pre>
            </div>
          </div>
          
          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={copiarTexto}
              variant="outline"
              className="flex-1 border-gray-700 hover:bg-gray-800"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar Texto
            </Button>
            
            <Button
              onClick={abrirWhatsApp}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Abrir no WhatsApp
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
