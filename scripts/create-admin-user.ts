import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas!');
  console.error('Configure VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createAdminUser() {
  console.log('🔧 Criando usuário admin...\n');

  const email = 'admin@douglascoimbra.com.br';
  const password = 'doug123654';
  const nome = 'Douglas Coimbra';

  try {
    // 1. Criar usuário no Supabase Auth
    console.log('📝 Criando usuário no Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        role: 'admin'
      }
    });

    if (authError) {
      if (authError.message.includes('already registered') || authError.code === 'email_exists') {
        console.log('⚠️  Usuário já existe no Auth');
        
        // Buscar usuário existente
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === email);
        
        if (existingUser) {
          console.log('✅ Usuário encontrado:', existingUser.id);
          
          // Atualizar senha
          console.log('🔄 Atualizando senha...');
          await supabase.auth.admin.updateUserById(existingUser.id, {
            password,
            user_metadata: {
              nome,
              role: 'admin'
            }
          });
          console.log('✅ Senha atualizada!');
          
          // Criar perfil com o ID existente
          const userId = existingUser.id;
          
          console.log('\n📝 Criando/atualizando perfil do usuário...');
          const { error: profileError } = await supabase
            .from('users_profile')
            .upsert({
              id: userId,
              auth_uid: userId,
              nome,
              email,
              tipo: 'admin',
              foto_url: null
            }, {
              onConflict: 'id'
            });

          if (profileError) {
            console.error('❌ Erro ao criar perfil:', profileError);
          } else {
            console.log('✅ Perfil criado/atualizado com sucesso!');
          }
          
          console.log('\n✨ Usuário admin configurado com sucesso!');
          console.log('\n📋 Credenciais:');
          console.log('   Email:', email);
          console.log('   Senha:', password);
          console.log('   Tipo: admin');
          console.log('\n🎉 Você já pode fazer login no sistema!');
          
          return userId;
        }
      } else {
        throw authError;
      }
    }

    const userId = authData?.user?.id;
    console.log('✅ Usuário criado no Auth:', userId);

    // 2. Criar perfil na tabela users_profile
    console.log('\n📝 Criando perfil do usuário...');
    const { error: profileError } = await supabase
      .from('users_profile')
      .upsert({
        id: userId,
        auth_uid: userId,
        nome,
        email,
        tipo: 'admin',
        foto_url: null
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.error('❌ Erro ao criar perfil:', profileError);
    } else {
      console.log('✅ Perfil criado com sucesso!');
    }

    console.log('\n✨ Usuário admin criado com sucesso!');
    console.log('\n📋 Credenciais:');
    console.log('   Email:', email);
    console.log('   Senha:', password);
    console.log('   Role: admin');
    console.log('\n🎉 Você já pode fazer login no sistema!');

    return userId;

  } catch (error: any) {
    console.error('\n❌ Erro ao criar usuário:', error.message);
    throw error;
  }
}

// Executar
createAdminUser()
  .then(() => {
    console.log('\n✅ Script concluído!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Falha ao executar script:', error);
    process.exit(1);
  });
