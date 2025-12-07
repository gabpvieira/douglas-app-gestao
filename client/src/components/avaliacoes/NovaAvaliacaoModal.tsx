/**
 * Modal para criar nova avaliação física
 * 
 * Wizard em 3 etapas:
 * 1. Selecionar protocolo
 * 2. Preencher dados
 * 3. Visualizar resultados
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SelecionarProtocoloStep from './SelecionarProtocoloStep';
import FormularioPollock7Dobras from './FormularioPollock7Dobras';
import FormularioPollock3Dobras from './FormularioPollock3Dobras';
import FormularioAvaliacaoManual, { type DadosAvaliacaoManual } from './FormularioAvaliacaoManual';
import ResultadosAvaliacaoCard from './ResultadosAvaliacaoCard';
import { useCreateAvaliacao, useUpdateAvaliacao } from '@/hooks/useAvaliacoesFisicas';
import type { ResultadoAvaliacao } from '@/lib/avaliacaoCalculos';

interface NovaAvaliacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoId?: string;
  avaliacaoEditando?: any;
}

type Protocolo = 'pollock_7_dobras' | 'pollock_3_dobras' | 'manual' | null;

interface DadosAvaliacao {
  alunoId: string;
  dataAvaliacao: string;
  peso: number;
  altura: number;
  idade: number;
  genero: 'masculino' | 'feminino';
  protocolo: string;
  resultado?: ResultadoAvaliacao;
  dobras?: any;
  perimetria?: any;
  observacoes?: string;
}

export default function NovaAvaliacaoModal({ 
  open, 
  onOpenChange,
  alunoId,
  avaliacaoEditando 
}: NovaAvaliacaoModalProps) {
  const [step, setStep] = useState(1);
  const [protocolo, setProtocolo] = useState<Protocolo>(null);
  const [dadosAvaliacao, setDadosAvaliacao] = useState<DadosAvaliacao | null>(null);
  
  const createAvaliacao = useCreateAvaliacao();
  const updateAvaliacao = useUpdateAvaliacao();

  // Carregar dados da avaliação quando estiver editando
  useEffect(() => {
    if (avaliacaoEditando && open) {
      // Definir protocolo
      const protocoloAvaliacao = avaliacaoEditando.protocolo as Protocolo;
      setProtocolo(protocoloAvaliacao);
      
      // Pular para o step 2 (formulário) diretamente
      setStep(2);
      
      // Preparar dados da avaliação para edição
      // Formato "flat" para os formulários React Hook Form
      const dadosParaEdicao: any = {
        alunoId: avaliacaoEditando.alunoId,
        dataAvaliacao: avaliacaoEditando.dataAvaliacao || new Date().toISOString().split('T')[0],
        peso: parseFloat(avaliacaoEditando.peso) || 0,
        altura: avaliacaoEditando.altura || 0,
        idade: avaliacaoEditando.idade || 0,
        genero: avaliacaoEditando.genero || 'masculino',
        protocolo: avaliacaoEditando.protocolo || 'manual',
        observacoes: avaliacaoEditando.observacoes || '',
        // Dobras cutâneas (flat)
        triceps: parseFloat(avaliacaoEditando.dobra_triceps) || 0,
        subescapular: parseFloat(avaliacaoEditando.dobra_subescapular) || 0,
        peitoral: parseFloat(avaliacaoEditando.dobra_peitoral) || 0,
        axilarMedia: parseFloat(avaliacaoEditando.dobra_axilar_media) || 0,
        suprailiaca: parseFloat(avaliacaoEditando.dobra_suprailiaca) || 0,
        abdominal: parseFloat(avaliacaoEditando.dobra_abdominal) || 0,
        coxa: parseFloat(avaliacaoEditando.dobra_coxa) || 0,
        // Perimetria (flat)
        torax: parseFloat(avaliacaoEditando.circunferencia_torax) || undefined,
        cintura: parseFloat(avaliacaoEditando.circunferencia_cintura) || undefined,
        abdomen: parseFloat(avaliacaoEditando.circunferencia_abdomen) || undefined,
        quadril: parseFloat(avaliacaoEditando.circunferencia_quadril) || undefined,
        bracoDireito: parseFloat(avaliacaoEditando.circunferencia_braco_direito) || undefined,
        bracoEsquerdo: parseFloat(avaliacaoEditando.circunferencia_braco_esquerdo) || undefined,
        coxaDireita: parseFloat(avaliacaoEditando.circunferencia_coxa_direita) || undefined,
        coxaEsquerda: parseFloat(avaliacaoEditando.circunferencia_coxa_esquerda) || undefined,
      };
      
      setDadosAvaliacao(dadosParaEdicao);
    } else if (!open) {
      // Reset quando fechar
      setStep(1);
      setProtocolo(null);
      setDadosAvaliacao(null);
    }
  }, [avaliacaoEditando, open]);

  const handleProtocoloSelect = (selectedProtocolo: Protocolo) => {
    setProtocolo(selectedProtocolo);
    setStep(2);
  };

  const handleDadosSubmit = (dados: DadosAvaliacao) => {
    setDadosAvaliacao(dados);
    setStep(3);
  };

  const handleVoltar = () => {
    if (step === 2) {
      setStep(1);
      setProtocolo(null);
    } else if (step === 3) {
      setStep(2);
    }
  };

  const handleSalvar = async () => {
    if (!dadosAvaliacao) return;

    const dadosParaSalvar = {
      aluno_id: dadosAvaliacao.alunoId,
      data_avaliacao: dadosAvaliacao.dataAvaliacao,
      peso: dadosAvaliacao.peso.toString(),
      altura: dadosAvaliacao.altura,
      imc: dadosAvaliacao.resultado?.imc.toString(),
      percentual_gordura: dadosAvaliacao.resultado?.percentualGordura.toString(),
      massa_magra: dadosAvaliacao.resultado?.massaMagra.toString(),
      massa_gorda: dadosAvaliacao.resultado?.massaGorda.toString(),
      observacoes: dadosAvaliacao.observacoes,
      protocolo: dadosAvaliacao.protocolo,
      genero: dadosAvaliacao.genero,
      idade: dadosAvaliacao.idade,
      densidade_corporal: dadosAvaliacao.resultado?.densidadeCorporal.toString(),
      peso_ideal: dadosAvaliacao.resultado?.pesoIdeal.toString(),
      classificacao_gordura: dadosAvaliacao.resultado?.classificacao,
      soma_dobras: dadosAvaliacao.resultado?.somaDobras.toString(),
      // Dobras individuais se disponíveis
      ...(dadosAvaliacao.dobras && {
        dobra_triceps: dadosAvaliacao.dobras.triceps?.toString(),
        dobra_subescapular: dadosAvaliacao.dobras.subescapular?.toString(),
        dobra_peitoral: dadosAvaliacao.dobras.peitoral?.toString(),
        dobra_axilar_media: dadosAvaliacao.dobras.axilarMedia?.toString(),
        dobra_suprailiaca: dadosAvaliacao.dobras.suprailiaca?.toString(),
        dobra_abdominal: dadosAvaliacao.dobras.abdominal?.toString(),
        dobra_coxa: dadosAvaliacao.dobras.coxa?.toString(),
      }),
      // Perimetria básica
      ...(dadosAvaliacao.perimetria && {
        circunferencia_torax: dadosAvaliacao.perimetria.torax?.toString(),
        circunferencia_cintura: dadosAvaliacao.perimetria.cintura?.toString(),
        circunferencia_abdomen: dadosAvaliacao.perimetria.abdomen?.toString(),
        circunferencia_quadril: dadosAvaliacao.perimetria.quadril?.toString(),
        circunferencia_braco_direito: dadosAvaliacao.perimetria.bracoDireito?.toString(),
        circunferencia_braco_esquerdo: dadosAvaliacao.perimetria.bracoEsquerdo?.toString(),
        circunferencia_coxa_direita: dadosAvaliacao.perimetria.coxaDireita?.toString(),
        circunferencia_coxa_esquerda: dadosAvaliacao.perimetria.coxaEsquerda?.toString(),
      }),
    };

    try {
      if (avaliacaoEditando) {
        // Modo edição - atualizar avaliação existente
        await updateAvaliacao.mutateAsync({
          id: avaliacaoEditando.id,
          data: dadosParaSalvar,
        });
      } else {
        // Modo criação - criar nova avaliação
        await createAvaliacao.mutateAsync({
          avaliacao: dadosParaSalvar,
        });
      }

      // Fechar modal e resetar
      onOpenChange(false);
      setTimeout(() => {
        setStep(1);
        setProtocolo(null);
        setDadosAvaliacao(null);
      }, 300);
    } catch (error) {
      console.error('Erro ao salvar avaliação:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setStep(1);
      setProtocolo(null);
      setDadosAvaliacao(null);
    }, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {avaliacaoEditando ? (
              <>
                {step === 1 && 'Editar Avaliação Física - Escolha o Protocolo'}
                {step === 2 && 'Editar Avaliação Física - Dados da Avaliação'}
                {step === 3 && 'Editar Avaliação Física - Resultados'}
              </>
            ) : (
              <>
                {step === 1 && 'Nova Avaliação Física - Escolha o Protocolo'}
                {step === 2 && 'Nova Avaliação Física - Dados da Avaliação'}
                {step === 3 && 'Nova Avaliação Física - Resultados'}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          {/* Etapa 1: Selecionar Protocolo */}
          {step === 1 && (
            <SelecionarProtocoloStep onSelect={handleProtocoloSelect} />
          )}

          {/* Etapa 2: Formulário de Dados */}
          {step === 2 && protocolo === 'pollock_7_dobras' && (
            <FormularioPollock7Dobras
              alunoId={alunoId}
              onSubmit={handleDadosSubmit}
              onVoltar={handleVoltar}
              dadosIniciais={dadosAvaliacao}
            />
          )}

          {step === 2 && protocolo === 'pollock_3_dobras' && (
            <FormularioPollock3Dobras
              alunoId={alunoId}
              onSubmit={handleDadosSubmit}
              onVoltar={handleVoltar}
              dadosIniciais={dadosAvaliacao}
            />
          )}

          {step === 2 && protocolo === 'manual' && (
            <FormularioAvaliacaoManual
              alunoId={alunoId}
              onSubmit={handleDadosSubmit}
              onVoltar={handleVoltar}
              dadosIniciais={dadosAvaliacao}
            />
          )}

          {/* Etapa 3: Resultados */}
          {step === 3 && dadosAvaliacao?.resultado && (
            <div className="space-y-4">
              <ResultadosAvaliacaoCard resultado={dadosAvaliacao.resultado} />
              
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleVoltar}
                  disabled={createAvaliacao.isPending}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleSalvar}
                  disabled={createAvaliacao.isPending || updateAvaliacao.isPending}
                >
                  {(createAvaliacao.isPending || updateAvaliacao.isPending) 
                    ? 'Salvando...' 
                    : avaliacaoEditando 
                      ? 'Atualizar Avaliação' 
                      : 'Salvar Avaliação'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
