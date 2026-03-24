import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Building2, Search, Mail, Phone, MapPin, ExternalLink, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Company {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj: string;
  email: string;
  whatsapp: string | null;
  responsavel_nome: string;
  responsavel_cargo: string | null;
  setor_atividade: string | null;
  porte: string | null;
  status: string;
  endereco_rua: string | null;
  endereco_numero: string | null;
  endereco_bairro: string | null;
  endereco_cidade: string | null;
  endereco_estado: string | null;
  endereco_cep: string | null;
  site_url: string | null;
  linkedin_url: string | null;
  instagram_url: string | null;
  modalidades_vaga: string[] | null;
  faixa_salarial: string | null;
  turnos_trabalho: string[] | null;
  acoes_profissionalizacao: string[] | null;
  termo_aceito: boolean;
  termo_aceito_em: string | null;
  created_at: string;
}

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDENTE: { label: 'Pendente', variant: 'secondary' },
  APROVADA: { label: 'Aprovada', variant: 'default' },
  REJEITADA: { label: 'Rejeitada', variant: 'destructive' },
};

export default function AdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar empresas');
      console.error(error);
    } else {
      setCompanies(data || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('companies').update({ status }).eq('id', id);
    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success(`Status atualizado para ${statusMap[status]?.label || status}`);
      fetchCompanies();
    }
  };

  const filtered = companies.filter(c =>
    [c.nome_fantasia, c.razao_social, c.cnpj, c.email, c.responsavel_nome]
      .some(f => f?.toLowerCase().includes(search.toLowerCase()))
  );

  const buildAddress = (c: Company) =>
    [c.endereco_rua, c.endereco_numero, c.endereco_bairro, c.endereco_cidade, c.endereco_estado, c.endereco_cep]
      .filter(Boolean).join(', ');

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Carregando...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Empresas Cadastradas</h1>
        <p className="text-muted-foreground">{companies.length} empresa(s) registrada(s) no programa</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CNPJ, e-mail..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">Nenhuma empresa encontrada.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(company => {
            const expanded = expandedId === company.id;
            const status = statusMap[company.status] || { label: company.status, variant: 'outline' as const };
            return (
              <Card key={company.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : company.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate">{company.nome_fantasia}</CardTitle>
                        <p className="text-sm text-muted-foreground truncate">{company.razao_social} · {company.cnpj}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </CardHeader>

                {expanded && (
                  <CardContent className="border-t pt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">Contato</h4>
                        <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> {company.email}</p>
                        {company.whatsapp && <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> {company.whatsapp}</p>}
                        <p className="text-muted-foreground">Responsável: {company.responsavel_nome}{company.responsavel_cargo ? ` (${company.responsavel_cargo})` : ''}</p>
                      </div>

                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">Perfil</h4>
                        {company.setor_atividade && <p>Setor: {company.setor_atividade}</p>}
                        {company.porte && <p>Porte: {company.porte}</p>}
                        {company.faixa_salarial && <p>Faixa salarial: {company.faixa_salarial}</p>}
                      </div>

                      {buildAddress(company) && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-foreground">Endereço</h4>
                          <p className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" /> {buildAddress(company)}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground">Links</h4>
                        <div className="flex flex-wrap gap-2">
                          {company.site_url && <a href={company.site_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" />Site</a>}
                          {company.linkedin_url && <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" />LinkedIn</a>}
                          {company.instagram_url && <a href={company.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1"><ExternalLink className="h-3 w-3" />Instagram</a>}
                          {!company.site_url && !company.linkedin_url && !company.instagram_url && <span className="text-muted-foreground">Nenhum</span>}
                        </div>
                      </div>
                    </div>

                    {(company.modalidades_vaga?.length || company.turnos_trabalho?.length || company.acoes_profissionalizacao?.length) ? (
                      <div className="space-y-2 text-sm">
                        <h4 className="font-semibold text-foreground">Oportunidades</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {company.modalidades_vaga?.map(m => <Badge key={m} variant="outline">{m}</Badge>)}
                          {company.turnos_trabalho?.map(t => <Badge key={t} variant="secondary">{t}</Badge>)}
                        </div>
                        {company.acoes_profissionalizacao?.length ? (
                          <p className="text-muted-foreground">Ações: {company.acoes_profissionalizacao.join(', ')}</p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                      <span>Cadastrado em {format(new Date(company.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                      <span>{company.termo_aceito ? '✅ Termo aceito' : '❌ Termo não aceito'}</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {company.status !== 'APROVADA' && (
                        <Button size="sm" onClick={() => updateStatus(company.id, 'APROVADA')}>Aprovar</Button>
                      )}
                      {company.status !== 'REJEITADA' && (
                        <Button size="sm" variant="destructive" onClick={() => updateStatus(company.id, 'REJEITADA')}>Rejeitar</Button>
                      )}
                      {company.status !== 'PENDENTE' && (
                        <Button size="sm" variant="outline" onClick={() => updateStatus(company.id, 'PENDENTE')}>Voltar para Pendente</Button>
                      )}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
