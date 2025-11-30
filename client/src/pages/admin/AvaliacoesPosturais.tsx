import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GaleriaAvaliacoesPosturais } from '@/components/avaliacoes/GaleriaAvaliacoesPosturais';
import { ComparadorAvaliacoesPosturais } from '@/components/avaliacoes/ComparadorAvaliacoesPosturais';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export default function AvaliacoesPosturais() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const alunoId = searchParams.get('alunoId');
  const avaliacaoFisicaId = searchParams.get('avaliacaoId');
  const dataAvaliacao = searchParams.get('data') || new Date().toISOString().split('T')[0];

  const { data: aluno } = useQuery({
    queryKey: ['aluno', alunoId],
    queryFn: async () => {
      if (!alunoId) return null;
      
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          *,
          users_profile!inner(nome, email, foto_url)
        `)
        .eq('id', alunoId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!alunoId,
  });

  if (!alunoId || !avaliacaoFisicaId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#1a1f2e] rounded-lg p-8 text-center">
            <p className="text-gray-400">Parâmetros inválidos</p>
            <Button
              onClick={() => setLocation('/admin/avaliacoes-fisicas')}
              className="mt-4"
            >
              Voltar para Avaliações Físicas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin/avaliacoes-fisicas')}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">Avaliações Posturais</h1>
              {aluno && (
                <div className="flex items-center gap-2 mt-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400">{aluno.users_profile.nome}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="galeria" className="w-full">
          <TabsList className="bg-[#1a1f2e] border border-gray-700">
            <TabsTrigger value="galeria">Galeria</TabsTrigger>
            <TabsTrigger value="comparar">Comparar</TabsTrigger>
          </TabsList>

          <TabsContent value="galeria" className="mt-6">
            <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-700">
              <GaleriaAvaliacoesPosturais
                alunoId={alunoId}
                avaliacaoFisicaId={avaliacaoFisicaId}
                dataAvaliacao={dataAvaliacao}
              />
            </div>
          </TabsContent>

          <TabsContent value="comparar" className="mt-6">
            <div className="bg-[#1a1f2e] rounded-lg p-6 border border-gray-700">
              <ComparadorAvaliacoesPosturais alunoId={alunoId} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
