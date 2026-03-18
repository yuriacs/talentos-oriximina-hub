import { 
  User, 
  FolderOpen, 
  Award, 
  MessageCircle, 
  Shield, 
  FileText,
  Sparkles,
  Globe
} from 'lucide-react';

const features = [
  {
    icon: User,
    title: 'Perfil Profissional',
    description: 'Crie um perfil completo destacando sua formação, experiências e objetivos profissionais.',
  },
  {
    icon: FolderOpen,
    title: 'Portfólio Digital',
    description: 'Mostre seus projetos com descrições detalhadas, tecnologias utilizadas e resultados alcançados.',
  },
  {
    icon: Award,
    title: 'Competências',
    description: 'Registre suas habilidades técnicas e socioemocionais com diferentes níveis de proficiência.',
  },
  {
    icon: MessageCircle,
    title: 'Networking',
    description: 'Conecte-se com outros jovens da região através de mensagens internas.',
  },
  {
    icon: FileText,
    title: 'Currículo em PDF',
    description: 'Gere automaticamente um currículo profissional a partir do seu perfil.',
  },
  {
    icon: Shield,
    title: 'Privacidade',
    description: 'Controle total sobre quais informações são visíveis e para quem.',
  },
  {
    icon: Sparkles,
    title: 'Selo de Verificação',
    description: 'Perfis completos e verificados recebem um selo especial de destaque.',
  },
  {
    icon: Globe,
    title: 'Link Compartilhável',
    description: 'Compartilhe seu perfil público com um link único e personalizado.',
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa para{' '}
            <span className="gradient-text">brilhar</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Uma plataforma completa para você construir sua presença profissional 
            e conectar-se com oportunidades.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border/50 card-hover"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
