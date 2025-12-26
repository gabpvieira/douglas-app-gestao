import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Flame, MessageSquare, Loader2 } from "lucide-react";
import { AlunoDestaque } from "@/hooks/useProgressoTreinos";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import MensagemWhatsAppModal from "./MensagemWhatsAppModal";

interface RankingDestaquesCardProps {
  alunos: AlunoDestaque[];
  isLoading?: boolean;
}

const BADGE_CONFIG = {
  ouro: {
    emoji: '🥇',
    cor: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    label: '1º Lugar'
  },
  prata: {
    emoji: '🥈',
    cor: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
    label: '2º Lugar'
  },
  bronze: {
    emoji: '🥉',
    cor: 'bg-orange-600/10 text-orange-600 border-orange-600/20',
    label: '3º Lugar'
  },
  fogo: {
    emoji: '🔥',
    cor: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    label: 'Destaque'
  }
};

export default function RankingDestaquesCard({ alunos, isLoading }: RankingDestaquesCardProps) {
  const [showMensagemModal, setShowMensagemModal] = useState(false);
  
  // Filtrar alunos com pelo menos 5 dias
  const alunosDestaque = alunos.filter(a => a.diasTreinados >= 5);
  
  if (isLoading) {
    return (
      <Card className="border-gray-800 bg-gray-900/30">
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }
  
  if (alunosDestaque.length === 0) {
    return (
      <Card className="border-gray-800 bg-gray-900/30">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center">
              <Flame className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Alunos Destaque da Semana</h2>
              <p className="text-sm text-gray-400">Mínimo de 5 dias de treino</p>
            </div>
          </div>
          
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum aluno atingiu 5 dias de treino esta semana</p>
          </div>
        </div>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="border-gray-800 bg-gradient-to-br from-orange-950/30 to-gray-900/30">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-orange-600 flex items-center justify-center">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">🔥 Alunos Destaque da Semana</h2>
                <p className="text-sm text-gray-400">{alunosDestaque.length} alunos com 5+ dias de treino</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowMensagemModal(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Gerar Mensagem
            </Button>
          </div>
          
          <div className="space-y-3">
            {alunosDestaque.map((aluno) => {
              const badgeConfig = aluno.badge ? BADGE_CONFIG[aluno.badge] : null;
              
              return (
                <div
                  key={aluno.alunoId}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors"
                >
                  {badgeConfig && (
                    <div className="text-2xl">{badgeConfig.emoji}</div>
                  )}
                  
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={aluno.fotoUrl || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {aluno.nome.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{aluno.nome}</div>
                    <div className="text-sm text-gray-400">
                      {aluno.diasTreinados} dias • {aluno.treinosRealizados} treinos
                    </div>
                  </div>
                  
                  {badgeConfig && (
                    <Badge variant="outline" className={badgeConfig.cor}>
                      {badgeConfig.label}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </Card>
      
      {showMensagemModal && (
        <MensagemWhatsAppModal
          alunos={alunosDestaque}
          onClose={() => setShowMensagemModal(false)}
        />
      )}
    </>
  );
}
