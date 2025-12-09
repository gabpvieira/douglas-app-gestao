import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from './use-toast';
import { supabase } from '@/lib/supabase';

interface Aluno {
  id: string;
  nome: string;
  email: string;
  dataNascimento: string | null;
  altura: number | null;
  genero: string | null;
  status: string;
  fotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateAlunoData {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
  altura: number;
  genero: 'masculino' | 'feminino' | 'outro';
  status: 'ativo' | 'inativo' | 'pendente';
  fotoUrl?: string;
}

// Hook para listar alunos
export function useAlunos() {
  return useQuery<Aluno[]>({
    queryKey: ['alunos'],
    queryFn: async () => {
      console.log('🔍 Buscando alunos do Supabase...');
      
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          id,
          data_nascimento,
          altura,
          genero,
          status,
          created_at,
          updated_at,
          users_profile (
            nome,
            email,
            foto_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar alunos:', error);
        throw new Error('Falha ao buscar alunos');
      }

      console.log(`✅ ${data?.length || 0} alunos encontrados`);

      // Formatar dados para o formato esperado pelo frontend
      const alunosFormatted = (data || []).map((aluno: any) => ({
        id: aluno.id,
        nome: aluno.users_profile?.nome || 'N/A',
        email: aluno.users_profile?.email || 'N/A',
        dataNascimento: aluno.data_nascimento,
        altura: aluno.altura,
        genero: aluno.genero,
        status: aluno.status,
        fotoUrl: aluno.users_profile?.foto_url || null,
        createdAt: aluno.created_at,
        updatedAt: aluno.updated_at,
      }));

      return alunosFormatted;
    }
  });
}

// Hook para criar aluno (usa Supabase Edge Function)
export function useCreateAluno() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateAlunoData) => {
      console.log('📝 Criando novo aluno via Supabase Function...');
      
      // Chamar Supabase Edge Function para criar usuário Auth + perfil + aluno
      const { data: result, error } = await supabase.functions.invoke('create-aluno', {
        body: {
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          dataNascimento: data.dataNascimento,
          altura: data.altura,
          genero: data.genero,
          status: data.status,
          fotoUrl: data.fotoUrl
        }
      });

      if (error) {
        console.error('❌ Erro ao criar aluno:', error);
        throw new Error(error.message || 'Falha ao criar aluno');
      }

      if (result?.error) {
        console.error('❌ Erro retornado pela função:', result.error);
        throw new Error(result.error);
      }

      console.log('✅ Aluno criado com sucesso:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno criado com sucesso. Ele já pode fazer login.'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

// Hook para atualizar aluno
export function useUpdateAluno() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAlunoData> }) => {
      console.log('📝 Atualizando aluno:', id);
      
      // 1. Buscar o aluno para pegar o user_profile_id
      const { data: aluno, error: fetchError } = await supabase
        .from('alunos')
        .select('user_profile_id')
        .eq('id', id)
        .single();

      if (fetchError || !aluno) {
        console.error('❌ Erro ao buscar aluno:', fetchError);
        throw new Error('Aluno não encontrado');
      }

      // 2. Atualizar user_profile se necessário
      if (data.nome || data.email || data.fotoUrl !== undefined) {
        const userProfileUpdate: any = {};
        if (data.nome) userProfileUpdate.nome = data.nome;
        if (data.email) userProfileUpdate.email = data.email;
        if (data.fotoUrl !== undefined) userProfileUpdate.foto_url = data.fotoUrl;

        const { error: userError } = await supabase
          .from('users_profile')
          .update(userProfileUpdate)
          .eq('id', aluno.user_profile_id);

        if (userError) {
          console.error('❌ Erro ao atualizar user_profile:', userError);
          throw new Error('Falha ao atualizar perfil de usuário');
        }
      }

      // 3. Atualizar aluno
      const alunoUpdate: any = {};
      if (data.dataNascimento) alunoUpdate.data_nascimento = data.dataNascimento;
      if (data.altura) alunoUpdate.altura = data.altura;
      if (data.genero) alunoUpdate.genero = data.genero;
      if (data.status) alunoUpdate.status = data.status;

      const { data: updatedAluno, error: alunoError } = await supabase
        .from('alunos')
        .update(alunoUpdate)
        .eq('id', id)
        .select(`
          id,
          data_nascimento,
          altura,
          genero,
          status,
          created_at,
          updated_at,
          users_profile (
            nome,
            email,
            foto_url
          )
        `)
        .single();

      if (alunoError) {
        console.error('❌ Erro ao atualizar aluno:', alunoError);
        throw new Error('Falha ao atualizar aluno');
      }

      console.log('✅ Aluno atualizado com sucesso');

      // Formatar resposta
      return {
        id: updatedAluno.id,
        nome: updatedAluno.users_profile?.nome || '',
        email: updatedAluno.users_profile?.email || '',
        dataNascimento: updatedAluno.data_nascimento,
        altura: updatedAluno.altura,
        genero: updatedAluno.genero,
        status: updatedAluno.status,
        fotoUrl: updatedAluno.users_profile?.foto_url || null,
        createdAt: updatedAluno.created_at,
        updatedAt: updatedAluno.updated_at,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno atualizado com sucesso'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}

// Hook para deletar aluno
export function useDeleteAluno() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🗑️ Deletando aluno:', id);
      
      // 1. Buscar o aluno para pegar o user_profile_id
      const { data: aluno, error: fetchError } = await supabase
        .from('alunos')
        .select('user_profile_id')
        .eq('id', id)
        .single();

      if (fetchError || !aluno) {
        console.error('❌ Erro ao buscar aluno:', fetchError);
        throw new Error('Aluno não encontrado');
      }

      // 2. Deletar user_profile (isso vai deletar o aluno em cascata)
      const { error: deleteError } = await supabase
        .from('users_profile')
        .delete()
        .eq('id', aluno.user_profile_id);

      if (deleteError) {
        console.error('❌ Erro ao deletar aluno:', deleteError);
        throw new Error('Falha ao deletar aluno');
      }

      console.log('✅ Aluno deletado com sucesso');
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alunos'] });
      toast({
        title: 'Sucesso!',
        description: 'Aluno deletado com sucesso'
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      });
    }
  });
}
