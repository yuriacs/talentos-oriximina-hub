import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Eye,
  BarChart3,
  Users,
  Handshake,
  MapPin,
  Compass,
  Mic2,
  Target,
  Link,
  BriefcaseBusiness,
  Star,
  Gift,
  Award,
  Building2,
  Heart,
  ShieldCheck
} from 'lucide-react';

const observatorioItems = [
  {
    icon: Compass,
    title: 'O "GPS" da Gestão',
    description: 'Coleta dados reais sobre a juventude de Oriximiná.',
  },
  {
    icon: Mic2,
    title: 'Voz Ativa',
    description: 'Transforma a realidade dos bairros e comunidades em estatísticas oficiais.',
  },
  {
    icon: Target,
    title: 'Objetivo',
    description: 'Identificar carências (educação, saúde, emprego) para criar soluções precisas.',
  },
  {
    icon: Link,
    title: 'Conexão',
    description: 'É através dos dados do Observatório que alimentamos o nosso Banco de Talentos.',
  },
];

const vitrineItems = [
  {
    icon: Handshake,
    title: 'Ponte Direta',
    description: 'É o espaço onde a SEMJU conecta quem quer trabalhar com quem precisa contratar.',
  },
  {
    icon: Eye,
    title: 'Visibilidade',
    description: 'O perfil do jovem fica disponível para empresas locais que buscam Jovens Aprendizes e Estagiários.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Curadoria da SEMJU',
    description: 'Organizamos os talentos por habilidades (informática, atendimento, vendas, etc.) para que o empresário encontre o perfil certo rápido.',
  },
  {
    icon: Gift,
    title: 'Gratuidade Total',
    description: 'Serviço gratuito tanto para o jovem quanto para a empresa, fortalecendo a economia de Oriximiná.',
  },
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
              <BarChart3 className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              O que é o <span className="gradient-text">Observatório da Juventude</span>?
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              O Observatório da Juventude de Oriximiná é o cérebro da nossa secretaria. 
              Um centro de pesquisa e coleta de dados focado exclusivamente na realidade dos nossos jovens. 
              Por meio dele, ouvimos quem está lá na ponta para entender: quem é o jovem de Oriximiná? 
              O que ele estuda? Onde ele quer trabalhar? Com esses dados, deixamos de apenas "dar cursos" 
              e passamos a criar políticas públicas que realmente mudam a vida de quem mora aqui.
            </p>
          </div>
        </div>
      </section>

      {/* Observatório */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {observatorioItems.map((item) => (
              <Card key={item.title} className="border-border/50 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Vitrine Banco de Talentos */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/20 mb-6">
              <Star className="h-8 w-8 text-secondary" />
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              O que é a <span className="gradient-text">Vitrine Banco de Talentos</span>?
            </h2>
            <p className="text-lg text-muted-foreground">
              A Vitrine do Banco de Talentos é a ferramenta que transforma o currículo do jovem em oportunidade real. 
              Imagine que o Banco de Talentos é o "estoque" de currículos da SEMJU, e a Vitrine é onde as empresas 
              de Oriximiná vão para buscar o profissional que precisam.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {vitrineItems.map((item) => (
              <Card key={item.title} className="border-border/50 card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/10 text-secondary mb-4">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-semibold text-lg mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Selo Empresa Amiga */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg mb-6">
                <Award className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                Selo <span className="gradient-text">Empresa Amiga da Juventude</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                O Selo Empresa Amiga da Juventude é o "aperto de mão" oficial entre a Prefeitura de Oriximiná 
                e o setor privado. É uma certificação de responsabilidade social para as empresas que investem 
                no nosso maior patrimônio: o jovem oriximinaense.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              <Card className="border-border/50 card-hover text-center">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 mx-auto">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-semibold mb-2">Setor Privado</h3>
                  <p className="text-sm text-muted-foreground">
                    Empresas locais que abrem suas portas para o jovem talento de Oriximiná.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 card-hover text-center">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 mx-auto">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-semibold mb-2">Responsabilidade Social</h3>
                  <p className="text-sm text-muted-foreground">
                    Certificação oficial que reconhece o compromisso com a juventude.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border/50 card-hover text-center">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-4 mx-auto">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-display font-semibold mb-2">Investimento no Futuro</h3>
                  <p className="text-sm text-muted-foreground">
                    Apoio direto ao maior patrimônio da cidade: o jovem oriximinaense.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
