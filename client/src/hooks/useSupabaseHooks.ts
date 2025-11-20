// Arquivo temporário com hooks vazios para evitar erros
// TODO: Implementar hooks completos com Supabase

import { useQuery } from '@tanstack/react-query';

// Hook genérico que retorna array vazio
export function useEmptyQuery(queryKey: string[]) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      console.warn(`Hook ${queryKey.join('/')} ainda não implementado com Supabase`);
      return [];
    }
  });
}
