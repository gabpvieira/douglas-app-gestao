import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Upload } from 'lucide-react';
import { useState } from 'react';

const posturalSchema = z.object({
  // Cabeça
  cabecaAlinhamento: z.string().optional(),
  cabecaObservacoes: z.string().optional(),
  
  // Ombros
  ombrosAlinhamento: z.string().optional(),
  ombrosObservacoes: z.string().optional(),
  
  // Coluna
  colunaCervical: z.string().optional(),
  colunaToracica: z.string().optional(),
  colunaLombar: z.string().optional(),
  colunaEscoliose: z.string().optional(),
  colunaObservacoes: z.string().optional(),
  
  // Pelve
  pelveAlinhamento: z.string().optional(),
  pelveObservacoes: z.string().optional(),
  
  // Joelhos
  joelhosAlinhamento: z.string().optional(),
  joelhosObservacoes: z.string().optional(),
  
  // Pés
  pesTipo: z.string().optional(),
  pesObservacoes: z.string().optional(),
  
  // Observações Gerais
  observacoesGerais: z.string().optional(),
  recomendacoes: z.string().optional(),
});

type PosturalFormData = z.infer<typeof posturalSchema>;

interface FormularioPosturalProps {
  defaultValues?: Partial<PosturalFormData>;
  onSubmit: (data: PosturalFormData & { fotos?: File[] }) => void;
  onBack?: () => void;
}

export function FormularioPostural({ defaultValues, onSubmit, onBack }: FormularioPosturalProps) {
  const { register, handleSubmit, setValue, watch } = useForm<PosturalFormData>({
    resolver: zodResolver(posturalSchema),
    defaultValues,
  });

  const [fotos, setFotos] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFotos(Array.from(e.target.files));
    }
  };

  const handleFormSubmit = (data: PosturalFormData) => {
    onSubmit({ ...data, fotos });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Upload de Fotos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Fotos Posturais</h3>
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <Label htmlFor="fotos" className="cursor-pointer">
            <span className="text-blue-500 hover:text-blue-400">Clique para fazer upload</span>
            <span className="text-gray-400"> ou arraste as fotos aqui</span>
          </Label>
          <input
            id="fotos"
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-sm text-gray-500 mt-2">
            Recomendado: Frente, Costas, Lateral Direita, Lateral Esquerda
          </p>
          {fotos.length > 0 && (
            <p className="text-sm text-green-500 mt-2">
              {fotos.length} foto(s) selecionada(s)
            </p>
          )}
        </div>
      </div>

      <Separator />

      {/* Cabeça */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Cabeça</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="cabecaAlinhamento">Alinhamento</Label>
            <Select
              value={watch('cabecaAlinhamento')}
              onValueChange={(value) => setValue('cabecaAlinhamento', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="anteriorizada">Anteriorizada</SelectItem>
                <SelectItem value="lateralizada_direita">Lateralizada Direita</SelectItem>
                <SelectItem value="lateralizada_esquerda">Lateralizada Esquerda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="cabecaObservacoes">Observações</Label>
            <Textarea
              id="cabecaObservacoes"
              rows={2}
              {...register('cabecaObservacoes')}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Ombros */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Ombros</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ombrosAlinhamento">Alinhamento</Label>
            <Select
              value={watch('ombrosAlinhamento')}
              onValueChange={(value) => setValue('ombrosAlinhamento', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="elevado_direito">Elevado Direito</SelectItem>
                <SelectItem value="elevado_esquerdo">Elevado Esquerdo</SelectItem>
                <SelectItem value="protraidos">Protraídos</SelectItem>
                <SelectItem value="retraidos">Retraídos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ombrosObservacoes">Observações</Label>
            <Textarea
              id="ombrosObservacoes"
              rows={2}
              {...register('ombrosObservacoes')}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Coluna */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Coluna Vertebral</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="colunaCervical">Cervical</Label>
            <Select
              value={watch('colunaCervical')}
              onValueChange={(value) => setValue('colunaCervical', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="hiperlordose">Hiperlordose</SelectItem>
                <SelectItem value="retificada">Retificada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="colunaToracica">Torácica</Label>
            <Select
              value={watch('colunaToracica')}
              onValueChange={(value) => setValue('colunaToracica', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="hipercifose">Hipercifose</SelectItem>
                <SelectItem value="retificada">Retificada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="colunaLombar">Lombar</Label>
            <Select
              value={watch('colunaLombar')}
              onValueChange={(value) => setValue('colunaLombar', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="hiperlordose">Hiperlordose</SelectItem>
                <SelectItem value="retificada">Retificada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="colunaEscoliose">Escoliose</Label>
            <Select
              value={watch('colunaEscoliose')}
              onValueChange={(value) => setValue('colunaEscoliose', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ausente">Ausente</SelectItem>
                <SelectItem value="leve">Leve</SelectItem>
                <SelectItem value="moderada">Moderada</SelectItem>
                <SelectItem value="severa">Severa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label htmlFor="colunaObservacoes">Observações</Label>
          <Textarea
            id="colunaObservacoes"
            rows={2}
            {...register('colunaObservacoes')}
          />
        </div>
      </div>

      <Separator />

      {/* Pelve */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pelve</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pelveAlinhamento">Alinhamento</Label>
            <Select
              value={watch('pelveAlinhamento')}
              onValueChange={(value) => setValue('pelveAlinhamento', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="anteversao">Anteversão</SelectItem>
                <SelectItem value="retroversao">Retroversão</SelectItem>
                <SelectItem value="rotacao_direita">Rotação Direita</SelectItem>
                <SelectItem value="rotacao_esquerda">Rotação Esquerda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pelveObservacoes">Observações</Label>
            <Textarea
              id="pelveObservacoes"
              rows={2}
              {...register('pelveObservacoes')}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Joelhos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Joelhos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="joelhosAlinhamento">Alinhamento</Label>
            <Select
              value={watch('joelhosAlinhamento')}
              onValueChange={(value) => setValue('joelhosAlinhamento', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="varo">Varo (pernas arqueadas)</SelectItem>
                <SelectItem value="valgo">Valgo (joelhos para dentro)</SelectItem>
                <SelectItem value="recurvatum">Recurvatum (hiperextensão)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="joelhosObservacoes">Observações</Label>
            <Textarea
              id="joelhosObservacoes"
              rows={2}
              {...register('joelhosObservacoes')}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Pés */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Pés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="pesTipo">Tipo de Pé</Label>
            <Select
              value={watch('pesTipo')}
              onValueChange={(value) => setValue('pesTipo', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="plano">Plano (pé chato)</SelectItem>
                <SelectItem value="cavo">Cavo (arco elevado)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="pesObservacoes">Observações</Label>
            <Textarea
              id="pesObservacoes"
              rows={2}
              {...register('pesObservacoes')}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Observações Gerais */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="observacoesGerais">Observações Gerais</Label>
          <Textarea
            id="observacoesGerais"
            rows={4}
            placeholder="Observações gerais sobre a postura..."
            {...register('observacoesGerais')}
          />
        </div>
        
        <div>
          <Label htmlFor="recomendacoes">Recomendações</Label>
          <Textarea
            id="recomendacoes"
            rows={4}
            placeholder="Recomendações de exercícios corretivos, alongamentos, etc..."
            {...register('recomendacoes')}
          />
        </div>
      </div>

      {/* Botões */}
      <div className="flex justify-between pt-4">
        {onBack && (
          <Button type="button" variant="outline" onClick={onBack}>
            Voltar
          </Button>
        )}
        <Button type="submit" className="ml-auto">
          Salvar Avaliação Postural
        </Button>
      </div>
    </form>
  );
}
