import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface AvaliacaoParametrosProps {
  avaliacao: any;
}

export default function AvaliacaoParametros({ avaliacao }: AvaliacaoParametrosProps) {
  // Cálculos
  const peso = avaliacao.peso || 0;
  const altura = avaliacao.altura || 0;
  const percentualGordura = avaliacao.percentual_gordura || 0;
  const massaMagra = avaliacao.massa_magra || 0;
  const cintura = avaliacao.circunferencia_cintura || 0;
  const quadril = avaliacao.circunferencia_quadril || 0;
  
  // IMC
  const imc = avaliacao.imc || (altura > 0 ? (peso / ((altura / 100) ** 2)).toFixed(2) : 0);
  const getIMCClassificacao = (imc: number) => {
    if (imc < 18.5) return { texto: 'Abaixo do peso', cor: 'text-blue-400' };
    if (imc < 25) return { texto: 'Normal', cor: 'text-green-400' };
    if (imc < 30) return { texto: 'Sobrepeso', cor: 'text-yellow-400' };
    if (imc < 35) return { texto: 'Obesidade I', cor: 'text-orange-400' };
    if (imc < 40) return { texto: 'Obesidade II', cor: 'text-red-400' };
    return { texto: 'Obesidade III', cor: 'text-red-600' };
  };
  const imcClass = getIMCClassificacao(Number(imc));
  
  // RCQ - Relação Cintura-Quadril
  const rcq = cintura > 0 && quadril > 0 ? (cintura / quadril).toFixed(2) : 0;
  const getRCQClassificacao = (rcq: number) => {
    // Assumindo sexo masculino como padrão
    if (rcq < 0.83) return { texto: 'Baixo', cor: 'text-green-400' };
    if (rcq < 0.88) return { texto: 'Moderado', cor: 'text-yellow-400' };
    if (rcq < 0.95) return { texto: 'Alto', cor: 'text-orange-400' };
    return { texto: 'Muito Alto', cor: 'text-red-400' };
  };
  const rcqClass = getRCQClassificacao(Number(rcq));
  
  // Soma Perimetria (todas as circunferências)
  const somaPerimetria = [
    avaliacao.circunferencia_pescoco,
    avaliacao.circunferencia_torax,
    avaliacao.circunferencia_cintura,
    avaliacao.circunferencia_abdomen,
    avaliacao.circunferencia_quadril,
    avaliacao.circunferencia_braco_direito,
    avaliacao.circunferencia_braco_esquerdo,
    avaliacao.circunferencia_antebraco_direito,
    avaliacao.circunferencia_antebraco_esquerdo,
    avaliacao.circunferencia_coxa_direita,
    avaliacao.circunferencia_coxa_esquerda,
    avaliacao.circunferencia_panturrilha_direita,
    avaliacao.circunferencia_panturrilha_esquerda,
  ].reduce((sum, val) => sum + (val || 0), 0).toFixed(2);
  
  // Soma Antropometria (todas as dobras cutâneas)
  const somaAntropometria = [
    avaliacao.dobra_triceps,
    avaliacao.dobra_biceps,
    avaliacao.dobra_peitoral,
    avaliacao.dobra_axilar_media,
    avaliacao.dobra_subescapular,
    avaliacao.dobra_suprailiaca,
    avaliacao.dobra_abdominal,
    avaliacao.dobra_coxa,
    avaliacao.dobra_panturrilha,
  ].reduce((sum, val) => sum + (val || 0), 0).toFixed(2);
  
  // Parâmetros ideais (baseado em objetivos comuns)
  const percentualGorduraProposta = 15; // Meta padrão
  const gorduraAtual = (peso * percentualGordura) / 100;
  const gorduraIdeal = (peso * percentualGorduraProposta) / 100;
  const massaIdeal = peso - gorduraIdeal;
  const pesoIdeal = massaIdeal + gorduraIdeal;
  const gorduraExcedente = gorduraAtual - gorduraIdeal;
  
  // Próxima avaliação (30-45 dias)
  const proximaAvaliacao = new Date(avaliacao.data_avaliacao);
  proximaAvaliacao.setDate(proximaAvaliacao.getDate() + 35);
  
  return (
    <Card className="border-gray-800 bg-gradient-to-br from-blue-900/20 to-purple-900/20 mb-4">
      <div className="p-3 sm:p-4 md:p-6">
        {/* Header com Info Principal */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4 text-center">
            <p className="text-[10px] sm:text-xs text-gray-400 mb-1">% Proposta</p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-400">{percentualGorduraProposta}%</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 sm:p-4 sm:col-span-2">
            <p className="text-[10px] sm:text-xs text-gray-400 mb-1">Objetivo do Aluno</p>
            <p className="text-xs sm:text-sm md:text-base text-white font-medium">
              {avaliacao.objetivos || 'Perda de peso e hipertrofia'}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-2">Próxima Avaliação</p>
            <p className="text-xs sm:text-sm text-gray-300">
              {proximaAvaliacao.toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        
        {/* Resultados Calculados */}
        <div className="bg-gray-900/30 rounded-lg p-3 sm:p-4 md:p-5 mb-4">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4">Resultados</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] text-gray-400 mb-1">IMC</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-white">{imc}</p>
              <p className={`text-[9px] sm:text-[10px] ${imcClass.cor} font-medium`}>{imcClass.texto}</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] text-gray-400 mb-1">RCQ</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-white">{rcq}</p>
              <p className={`text-[9px] sm:text-[10px] ${rcqClass.cor} font-medium`}>{rcqClass.texto}</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] text-gray-400 mb-1">Soma Perimetria</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-white">{somaPerimetria}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">cm</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] text-gray-400 mb-1">Soma antropometria</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-white">{somaAntropometria}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">mm</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] text-gray-400 mb-1">Gordura ideal</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-green-400">{gorduraIdeal.toFixed(2)}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Kgs</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] text-gray-400 mb-1">Massa ideal</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-blue-400">{massaIdeal.toFixed(2)}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Kgs</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] text-gray-400 mb-1">Peso Ideal</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-purple-400">{pesoIdeal.toFixed(2)}</p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Kgs</p>
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3">
              <p className="text-[9px] sm:text-[10px] text-gray-400 mb-1">Gordura Excedente</p>
              <p className="text-sm sm:text-base md:text-lg font-bold text-orange-400">
                {gorduraExcedente > 0 ? gorduraExcedente.toFixed(2) : '0.00'}
              </p>
              <p className="text-[9px] sm:text-[10px] text-gray-500">Kgs</p>
            </div>
          </div>
        </div>
        
        {/* Gráfico de Composição Corporal */}
        <div className="bg-gray-900/30 rounded-lg p-3 sm:p-4 md:p-5">
          <h3 className="text-sm sm:text-base font-semibold text-white mb-3 sm:mb-4 text-center">% de Gordura</h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-12">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-blue-500"
                    strokeWidth="8"
                    strokeDasharray={`${peso > 0 ? (massaMagra / peso) * 251.2 : 0} 251.2`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                </svg>
                <span className="absolute text-base sm:text-lg md:text-xl font-bold text-white">
                  {peso > 0 ? ((massaMagra / peso) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-2">Massa magra</p>
              <p className="text-xs sm:text-sm md:text-base font-bold text-blue-400">{massaMagra.toFixed(2)} kg</p>
            </div>
            
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32" viewBox="0 0 100 100">
                  <circle
                    className="text-gray-700"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                  />
                  <circle
                    className="text-orange-500"
                    strokeWidth="8"
                    strokeDasharray={`${(percentualGordura / 100) * 251.2} 251.2`}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="40"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                  />
                </svg>
                <span className="absolute text-base sm:text-lg md:text-xl font-bold text-white">
                  {percentualGordura.toFixed(1)}%
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-2">Gordura</p>
              <p className="text-xs sm:text-sm md:text-base font-bold text-orange-400">{percentualGordura.toFixed(2)}%</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
