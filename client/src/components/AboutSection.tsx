import { Award, Users } from "lucide-react";
import douglasImage from "@assets/../imagens/douglaspersonal.png";

export default function AboutSection() {
  return (
    <section id="sobre" className="relative py-20 md:py-32" style={{ backgroundColor: '#030712' }}>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Imagem */}
          <div className="relative group">
            {/* Main Image Container */}
            <div className="relative rounded-3xl overflow-hidden border-2 border-gray-700/50 shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-500">
              
              {/* Image */}
              <img 
                src={douglasImage} 
                alt="Douglas Personal Trainer" 
                className="w-full h-auto object-cover"
              />
              
              {/* Floating Badge */}
              <div className="absolute bottom-3 left-3 right-3 md:bottom-6 md:left-6 md:right-6 z-20 bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-xl md:rounded-2xl p-2.5 md:p-4 transform translate-y-0 group-hover:-translate-y-2 transition-transform duration-500">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="w-9 h-9 md:w-12 md:h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Award className="w-4 h-4 md:w-6 md:h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-xs md:text-sm">Profissional Certificado</div>
                    <div className="text-gray-400 text-[10px] md:text-xs">CREF Ativo • 8+ Anos</div>
                  </div>
                </div>
              </div>
            </div>
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
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                <Award className="w-10 h-10 text-blue-500 mb-3" />
                <div className="text-4xl font-bold text-white mb-1">8+</div>
                <div className="text-sm text-gray-400">Anos de Experiência</div>
              </div>
              <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
                <Users className="w-10 h-10 text-blue-500 mb-3" />
                <div className="text-4xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-gray-400">Vidas Transformadas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
