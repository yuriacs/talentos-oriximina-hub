import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowRight,
  Sparkles,
  Users,
  FolderOpen,
  Award,
  MapPin } from 'lucide-react';

const stats = [
  { icon: Users, value: '150+', label: 'Jovens Cadastrados' },
  { icon: FolderOpen, value: '300+', label: 'Projetos no Portfólio' },
  { icon: Award, value: '500+', label: 'Competências Registradas' },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[600px]">
      {/* Space background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-space.png')" }}
      />
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/45" />
      {/* Blue tint overlay to match brand */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-black/60" />

      <div className="container relative px-4 md:px-6 py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge
            className="px-4 py-1.5 text-sm font-medium animate-fade-up bg-white/15 text-white border-white/30 backdrop-blur-sm">
            <MapPin className="h-3.5 w-3.5 mr-1.5" />
            Oriximiná, Pará
          </Badge>

          {/* Title */}
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight animate-fade-up [animation-delay:100ms] text-white drop-shadow-lg">
            Observatório de{' '}
            <span className="text-[#38bdf8] drop-shadow-[0_0_20px_rgba(56,189,248,0.6)]">Talentos</span>
            {' '}de Oriximiná
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto animate-fade-up [animation-delay:200ms]">
            Um universo de talentos, sonhos, propósitos e network. Se conecte e brilhe.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-fade-up [animation-delay:300ms]">
            <Link to="/cadastro">
              <Button size="lg" className="gradient-bg hover:opacity-90 transition-opacity gap-2 px-8 h-12 text-base shadow-glow">
                <Sparkles className="h-5 w-5" />
                Criar Meu Perfil
              </Button>
            </Link>
            <Link to="/explorar">
              <Button size="lg" variant="outline" className="gap-2 px-8 h-12 text-base bg-white/10 border-white/40 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm">
                Explorar Perfis
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 animate-fade-up [animation-delay:400ms]">
            {stats.map((stat) =>
              <div
                key={stat.label}
                className="flex flex-col items-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 card-hover">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl gradient-bg mb-3">
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className="font-display text-3xl font-bold text-white drop-shadow">
                  {stat.value}
                </span>
                <span className="text-sm text-white/70 mt-1">
                  {stat.label}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
