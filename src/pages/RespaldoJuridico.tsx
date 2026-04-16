import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Scale, ShieldCheck, BookOpen, Award, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const leis = [
  {
    id: 'lei-9154-2017',
    numero: 'Lei Nº 9.154/2017',
    data: '12 de dezembro de 2017',
    titulo: 'Programa Municipal de Bolsa Estágio',
    ementa: 'Institui o Programa Municipal de Bolsa Estágio e autoriza o Poder Executivo a conceder estágio remunerado para estudantes do Ensino Médio, Ensino Técnico Profissionalizante e Superior regularmente matriculados em instituições públicas e privadas de ensino.',
    destaques: [
      'Estágio remunerado com bolsa-estudo para estudantes',
      'Convênio entre Prefeitura e Instituições de Ensino',
      'Prazo de 6 a 24 meses de estágio',
      'Processo seletivo para vagas de estágio',
    ],
    relevancia: 'Lei fundadora do programa de estágio municipal — base legal principal do Observatório para conectar jovens ao mercado de trabalho.',
    arquivo: '/leis/lei-9154-2017.pdf',
    icon: GraduationCap,
    tipo: 'Lei Municipal',
  },
  {
    id: 'lei-9272-2019',
    numero: 'Lei Nº 9.272/2019',
    data: '01 de abril de 2019',
    titulo: 'Atualização dos Valores de Bolsa Estágio',
    ementa: 'Modifica a redação dos incisos I e II do artigo 4° da Lei Municipal n° 9.154/2017, atualizando os valores de remuneração dos estagiários.',
    destaques: [
      'Ensino Médio/Profissionalizante — 20h: R$ 350,00 | 30h: R$ 400,00',
      'Ensino Superior — 20h: R$ 500,00 | 30h: R$ 600,00',
    ],
    relevancia: 'Garante remuneração justa e atualizada para os jovens estagiários do município.',
    arquivo: '/leis/lei-9272-2019.pdf',
    icon: FileText,
    tipo: 'Lei Municipal',
  },
  {
    id: 'lei-9312-2019',
    numero: 'Lei Nº 9.312/2019',
    data: '02 de outubro de 2019',
    titulo: 'Ampliação das Áreas de Estágio',
    ementa: 'Altera a redação do artigo 6° e modifica o artigo 9° da Lei Municipal n° 9.154/2017, ampliando as áreas administrativas que podem receber estagiários.',
    destaques: [
      'Humanas: Contábeis, Administração, Direito, Serviço Social, Educação, etc.',
      'Exatas: Engenharias, Arquitetura, Informática, etc.',
      'Biológicas: Medicina, Enfermagem, Farmácia, Nutrição, etc.',
      'Técnica: Meio Ambiente, Segurança do Trabalho, Mecânica, etc.',
    ],
    relevancia: 'Amplia as possibilidades de estágio para diversas áreas de formação dos jovens.',
    arquivo: '/leis/lei-9312-2019.pdf',
    icon: BookOpen,
    tipo: 'Lei Municipal',
  },
  {
    id: 'lei-9620-2025',
    numero: 'Lei Nº 9.620/2025',
    data: '10 de julho de 2025',
    titulo: 'Programa Municipal Jovem Aprendiz de Oriximiná',
    ementa: 'Institui o Programa Municipal Jovem Aprendiz de Oriximiná, estabelece diretrizes para sua implementação, promovendo a inserção de jovens no mercado de trabalho.',
    destaques: [
      'Jovens de 14 a 24 anos, priorizando vulnerabilidade social',
      'Parcerias com SENAI, SESI, SENAC, ONGs e instituições de ensino',
      'Selo "Empresa Amiga do Jovem Aprendiz"',
      'Prioridade para jovens negros, indígenas, ribeirinhos e quilombolas',
      'Incentivos fiscais para empresas participantes',
    ],
    relevancia: 'Fortalece a política de primeiro emprego e aprendizagem profissional dos jovens oriximinaenses.',
    arquivo: '/leis/lei-9620-2025.pdf',
    icon: Briefcase,
    tipo: 'Lei Municipal',
  },
  {
    id: 'lei-9637-2025',
    numero: 'Lei Nº 9.637/2025',
    data: '27 de outubro de 2025',
    titulo: 'Selo Empresa Amiga da Juventude',
    ementa: 'Institui o "Selo Empresa Amiga da Juventude" no Município de Oriximiná, conferido às empresas que adotem medidas voltadas à profissionalização de adolescentes e jovens (14 a 29 anos).',
    destaques: [
      'Selo com validade de 2 anos, renovável',
      'Reserva de vagas de emprego para jovens',
      'Cursos de formação e capacitação profissional',
      'Parcerias com programas de inclusão no mercado de trabalho',
      'Possibilidade de benefícios e incentivos fiscais',
    ],
    relevancia: 'Reconhece e incentiva empresas que investem na juventude — pilar central do ecossistema do Observatório.',
    arquivo: '/leis/lei-9637-2025.pdf',
    icon: Award,
    tipo: 'Lei Municipal',
  },
  {
    id: 'edital-2025',
    numero: 'Edital Nº 01-PMO/2025',
    data: 'Abril de 2025',
    titulo: 'Credenciamento de Campos de Estágio',
    ementa: 'Edital de Credenciamento de Instituições de Ensino para oferecimento de campo de Estágio Curricular Obrigatório e Não Obrigatório aos estudantes matriculados nos níveis médio, profissionalizante e superior.',
    destaques: [
      'Credenciamento de instituições de ensino públicas e privadas',
      'Estágio curricular obrigatório e não obrigatório',
      'Níveis médio, profissionalizante e superior',
      'Em conformidade com as Leis Municipais e Lei Federal nº 11.788/2008',
    ],
    relevancia: 'Instrumento operacional que viabiliza a execução do programa de estágio no município.',
    arquivo: '/leis/edital-credenciamento-estagio-2025.pdf',
    icon: FileText,
    tipo: 'Edital',
  },
];

export default function RespaldoJuridico() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
        <div className="container relative px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Scale className="h-5 w-5" />
              <span className="text-sm font-semibold">Fundamentação Legal</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Respaldo <span className="gradient-text">Jurídico</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              O Observatório da Juventude é fundamentado em um sólido arcabouço legal municipal, 
              garantindo que todas as ações de inserção profissional dos jovens estejam respaldadas por leis 
              e regulamentos oficiais.
            </p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="pb-12">
        <div className="container px-4 md:px-6">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-primary/5">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-start gap-4">
                <ShieldCheck className="h-8 w-8 text-primary shrink-0 mt-1" />
                <div>
                  <h2 className="text-xl font-bold mb-2">Compromisso com a Legalidade</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Todas as iniciativas do Observatório — desde a Vitrine de Talentos até o Selo Empresa Amiga da Juventude — 
                    são amparadas por legislação municipal específica. Isso garante transparência, segurança jurídica 
                    e continuidade das políticas públicas voltadas à juventude.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Laws */}
      <section className="pb-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {leis.map((lei) => {
              const Icon = lei.icon;
              return (
                <Card key={lei.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-lg">{lei.numero}</CardTitle>
                            <Badge variant="secondary" className="text-xs">{lei.tipo}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{lei.data}</p>
                        </div>
                      </div>
                      <a href={lei.arquivo} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Baixar PDF
                        </Button>
                      </a>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-base mb-1">{lei.titulo}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{lei.ementa}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold mb-2">Principais pontos:</h4>
                      <ul className="grid sm:grid-cols-2 gap-1.5">
                        {lei.destaques.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary mt-0.5">•</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm">
                        <span className="font-semibold text-primary">Relevância para o Observatório: </span>
                        {lei.relevancia}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
}
