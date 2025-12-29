/**
 * Constantes centralizadas para Divisões Musculares e Modalidades de Treino
 * 
 * Este arquivo serve como fonte única de verdade para todas as opções
 * de categorização de treinos em vídeo.
 */

// ============================================
// GRUPOS MUSCULARES TRADICIONAIS
// ============================================
export const GRUPOS_MUSCULARES = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Glúteos',
  'Panturrilha',
  'Abdômen',
] as const;

// ============================================
// COMBINAÇÕES COMUNS
// ============================================
export const COMBINACOES_MUSCULARES = [
  'Peito + Tríceps',
  'Costas + Bíceps',
  'Pernas + Glúteos',
  'Ombros + Abdômen',
  'Superiores',
  'Inferiores',
  'Corpo Inteiro',
] as const;

// ============================================
// TREINOS GERAIS / MODALIDADES
// ============================================
export const MODALIDADES_TREINO = [
  'Funcional',
  'HIIT',
  'Cardio',
  'CrossFit',
] as const;

// ============================================
// TREINOS EM CASA
// ============================================
export const TREINOS_CASA = [
  'Treino em Casa (Sem Equipamentos)',
  'Treino em Casa (Com Halteres)',
  'Treino em Casa (Com Elástico)',
  'Treino em Casa (Com Kettlebell)',
] as const;

// ============================================
// MOBILIDADE E RECUPERAÇÃO
// ============================================
export const MOBILIDADE_RECUPERACAO = [
  'Alongamento',
  'Mobilidade',
  'Liberação Miofascial',
  'Recuperação Ativa',
  'Yoga',
  'Pilates',
] as const;

// ============================================
// ESTRUTURA AGRUPADA PARA SELECT
// ============================================
export interface GrupoDivisao {
  label: string;
  options: readonly string[];
}

export const DIVISOES_AGRUPADAS: GrupoDivisao[] = [
  {
    label: 'Grupos Musculares',
    options: GRUPOS_MUSCULARES,
  },
  {
    label: 'Combinações',
    options: COMBINACOES_MUSCULARES,
  },
  {
    label: 'Modalidades',
    options: MODALIDADES_TREINO,
  },
  {
    label: 'Treinos em Casa',
    options: TREINOS_CASA,
  },
  {
    label: 'Mobilidade e Recuperação',
    options: MOBILIDADE_RECUPERACAO,
  },
];

// ============================================
// LISTA FLAT PARA VALIDAÇÃO
// ============================================
export const TODAS_DIVISOES = [
  ...GRUPOS_MUSCULARES,
  ...COMBINACOES_MUSCULARES,
  ...MODALIDADES_TREINO,
  ...TREINOS_CASA,
  ...MOBILIDADE_RECUPERACAO,
] as const;

export type DivisaoMuscular = typeof TODAS_DIVISOES[number];

// ============================================
// HELPERS
// ============================================

/**
 * Verifica se uma divisão é válida
 */
export function isDivisaoValida(divisao: string): divisao is DivisaoMuscular {
  return TODAS_DIVISOES.includes(divisao as DivisaoMuscular);
}

/**
 * Retorna o grupo ao qual uma divisão pertence
 */
export function getGrupoDivisao(divisao: string): string | null {
  for (const grupo of DIVISOES_AGRUPADAS) {
    if (grupo.options.includes(divisao as any)) {
      return grupo.label;
    }
  }
  return null;
}

/**
 * Retorna ícone/cor baseado no tipo de divisão
 */
export function getDivisaoStyle(divisao: string): { color: string; bgColor: string } {
  const grupo = getGrupoDivisao(divisao);
  
  switch (grupo) {
    case 'Grupos Musculares':
      return { color: 'text-blue-400', bgColor: 'bg-blue-500/10' };
    case 'Combinações':
      return { color: 'text-purple-400', bgColor: 'bg-purple-500/10' };
    case 'Modalidades':
      return { color: 'text-orange-400', bgColor: 'bg-orange-500/10' };
    case 'Treinos em Casa':
      return { color: 'text-green-400', bgColor: 'bg-green-500/10' };
    case 'Mobilidade e Recuperação':
      return { color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' };
    default:
      return { color: 'text-gray-400', bgColor: 'bg-gray-500/10' };
  }
}
