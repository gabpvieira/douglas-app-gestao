import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star } from "lucide-react";
import logoImage from "@assets/logo-personal-douglas.png";

export default function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#030712' }}>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-20">
        <div className="text-center">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-[#3c8af6]/20 blur-2xl rounded-full" />
              <img 
                src={logoImage} 
                alt="Douglas Coimbra" 
                className="relative h-24 w-auto sm:h-32 object-contain drop-shadow-2xl"
                data-testid="img-logo-hero"
              />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight">
              Douglas Coimbra
            </h1>
            <div className="flex items-center gap-2 mb-8 justify-center px-4 max-w-md mx-auto">
              <div className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent to-[#3c8af6] flex-shrink-0" />
              <p className="text-base sm:text-xl text-zinc-400 font-light text-center leading-snug">
                Transforme seu corpo, transforme sua vida
              </p>
              <div className="h-px w-6 sm:w-10 bg-gradient-to-l from-transparent to-[#3c8af6] flex-shrink-0" />
            </div>
          </div>

          {/* Rating Badge */}
          <div className="inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-2 bg-zinc-800/50 backdrop-blur-sm rounded-2xl sm:rounded-full px-4 sm:px-5 py-3 sm:py-2.5 mb-10 border border-zinc-700/50 max-w-xs sm:max-w-none mx-auto">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#3c8af6] text-[#3c8af6]" />
              ))}
            </div>
            <span className="text-xs sm:text-sm font-medium text-zinc-300 text-center">4.9/5 • +500 alunos transformados</span>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 text-white leading-tight px-4">
            Alcance seus objetivos com
            <br />
            <span className="text-blue-500">
              método comprovado
            </span>
          </h2>
          
          <p className="text-base sm:text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            Consultoria fitness personalizada com treinos, nutrição e acompanhamento profissional.
            <br className="hidden sm:block" />
            <span className="text-[#3c8af6] font-semibold">Resultados reais em 90 dias</span> ou seu dinheiro de volta.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-row gap-3 justify-center items-center w-full max-w-2xl mx-auto px-4">
            <Button 
              onClick={() => scrollToSection('contato')}
              className="flex-1 sm:flex-none text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white transition-colors border-0 rounded-lg font-medium"
              data-testid="button-start-now"
            >
              <span className="hidden sm:inline">Começar Agora</span>
              <span className="sm:hidden">Começar</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => scrollToSection('resultados')}
              className="flex-1 sm:flex-none text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 bg-gray-800/50 border border-gray-700 text-white hover:bg-gray-800 transition-colors rounded-lg font-medium"
              data-testid="button-watch-video"
            >
              <Play className="mr-2 w-4 h-4" />
              <span className="hidden sm:inline">Ver Resultados</span>
              <span className="sm:hidden">Resultados</span>
            </Button>
          </div>
        </div>
      </div>

    </section>
  );
}
