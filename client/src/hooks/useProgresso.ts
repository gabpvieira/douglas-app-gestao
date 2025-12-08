import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Evolucao {
  id: string;
  alunoId: string;
  data: string;
  peso?: number;
  gorduraCorporal?: number;
  massaMuscular?: number;
  peito?: number;
  cintura?: number;
  quadril?: number;
  braco?: number;
  coxa?: number;
  observacoes?: string;
  createdAt: string;
}

export interface FotoProgresso {
  id: string;
  alunoId: string;
  data: string;
  tipo: 'front' | 'side' | 'back';
  urlFoto: string;
  createdAt: string;
}

// Buscar evoluções do aluno
export function useEvolucoes() {
  return useQuery({
    queryKey: ['evolucoes-aluno'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const { data: profile } = await supabase
        .from('users_profile')
        .select('id')
        .eq('auth_uid', session.user.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_profile_id', profile.id)
        .single();

      if (!aluno) throw new Error('Aluno não encontrado');

      const { data, error } = await supabase
        .from('evolucoes')
        .select('*')
        .eq('aluno_id', aluno.id)
        .order('data', { ascending: false });

      if (error) throw error;

      return data.map((e: any) => ({
        id: e.id,
        alunoId: e.aluno_id,
        data: e.data,
        peso: e.peso,
        gorduraCorporal: e.gordura_corporal,
        massaMuscular: e.massa_muscular,
        peito: e.peito,
        cintura: e.cintura,
        quadril: e.quadril,
        braco: e.braco,
        coxa: e.coxa,
        observacoes: e.observacoes,
        createdAt: e.created_at,
      })) as Evolucao[];
    },
  });
}

// Buscar fotos de progresso
export function useFotosProgresso() {
  return useQuery({
    queryKey: ['fotos-progresso'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const { data: profile } = await supabase
        .from('users_profile')
        .select('id')
        .eq('auth_uid', session.user.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_profile_id', profile.id)
        .single();

      if (!aluno) throw new Error('Aluno não encontrado');

      const { data, error } = await supabase
        .from('fotos_progresso')
        .select('*')
        .eq('aluno_id', aluno.id)
        .order('data', { ascending: false });

      if (error) throw error;

      return data.map((f: any) => ({
        id: f.id,
        alunoId: f.aluno_id,
        data: f.data,
        tipo: f.tipo,
        urlFoto: f.url_foto,
        createdAt: f.created_at,
      })) as FotoProgresso[];
    },
  });
}

// Adicionar nova evolução
export function useAdicionarEvolucao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evolucao: Omit<Evolucao, 'id' | 'alunoId' | 'createdAt'>) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const { data: profile } = await supabase
        .from('users_profile')
        .select('id')
        .eq('auth_uid', session.user.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_profile_id', profile.id)
        .single();

      if (!aluno) throw new Error('Aluno não encontrado');

      const { data, error } = await supabase
        .from('evolucoes')
        .insert({
          aluno_id: aluno.id,
          data: evolucao.data,
          peso: evolucao.peso,
          gordura_corporal: evolucao.gorduraCorporal,
          massa_muscular: evolucao.massaMuscular,
          peito: evolucao.peito,
          cintura: evolucao.cintura,
          quadril: evolucao.quadril,
          braco: evolucao.braco,
          coxa: evolucao.coxa,
          observacoes: evolucao.observacoes,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolucoes-aluno'] });
    },
  });
}

// Deletar evolução
export function useDeletarEvolucao() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evolucaoId: string) => {
      const { error } = await supabase
        .from('evolucoes')
        .delete()
        .eq('id', evolucaoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolucoes-aluno'] });
    },
  });
}

// Buscar avaliações físicas do aluno
export function useAvaliacoesFisicas() {
  return useQuery({
    queryKey: ['avaliacoes-fisicas-aluno'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const { data: profile } = await supabase
        .from('users_profile')
        .select('id')
        .eq('auth_uid', session.user.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      const { data: aluno } = await supabase
        .from('alunos')
        .select('id')
        .eq('user_profile_id', profile.id)
        .single();

      if (!aluno) throw new Error('Aluno não encontrado');

      const { data, error } = await supabase
        .from('avaliacoes_fisicas')
        .select('*')
        .eq('aluno_id', aluno.id)
        .order('data_avaliacao', { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
