import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star } from "lucide-react";
import { useState } from "react";

export default function PricingSection() {
  const [selectedPlan, setSelectedPlan] = useState('trimestral');

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
    <section className="py-24 px-6 bg-card/20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Escolha seu <span className="text-primary">plano ideal</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Investimento que transforma sua vida. Todos os planos incluem garantia de satisfação.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`p-8 relative hover-elevate cursor-pointer transition-all ${
                plan.popular ? 'border-primary shadow-lg scale-105' : ''
              } ${
                selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedPlan(plan.id)}
              data-testid={`card-plan-${plan.id}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    <Star className="w-4 h-4 mr-1" />
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-2">
                  {plan.originalPrice && (
                    <span className="text-lg text-muted-foreground line-through mr-2">
                      {plan.originalPrice}
                    </span>
                  )}
                  <span className="text-4xl font-bold text-primary">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className="w-full" 
                variant={plan.popular ? "default" : "outline"}
                data-testid={`button-select-${plan.id}`}
              >
                {selectedPlan === plan.id ? 'Plano Selecionado' : 'Escolher Plano'}
              </Button>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button size="lg" className="text-lg px-12 py-6" data-testid="button-subscribe">
            Assinar Agora
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            ✓ Garantia de 30 dias • ✓ Cancelamento a qualquer momento • ✓ Suporte 24/7
          </p>
        </div>
      </div>
    </section>
  );
}