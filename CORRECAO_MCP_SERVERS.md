# Correção de Servidores MCP

## Data: 22/11/2025

## Problemas Identificados

### 1. Servidor Vercel MCP
**Erro:** `404 Not Found - @modelcontextprotocol/server-vercel`

**Causa:** O pacote não existe no npm. Não foi publicado oficialmente.

**Solução:** Remover da configuração MCP

### 2. Servidor Supabase MCP Lite
**Erro:** `SSE stream disconnected`, `fetch failed`, `Request timed out`

**Causa:** Problemas de conexão com servidor remoto (Smithery)

**Solução:** Usar cliente Supabase direto (já configurado)

## Como Corrigir

### Método 1: Via Command Palette (Recomendado)

1. Pressione `Ctrl+Shift+P` (Windows) ou `Cmd+Shift+P` (Mac)
2. Digite: `MCP: Open Server Configuration`
3. Remova ou desabilite os servidores problemáticos:
   - `vercel`
   - `supabase-mcp-lite` (opcional)

### Método 2: Editar Arquivo Manualmente

Edite o arquivo: `~/.kiro/settings/mcp.json`

**Antes:**
```json
{
  "mcpServers": {
    "vercel": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-vercel"]
    },
    "supabase-mcp-lite": {
      "id": "@pinion05/supabase-mcp-lite",
      "connectionTypes": ["http"]
    }
  }
}
```

**Depois (limpo):**
```json
{
  "mcpServers": {}
}
```

Ou mantenha apenas servidores que funcionam:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/path/to/allowed/files"]
    }
  }
}
```

## Alternativas Funcionais

### Para Vercel
Use a API REST do Vercel diretamente:
```typescript
// Exemplo de deploy via API
const response = await fetch('https://api.vercel.com/v13/deployments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VERCEL_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'my-project',
    files: [...]
  })
});
```

### Para Supabase
Você já tem o cliente configurado em `client/src/lib/supabase.ts`:
```typescript
import { supabase } from '@/lib/supabase';

// Usar diretamente
const { data, error } = await supabase
  .from('tabela')
  .select('*');
```

## Servidores MCP Recomendados

Servidores que funcionam bem:

1. **Filesystem** - Acesso a arquivos locais
```json
{
  "filesystem": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:/Users/nicol/Downloads/BACKLOG/douappff"]
  }
}
```

2. **GitHub** - Integração com GitHub
```json
{
  "github": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "seu_token_aqui"
    }
  }
}
```

3. **Brave Search** - Busca na web
```json
{
  "brave-search": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"],
    "env": {
      "BRAVE_API_KEY": "sua_chave_aqui"
    }
  }
}
```

## Verificar Configuração

Após fazer as alterações:

1. Reinicie o Kiro IDE
2. Verifique os logs MCP: `View` → `Output` → Selecione `MCP Logs`
3. Não deve haver mais erros de conexão

## Status Atual do Projeto

Você **não precisa** dos servidores MCP problemáticos porque:

✅ Supabase já está integrado via cliente direto
✅ Vercel deploy pode ser feito via CLI ou GitHub Actions
✅ Todas as funcionalidades do projeto estão funcionando

## Recomendação Final

**Remova ambos os servidores** da configuração MCP. Eles não são necessários para o desenvolvimento atual e estão causando ruído nos logs.

Se precisar de funcionalidades específicas no futuro, podemos adicionar servidores MCP que realmente funcionam.
