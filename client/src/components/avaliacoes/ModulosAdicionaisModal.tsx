import { useState } from 'react';
import { useLocation } from 'wouter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FormularioNeuromotor } from './FormularioNeuromotor';
import { FormularioPostural } from './FormularioPostural';
import { FormularioAnamnese } from './FormularioAnamnese';
import { 
  useCreateAvaliacaoNeuromotora, 
  useUpdateAvaliacaoNeuromotora,
  useAvaliacaoNeuromotora,
  useCreateAvaliacaoPostural,
  useUpdateAvaliacaoPostural,
  useAvaliacaoPostural,
  useCreateAnamnese,
  useUpdateAnamnese,
  useAnamnese
} from '@/hooks/useAvaliacoesAdicionais';
import { Activity, User2, FileText, Camera, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface ModulosAdicionaisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avaliacaoId: string;
  alunoId: string;
}

export function ModulosAdicionaisModal({ 
  open, 
  onOpenChange, 
  avaliacaoId,
  alunoId 
}: ModulosAdicionaisModalProps) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState('neuromotor');

  // Buscar data da avaliação
  const { data: avaliacao } = useQuery({
    queryKey: ['avaliacao-fisica', avaliacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avaliacoes_fisicas')
        .select('data_avaliacao')
        .eq('id', avaliacaoId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!avaliacaoId,
  });

  // Neuromotor
  const { data: neuromotor } = useAvaliacaoNeuromotora(avaliacaoId);
  const createNeuromotor = useCreateAvaliacaoNeuromotora();
  const updateNeuromotor = useUpdateAvaliacaoNeuromotora();

  // Postural
  const { data: postural } = useAvaliacaoPostural(avaliacaoId);
  const createPostural = useCreateAvaliacaoPostural();
  const updatePostural = useUpdateAvaliacaoPostural();

  // Anamnese
  const { data: anamnese } = useAnamnese(alunoId);
  const createAnamnese = useCreateAnamnese();
  const updateAnamnese = useUpdateAnamnese();

  const handleNeuromotorSubmit = async (data: any) => {
    try {
      if (neuromotor) {
        await updateNeuromotor.mutateAsync({ id: neuromotor.id, ...data });
        toast({ title: 'Avaliação neuromotora atualizada com sucesso!' });
      } else {
        await createNeuromotor.mutateAsync({
          avaliacaoId,
          alunoId,
          ...data,
        });
        toast({ title: 'Avaliação neuromotora criada com sucesso!' });
      }
    } catch (error) {
      toast({ 
        title: 'Erro ao salvar avaliação neuromotora', 
        variant: 'destructive' 
      });
    }
  };

  const handlePosturalSubmit = async (data: any) => {
    try {
      // Remover fotos do objeto (não são tratadas aqui)
      const { fotos, ...posturalData } = data;
      
      console.log('Salvando avaliação postural:', { avaliacaoId, ...posturalData });
      
      if (postural) {
        await updatePostural.mutateAsync({ 
          id: postural.id, 
          avaliacaoId,
          ...posturalData 
        });
        toast({ title: 'Avaliação postural atualizada com sucesso!' });
      } else {
        await createPostural.mutateAsync({
          avaliacaoId,
          ...posturalData,
        });
        toast({ title: 'Avaliação postural criada com sucesso!' });
      }
    } catch (error: any) {
      console.error('Erro ao salvar avaliação postural:', error);
      toast({ 
        title: 'Erro ao salvar avaliação postural',
        description: error?.message || 'Tente novamente',
        variant: 'destructive' 
      });
    }
  };

  const handleAnamneseSubmit = async (data: any) => {
    try {
      console.log('Salvando anamnese:', { alunoId, ...data });
      
      if (anamnese) {
        await updateAnamnese.mutateAsync({ id: anamnese.id, alunoId, ...data });
        toast({ title: 'Anamnese atualizada com sucesso!' });
      } else {
        await createAnamnese.mutateAsync({
          alunoId,
          ...data,
        });
        toast({ title: 'Anamnese criada com sucesso!' });
      }
    } catch (error: any) {
      console.error('Erro ao salvar anamnese:', error);
      toast({ 
        title: 'Erro ao salvar anamnese',
        description: error?.message || 'Tente novamente',
        variant: 'destructive' 
      });
    }
  };

  const handleAbrirAvaliacoesPosturais = () => {
    const dataAvaliacao = avaliacao?.data_avaliacao || new Date().toISOString().split('T')[0];
    setLocation(`/admin/avaliacoes-posturais?alunoId=${alunoId}&avaliacaoId=${avaliacaoId}&data=${dataAvaliacao}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Módulos Adicionais de Avaliação</DialogTitle>
        </DialogHeader>

        {/* Botão de Avaliação Postural com Fotos */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                  Avaliação Postural com Fotos
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Adicione fotos com grade de alinhamento e compare a evolução postural
                </p>
              </div>
            </div>
            <Button
              onClick={handleAbrirAvaliacoesPosturais}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Abrir
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="neuromotor" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Neuromotor
            </TabsTrigger>
            <TabsTrigger value="postural" className="flex items-center gap-2">
              <User2 className="w-4 h-4" />
              Postural (Texto)
            </TabsTrigger>
            <TabsTrigger value="anamnese" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Anamnese
            </TabsTrigger>
          </TabsList>

          <TabsContent value="neuromotor" className="mt-6">
            <FormularioNeuromotor
              defaultValues={neuromotor || {}}
              onSubmit={handleNeuromotorSubmit}
            />
          </TabsContent>

          <TabsContent value="postural" className="mt-6">
            <FormularioPostural
              defaultValues={postural || {}}
              onSubmit={handlePosturalSubmit}
              isLoading={createPostural.isPending || updatePostural.isPending}
            />
          </TabsContent>

          <TabsContent value="anamnese" className="mt-6">
            <FormularioAnamnese
              defaultValues={anamnese ? {
                ...anamnese,
                fumante: anamnese.fumante === 'true',
                praticaAtividadeFisica: anamnese.praticaAtividade === 'true',
              } : {}}
              onSubmit={handleAnamneseSubmit}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
