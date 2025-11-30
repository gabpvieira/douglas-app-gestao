import logoImage from "@assets/logo-personal-douglas.png";
import { Instagram, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8">
          {/* Logo and Name */}
          <div className="flex items-center gap-3">
            <img 
              src={logoImage} 
              alt="Douglas Coimbra" 
              className="h-12 w-auto"
              data-testid="img-logo-footer"
            />
            <div>
              <h3 className="text-lg font-bold text-white">Douglas Coimbra</h3>
              <p className="text-sm text-zinc-400">Consultoria Fitness</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-sm">
            <a 
              href="mailto:consultoriadouglas.personal@gmail.com"
              className="flex items-center gap-2 text-zinc-400 hover:text-[#3c8af6] transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>consultoriadouglas.personal@gmail.com</span>
            </a>
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin className="w-4 h-4" />
              <span>Goiânia - GO</span>
            </div>
          </div>

          {/* Social Media */}
          <a 
            href="https://www.instagram.com/douglas_personal.oficial/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white transition-all duration-200"
            data-testid="link-instagram"
          >
            <Instagram className="w-5 h-5" />
            <span className="text-sm font-medium">@douglas_personal.oficial</span>
          </a>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800/50 pt-6 text-center">
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Douglas Coimbra. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}