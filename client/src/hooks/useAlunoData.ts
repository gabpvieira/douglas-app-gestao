import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Hook para buscar perfil do aluno logado
export function useAlunoProfile() {
  return useQuery({
    queryKey: ["aluno-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("❌ Usuário não autenticado");
        throw new Error("Usuário não autenticado");
      }

      console.log("🔍 Buscando perfil para auth_uid:", user.id);

      const { data, error } = await supabase
        .from("users_profile")
        .select(`
          *,
          alunos(*)
        `)
        .eq("auth_uid", user.id)
        .single();

      if (error) {
        console.error("❌ Erro ao buscar perfil:", error);
        throw error;
      }

      console.log("✅ Perfil encontrado:", data);
      return data;
    },
  });
}

// Hook para buscar fichas de treino do aluno
export function useAlunoFichas(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["aluno-fichas", alunoId],
    queryFn: async () => {
      if (!alunoId) {
        console.log("⚠️ alunoId não fornecido");
        return [];
      }

      console.log("🔍 Buscando fichas para aluno_id:", alunoId);

      const { data, error } = await supabase
        .from("fichas_alunos")
        .select(`
          *,
          fichas_treino(
            *,
            exercicios_ficha(*)
          )
        `)
        .eq("aluno_id", alunoId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Erro ao buscar fichas:", error);
        throw error;
      }

      console.log("✅ Fichas encontradas:", data?.length || 0, data);
      return data;
    },
    enabled: !!alunoId,
  });
}

// Hook para buscar plano alimentar do aluno
export function useAlunoPlanoAlimentar(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["aluno-plano-alimentar", alunoId],
    queryFn: async () => {
      if (!alunoId) return null;

      const { data, error } = await supabase
        .from("planos_alimentares")
        .select(`
          *,
          refeicoes_plano(
            *,
            alimentos_refeicao(*)
          )
        `)
        .eq("aluno_id", alunoId)
        .order("data_criacao", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!alunoId,
  });
}

// Hook para buscar agendamentos do aluno
export function useAlunoAgendamentos(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["aluno-agendamentos", alunoId],
    queryFn: async () => {
      if (!alunoId) return [];

      const { data, error } = await supabase
        .from("agendamentos_presenciais")
        .select("*")
        .eq("aluno_id", alunoId)
        .gte("data_agendamento", new Date().toISOString().split("T")[0])
        .order("data_agendamento", { ascending: true })
        .order("hora_inicio", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!alunoId,
  });
}

// Hook para buscar evolução do aluno
export function useAlunoEvolucao(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["aluno-evolucao", alunoId],
    queryFn: async () => {
      if (!alunoId) return [];

      const { data, error } = await supabase
        .from("evolucoes")
        .select("*")
        .eq("aluno_id", alunoId)
        .order("data", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!alunoId,
  });
}

// Hook para buscar fotos de progresso
export function useAlunoFotosProgresso(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["aluno-fotos-progresso", alunoId],
    queryFn: async () => {
      if (!alunoId) return [];

      const { data, error } = await supabase
        .from("fotos_progresso")
        .select("*")
        .eq("aluno_id", alunoId)
        .order("data", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!alunoId,
  });
}

// Hook para buscar assinatura do aluno
export function useAlunoAssinatura(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["aluno-assinatura", alunoId],
    queryFn: async () => {
      if (!alunoId) return null;

      const { data, error } = await supabase
        .from("assinaturas")
        .select(`
          *,
          pagamentos(*)
        `)
        .eq("aluno_id", alunoId)
        .eq("status", "ativa")
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!alunoId,
  });
}

// Hook para buscar todos os vídeos disponíveis
export function useVideosDisponiveis() {
  return useQuery({
    queryKey: ["videos-disponiveis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("treinos_video")
        .select("*")
        .order("data_upload", { ascending: false});

      if (error) throw error;
      return data;
    },
  });
}

// Hook para buscar histórico de treinos realizados
export function useHistoricoTreinos(fichaAlunoId: string | undefined) {
  return useQuery({
    queryKey: ["historico-treinos", fichaAlunoId],
    queryFn: async () => {
      if (!fichaAlunoId) return [];

      console.log("🔍 Buscando histórico para ficha_aluno_id:", fichaAlunoId);

      // Buscar treinos realizados agrupados por data
      const { data, error } = await supabase
        .from("treinos_realizados")
        .select(`
          *,
          exercicios_ficha:exercicio_id(
            nome,
            grupo_muscular
          ),
          series_realizadas(*)
        `)
        .eq("ficha_aluno_id", fichaAlunoId)
        .order("data_realizacao", { ascending: false });

      if (error) {
        console.error("❌ Erro ao buscar histórico:", error);
        throw error;
      }

      console.log("✅ Histórico encontrado:", data?.length || 0, "registros");

      // Agrupar por data de realização
      const treinosPorData = data?.reduce((acc: any, treino: any) => {
        const data = new Date(treino.data_realizacao).toLocaleDateString("pt-BR");
        if (!acc[data]) {
          acc[data] = {
            data: treino.data_realizacao,
            exercicios: [],
          };
        }
        acc[data].exercicios.push(treino);
        return acc;
      }, {});

      return Object.values(treinosPorData || {});
    },
    enabled: !!fichaAlunoId,
  });
}
