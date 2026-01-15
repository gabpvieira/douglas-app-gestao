import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileDown, Loader2, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AvaliacaoFisica } from '@shared/schema';

interface AvaliacaoFisicaPDFProps {
  avaliacao: AvaliacaoFisica;
  nomeAluno: string;
}

export function AvaliacaoFisicaPDF({ avaliacao, nomeAluno }: AvaliacaoFisicaPDFProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleExport = () => {
    setIsOpen(true);
  };

  const handlePrint = () => {
    setIsGenerating(true);
    
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
        <title>Avaliação Física - ${nomeAluno}</title>
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
          
          .info-box {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 12px 15px;
            margin-bottom: 15px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }
          
          .info-row:last-child {
            margin-bottom: 0;
          }
          
          .info-label {
            font-size: 9px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .info-value {
            font-size: 12px;
            font-weight: 600;
            color: #1a1a1a;
          }
          
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 15px;
          }
          
          .metric-card {
            text-align: center;
            padding: 10px 8px;
            border-radius: 6px;
            border: 1px solid #e5e5e5;
            background: #fafafa;
          }
          
          .metric-card .value {
            font-size: 18px;
            font-weight: 700;
            color: #1a1a1a;
          }
          
          .metric-card .label {
            font-size: 9px;
            color: #666;
            margin-top: 2px;
          }
          
          .section-title {
            font-size: 13px;
            font-weight: 600;
            color: #1a1a1a;
            margin: 15px 0 10px 0;
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
          
          .measurements-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 15px;
          }
          
          .measurement-item {
            padding: 8px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            text-align: center;
          }
          
          .measurement-item .label {
            font-size: 9px;
            color: #666;
            margin-bottom: 4px;
          }
          
          .measurement-item .value {
            font-size: 12px;
            font-weight: 600;
            color: #1a1a1a;
          }
          
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
          
          @media print {
            body {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
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


  const dataAvaliacao = new Date(avaliacao.data_avaliacao + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <>
      <Button
        onClick={handleExport}
        variant="outline"
        size="sm"
        className="gap-2 border-green-500/50 text-green-400 hover:bg-green-500/10"
      >
        <FileDown className="h-4 w-4" />
        Baixar PDF
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between text-white">
              <span>Pré-visualização - Avaliação Física</span>
              <Button
                onClick={handlePrint}
                disabled={isGenerating}
                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Printer className="h-4 w-4" />
                )}
                Gerar PDF
              </Button>
            </DialogTitle>
          </DialogHeader>

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
                    <p style={{ fontSize: '10px', color: '#666' }}>Personal Trainer & Educador Físico</p>
                  </div>
                </div>
                <div className="header-right" style={{ textAlign: 'right', fontSize: '9px', color: '#666' }}>
                  <p>Gerado em:</p>
                  <p style={{ fontWeight: 600, color: '#333' }}>{dataAtual}</p>
                </div>
              </div>

              {/* Info Box */}
              <div className="info-box" style={{ background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '6px', padding: '12px 15px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <p style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Aluno(a)</p>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{nomeAluno}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Data da Avaliação</p>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{dataAvaliacao}</p>
                  </div>
                </div>
                {avaliacao.protocolo && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Protocolo</p>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.protocolo.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    {avaliacao.idade && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '9px', color: '#666', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Idade</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.idade} anos</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Métricas Principais */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '15px' }}>
                {avaliacao.peso && (
                  <div style={{ textAlign: 'center', padding: '10px 8px', borderRadius: '6px', border: '1px solid #e5e5e5', background: '#fafafa' }}>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>{avaliacao.peso} kg</p>
                    <p style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>Peso</p>
                  </div>
                )}
                {avaliacao.imc && (
                  <div style={{ textAlign: 'center', padding: '10px 8px', borderRadius: '6px', border: '1px solid #e5e5e5', background: '#fafafa' }}>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>{avaliacao.imc}</p>
                    <p style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>IMC</p>
                  </div>
                )}
                {avaliacao.percentual_gordura && (
                  <div style={{ textAlign: 'center', padding: '10px 8px', borderRadius: '6px', border: '1px solid #e5e5e5', background: '#fafafa' }}>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>{avaliacao.percentual_gordura}%</p>
                    <p style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>% Gordura</p>
                  </div>
                )}
                {avaliacao.massa_magra && (
                  <div style={{ textAlign: 'center', padding: '10px 8px', borderRadius: '6px', border: '1px solid #e5e5e5', background: '#fafafa' }}>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: '#1a1a1a' }}>{avaliacao.massa_magra} kg</p>
                    <p style={{ fontSize: '9px', color: '#666', marginTop: '2px' }}>Massa Magra</p>
                  </div>
                )}
              </div>

              {/* Circunferências */}
              {(avaliacao.circunferenciaTorax || avaliacao.circunferenciaCintura || avaliacao.circunferenciaAbdomen || 
                avaliacao.circunferenciaQuadril || avaliacao.circunferenciaBracoDireito || avaliacao.circunferenciaCoxaDireita) && (
                <>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: '15px 0 10px 0', paddingBottom: '6px', borderBottom: '2px solid #22c55e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '4px', height: '16px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }}></span>
                    Circunferências (cm)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '15px' }}>
                    {avaliacao.circunferenciaTorax && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Tórax</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.circunferenciaTorax}</p>
                      </div>
                    )}
                    {avaliacao.circunferenciaCintura && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Cintura</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.circunferenciaCintura}</p>
                      </div>
                    )}
                    {avaliacao.circunferenciaAbdomen && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Abdômen</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.circunferenciaAbdomen}</p>
                      </div>
                    )}
                    {avaliacao.circunferenciaQuadril && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Quadril</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.circunferenciaQuadril}</p>
                      </div>
                    )}
                    {avaliacao.circunferenciaBracoDireito && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Braço D</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.circunferenciaBracoDireito}</p>
                      </div>
                    )}
                    {avaliacao.circunferenciaBracoEsquerdo && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Braço E</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.circunferenciaBracoEsquerdo}</p>
                      </div>
                    )}
                    {avaliacao.circunferenciaCoxaDireita && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Coxa D</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.circunferenciaCoxaDireita}</p>
                      </div>
                    )}
                    {avaliacao.circunferenciaCoxaEsquerda && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Coxa E</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.circunferenciaCoxaEsquerda}</p>
                      </div>
                    )}
                    {avaliacao.circunferenciaPanturrilhaDireita && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Panturrilha D</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.circunferenciaPanturrilhaDireita}</p>
                      </div>
                    )}
                    {avaliacao.circunferenciaPanturrilhaEsquerda && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Panturrilha E</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.circunferenciaPanturrilhaEsquerda}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Dobras Cutâneas */}
              {(avaliacao.dobraTriceps || avaliacao.dobraPeitoral || avaliacao.dobraAbdominal || avaliacao.dobraSuprailiaca) && (
                <>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: '15px 0 10px 0', paddingBottom: '6px', borderBottom: '2px solid #22c55e', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '4px', height: '16px', background: '#22c55e', borderRadius: '2px', display: 'inline-block' }}></span>
                    Dobras Cutâneas (mm)
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '15px' }}>
                    {avaliacao.dobraTriceps && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Tríceps</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.dobraTriceps}</p>
                      </div>
                    )}
                    {avaliacao.dobraPeitoral && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Peitoral</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.dobraPeitoral}</p>
                      </div>
                    )}
                    {avaliacao.dobraSubescapular && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Subescapular</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.dobraSubescapular}</p>
                      </div>
                    )}
                    {avaliacao.dobraSuprailiaca && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Supra-ilíaca</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.dobraSuprailiaca}</p>
                      </div>
                    )}
                    {avaliacao.dobraAbdominal && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Abdominal</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.dobraAbdominal}</p>
                      </div>
                    )}
                    {avaliacao.dobraCoxa && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Coxa</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.dobraCoxa}</p>
                      </div>
                    )}
                    {avaliacao.dobraAxilarMedia && (
                      <div style={{ padding: '8px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#666', marginBottom: '4px' }}>Axilar Média</p>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#1a1a1a' }}>{avaliacao.dobraAxilarMedia}</p>
                      </div>
                    )}
                    {avaliacao.somaDobras && (
                      <div style={{ padding: '8px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '4px', textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: '#166534', marginBottom: '4px' }}>Soma Total</p>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: '#166534' }}>{avaliacao.somaDobras}</p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Observações */}
              {avaliacao.observacoes && (
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '10px 12px', marginBottom: '15px', fontSize: '10px' }}>
                  <strong style={{ color: '#1e40af', display: 'block', marginBottom: '4px' }}>Observações:</strong>
                  <p style={{ color: '#1e3a8a' }}>{avaliacao.observacoes}</p>
                </div>
              )}

              {/* Objetivos */}
              {avaliacao.objetivos && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '10px 12px', marginBottom: '15px', fontSize: '10px' }}>
                  <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>Objetivos:</strong>
                  <p style={{ color: '#166534' }}>{avaliacao.objetivos}</p>
                </div>
              )}

              {/* Footer */}
              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '2px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#666' }}>
                <div>
                  <strong style={{ color: '#1a1a1a', fontSize: '11px', display: 'block' }}>Douglas Coimbra</strong>
                  <span>Personal Trainer & Educador Físico</span>
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

export default AvaliacaoFisicaPDF;
