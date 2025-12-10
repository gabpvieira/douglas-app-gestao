import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { InsertFeedbackTreino, FeedbackTreino } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Query key factory
const feedbackKeys = {
  all: ["feedbacks"] as const,
  byAluno: (alunoId: string) => ["feedbacks", "aluno", alunoId] as const,
  byTreino: (treinoId: string) => ["feedbacks", "treino", treinoId] as const,
  admin: () => ["feedbacks", "admin"] as const,
};

// Hook para buscar feedbacks de um aluno específico
export function useFeedbacksByAluno(alunoId: string | undefined) {
  return useQuery({
    queryKey: feedbackKeys.byAluno(alunoId || ""),
    queryFn: async () => {
      if (!alunoId) return [];
      
      const { data, error } = await supabase
        .from("feedback_treinos")
        .select("*")
        .eq("aluno_id", alunoId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as FeedbackTreino[];
    },
    enabled: !!alunoId,
  });
}

// Hook para buscar feedback de um treino específico
export function useFeedbackByTreino(treinoId: string | undefined) {
  return useQuery({
    queryKey: feedbackKeys.byTreino(treinoId || ""),
    queryFn: async () => {
      if (!treinoId) return null;
      
      const { data, error } = await supabase
        .from("feedback_treinos")
        .select("*")
        .eq("treino_id", treinoId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Não encontrado
        throw error;
      }
      return data as FeedbackTreino;
    },
    enabled: !!treinoId,
  });
}

// Hook para buscar todos os feedbacks (admin)
export function useFeedbacksAdmin() {
  return useQuery({
    queryKey: feedbackKeys.admin(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback_treinos")
        .select(`
          *,
          alunos!inner(
            id,
            user_profile_id,
            users_profile!inner(
              nome,
              email
            )
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Transformar dados para formato mais amigável
      return data.map((feedback: any) => ({
        ...feedback,
        aluno_nome: feedback.alunos?.users_profile?.nome || "Desconhecido",
        aluno_email: feedback.alunos?.users_profile?.email || "",
      }));
    },
  });
}

// Hook para criar feedback
export function useCreateFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (feedback: InsertFeedbackTreino) => {
      // Converter camelCase para snake_case para o Supabase
      const feedbackData = {
        aluno_id: feedback.alunoId,
        treino_id: feedback.treinoId,
        estrelas: feedback.estrelas,
        comentario: feedback.comentario,
      };

      const { data, error } = await supabase
        .from("feedback_treinos")
        .insert(feedbackData)
        .select()
        .single();

      if (error) throw error;
      return data as any;
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.byAluno(data.aluno_id) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.byTreino(data.treino_id) });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.admin() });

      toast({
        title: "Feedback enviado!",
        description: "Obrigado por avaliar seu treino.",
      });
    },
    onError: (error: any) => {
      console.error("Erro ao enviar feedback:", error);
      toast({
        title: "Erro ao enviar feedback",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
}

// Hook para deletar feedback (admin)
export function useDeleteFeedback() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (feedbackId: string) => {
      const { error } = await supabase
        .from("feedback_treinos")
        .delete()
        .eq("id", feedbackId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
      queryClient.invalidateQueries({ queryKey: feedbackKeys.admin() });

      toast({
        title: "Feedback removido",
        description: "O feedback foi removido com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao remover feedback",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    },
  });
}
