import { Link } from 'react-router-dom';
import { Sparkles, Heart, MapPin } from 'lucide-react';

const footerLinks = {
  plataforma: [
    { href: '/explorar', label: 'Explorar Perfis' },
    { href: '/como-funciona', label: 'Como Funciona' },
    { href: '/sobre', label: 'Sobre o Projeto' },
    { href: '/faq', label: 'Perguntas Frequentes' },
  ],
  legal: [
    { href: '/privacidade', label: 'Política de Privacidade' },
    { href: '/termos', label: 'Termos de Uso' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 transition-transform group-hover:scale-195">
                <img src="/LIKE (1).png" alt="Logo" className="h-12 w-12 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold gradient-text">
                  BTJO
                </span>
                <span className="text-xs text-muted-foreground">
                  Banco de Talentos Jovens
                </span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm max-w-md mb-4">
              Valorizando os talentos da juventude de Oriximiná através de uma plataforma 
              de portfólio profissional, networking e desenvolvimento de competências.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Oriximiná, Pará - Brasil</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Plataforma</h4>
            <ul className="space-y-3">
              {footerLinks.plataforma.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Banco de Talentos Jovens de Oriximiná. 
              Todos os direitos reservados.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Feito com <Heart className="h-4 w-4 text-destructive fill-destructive" /> para a juventude amazônica
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
