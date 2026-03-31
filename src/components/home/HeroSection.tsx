import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Sparkles,
  Users,
  Building2,
  Award,
  MapPin
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function HeroSection() {
  const [companyCount, setCompanyCount] = useState(0);
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    supabase.from('companies').select('id', { count: 'exact', head: true }).then(({ count }) => {
      setCompanyCount(count ?? 0);
    });
    const timer = setTimeout(() => setIsPulsing(false), 30000);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { icon: null, topLabel: 'Vitrine', value: null, label: "Banco de Talentos da Juventude", cta: "Cadastre-se aqui", link: '/cadastro' },
    { icon: Building2, topLabel: null, value: `${companyCount}`, label: "Empresas Amigas da Juventude", cta: "Cadastre sua empresa aqui", link: '/cadastro-empresa' },
    { icon: Award, topLabel: null, value: '10+', label: 'Projetos Publicados', cta: undefined, link: undefined },
  ];

  return (
    <section className="relative overflow-hidden min-h-[600px]">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-space.png')" }}
      />
      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-black/60" />

      <div className="container relative px-4 md:px-6 py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">

          {/* Badge */}
          <Badge className="px-4 py-1.5 text-sm font-medium animate-fade-up bg-white/15 text-white border-white/30 backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
            Oriximiná, Pará
          </Badge>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-up [animation-delay:100ms] text-white drop-shadow-lg">
            Observatório da{' '}
            <span className="text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]">
              Juventude
            </span>{' '}
            de Oriximiná
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-up [animation-delay:200ms]">
            Um universo de talentos, sonhos, propósitos e network. Se conecte e brilhe.
          </p>

          {/* Spacer to maintain layout */}
          <div className="pt-4 h-12" />


          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 animate-fade-up [animation-delay:400ms]">
            {stats.map((stat) => {
              const content = (
                <div className={`flex flex-col items-center p-6 rounded-2xl backdrop-blur-md border card-hover transition-all duration-300 ${stat.topLabel ? 'bg-primary/20 border-primary/40 shadow-[0_0_25px_rgba(14,165,233,0.15)] hover:shadow-[0_0_35px_rgba(14,165,233,0.25)] hover:scale-105 cursor-pointer' : stat.link ? 'bg-white/10 border-white/20 cursor-pointer hover:scale-105' : 'bg-white/10 border-white/20'}`}>
                  {stat.icon && (
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl gradient-bg mb-3">
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  )}
                  {stat.topLabel && (
                    <span className="font-display text-3xl font-bold text-[#38bdf8] drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] mb-1">
                      {stat.topLabel}
                    </span>
                  )}
                  {stat.value && (
                    <span className="font-display text-3xl font-bold text-white drop-shadow">
                      {stat.value}
                    </span>
                  )}
                  <span className="text-sm text-white/70 mt-1 text-center">
                    {stat.label}
                  </span>
                  {stat.cta && stat.topLabel && (
                    <span className={`mt-4 inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold tracking-wide shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all ${isPulsing ? 'animate-pulse' : ''}`}>
                      {stat.cta}
                    </span>
                  )}
                  {stat.cta && !stat.topLabel && (
                    <span className={`mt-3 inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold tracking-wide border border-white/30 hover:bg-white/30 transition-colors ${isPulsing ? 'animate-pulse' : ''}`}>
                      {stat.cta}
                    </span>
                  )}
                </div>
              );

              return stat.link ? (
                <Link key={stat.label} to={stat.link}>
                  {content}
                </Link>
              ) : (
                <div key={stat.label}>
                  {content}
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}