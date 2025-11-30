/**
 * Card para exibir resultados da avaliação física
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ResultadoAvaliacao } from '@/lib/avaliacaoCalculos';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';

interface ResultadosAvaliacaoCardProps {
  resultado: ResultadoAvaliacao;
}

export default function ResultadosAvaliacaoCard({ resultado }: ResultadosAvaliacaoCardProps) {
  const getClassificacaoColor = (classificacao: string) => {
    const lower = classificacao.toLowerCase();
    if (lower.includes('atleta') || lower.includes('excelente')) return 'bg-green-500';
    if (lower.includes('bom')) return 'bg-blue-500';
    if (lower.includes('regular')) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resultados da Avaliação
          </CardTitle>
          <CardDescription>
            Protocolo de Pollock - Fórmula de Siri
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Composição Corporal */}
          <div>
            <h4 className="font-semibold mb-3">Composição Corporal</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Percentual de Gordura</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">{resultado.percentualGordura}%</p>
                  <Badge className={getClassificacaoColor(resultado.classificacao)}>
                    {resultado.classificacao}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Densidade Corporal</p>
                <p className="text-2xl font-bold">{resultado.densidadeCorporal} g/ml</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Massa Gorda</p>
                <p className="text-2xl font-bold text-red-500">{resultado.massaGorda} kg</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Massa Magra</p>
                <p className="text-2xl font-bold text-green-500">{resultado.massaMagra} kg</p>
              </div>
            </div>
          </div>

          {/* IMC e Peso Ideal */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Índices</h4>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">IMC</p>
                <p className="text-xl font-bold">{resultado.imc}</p>
                <p className="text-xs text-muted-foreground">{resultado.classificacaoIMC}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Peso Ideal</p>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <p className="text-xl font-bold">{resultado.pesoIdeal} kg</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Soma das Dobras</p>
                <p className="text-xl font-bold">{resultado.somaDobras} mm</p>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="border-t pt-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Interpretação</h4>
              <p className="text-sm text-muted-foreground">
                {resultado.classificacao === 'Atleta' && 
                  'Excelente! Você está na faixa de atletas de alto rendimento.'}
                {resultado.classificacao === 'Excelente' && 
                  'Muito bom! Seu percentual de gordura está em uma faixa excelente.'}
                {resultado.classificacao === 'Bom' && 
                  'Bom trabalho! Você está em uma faixa saudável de gordura corporal.'}
                {resultado.classificacao === 'Regular' && 
                  'Atenção! Considere ajustar sua dieta e treino para melhorar a composição corporal.'}
                {resultado.classificacao === 'Alto' && 
                  'Importante! Recomenda-se consultar um profissional para um plano de emagrecimento.'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
