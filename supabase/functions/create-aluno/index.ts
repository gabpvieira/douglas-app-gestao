import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { nome, email, senha, dataNascimento, altura, genero, status, fotoUrl } = await req.json()

    console.log('📝 Criando aluno:', email)

    // 1. Criar usuário no Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: senha,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        nome,
        tipo: 'aluno'
      }
    })

    if (authError || !authUser.user) {
      console.error('❌ Erro ao criar usuário Auth:', authError)
      throw new Error(authError?.message || 'Falha ao criar usuário')
    }

    console.log('✅ Usuário Auth criado:', authUser.user.id)

    // 2. Criar user_profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users_profile')
      .insert({
        auth_uid: authUser.user.id,
        nome,
        email,
        tipo: 'aluno',
        foto_url: fotoUrl || null
      })
      .select()
      .single()

    if (profileError) {
      console.error('❌ Erro ao criar user_profile:', profileError)
      // Tentar deletar o usuário Auth criado
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw new Error(profileError.message || 'Falha ao criar perfil')
    }

    console.log('✅ User profile criado:', userProfile.id)

    // 3. Criar aluno (sem campo senha)
    const { data: newAluno, error: alunoError } = await supabaseAdmin
      .from('alunos')
      .insert({
        user_profile_id: userProfile.id,
        data_nascimento: dataNascimento,
        altura,
        genero,
        status
      })
      .select(`
        id,
        data_nascimento,
        altura,
        genero,
        status,
        created_at,
        updated_at
      `)
      .single()

    if (alunoError) {
      console.error('❌ Erro ao criar aluno:', alunoError)
      // Tentar deletar user_profile e usuário Auth
      await supabaseAdmin.from('users_profile').delete().eq('id', userProfile.id)
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id)
      throw new Error(alunoError.message || 'Falha ao criar aluno')
    }

    console.log('✅ Aluno criado com sucesso:', newAluno.id)

    // Retornar resposta
    return new Response(
      JSON.stringify({
        id: newAluno.id,
        nome: userProfile.nome,
        email: userProfile.email,
        dataNascimento: newAluno.data_nascimento,
        altura: newAluno.altura,
        genero: newAluno.genero,
        status: newAluno.status,
        fotoUrl: userProfile.foto_url,
        createdAt: newAluno.created_at,
        updatedAt: newAluno.updated_at,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    )

  } catch (error) {
    console.error('❌ Erro:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
