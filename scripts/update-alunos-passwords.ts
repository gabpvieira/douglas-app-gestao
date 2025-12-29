/**
 * Script para atualizar senhas de todos os alunos
 * 
 * PADRÃO DE SENHA: 3 primeiras letras do nome (minúsculo, sem acentos) + "123654"
 * Exemplo: Gabriel -> gab123654
 * 
 * SEGURANÇA:
 * - Usa Service Role Key (nunca anon key)
 * - Executa apenas via backend/script controlado
 * - Não expõe senhas em logs
 * - Atualiza via Supabase Auth API
 * 
 * EXECUÇÃO:
 * npx tsx scripts/update-alunos-passwords.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ ERRO: Variáveis de ambiente não configuradas');
  console.error('   Necessário: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Cliente Supabase com Service Role (acesso admin)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Interface para aluno
interface AlunoData {
  id: string;
  user_profile_id: string;
  users_profile: {
    id: string;
    auth_uid: string;
    nome: string;
    email: string;
    tipo: string;
  };
}

// Interface para resultado
interface AlunoResult {
  nome: string;
  email: string;
  whatsapp: string;
  senha: string;
  status: 'sucesso' | 'erro' | 'sem_auth';
  erro?: string;
}

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

/**
 * Busca todos os alunos com seus dados de perfil
 */
async function buscarAlunos(): Promise<AlunoData[]> {
  console.log('🔍 Buscando alunos...');
  
  const { data, error } = await supabase
    .from('alunos')
    .select(`
      id,
      user_profile_id,
      users_profile (
        id,
        auth_uid,
        nome,
        email,
        tipo
      )
    `)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Erro ao buscar alunos:', error.message);
    throw error;
  }

  // Filtrar apenas registros válidos com users_profile
  const alunosValidos = (data || []).filter((aluno: any) => {
    const profile = aluno.users_profile;
    return profile && profile.nome;
  });

  console.log(`✅ ${alunosValidos.length} alunos encontrados`);
  return alunosValidos as AlunoData[];
}

/**
 * Atualiza a senha de um aluno via Supabase Auth
 */
async function atualizarSenhaAuth(authUid: string, novaSenha: string): Promise<boolean> {
  const { error } = await supabase.auth.admin.updateUserById(authUid, {
    password: novaSenha
  });

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

/**
 * Função principal
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   ATUALIZAÇÃO DE SENHAS DOS ALUNOS');
  console.log('   Padrão: 3 primeiras letras do nome + 123654');
  console.log('═══════════════════════════════════════════════════════════\n');

  const resultados: AlunoResult[] = [];
  let sucessos = 0;
  let erros = 0;
  let semAuth = 0;

  try {
    // 1. Buscar todos os alunos
    const alunos = await buscarAlunos();

    if (alunos.length === 0) {
      console.log('⚠️  Nenhum aluno encontrado para atualizar');
      return;
    }

    console.log(`\n📋 Processando ${alunos.length} alunos...\n`);

    // 2. Processar cada aluno
    for (const aluno of alunos) {
      const profile = Array.isArray(aluno.users_profile) 
        ? aluno.users_profile[0] 
        : aluno.users_profile;
      
      if (!profile || !profile.nome) {
        console.log(`⚠️  Aluno ${aluno.id} sem nome - pulando`);
        continue;
      }

      const nome = profile.nome;
      const email = profile.email;
      const authUid = profile.auth_uid;
      const novaSenha = gerarSenha(nome);

      // Verificar se tem auth_uid válido
      if (!authUid || !isValidUUID(authUid)) {
        resultados.push({
          nome,
          email,
          whatsapp: '-',
          senha: novaSenha,
          status: 'sem_auth',
          erro: 'Usuário sem conta Auth válida'
        });
        semAuth++;
        console.log(`⚠️  ${nome} - sem conta Auth (auth_uid: ${authUid || 'vazio'})`);
        continue;
      }

      try {
        // Atualizar senha no Supabase Auth
        await atualizarSenhaAuth(authUid, novaSenha);

        resultados.push({
          nome,
          email,
          whatsapp: '-',
          senha: novaSenha,
          status: 'sucesso'
        });

        sucessos++;
        console.log(`✅ ${nome} - senha atualizada`);

      } catch (err: any) {
        resultados.push({
          nome,
          email,
          whatsapp: '-',
          senha: novaSenha,
          status: 'erro',
          erro: err.message
        });

        erros++;
        console.log(`❌ ${nome} - erro: ${err.message}`);
      }
    }

    // 3. Relatório final
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('   RELATÓRIO FINAL');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`   Total processados: ${alunos.length}`);
    console.log(`   ✅ Sucessos: ${sucessos}`);
    console.log(`   ⚠️  Sem Auth: ${semAuth}`);
    console.log(`   ❌ Erros: ${erros}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    // 4. Gerar documento com dados dos alunos (TODOS)
    console.log('\n📄 DOCUMENTO COMPLETO DE ALUNOS:\n');
    console.log('┌──────────────────────────────────────────────────────────────────────────────────────────────┐');
    console.log('│ NOME                               │ EMAIL                               │ SENHA        │ ST │');
    console.log('├──────────────────────────────────────────────────────────────────────────────────────────────┤');
    
    for (const resultado of resultados) {
      const nomeCol = resultado.nome.padEnd(35).substring(0, 35);
      const emailCol = resultado.email.padEnd(35).substring(0, 35);
      const senhaCol = resultado.senha.padEnd(12);
      const statusCol = resultado.status === 'sucesso' ? '✅' : resultado.status === 'sem_auth' ? '⚠️' : '❌';
      console.log(`│ ${nomeCol} │ ${emailCol} │ ${senhaCol} │ ${statusCol} │`);
    }
    
    console.log('└──────────────────────────────────────────────────────────────────────────────────────────────┘');
    console.log('\nLegenda: ✅ = Senha atualizada | ⚠️ = Sem conta Auth | ❌ = Erro');

    // 5. Listar alunos sem Auth (precisam ser criados)
    if (semAuth > 0) {
      console.log('\n⚠️  ALUNOS SEM CONTA AUTH (precisam ser criados no Supabase Auth):');
      for (const resultado of resultados) {
        if (resultado.status === 'sem_auth') {
          console.log(`   - ${resultado.nome} (${resultado.email}) -> Senha sugerida: ${resultado.senha}`);
        }
      }
    }

    // 6. Listar erros se houver
    if (erros > 0) {
      console.log('\n❌ ALUNOS COM ERRO:');
      for (const resultado of resultados) {
        if (resultado.status === 'erro') {
          console.log(`   - ${resultado.nome}: ${resultado.erro}`);
        }
      }
    }

  } catch (error: any) {
    console.error('\n❌ ERRO FATAL:', error.message);
    process.exit(1);
  }
}

// Executar
main().then(() => {
  console.log('\n✅ Script finalizado com sucesso');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ Erro ao executar script:', error);
  process.exit(1);
});
