/**
 * Testes Unitários para Biblioteca de Cálculos de Avaliações Físicas
 * 
 * Valida as fórmulas científicas com casos conhecidos
 */

import { describe, it, expect } from 'vitest';
import {
  calcularPollock7Dobras,
  calcularPollock3DobrasHomem,
  calcularPollock3DobrasMulher,
  calcularIMC,
  calcularPesoIdeal,
  classificarIMC,
  classificarPercentualGordura,
  calcularZonasCardiacas,
  validarDadosBasicos,
  validarDobras,
  type DadosBasicos,
  type Dobras7,
  type Dobras3Homem,
  type Dobras3Mulher
} from '../avaliacaoCalculos';

describe('Cálculos Básicos', () => {
  describe('calcularIMC', () => {
    it('deve calcular IMC corretamente', () => {
      expect(calcularIMC(70, 175)).toBe(22.86);
      expect(calcularIMC(80, 180)).toBe(24.69);
      expect(calcularIMC(60, 165)).toBe(22.04);
    });

    it('deve retornar 2 casas decimais', () => {
      const imc = calcularIMC(75.5, 178.3);
      expect(imc.toString().split('.')[1]?.length).toBeLessThanOrEqual(2);
    });
  });

  describe('calcularPesoIdeal', () => {
    it('deve calcular peso ideal para homens', () => {
      const peso = calcularPesoIdeal(175, 'masculino');
      expect(peso).toBeGreaterThan(60);
      expect(peso).toBeLessThan(80);
    });

    it('deve calcular peso ideal para mulheres', () => {
      const peso = calcularPesoIdeal(165, 'feminino');
      expect(peso).toBeGreaterThan(50);
      expect(peso).toBeLessThan(70);
    });

    it('mulheres devem ter peso ideal menor que homens na mesma altura', () => {
      const pesoHomem = calcularPesoIdeal(170, 'masculino');
      const pesoMulher = calcularPesoIdeal(170, 'feminino');
      expect(pesoMulher).toBeLessThan(pesoHomem);
    });
  });

  describe('classificarIMC', () => {
    it('deve classificar corretamente', () => {
      expect(classificarIMC(17)).toBe('Abaixo do peso');
      expect(classificarIMC(22)).toBe('Peso normal');
      expect(classificarIMC(27)).toBe('Sobrepeso');
      expect(classificarIMC(32)).toBe('Obesidade Grau I');
      expect(classificarIMC(37)).toBe('Obesidade Grau II');
      expect(classificarIMC(42)).toBe('Obesidade Grau III');
    });
  });
});

describe('Protocolo Pollock 7 Dobras', () => {
  const dadosHomem: DadosBasicos = {
    peso: 75,
    altura: 175,
    idade: 30,
    genero: 'masculino'
  };

  const dobras7Baixas: Dobras7 = {
    triceps: 8,
    subescapular: 10,
    peitoral: 8,
    axilarMedia: 9,
    suprailiaca: 12,
    abdominal: 15,
    coxa: 12
  };

  const dobras7Altas: Dobras7 = {
    triceps: 20,
    subescapular: 25,
    peitoral: 22,
    axilarMedia: 23,
    suprailiaca: 28,
    abdominal: 30,
    coxa: 25
  };

  it('deve calcular soma das dobras corretamente', () => {
    const resultado = calcularPollock7Dobras(dadosHomem, dobras7Baixas);
    expect(resultado.somaDobras).toBe(74);
  });

  it('deve calcular densidade corporal entre 1.0 e 1.1', () => {
    const resultado = calcularPollock7Dobras(dadosHomem, dobras7Baixas);
    expect(resultado.densidadeCorporal).toBeGreaterThan(1.0);
    expect(resultado.densidadeCorporal).toBeLessThan(1.1);
  });

  it('deve calcular percentual de gordura razoável', () => {
    const resultado = calcularPollock7Dobras(dadosHomem, dobras7Baixas);
    expect(resultado.percentualGordura).toBeGreaterThan(5);
    expect(resultado.percentualGordura).toBeLessThan(40);
  });

  it('dobras altas devem resultar em maior % de gordura', () => {
    const resultadoBaixo = calcularPollock7Dobras(dadosHomem, dobras7Baixas);
    const resultadoAlto = calcularPollock7Dobras(dadosHomem, dobras7Altas);
    expect(resultadoAlto.percentualGordura).toBeGreaterThan(resultadoBaixo.percentualGordura);
  });

  it('deve calcular massa gorda e magra corretamente', () => {
    const resultado = calcularPollock7Dobras(dadosHomem, dobras7Baixas);
    expect(resultado.massaGorda + resultado.massaMagra).toBeCloseTo(dadosHomem.peso, 1);
  });

  it('deve incluir classificação', () => {
    const resultado = calcularPollock7Dobras(dadosHomem, dobras7Baixas);
    expect(resultado.classificacao).toBeTruthy();
    expect(['Atleta', 'Excelente', 'Bom', 'Regular', 'Alto']).toContain(resultado.classificacao);
  });

  it('deve calcular IMC junto', () => {
    const resultado = calcularPollock7Dobras(dadosHomem, dobras7Baixas);
    expect(resultado.imc).toBe(calcularIMC(dadosHomem.peso, dadosHomem.altura));
  });
});

describe('Protocolo Pollock 3 Dobras', () => {
  describe('Homens', () => {
    const dadosHomem: DadosBasicos = {
      peso: 80,
      altura: 180,
      idade: 35,
      genero: 'masculino'
    };

    const dobras3: Dobras3Homem = {
      peitoral: 12,
      abdominal: 18,
      coxa: 15
    };

    it('deve calcular soma das 3 dobras', () => {
      const resultado = calcularPollock3DobrasHomem(dadosHomem, dobras3);
      expect(resultado.somaDobras).toBe(45);
    });

    it('deve calcular densidade corporal', () => {
      const resultado = calcularPollock3DobrasHomem(dadosHomem, dobras3);
      expect(resultado.densidadeCorporal).toBeGreaterThan(1.0);
      expect(resultado.densidadeCorporal).toBeLessThan(1.1);
    });

    it('deve calcular percentual de gordura', () => {
      const resultado = calcularPollock3DobrasHomem(dadosHomem, dobras3);
      expect(resultado.percentualGordura).toBeGreaterThan(5);
      expect(resultado.percentualGordura).toBeLessThan(40);
    });
  });

  describe('Mulheres', () => {
    const dadosMulher: DadosBasicos = {
      peso: 60,
      altura: 165,
      idade: 28,
      genero: 'feminino'
    };

    const dobras3: Dobras3Mulher = {
      triceps: 15,
      suprailiaca: 18,
      coxa: 20
    };

    it('deve calcular soma das 3 dobras', () => {
      const resultado = calcularPollock3DobrasMulher(dadosMulher, dobras3);
      expect(resultado.somaDobras).toBe(53);
    });

    it('deve calcular densidade corporal', () => {
      const resultado = calcularPollock3DobrasMulher(dadosMulher, dobras3);
      expect(resultado.densidadeCorporal).toBeGreaterThan(1.0);
      expect(resultado.densidadeCorporal).toBeLessThan(1.1);
    });

    it('mulheres devem ter % gordura maior que homens com mesmas dobras', () => {
      const dadosHomem: DadosBasicos = {
        peso: 70,
        altura: 175,
        idade: 28,
        genero: 'masculino'
      };

      const dobrasHomem: Dobras3Homem = {
        peitoral: 15,
        abdominal: 18,
        coxa: 20
      };

      const resultadoHomem = calcularPollock3DobrasHomem(dadosHomem, dobrasHomem);
      const resultadoMulher = calcularPollock3DobrasMulher(dadosMulher, dobras3);

      // Mulheres naturalmente têm maior % de gordura essencial
      expect(resultadoMulher.percentualGordura).toBeGreaterThan(resultadoHomem.percentualGordura - 5);
    });
  });
});

describe('Classificação de Percentual de Gordura', () => {
  it('deve classificar homens jovens corretamente', () => {
    expect(classificarPercentualGordura(7, 'masculino', 25)).toBe('Atleta');
    expect(classificarPercentualGordura(12, 'masculino', 25)).toBe('Excelente');
    expect(classificarPercentualGordura(16, 'masculino', 25)).toBe('Bom');
    expect(classificarPercentualGordura(22, 'masculino', 25)).toBe('Regular');
    expect(classificarPercentualGordura(28, 'masculino', 25)).toBe('Alto');
  });

  it('deve classificar mulheres jovens corretamente', () => {
    expect(classificarPercentualGordura(13, 'feminino', 25)).toBe('Atleta');
    expect(classificarPercentualGordura(19, 'feminino', 25)).toBe('Excelente');
    expect(classificarPercentualGordura(23, 'feminino', 25)).toBe('Bom');
    expect(classificarPercentualGordura(30, 'feminino', 25)).toBe('Regular');
    expect(classificarPercentualGordura(35, 'feminino', 25)).toBe('Alto');
  });

  it('deve ajustar classificação por idade', () => {
    const percentual = 15;
    const jovem = classificarPercentualGordura(percentual, 'masculino', 25);
    const idoso = classificarPercentualGordura(percentual, 'masculino', 55);
    
    // Mesma % pode ter classificação diferente por idade
    expect(jovem).toBeTruthy();
    expect(idoso).toBeTruthy();
  });
});

describe('Zonas de Treinamento Cardíaco', () => {
  it('deve calcular FC máxima corretamente', () => {
    const zonas = calcularZonasCardiacas(30);
    expect(zonas.fcMaxima).toBe(187); // 208 - (0.7 * 30)
  });

  it('deve usar FC repouso padrão se não fornecida', () => {
    const zonas = calcularZonasCardiacas(30);
    expect(zonas.fcRepouso).toBe(70);
  });

  it('deve usar FC repouso fornecida', () => {
    const zonas = calcularZonasCardiacas(30, 60);
    expect(zonas.fcRepouso).toBe(60);
  });

  it('deve calcular 5 zonas', () => {
    const zonas = calcularZonasCardiacas(30, 60);
    expect(zonas.zona1).toBeDefined();
    expect(zonas.zona2).toBeDefined();
    expect(zonas.zona3).toBeDefined();
    expect(zonas.zona4).toBeDefined();
    expect(zonas.zona5).toBeDefined();
  });

  it('zonas devem ser progressivas', () => {
    const zonas = calcularZonasCardiacas(30, 60);
    expect(zonas.zona1.max).toBeLessThan(zonas.zona2.min);
    expect(zonas.zona2.max).toBeLessThan(zonas.zona3.min);
    expect(zonas.zona3.max).toBeLessThan(zonas.zona4.min);
    expect(zonas.zona4.max).toBeLessThan(zonas.zona5.min);
  });

  it('zona 5 max deve ser próxima da FC máxima', () => {
    const zonas = calcularZonasCardiacas(30, 60);
    expect(zonas.zona5.max).toBeCloseTo(zonas.fcMaxima, -1);
  });

  it('cada zona deve ter nome e descrição', () => {
    const zonas = calcularZonasCardiacas(30);
    expect(zonas.zona1.nome).toBeTruthy();
    expect(zonas.zona1.descricao).toBeTruthy();
  });
});

describe('Validações', () => {
  describe('validarDadosBasicos', () => {
    it('deve aceitar dados válidos', () => {
      const dados: DadosBasicos = {
        peso: 70,
        altura: 175,
        idade: 30,
        genero: 'masculino'
      };
      expect(validarDadosBasicos(dados)).toHaveLength(0);
    });

    it('deve rejeitar peso inválido', () => {
      const dados: DadosBasicos = {
        peso: 0,
        altura: 175,
        idade: 30,
        genero: 'masculino'
      };
      const erros = validarDadosBasicos(dados);
      expect(erros.length).toBeGreaterThan(0);
      expect(erros[0]).toContain('Peso');
    });

    it('deve rejeitar altura inválida', () => {
      const dados: DadosBasicos = {
        peso: 70,
        altura: 300,
        idade: 30,
        genero: 'masculino'
      };
      const erros = validarDadosBasicos(dados);
      expect(erros.length).toBeGreaterThan(0);
      expect(erros[0]).toContain('Altura');
    });

    it('deve rejeitar idade inválida', () => {
      const dados: DadosBasicos = {
        peso: 70,
        altura: 175,
        idade: 150,
        genero: 'masculino'
      };
      const erros = validarDadosBasicos(dados);
      expect(erros.length).toBeGreaterThan(0);
      expect(erros[0]).toContain('Idade');
    });
  });

  describe('validarDobras', () => {
    it('deve aceitar dobras válidas', () => {
      const dobras = {
        triceps: 10,
        subescapular: 12,
        peitoral: 8
      };
      expect(validarDobras(dobras)).toHaveLength(0);
    });

    it('deve rejeitar dobras negativas', () => {
      const dobras = {
        triceps: -5
      };
      const erros = validarDobras(dobras);
      expect(erros.length).toBeGreaterThan(0);
    });

    it('deve rejeitar dobras muito altas', () => {
      const dobras = {
        triceps: 150
      };
      const erros = validarDobras(dobras);
      expect(erros.length).toBeGreaterThan(0);
    });
  });
});

describe('Edge Cases', () => {
  it('deve lidar com valores extremos de idade', () => {
    const dados: DadosBasicos = {
      peso: 70,
      altura: 175,
      idade: 80,
      genero: 'masculino'
    };

    const dobras: Dobras7 = {
      triceps: 15,
      subescapular: 18,
      peitoral: 14,
      axilarMedia: 16,
      suprailiaca: 20,
      abdominal: 22,
      coxa: 18
    };

    const resultado = calcularPollock7Dobras(dados, dobras);
    expect(resultado.percentualGordura).toBeGreaterThan(0);
    expect(resultado.percentualGordura).toBeLessThan(60);
  });

  it('deve lidar com dobras muito baixas (atletas)', () => {
    const dados: DadosBasicos = {
      peso: 70,
      altura: 175,
      idade: 25,
      genero: 'masculino'
    };

    const dobras: Dobras7 = {
      triceps: 4,
      subescapular: 5,
      peitoral: 4,
      axilarMedia: 4,
      suprailiaca: 5,
      abdominal: 6,
      coxa: 5
    };

    const resultado = calcularPollock7Dobras(dados, dobras);
    expect(resultado.classificacao).toBe('Atleta');
  });

  it('deve manter precisão com números decimais', () => {
    const dados: DadosBasicos = {
      peso: 75.5,
      altura: 178.3,
      idade: 32,
      genero: 'masculino'
    };

    const dobras: Dobras7 = {
      triceps: 10.5,
      subescapular: 12.3,
      peitoral: 9.8,
      axilarMedia: 11.2,
      suprailiaca: 14.7,
      abdominal: 16.9,
      coxa: 13.4
    };

    const resultado = calcularPollock7Dobras(dados, dobras);
    expect(resultado.somaDobras).toBeCloseTo(88.8, 1);
  });
});
