import { Award, Users } from "lucide-react";
import douglasImage from "@assets/../imagens/douglaspersonal.png";

export default function AboutSection() {
  return (
    <section id="sobre" className="relative py-20 md:py-32 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-900">
      {/* Gradient Transition from Hero Section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-zinc-900 to-transparent pointer-events-none" />
      
      {/* Gradient Transition to Benefits Section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-zinc-900/50 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Imagem */}
          <div className="relative group">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#3c8af6]/30 to-[#2b7ae5]/30 blur-3xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Floating Decorative Elements */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-[#3c8af6]/10 rounded-full blur-2xl animate-pulse" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#2b7ae5]/10 rounded-full blur-2xl animate-pulse delay-700" />
            
            {/* Main Image Container */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-zinc-700/50 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent z-10" />
              
              {/* Image */}
              <img 
                src={douglasImage} 
                alt="Douglas Personal Trainer" 
                className="w-full h-auto object-cover"
              />
              
              {/* Floating Badge */}
              <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6 z-20 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 rounded-xl md:rounded-2xl p-2.5 md:p-4 transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-9 h-9 md:w-12 md:h-12 bg-gradient-to-br from-[#3c8af6] to-[#2b7ae5] rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-xs md:text-sm">Profissional Certificado</div>
                    <div className="text-zinc-400 text-[10px] md:text-xs">CREF Ativo • 8+ Anos</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#3c8af6]/50 rounded-tr-3xl" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#3c8af6]/50 rounded-bl-3xl" />
          </div>

          {/* Conteúdo */}
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
              Quem Sou
            </h2>
            <p className="text-lg text-zinc-300 leading-relaxed mb-8">
              Sou o <span className="text-[#3c8af6] font-semibold">Douglas Coimbra</span>, personal trainer com mais de 8 anos de experiência ajudando pessoas comuns a alcançarem resultados consistentes, seja emagrecendo com saúde, ganhando massa magra ou simplesmente criando disciplina na rotina.
            </p>
            <p className="text-lg text-zinc-300 leading-relaxed mb-10">
              Já acompanhei mais de 500 alunos, tanto presencialmente quanto online, sempre com planejamento individualizado, abordagem realista e foco em evolução contínua.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                <Award className="w-10 h-10 text-[#3c8af6] mb-3" />
                <div className="text-4xl font-bold text-white mb-1">8+</div>
                <div className="text-sm text-zinc-400">Anos de Experiência</div>
              </div>
              <div className="bg-zinc-800/30 backdrop-blur-sm border border-zinc-700/50 rounded-xl p-6">
                <Users className="w-10 h-10 text-[#3c8af6] mb-3" />
                <div className="text-4xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-zinc-400">Vidas Transformadas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
