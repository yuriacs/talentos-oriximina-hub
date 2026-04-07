import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2,
  Globe,
  Instagram,
  Linkedin,
  ArrowRight,
  Loader2,
  Handshake,
  Award,
  MapPin,
} from 'lucide-react';

interface Company {
  id: string;
  nome_fantasia: string;
  setor_atividade: string | null;
  porte: string | null;
  site_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  endereco_cidade: string | null;
  logo_url: string | null;
}

export default function EmpresasAmigas() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      const { data } = await supabase
        .from('companies')
        .select('id, nome_fantasia, setor_atividade, porte, site_url, instagram_url, linkedin_url, endereco_cidade, logo_url')
        .eq('status', 'APROVADA')
        .order('nome_fantasia');
      setCompanies(data || []);
      setLoading(false);
    }
    fetchCompanies();
  }, []);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-bg opacity-5" />
        <div className="container px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-bg mb-6">
              <Handshake className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Empresas <span className="gradient-text">Amigas da Juventude</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-4">
              Conheça as empresas que apoiam o Observatório da Juventude de Oriximiná
              e se comprometem com o desenvolvimento profissional dos jovens.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Programa instituído pela Lei Municipal nº 9.637/2025
            </p>
            <Link to="/cadastro-empresa">
              <Button size="lg" className="gradient-bg hover:opacity-90 gap-2">
                Cadastrar Minha Empresa
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Selo + Benefícios */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className="flex justify-center">
              <img
                src="/selo-empresa-amiga.png"
                alt="Selo Empresa Amiga da Juventude"
                className="w-64 h-64 object-contain drop-shadow-lg"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-bold mb-6">
                O que é o <span className="gradient-text">Selo?</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                O Selo "Empresa Amiga da Juventude" reconhece empresas que se comprometem
                com a inclusão de jovens no mercado de trabalho, oferecendo oportunidades
                de estágio, aprendizagem e capacitação profissional.
              </p>
              <div className="space-y-3">
                {[
                  'Reconhecimento público pelo compromisso social',
                  'Destaque na plataforma do Observatório',
                  'Acesso ao banco de talentos jovens',
                  'Contribuição para o desenvolvimento local',
                ].map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-primary flex-shrink-0" />
                    <span className="text-foreground text-sm">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lista de empresas */}
      <section className="py-16 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Empresas Parceiras
              </h2>
              <p className="text-muted-foreground text-lg">
                Empresas que já receberam o selo e apoiam a juventude de Oriximiná.
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : companies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {companies.map((company) => (
                  <Card key={company.id} className="border-border/50 card-hover overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt={`Logo ${company.nome_fantasia}`} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                        ) : (
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                            <Building2 className="h-6 w-6" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display font-semibold text-lg truncate">
                            {company.nome_fantasia}
                          </h3>
                          {company.setor_atividade && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {company.setor_atividade}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {company.endereco_cidade && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{company.endereco_cidade}</span>
                          </div>
                        )}
                        {company.porte && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Building2 className="h-3.5 w-3.5" />
                            <span>{company.porte}</span>
                          </div>
                        )}
                      </div>

                      {(company.site_url || company.instagram_url || company.linkedin_url) && (
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
                          {company.site_url && (
                            <a href={company.site_url} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                              <Globe className="h-4 w-4" />
                            </a>
                          )}
                          {company.instagram_url && (
                            <a href={company.instagram_url} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                              <Instagram className="h-4 w-4" />
                            </a>
                          )}
                          {company.linkedin_url && (
                            <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer"
                              className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                              <Linkedin className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Building2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">
                  Nenhuma empresa aprovada ainda
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  As empresas que receberem o selo aparecerão aqui. Seja a primeira a apoiar a juventude!
                </p>
                <Link to="/cadastro-empresa">
                  <Button className="gradient-bg hover:opacity-90 gap-2">
                    Cadastrar Minha Empresa
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20 bg-primary">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
              Sua empresa quer apoiar a juventude?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Cadastre-se no programa Empresa Amiga da Juventude e faça parte dessa transformação.
            </p>
            <Link to="/cadastro-empresa">
              <Button size="lg" className="bg-transparent text-white border-2 border-white hover:bg-white/10 gap-2 font-semibold">
                Quero Participar
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
