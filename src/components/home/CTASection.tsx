import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-hero-bg opacity-95" />
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />

      <div className="container relative px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white">
            Pronto para mostrar seu talento ao mundo?
          </h2>
          
          <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto">
            Junte-se a dezenas de jovens de Oriximiná que já estão construindo 
            seu futuro profissional através do Observatório da Juventude de Oriximiná.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/cadastro">
              <Button 
                size="lg" 
                className="gap-2 px-8 h-12 text-base"
                style={{ backgroundImage: 'none', backgroundColor: 'white', color: 'hsl(var(--primary))' }}
              >
                Criar Meu Perfil Agora
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/como-funciona">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 gap-2 px-8 h-12 text-base bg-[#b033331a]"
              >
                Saiba Como Funciona
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
