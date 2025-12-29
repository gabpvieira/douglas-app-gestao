import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

// =====================================================
// TIPOS PARA AVALIAÇÕES ADICIONAIS
// =====================================================

export interface AvaliacaoNeuromotoraData {
  id?: string;
  avaliacaoId: string;
  alunoId?: string;
  // Força
  forcaPreensaoManualDir?: string;
  forcaPreensaoManualEsq?: string;
  // Resistência Muscular
  flexaoBraco?: number;
  abdominal1min?: number;
  agachamento?: number;
  pranchaIsometrica?: number;
  // Flexibilidade
  sentarAlcancar?: string;
  flexaoQuadrilDir?: string;
  flexaoQuadrilEsq?: string;
  // Agilidade
  shuttleRun?: string;
  teste3Cones?: string;
  // Equilíbrio
  apoioUnicoPernaDir?: number;
  apoioUnicoPernaEsq?: number;
  // Velocidade
  corrida20m?: string;
  corrida40m?: string;
  // Potência
  saltoVertical?: string;
  saltoHorizontal?: string;
  // Coordenação
  arremessoBola?: string;
  observacoes?: string;
}

export interface AvaliacaoPosturalData {
  id?: string;
  avaliacaoId: string;
  // Cabeça
  cabecaAlinhamento?: string;
  cabecaObservacoes?: string;
  // Ombros
  ombrosAlinhamento?: string;
  ombrosObservacoes?: string;
  // Coluna
  colunaCervical?: string;
  colunaToracica?: string;
  colunaLombar?: string;
  colunaEscoliose?: string;
  colunaObservacoes?: string;
  // Pelve
  pelveAlinhamento?: string;
  pelveObservacoes?: string;
  // Joelhos
  joelhosAlinhamento?: string;
  joelhosObservacoes?: string;
  // Pés
  pesTipo?: string;
  pesObservacoes?: string;
  // Observações Gerais
  observacoesGerais?: string;
  recomendacoes?: string;
}

export interface AnamneseData {
  id?: string;
  alunoId: string;
  profissao?: string;
  nivelAtividade?: string;
  doencasPreexistentes?: string[];
  cirurgias?: string;
  lesoes?: string;
  medicamentos?: string[];
  fumante?: string;
  consumoAlcool?: string;
  horasSono?: string;
  qualidadeSono?: string;
  praticaAtividade?: string;
  tipoAtividade?: string[];
  frequenciaSemanal?: number;
  tempoSessao?: number;
  objetivoPrincipal?: string;
  objetivosSecundarios?: string[];
  restricoesMedicas?: string;
  limitacoesMovimento?: string;
  observacoes?: string;
}

// =====================================================
// FUNÇÕES DE MAPEAMENTO CAMELCASE <-> SNAKE_CASE
// =====================================================

function mapNeuromotoraToDb(data: AvaliacaoNeuromotoraData) {
  return {
    avaliacao_id: data.avaliacaoId,
    forca_preensao_manual_dir: data.forcaPreensaoManualDir,
    forca_preensao_manual_esq: data.forcaPreensaoManualEsq,
    flexao_braco: data.flexaoBraco,
    abdominal_1min: data.abdominal1min,
    agachamento: data.agachamento,
    prancha_isometrica: data.pranchaIsometrica,
    sentar_alcancar: data.sentarAlcancar,
    flexao_quadril_dir: data.flexaoQuadrilDir,
    flexao_quadril_esq: data.flexaoQuadrilEsq,
    shuttle_run: data.shuttleRun,
    teste_3_cones: data.teste3Cones,
    apoio_unico_perna_dir: data.apoioUnicoPernaDir,
    apoio_unico_perna_esq: data.apoioUnicoPernaEsq,
    corrida_20m: data.corrida20m,
    corrida_40m: data.corrida40m,
    salto_vertical: data.saltoVertical,
    salto_horizontal: data.saltoHorizontal,
    arremesso_bola: data.arremessoBola,
    observacoes: data.observacoes,
  };
}

function mapNeuromotoraFromDb(data: any): AvaliacaoNeuromotoraData | null {
  if (!data) return null;
  return {
    id: data.id,
    avaliacaoId: data.avaliacao_id,
    forcaPreensaoManualDir: data.forca_preensao_manual_dir,
    forcaPreensaoManualEsq: data.forca_preensao_manual_esq,
    flexaoBraco: data.flexao_braco,
    abdominal1min: data.abdominal_1min,
    agachamento: data.agachamento,
    pranchaIsometrica: data.prancha_isometrica,
    sentarAlcancar: data.sentar_alcancar,
    flexaoQuadrilDir: data.flexao_quadril_dir,
    flexaoQuadrilEsq: data.flexao_quadril_esq,
    shuttleRun: data.shuttle_run,
    teste3Cones: data.teste_3_cones,
    apoioUnicoPernaDir: data.apoio_unico_perna_dir,
    apoioUnicoPernaEsq: data.apoio_unico_perna_esq,
    corrida20m: data.corrida_20m,
    corrida40m: data.corrida_40m,
    saltoVertical: data.salto_vertical,
    saltoHorizontal: data.salto_horizontal,
    arremessoBola: data.arremesso_bola,
    observacoes: data.observacoes,
  };
}

function mapPosturalToDb(data: AvaliacaoPosturalData) {
  return {
    avaliacao_id: data.avaliacaoId,
    cabeca: data.cabecaAlinhamento,
    ombros: data.ombrosAlinhamento,
    curvatura_cervical: data.colunaCervical,
    curvatura_dorsal: data.colunaToracica,
    curvatura_lombar: data.colunaLombar,
    quadril: data.pelveAlinhamento,
    joelhos: data.joelhosAlinhamento,
    pes: data.pesTipo,
    observacoes: [
      data.cabecaObservacoes,
      data.ombrosObservacoes,
      data.colunaObservacoes,
      data.pelveObservacoes,
      data.joelhosObservacoes,
      data.pesObservacoes,
      data.observacoesGerais,
      data.recomendacoes ? `Recomendações: ${data.recomendacoes}` : null,
      data.colunaEscoliose ? `Escoliose: ${data.colunaEscoliose}` : null,
    ].filter(Boolean).join('\n\n') || null,
  };
}

function mapPosturalFromDb(data: any): AvaliacaoPosturalData | null {
  if (!data) return null;
  return {
    id: data.id,
    avaliacaoId: data.avaliacao_id,
    cabecaAlinhamento: data.cabeca,
    ombrosAlinhamento: data.ombros,
    colunaCervical: data.curvatura_cervical,
    colunaToracica: data.curvatura_dorsal,
    colunaLombar: data.curvatura_lombar,
    pelveAlinhamento: data.quadril,
    joelhosAlinhamento: data.joelhos,
    pesTipo: data.pes,
    observacoesGerais: data.observacoes,
  };
}

function mapAnamneseToDb(data: AnamneseData) {
  return {
    aluno_id: data.alunoId,
    profissao: data.profissao,
    nivel_atividade: data.nivelAtividade,
    doencas_preexistentes: data.doencasPreexistentes,
    cirurgias: data.cirurgias,
    lesoes: data.lesoes,
    medicamentos: data.medicamentos,
    fumante: data.fumante,
    consumo_alcool: data.consumoAlcool,
    horas_sono: data.horasSono,
    qualidade_sono: data.qualidadeSono,
    pratica_atividade: data.praticaAtividade,
    tipo_atividade: data.tipoAtividade,
    frequencia_semanal: data.frequenciaSemanal,
    tempo_sessao: data.tempoSessao,
    objetivo_principal: data.objetivoPrincipal,
    objetivos_secundarios: data.objetivosSecundarios,
    restricoes_medicas: data.restricoesMedicas,
    limitacoes_movimento: data.limitacoesMovimento,
    observacoes: data.observacoes,
  };
}

function mapAnamneseFromDb(data: any): AnamneseData | null {
  if (!data) return null;
  return {
    id: data.id,
    alunoId: data.aluno_id,
    profissao: data.profissao,
    nivelAtividade: data.nivel_atividade,
    doencasPreexistentes: data.doencas_preexistentes,
    cirurgias: data.cirurgias,
    lesoes: data.lesoes,
    medicamentos: data.medicamentos,
    fumante: data.fumante,
    consumoAlcool: data.consumo_alcool,
    horasSono: data.horas_sono,
    qualidadeSono: data.qualidade_sono,
    praticaAtividade: data.pratica_atividade,
    tipoAtividade: data.tipo_atividade,
    frequenciaSemanal: data.frequencia_semanal,
    tempoSessao: data.tempo_sessao,
    objetivoPrincipal: data.objetivo_principal,
    objetivosSecundarios: data.objetivos_secundarios,
    restricoesMedicas: data.restricoes_medicas,
    limitacoesMovimento: data.limitacoes_movimento,
    observacoes: data.observacoes,
  };
}

// =====================================================
// AVALIAÇÃO NEUROMOTORA
// =====================================================

export function useAvaliacaoNeuromotora(avaliacaoId: string) {
  return useQuery({
    queryKey: ['avaliacoes-neuromotor', avaliacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avaliacoes_neuromotoras')
        .select('*')
        .eq('avaliacao_id', avaliacaoId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return mapNeuromotoraFromDb(data);
    },
    enabled: !!avaliacaoId,
  });
}

export function useCreateAvaliacaoNeuromotora() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AvaliacaoNeuromotoraData) => {
      const dbData = mapNeuromotoraToDb(data);
      
      const { data: result, error } = await supabase
        .from('avaliacoes_neuromotoras')
        .insert(dbData)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar avaliação neuromotora:', error);
        throw error;
      }
      
      if (!result) {
        throw new Error('Nenhum dado retornado após inserção');
      }
      
      return mapNeuromotoraFromDb(result)!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-neuromotor', data.avaliacaoId] });
    },
  });
}

export function useUpdateAvaliacaoNeuromotora() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: AvaliacaoNeuromotoraData & { id: string }) => {
      const dbData = mapNeuromotoraToDb(data);
      
      const { data: result, error } = await supabase
        .from('avaliacoes_neuromotoras')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar avaliação neuromotora:', error);
        throw error;
      }
      
      if (!result) {
        throw new Error('Nenhum dado retornado após atualização');
      }
      
      return mapNeuromotoraFromDb(result)!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-neuromotor', data.avaliacaoId] });
    },
  });
}

// =====================================================
// AVALIAÇÃO POSTURAL (TEXTO)
// =====================================================

export function useAvaliacaoPostural(avaliacaoId: string) {
  return useQuery({
    queryKey: ['avaliacoes-postural', avaliacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('avaliacoes_posturais')
        .select('*')
        .eq('avaliacao_id', avaliacaoId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return mapPosturalFromDb(data);
    },
    enabled: !!avaliacaoId,
  });
}

export function useCreateAvaliacaoPostural() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AvaliacaoPosturalData) => {
      const dbData = mapPosturalToDb(data);
      
      console.log('Criando avaliação postural:', dbData);
      
      const { data: result, error } = await supabase
        .from('avaliacoes_posturais')
        .insert(dbData)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar avaliação postural:', error);
        throw error;
      }
      
      if (!result) {
        throw new Error('Nenhum dado retornado após inserção');
      }
      
      console.log('Avaliação postural criada:', result);
      return mapPosturalFromDb(result)!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-postural', data.avaliacaoId] });
    },
  });
}

export function useUpdateAvaliacaoPostural() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: AvaliacaoPosturalData & { id: string }) => {
      const dbData = mapPosturalToDb(data);
      
      console.log('Atualizando avaliação postural:', { id, ...dbData });
      
      const { data: result, error } = await supabase
        .from('avaliacoes_posturais')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar avaliação postural:', error);
        throw error;
      }
      
      if (!result) {
        throw new Error('Nenhum dado retornado após atualização');
      }
      
      console.log('Avaliação postural atualizada:', result);
      return mapPosturalFromDb(result)!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['avaliacoes-postural', data.avaliacaoId] });
    },
  });
}

// =====================================================
// ANAMNESE
// =====================================================

export function useAnamnese(alunoId: string) {
  return useQuery({
    queryKey: ['anamnese', alunoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anamneses')
        .select('*')
        .eq('aluno_id', alunoId)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return mapAnamneseFromDb(data);
    },
    enabled: !!alunoId,
  });
}

export function useCreateAnamnese() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: AnamneseData) => {
      const dbData = mapAnamneseToDb(data);
      
      const { data: result, error } = await supabase
        .from('anamneses')
        .insert(dbData)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar anamnese:', error);
        throw error;
      }
      
      if (!result) {
        throw new Error('Nenhum dado retornado após inserção');
      }
      
      return mapAnamneseFromDb(result)!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['anamnese', data.alunoId] });
    },
  });
}

export function useUpdateAnamnese() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: AnamneseData & { id: string }) => {
      const dbData = mapAnamneseToDb(data);
      
      const { data: result, error } = await supabase
        .from('anamneses')
        .update(dbData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao atualizar anamnese:', error);
        throw error;
      }
      
      if (!result) {
        throw new Error('Nenhum dado retornado após atualização');
      }
      
      return mapAnamneseFromDb(result)!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['anamnese', data.alunoId] });
    },
  });
}
