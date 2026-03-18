import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Target, 
  Heart, 
  Users, 
  Lightbulb,
  MapPin,
  Sparkles,
  GraduationCap,
  Handshake
} from 'lucide-react';

const values = [
  {
    icon: Heart,
    title: 'Valorização Local',
    description: 'Acreditamos no potencial da juventude de Oriximiná e queremos dar visibilidade aos talentos da região amazônica.',
  },
  {
    icon: Users,
    title: 'Protagonismo Juvenil',
    description: 'Incentivamos os jovens a serem protagonistas de suas próprias histórias profissionais.',
  },
  {
    icon: Lightbulb,
    title: 'Desenvolvimento Contínuo',
    description: 'Promovemos o registro e reconhecimento de competências técnicas e socioemocionais.',
  },
  {
    icon: Handshake,
    title: 'Conexão e Networking',
    description: 'Facilitamos a conexão entre jovens com interesses e objetivos semelhantes.',
  },
];

const objectives = [
  'Criar um banco de dados de talentos juvenis locais',
  'Facilitar a construção de portfólios profissionais',
  'Promover o registro de competências e experiências',
  'Conectar jovens para troca de conhecimentos',
  'Apoiar ações pedagógicas e institucionais',
  'Valorizar a identidade e cultura amazônica',
];

export default function Sobre() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-bg opacity-5" />
        <div className="container px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg mb-6">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Sobre o <span className="gradient-text">BTJO</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              O Banco de Talentos Jovens de Oriximiná é uma iniciativa para valorizar, 
              registrar e conectar os talentos da juventude amazônica.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-primary font-medium mb-4">
                <Target className="h-5 w-5" />
                Nossa Missão
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Valorizar os talentos da juventude de Oriximiná
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                O BTJO nasceu da necessidade de criar um espaço onde os jovens de Oriximiná 
                pudessem construir sua presença profissional digital, registrar suas competências 
                e conectar-se com outros jovens da região.
              </p>
              <p className="text-muted-foreground text-lg">
                Não somos uma plataforma de empregos ou recrutamento. Nosso foco é exclusivamente 
                no desenvolvimento profissional e no protagonismo juvenil, servindo como uma 
                vitrine de talentos para fins educacionais e institucionais.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 gradient-hero-bg opacity-10 rounded-3xl blur-xl" />
              <Card className="relative border-border/50">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <MapPin className="h-6 w-6 text-primary" />
                    <span className="font-display font-semibold text-lg">Oriximiná, Pará</span>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Localizada no coração da Amazônia, Oriximiná é uma cidade rica em cultura, 
                    biodiversidade e, principalmente, jovens talentosos com potencial imenso.
                  </p>
                  <div className="flex items-center gap-3">
                    <GraduationCap className="h-6 w-6 text-secondary" />
                    <span className="text-foreground">Apoio institucional e pedagógico</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Nossos <span className="gradient-text">Valores</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Princípios que guiam todas as nossas ações e decisões.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="border-border/50 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Nossos <span className="gradient-text">Objetivos</span>
              </h2>
              <p className="text-muted-foreground text-lg">
                O que buscamos alcançar com esta plataforma.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {objectives.map((objective, index) => (
                <div 
                  key={objective}
                  className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg gradient-bg flex-shrink-0">
                    <span className="text-primary-foreground font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <p className="text-foreground">{objective}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
