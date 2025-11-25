import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Cliente com service role para criar usuários
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAlunoUser() {
  try {
    console.log('🔐 Criando usuário no Supabase Auth...');
    
    // Criar usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'eugabrieldpv@gmail.com',
      password: '@gab123654',
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        nome: 'Gabriel Aluno',
        tipo: 'aluno'
      }
    });

    if (authError) {
      console.error('❌ Erro ao criar usuário:', authError);
      return;
    }

    console.log('✅ Usuário criado no Auth!');
    console.log('📧 Email:', authData.user.email);
    console.log('🆔 Auth UID:', authData.user.id);

    // Atualizar o auth_uid no users_profile
    console.log('\n🔄 Atualizando auth_uid no banco...');
    
    const { error: updateError } = await supabase
      .from('users_profile')
      .update({ auth_uid: authData.user.id })
      .eq('email', 'eugabrieldpv@gmail.com');

    if (updateError) {
      console.error('❌ Erro ao atualizar perfil:', updateError);
      return;
    }

    console.log('✅ Perfil atualizado com sucesso!');
    
    // Verificar se está tudo certo
    const { data: profile, error: profileError } = await supabase
      .from('users_profile')
      .select('*, alunos(*)')
      .eq('email', 'eugabrieldpv@gmail.com')
      .single();

    if (profileError) {
      console.error('❌ Erro ao verificar perfil:', profileError);
      return;
    }

    console.log('\n✅ USUÁRIO CRIADO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', profile.email);
    console.log('👤 Nome:', profile.nome);
    console.log('🔑 Tipo:', profile.tipo);
    console.log('🆔 Auth UID:', profile.auth_uid);
    console.log('🎯 Aluno ID:', profile.alunos?.[0]?.id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🎉 Agora você pode fazer login com:');
    console.log('   Email: eugabrieldpv@gmail.com');
    console.log('   Senha: @gab123654');
    console.log('\n🚀 Acesse: http://localhost:3174');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

createAlunoUser();
