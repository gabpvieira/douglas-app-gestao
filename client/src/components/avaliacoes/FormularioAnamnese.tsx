import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';

const anamneseSchema = z.object({
  // Dados Pessoais
  profissao: z.string().optional(),
  nivelAtividade: z.string().optional(),
  
  // Histórico de Saúde
  doencasCronicas: z.array(z.string()).optional(),
  cirurgiasPrevias: z.string().optional(),
  medicamentosUso: z.string().optional(),
  alergias: z.string().optional(),
  lesoesPrevias: z.string().optional(),
  doresAtuais: z.string().optional(),
  
  // Hábitos de Vida
  fumante: z.boolean().default(false),
  consumoAlcool: z.string().optional(),
  horasSonoNoite: z.number().min(0).max(24).optional(),
  qualidadeSono: z.string().optional(),
  nivelStress: z.string().optional(),
  
  // Atividade Física
  praticaAtividadeFisica: z.boolean().default(false),
  atividadesPraticadas: z.array(z.string()).optional(),
  frequenciaSemanal: z.number().int().min(0).max(7).optional(),
  tempoPraticaMeses: z.number().int().min(0).optional(),
  
  // Alimentação
  refeicoesPorDia: z.number().int().min(1).max(10).optional(),
  consumoAguaLitros: z.number().min(0).max(10).optional(),
  restricoesAlimentares: z.string().optional(),
  suplementacao: z.string().optional(),
  
  // Objetivos
  objetivoPrincipal: z.string().optional(),
  objetivosSecundarios: z.array(z.string()).optional(),
  prazoObjetivoMeses: z.number().int().min(1).max(60).optional(),
  motivacao: z.string().optional(),
  
  // Limitações
  limitacoesFisicas: z.string().optional(),
  restricoesMedicas: z.string().optional(),
  disponibilidadeTreino: z.string().optional(),
  
  observacoesGerais: z.string().optional(),
});

type AnamneseFormData = z.infer<typeof anamneseSchema>;

interface FormularioAnamneseProps {
  defaultValues?: Partial<AnamneseFormData>;
  onSubmit: (data: AnamneseFormData) => void;
  onBack?: () => void;
}

export function FormularioAnamnese({ defaultValues, onSubmit, onBack }: FormularioAnamneseProps) {
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<AnamneseFormData>({
    resolver: zodResolver(anamneseSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Dados Pessoais */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dados Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="profissao">Profissão</Label>
            <Input
              id="profissao"
              {...register('profissao')}
            />
          </div>
          
          <div>
            <Label htmlFor="nivelAtividade">Nível de Atividade Diária</Label>
            <Controller
              name="nivelAtividade"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sedentario">Sedentário</SelectItem>
                    <SelectItem value="leve">Leve</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="intenso">Intenso</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Histórico de Saúde */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Histórico de Saúde</h3>
        
        <div>
          <Label htmlFor="doencasCronicas">Doenças Crônicas</Label>
          <Textarea
            id="doencasCronicas"
            rows={2}
            placeholder="Diabetes, hipertensão, etc..."
            {...register('doencasCronicas')}
          />
        </div>
        
        <div>
          <Label htmlFor="cirurgiasPrevias">Cirurgias Prévias</Label>
          <Textarea
            id="cirurgiasPrevias"
            rows={2}
            {...register('cirurgiasPrevias')}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="medicamentosUso">Medicamentos em Uso</Label>
            <Textarea
              id="medicamentosUso"
              rows={2}
              {...register('medicamentosUso')}
            />
          </div>
          
          <div>
            <Label htmlFor="alergias">Alergias</Label>
            <Textarea
              id="alergias"
              rows={2}
              {...register('alergias')}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="lesoesPrevias">Lesões Prévias</Label>
            <Textarea
              id="lesoesPrevias"
              rows={2}
              {...register('lesoesPrevias')}
            />
          </div>
          
          <div>
            <Label htmlFor="doresAtuais">Dores Atuais</Label>
            <Textarea
              id="doresAtuais"
              rows={2}
              {...register('doresAtuais')}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Hábitos de Vida */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Hábitos de Vida</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Controller
              name="fumante"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="fumante"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="fumante" className="cursor-pointer">Fumante</Label>
          </div>
          
          <div>
            <Label htmlFor="consumoAlcool">Consumo de Álcool</Label>
            <Controller
              name="consumoAlcool"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nao">Não consome</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="frequente">Frequente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="horasSonoNoite">Horas de Sono/Noite</Label>
            <Input
              id="horasSonoNoite"
              type="number"
              step="0.5"
              {...register('horasSonoNoite', { valueAsNumber: true })}
            />
          </div>
          
          <div>
            <Label htmlFor="qualidadeSono">Qualidade do Sono</Label>
            <Controller
              name="qualidadeSono"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="otima">Ótima</SelectItem>
                    <SelectItem value="boa">Boa</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="ruim">Ruim</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          <div>
            <Label htmlFor="nivelStress">Nível de Stress</Label>
            <Controller
              name="nivelStress"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="moderado">Moderado</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Atividade Física */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Atividade Física</h3>
        
        <div className="flex items-center space-x-2">
          <Controller
            name="praticaAtividadeFisica"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="praticaAtividadeFisica"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="praticaAtividadeFisica" className="cursor-pointer">
            Pratica atividade física atualmente
          </Label>
        </div>
        
        {watch('praticaAtividadeFisica') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="atividadesPraticadas">Atividades Praticadas</Label>
              <Textarea
                id="atividadesPraticadas"
                rows={2}
                placeholder="Musculação, corrida, natação..."
                {...register('atividadesPraticadas')}
              />
            </div>
            
            <div>
              <Label htmlFor="frequenciaSemanal">Frequência Semanal</Label>
              <Input
                id="frequenciaSemanal"
                type="number"
                min="0"
                max="7"
                {...register('frequenciaSemanal', { valueAsNumber: true })}
              />
            </div>
            
            <div>
              <Label htmlFor="tempoPraticaMeses">Tempo de Prática (meses)</Label>
              <Input
                id="tempoPraticaMeses"
                type="number"
                min="0"
                {...register('tempoPraticaMeses', { valueAsNumber: true })}
              />
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Alimentação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Alimentação</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="refeicoesPorDia">Refeições por Dia</Label>
            <Input
              id="refeicoesPorDia"
              type="number"
              min="1"
              max="10"
              {...register('refeicoesPorDia', { valueAsNumber: true })}
            />
          </div>
          
          <div>
            <Label htmlFor="consumoAguaLitros">Consumo de Água (litros/dia)</Label>
            <Input
              id="consumoAguaLitros"
              type="number"
              step="0.5"
              min="0"
              max="10"
              {...register('consumoAguaLitros', { valueAsNumber: true })}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="restricoesAlimentares">Restrições Alimentares</Label>
            <Textarea
              id="restricoesAlimentares"
              rows={2}
              placeholder="Vegetariano, intolerância à lactose, etc..."
              {...register('restricoesAlimentares')}
            />
          </div>
          
          <div>
            <Label htmlFor="suplementacao">Suplementação</Label>
            <Textarea
              id="suplementacao"
              rows={2}
              placeholder="Whey, creatina, vitaminas..."
              {...register('suplementacao')}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Objetivos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Objetivos</h3>
        
        <div>
          <Label htmlFor="objetivoPrincipal">Objetivo Principal</Label>
          <Textarea
            id="objetivoPrincipal"
            rows={2}
            placeholder="Hipertrofia, emagrecimento, condicionamento..."
            {...register('objetivoPrincipal')}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="objetivosSecundarios">Objetivos Secundários</Label>
            <Textarea
              id="objetivosSecundarios"
              rows={2}
              {...register('objetivosSecundarios')}
            />
          </div>
          
          <div>
            <Label htmlFor="prazoObjetivoMeses">Prazo para Objetivo (meses)</Label>
            <Input
              id="prazoObjetivoMeses"
              type="number"
              min="1"
              max="60"
              {...register('prazoObjetivoMeses', { valueAsNumber: true })}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="motivacao">Motivação</Label>
          <Textarea
            id="motivacao"
            rows={3}
            placeholder="O que te motiva a treinar?"
            {...register('motivacao')}
          />
        </div>
      </div>

      <Separator />

      {/* Limitações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Limitações e Restrições</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="limitacoesFisicas">Limitações Físicas</Label>
            <Textarea
              id="limitacoesFisicas"
              rows={3}
              placeholder="Dores, lesões, amplitude limitada..."
              {...register('limitacoesFisicas')}
            />
          </div>
          
          <div>
            <Label htmlFor="restricoesMedicas">Restrições Médicas</Label>
            <Textarea
              id="restricoesMedicas"
              rows={3}
              placeholder="Exercícios proibidos, cuidados especiais..."
              {...register('restricoesMedicas')}
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="disponibilidadeTreino">Disponibilidade para Treino</Label>
          <Textarea
            id="disponibilidadeTreino"
            rows={2}
            placeholder="Dias e horários disponíveis..."
            {...register('disponibilidadeTreino')}
          />
        </div>
      </div>

      <Separator />

      {/* Observações Gerais */}
      <div>
        <Label htmlFor="observacoesGerais">Observações Gerais</Label>
        <Textarea
          id="observacoesGerais"
          rows={4}
          placeholder="Outras informações relevantes..."
          {...register('observacoesGerais')}
        />
      </div>

      {/* Botões */}
      <div className="flex justify-between pt-4">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
        )}
        <Button type="submit" className="ml-auto">
          Salvar Anamnese
        </Button>
      </div>
    </form>
  );
}
