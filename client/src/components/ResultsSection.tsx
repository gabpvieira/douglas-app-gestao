import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import resultado1 from "@assets/../imagens/resultado-aluno (1).jpeg";
import resultado2 from "@assets/../imagens/resultado-aluno (2).jpeg";
import resultado3 from "@assets/../imagens/resultado-aluno (3).jpeg";
import resultado4 from "@assets/../imagens/resultado-aluno (4).jpeg";
import resultado5 from "@assets/../imagens/resultado-aluno (5).jpeg";
import resultado6 from "@assets/../imagens/resultado-aluno (6).jpeg";
import resultado7 from "@assets/../imagens/resultado-aluno (7).jpeg";

export default function ResultsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const results = [
    { image: resultado1 },
    { image: resultado2 },
    { image: resultado3 },
    { image: resultado4 },
    { image: resultado5 },
    { image: resultado6 },
    { image: resultado7 }
  ];

  // Auto-play para mobile
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % results.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, results.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + results.length) % results.length);
    setIsAutoPlaying(false);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % results.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  // Calcular índices para desktop (3 imagens visíveis)
  const getVisibleImages = () => {
    const prevIndex = (currentIndex - 1 + results.length) % results.length;
    const nextIndex = (currentIndex + 1) % results.length;
    return [prevIndex, currentIndex, nextIndex];
  };

  const visibleIndices = getVisibleImages();

  return (
    <section id="resultados" className="relative py-20 md:py-32 bg-black overflow-hidden">
      {/* Gradient Transition from How It Works Section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none z-10" />
      
      {/* Gradient Transition to Pricing Section */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-b from-transparent via-zinc-950 to-zinc-900 pointer-events-none z-10" />
      
      {/* Background Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3c8af6]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 bg-[#3c8af6]/10 border border-[#3c8af6]/20 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-[#3c8af6] fill-[#3c8af6]" />
            <span className="text-sm text-[#3c8af6] font-medium">Resultados Reais</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Transformações dos Nossos Alunos
          </h2>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
            Veja os resultados alcançados por quem confiou no nosso método personalizado
          </p>
        </div>

        {/* Mobile Carousel - 1 imagem por vez */}
        <div className="md:hidden relative">
          <div className="relative overflow-hidden rounded-2xl">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {results.map((result, index) => (
                <div key={index} className="min-w-full relative">
                  <img
                    src={result.image}
                    alt={`Resultado de aluno ${index + 1}`}
                    className="w-full h-auto object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>

            {/* Navigation Buttons Mobile */}
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-zinc-700/50 rounded-full flex items-center justify-center text-white transition-all duration-200"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-zinc-700/50 rounded-full flex items-center justify-center text-white transition-all duration-200"
              aria-label="Próximo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Navigation Mobile */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {results.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-8 h-2 bg-[#3c8af6]"
                    : "w-2 h-2 bg-zinc-700 hover:bg-zinc-600"
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Desktop Grid - 3 imagens (lateral, destaque, lateral) */}
        <div className="hidden md:block relative">
          <div className="grid grid-cols-3 gap-6 items-center max-w-7xl mx-auto">
            {/* Imagem Esquerda */}
            <div 
              className="relative rounded-2xl overflow-hidden opacity-60 hover:opacity-80 transition-opacity duration-300 cursor-pointer"
              onClick={goToPrevious}
            >
              <img
                src={results[visibleIndices[0]].image}
                alt={`Resultado de aluno ${visibleIndices[0] + 1}`}
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>

            {/* Imagem Central (Destaque) */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#3c8af6]/50 shadow-2xl shadow-[#3c8af6]/20 transform scale-105">
              <img
                src={results[visibleIndices[1]].image}
                alt={`Resultado de aluno ${visibleIndices[1] + 1}`}
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>

            {/* Imagem Direita */}
            <div 
              className="relative rounded-2xl overflow-hidden opacity-60 hover:opacity-80 transition-opacity duration-300 cursor-pointer"
              onClick={goToNext}
            >
              <img
                src={results[visibleIndices[2]].image}
                alt={`Resultado de aluno ${visibleIndices[2] + 1}`}
                className="w-full h-auto object-contain"
                loading="lazy"
              />
            </div>
          </div>

          {/* Navigation Buttons Desktop */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-zinc-700/50 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-zinc-700/50 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
            aria-label="Próximo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Dots Navigation Desktop */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {results.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-8 h-2 bg-[#3c8af6]"
                    : "w-2 h-2 bg-zinc-700 hover:bg-zinc-600"
                }`}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-12 md:mt-16">
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#3c8af6] mb-2">90%</div>
            <div className="text-xs md:text-sm text-zinc-400">Taxa de Sucesso</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#3c8af6] mb-2">500+</div>
            <div className="text-xs md:text-sm text-zinc-400">Alunos Atendidos</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#3c8af6] mb-2">5 Anos</div>
            <div className="text-xs md:text-sm text-zinc-400">de Experiência</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-4 md:p-6 text-center">
            <div className="text-2xl md:text-3xl font-bold text-[#3c8af6] mb-2">4.9★</div>
            <div className="text-xs md:text-sm text-zinc-400">Avaliação Média</div>
          </div>
        </div>
      </div>
    </section>
  );
}
