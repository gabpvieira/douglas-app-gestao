/**
 * Formulário para avaliação com protocolo Pollock 7 Dobras
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { calcularPollock7Dobras } from '@/lib/avaliacaoCalculos';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const schema = z.object({
  alunoId: z.string().min(1, 'Selecione um aluno'),
  dataAvaliacao: z.string().min(1, 'Data é obrigatória'),
  peso: z.number().min(1).max(300),
  altura: z.number().min(1).max(250),
  idade: z.number().min(1).max(120),
  genero: z.enum(['masculino', 'feminino']),
  
  // Dobras cutâneas
  triceps: z.number().min(0).max(100),
  subescapular: z.number().min(0).max(100),
  peitoral: z.number().min(0).max(100),
  axilarMedia: z.number().min(0).max(100),
  suprailiaca: z.number().min(0).max(100),
  abdominal: z.number().min(0).max(100),
  coxa: z.number().min(0).max(100),
  
  // Perimetria (opcional)
  torax: z.number().optional(),
  cintura: z.number().optional(),
  abdomen: z.number().optional(),
  quadril: z.number().optional(),
  bracoDireito: z.number().optional(),
  bracoEsquerdo: z.number().optional(),
  coxaDireita: z.number().optional(),
  coxaEsquerda: z.number().optional(),
  
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface FormularioPollock7DobrasProps {
  alunoId?: string;
  onSubmit: (dados: any) => void;
  onVoltar: () => void;
}

export default function FormularioPollock7Dobras({ 
  alunoId, 
  onSubmit, 
  onVoltar 
}: FormularioPollock7DobrasProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      alunoId: alunoId || '',
      dataAvaliacao: new Date().toISOString().split('T')[0],
      genero: 'masculino',
    },
  });

  // Buscar lista de alunos
  const { data: alunos } = useQuery({
    queryKey: ['alunos-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alunos')
        .select(`
          id,
          data_nascimento,
          altura,
          genero,
          user_profile:users_profile!inner(nome)
        `)
        .eq('status', 'ativo')
        .order('user_profile(nome)');

      if (error) throw error;
      return data;
    },
  });

  const handleFormSubmit = (data: FormData) => {
    // Calcular resultados
    const resultado = calcularPollock7Dobras(
      {
        peso: data.peso,
        altura: data.altura,
        idade: data.idade,
        genero: data.genero,
      },
      {
        triceps: data.triceps,
        subescapular: data.subescapular,
        peitoral: data.peitoral,
        axilarMedia: data.axilarMedia,
        suprailiaca: data.suprailiaca,
        abdominal: data.abdominal,
        coxa: data.coxa,
      }
    );

    onSubmit({
      alunoId: data.alunoId,
      dataAvaliacao: data.dataAvaliacao,
      peso: data.peso,
      altura: data.altura,
      idade: data.idade,
      genero: data.genero,
      protocolo: 'pollock_7_dobras',
      resultado,
      dobras: {
        triceps: data.triceps,
        subescapular: data.subescapular,
        peitoral: data.peitoral,
        axilarMedia: data.axilarMedia,
        suprailiaca: data.suprailiaca,
        abdominal: data.abdominal,
        coxa: data.coxa,
      },
      perimetria: {
        torax: data.torax,
        cintura: data.cintura,
        abdomen: data.abdomen,
        quadril: data.quadril,
        bracoDireito: data.bracoDireito,
        bracoEsquerdo: data.bracoEsquerdo,
        coxaDireita: data.coxaDireita,
        coxaEsquerda: data.coxaEsquerda,
      },
      observacoes: data.observacoes,
    });
  };

  const handleAlunoChange = (alunoId: string) => {
    setValue('alunoId', alunoId);
    
    const aluno = alunos?.find(a => a.id === alunoId);
    if (aluno) {
      if (aluno.altura) setValue('altura', aluno.altura);
      if (aluno.genero) setValue('genero', aluno.genero as 'masculino' | 'feminino');
      if (aluno.data_nascimento) {
        const idade = new Date().getFullYear() - new Date(aluno.data_nascimento).getFullYear();
        setValue('idade', idade);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Dados Básicos */}
      <div className="space-y-4">
        <h3 className="font-semibold">Informações Básicas</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {!alunoId && (
            <div className="space-y-2">
              <Label htmlFor="alunoId">Aluno *</Label>
              <Select onValueChange={handleAlunoChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o aluno" />
                </SelectTrigger>
                <SelectContent>
                  {alunos?.map((aluno) => (
                    <SelectItem key={aluno.id} value={aluno.id}>
                      {aluno.user_profile.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.alunoId && (
                <p className="text-sm text-destructive">{errors.alunoId.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="dataAvaliacao">Data da Avaliação *</Label>
            <Input
              id="dataAvaliacao"
              type="date"
              {...register('dataAvaliacao')}
            />
            {errors.dataAvaliacao && (
              <p className="text-sm text-destructive">{errors.dataAvaliacao.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="peso">Peso (kg) *</Label>
            <Input
              id="peso"
              type="number"
              step="0.1"
              placeholder="Ex: 75.5"
              {...register('peso', { valueAsNumber: true })}
            />
            {errors.peso && (
              <p className="text-sm text-destructive">{errors.peso.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="altura">Altura (cm) *</Label>
            <Input
              id="altura"
              type="number"
              placeholder="Ex: 175"
              {...register('altura', { valueAsNumber: true })}
            />
            {errors.altura && (
              <p className="text-sm text-destructive">{errors.altura.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="idade">Idade *</Label>
            <Input
              id="idade"
              type="number"
              placeholder="Ex: 30"
              {...register('idade', { valueAsNumber: true })}
            />
            {errors.idade && (
              <p className="text-sm text-destructive">{errors.idade.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="genero">Gênero *</Label>
            <Select onValueChange={(value) => setValue('genero', value as 'masculino' | 'feminino')} defaultValue="masculino">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Dobras Cutâneas */}
      <div className="space-y-4">
        <h3 className="font-semibold">Dobras Cutâneas (mm)</h3>
        <p className="text-sm text-muted-foreground">
          Meça cada dobra 3 vezes e use a média dos valores.
        </p>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="triceps">Tríceps *</Label>
            <Input
              id="triceps"
              type="number"
              step="0.1"
              placeholder="Ex: 10.5"
              {...register('triceps', { valueAsNumber: true })}
            />
            {errors.triceps && (
              <p className="text-sm text-destructive">{errors.triceps.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subescapular">Subescapular *</Label>
            <Input
              id="subescapular"
              type="number"
              step="0.1"
              placeholder="Ex: 12.0"
              {...register('subescapular', { valueAsNumber: true })}
            />
            {errors.subescapular && (
              <p className="text-sm text-destructive">{errors.subescapular.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="peitoral">Peitoral *</Label>
            <Input
              id="peitoral"
              type="number"
              step="0.1"
              placeholder="Ex: 8.5"
              {...register('peitoral', { valueAsNumber: true })}
            />
            {errors.peitoral && (
              <p className="text-sm text-destructive">{errors.peitoral.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="axilarMedia">Axilar Média *</Label>
            <Input
              id="axilarMedia"
              type="number"
              step="0.1"
              placeholder="Ex: 9.0"
              {...register('axilarMedia', { valueAsNumber: true })}
            />
            {errors.axilarMedia && (
              <p className="text-sm text-destructive">{errors.axilarMedia.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="suprailiaca">Supra-ilíaca *</Label>
            <Input
              id="suprailiaca"
              type="number"
              step="0.1"
              placeholder="Ex: 14.0"
              {...register('suprailiaca', { valueAsNumber: true })}
            />
            {errors.suprailiaca && (
              <p className="text-sm text-destructive">{errors.suprailiaca.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="abdominal">Abdominal *</Label>
            <Input
              id="abdominal"
              type="number"
              step="0.1"
              placeholder="Ex: 16.5"
              {...register('abdominal', { valueAsNumber: true })}
            />
            {errors.abdominal && (
              <p className="text-sm text-destructive">{errors.abdominal.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coxa">Coxa *</Label>
            <Input
              id="coxa"
              type="number"
              step="0.1"
              placeholder="Ex: 13.0"
              {...register('coxa', { valueAsNumber: true })}
            />
            {errors.coxa && (
              <p className="text-sm text-destructive">{errors.coxa.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Perimetria (Opcional) */}
      <div className="space-y-4">
        <h3 className="font-semibold">Perimetria (cm) - Opcional</h3>
        
        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="torax">Tórax</Label>
            <Input
              id="torax"
              type="number"
              step="0.1"
              placeholder="Ex: 95.0"
              {...register('torax', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cintura">Cintura</Label>
            <Input
              id="cintura"
              type="number"
              step="0.1"
              placeholder="Ex: 80.0"
              {...register('cintura', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abdomen">Abdômen</Label>
            <Input
              id="abdomen"
              type="number"
              step="0.1"
              placeholder="Ex: 85.0"
              {...register('abdomen', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quadril">Quadril</Label>
            <Input
              id="quadril"
              type="number"
              step="0.1"
              placeholder="Ex: 98.0"
              {...register('quadril', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bracoDireito">Braço Direito</Label>
            <Input
              id="bracoDireito"
              type="number"
              step="0.1"
              placeholder="Ex: 35.0"
              {...register('bracoDireito', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bracoEsquerdo">Braço Esquerdo</Label>
            <Input
              id="bracoEsquerdo"
              type="number"
              step="0.1"
              placeholder="Ex: 35.0"
              {...register('bracoEsquerdo', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coxaDireita">Coxa Direita</Label>
            <Input
              id="coxaDireita"
              type="number"
              step="0.1"
              placeholder="Ex: 55.0"
              {...register('coxaDireita', { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coxaEsquerda">Coxa Esquerda</Label>
            <Input
              id="coxaEsquerda"
              type="number"
              step="0.1"
              placeholder="Ex: 55.0"
              {...register('coxaEsquerda', { valueAsNumber: true })}
            />
          </div>
        </div>
      </div>

      {/* Observações */}
      <div className="space-y-2">
        <Label htmlFor="observacoes">Observações</Label>
        <Textarea
          id="observacoes"
          placeholder="Observações sobre a avaliação..."
          rows={3}
          {...register('observacoes')}
        />
      </div>

      {/* Botões */}
      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onVoltar}>
          Voltar
        </Button>
        <Button type="submit">
          Calcular e Continuar
        </Button>
      </div>
    </form>
  );
}
