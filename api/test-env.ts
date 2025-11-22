import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    message: 'Environment variables test',
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? '✅ Configurada' : '❌ Faltando',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? '✅ Configurada' : '❌ Faltando',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Faltando',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Faltando',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    }
  });
}
