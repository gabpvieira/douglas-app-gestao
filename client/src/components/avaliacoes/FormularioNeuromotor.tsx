import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Activity, Zap, Gauge, Target } from 'lucide-react';

const neuromotorSchema = z.object({
  // Força
  preensaoManualDireita: z.number().min(0).max(100).optional(),
  preensaoManualEsquerda: z.number().min(0).max(100).optional(),
  
  // Resistência
  flexoes1min: z.number().int().min(0).max(200).optional(),
  abdominais1min: z.number().int().min(0).max(200).optional(),
  pranchaSegundos: z.number().int().min(0).max(600).optional(),
  
  // Flexibilidade
  sentarAlcancarCm: z.number().min(-50).max(50).optional(),
  flexaoOmbrosDireito: z.number().min(0).max(180).optional(),
  flexaoOmbrosEsquerdo: z.number().min(0).max(180).optional(),
  
  // Agilidade
  shuttleRunSegundos: z.number().min(0).max(60).optional(),
  testeTSegundos: z.number().min(0).max(60).optional(),
  
  // Equilíbrio
  equilibrioOlhosAbertosSegundos: z.number().int().min(0).max(300).optional(),
  equilibrioOlhosFechadosSegundos: z.number().int().min(0).max(300).optional(),
  equilibrioUnipodalDireitoSegundos: z.number().int().min(0).max(300).optional(),
  equilibrioUnipodalEsquerdoSegundos: z.number().int().min(0).max(300).optional(),
  
  // Potência
  saltoVerticalCm: z.number().min(0).max(150).optional(),
  saltoHorizontalCm: z.number().min(0).max(400).optional(),
  
  observacoes: z.string().optional(),
});

type NeuromotorFormData = z.infer<typeof neuromotorSchema>;

interface FormularioNeuromotorProps {
  defaultValues?: Partial<NeuromotorFormData>;
  onSubmit: (data: NeuromotorFormData) => void;
  onBack?: () => void;
}

export function FormularioNeuromotor({ defaultValues, onSubmit, onBack }: FormularioNeuromotorProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<NeuromotorFormData>({
    resolver: zodResolver(neuromotorSchema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Força */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold">Força</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="preensaoManualDireita">Preensão Manual Direita (kg)</Label>
            <Input
              id="preensaoManualDireita"
              type="number"
              step="0.1"
              {...register('preensaoManualDireita', { valueAsNumber: true })}
            />
            {errors.preensaoManualDireita && (
              <p className="text-sm text-red-500 mt-1">{errors.preensaoManualDireita.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="preensaoManualEsquerda">Preensão Manual Esquerda (kg)</Label>
            <Input
              id="preensaoManualEsquerda"
              type="number"
              step="0.1"
              {...register('preensaoManualEsquerda', { valueAsNumber: true })}
            />
            {errors.preensaoManualEsquerda && (
              <p className="text-sm text-red-500 mt-1">{errors.preensaoManualEsquerda.message}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Resistência */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold">Resistência</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="flexoes1min">Flexões (1 min)</Label>
            <Input
              id="flexoes1min"
              type="number"
              {...register('flexoes1min', { valueAsNumber: true })}
            />
            {errors.flexoes1min && (
              <p className="text-sm text-red-500 mt-1">{errors.flexoes1min.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="abdominais1min">Abdominais (1 min)</Label>
            <Input
              id="abdominais1min"
              type="number"
              {...register('abdominais1min', { valueAsNumber: true })}
            />
            {errors.abdominais1min && (
              <p className="text-sm text-red-500 mt-1">{errors.abdominais1min.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="pranchaSegundos">Prancha (segundos)</Label>
            <Input
              id="pranchaSegundos"
              type="number"
              {...register('pranchaSegundos', { valueAsNumber: true })}
            />
            {errors.pranchaSegundos && (
              <p className="text-sm text-red-500 mt-1">{errors.pranchaSegundos.message}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Flexibilidade */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold">Flexibilidade</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="sentarAlcancarCm">Sentar e Alcançar (cm)</Label>
            <Input
              id="sentarAlcancarCm"
              type="number"
              step="0.1"
              placeholder="+ passa dos pés, - não alcança"
              {...register('sentarAlcancarCm', { valueAsNumber: true })}
            />
            {errors.sentarAlcancarCm && (
              <p className="text-sm text-red-500 mt-1">{errors.sentarAlcancarCm.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="flexaoOmbrosDireito">Flexão Ombros Direito (°)</Label>
            <Input
              id="flexaoOmbrosDireito"
              type="number"
              step="1"
              {...register('flexaoOmbrosDireito', { valueAsNumber: true })}
            />
            {errors.flexaoOmbrosDireito && (
              <p className="text-sm text-red-500 mt-1">{errors.flexaoOmbrosDireito.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="flexaoOmbrosEsquerdo">Flexão Ombros Esquerdo (°)</Label>
            <Input
              id="flexaoOmbrosEsquerdo"
              type="number"
              step="1"
              {...register('flexaoOmbrosEsquerdo', { valueAsNumber: true })}
            />
            {errors.flexaoOmbrosEsquerdo && (
              <p className="text-sm text-red-500 mt-1">{errors.flexaoOmbrosEsquerdo.message}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Agilidade */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Gauge className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-semibold">Agilidade</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="shuttleRunSegundos">Shuttle Run (segundos)</Label>
            <Input
              id="shuttleRunSegundos"
              type="number"
              step="0.1"
              {...register('shuttleRunSegundos', { valueAsNumber: true })}
            />
            {errors.shuttleRunSegundos && (
              <p className="text-sm text-red-500 mt-1">{errors.shuttleRunSegundos.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="testeTSegundos">Teste T (segundos)</Label>
            <Input
              id="testeTSegundos"
              type="number"
              step="0.1"
              {...register('testeTSegundos', { valueAsNumber: true })}
            />
            {errors.testeTSegundos && (
              <p className="text-sm text-red-500 mt-1">{errors.testeTSegundos.message}</p>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Equilíbrio */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Equilíbrio</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="equilibrioOlhosAbertosSegundos">Olhos Abertos (seg)</Label>
            <Input
              id="equilibrioOlhosAbertosSegundos"
              type="number"
              {...register('equilibrioOlhosAbertosSegundos', { valueAsNumber: true })}
            />
          </div>
          
          <div>
            <Label htmlFor="equilibrioOlhosFechadosSegundos">Olhos Fechados (seg)</Label>
            <Input
              id="equilibrioOlhosFechadosSegundos"
              type="number"
              {...register('equilibrioOlhosFechadosSegundos', { valueAsNumber: true })}
            />
          </div>
          
          <div>
            <Label htmlFor="equilibrioUnipodalDireitoSegundos">Unipodal Direito (seg)</Label>
            <Input
              id="equilibrioUnipodalDireitoSegundos"
              type="number"
              {...register('equilibrioUnipodalDireitoSegundos', { valueAsNumber: true })}
            />
          </div>
          
          <div>
            <Label htmlFor="equilibrioUnipodalEsquerdoSegundos">Unipodal Esquerdo (seg)</Label>
            <Input
              id="equilibrioUnipodalEsquerdoSegundos"
              type="number"
              {...register('equilibrioUnipodalEsquerdoSegundos', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Potência */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Potência</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="saltoVerticalCm">Salto Vertical (cm)</Label>
            <Input
              id="saltoVerticalCm"
              type="number"
              step="0.1"
              {...register('saltoVerticalCm', { valueAsNumber: true })}
            />
          </div>
          
          <div>
            <Label htmlFor="saltoHorizontalCm">Salto Horizontal (cm)</Label>
            <Input
              id="saltoHorizontalCm"
              type="number"
              step="0.1"
              {...register('saltoHorizontalCm', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Observações */}
      <div>
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          rows={4}
          placeholder="Observações sobre os testes realizados..."
          {...register('observacoes')}
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
          Salvar Avaliação Neuromotora
        </Button>
      </div>
    </form>
  );
}
