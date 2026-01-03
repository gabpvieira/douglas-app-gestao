import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileDown, Loader2, Crown, X, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Alimento {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  categoria?: string;
  ordem: number;
}

interface Refeicao {
  id: string;
  nome: string;
  horario: string;
  ordem: number;
  observacoes?: string;
  alimentos_refeicao?: Alimento[];
}

interface PlanoAlimentar {
  id: string;
  titulo: string;
  observacoes?: string;
  refeicoes_plano?: Refeicao[];
}

interface PlanoAlimentarPDFProps {
  plano: PlanoAlimentar;
  nomeAluno: string;
  isPremium?: boolean;
}

export function PlanoAlimentarPDF({ plano, nomeAluno, isPremium = true }: PlanoAlimentarPDFProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Calcular totais
  const refeicoes = plano.refeicoes_plano || [];
  const totais = refeicoes.reduce(
    (acc, ref) => {
      const alimentos = ref.alimentos_refeicao || [];
      alimentos.forEach(alimento => {
        acc.calorias += parseFloat(alimento.calorias as any) || 0;
        acc.proteinas += parseFloat(alimento.proteinas as any) || 0;
        acc.carboidratos += parseFloat(alimento.carboidratos as any) || 0;
        acc.gorduras += parseFloat(alimento.gorduras as any) || 0;
      });
      return acc;
    },
    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
  );

  const handleExport = () => {
    if (!isPremium) {
      toast({
        title: 'Funcionalidade Premium',
        description: 'Faça upgrade para exportar planos alimentares em PDF.',
        variant: 'destructive'
      });
      return;
    }
    setIsOpen(true);
  };

  const handlePrint = () => {
    setIsGenerating(true);
    setTimeout(() => {
      window.print();
      setIsGenerating(false);
      toast({
        title: 'PDF Gerado!',
        description: 'Use Ctrl+P ou Cmd+P para salvar como PDF.'
      });
    }, 500);
  };

  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <>
      <Button
        onClick={handleExport}
        variant="outline"
        size="sm"
        className={`gap-2 ${isPremium ? 'border-amber-500/50 text-amber-400 hover:bg-amber-500/10' : 'border-gray-600 text-gray-400'}`}
      >
        {isPremium ? <Crown className="h-4 w-4" /> : <FileDown className="h-4 w-4" />}
        Exportar PDF
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 print:shadow-none print:max-w-none print:max-h-none print:overflow-visible">
          <DialogHeader className="print:hidden">
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Exportar Plano Alimentar
              </span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePrint}
                  disabled={isGenerating}
                  className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Printer className="h-4 w-4" />
                  )}
                  Imprimir / Salvar PDF
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Conteúdo do PDF */}
          <div className="pdf-content bg-white p-8 print:p-0" id="plano-pdf">
            {/* Cabeçalho */}
            <div className="flex items-center justify-between border-b-2 border-gray-200 pb-6 mb-6">
              <div className="flex items-center gap-4">
                <img 
                  src="/attached_assets/logo-personal-douglas.png" 
                  alt="Douglas Coimbra" 
                  className="h-16 w-auto object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Douglas Coimbra</h1>
                  <p className="text-sm text-gray-500">Personal Trainer & Nutricionista</p>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Gerado em:</p>
                <p className="font-medium text-gray-700">{dataAtual}</p>
              </div>
            </div>

            {/* Informações do Aluno */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Aluno(a)</p>
                  <p className="text-xl font-semibold text-gray-900">{nomeAluno}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Plano</p>
                  <p className="text-lg font-medium text-gray-900">{plano.titulo}</p>
                </div>
              </div>
            </div>

            {/* Resumo Nutricional */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-amber-500 rounded"></span>
                Resumo Nutricional Diário
              </h2>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-orange-600">{totais.calorias.toFixed(0)}</p>
                  <p className="text-sm text-orange-700 font-medium">Calorias (kcal)</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">{totais.proteinas.toFixed(0)}g</p>
                  <p className="text-sm text-red-700 font-medium">Proteínas</p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-600">{totais.carboidratos.toFixed(0)}g</p>
                  <p className="text-sm text-yellow-700 font-medium">Carboidratos</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{totais.gorduras.toFixed(0)}g</p>
                  <p className="text-sm text-blue-700 font-medium">Gorduras</p>
                </div>
              </div>
            </div>

            {/* Observações do Plano */}
            {plano.observacoes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-sm font-medium text-blue-800 mb-1">Observações Gerais:</p>
                <p className="text-sm text-blue-700">{plano.observacoes}</p>
              </div>
            )}

            {/* Refeições */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-1 h-6 bg-green-500 rounded"></span>
                Plano de Refeições
              </h2>
              
              <div className="space-y-6">
                {refeicoes
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((refeicao, index) => {
                    const alimentos = refeicao.alimentos_refeicao || [];
                    const totaisRefeicao = alimentos.reduce(
                      (sum, alimento) => ({
                        calorias: sum.calorias + (parseFloat(alimento.calorias as any) || 0),
                        proteinas: sum.proteinas + (parseFloat(alimento.proteinas as any) || 0),
                        carboidratos: sum.carboidratos + (parseFloat(alimento.carboidratos as any) || 0),
                        gorduras: sum.gorduras + (parseFloat(alimento.gorduras as any) || 0),
                      }),
                      { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
                    );

                    return (
                      <div key={refeicao.id} className="border border-gray-200 rounded-lg overflow-hidden print:break-inside-avoid">
                        {/* Header da Refeição */}
                        <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </span>
                            <div>
                              <h3 className="font-semibold text-gray-900">{refeicao.nome}</h3>
                              <p className="text-sm text-gray-500">{refeicao.horario?.slice(0, 5)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-orange-600 font-medium">{totaisRefeicao.calorias.toFixed(0)} kcal</span>
                            <span className="text-red-600 font-medium">{totaisRefeicao.proteinas.toFixed(0)}g P</span>
                            <span className="text-yellow-600 font-medium">{totaisRefeicao.carboidratos.toFixed(0)}g C</span>
                            <span className="text-blue-600 font-medium">{totaisRefeicao.gorduras.toFixed(0)}g G</span>
                          </div>
                        </div>

                        {/* Tabela de Alimentos */}
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-2 font-medium text-gray-600">Alimento</th>
                              <th className="text-center px-2 py-2 font-medium text-gray-600">Qtd</th>
                              <th className="text-center px-2 py-2 font-medium text-gray-600">Kcal</th>
                              <th className="text-center px-2 py-2 font-medium text-gray-600">Prot</th>
                              <th className="text-center px-2 py-2 font-medium text-gray-600">Carb</th>
                              <th className="text-center px-2 py-2 font-medium text-gray-600">Gord</th>
                            </tr>
                          </thead>
                          <tbody>
                            {alimentos
                              .sort((a, b) => a.ordem - b.ordem)
                              .map((alimento, idx) => (
                                <tr key={alimento.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-4 py-2 text-gray-900">{alimento.nome}</td>
                                  <td className="text-center px-2 py-2 text-gray-600">{alimento.quantidade} {alimento.unidade}</td>
                                  <td className="text-center px-2 py-2 text-orange-600">{alimento.calorias}</td>
                                  <td className="text-center px-2 py-2 text-red-600">{alimento.proteinas}g</td>
                                  <td className="text-center px-2 py-2 text-yellow-600">{alimento.carboidratos}g</td>
                                  <td className="text-center px-2 py-2 text-blue-600">{alimento.gorduras}g</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>

                        {/* Observações da Refeição */}
                        {refeicao.observacoes && (
                          <div className="px-4 py-2 bg-blue-50 border-t border-blue-100">
                            <p className="text-xs text-blue-700">💡 {refeicao.observacoes}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Rodapé */}
            <div className="border-t-2 border-gray-200 pt-6 mt-8">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  <p className="font-semibold text-gray-700">Douglas Coimbra</p>
                  <p>Personal Trainer & Nutricionista</p>
                </div>
                <div className="text-right">
                  <p className="text-xs">Este documento é de uso exclusivo do aluno.</p>
                  <p className="text-xs">Gerado em {dataAtual}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estilos de impressão */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #plano-pdf, #plano-pdf * {
            visibility: visible;
          }
          #plano-pdf {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </>
  );
}

export default PlanoAlimentarPDF;
