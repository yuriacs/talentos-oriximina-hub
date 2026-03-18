import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  UserPlus, 
  Edit, 
  FolderPlus, 
  Award, 
  Share2, 
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Shield
} from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Crie sua conta',
    description: 'Cadastre-se gratuitamente com seu e-mail e comece a construir seu perfil profissional.',
  },
  {
    icon: Edit,
    title: 'Monte seu perfil',
    description: 'Adicione sua bio profissional, formação, experiências e objetivo de carreira.',
  },
  {
    icon: Award,
    title: 'Registre competências',
    description: 'Cadastre suas habilidades técnicas e socioemocionais com níveis de proficiência.',
  },
  {
    icon: FolderPlus,
    title: 'Adicione projetos',
    description: 'Mostre seus projetos com descrições, tecnologias utilizadas e resultados alcançados.',
  },
  {
    icon: Share2,
    title: 'Compartilhe',
    description: 'Gere seu currículo em PDF e compartilhe seu perfil com um link único.',
  },
  {
    icon: MessageCircle,
    title: 'Conecte-se',
    description: 'Envie e receba mensagens de outros jovens da plataforma.',
  },
];

const requirements = [
  'Bio profissional preenchida',
  'Pelo menos 5 competências cadastradas',
  'Pelo menos 1 projeto no portfólio',
  'Disponibilidade informada',
];

const features = [
  {
    icon: FileText,
    title: 'Currículo Automático',
    description: 'Gere um PDF profissional a partir do seu perfil com um clique.',
  },
  {
    icon: Shield,
    title: 'Privacidade Total',
    description: 'Controle quais informações são visíveis e para quem.',
  },
  {
    icon: Award,
    title: 'Selo de Verificação',
    description: 'Perfis completos recebem um selo especial de destaque.',
  },
];

export default function ComoFunciona() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-bg opacity-5" />
        <div className="container px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Como <span className="gradient-text">Funciona</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Criar seu perfil profissional no BTJO é simples e gratuito. 
              Siga os passos abaixo para começar.
            </p>
            <Link to="/cadastro">
              <Button size="lg" className="gradient-bg hover:opacity-90 gap-2">
                Começar Agora
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Passo a Passo
              </h2>
              <p className="text-muted-foreground text-lg">
                Em poucos minutos você terá seu perfil pronto.
              </p>
            </div>

            <div className="grid gap-6">
              {steps.map((step, index) => (
                <div 
                  key={step.title}
                  className="flex gap-6 items-start p-6 rounded-2xl bg-card border border-border/50 card-hover"
                >
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="flex items-center justify-center w-14 h-14 rounded-xl gradient-bg">
                        <step.icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Requisitos para <span className="gradient-text">Publicação</span>
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  Para que seu perfil fique visível na plataforma, você precisa completar 
                  alguns itens essenciais. Perfis incompletos ficam salvos como rascunho.
                </p>
                <div className="space-y-3">
                  {requirements.map((req) => (
                    <div key={req} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{req}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="border-border/50">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-display font-semibold text-lg">
                    Funcionalidades Especiais
                  </h3>
                  {features.map((feature) => (
                    <div key={feature.title} className="flex gap-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                        <feature.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 gradient-hero-bg">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-6">
              Pronto para começar?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Crie sua conta gratuitamente e comece a construir seu perfil profissional hoje mesmo.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/cadastro">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 gap-2">
                  Criar Meu Perfil
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/explorar">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Ver Perfis Existentes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
