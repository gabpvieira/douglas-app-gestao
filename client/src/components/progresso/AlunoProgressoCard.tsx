import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MetricasAluno } from "@/hooks/useProgressoTreinos";
import { Eye, Flame, TrendingUp } from "lucide-react";
import WeekProgressTracker from "./WeekProgressTracker";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface AlunoProgressoCardProps {
  aluno: MetricasAluno;
  onVerDetalhes: () => void;
}

export default function AlunoProgressoCard({ aluno, onVerDetalhes }: AlunoProgressoCardProps) {
  // Usar os índices reais dos dias treinados (já no formato BR: 0=seg, 6=dom)
  const diasTreinadosIndices = aluno.diasTreinadosSemanaIndices || [];
  
  const getStatusBadge = () => {
    if (aluno.diasTreinadosSemana >= 5) {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Muito Ativo</Badge>;
    } else if (aluno.diasTreinadosSemana >= 3) {
      return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Ativo</Badge>;
    } else if (aluno.diasTreinadosSemana >= 1) {
      return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">Moderado</Badge>;
    } else {
      return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Inativo</Badge>;
    }
  };
  
  return (
    <Card className="border-gray-800 bg-gray-900/30 hover:bg-gray-900/50 transition-colors">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={aluno.fotoUrl || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {aluno.nome.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-white truncate">{aluno.nome}</h3>
              {aluno.sequenciaAtual >= 5 && (
                <Flame className="h-4 w-4 text-orange-500" />
              )}
            </div>
            <p className="text-sm text-gray-400 truncate">{aluno.email}</p>
          </div>
          
          {getStatusBadge()}
        </div>
        
        {/* Calendário Semanal */}
        <WeekProgressTracker diasTreinados={diasTreinadosIndices} compact />
        
        {/* Métricas */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center p-2 rounded-lg bg-gray-800/50">
            <div className="text-2xl font-bold text-primary">{aluno.diasTreinadosSemana}</div>
            <div className="text-xs text-gray-400">Dias</div>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-gray-800/50">
            <div className="text-2xl font-bold text-primary">{aluno.treinosRealizadosSemana}</div>
            <div className="text-xs text-gray-400">Treinos</div>
          </div>
          
          <div className="text-center p-2 rounded-lg bg-gray-800/50">
            <div className="text-2xl font-bold text-primary">{aluno.sequenciaAtual}</div>
            <div className="text-xs text-gray-400">Sequência</div>
          </div>
        </div>
        
        {/* Info adicional */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>Taxa: {aluno.taxaFrequencia.toFixed(0)}%</span>
          </div>
          
          {aluno.ultimoTreino && (
            <span>
              Último treino: {formatDistanceToNow(aluno.ultimoTreino, { 
                addSuffix: true, 
                locale: ptBR 
              })}
            </span>
          )}
        </div>
        
        {/* Botão */}
        <Button
          onClick={onVerDetalhes}
          variant="outline"
          size="sm"
          className="w-full border-gray-700 hover:bg-gray-800"
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </div>
    </Card>
  );
}
