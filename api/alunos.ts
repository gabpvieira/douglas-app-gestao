import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verificar variáveis de ambiente
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Variáveis de ambiente não configuradas');
      return res.status(500).json({ 
        error: 'Configuração do servidor incompleta' 
      });
    }

    const data: CreateAlunoRequest = req.body;

    // Validar dados recebidos
    if (!data.nome || !data.email || !data.senha) {
      return res.status(400).json({ 
        error: 'Dados obrigatórios faltando: nome, email e senha são necessários' 
      });
    }

    console.log('📝 Criando aluno com Supabase Auth:', data.email);

    // 1. Criar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.senha,
      email_confirm: true,
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
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return res.status(400).json({ 
        error: profileError.message || 'Falha ao criar perfil' 
      });
    }

    console.log('✅ User profile criado:', userProfile.id);

    // 3. Criar aluno
    const { data: alunoData, error: alunoError } = await supabase
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

    if (alunoError || !alunoData) {
      console.error('❌ Erro ao criar aluno:', alunoError);
      await supabase.from('users_profile').delete().eq('id', userProfile.id);
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return res.status(400).json({ 
        error: alunoError?.message || 'Falha ao criar aluno' 
      });
    }

    console.log('✅ Aluno criado com sucesso:', alunoData.id);

    // Extrair dados do user_profile (pode ser objeto ou array)
    const userProfileData = Array.isArray(alunoData.users_profile) 
      ? alunoData.users_profile[0] 
      : alunoData.users_profile;

    // Formatar resposta
    const response = {
      id: alunoData.id,
      nome: userProfileData?.nome || '',
      email: userProfileData?.email || '',
      dataNascimento: alunoData.data_nascimento,
      altura: alunoData.altura,
      genero: alunoData.genero,
      status: alunoData.status,
      fotoUrl: userProfileData?.foto_url || null,
      createdAt: alunoData.created_at,
      updatedAt: alunoData.updated_at,
    };

    return res.status(201).json(response);

  } catch (error: any) {
    console.error('❌ Erro ao criar aluno:', error);
    return res.status(500).json({ 
      error: error.message || 'Erro interno do servidor' 
    });
  }
}
