import { Card } from "@/components/ui/card";
import { CheckCircle, Users, TrendingUp, Clock, Award, Smartphone } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Resultados Comprovados",
      description: "Método testado com mais de 500 alunos. Média de 15kg perdidos em 90 dias."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Acompanhamento Pessoal",
      description: "Suporte direto com Douglas, personal trainer certificado e especialista em emagrecimento."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-primary" />,
      title: "Plataforma Exclusiva",
      description: "Acesso a vídeos, PDFs de treino, planos alimentares e acompanhamento de progresso."
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: "Flexibilidade Total",
      description: "Treinos adaptados à sua rotina. Acesse quando e onde quiser, 24 horas por dia."
    },
    {
      icon: <Award className="w-8 h-8 text-primary" />,
      title: "Garantia de Resultado",
      description: "90 dias para ver resultados ou devolvemos 100% do seu investimento."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      title: "Método Comprovado",
      description: "Sistema baseado em ciência do exercício e nutrição comportamental."
    }
  ];

  return (
    <section id="beneficios" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Por que escolher nossa <span className="text-primary">consultoria</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Mais que um programa de exercícios, oferecemos uma transformação completa do seu estilo de vida.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card key={index} className="p-8 hover-elevate cursor-pointer" data-testid={`card-benefit-${index}`}>
              <div className="mb-6">{benefit.icon}</div>
              <h3 className="text-xl font-semibold mb-4">{benefit.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}