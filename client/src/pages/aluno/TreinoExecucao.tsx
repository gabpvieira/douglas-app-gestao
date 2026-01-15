import React, { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { Check, X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AlunoLayout from "@/components/aluno/AlunoLayout";
import TreinoHeader from "@/components/aluno/TreinoHeader";
import ExercicioCard from "@/components/aluno/ExercicioCard";
import BiSetCard from "@/components/aluno/BiSetCard";
import RestTimer from "@/components/aluno/RestTimer";
import FinalizarTreinoModal from "@/components/aluno/FinalizarTreinoModal";
import { FeedbackTreinoModal } from "@/components/FeedbackTreinoModal";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAlunoProfile } from "@/hooks/useAlunoData";
import { useTreinoEmAndamento, ExercicioEmAndamento } from "@/hooks/useTreinoEmAndamento";
import { useCreateFeedback } from "@/hooks/useFeedbackTreinos";
import { notifyInicioTreino } from "@/lib/notificationManager";
import { 
  useUltimasCargasExercicios, 
  useSalvarUltimasCargas,
  extrairCargasDeExercicios,
  obterCargaSerie 
} from "@/hooks/useUltimasCargasExercicios";

export default function TreinoExecucao() {
  const [, params] = useRoute("/aluno/treino/:fichaAlunoId");
  const [, setLocation] = useLocation();
  const fichaAlunoId = params?.fichaAlunoId;

  const [exercicios, setExercicios] = useState<ExercicioEmAndamento[]>([]);
  const [restTimer, setRestTimer] = useState<{ ativo: boolean; tempo: number; exercicioId: string; exercicioNome: string } | null>(null);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [modalFeedback, setModalFeedback] = useState(false);
  const [treinoIniciado, setTreinoIniciado] = useState(false);
  const [treinoFinalizadoId, setTreinoFinalizadoId] = useState<string | null>(null);
  const { toast } = useToast();
  const createFeedback = useCreateFeedback();
  const salvarUltimasCargas = useSalvarUltimasCargas();
  
  // Buscar perfil do aluno
  const { data: profile } = useAlunoProfile();
  const alunoId = Array.isArray(profile?.alunos)
    ? profile?.alunos[0]?.id
    : profile?.alunos?.id;

  // Hook de treino em andamento
  const {
    treinoEmAndamento,
    carregado: treinoCarregado,
    iniciarTreino,
    atualizarExercicios,
    togglePausado,
    finalizarTreino,
    calcularTempoDecorrido,
    salvarImediato,
    salvando,
  } = useTreinoEmAndamento(alunoId);

  // Buscar ficha e exercícios
  const { data: ficha, isLoading } = useQuery({
    queryKey: ["ficha-execucao", fichaAlunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fichas_alunos")
        .select(`
          *,
          fichas_treino(
            *,
            exercicios_ficha(*)
          )
        `)
        .eq("id", fichaAlunoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!fichaAlunoId,
  });

  // Extrair IDs dos exercícios para buscar últimas cargas
  const exercicioIds = ficha?.fichas_treino?.exercicios_ficha?.map((e: any) => e.id) || [];
  
  // Buscar últimas cargas dos exercícios (para pré-preencher)
  const { data: ultimasCargas, isLoading: carregandoCargas } = useUltimasCargasExercicios(
    alunoId,
    exercicioIds
  );

  // Inicializar ou retomar treino
  useEffect(() => {
    if (!ficha?.fichas_treino?.exercicios_ficha || !alunoId || !treinoCarregado || treinoIniciado) return;
    
    // Aguardar carregamento das cargas anteriores (se houver exercícios)
    if (exercicioIds.length > 0 && carregandoCargas) return;

    // Verificar se há treino em andamento para esta ficha
    if (treinoEmAndamento && treinoEmAndamento.fichaAlunoId === fichaAlunoId) {
      // Retomar treino existente
      setExercicios(treinoEmAndamento.exercicios);
      setTreinoIniciado(true);
      toast({
        title: "Treino retomado",
        description: "Continuando de onde você parou.",
      });
    } else if (!treinoEmAndamento) {
      // Iniciar novo treino - pré-preencher com cargas anteriores
      const exerciciosIniciais: ExercicioEmAndamento[] = ficha.fichas_treino.exercicios_ficha
        .sort((a: any, b: any) => a.ordem - b.ordem)
        .map((ex: any) => {
          // Buscar cargas anteriores deste exercício
          const cargasAnteriores = ultimasCargas?.[ex.id] || [];
          
          return {
            id: ex.id,
            nome: ex.nome,
            grupoMuscular: ex.grupo_muscular,
            series: ex.series,
            repeticoes: ex.repeticoes,
            descanso: ex.descanso,
            observacoes: ex.observacoes,
            tecnica: ex.tecnica,
            videoId: ex.video_id,
            bisetGrupoId: ex.biset_grupo_id,
            seriesRealizadas: Array.from({ length: ex.series }, (_, i) => {
              // Pré-preencher peso com carga anterior (se existir)
              const cargaAnterior = obterCargaSerie(cargasAnteriores, i + 1);
              return {
                numero: i + 1,
                peso: cargaAnterior, // Pré-preenchido com última carga!
                repeticoes: 0,
                concluida: false,
              };
            }),
          };
        });
      
      setExercicios(exerciciosIniciais);
      iniciarTreino(
        fichaAlunoId!,
        ficha.fichas_treino.nome,
        exerciciosIniciais,
        alunoId
      );
      setTreinoIniciado(true);
      
      // Mostrar toast se cargas foram pré-preenchidas
      const exerciciosComCarga = exerciciosIniciais.filter(ex => 
        ex.seriesRealizadas.some(s => s.peso && s.peso !== '')
      );
      if (exerciciosComCarga.length > 0) {
        toast({
          title: "Cargas carregadas",
          description: `${exerciciosComCarga.length} exercício(s) com cargas do último treino.`,
        });
      }
      
      // Notificar início do treino
      notifyInicioTreino(ficha.fichas_treino.nome).catch(err => 
        console.error('Error sending start notification:', err)
      );
    }
  }, [ficha, alunoId, treinoCarregado, treinoEmAndamento, fichaAlunoId, treinoIniciado, ultimasCargas, carregandoCargas, exercicioIds.length]);

  // Atualizar exercícios no hook quando mudar
  const exerciciosRef = useRef(exercicios);
  useEffect(() => {
    if (exercicios.length > 0 && treinoIniciado && exercicios !== exerciciosRef.current) {
      exerciciosRef.current = exercicios;
      atualizarExercicios(exercicios);
    }
  }, [exercicios, treinoIniciado, atualizarExercicios]);

  // Tempo decorrido atualizado (baseado em timestamp - funciona em background)
  const [tempoDecorrido, setTempoDecorrido] = useState(0);
  
  useEffect(() => {
    if (!treinoEmAndamento) return;

    // Atualizar imediatamente
    setTempoDecorrido(calcularTempoDecorrido());

    // Se pausado, não precisa continuar atualizando
    if (treinoEmAndamento.pausado) return;

    // Atualizar a cada 500ms para maior precisão e responsividade
    const interval = setInterval(() => {
      setTempoDecorrido(calcularTempoDecorrido());
    }, 500);

    return () => clearInterval(interval);
  }, [treinoEmAndamento, treinoEmAndamento?.pausado, calcularTempoDecorrido]);

  // Atualizar tempo quando a página volta a ficar visível (Page Visibility API)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && treinoEmAndamento && !treinoEmAndamento.pausado) {
        // Atualizar imediatamente quando voltar à aba
        setTempoDecorrido(calcularTempoDecorrido());
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [treinoEmAndamento, calcularTempoDecorrido]);


  const handleSerieCompleta = (exercicioId: string, numeroSerie: number) => {
    setExercicios((prev) => {
      const exercicioAtual = prev.find(ex => ex.id === exercicioId);
      if (!exercicioAtual) return prev;

      const novosPrev = prev.map((ex) => {
        if (ex.id === exercicioId) {
          const novasSeries = ex.seriesRealizadas.map((s) =>
            s.numero === numeroSerie ? { ...s, concluida: !s.concluida } : s
          );
          return { ...ex, seriesRealizadas: novasSeries };
        }
        return ex;
      });

      // Verificar se é parte de um Bi-set
      if (exercicioAtual.bisetGrupoId) {
        const exerciciosDoBiset = novosPrev.filter(ex => ex.bisetGrupoId === exercicioAtual.bisetGrupoId);
        const exercicioAtualizado = novosPrev.find(ex => ex.id === exercicioId);
        const serieCompleta = exercicioAtualizado?.seriesRealizadas.find(s => s.numero === numeroSerie)?.concluida;
        
        if (serieCompleta && exerciciosDoBiset.length === 2) {
          // Ordenar por ordem para identificar A e B
          const [exercicioA, exercicioB] = exerciciosDoBiset.sort((a, b) => {
            const ordemA = prev.findIndex(e => e.id === a.id);
            const ordemB = prev.findIndex(e => e.id === b.id);
            return ordemA - ordemB;
          });
          
          // Verificar se ambas as séries do par estão completas
          const serieACompleta = exercicioA.seriesRealizadas.find(s => s.numero === numeroSerie)?.concluida;
          const serieBCompleta = exercicioB.seriesRealizadas.find(s => s.numero === numeroSerie)?.concluida;
          
          // Timer de descanso só inicia quando AMBAS as séries do par estão completas
          if (serieACompleta && serieBCompleta && exercicioB.descanso > 0) {
            setRestTimer({
              ativo: true,
              tempo: exercicioB.descanso,
              exercicioId: exercicioB.id,
              exercicioNome: `Bi-Set: ${exercicioA.nome} + ${exercicioB.nome}`,
            });
          }
        }
      } else {
        // Exercício individual - comportamento original
        const exercicioAtualizado = novosPrev.find(ex => ex.id === exercicioId);
        const serieCompleta = exercicioAtualizado?.seriesRealizadas.find(s => s.numero === numeroSerie)?.concluida;
        
        if (serieCompleta && exercicioAtual.descanso > 0) {
          setRestTimer({
            ativo: true,
            tempo: exercicioAtual.descanso,
            exercicioId: exercicioAtual.id,
            exercicioNome: exercicioAtual.nome,
          });
        }
      }

      return novosPrev;
    });
  };

  const handleUpdateSerie = (
    exercicioId: string,
    numeroSerie: number,
    campo: "peso" | "repeticoes",
    valor: string | number
  ) => {
    setExercicios((prev) =>
      prev.map((ex) => {
        if (ex.id === exercicioId) {
          const novasSeries = ex.seriesRealizadas.map((s) =>
            s.numero === numeroSerie ? { ...s, [campo]: valor } : s
          );
          return { ...ex, seriesRealizadas: novasSeries };
        }
        return ex;
      })
    );
  };

  const handlePausar = () => {
    togglePausado(!treinoEmAndamento?.pausado);
  };

  const handleVoltar = () => {
    // Salvar antes de sair
    salvarImediato();
    toast({
      title: "Treino salvo",
      description: "Você pode retomar a qualquer momento.",
    });
    setLocation("/aluno/treinos");
  };

  const handleFinalizarTreino = async () => {
    let treinosSalvos = 0;
    let erros: string[] = [];
    
    try {
      // Salvar cada exercício realizado
      for (const exercicio of exercicios) {
        const seriesConcluidas = exercicio.seriesRealizadas.filter((s) => s.concluida);
        
        if (seriesConcluidas.length === 0) continue;

        try {
          // Inserir treino_realizado
          // Usar apenas a data local (sem hora) para evitar problemas de timezone
          const dataHoje = new Date();
          const dataLocal = `${dataHoje.getFullYear()}-${String(dataHoje.getMonth() + 1).padStart(2, '0')}-${String(dataHoje.getDate()).padStart(2, '0')}`;
          
          const { data: treinoRealizado, error: treinoError } = await supabase
            .from("treinos_realizados")
            .insert({
              ficha_aluno_id: fichaAlunoId,
              exercicio_id: exercicio.id,
              data_realizacao: dataLocal + 'T12:00:00Z', // Meio-dia UTC para garantir que a data seja correta
              series_realizadas: seriesConcluidas.length,
            })
            .select()
            .single();

          if (treinoError) {
            console.error(`Erro ao salvar exercício ${exercicio.nome}:`, treinoError);
            erros.push(`${exercicio.nome}: ${treinoError.message}`);
            continue;
          }

          // Inserir cada série realizada
          for (const serie of seriesConcluidas) {
            const { error: serieError } = await supabase
              .from("series_realizadas")
              .insert({
                treino_realizado_id: treinoRealizado.id,
                numero_serie: serie.numero,
                carga: serie.peso || "0",
                repeticoes: serie.repeticoes || 0,
                concluida: "true",
              });

            if (serieError) {
              console.error(`Erro ao salvar série ${serie.numero}:`, serieError);
            }
          }
          
          treinosSalvos++;
        } catch (exercicioError) {
          console.error(`Erro ao processar exercício ${exercicio.nome}:`, exercicioError);
          erros.push(`${exercicio.nome}: erro inesperado`);
        }
      }

      // Salvar últimas cargas para referência futura
      if (alunoId) {
        const cargasParaSalvar = extrairCargasDeExercicios(exercicios);
        if (cargasParaSalvar.length > 0) {
          try {
            await salvarUltimasCargas.mutateAsync({
              alunoId,
              exercicios: cargasParaSalvar,
            });
            console.log(`Cargas salvas para ${cargasParaSalvar.length} exercícios`);
          } catch (cargaError) {
            console.error('Erro ao salvar últimas cargas:', cargaError);
            // Não bloquear finalização por erro de cargas
          }
        }
      }

      // SEMPRE limpar sessão em andamento, mesmo se houve erros parciais
      await finalizarTreino();

      // Mostrar feedback apropriado
      if (erros.length === 0) {
        toast({
          title: "Treino Finalizado! 🎉",
          description: treinosSalvos > 0 
            ? `${treinosSalvos} exercício(s) salvo(s) com sucesso.`
            : "Treino finalizado.",
        });
      } else if (treinosSalvos > 0) {
        toast({
          title: "Treino Finalizado com avisos",
          description: `${treinosSalvos} exercício(s) salvo(s). Alguns não puderam ser salvos.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Treino Finalizado",
          description: "Nenhum exercício foi registrado. Marque as séries como concluídas para salvar.",
          variant: "default",
        });
      }

      // Fechar modal de finalização e abrir modal de feedback
      setModalFinalizar(false);
      setTreinoFinalizadoId(fichaAlunoId || null);
      setModalFeedback(true);
    } catch (error) {
      console.error("Erro crítico ao salvar treino:", error);
      
      // Mesmo em caso de erro crítico, tentar limpar a sessão
      try {
        await finalizarTreino();
      } catch (cleanupError) {
        console.error("Erro ao limpar sessão:", cleanupError);
      }
      
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o treino. A sessão foi encerrada.",
        variant: "destructive",
      });
      
      // Redirecionar para a página de treinos
      setModalFinalizar(false);
      setLocation("/aluno/treinos");
    }
  };

  const handleSubmitFeedback = async (estrelas: number, comentario?: string) => {
    if (!alunoId || !treinoFinalizadoId) return;

    await createFeedback.mutateAsync({
      alunoId,
      treinoId: treinoFinalizadoId,
      estrelas,
      comentario,
    });

    setModalFeedback(false);
    setLocation("/aluno/treinos");
  };

  const handleSkipFeedback = () => {
    setModalFeedback(false);
    setLocation("/aluno/treinos");
  };

  // Calcular exercícios concluídos (considerando Bi-sets como unidade)
  const calcularExerciciosConcluidos = () => {
    const processados = new Set<string>();
    let concluidos = 0;

    for (const exercicio of exercicios) {
      if (processados.has(exercicio.id)) continue;

      if (exercicio.bisetGrupoId) {
        // Encontrar parceiro do Bi-set
        const parceiro = exercicios.find(
          (e) => e.bisetGrupoId === exercicio.bisetGrupoId && e.id !== exercicio.id
        );

        if (parceiro && !processados.has(parceiro.id)) {
          // Bi-set só conta como concluído se AMBOS exercícios estão completos
          const exercicioConcluido = exercicio.seriesRealizadas.every((s) => s.concluida);
          const parceiroConcluido = parceiro.seriesRealizadas.every((s) => s.concluida);
          
          if (exercicioConcluido && parceiroConcluido) {
            concluidos++;
          }

          processados.add(exercicio.id);
          processados.add(parceiro.id);
        } else {
          // Bi-set incompleto - contar como exercício individual
          if (exercicio.seriesRealizadas.every((s) => s.concluida)) {
            concluidos++;
          }
          processados.add(exercicio.id);
        }
      } else {
        // Exercício individual
        if (exercicio.seriesRealizadas.every((s) => s.concluida)) {
          concluidos++;
        }
        processados.add(exercicio.id);
      }
    }

    return concluidos;
  };

  // Calcular total de itens (Bi-sets contam como 1)
  const calcularTotalItens = () => {
    const processados = new Set<string>();
    let total = 0;

    for (const exercicio of exercicios) {
      if (processados.has(exercicio.id)) continue;

      if (exercicio.bisetGrupoId) {
        const parceiro = exercicios.find(
          (e) => e.bisetGrupoId === exercicio.bisetGrupoId && e.id !== exercicio.id
        );

        if (parceiro && !processados.has(parceiro.id)) {
          total++;
          processados.add(exercicio.id);
          processados.add(parceiro.id);
        } else {
          total++;
          processados.add(exercicio.id);
        }
      } else {
        total++;
        processados.add(exercicio.id);
      }
    }

    return total;
  };

  const exerciciosConcluidos = calcularExerciciosConcluidos();
  const totalItens = calcularTotalItens();

  // Função para agrupar e renderizar exercícios (incluindo Bi-sets)
  const renderExercicios = () => {
    const resultado: React.ReactNode[] = [];
    const processados = new Set<string>();
    let numeroVisual = 1;

    // Ordenar exercícios pela ordem original
    const exerciciosOrdenados = [...exercicios].sort((a, b) => {
      const ordemA = ficha?.fichas_treino?.exercicios_ficha?.find((e: any) => e.id === a.id)?.ordem || 0;
      const ordemB = ficha?.fichas_treino?.exercicios_ficha?.find((e: any) => e.id === b.id)?.ordem || 0;
      return ordemA - ordemB;
    });

    for (const exercicio of exerciciosOrdenados) {
      if (processados.has(exercicio.id)) continue;

      if (exercicio.bisetGrupoId) {
        // Encontrar parceiro do Bi-set
        const parceiro = exerciciosOrdenados.find(
          (e) => e.bisetGrupoId === exercicio.bisetGrupoId && e.id !== exercicio.id
        );

        if (parceiro && !processados.has(parceiro.id)) {
          // Determinar ordem A/B baseado na ordem original
          const ordemExercicio = ficha?.fichas_treino?.exercicios_ficha?.find((e: any) => e.id === exercicio.id)?.ordem || 0;
          const ordemParceiro = ficha?.fichas_treino?.exercicios_ficha?.find((e: any) => e.id === parceiro.id)?.ordem || 0;
          
          const [exercicioA, exercicioB] = ordemExercicio < ordemParceiro
            ? [exercicio, parceiro]
            : [parceiro, exercicio];

          resultado.push(
            <BiSetCard
              key={`biset-${exercicio.bisetGrupoId}`}
              exercicioA={exercicioA}
              exercicioB={exercicioB}
              numero={numeroVisual}
              onSerieCompleta={handleSerieCompleta}
              onUpdateSerie={handleUpdateSerie}
            />
          );

          processados.add(exercicio.id);
          processados.add(parceiro.id);
          numeroVisual++;
        } else {
          // Bi-set incompleto - renderizar como exercício individual
          resultado.push(
            <ExercicioCard
              key={exercicio.id}
              exercicio={exercicio}
              numero={numeroVisual}
              onSerieCompleta={handleSerieCompleta}
              onUpdateSerie={handleUpdateSerie}
            />
          );
          processados.add(exercicio.id);
          numeroVisual++;
        }
      } else {
        // Exercício individual
        resultado.push(
          <ExercicioCard
            key={exercicio.id}
            exercicio={exercicio}
            numero={numeroVisual}
            onSerieCompleta={handleSerieCompleta}
            onUpdateSerie={handleUpdateSerie}
          />
        );
        processados.add(exercicio.id);
        numeroVisual++;
      }
    }

    return resultado;
  };

  if (isLoading || !treinoCarregado || (exercicioIds.length > 0 && carregandoCargas && !treinoEmAndamento)) {
    return (
      <AlunoLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
        </div>
      </AlunoLayout>
    );
  }

  if (!ficha) {
    return (
      <AlunoLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Ficha não encontrada</p>
          <Button onClick={() => setLocation("/aluno/treinos")} variant="secondary" className="mt-4">
            Voltar
          </Button>
        </div>
      </AlunoLayout>
    );
  }

  // Se há treino em andamento para outra ficha, mostrar aviso
  if (treinoEmAndamento && treinoEmAndamento.fichaAlunoId !== fichaAlunoId) {
    return (
      <AlunoLayout>
        <div className="max-w-md mx-auto text-center py-12 px-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-400 mb-2">
              Treino em andamento
            </h2>
            <p className="text-gray-300 mb-4">
              Você já tem um treino em andamento: <strong>{treinoEmAndamento.nomeFicha}</strong>
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Finalize ou descarte o treino atual antes de iniciar outro.
            </p>
            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => setLocation(`/aluno/treino/${treinoEmAndamento.fichaAlunoId}`)}
              >
                Retomar treino
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await finalizarTreino();
                  window.location.reload();
                }}
              >
                Descartar
              </Button>
            </div>
          </div>
        </div>
      </AlunoLayout>
    );
  }

  return (
    <AlunoLayout>
      <div className="max-w-4xl mx-auto space-y-4 pb-24 px-4 sm:px-0">
        {/* Header */}
        <TreinoHeader
          nomeFicha={ficha.fichas_treino?.nome || "Treino"}
          tempoDecorrido={tempoDecorrido}
          exerciciosConcluidos={exerciciosConcluidos}
          totalExercicios={totalItens}
          pausado={treinoEmAndamento?.pausado || false}
          onPausar={handlePausar}
          onVoltar={handleVoltar}
        />

        {/* Indicador de salvamento */}
        {salvando && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <Save className="h-4 w-4 animate-pulse" />
            Salvando progresso...
          </div>
        )}

        {/* Lista de Exercícios */}
        <div className="space-y-3">
          {renderExercicios()}
        </div>

        {/* Botão Finalizar */}
        <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-card border-t border-border p-4">
          <div className="max-w-4xl mx-auto flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={handleVoltar}
            >
              <X className="h-4 w-4 mr-2" />
              Sair e Salvar
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white"
              onClick={() => setModalFinalizar(true)}
            >
              <Check className="h-4 w-4 mr-2" />
              Finalizar Treino
            </Button>
          </div>
        </div>

        {/* Modal Finalizar */}
        <FinalizarTreinoModal
          open={modalFinalizar}
          onClose={() => setModalFinalizar(false)}
          onConfirm={handleFinalizarTreino}
          exercicios={exercicios}
          tempoDecorrido={tempoDecorrido}
          nomeFicha={ficha.fichas_treino?.nome || "Treino"}
          alunoId={alunoId}
        />

        {/* Modal Feedback */}
        <FeedbackTreinoModal
          open={modalFeedback}
          onOpenChange={(open) => {
            if (!open) {
              handleSkipFeedback();
            }
          }}
          onSubmit={handleSubmitFeedback}
          isLoading={createFeedback.isPending}
        />

        {/* Timer de Descanso */}
        {restTimer?.ativo && (
          <RestTimer
            tempoInicial={restTimer.tempo}
            exercicioNome={restTimer.exercicioNome}
            onSkip={() => setRestTimer(null)}
            onComplete={() => setRestTimer(null)}
          />
        )}
      </div>
    </AlunoLayout>
  );
}
