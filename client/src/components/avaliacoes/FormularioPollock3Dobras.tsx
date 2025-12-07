/**
 * Formulário para avaliação com protocolo Pollock 3 Dobras
 * Dobras diferentes para homens e mulheres
 */

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { calcularPollock3DobrasHomem, calcularPollock3DobrasMulher } from '@/lib/avaliacaoCalculos';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const schema = z.object({
  alunoId: z.string().min(1, 'Selecione um aluno'),
  dataAvaliacao: z.string().min(1, 'Data é obrigatória'),
  peso: z.number().min(1).max(300),
  altura: z.number().min(1).max(250),
  idade: z.number().min(1).max(120),
  genero: z.enum(['masculino', 'feminino']),
  
  // Dobras - variam por gênero
  dobra1: z.number().min(0).max(100),
  dobra2: z.number().min(0).max(100),
  dobra3: z.number().min(0).max(100),
  
  observacoes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface FormularioPollock3DobrasProps {
  alunoId?: string;
  onSubmit: (dados: any) => void;
  onVoltar: () => void;
  dadosIniciais?: any;
}

export default function FormularioPollock3Dobras({ 
  alunoId, 
  onSubmit, 
  onVoltar,
  dadosIniciais 
}: FormularioPollock3DobrasProps) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: dadosIniciais || {
      alunoId: alunoId || '',
      dataAvaliacao: new Date().toISOString().split('T')[0],
      genero: 'masculino',
    },
  });

  const genero = watch('genero');
  const selectedAlunoId = watch('alunoId');

  const { data: alunos } = useQuery({
    queryKey: ['alunos-select'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alunos')
        .select(`id, data_nascimento, altura, genero, user_profile:users_profile!inner(nome)`)
        .eq('status', 'ativo')
        .order('user_profile(nome)');
      if (error) throw error;
      return data;
    },
  });

  const handleFormSubmit = (data: FormData) => {
    let resultado;
    let dobras;

    if (data.genero === 'masculino') {
      dobras = {
        peitoral: data.dobra1,
        abdominal: data.dobra2,
        coxa: data.dobra3,
      };
      resultado = calcularPollock3DobrasHomem(
        { peso: data.peso, altura: data.altura, idade: data.idade, genero: data.genero },
        dobras
      );
    } else {
      dobras = {
        triceps: data.dobra1,
        suprailiaca: data.dobra2,
        coxa: data.dobra3,
      };
      resultado = calcularPollock3DobrasMulher(
        { peso: data.peso, altura: data.altura, idade: data.idade, genero: data.genero },
        dobras
      );
    }

    onSubmit({
      alunoId: data.alunoId,
      dataAvaliacao: data.dataAvaliacao,
      peso: data.peso,
      altura: data.altura,
      idade: data.idade,
      genero: data.genero,
      protocolo: 'pollock_3_dobras',
      resultado,
      dobras,
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

  const getDobrasLabels = () => {
    if (genero === 'masculino') {
      return ['Peitoral', 'Abdominal', 'Coxa'];
    }
    return ['Tríceps', 'Supra-ilíaca', 'Coxa'];
  };

  const labels = getDobrasLabels();

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Informações Básicas</h3>
        
        <div className="grid gap-4 md:grid-cols-2">
          {!alunoId && (
            <div className="space-y-2">
              <Label>Aluno *</Label>
              <Select value={selectedAlunoId} onValueChange={handleAlunoChange}>
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
              {errors.alunoId && <p className="text-sm text-destructive">{errors.alunoId.message}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label>Data *</Label>
            <Input type="date" {...register('dataAvaliacao')} />
            {errors.dataAvaliacao && <p className="text-sm text-destructive">{errors.dataAvaliacao.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Peso (kg) *</Label>
            <Input type="number" step="0.1" placeholder="75.5" {...register('peso', { valueAsNumber: true })} />
            {errors.peso && <p className="text-sm text-destructive">{errors.peso.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Altura (cm) *</Label>
            <Input type="number" placeholder="175" {...register('altura', { valueAsNumber: true })} />
            {errors.altura && <p className="text-sm text-destructive">{errors.altura.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Idade *</Label>
            <Input type="number" placeholder="30" {...register('idade', { valueAsNumber: true })} />
            {errors.idade && <p className="text-sm text-destructive">{errors.idade.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Gênero *</Label>
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

      <div className="space-y-4">
        <h3 className="font-semibold">Dobras Cutâneas (mm)</h3>
        <p className="text-sm text-muted-foreground">
          {genero === 'masculino' 
            ? 'Para homens: Peitoral, Abdominal e Coxa'
            : 'Para mulheres: Tríceps, Supra-ilíaca e Coxa'}
        </p>
        
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>{labels[0]} *</Label>
            <Input type="number" step="0.1" placeholder="10.5" {...register('dobra1', { valueAsNumber: true })} />
            {errors.dobra1 && <p className="text-sm text-destructive">{errors.dobra1.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{labels[1]} *</Label>
            <Input type="number" step="0.1" placeholder="12.0" {...register('dobra2', { valueAsNumber: true })} />
            {errors.dobra2 && <p className="text-sm text-destructive">{errors.dobra2.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>{labels[2]} *</Label>
            <Input type="number" step="0.1" placeholder="13.5" {...register('dobra3', { valueAsNumber: true })} />
            {errors.dobra3 && <p className="text-sm text-destructive">{errors.dobra3.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Observações</Label>
        <Textarea placeholder="Observações..." rows={3} {...register('observacoes')} />
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onVoltar}>Voltar</Button>
        <Button type="submit">Calcular e Continuar</Button>
      </div>
    </form>
  );
}
