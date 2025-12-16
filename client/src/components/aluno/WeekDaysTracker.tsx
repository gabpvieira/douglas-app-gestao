import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface WeekDaysTrackerProps {
  alunoId: string;
  includeToday?: boolean;
}

// Dias da semana em português (D = Domingo, S = Segunda, etc.)
const DIAS_SEMANA = [
  { label: "D", nome: "Domingo" },
  { label: "S", nome: "Segunda" },
  { label: "T", nome: "Terça" },
  { label: "Q", nome: "Quarta" },
  { label: "Q", nome: "Quinta" },
  { label: "S", nome: "Sexta" },
  { label: "S", nome: "Sábado" },
];

export default function WeekDaysTracker({ alunoId, includeToday = true }: WeekDaysTrackerProps) {
  const [diasTreinados, setDiasTreinados] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buscarTreinosSemana() {
      if (!alunoId) return;

      try {
        // Calcular início e fim da semana atual (domingo a sábado)
        const hoje = new Date();
        const diaSemanaAtual = hoje.getDay(); // 0 = domingo, 6 = sábado
        
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - diaSemanaAtual);
        inicioSemana.setHours(0, 0, 0, 0);
        
        const fimSemana = new Date(inicioSemana);
        fimSemana.setDate(inicioSemana.getDate() + 6);
        fimSemana.setHours(23, 59, 59, 999);

        // Buscar treinos realizados na semana
        const { data: fichasAluno } = await supabase
          .from("fichas_alunos")
          .select("id")
          .eq("aluno_id", alunoId);

        if (!fichasAluno || fichasAluno.length === 0) {
          setDiasTreinados(includeToday ? [diaSemanaAtual] : []);
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

        // Extrair dias únicos da semana que tiveram treino
        const diasUnicos = new Set<number>();
        
        if (treinos) {
          treinos.forEach(treino => {
            const data = new Date(treino.data_realizacao);
            diasUnicos.add(data.getDay());
          });
        }

        // Incluir hoje se solicitado (treino atual sendo finalizado)
        if (includeToday) {
          diasUnicos.add(diaSemanaAtual);
        }

        setDiasTreinados(Array.from(diasUnicos));
      } catch (error) {
        console.error("Erro ao buscar treinos da semana:", error);
        if (includeToday) {
          setDiasTreinados([new Date().getDay()]);
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
