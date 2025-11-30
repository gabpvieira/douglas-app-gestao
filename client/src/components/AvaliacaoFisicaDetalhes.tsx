import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAvaliacaoById } from "@/hooks/useAvaliacoesFisicas";
import { Edit, Calendar, Activity, Ruler, Scale, Droplet, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AvaliacaoFisicaDetalhesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avaliacaoId: string | null;
  onEdit?: (id: string) => void;
}

export default function AvaliacaoFisicaDetalhes({ 
  open, 
  onOpenChange, 
  avaliacaoId,
  onEdit 
}: AvaliacaoFisicaDetalhesProps) {
  const { data: avaliacao, isLoading } = useAvaliacaoById(avaliacaoId || undefined);

  if (!avaliacao || isLoading) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-500 text-white';
      case 'agendada': return 'bg-yellow-500 text-white';
      case 'cancelada': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluida': return 'Concluída';
      case 'agendada': return 'Agendada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return 'NA';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getIMCClassificacao = (imc: number) => {
    if (imc < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-400' };
    if (imc < 25) return { label: 'Peso normal', color: 'text-green-400' };
    if (imc < 30) return { label: 'Sobrepeso', color: 'text-yellow-400' };
    if (imc < 35) return { label: 'Obesidade Grau I', color: 'text-orange-400' };
    if (imc < 40) return { label: 'Obesidade Grau II', color: 'text-red-400' };
    return { label: 'Obesidade Grau III', color: 'text-red-600' };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800 w-[95vw] sm:w-full p-3 sm:p-6">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-white flex items-center gap-2 text-base sm:text-lg">
            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
            Detalhes da Avaliação Física
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Header com info do aluno */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gradient-to-r from-gray-800/50 to-gray-800/30 rounded-lg border border-gray-700 gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar className="h-12 w-12 sm:h-16 sm:w-16 border-2 border-blue-500 flex-shrink-0">
                <AvatarImage src={avaliacao.aluno?.fotoUrl || undefined} />
                <AvatarFallback className="bg-gray-700 text-white text-sm sm:text-lg">
                  {getInitials(avaliacao.aluno?.nome || 'NA')}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-xl font-bold text-white truncate">{avaliacao.aluno?.nome}</h3>
                <p className="text-xs sm:text-sm text-gray-400 truncate">{avaliacao.aluno?.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Badge className={`${getStatusColor(avaliacao.status)} text-[10px] sm:text-xs`}>
                    {getStatusLabel(avaliacao.status)}
                  </Badge>
                  <Badge variant="outline" className="border-gray-600 text-gray-300 text-[10px] sm:text-xs">
                    {avaliacao.tipo === 'online' ? '🌐 Online' : '🏋️ Presencial'}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
              <div className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm mb-1">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                Data da Avaliação
              </div>
              <p className="text-sm sm:text-lg font-semibold text-white">
                {formatDate(avaliacao.data_avaliacao)}
              </p>
            </div>
          </div>

          {/* Métricas Principais - Destaque */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {avaliacao.peso && (
              <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-700/50">
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm text-blue-300 flex items-center gap-2">
                    <Scale className="w-3 h-3 sm:w-4 sm:h-4" />
                    Peso Corporal
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{avaliacao.peso} kg</p>
                  {avaliacao.altura && (
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Altura: {avaliacao.altura} cm</p>
                  )}
                </CardContent>
              </Card>
            )}

            {avaliacao.imc && (
              <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-700/50">
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm text-purple-300 flex items-center gap-2">
                    <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
                    IMC
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{Number(avaliacao.imc).toFixed(2)}</p>
                  <p className={`text-[10px] sm:text-xs mt-1 font-medium ${getIMCClassificacao(Number(avaliacao.imc)).color}`}>
                    {getIMCClassificacao(Number(avaliacao.imc)).label}
                  </p>
                </CardContent>
              </Card>
            )}

            {avaliacao.percentual_gordura && (
              <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-700/50">
                <CardHeader className="pb-2 p-3 sm:p-4">
                  <CardTitle className="text-xs sm:text-sm text-orange-300 flex items-center gap-2">
                    <Droplet className="w-3 h-3 sm:w-4 sm:h-4" />
                    % Gordura
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 sm:p-4 pt-0">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{Number(avaliacao.percentual_gordura).toFixed(1)}%</p>
                  {avaliacao.massa_gorda && (
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Massa gorda: {Number(avaliacao.massa_gorda).toFixed(1)} kg</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Circunferências */}
          {(avaliacao.circunferencia_pescoco || avaliacao.circunferencia_torax || 
            avaliacao.circunferencia_cintura || avaliacao.circunferencia_abdomen) && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base text-white flex items-center gap-2">
                  <Ruler className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  Circunferências (cm)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                  {avaliacao.circunferencia_pescoco && (
                    <div className="p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-gray-400">Pescoço</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.circunferencia_pescoco).toFixed(1)}</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_torax && (
                    <div className="p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-gray-400">Tórax</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.circunferencia_torax).toFixed(1)}</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_cintura && (
                    <div className="p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-gray-400">Cintura</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.circunferencia_cintura).toFixed(1)}</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_abdomen && (
                    <div className="p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-gray-400">Abdômen</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.circunferencia_abdomen).toFixed(1)}</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_quadril && (
                    <div className="p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-gray-400">Quadril</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.circunferencia_quadril).toFixed(1)}</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_braco_direito && (
                    <div className="p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-gray-400">Braço D</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.circunferencia_braco_direito).toFixed(1)}</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_braco_esquerdo && (
                    <div className="p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-gray-400">Braço E</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.circunferencia_braco_esquerdo).toFixed(1)}</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_coxa_direita && (
                    <div className="p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-gray-400">Coxa D</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.circunferencia_coxa_direita).toFixed(1)}</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_coxa_esquerda && (
                    <div className="p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-gray-400">Coxa E</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.circunferencia_coxa_esquerda).toFixed(1)}</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_panturrilha_direita && (
                    <div className="p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-gray-400">Pant. D</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.circunferencia_panturrilha_direita).toFixed(1)}</p>
                    </div>
                  )}
                  {avaliacao.circunferencia_panturrilha_esquerda && (
                    <div className="p-2 sm:p-3 bg-gray-700/30 rounded-lg">
                      <p className="text-[10px] sm:text-xs text-gray-400">Pant. E</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.circunferencia_panturrilha_esquerda).toFixed(1)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Composição Corporal */}
          {(avaliacao.massa_gorda || avaliacao.massa_magra || avaliacao.massa_muscular) && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  Composição Corporal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                  {avaliacao.massa_gorda && (
                    <div className="p-2 sm:p-3 bg-red-900/20 rounded-lg border border-red-700/30">
                      <p className="text-[10px] sm:text-xs text-red-300">Massa Gorda</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.massa_gorda).toFixed(1)} kg</p>
                    </div>
                  )}
                  {avaliacao.massa_magra && (
                    <div className="p-2 sm:p-3 bg-green-900/20 rounded-lg border border-green-700/30">
                      <p className="text-[10px] sm:text-xs text-green-300">Massa Magra</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.massa_magra).toFixed(1)} kg</p>
                    </div>
                  )}
                  {avaliacao.massa_muscular && (
                    <div className="p-2 sm:p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
                      <p className="text-[10px] sm:text-xs text-blue-300">Massa Muscular</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.massa_muscular).toFixed(1)} kg</p>
                    </div>
                  )}
                  {avaliacao.agua_corporal && (
                    <div className="p-2 sm:p-3 bg-cyan-900/20 rounded-lg border border-cyan-700/30">
                      <p className="text-[10px] sm:text-xs text-cyan-300">Água Corporal</p>
                      <p className="text-base sm:text-xl font-semibold text-white">{Number(avaliacao.agua_corporal).toFixed(1)}%</p>
                    </div>
                  )}
                  {avaliacao.gordura_visceral && (
                    <div className="p-2 sm:p-3 bg-orange-900/20 rounded-lg border border-orange-700/30">
                      <p className="text-[10px] sm:text-xs text-orange-300">Gordura Visceral</p>
                      <p className="text-base sm:text-xl font-semibold text-white">Nível {avaliacao.gordura_visceral}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}





          {/* Observações e Objetivos */}
          {(avaliacao.observacoes || avaliacao.objetivos || avaliacao.restricoes_medicas) && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-base text-white">Anotações e Objetivos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4 pt-0">
                {avaliacao.objetivos && (
                  <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                    <p className="text-xs text-blue-300 mb-2 font-semibold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Objetivos do Aluno
                    </p>
                    <p className="text-sm text-gray-200">{avaliacao.objetivos}</p>
                  </div>
                )}
                {avaliacao.observacoes && (
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <p className="text-xs text-gray-400 mb-2 font-semibold">Observações Gerais</p>
                    <p className="text-sm text-gray-300">{avaliacao.observacoes}</p>
                  </div>
                )}
                {avaliacao.restricoes_medicas && (
                  <div className="p-4 bg-red-900/20 rounded-lg border border-red-700/30">
                    <p className="text-xs text-red-300 mb-2 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Restrições Médicas
                    </p>
                    <p className="text-sm text-red-200">{avaliacao.restricoes_medicas}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-[10px] sm:text-xs text-gray-500 pt-3 sm:pt-4 border-t border-gray-700">
            <span>Criado: {new Date(avaliacao.created_at).toLocaleString('pt-BR')}</span>
            <span>Atualizado: {new Date(avaliacao.updated_at).toLocaleString('pt-BR')}</span>
          </div>
        </div>

        <DialogFooter className="gap-2 flex-col sm:flex-row pt-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="border-gray-700 text-gray-300 w-full sm:w-auto text-sm"
          >
            Fechar
          </Button>
          {onEdit && (
            <Button 
              onClick={() => onEdit(avaliacao.id)}
              className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 w-full sm:w-auto text-sm"
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Editar Avaliação
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
