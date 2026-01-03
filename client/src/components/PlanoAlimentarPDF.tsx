import { useState, useRef } from 'react';
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
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
    
    // Criar iframe oculto para impressão isolada
    const printContent = printRef.current?.innerHTML;
    if (!printContent) {
      setIsGenerating(false);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: 'Erro',
        description: 'Permita pop-ups para gerar o PDF.',
        variant: 'destructive'
      });
      setIsGenerating(false);
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Plano Alimentar - ${nomeAluno}</title>
        <meta charset="utf-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          @page {
            size: A4;
            margin: 15mm;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #1a1a1a;
            background: white;
          }
          
          .pdf-container {
            max-width: 100%;
            margin: 0 auto;
          }
          
          /* Header */
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-bottom: 12px;
            border-bottom: 2px solid #e5e5e5;
            margin-bottom: 15px;
          }
          
          .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          
          .header-logo {
            height: 50px;
            width: auto;
          }
          
          .header-title h1 {
            font-size: 18px;
            font-weight: 700;
            color: #1a1a1a;
            margin-bottom: 2px;
          }
          
          .header-title p {
            font-size: 10px;
            color: #666;
          }
          
          .header-right {
            text-align: right;
            font-size: 9px;
            color: #666;
          }
          
          .header-right strong {
            color: #333;
          }
          
          /* Info Box */
          .info-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px 15px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          
          .info-box .label {
            font-size: 9px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-box .value {
            font-size: 14px;
            font-weight: 600;
            color: #1a1a1a;
          }
          
          /* Macros Grid */
          .macros-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 15px;
          }
          
          .macro-card {
            text-align: center;
            padding: 10px 8px;
            border-radius: 6px;
            border: 1px solid;
          }
          
          .macro-card.calorias {
            background: #fff7ed;
            border-color: #fed7aa;
          }
          
          .macro-card.proteinas {
            background: #fef2f2;
            border-color: #fecaca;
          }
          
          .macro-card.carboidratos {
            background: #fefce8;
            border-color: #fef08a;
          }
          
          .macro-card.gorduras {
            background: #eff6ff;
            border-color: #bfdbfe;
          }
          
          .macro-card .value {
            font-size: 20px;
            font-weight: 700;
          }
          
          .macro-card.calorias .value { color: #ea580c; }
          .macro-card.proteinas .value { color: #dc2626; }
          .macro-card.carboidratos .value { color: #ca8a04; }
          .macro-card.gorduras .value { color: #2563eb; }
          
          .macro-card .label {
            font-size: 9px;
            color: #666;
            margin-top: 2px;
          }
          
          /* Observações */
          .observacoes {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 10px 12px;
            margin-bottom: 15px;
            font-size: 10px;
          }
          
          .observacoes strong {
            color: #1e40af;
            display: block;
            margin-bottom: 4px;
          }
          
          .observacoes p {
            color: #1e3a8a;
          }
          
          /* Section Title */
          .section-title {
            font-size: 13px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 10px;
            padding-bottom: 6px;
            border-bottom: 2px solid #22c55e;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          
          .section-title::before {
            content: '';
            width: 4px;
            height: 16px;
            background: #22c55e;
            border-radius: 2px;
          }
          
          /* Refeição */
          .refeicao {
            border: 1px solid #e5e5e5;
            border-radius: 6px;
            margin-bottom: 12px;
            overflow: hidden;
            page-break-inside: avoid;
          }
          
          .refeicao-header {
            background: #f8f9fa;
            padding: 8px 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #e5e5e5;
          }
          
          .refeicao-header-left {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .refeicao-numero {
            width: 24px;
            height: 24px;
            background: #22c55e;
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 700;
          }
          
          .refeicao-info h3 {
            font-size: 12px;
            font-weight: 600;
            color: #1a1a1a;
          }
          
          .refeicao-info span {
            font-size: 10px;
            color: #666;
          }
          
          .refeicao-macros {
            display: flex;
            gap: 12px;
            font-size: 10px;
          }
          
          .refeicao-macros span {
            font-weight: 600;
          }
          
          .refeicao-macros .cal { color: #ea580c; }
          .refeicao-macros .prot { color: #dc2626; }
          .refeicao-macros .carb { color: #ca8a04; }
          .refeicao-macros .gord { color: #2563eb; }
          
          /* Tabela de Alimentos */
          .alimentos-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }
          
          .alimentos-table th {
            background: #f1f5f9;
            padding: 6px 8px;
            text-align: left;
            font-weight: 600;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .alimentos-table th:not(:first-child) {
            text-align: center;
            width: 60px;
          }
          
          .alimentos-table td {
            padding: 6px 8px;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .alimentos-table td:not(:first-child) {
            text-align: center;
          }
          
          .alimentos-table tr:nth-child(even) {
            background: #fafafa;
          }
          
          .alimentos-table .cal { color: #ea580c; font-weight: 500; }
          .alimentos-table .prot { color: #dc2626; font-weight: 500; }
          .alimentos-table .carb { color: #ca8a04; font-weight: 500; }
          .alimentos-table .gord { color: #2563eb; font-weight: 500; }
          
          .refeicao-obs {
            background: #f0fdf4;
            padding: 8px 12px;
            font-size: 9px;
            color: #166534;
            border-top: 1px solid #bbf7d0;
          }
          
          /* Footer */
          .footer {
            margin-top: 20px;
            padding-top: 12px;
            border-top: 2px solid #e5e5e5;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9px;
            color: #666;
          }
          
          .footer-left strong {
            color: #1a1a1a;
            font-size: 11px;
          }
          
          .footer-right {
            text-align: right;
          }
          
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .refeicao {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `);

    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      setIsGenerating(false);
      toast({
        title: 'PDF Gerado!',
        description: 'O documento foi enviado para impressão.'
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white">
              <span className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Pré-visualização do PDF
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
                  Gerar PDF
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Preview Container */}
          <div className="bg-white rounded-lg p-6 mt-4" ref={printRef}>
            <div className="pdf-container">
              {/* Header */}
              <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '2px solid #e5e5e5', marginBottom: '15px' }}>
                <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img 
                    src="/attached_assets/logo-personal-douglas.png" 
                    alt="Douglas Coimbra"
                    className="header-logo"
                    style={{ height: '50px', width: 'auto' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="header-title">
                    <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a', marginBottom: '2px' }}>Douglas Coimbra</h1>
                    <p style={{ fontSize: '10px', color: '#666' }}>Personal Trainer & Nutricionista</p>
                  </div>
                </div>
                <div className="header-right" style={{ textAlign: 'right', fontSize: '9px', color: '#666' }}>
                  <p>Gerado em:</p>
                  <p style={{ fontWeight: 600, color: '#333' }}>{dataAtual}</p>
                </div>
              </div>

              {/* Info Box */}
              <div className="info-box" style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px', padding: '12px 15px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aluno(a)</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{nomeAluno}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Plano</p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{plano.titulo}</p>
                </div>
              </div>

              {/* Macros Grid */}
              <div className="macros-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' }}>
                <div style={{ textAlign: 'center', padding: '10px 8px', borderRadius: '6px', background: '#fff7ed', border: '1px solid #fed7aa' }}>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#ea580c' }}>{totais.calorias.toFixed(0)}</p>
                  <p style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>Calorias (kcal)</p>
                </div>
                <div style={{ textAlign: 'center', padding: '10px 8px', borderRadius: '6px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#dc2626' }}>{totais.proteinas.toFixed(0)}g</p>
                  <p style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>Proteínas</p>
                </div>
                <div style={{ textAlign: 'center', padding: '10px 8px', borderRadius: '6px', background: '#fefce8', border: '1px solid #fef08a' }}>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#ca8a04' }}>{totais.carboidratos.toFixed(0)}g</p>
                  <p style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>Carboidratos</p>
                </div>
                <div style={{ textAlign: 'center', padding: '10px 8px', borderRadius: '6px', background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <p style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>{totais.gorduras.toFixed(0)}g</p>
                  <p style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>Gorduras</p>
                </div>
              </div>

              {/* Observações */}
              {plano.observacoes && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '10px 12px', marginBottom: '15px', fontSize: '10px' }}>
                  <strong style={{ color: '#1e40af', display: 'block', marginBottom: '4px' }}>Observações Gerais:</strong>
                  <p style={{ color: '#1e3a8a' }}>{plano.observacoes}</p>
                </div>
              )}

              {/* Section Title */}
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', marginBottom: '10px', paddingBottom: '6px', borderBottom: '2px solid #22c55e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '4px', height: '16px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }}></span>
                Plano de Refeições
              </div>

              {/* Refeições */}
              {refeicoes
                .sort((a, b) => a.ordem - b.ordem)
                .map((refeicao, index) => {
                  const alimentos = refeicao.alimentos_refeicao || [];
                  const totaisRef = alimentos.reduce(
                    (sum, alimento) => ({
                      calorias: sum.calorias + (parseFloat(alimento.calorias as any) || 0),
                      proteinas: sum.proteinas + (parseFloat(alimento.proteinas as any) || 0),
                      carboidratos: sum.carboidratos + (parseFloat(alimento.carboidratos as any) || 0),
                      gorduras: sum.gorduras + (parseFloat(alimento.gorduras as any) || 0),
                    }),
                    { calorias: 0, proteinas: 0, carboidratos: 0, gorduras: 0 }
                  );

                  return (
                    <div key={refeicao.id} style={{ border: '1px solid #e5e5e5', borderRadius: '6px', marginBottom: '12px', overflow: 'hidden', pageBreakInside: 'avoid' }}>
                      {/* Header */}
                      <div style={{ background: '#f8f9fa', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e5e5' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '24px', height: '24px', background: '#22c55e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                            {index + 1}
                          </span>
                          <div>
                            <h3 style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a', margin: 0 }}>{refeicao.nome}</h3>
                            <span style={{ fontSize: '10px', color: '#666' }}>{refeicao.horario?.slice(0, 5)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
                          <span style={{ fontWeight: 600, color: '#ea580c' }}>{totaisRef.calorias.toFixed(0)} kcal</span>
                          <span style={{ fontWeight: 600, color: '#dc2626' }}>{totaisRef.proteinas.toFixed(0)}g P</span>
                          <span style={{ fontWeight: 600, color: '#ca8a04' }}>{totaisRef.carboidratos.toFixed(0)}g C</span>
                          <span style={{ fontWeight: 600, color: '#2563eb' }}>{totaisRef.gorduras.toFixed(0)}g G</span>
                        </div>
                      </div>

                      {/* Tabela */}
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                        <thead>
                          <tr style={{ background: '#f1f5f9' }}>
                            <th style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>Alimento</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', width: '70px' }}>Qtd</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', width: '55px' }}>Kcal</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', width: '50px' }}>Prot</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', width: '50px' }}>Carb</th>
                            <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: '#475569', borderBottom: '1px solid #e2e8f0', width: '50px' }}>Gord</th>
                          </tr>
                        </thead>
                        <tbody>
                          {alimentos
                            .sort((a, b) => a.ordem - b.ordem)
                            .map((alimento, idx) => (
                              <tr key={alimento.id} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}>
                                <td style={{ padding: '6px 8px', borderBottom: '1px solid #f1f5f9', color: '#1a1a1a' }}>{alimento.nome}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', color: '#666' }}>{alimento.quantidade} {alimento.unidade}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', color: '#ea580c', fontWeight: 500 }}>{alimento.calorias}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', color: '#dc2626', fontWeight: 500 }}>{alimento.proteinas}g</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', color: '#ca8a04', fontWeight: 500 }}>{alimento.carboidratos}g</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', borderBottom: '1px solid #f1f5f9', color: '#2563eb', fontWeight: 500 }}>{alimento.gorduras}g</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>

                      {/* Observações da Refeição */}
                      {refeicao.observacoes && (
                        <div style={{ background: '#f0fdf4', padding: '8px 12px', fontSize: '9px', color: '#166534', borderTop: '1px solid #bbf7d0' }}>
                          💡 {refeicao.observacoes}
                        </div>
                      )}
                    </div>
                  );
                })}

              {/* Footer */}
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '2px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#666' }}>
                <div>
                  <strong style={{ color: '#1a1a1a', fontSize: '11px', display: 'block' }}>Douglas Coimbra</strong>
                  <span>Personal Trainer & Nutricionista</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p>Este documento é de uso exclusivo do aluno.</p>
                  <p>Gerado em {dataAtual}</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PlanoAlimentarPDF;
