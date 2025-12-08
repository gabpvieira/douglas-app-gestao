import { Card } from "@/components/ui/card";
import { CheckCircle, Users, TrendingUp, Clock, Award, Smartphone, Video, FileText, Calendar, Camera, BarChart3, MessageSquare } from "lucide-react";

export default function BenefitsSection() {
  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8 text-[#3c8af6]" />,
      title: "Resultados Comprovados",
      description: "Método testado com mais de 500 alunos. Média de 15kg perdidos em 90 dias com acompanhamento científico."
    },
    {
      icon: <Users className="w-8 h-8 text-[#3c8af6]" />,
      title: "Acompanhamento Pessoal",
      description: "Suporte direto com Douglas, personal trainer certificado CREF e especialista em transformação corporal."
    },
    {
      icon: <Smartphone className="w-8 h-8 text-[#3c8af6]" />,
      title: "App Próprio de Acompanhamento",
      description: "Plataforma exclusiva desenvolvida para você ter controle total da sua evolução, 24/7 no seu celular."
    },
    {
      icon: <Video className="w-8 h-8 text-[#3c8af6]" />,
      title: "Biblioteca de Vídeos",
      description: "Acesso ilimitado a vídeos demonstrativos de cada exercício com técnica correta e variações."
    },
    {
      icon: <FileText className="w-8 h-8 text-[#3c8af6]" />,
      title: "Fichas de Treino Personalizadas",
      description: "Treinos em PDF e digitais, atualizados semanalmente conforme sua evolução e feedback."
    },
    {
      icon: <Calendar className="w-8 h-8 text-[#3c8af6]" />,
      title: "Agenda Integrada",
      description: "Sistema de agendamento para consultas, avaliações físicas e acompanhamento presencial."
    },
    {
      icon: <Camera className="w-8 h-8 text-[#3c8af6]" />,
      title: "Registro de Progresso",
      description: "Acompanhe sua evolução com fotos, medidas corporais e gráficos de desempenho ao longo do tempo."
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-[#3c8af6]" />,
      title: "Planos Alimentares",
      description: "Estratégias nutricionais práticas e sustentáveis, sem dietas restritivas, adaptadas à sua rotina."
    },
    {
      icon: <MessageSquare className="w-8 h-8 text-[#3c8af6]" />,
      title: "Suporte via WhatsApp",
      description: "Tire dúvidas, receba motivação e ajustes em tempo real direto com o personal."
    },
    {
      icon: <Award className="w-8 h-8 text-[#3c8af6]" />,
      title: "Garantia de Resultado",
      description: "90 dias para ver resultados ou devolvemos 100% do seu investimento. Sem riscos."
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-[#3c8af6]" />,
      title: "Método Científico",
      description: "Sistema baseado em ciência do exercício, periodização e nutrição comportamental."
    },
    {
      icon: <Clock className="w-8 h-8 text-[#3c8af6]" />,
      title: "Flexibilidade Total",
      description: "Treinos adaptados à sua rotina. Acesse quando e onde quiser, sem horários fixos."
    }
  ];

  return (
    <section id="beneficios" className="relative py-20 md:py-32" style={{ backgroundColor: '#030712' }}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Por que escolher nossa <span className="text-blue-500">consultoria</span>?
          </h2>
          <p className="text-lg text-zinc-400 max-w-3xl mx-auto">
            Mais que um programa de exercícios, oferecemos uma transformação completa com tecnologia e acompanhamento profissional.
          </p>
        </div>
        
        {/* Platform Highlight */}
        <div className="mb-12 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-3">Plataforma Exclusiva de Acompanhamento</h3>
              <p className="text-zinc-300 leading-relaxed">
                Tenha acesso ao nosso app próprio desenvolvido especialmente para você acompanhar toda sua jornada de transformação. 
                Treinos, nutrição, progresso e comunicação direta com o personal, tudo em um só lugar.
              </p>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, index) => (
            <div 
              key={index} 
              className="bg-gray-900/50 border border-gray-800/50 rounded-xl p-6 hover:border-blue-500/50 hover:bg-gray-900/70 transition-all duration-300 group"
              data-testid={`card-benefit-${index}`}
            >
              <div className="mb-4 group-hover:scale-110 transition-transform duration-300">{benefit.icon}</div>
              <h3 className="text-lg font-bold text-white mb-3">{benefit.title}</h3>
              <p className="text-zinc-400 leading-relaxed text-sm">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}