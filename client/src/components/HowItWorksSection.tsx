import { ClipboardCheck, Dumbbell, Apple, MessageCircle, Clock, RefreshCw, Sparkles } from "lucide-react";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      icon: <ClipboardCheck className="w-8 h-8" />,
      title: "Avaliação Inicial",
      description: "Análise completa do seu perfil físico, histórico de saúde e definição de metas realistas e personalizadas",
      badge: "Duração: 60 minutos",
      badgeIcon: <Clock className="w-4 h-4" />
    },
    {
      number: "02",
      icon: <Dumbbell className="w-8 h-8" />,
      title: "Plano Estruturado",
      description: "Desenvolvimento de treino personalizado com progressão científica, adaptado ao seu nível e objetivos específicos",
      badge: "Atualização semanal",
      badgeIcon: <RefreshCw className="w-4 h-4" />
    },
    {
      number: "03",
      icon: <Apple className="w-8 h-8" />,
      title: "Estratégias Nutricionais",
      description: "Orientação nutricional prática e sustentável, sem dietas restritivas, adequada à sua rotina e preferências",
      badge: "Flexível e prática",
      badgeIcon: <Sparkles className="w-4 h-4" />
    },
    {
      number: "04",
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Suporte Contínuo",
      description: "Acompanhamento constante via WhatsApp com ajustes em tempo real, motivação e suporte sempre que necessário",
      badge: "24/7 disponível",
      badgeIcon: <MessageCircle className="w-4 h-4" />
    }
  ];

  return (
    <section id="como-funciona" className="relative py-20 md:py-32 bg-gradient-to-b from-black via-zinc-950 to-zinc-900">
      {/* Gradient Transition from Previous Section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none" />
      
      {/* Gradient Transition to Next Section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-zinc-950 to-black pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Como Funciona
          </h2>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
            Seu processo de transformação em 4 etapas estratégicas e personalizadas
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-6 md:p-8 hover:border-[#3c8af6]/50 transition-all duration-300"
            >
              {/* Icon and Title */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-zinc-800/50 rounded-xl flex items-center justify-center text-[#3c8af6] group-hover:bg-[#3c8af6]/10 transition-colors duration-300 flex-shrink-0">
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">{step.title}</h3>
                  <div className="inline-flex items-center gap-2 bg-zinc-800/50 rounded-full px-3 py-1.5 text-xs text-zinc-400">
                    {step.badgeIcon}
                    <span>{step.badge}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
                {step.description}
              </p>

              {/* Connecting Line (except last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-5 w-10 h-px bg-gradient-to-r from-zinc-700 to-transparent" />
              )}
            </div>
          ))}
        </div>


      </div>
    </section>
  );
}
