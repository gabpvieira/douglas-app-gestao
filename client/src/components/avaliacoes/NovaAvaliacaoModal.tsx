/**
 * Modal para criar nova avaliação física
 * 
 * Wizard em 3 etapas:
 * 1. Selecionar protocolo
 * 2. Preencher dados
 * 3. Visualizar resultados
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import SelecionarProtocoloStep from './SelecionarProtocoloStep';
import FormularioPollock7Dobras from './FormularioPollock7Dobras';
import FormularioPollock3Dobras from './FormularioPollock3Dobras';
import FormularioAvaliacaoManual, { type DadosAvaliacaoManual } from './FormularioAvaliacaoManual';
import ResultadosAvaliacaoCard from './ResultadosAvaliacaoCard';
import { useCreateAvaliacao } from '@/hooks/useAvaliacoesFisicas';
import type { ResultadoAvaliacao } from '@/lib/avaliacaoCalculos';

interface NovaAvaliacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alunoId?: string;
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
  alunoId 
}: NovaAvaliacaoModalProps) {
  const [step, setStep] = useState(1);
  const [protocolo, setProtocolo] = useState<Protocolo>(null);
  const [dadosAvaliacao, setDadosAvaliacao] = useState<DadosAvaliacao | null>(null);
  
  const createAvaliacao = useCreateAvaliacao();

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

    try {
      await createAvaliacao.mutateAsync({
        avaliacao: {
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
        },
      });

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
            {step === 1 && 'Nova Avaliação Física - Escolha o Protocolo'}
            {step === 2 && 'Nova Avaliação Física - Dados da Avaliação'}
            {step === 3 && 'Nova Avaliação Física - Resultados'}
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
            />
          )}

          {step === 2 && protocolo === 'pollock_3_dobras' && (
            <FormularioPollock3Dobras
              alunoId={alunoId}
              onSubmit={handleDadosSubmit}
              onVoltar={handleVoltar}
            />
          )}

          {step === 2 && protocolo === 'manual' && (
            <FormularioAvaliacaoManual
              alunoId={alunoId}
              onSubmit={handleDadosSubmit}
              onVoltar={handleVoltar}
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
                  disabled={createAvaliacao.isPending}
                >
                  {createAvaliacao.isPending ? 'Salvando...' : 'Salvar Avaliação'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
