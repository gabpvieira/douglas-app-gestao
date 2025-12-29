/**
 * Script para criar contas Auth para alunos sem conta válida
 * e atualizar o auth_uid na tabela users_profile
 * 
 * EXECUÇÃO:
 * npx tsx scripts/create-auth-for-alunos.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Verifica se uma string é um UUID válido
 */
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

/**
 * Remove acentos de uma string
 */
function removeAcentos(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z]/g, '');
}

/**
 * Gera senha no padrão: 3 primeiras letras do nome + 123654
 */
function gerarSenha(nome: string): string {
  const nomeNormalizado = removeAcentos(nome).toLowerCase();
  const tresPrimeirasLetras = nomeNormalizado.substring(0, 3);
  return `${tresPrimeirasLetras}123654`;
}

interface AlunoSemAuth {
  userProfileId: string;
  nome: string;
  email: string;
  authUid: string;
}

/**
 * Busca alunos sem conta Auth válida
 */
async function buscarAlunosSemAuth(): Promise<AlunoSemAuth[]> {
  console.log('🔍 Buscando alunos sem conta Auth válida...');
  
  const { data, error } = await supabase
    .from('alunos')
    .select(`
      id,
      user_profile_id,
      users_profile (
        id,
        auth_uid,
        nome,
        email
      )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Erro ao buscar alunos: ${error.message}`);
  }

  const alunosSemAuth: AlunoSemAuth[] = [];

  for (const aluno of data || []) {
    const profile = Array.isArray(aluno.users_profile) 
      ? aluno.users_profile[0] 
      : aluno.users_profile;
    
    if (!profile || !profile.nome || !profile.email) continue;
    
    // Verificar se auth_uid é inválido (mock ou não UUID)
    if (!profile.auth_uid || !isValidUUID(profile.auth_uid)) {
      alunosSemAuth.push({
        userProfileId: profile.id,
        nome: profile.nome,
        email: profile.email,
        authUid: profile.auth_uid || ''
      });
    }
  }

  console.log(`✅ ${alunosSemAuth.length} alunos sem conta Auth encontrados`);
  return alunosSemAuth;
}

/**
 * Cria conta Auth e atualiza users_profile
 */
async function criarContaAuth(aluno: AlunoSemAuth): Promise<{ success: boolean; authUid?: string; error?: string }> {
  const senha = gerarSenha(aluno.nome);
  
  try {
    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: aluno.email,
      password: senha,
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        nome: aluno.nome,
        tipo: 'aluno'
      }
    });

    if (authError) {
      // Se o email já existe, tentar buscar o usuário existente
      if (authError.message.includes('already been registered') || authError.message.includes('already exists')) {
        // Buscar usuário existente pelo email
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users?.users?.find(u => u.email === aluno.email);
        
        if (existingUser) {
          // Atualizar senha do usuário existente
          await supabase.auth.admin.updateUserById(existingUser.id, {
            password: senha
          });
          
          // Atualizar auth_uid na tabela users_profile
          const { error: updateError } = await supabase
            .from('users_profile')
            .update({ auth_uid: existingUser.id })
            .eq('id', aluno.userProfileId);

          if (updateError) {
            return { success: false, error: `Erro ao atualizar profile: ${updateError.message}` };
          }

          return { success: true, authUid: existingUser.id };
        }
      }
      
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Usuário não foi criado' };
    }

    // 2. Atualizar auth_uid na tabela users_profile
    const { error: updateError } = await supabase
      .from('users_profile')
      .update({ auth_uid: authData.user.id })
      .eq('id', aluno.userProfileId);

    if (updateError) {
      return { success: false, error: `Erro ao atualizar profile: ${updateError.message}` };
    }

    return { success: true, authUid: authData.user.id };

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Função principal
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   CRIAÇÃO DE CONTAS AUTH PARA ALUNOS');
  console.log('═══════════════════════════════════════════════════════════\n');

  let sucessos = 0;
  let erros = 0;
  const resultados: { nome: string; email: string; senha: string; status: string; erro?: string }[] = [];

  try {
    const alunosSemAuth = await buscarAlunosSemAuth();

    if (alunosSemAuth.length === 0) {
      console.log('✅ Todos os alunos já possuem conta Auth válida!');
      return;
    }

    console.log(`\n📋 Processando ${alunosSemAuth.length} alunos...\n`);

    for (const aluno of alunosSemAuth) {
      const senha = gerarSenha(aluno.nome);
      const resultado = await criarContaAuth(aluno);

      if (resultado.success) {
        sucessos++;
        console.log(`✅ ${aluno.nome} - conta criada (${resultado.authUid?.substring(0, 8)}...)`);
        resultados.push({
          nome: aluno.nome,
          email: aluno.email,
          senha,
          status: 'sucesso'
        });
      } else {
        erros++;
        console.log(`❌ ${aluno.nome} - erro: ${resultado.error}`);
        resultados.push({
          nome: aluno.nome,
          email: aluno.email,
          senha,
          status: 'erro',
          erro: resultado.error
        });
      }

      // Pequeno delay para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Relatório final
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   RELATÓRIO FINAL');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Total processados: ${alunosSemAuth.length}`);
    console.log(`   ✅ Sucessos: ${sucessos}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // Listar resultados
    console.log('\n📄 ALUNOS PROCESSADOS:\n');
    for (const r of resultados) {
      const status = r.status === 'sucesso' ? '✅' : '❌';
      console.log(`${status} ${r.nome} | ${r.email} | ${r.senha}${r.erro ? ` | Erro: ${r.erro}` : ''}`);
    }

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:', error.message);
    process.exit(1);
  }
}

main().then(() => {
  console.log('\n✅ Script finalizado');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Erro:', error);
  process.exit(1);
});
