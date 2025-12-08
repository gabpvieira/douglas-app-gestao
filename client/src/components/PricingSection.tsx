import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star } from "lucide-react";

export default function PricingSection() {
  const plans = [
    {
      id: 'mensal',
      name: 'Mensal',
      price: 'R$ 100',
      period: '/mês',
      description: 'Ideal para começar sua jornada',
      features: [
        'Acesso completo à plataforma',
        'Treinos personalizados em PDF',
        'Biblioteca de vídeos de exercícios',
        'Plano alimentar personalizado',
        'Acompanhamento de progresso',
        'Suporte via chat'
      ],
      popular: false
    },
    {
      id: 'trimestral',
      name: 'Trimestral',
      price: 'R$ 250',
      period: '/3 meses',
      originalPrice: 'R$ 300',
      description: 'Melhor custo-benefício para resultados',
      features: [
        'Tudo do plano mensal',
        'Consultoria nutricional inclusa',
        'Acompanhamento semanal personalizado',
        'Ajustes de treino ilimitados',
        'Grupo VIP no WhatsApp',
        'Garantia de 30 dias'
      ],
      popular: true
    },
    {
      id: 'familia',
      name: 'Família',
      price: 'R$ 90',
      period: '/pessoa/mês',
      description: 'Para casais e famílias (mín. 2 pessoas)',
      features: [
        'Tudo do plano trimestral',
        'Até 4 pessoas na conta',
        'Treinos adaptados por pessoa',
        'Desafios em família',
        'Suporte prioritário',
        'Desconto progressivo'
      ],
      popular: false
    }
  ];

  return (
    <section id="planos" className="relative py-16 md:py-24" style={{ backgroundColor: '#030712' }}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Investimento na sua <span className="text-blue-500">Transformação</span>
          </h2>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
            Valores transparentes para você escolher o melhor plano. Pagamento direto com o Douglas.
          </p>
        </div>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`relative bg-gray-900/50 border border-gray-800/50 rounded-2xl p-6 md:p-8 transition-all duration-300 ${
                plan.popular ? 'border-blue-500/50 lg:scale-105' : 'hover:border-gray-700'
              }`}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-4 py-1 shadow-lg">
                    <Star className="w-4 h-4 mr-1 fill-white" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3">{plan.name}</h3>
                <div className="mb-3">
                  {plan.originalPrice && (
                    <span className="text-base text-gray-500 line-through mr-2">
                      {plan.originalPrice}
                    </span>
                  )}
                  <div>
                    <span className="text-4xl md:text-5xl font-bold text-blue-500">{plan.price}</span>
                    <span className="text-gray-400 text-sm ml-1">{plan.period}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-400">{plan.description}</p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-sm text-gray-400 mb-6">
            ✓ Garantia de 30 dias • ✓ Pagamento facilitado • ✓ Suporte 24/7
          </p>
          <div className="flex flex-col items-center gap-3">
            <p className="text-gray-300 text-base font-medium">
              Preencha o formulário abaixo e faça parte da nossa comunidade de transformação
            </p>
            {/* Animated Arrow */}
            <div className="animate-bounce">
              <svg 
                className="w-6 h-6 text-blue-500" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}