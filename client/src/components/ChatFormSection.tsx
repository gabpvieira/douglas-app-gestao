import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Target, TrendingUp, Dumbbell, Users } from "lucide-react";
import douglasImage from "@assets/../imagens/douglaspersonal.png";

interface Message {
  type: 'bot' | 'user';
  text: string;
  timestamp: Date;
}

export default function ChatFormSection() {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    objetivo: "",
    experiencia: ""
  });

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos (DDD + 9 dígitos)
    const limited = numbers.slice(0, 11);
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (limited.length <= 2) {
      return limited;
    } else if (limited.length <= 7) {
      return `(${limited.slice(0, 2)}) ${limited.slice(2)}`;
    } else {
      return `(${limited.slice(0, 2)}) ${limited.slice(2, 7)}-${limited.slice(7)}`;
    }
  };
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    // Scroll apenas dentro do container de mensagens, não na página
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    // Mensagem inicial - apenas uma vez
    if (messages.length === 0) {
      addBotMessage("Olá! 👋 Que bom ter você aqui! Para iniciar sua jornada na consultoria, preciso de algumas informações. Qual é o seu nome?", 500);
    }
  }, []);

  useEffect(() => {
    // Scroll apenas se houver novas mensagens (não no carregamento inicial)
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  const addBotMessage = (text: string, delay = 1000) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { type: 'bot', text, timestamp: new Date() }]);
      setIsTyping(false);
    }, delay);
  };

  const addUserMessage = (text: string) => {
    setMessages(prev => [...prev, { type: 'user', text, timestamp: new Date() }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    addUserMessage(inputValue);

    switch (currentStep) {
      case 0: // Nome
        setFormData(prev => ({ ...prev, nome: inputValue }));
        addBotMessage(`Prazer em conhecer você, ${inputValue}! Agora preciso do seu WhatsApp para entrarmos em contato e alinharmos os detalhes da consultoria.`, 800);
        setCurrentStep(1);
        break;
      case 1: // WhatsApp
        setFormData(prev => ({ ...prev, whatsapp: inputValue }));
        addBotMessage("Perfeito! Para personalizar seu acompanhamento, qual é o seu principal objetivo?", 800);
        setCurrentStep(2);
        break;
      case 3: // Experiência - não usado mais, experiência vem do handleOptionClick
        break;
    }

    setInputValue("");
  };

  const sendToWebhook = async (data: typeof formData) => {
    try {
      const response = await fetch('https://n8nwebhook.chatifyz.com/webhook/douglas-form-lp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      return false;
    }
  };

  const handleOptionClick = async (option: string, field: 'objetivo' | 'experiencia') => {
    addUserMessage(option);
    const updatedFormData = { ...formData, [field]: option };
    setFormData(updatedFormData);

    if (field === 'objetivo') {
      addBotMessage("Ótimo! Última pergunta: você já treina atualmente em academia?", 800);
      setCurrentStep(3);
    } else if (field === 'experiencia') {
      // Enviar para webhook
      addBotMessage("Perfeito! Estou processando sua solicitação de entrada na consultoria...", 300);
      
      const success = await sendToWebhook(updatedFormData);
      
      if (success) {
        setTimeout(() => {
          setCurrentStep(4);
        }, 800);
      } else {
        addBotMessage("Ops! Houve um erro ao processar sua solicitação. Por favor, tente novamente ou entre em contato diretamente.", 500);
      }
    }
  };

  const objetivos = [
    { icon: <TrendingUp className="w-5 h-5" />, label: "Emagrecer", value: "emagrecer" },
    { icon: <Dumbbell className="w-5 h-5" />, label: "Ganhar massa muscular", value: "ganhar_massa" },
    { icon: <Target className="w-5 h-5" />, label: "Definir o corpo", value: "definir" },
    { icon: <Users className="w-5 h-5" />, label: "Outro objetivo", value: "outro" }
  ];

  const experiencias = [
    { label: "Sim, já treino", value: "sim" },
    { label: "Não, ainda não treino", value: "nao" }
  ];

  return (
    <section id="contato" className="relative py-12 md:py-20 bg-gradient-to-b from-black via-zinc-950 to-black">
      {/* Gradient Transition from Pricing Section */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-flex items-center gap-2 bg-[#3c8af6]/10 border border-[#3c8af6]/30 rounded-full px-4 py-2 mb-4">
            <div className="w-2 h-2 bg-[#3c8af6] rounded-full animate-pulse" />
            <span className="text-sm text-[#3c8af6] font-semibold">Aplique para Consultoria</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Quero Entrar na Consultoria!
          </h2>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
            Preencha o formulário abaixo e garanta sua vaga. Vou entrar em contato para alinharmos seus objetivos.
          </p>
        </div>

        {/* Chat Container - Mobile First */}
        <div className="relative bg-zinc-900/50 border border-zinc-800/50 rounded-3xl overflow-hidden shadow-2xl">
          {/* Progress Bar */}
          <div className="bg-zinc-800/50 px-6 py-3 border-b border-zinc-700/50">
            <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
              <span>Progresso</span>
              <span className="text-[#3c8af6] font-semibold">{Math.min(currentStep, 4)}/4</span>
            </div>
            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#3c8af6] to-[#2b7ae5] transition-all duration-500"
                style={{ width: `${(Math.min(currentStep, 4) / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* Messages Area */}
          <div ref={messagesContainerRef} className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-zinc-900/30 to-zinc-900/50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                  {message.type === 'bot' && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#3c8af6]/50">
                        <img 
                          src={douglasImage} 
                          alt="Douglas" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-[#3c8af6] font-semibold">Douglas</span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      message.type === 'bot'
                        ? 'bg-zinc-800/70 text-zinc-100 rounded-tl-none'
                        : 'bg-gradient-to-r from-[#3c8af6] to-[#2b7ae5] text-white rounded-tr-none'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#3c8af6]/50">
                      <img 
                        src={douglasImage} 
                        alt="Douglas" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-[#3c8af6] font-semibold">Douglas</span>
                  </div>
                  <div className="bg-zinc-800/70 rounded-2xl rounded-tl-none px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area - Inline after question */}
            {currentStep < 4 && currentStep !== 2 && currentStep !== 3 && !isTyping && (
              <form onSubmit={handleSubmit} className="animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex gap-2">
                  <Input
                    type={currentStep === 1 ? "tel" : "text"}
                    value={inputValue}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (currentStep === 1) {
                        setInputValue(formatWhatsApp(value));
                      } else {
                        setInputValue(value);
                      }
                    }}
                    placeholder={
                      currentStep === 0 ? "Digite seu nome..." :
                      currentStep === 1 ? "(00) 00000-0000" :
                      "Digite sua resposta..."
                    }
                    className="flex-1 bg-zinc-900/50 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-zinc-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                    autoFocus
                    maxLength={currentStep === 1 ? 15 : undefined}
                  />
                  <Button
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="bg-gradient-to-r from-[#3c8af6] to-[#2b7ae5] hover:from-[#2b7ae5] hover:to-[#1a6ad4] text-white px-6"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            )}

            {/* Options for Objetivo */}
            {currentStep === 2 && !isTyping && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                {objetivos.map((obj, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(obj.label, 'objetivo')}
                    className="w-full bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-[#3c8af6]/50 rounded-xl p-4 text-left transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-[#3c8af6] group-hover:scale-110 transition-transform">
                        {obj.icon}
                      </div>
                      <span className="text-white font-medium">{obj.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Options for Experiência */}
            {currentStep === 3 && !isTyping && (
              <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-300">
                {experiencias.map((exp, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(exp.label, 'experiencia')}
                    className="w-full bg-zinc-800/50 hover:bg-zinc-700/50 border border-zinc-700/50 hover:border-[#3c8af6]/50 rounded-xl p-4 text-left transition-all duration-200"
                  >
                    <span className="text-white font-medium">{exp.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Success State */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-[#3c8af6]/20 to-[#2b7ae5]/20 rounded-2xl border-2 border-[#3c8af6]/50 shadow-lg shadow-[#3c8af6]/20">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-[#3c8af6] to-[#2b7ae5] rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-bounce">
                    <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                    Formulário Enviado com Sucesso!
                  </h3>
                  <p className="text-zinc-300 text-xs sm:text-sm mb-3 sm:mb-4 leading-relaxed">
                    Dentro de alguns minutos vamos enviar uma mensagem no seu WhatsApp{' '}
                    <span className="text-[#3c8af6] font-semibold block sm:inline mt-1 sm:mt-0">{formData.whatsapp}</span>
                  </p>
                  <Button
                    onClick={() => window.open('https://wa.me/5562981665756', '_blank')}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 sm:py-6 text-sm sm:text-base shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="truncate">Abrir WhatsApp do Douglas</span>
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
