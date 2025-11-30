import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAlunos } from "@/hooks/useAlunos";
import { useCreateAvaliacaoFisica, useUpdateAvaliacaoFisica, useAvaliacaoById } from "@/hooks/useAvaliacoesFisicas";
import { useEffect } from "react";
import { Activity, Scale } from "lucide-react";

const avaliacaoSchema = z.object({
  aluno_id: z.string().min(1, "Selecione um aluno"),
  data_avaliacao: z.string().min(1, "Data é obrigatória"),
  tipo: z.enum(["online", "presencial"]).default("presencial"),
  status: z.enum(["agendada", "concluida", "cancelada"]).default("concluida"),
  
  // Medidas básicas
  peso: z.string().optional(),
  altura: z.string().optional(),
  
  // Circunferências
  circunferencia_torax: z.string().optional(),
  circunferencia_cintura: z.string().optional(),
  circunferencia_abdomen: z.string().optional(),
  circunferencia_quadril: z.string().optional(),
  circunferencia_braco_direito: z.string().optional(),
  circunferencia_braco_esquerdo: z.string().optional(),
  circunferencia_coxa_direita: z.string().optional(),
  circunferencia_coxa_esquerda: z.string().optional(),
  circunferencia_panturrilha_direita: z.string().optional(),
  circunferencia_panturrilha_esquerda: z.string().optional(),
  
  // Composição corporal
  percentual_gordura: z.string().optional(),
  massa_magra: z.string().optional(),
  
  // Observações
  observacoes: z.string().optional(),
  objetivos: z.string().optional(),
});

type AvaliacaoFormData = z.infer<typeof avaliacaoSchema>;

interface AvaliacaoFisicaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avaliacaoId?: string | null;
}

export default function AvaliacaoFisicaModal({ open, onOpenChange, avaliacaoId }: AvaliacaoFisicaModalProps) {
  const { data: alunos = [] } = useAlunos();
  const { data: avaliacaoExistente } = useAvaliacaoById(avaliacaoId || undefined);
  const createAvaliacao = useCreateAvaliacaoFisica();
  const updateAvaliacao = useUpdateAvaliacaoFisica();

  const form = useForm<AvaliacaoFormData>({
    resolver: zodResolver(avaliacaoSchema),
    defaultValues: {
      aluno_id: "",
      data_avaliacao: new Date().toISOString().split('T')[0],
      tipo: "presencial",
      status: "concluida",
    },
  });

  // Calcular IMC automaticamente
  const peso = form.watch("peso");
  const altura = form.watch("altura");

  // Preencher formulário ao editar
  useEffect(() => {
    if (avaliacaoExistente && avaliacaoId) {
      form.reset({
        aluno_id: avaliacaoExistente.aluno_id,
        data_avaliacao: avaliacaoExistente.data_avaliacao,
        tipo: avaliacaoExistente.tipo,
        status: avaliacaoExistente.status,
        peso: avaliacaoExistente.peso?.toString() || "",
        altura: avaliacaoExistente.altura?.toString() || "",
        circunferencia_torax: avaliacaoExistente.circunferencia_torax?.toString() || "",
        circunferencia_cintura: avaliacaoExistente.circunferencia_cintura?.toString() || "",
        circunferencia_abdomen: avaliacaoExistente.circunferencia_abdomen?.toString() || "",
        circunferencia_quadril: avaliacaoExistente.circunferencia_quadril?.toString() || "",
        circunferencia_braco_direito: avaliacaoExistente.circunferencia_braco_direito?.toString() || "",
        circunferencia_braco_esquerdo: avaliacaoExistente.circunferencia_braco_esquerdo?.toString() || "",
        circunferencia_coxa_direita: avaliacaoExistente.circunferencia_coxa_direita?.toString() || "",
        circunferencia_coxa_esquerda: avaliacaoExistente.circunferencia_coxa_esquerda?.toString() || "",
        circunferencia_panturrilha_direita: avaliacaoExistente.circunferencia_panturrilha_direita?.toString() || "",
        circunferencia_panturrilha_esquerda: avaliacaoExistente.circunferencia_panturrilha_esquerda?.toString() || "",
        percentual_gordura: avaliacaoExistente.percentual_gordura?.toString() || "",
        massa_magra: avaliacaoExistente.massa_magra?.toString() || "",
        observacoes: avaliacaoExistente.observacoes || "",
        objetivos: avaliacaoExistente.objetivos || "",
      });
    }
  }, [avaliacaoExistente, avaliacaoId, form]);

  const onSubmit = async (data: AvaliacaoFormData) => {
    try {
      // Calcular IMC
      let imc: string | undefined;
      if (data.peso && data.altura) {
        const pesoNum = parseFloat(data.peso);
        const alturaNum = parseInt(data.altura);
        if (pesoNum > 0 && alturaNum > 0) {
          imc = (pesoNum / Math.pow(alturaNum / 100, 2)).toFixed(2);
        }
      }

      const payload = {
        ...data,
        altura: data.altura ? parseInt(data.altura) : undefined,
        imc,
      };

      if (avaliacaoId) {
        await updateAvaliacao.mutateAsync({ id: avaliacaoId, data: payload });
      } else {
        await createAvaliacao.mutateAsync(payload);
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Erro ao salvar avaliação:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {avaliacaoId ? 'Editar Avaliação Física' : 'Nova Avaliação Física'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Básicos */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Scale className="w-4 h-4" />
                Informações Básicas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="aluno_id"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-white">Aluno *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue placeholder="Selecione o aluno" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {alunos.map((aluno: any) => (
                            <SelectItem key={aluno.id} value={aluno.id}>
                              {aluno.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="data_avaliacao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Data *</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="presencial">Presencial</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="peso"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Peso (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Ex: 75.5"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="altura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Altura (cm)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="Ex: 175"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {peso && altura && (
                  <div className="md:col-span-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-400">
                      IMC Calculado: <strong>
                        {(parseFloat(peso) / Math.pow(parseInt(altura) / 100, 2)).toFixed(2)}
                      </strong>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Circunferências */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Circunferências (cm)</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="circunferencia_torax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Tórax</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="circunferencia_cintura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Cintura</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="circunferencia_abdomen"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Abdômen</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="circunferencia_quadril"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Quadril</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="circunferencia_braco_direito"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Braço Direito</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="circunferencia_braco_esquerdo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Braço Esquerdo</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="circunferencia_coxa_direita"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Coxa Direita</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="circunferencia_coxa_esquerda"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Coxa Esquerda</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="circunferencia_panturrilha_direita"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Panturrilha Direita</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="circunferencia_panturrilha_esquerda"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Panturrilha Esquerda</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Composição Corporal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Composição Corporal</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="percentual_gordura"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">% Gordura</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Ex: 15.5"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="massa_magra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Massa Magra (kg)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="Ex: 65.0"
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white">Observações</h3>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Observações Gerais</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3}
                          placeholder="Anotações sobre a avaliação..."
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="objetivos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Objetivos</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={2}
                          placeholder="Objetivos do aluno..."
                          className="bg-gray-800 border-gray-700 text-white"
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-gray-700 text-gray-300"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createAvaliacao.isPending || updateAvaliacao.isPending}
                className="bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800"
              >
                {createAvaliacao.isPending || updateAvaliacao.isPending ? 'Salvando...' : 'Salvar Avaliação'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
