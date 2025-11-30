/**
 * Biblioteca de Cálculos para Avaliações Físicas
 * 
 * Implementa fórmulas científicas validadas para:
 * - Protocolos de Pollock (3 e 7 dobras)
 * - IMC e classificações
 * - Composição corporal
 * - Zonas de treinamento cardíaco
 * 
 * Referências:
 * - Pollock, M. L., & Jackson, A. S. (1984)
 * - Siri, W. E. (1961)
 * - Jackson, A. S., & Pollock, M. L. (1978)
 */

// ============================================
// TIPOS E INTERFACES
// ============================================

export type Genero = 'masculino' | 'feminino';

export interface DadosBasicos {
  peso: number;        // kg
  altura: number;      // cm
  idade: number;       // anos
  genero: Genero;
}

export interface Dobras7 {
  triceps: number;      // mm
  subescapular: number; // mm
  peitoral: number;     // mm
  axilarMedia: number;  // mm
  suprailiaca: number;  // mm
  abdominal: number;    // mm
  coxa: number;         // mm
}

export interface Dobras3Homem {
  peitoral: number;     // mm
  abdominal: number;    // mm
  coxa: number;         // mm
}

export interface Dobras3Mulher {
  triceps: number;      // mm
  suprailiaca: number;  // mm
  coxa: number;         // mm
}

export interface ResultadoAvaliacao {
  somaDobras: number;
  densidadeCorporal: number;
  percentualGordura: number;
  massaGorda: number;        // kg
  massaMagra: number;        // kg
  pesoIdeal: number;         // kg
  classificacao: string;
  imc: number;
  classificacaoIMC: string;
}

export interface ZonasCardiacas {
  fcRepouso: number;
  fcMaxima: number;
  zona1: { min: number; max: number; nome: string; descricao: string };
  zona2: { min: number; max: number; nome: string; descricao: string };
  zona3: { min: number; max: number; nome: string; descricao: string };
  zona4: { min: number; max: number; nome: string; descricao: string };
  zona5: { min: number; max: number; nome: string; descricao: string };
}

// ============================================
// PROTOCOLO POLLOCK 7 DOBRAS (1984)
// ============================================

/**
 * Calcula composição corporal usando protocolo de 7 dobras de Pollock (1984)
 */
export function calcularPollock7Dobras(
  dados: DadosBasicos,
  dobras: Dobras7
): ResultadoAvaliacao {
  const { peso, altura, idade, genero } = dados;
  
  // Soma das 7 dobras
  const somaDobras = 
    dobras.triceps +
    dobras.subescapular +
    dobras.peitoral +
    dobras.axilarMedia +
    dobras.suprailiaca +
    dobras.abdominal +
    dobras.coxa;

  // Calcular densidade corporal
  let densidadeCorporal: number;
  
  if (genero === 'masculino') {
    // Fórmula para homens (Pollock, 1984)
    densidadeCorporal = 
      1.112 - 
      (0.00043499 * somaDobras) + 
      (0.00000055 * Math.pow(somaDobras, 2)) - 
      (0.00028826 * idade);
  } else {
    // Fórmula para mulheres (Pollock, 1984)
    densidadeCorporal = 
      1.097 - 
      (0.00046971 * somaDobras) + 
      (0.00000056 * Math.pow(somaDobras, 2)) - 
      (0.00012828 * idade);
  }

  // Calcular % de gordura usando fórmula de Siri (1961)
  const percentualGordura = ((495 / densidadeCorporal) - 450);

  // Calcular massa gorda e magra
  const massaGorda = (peso * percentualGordura) / 100;
  const massaMagra = peso - massaGorda;

  // Calcular peso ideal (considerando % gordura ideal)
  const percentualGorduraIdeal = genero === 'masculino' ? 15 : 23;
  const pesoIdeal = massaMagra / (1 - (percentualGorduraIdeal / 100));

  // Calcular IMC
  const alturaMetros = altura / 100;
  const imc = peso / Math.pow(alturaMetros, 2);

  return {
    somaDobras: Number(somaDobras.toFixed(2)),
    densidadeCorporal: Number(densidadeCorporal.toFixed(4)),
    percentualGordura: Number(percentualGordura.toFixed(2)),
    massaGorda: Number(massaGorda.toFixed(2)),
    massaMagra: Number(massaMagra.toFixed(2)),
    pesoIdeal: Number(pesoIdeal.toFixed(2)),
    classificacao: classificarPercentualGordura(percentualGordura, genero, idade),
    imc: Number(imc.toFixed(2)),
    classificacaoIMC: classificarIMC(imc)
  };
}

// ============================================
// PROTOCOLO POLLOCK 3 DOBRAS (1978)
// ============================================

/**
 * Calcula composição corporal usando protocolo de 3 dobras de Pollock (1978)
 * Para homens: peitoral, abdominal, coxa
 */
export function calcularPollock3DobrasHomem(
  dados: DadosBasicos,
  dobras: Dobras3Homem
): ResultadoAvaliacao {
  const { peso, altura, idade } = dados;
  
  // Soma das 3 dobras
  const somaDobras = dobras.peitoral + dobras.abdominal + dobras.coxa;

  // Fórmula para homens (Jackson & Pollock, 1978)
  const densidadeCorporal = 
    1.10938 - 
    (0.0008267 * somaDobras) + 
    (0.0000016 * Math.pow(somaDobras, 2)) - 
    (0.0002574 * idade);

  // Calcular % de gordura usando fórmula de Siri
  const percentualGordura = ((495 / densidadeCorporal) - 450);

  // Calcular massa gorda e magra
  const massaGorda = (peso * percentualGordura) / 100;
  const massaMagra = peso - massaGorda;

  // Calcular peso ideal
  const percentualGorduraIdeal = 15;
  const pesoIdeal = massaMagra / (1 - (percentualGorduraIdeal / 100));

  // Calcular IMC
  const alturaMetros = altura / 100;
  const imc = peso / Math.pow(alturaMetros, 2);

  return {
    somaDobras: Number(somaDobras.toFixed(2)),
    densidadeCorporal: Number(densidadeCorporal.toFixed(4)),
    percentualGordura: Number(percentualGordura.toFixed(2)),
    massaGorda: Number(massaGorda.toFixed(2)),
    massaMagra: Number(massaMagra.toFixed(2)),
    pesoIdeal: Number(pesoIdeal.toFixed(2)),
    classificacao: classificarPercentualGordura(percentualGordura, 'masculino', idade),
    imc: Number(imc.toFixed(2)),
    classificacaoIMC: classificarIMC(imc)
  };
}

/**
 * Calcula composição corporal usando protocolo de 3 dobras de Pollock (1978)
 * Para mulheres: tríceps, supra-ilíaca, coxa
 */
export function calcularPollock3DobrasMulher(
  dados: DadosBasicos,
  dobras: Dobras3Mulher
): ResultadoAvaliacao {
  const { peso, altura, idade } = dados;
  
  // Soma das 3 dobras
  const somaDobras = dobras.triceps + dobras.suprailiaca + dobras.coxa;

  // Fórmula para mulheres (Jackson & Pollock, 1978)
  const densidadeCorporal = 
    1.0994921 - 
    (0.0009929 * somaDobras) + 
    (0.0000023 * Math.pow(somaDobras, 2)) - 
    (0.0001392 * idade);

  // Calcular % de gordura usando fórmula de Siri
  const percentualGordura = ((495 / densidadeCorporal) - 450);

  // Calcular massa gorda e magra
  const massaGorda = (peso * percentualGordura) / 100;
  const massaMagra = peso - massaGorda;

  // Calcular peso ideal
  const percentualGorduraIdeal = 23;
  const pesoIdeal = massaMagra / (1 - (percentualGorduraIdeal / 100));

  // Calcular IMC
  const alturaMetros = altura / 100;
  const imc = peso / Math.pow(alturaMetros, 2);

  return {
    somaDobras: Number(somaDobras.toFixed(2)),
    densidadeCorporal: Number(densidadeCorporal.toFixed(4)),
    percentualGordura: Number(percentualGordura.toFixed(2)),
    massaGorda: Number(massaGorda.toFixed(2)),
    massaMagra: Number(massaMagra.toFixed(2)),
    pesoIdeal: Number(pesoIdeal.toFixed(2)),
    classificacao: classificarPercentualGordura(percentualGordura, 'feminino', idade),
    imc: Number(imc.toFixed(2)),
    classificacaoIMC: classificarIMC(imc)
  };
}

// ============================================
// CÁLCULOS BÁSICOS
// ============================================

/**
 * Calcula o Índice de Massa Corporal (IMC)
 */
export function calcularIMC(peso: number, altura: number): number {
  const alturaMetros = altura / 100;
  return Number((peso / Math.pow(alturaMetros, 2)).toFixed(2));
}

/**
 * Calcula o peso ideal baseado na altura e gênero
 * Usa fórmula de Devine (1974)
 */
export function calcularPesoIdeal(altura: number, genero: Genero): number {
  const alturaCm = altura;
  
  if (genero === 'masculino') {
    // Homens: 50 kg + 2.3 kg por polegada acima de 5 pés (152.4 cm)
    const polegadasAcima = (alturaCm - 152.4) / 2.54;
    return Number((50 + (2.3 * polegadasAcima)).toFixed(2));
  } else {
    // Mulheres: 45.5 kg + 2.3 kg por polegada acima de 5 pés (152.4 cm)
    const polegadasAcima = (alturaCm - 152.4) / 2.54;
    return Number((45.5 + (2.3 * polegadasAcima)).toFixed(2));
  }
}

// ============================================
// CLASSIFICAÇÕES
// ============================================

/**
 * Classifica o IMC segundo OMS
 */
export function classificarIMC(imc: number): string {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  if (imc < 35) return 'Obesidade Grau I';
  if (imc < 40) return 'Obesidade Grau II';
  return 'Obesidade Grau III';
}

/**
 * Classifica o percentual de gordura corporal
 * Baseado em tabelas do American Council on Exercise (ACE)
 */
export function classificarPercentualGordura(
  percentual: number,
  genero: Genero,
  idade: number
): string {
  if (genero === 'masculino') {
    if (idade < 30) {
      if (percentual < 8) return 'Atleta';
      if (percentual < 14) return 'Excelente';
      if (percentual < 18) return 'Bom';
      if (percentual < 25) return 'Regular';
      return 'Alto';
    } else if (idade < 50) {
      if (percentual < 11) return 'Atleta';
      if (percentual < 17) return 'Excelente';
      if (percentual < 21) return 'Bom';
      if (percentual < 28) return 'Regular';
      return 'Alto';
    } else {
      if (percentual < 13) return 'Atleta';
      if (percentual < 19) return 'Excelente';
      if (percentual < 23) return 'Bom';
      if (percentual < 29) return 'Regular';
      return 'Alto';
    }
  } else {
    // Feminino
    if (idade < 30) {
      if (percentual < 14) return 'Atleta';
      if (percentual < 21) return 'Excelente';
      if (percentual < 25) return 'Bom';
      if (percentual < 32) return 'Regular';
      return 'Alto';
    } else if (idade < 50) {
      if (percentual < 15) return 'Atleta';
      if (percentual < 23) return 'Excelente';
      if (percentual < 27) return 'Bom';
      if (percentual < 34) return 'Regular';
      return 'Alto';
    } else {
      if (percentual < 16) return 'Atleta';
      if (percentual < 24) return 'Excelente';
      if (percentual < 30) return 'Bom';
      if (percentual < 36) return 'Regular';
      return 'Alto';
    }
  }
}

// ============================================
// ZONAS DE TREINAMENTO CARDÍACO
// ============================================

/**
 * Calcula as zonas de treinamento cardíaco
 * Usa método de Karvonen (Frequência Cardíaca de Reserva)
 */
export function calcularZonasCardiacas(
  idade: number,
  fcRepouso?: number
): ZonasCardiacas {
  // FC Máxima estimada (fórmula de Tanaka: 208 - 0.7 × idade)
  const fcMaxima = Math.round(208 - (0.7 * idade));
  
  // Se não tiver FC de repouso, usar valor médio (70 bpm)
  const fcRepousoReal = fcRepouso || 70;
  
  // FC de Reserva
  const fcReserva = fcMaxima - fcRepousoReal;
  
  // Calcular zonas usando método de Karvonen
  const calcularZona = (minPercent: number, maxPercent: number) => ({
    min: Math.round(fcRepousoReal + (fcReserva * minPercent)),
    max: Math.round(fcRepousoReal + (fcReserva * maxPercent))
  });

  return {
    fcRepouso: fcRepousoReal,
    fcMaxima,
    zona1: {
      ...calcularZona(0.50, 0.60),
      nome: 'Zona 1 - Recuperação',
      descricao: 'Recuperação ativa e aquecimento'
    },
    zona2: {
      ...calcularZona(0.60, 0.70),
      nome: 'Zona 2 - Aeróbico Leve',
      descricao: 'Queima de gordura e resistência básica'
    },
    zona3: {
      ...calcularZona(0.70, 0.80),
      nome: 'Zona 3 - Aeróbico Moderado',
      descricao: 'Melhora da capacidade aeróbica'
    },
    zona4: {
      ...calcularZona(0.80, 0.90),
      nome: 'Zona 4 - Limiar Anaeróbico',
      descricao: 'Aumento de performance e velocidade'
    },
    zona5: {
      ...calcularZona(0.90, 1.00),
      nome: 'Zona 5 - Máximo Esforço',
      descricao: 'Potência máxima e sprint'
    }
  };
}

// ============================================
// VALIDAÇÕES
// ============================================

/**
 * Valida os dados básicos da avaliação
 */
export function validarDadosBasicos(dados: DadosBasicos): string[] {
  const erros: string[] = [];

  if (dados.peso <= 0 || dados.peso > 300) {
    erros.push('Peso deve estar entre 1 e 300 kg');
  }

  if (dados.altura <= 0 || dados.altura > 250) {
    erros.push('Altura deve estar entre 1 e 250 cm');
  }

  if (dados.idade <= 0 || dados.idade > 120) {
    erros.push('Idade deve estar entre 1 e 120 anos');
  }

  return erros;
}

/**
 * Valida as medidas de dobras cutâneas
 */
export function validarDobras(dobras: Partial<Dobras7>): string[] {
  const erros: string[] = [];

  Object.entries(dobras).forEach(([campo, valor]) => {
    if (valor !== undefined && (valor < 0 || valor > 100)) {
      erros.push(`${campo}: valor deve estar entre 0 e 100 mm`);
    }
  });

  return erros;
}
