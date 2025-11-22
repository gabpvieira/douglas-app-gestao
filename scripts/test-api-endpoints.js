// Script para testar endpoints da API
// Execute com: node scripts/test-api-endpoints.js

const BASE_URL = 'https://douglaspersonal-three.vercel.app';

const endpoints = [
  { name: 'Test Supabase', url: '/api/test-supabase', method: 'GET' },
  { name: 'Fichas Treino', url: '/api/fichas-treino', method: 'GET' },
  { name: 'Students', url: '/api/admin/students', method: 'GET' },
  { name: 'Blocos Horários', url: '/api/admin/blocos-horarios', method: 'GET' },
  { name: 'Agendamentos', url: '/api/admin/agendamentos', method: 'GET' },
  { name: 'Planos Alimentares', url: '/api/planos-alimentares', method: 'GET' },
  { name: 'Treinos PDF', url: '/api/treinos-pdf', method: 'GET' }
];

async function testEndpoint(endpoint) {
  try {
    console.log(`\n🔵 Testando: ${endpoint.name}`);
    console.log(`   URL: ${BASE_URL}${endpoint.url}`);
    
    const response = await fetch(`${BASE_URL}${endpoint.url}`, {
      method: endpoint.method,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`✅ ${endpoint.name}: OK (${response.status})`);
      if (Array.isArray(data)) {
        console.log(`   📊 Retornou ${data.length} registros`);
      } else if (data.success) {
        console.log(`   ✅ ${data.message}`);
      }
    } else {
      console.log(`❌ ${endpoint.name}: ERRO (${response.status})`);
      console.log(`   Erro: ${data.error || 'Erro desconhecido'}`);
      if (data.details) console.log(`   Detalhes: ${data.details}`);
    }
  } catch (error) {
    console.log(`❌ ${endpoint.name}: FALHA NA REQUISIÇÃO`);
    console.log(`   Erro: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Iniciando testes dos endpoints...');
  console.log(`📍 Base URL: ${BASE_URL}\n`);
  console.log('=' .repeat(60));

  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Testes concluídos!\n');
  console.log('📝 Próximos passos:');
  console.log('   1. Se todos os testes passaram: ✅ Sistema funcionando!');
  console.log('   2. Se houver erros de "Missing credentials": Configure variáveis no Vercel');
  console.log('   3. Se houver erros de RLS: Execute o SQL no Supabase');
  console.log('   4. Se houver erros 404: Verifique se o deploy foi feito');
}

runTests();
