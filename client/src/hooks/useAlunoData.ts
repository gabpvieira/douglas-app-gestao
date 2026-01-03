import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

// Hook para buscar perfil do aluno logado
export function useAlunoProfile() {
  return useQuery({
    queryKey: ["aluno-profile"],
    queryFn: async () => {
      // Buscar usuário autenticado via Supabase Auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("❌ Usuário não autenticado:", authError);
        throw new Error("Usuário não autenticado");
      }

      console.log("🔍 Buscando perfil para auth_uid:", user.id);

      // Buscar dados completos do perfil e aluno
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

      console.log("✅ Perfil completo encontrado:", data);
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

// Hook para buscar plano alimentar do aluno (via tabela de relacionamento N:N)
export function useAlunoPlanoAlimentar(alunoId: string | undefined) {
  return useQuery({
    queryKey: ["aluno-plano-alimentar", alunoId],
    queryFn: async () => {
      if (!alunoId) return null;

      console.log("🔍 [useAlunoPlanoAlimentar] Buscando plano para aluno:", alunoId);

      // Buscar planos atribuídos ao aluno via tabela de relacionamento
      const { data, error } = await supabase
        .from("planos_alunos")
        .select(`
          plano_id,
          data_atribuicao,
          planos_alimentares (
            *,
            refeicoes_plano(
              *,
              alimentos_refeicao(*)
            )
          )
        `)
        .eq("aluno_id", alunoId)
        .eq("status", "ativo")
        .order("data_atribuicao", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("❌ [useAlunoPlanoAlimentar] Erro:", error);
        throw error;
      }
      
      console.log("📊 [useAlunoPlanoAlimentar] Resultado:", data);
      
      // Extrair o plano do resultado
      if (!data || !data.planos_alimentares) {
        console.log("⚠️ [useAlunoPlanoAlimentar] Nenhum plano encontrado");
        return null;
      }
      
      return data.planos_alimentares;
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

      // Buscar treinos realizados
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

      // Agrupar por data_realizacao (timestamp completo) para separar sessões diferentes
      const sessoesPorTimestamp = data?.reduce((acc: any, treino: any) => {
        const timestamp = treino.data_realizacao;
        if (!acc[timestamp]) {
          acc[timestamp] = {
            data: treino.data_realizacao,
            exercicios: [],
          };
        }
        acc[timestamp].exercicios.push(treino);
        return acc;
      }, {});

      return Object.values(sessoesPorTimestamp || {});
    },
    enabled: !!fichaAlunoId,
  });
}
