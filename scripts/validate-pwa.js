/**
 * Script de validação da configuração PWA
 * Verifica se todos os arquivos necessários existem e estão configurados corretamente
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

console.log('🔍 Validando configuração PWA...\n');

let hasErrors = false;

// 1. Verificar se o ícone existe
const iconPath = join(rootDir, 'client/public/icone-pwa.png');
if (existsSync(iconPath)) {
  console.log('✅ Ícone PWA encontrado: client/public/icone-pwa.png');
} else {
  console.error('❌ Ícone PWA não encontrado: client/public/icone-pwa.png');
  hasErrors = true;
}

// 2. Verificar manifest.json
const manifestPath = join(rootDir, 'client/public/manifest.json');
if (existsSync(manifestPath)) {
  try {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
    console.log('✅ Manifest.json encontrado e válido');
    
    // Verificar ícones no manifest
    if (manifest.icons && manifest.icons.length > 0) {
      console.log(`   📱 ${manifest.icons.length} tamanhos de ícone configurados`);
      
      const allIconsUseCorrectPath = manifest.icons.every(icon => 
        icon.src === '/icone-pwa.png'
      );
      
      if (allIconsUseCorrectPath) {
        console.log('   ✅ Todos os ícones apontam para /icone-pwa.png');
      } else {
        console.error('   ❌ Alguns ícones não apontam para /icone-pwa.png');
        hasErrors = true;
      }
      
      const allIconsHavePurpose = manifest.icons.every(icon => 
        icon.purpose === 'any maskable'
      );
      
      if (allIconsHavePurpose) {
        console.log('   ✅ Todos os ícones têm "purpose: any maskable"');
      } else {
        console.warn('   ⚠️  Alguns ícones não têm "purpose: any maskable"');
      }
    } else {
      console.error('   ❌ Nenhum ícone configurado no manifest');
      hasErrors = true;
    }
    
    // Verificar campos obrigatórios
    const requiredFields = ['name', 'short_name', 'start_url', 'display', 'theme_color'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length === 0) {
      console.log('   ✅ Todos os campos obrigatórios presentes');
    } else {
      console.error(`   ❌ Campos faltando: ${missingFields.join(', ')}`);
      hasErrors = true;
    }
  } catch (error) {
    console.error('❌ Erro ao ler manifest.json:', error.message);
    hasErrors = true;
  }
} else {
  console.error('❌ Manifest.json não encontrado');
  hasErrors = true;
}

// 3. Verificar service worker
const swPath = join(rootDir, 'client/public/sw.js');
if (existsSync(swPath)) {
  const swContent = readFileSync(swPath, 'utf-8');
  console.log('✅ Service Worker encontrado: client/public/sw.js');
  
  if (swContent.includes('/icone-pwa.png')) {
    console.log('   ✅ Service Worker inclui ícone PWA no cache');
  } else {
    console.warn('   ⚠️  Service Worker não inclui ícone PWA no cache');
  }
  
  const versionMatch = swContent.match(/CACHE_VERSION = ['"](.+?)['"]/);
  if (versionMatch) {
    console.log(`   📦 Versão do cache: ${versionMatch[1]}`);
  }
} else {
  console.error('❌ Service Worker não encontrado');
  hasErrors = true;
}

// 4. Verificar index.html
const indexPath = join(rootDir, 'client/index.html');
if (existsSync(indexPath)) {
  const indexContent = readFileSync(indexPath, 'utf-8');
  console.log('✅ index.html encontrado');
  
  if (indexContent.includes('rel="manifest"')) {
    console.log('   ✅ Link para manifest.json presente');
  } else {
    console.error('   ❌ Link para manifest.json ausente');
    hasErrors = true;
  }
  
  if (indexContent.includes('rel="apple-touch-icon"')) {
    console.log('   ✅ Apple touch icons configurados');
  } else {
    console.warn('   ⚠️  Apple touch icons não configurados');
  }
  
  if (indexContent.includes('name="theme-color"')) {
    console.log('   ✅ Theme color configurado');
  } else {
    console.warn('   ⚠️  Theme color não configurado');
  }
} else {
  console.error('❌ index.html não encontrado');
  hasErrors = true;
}

// 5. Verificar registro do SW no main.tsx
const mainPath = join(rootDir, 'client/src/main.tsx');
if (existsSync(mainPath)) {
  const mainContent = readFileSync(mainPath, 'utf-8');
  console.log('✅ main.tsx encontrado');
  
  if (mainContent.includes('serviceWorker') && mainContent.includes('register')) {
    console.log('   ✅ Service Worker registrado no main.tsx');
  } else {
    console.warn('   ⚠️  Service Worker não registrado no main.tsx');
  }
} else {
  console.error('❌ main.tsx não encontrado');
  hasErrors = true;
}

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.error('\n❌ Validação falhou! Corrija os erros acima.\n');
  process.exit(1);
} else {
  console.log('\n✅ Configuração PWA válida! Tudo pronto para instalação.\n');
  console.log('📱 Para testar:');
  console.log('   1. Execute: npm run build');
  console.log('   2. Execute: npm run start');
  console.log('   3. Abra o navegador e acesse a aplicação');
  console.log('   4. Procure pelo botão de instalação na barra de endereços\n');
}
