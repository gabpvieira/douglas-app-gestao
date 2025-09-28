import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Star } from "lucide-react";
import heroImage from "@assets/generated_images/Fitness_gym_hero_background_ef42876d.png";

export default function HeroSection() {
  return (
    <section id="sobre" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/90" />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Rating Badge */}
        <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-card-border">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-primary text-primary" />
            ))}
          </div>
          <span className="text-sm font-medium">4.9/5 • +500 alunos transformados</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground">
          Transforme seu <span className="text-primary">Corpo</span>
          <br />com Método Comprovado
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Consultoria fitness personalizada com treinos, nutrição e acompanhamento 24/7.
          Resultados reais em 90 dias ou seu dinheiro de volta.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" className="text-lg px-8 py-6" data-testid="button-start-now">
            Começar Agora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-background/20 backdrop-blur-sm" data-testid="button-watch-video">
            <Play className="mr-2 w-5 h-5" />
            Ver Resultados
          </Button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">500+</div>
            <div className="text-sm text-muted-foreground">Alunos Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">15kg</div>
            <div className="text-sm text-muted-foreground">Média Perdida</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary mb-2">90%</div>
            <div className="text-sm text-muted-foreground">Taxa Sucesso</div>
          </div>
        </div>
      </div>
    </section>
  );
}