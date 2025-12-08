import { Router, Request, Response } from 'express';
import { supabase } from '../supabase';

const router = Router();

interface CreateAlunoRequest {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: string;
  altura: number;
  genero: 'masculino' | 'feminino' | 'outro';
  status: 'ativo' | 'inativo' | 'pendente';
  fotoUrl?: string;
}

// POST /api/alunos - Criar novo aluno com Supabase Auth
router.post('/', async (req: Request, res: Response) => {
  try {
    const data: CreateAlunoRequest = req.body;

    console.log('📝 Criando aluno com Supabase Auth:', data.email);

    // 1. Criar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.senha,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        nome: data.nome,
        tipo: 'aluno'
      }
    });

    if (authError || !authUser.user) {
      console.error('❌ Erro ao criar usuário Auth:', authError);
      return res.status(400).json({ 
        error: authError?.message || 'Falha ao criar usuário' 
      });
    }

    console.log('✅ Usuário Auth criado:', authUser.user.id);

    // 2. Criar user_profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users_profile')
      .insert({
        auth_uid: authUser.user.id,
        nome: data.nome,
        email: data.email,
        tipo: 'aluno',
        foto_url: data.fotoUrl || null
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Erro ao criar user_profile:', profileError);
      // Tentar deletar o usuário Auth criado
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return res.status(400).json({ 
        error: profileError.message || 'Falha ao criar perfil' 
      });
    }

    console.log('✅ User profile criado:', userProfile.id);

    // 3. Criar aluno (sem campo senha, pois agora usa Auth)
    const { data: newAluno, error: alunoError } = await supabase
      .from('alunos')
      .insert({
        user_profile_id: userProfile.id,
        data_nascimento: data.dataNascimento,
        altura: data.altura,
        genero: data.genero,
        status: data.status
      })
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
      console.error('❌ Erro ao criar aluno:', alunoError);
      // Tentar deletar user_profile e usuário Auth
      await supabase.from('users_profile').delete().eq('id', userProfile.id);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return res.status(400).json({ 
        error: alunoError.message || 'Falha ao criar aluno' 
      });
    }

    console.log('✅ Aluno criado com sucesso:', newAluno.id);

    // Formatar resposta
    const response = {
      id: newAluno.id,
      nome: newAluno.users_profile?.nome || '',
      email: newAluno.users_profile?.email || '',
      dataNascimento: newAluno.data_nascimento,
      altura: newAluno.altura,
      genero: newAluno.genero,
      status: newAluno.status,
      fotoUrl: newAluno.users_profile?.foto_url || null,
      createdAt: newAluno.created_at,
      updatedAt: newAluno.updated_at,
    };

    res.status(201).json(response);

  } catch (error: any) {
    console.error('❌ Erro ao criar aluno:', error);
    res.status(500).json({ 
      error: error.message || 'Erro interno do servidor' 
    });
  }
});

export default router;
