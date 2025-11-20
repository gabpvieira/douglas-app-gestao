# Solução para Backend no Vercel

## Problema
O Vercel está servindo apenas os arquivos estáticos do frontend. O backend Express não está rodando, então todas as chamadas para `/api/*` falham.

## Solução Recomendada: Serverless Functions

Para fazer o backend funcionar no Vercel, precisamos converter as rotas Express para Serverless Functions do Vercel.

### Estrutura Necessária

Criar pasta `api/` na raiz do projeto com arquivos serverless:

```
api/
├── admin/
│   ├── students.ts
│   ├── agendamentos.ts
│   ├── treinos-video.ts
│   └── planos-alimentares.ts
└── aluno/
    ├── plano-alimentar.ts
    └── pagamentos.ts
```

### Exemplo de Serverless Function

```typescript
// api/admin/students.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('tipo', 'aluno');

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
```

## Solução Alternativa (Mais Rápida): Frontend Direto

Converter todos os hooks para usar Supabase diretamente no frontend (já iniciado).

### Vantagens
- Mais rápido de implementar
- Menos complexidade
- Melhor performance (sem intermediário)

### Desvantagens
- Lógica de negócio no frontend
- Menos controle sobre permissões
- Uploads de arquivo mais complexos

## Recomendação

Para produção rápida: **Usar Supabase diretamente no frontend** (solução já iniciada).

Para aplicação robusta: **Implementar Serverless Functions** no Vercel.
