import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface WeekDaysTrackerProps {
  alunoId: string;
  includeToday?: boolean;
}

// Dias da semana em português - SEGUNDA-FEIRA como início (padrão brasileiro)
const DIAS_SEMANA = [
  { label: "S", nome: "Segunda" },
  { label: "T", nome: "Terça" },
  { label: "Q", nome: "Quarta" },
  { label: "Q", nome: "Quinta" },
  { label: "S", nome: "Sexta" },
  { label: "S", nome: "Sábado" },
  { label: "D", nome: "Domingo" },
];

// Converte o índice do JavaScript (0=dom, 1=seg...) para índice brasileiro (0=seg, 1=ter...)
function converterDiaParaIndiceBR(diaJS: number): number {
  // diaJS: 0=dom, 1=seg, 2=ter, 3=qua, 4=qui, 5=sex, 6=sab
  // indiceBR: 0=seg, 1=ter, 2=qua, 3=qui, 4=sex, 5=sab, 6=dom
  return diaJS === 0 ? 6 : diaJS - 1;
}

export default function WeekDaysTracker({ alunoId, includeToday = true }: WeekDaysTrackerProps) {
  const [diasTreinados, setDiasTreinados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarTreinosSemana() {
      if (!alunoId) return;

      try {
        // Calcular início e fim da semana atual (SEGUNDA a DOMINGO - padrão brasileiro)
        const hoje = new Date();
        const diaSemanaAtual = hoje.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
        
        // Calcular dias para voltar até segunda-feira
        const diasParaVoltar = diaSemanaAtual === 0 ? 6 : diaSemanaAtual - 1;
        
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - diasParaVoltar);
        inicioSemana.setHours(0, 0, 0, 0);
        
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6); // Segunda + 6 = Domingo
        fimSemana.setHours(23, 59, 59, 999);

        // Buscar treinos realizados na semana
        const { data: fichasAluno } = await supabase
          .from("fichas_alunos")
          .select("id")
          .eq("aluno_id", alunoId);

        if (!fichasAluno || fichasAluno.length === 0) {
          setDiasTreinados(includeToday ? [converterDiaParaIndiceBR(diaSemanaAtual)] : []);
          setLoading(false);
          return;
        }

        const fichaIds = fichasAluno.map(f => f.id);

        const { data: treinos } = await supabase
          .from("treinos_realizados")
          .select("data_realizacao")
          .in("ficha_aluno_id", fichaIds)
          .gte("data_realizacao", inicioSemana.toISOString())
          .lte("data_realizacao", fimSemana.toISOString());

        // Extrair dias únicos da semana que tiveram treino (convertendo para índice BR)
        const diasUnicos = new Set<number>();
        
        if (treinos) {
          treinos.forEach(treino => {
            const data = new Date(treino.data_realizacao);
            diasUnicos.add(converterDiaParaIndiceBR(data.getDay()));
          });
        }

        // Incluir hoje se solicitado (treino atual sendo finalizado)
        if (includeToday) {
          diasUnicos.add(converterDiaParaIndiceBR(diaSemanaAtual));
        }

        setDiasTreinados(Array.from(diasUnicos));
      } catch (error) {
        console.error("Erro ao buscar treinos da semana:", error);
        if (includeToday) {
          setDiasTreinados([converterDiaParaIndiceBR(new Date().getDay())]);
        }
      } finally {
        setLoading(false);
      }
    }

    buscarTreinosSemana();
  }, [alunoId, includeToday]);

  if (loading) {
    return (
      <div className="flex justify-center gap-2 py-4">
        {DIAS_SEMANA.map((_, index) => (
          <div key={index} className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 rounded-full bg-secondary animate-pulse" />
            <span className="text-xs text-muted-foreground">-</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-2 py-4">
      {DIAS_SEMANA.map((dia, index) => {
        const treinouNesteDia = diasTreinados.includes(index);
        
        return (
          <div key={index} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                treinouNesteDia
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-transparent border-primary/30 text-muted-foreground"
              )}
            >
              {treinouNesteDia ? (
                <Check className="w-5 h-5" />
              ) : null}
            </div>
            <span className={cn(
              "text-xs font-medium",
              treinouNesteDia ? "text-primary" : "text-muted-foreground"
            )}>
              {dia.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
