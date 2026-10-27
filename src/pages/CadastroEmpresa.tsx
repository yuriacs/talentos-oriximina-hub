import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useForm, type FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Building2, Phone, Briefcase, Award, FileText, CheckCircle2, ArrowLeft, ArrowRight, Send, ImagePlus, X, Loader2, Clock, Check,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import {
  isValidCNPJ, isValidPhone, isValidUrl, maskCEP, maskCNPJ, maskPhone, normalizeInstagram, normalizeUrl, onlyDigits,
} from '@/lib/br';
import { withRedirect } from '@/lib/redirect';

const formSchema = z.object({
  nome_fantasia: z.string().trim().min(2, 'Informe o nome da empresa').max(200),
  razao_social: z.string().trim().min(3, 'Informe a razão social (está no cartão do CNPJ)').max(200),
  cnpj: z.string().refine(isValidCNPJ, 'CNPJ inválido. Confira os 14 números'),
  setor_atividade: z.string().min(1, 'Selecione o setor'),
  porte: z.string().min(1, 'Selecione o porte'),
  responsavel_nome: z.string().trim().min(3, 'Informe o nome de quem vai falar com os jovens').max(150),
  responsavel_cargo: z.string().max(100).optional(),
  email: z.string().trim().email('E-mail inválido').max(255),
  whatsapp: z.string().refine(v => !v || isValidPhone(v), 'Informe DDD + número, ex.: (93) 99999-9999').optional(),
  endereco_rua: z.string().max(200).optional(),
  endereco_numero: z.string().max(20).optional(),
  endereco_bairro: z.string().max(100).optional(),
  endereco_cidade: z.string().max(100).optional(),
  endereco_estado: z.string().max(2).optional(),
  endereco_cep: z.string().refine(v => !v || onlyDigits(v).length === 8, 'CEP com 8 números').optional(),
  site_url: z.string().max(500).refine(isValidUrl, 'Endereço inválido, ex.: www.empresa.com.br').optional(),
  instagram_url: z.string().max(500).optional(),
  linkedin_url: z.string().max(500).refine(isValidUrl, 'Cole o link da página da empresa no LinkedIn').optional(),
  modalidades_vaga: z.array(z.string()).min(1, 'Escolha pelo menos uma modalidade'),
  turnos_trabalho: z.array(z.string()).optional(),
  faixa_salarial: z.string().optional(),
  acoes_profissionalizacao: z.array(z.string()).min(1, 'Escolha pelo menos uma ação para concorrer ao Selo'),
  termo_aceito: z.literal(true, { errorMap: () => ({ message: 'Você precisa aceitar o termo para enviar' }) }),
});

type FormData = z.infer<typeof formSchema>;

const STEPS: { icon: typeof Building2; label: string; title: string; description: string; fields: (keyof FormData)[] }[] = [
  {
    icon: Building2, label: 'Empresa', title: 'Sobre a empresa',
    description: 'Os dados do cartão CNPJ. Eles aparecem no certificado do Selo.',
    fields: ['nome_fantasia', 'razao_social', 'cnpj', 'setor_atividade', 'porte'],
  },
  {
    icon: Phone, label: 'Contato', title: 'Contato e endereço',
    description: 'Quem os jovens e a SEMJU devem procurar.',
    fields: ['responsavel_nome', 'responsavel_cargo', 'email', 'whatsapp', 'endereco_cep', 'site_url', 'instagram_url', 'linkedin_url'],
  },
  {
    icon: Briefcase, label: 'Vagas', title: 'Que oportunidades vocês oferecem?',
    description: 'Ajuda a mostrar sua empresa para os jovens com o perfil certo.',
    fields: ['modalidades_vaga', 'turnos_trabalho', 'faixa_salarial'],
  },
  {
    icon: Award, label: 'Selo', title: 'Selo Empresa Amiga da Juventude',
    description: 'Marque o que sua empresa já faz ou pretende fazer (Lei nº 9.637/2025, Art. 2º).',
    fields: ['acoes_profissionalizacao'],
  },
  {
    icon: FileText, label: 'Revisão', title: 'Revise e aceite o termo',
    description: 'Confira os dados. Se algo estiver errado, volte e corrija antes de enviar.',
    fields: ['termo_aceito'],
  },
];

const SETORES = ['Comércio', 'Serviços', 'Indústria', 'Agropecuária', 'Mineração', 'Tecnologia', 'Saúde', 'Educação', 'Turismo e Alimentação', 'Construção', 'Outros'];
const PORTES = ['MEI', 'Microempresa', 'Pequena Empresa', 'Média Empresa', 'Grande Empresa'];
const MODALIDADES = ['Jovem Aprendiz', 'Estágio', 'CLT (Efetivo)', 'Freelance / Projetos', 'Temporário'];
const TURNOS = ['Manhã', 'Tarde', 'Noite', 'Flexível'];
const FAIXAS = ['Até R$ 1.500', 'R$ 1.500 - R$ 2.500', 'R$ 2.500 - R$ 4.000', 'Acima de R$ 4.000', 'A combinar'];
const ACOES = [
  'Reserva de percentual de vagas para jovens de 14 a 29 anos',
  'Oferta de cursos de formação ou capacitação',
  'Parcerias com entidades de inclusão no mercado de trabalho',
  'Contribuições aos fundos municipais da juventude',
];

const STATUS_INFO: Record<string, { label: string; text: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  PENDENTE: { label: 'Em análise', text: 'A equipe da SEMJU está analisando o cadastro e vai entrar em contato pelo e-mail ou WhatsApp informado.', variant: 'secondary' },
  APROVADA: { label: 'Aprovada', text: 'Sua empresa já aparece na página Empresas Amigas da Juventude.', variant: 'default' },
  REJEITADA: { label: 'Não aprovada', text: 'Fale com a SEMJU para entender o que falta e atualizar o cadastro.', variant: 'destructive' },
};

const TERMO_TEXT = `TERMO DE ADESÃO E COMPROMISSO – PROGRAMA EMPRESA AMIGA DA JUVENTUDE

Pelo presente instrumento, a PESSOA JURÍDICA devidamente identificada no cadastro deste portal, doravante denominada EMPRESA, declara sua adesão ao Observatório da Juventude e manifesta seu interesse na obtenção do Selo Empresa Amiga da Juventude, sujeitando-se às seguintes cláusulas e condições:

1. DO OBJETO
1.1. O presente termo visa formalizar a participação da EMPRESA na plataforma de recrutamento gerida pela SEMJU, visando a profissionalização de adolescentes e jovens entre 14 e 29 anos no município de Oriximiná.

2. DOS COMPROMISSOS DA EMPRESA
2.1. A EMPRESA compromete-se a manter seu perfil atualizado, incluindo áreas de atuação, turnos disponíveis e pretensão salarial oferecida.
2.2. Para fins de obtenção do Selo, a EMPRESA deverá atender a pelo menos uma das condições previstas no Art. 2º da Lei nº 9.637/2025, tais como:
• Reservar percentual de vagas para jovens.
• Oferecer cursos de formação e capacitação profissional.
• Manter parcerias para programas de Jovem Aprendiz ou realizar contribuições aos fundos municipais da juventude.

3. DO ACESSO AOS DADOS E CONTATO
3.1. A EMPRESA declara estar ciente de que terá acesso aos dados biográficos, socioeducacionais, competências e vídeos de apresentação dos jovens cadastrados.
3.2. O contato com o candidato poderá ser realizado diretamente pela EMPRESA através das informações de WhatsApp e portfólio disponibilizadas pelo site.
3.3. A EMPRESA obriga-se a utilizar os dados dos candidatos exclusivamente para fins de recrutamento e seleção, respeitando a privacidade dos usuários.

4. DA CONCESSÃO DO SELO E BENEFÍCIOS
4.1. A oferta de vagas e a efetivação de contratações via plataforma servirão como base para a outorga do Selo Empresa Amiga da Juventude pela Prefeitura Municipal de Oriximiná.
4.2. Após a concessão, a EMPRESA poderá utilizar o Selo em suas campanhas publicitárias e materiais institucionais por um período de 2 (dois) anos.
4.3. A EMPRESA reconhece que a manutenção do Selo e o acesso a eventuais benefícios ou isenções fiscais dependem do cumprimento contínuo da legislação vigente.

5. DISPOSIÇÕES GERAIS
5.1. A adesão a este termo é gratuita e realizada de forma digital no ato do cadastro.
5.2. Este termo entra em vigor na data de aceite digital, em conformidade com a publicação da Lei nº 9.637/2025 em 27 de outubro de 2025.`;

/** Seleção múltipla em "chips" grandes, fáceis de tocar no celular. */
function ChipGroup({ options, value, onChange, columns = false }: {
  options: string[];
  value: string[] | undefined;
  onChange: (v: string[]) => void;
  columns?: boolean;
}) {
  const selected = value ?? [];
  return (
    <div className={cn('mt-2 gap-2', columns ? 'grid sm:grid-cols-2' : 'flex flex-wrap')}>
      {options.map(o => {
        const on = selected.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(on ? selected.filter(x => x !== o) : [...selected, o])}
            className={cn(
              'flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm text-left transition-colors',
              on ? 'border-primary bg-primary/10 text-foreground' : 'border-border hover:bg-muted',
            )}
          >
            <span className={cn('flex h-4 w-4 shrink-0 items-center justify-center rounded border', on ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground/40')}>
              {on && <Check className="h-3 w-3" />}
            </span>
            {o}
          </button>
        );
      })}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string | string[] | null }) {
  const text = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div className="grid grid-cols-[8rem_1fr] gap-2 py-1.5 text-sm border-b last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="break-words">{text || <span className="text-muted-foreground">Não informado</span>}</span>
    </div>
  );
}

export default function CadastroEmpresa() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [existing, setExisting] = useState<{ nome_fantasia: string; status: string } | null | undefined>(undefined);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome_fantasia: '', razao_social: '', cnpj: '', setor_atividade: '', porte: '',
      responsavel_nome: '', responsavel_cargo: '', email: '', whatsapp: '',
      endereco_rua: '', endereco_numero: '', endereco_bairro: '',
      endereco_cidade: 'Oriximiná', endereco_estado: 'PA', endereco_cep: '',
      site_url: '', instagram_url: '', linkedin_url: '',
      modalidades_vaga: [], turnos_trabalho: [], faixa_salarial: '',
      acoes_profissionalizacao: [], termo_aceito: undefined as unknown as true,
    },
    mode: 'onTouched',
  });

  // Uma empresa por conta: quem já cadastrou vê a situação do cadastro
  useEffect(() => {
    if (!user) return;
    supabase
      .from('companies')
      .select('nome_fantasia, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setExisting(data ?? null));
  }, [user]);

  // Sugere o e-mail da conta como e-mail de contato
  useEffect(() => {
    if (user?.email && !form.getValues('email')) form.setValue('email', user.email);
  }, [user, form]);

  const goTo = (next: number) => {
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const nextStep = async () => {
    const valid = await form.trigger(STEPS[step].fields);
    if (valid) goTo(Math.min(step + 1, STEPS.length - 1));
    else toast({ title: 'Confira os campos destacados', description: 'Há informações faltando ou inválidas nesta etapa.', variant: 'destructive' });
  };
  const prevStep = () => goTo(Math.max(step - 1, 0));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Arquivo inválido', description: 'Selecione um arquivo de imagem.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'A imagem deve ter no máximo 2MB.', variant: 'destructive' });
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  // Erro numa etapa anterior: volta para ela em vez de "não fazer nada"
  const onInvalid = (errors: FieldErrors<FormData>) => {
    const target = STEPS.findIndex(s => s.fields.some(f => errors[f]));
    if (target >= 0 && target !== step) goTo(target);
    toast({ title: 'Faltam informações', description: `Confira a etapa "${STEPS[Math.max(target, 0)].label}".`, variant: 'destructive' });
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setSubmitting(true);
    try {
      let logo_url: string | null = null;
      if (logoFile) {
        const ext = logoFile.name.split('.').pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('company-logos').upload(path, logoFile);
        if (uploadError) throw new Error('Não foi possível enviar o logotipo. Tente uma imagem menor ou envie sem logo.');
        logo_url = supabase.storage.from('company-logos').getPublicUrl(path).data.publicUrl;
      }

      const { error } = await supabase.from('companies').insert({
        user_id: user.id,
        logo_url,
        razao_social: data.razao_social.trim(),
        nome_fantasia: data.nome_fantasia.trim(),
        cnpj: onlyDigits(data.cnpj),
        endereco_rua: data.endereco_rua || null,
        endereco_numero: data.endereco_numero || null,
        endereco_bairro: data.endereco_bairro || null,
        endereco_cidade: data.endereco_cidade || 'Oriximiná',
        endereco_estado: data.endereco_estado || 'PA',
        endereco_cep: data.endereco_cep ? onlyDigits(data.endereco_cep) : null,
        responsavel_nome: data.responsavel_nome.trim(),
        responsavel_cargo: data.responsavel_cargo || null,
        whatsapp: data.whatsapp || null,
        email: data.email.trim().toLowerCase(),
        setor_atividade: data.setor_atividade,
        porte: data.porte,
        site_url: normalizeUrl(data.site_url ?? '') || null,
        linkedin_url: normalizeUrl(data.linkedin_url ?? '') || null,
        instagram_url: normalizeInstagram(data.instagram_url ?? '') || null,
        modalidades_vaga: data.modalidades_vaga,
        faixa_salarial: data.faixa_salarial || null,
        turnos_trabalho: data.turnos_trabalho ?? [],
        acoes_profissionalizacao: data.acoes_profissionalizacao,
        termo_aceito: true,
        termo_aceito_em: new Date().toISOString(),
      });
      if (error) {
        if (error.code === '23505') {
          goTo(0);
          form.setError('cnpj', { message: 'Este CNPJ já está cadastrado. Fale com a SEMJU se precisar atualizar os dados.' });
          throw new Error('Este CNPJ já está cadastrado.');
        }
        throw error;
      }
      setSuccess(true);
      window.scrollTo({ top: 0 });
    } catch (err: any) {
      toast({ title: 'Erro ao cadastrar', description: err.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (user && existing === undefined)) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto py-16 px-4 text-center">
          <div className="bg-card rounded-2xl shadow-lg p-8 sm:p-10 border">
            <Building2 className="h-14 w-14 text-primary mx-auto mb-5" />
            <h1 className="text-2xl font-bold text-foreground mb-3">Cadastre sua empresa</h1>
            <p className="text-muted-foreground mb-2 max-w-md mx-auto">
              Primeiro, entre ou crie uma conta para a pessoa responsável pelo cadastro. Leva 1 minuto.
            </p>
            <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
              Depois você volta direto para esta página e preenche os dados da empresa em 5 etapas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg"><Link to={withRedirect('/cadastro', '/cadastro-empresa')}>Criar conta</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to={withRedirect('/login', '/cadastro-empresa')}>Já tenho conta</Link></Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (existing && !success) {
    const info = STATUS_INFO[existing.status] ?? STATUS_INFO.PENDENTE;
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto py-16 px-4 text-center">
          <div className="bg-card rounded-2xl shadow-lg p-8 sm:p-10 border space-y-4">
            <Building2 className="h-14 w-14 text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">{existing.nome_fantasia} já está cadastrada</h1>
            <Badge variant={info.variant} className="gap-1"><Clock className="h-3 w-3" />{info.label}</Badge>
            <p className="text-muted-foreground max-w-md mx-auto">{info.text}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button onClick={() => navigate('/empresas-amigas')}>Ver Empresas Amigas</Button>
              <Button variant="outline" onClick={() => navigate('/explorar')}>Explorar talentos</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (success) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto py-16 px-4 text-center">
          <div className="bg-card rounded-2xl shadow-lg p-8 sm:p-10 border">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto mb-5" />
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">Cadastro enviado!</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              A equipe da SEMJU vai analisar os dados e entrar em contato para dar continuidade ao Selo Empresa Amiga da Juventude.
              Enquanto isso, você já pode conhecer os jovens talentos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => navigate('/explorar')}>Explorar talentos</Button>
              <Button variant="outline" onClick={() => navigate('/')}>Voltar ao início</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const current = STEPS[step];
  const CurrentIcon = current.icon;
  const values = form.watch();
  const isLast = step === STEPS.length - 1;

  return (
    <Layout>
      <div ref={topRef} className="container max-w-3xl mx-auto py-8 sm:py-10 px-4 scroll-mt-20">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Award className="h-4 w-4" />
            Programa Empresa Amiga da Juventude
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Cadastro de Empresa</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Conecte sua empresa aos jovens talentos de Oriximiná. Campos com * são obrigatórios.
          </p>
        </div>

        {/* Etapas */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => i < step && goTo(i)}
                  disabled={i > step}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`Etapa ${i + 1}: ${s.label}`}
                  className="flex flex-col items-center gap-1 disabled:opacity-50"
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                    isDone ? 'bg-primary border-primary text-primary-foreground' : isActive ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground',
                  )}>
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={cn('text-xs font-medium hidden sm:block', isActive ? 'text-primary' : 'text-muted-foreground')}>{s.label}</span>
                </button>
              );
            })}
          </div>
          <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
          <p className="mt-2 text-sm text-muted-foreground sm:hidden">Etapa {step + 1} de {STEPS.length}: <span className="font-medium text-foreground">{current.label}</span></p>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
            onKeyDown={e => {
              // Enter num campo avança a etapa em vez de tentar enviar o formulário inteiro
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && !isLast) {
                e.preventDefault();
                nextStep();
              }
            }}
            noValidate
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl"><CurrentIcon className="h-5 w-5 text-primary" /> {current.title}</CardTitle>
                <CardDescription>{current.description}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                {step === 0 && (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Logotipo (opcional)</Label>
                      <p className="text-xs text-muted-foreground mb-2">PNG ou JPG até 2MB. Aparece na página Empresas Amigas.</p>
                      <div className="flex items-center gap-4">
                        {logoPreview ? (
                          <div className="relative">
                            <img src={logoPreview} alt="Prévia do logotipo" className="w-20 h-20 rounded-xl object-cover border" />
                            <button type="button" onClick={removeLogo} aria-label="Remover logotipo" className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            <ImagePlus className="h-6 w-6" />
                            <span className="text-[11px]">Enviar logo</span>
                          </button>
                        )}
                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                        {logoPreview && (
                          <Button type="button" variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>Trocar imagem</Button>
                        )}
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="nome_fantasia" render={({ field }) => (
                        <FormItem><FormLabel>Nome da empresa *</FormLabel><FormControl><Input placeholder="Como os clientes conhecem" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="cnpj" render={({ field }) => (
                        <FormItem><FormLabel>CNPJ *</FormLabel><FormControl><Input inputMode="numeric" placeholder="00.000.000/0000-00" {...field} onChange={e => field.onChange(maskCNPJ(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="razao_social" render={({ field }) => (
                      <FormItem><FormLabel>Razão social *</FormLabel><FormControl><Input placeholder="Ex.: Comércio XYZ Ltda" {...field} /></FormControl><FormDescription>O nome oficial que está no cartão do CNPJ.</FormDescription><FormMessage /></FormItem>
                    )} />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="setor_atividade" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Setor *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger></FormControl>
                            <SelectContent>{SETORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="porte" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Porte *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Selecione o porte" /></SelectTrigger></FormControl>
                            <SelectContent>{PORTES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="responsavel_nome" render={({ field }) => (
                        <FormItem><FormLabel>Responsável pelo contato *</FormLabel><FormControl><Input autoComplete="name" placeholder="Nome completo" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="responsavel_cargo" render={({ field }) => (
                        <FormItem><FormLabel>Cargo</FormLabel><FormControl><Input placeholder="Ex.: Gerente de RH" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>E-mail de contato *</FormLabel><FormControl><Input type="email" inputMode="email" autoComplete="email" placeholder="contato@empresa.com" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="whatsapp" render={({ field }) => (
                        <FormItem><FormLabel>WhatsApp</FormLabel><FormControl><Input type="tel" inputMode="tel" autoComplete="tel" placeholder="(93) 99999-9999" {...field} onChange={e => field.onChange(maskPhone(e.target.value))} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>

                    <fieldset className="grid gap-4 rounded-lg border p-4">
                      <legend className="px-1 text-sm font-medium">Endereço (opcional)</legend>
                      <div className="grid grid-cols-3 gap-4">
                        <FormField control={form.control} name="endereco_rua" render={({ field }) => (
                          <FormItem className="col-span-2"><FormLabel>Rua / Travessa</FormLabel><FormControl><Input autoComplete="address-line1" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="endereco_numero" render={({ field }) => (
                          <FormItem><FormLabel>Número</FormLabel><FormControl><Input inputMode="numeric" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <FormField control={form.control} name="endereco_bairro" render={({ field }) => (
                          <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="endereco_cidade" render={({ field }) => (
                          <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input autoComplete="address-level2" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="endereco_cep" render={({ field }) => (
                          <FormItem><FormLabel>CEP</FormLabel><FormControl><Input inputMode="numeric" autoComplete="postal-code" placeholder="68270-000" {...field} onChange={e => field.onChange(maskCEP(e.target.value))} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </fieldset>

                    <fieldset className="grid gap-4 rounded-lg border p-4">
                      <legend className="px-1 text-sm font-medium">Na internet (opcional)</legend>
                      <FormField control={form.control} name="site_url" render={({ field }) => (
                        <FormItem><FormLabel>Site</FormLabel><FormControl><Input inputMode="url" placeholder="www.empresa.com.br" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="instagram_url" render={({ field }) => (
                          <FormItem><FormLabel>Instagram</FormLabel><FormControl><Input placeholder="@empresa" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="linkedin_url" render={({ field }) => (
                          <FormItem><FormLabel>LinkedIn</FormLabel><FormControl><Input inputMode="url" placeholder="linkedin.com/company/empresa" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                      </div>
                    </fieldset>
                  </>
                )}

                {step === 2 && (
                  <>
                    <FormField control={form.control} name="modalidades_vaga" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipos de vaga *</FormLabel>
                        <ChipGroup options={MODALIDADES} value={field.value} onChange={field.onChange} columns />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="turnos_trabalho" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Turnos de trabalho</FormLabel>
                        <ChipGroup options={TURNOS} value={field.value} onChange={field.onChange} />
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="faixa_salarial" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Faixa salarial média</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                          <SelectContent>{FAIXAS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </>
                )}

                {step === 3 && (
                  <FormField control={form.control} name="acoes_profissionalizacao" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ações de profissionalização *</FormLabel>
                      <ChipGroup options={ACOES} value={field.value} onChange={field.onChange} columns />
                      <FormDescription>Basta uma para concorrer ao Selo.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                {step === 4 && (
                  <>
                    <div className="rounded-lg border p-4">
                      <div className="flex items-center gap-3 mb-3">
                        {logoPreview && <img src={logoPreview} alt="" className="w-10 h-10 rounded-lg object-cover border" />}
                        <p className="font-semibold">{values.nome_fantasia}</p>
                      </div>
                      <SummaryRow label="Razão social" value={values.razao_social} />
                      <SummaryRow label="CNPJ" value={values.cnpj} />
                      <SummaryRow label="Setor / porte" value={[values.setor_atividade, values.porte].filter(Boolean).join(' · ')} />
                      <SummaryRow label="Responsável" value={[values.responsavel_nome, values.responsavel_cargo].filter(Boolean).join(' · ')} />
                      <SummaryRow label="Contato" value={[values.email, values.whatsapp].filter(Boolean).join(' · ')} />
                      <SummaryRow label="Vagas" value={values.modalidades_vaga} />
                      <SummaryRow label="Selo" value={values.acoes_profissionalizacao} />
                    </div>
                    <ScrollArea className="h-64 rounded-lg border bg-muted/20 p-4">
                      <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed">{TERMO_TEXT}</pre>
                    </ScrollArea>
                    <FormField control={form.control} name="termo_aceito" render={({ field }) => (
                      <FormItem className="flex items-start space-x-3 space-y-0 p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
                        <FormControl>
                          <Checkbox checked={field.value === true} onCheckedChange={v => field.onChange(v === true ? true : undefined)} />
                        </FormControl>
                        <div className="space-y-1">
                          <FormLabel className="font-semibold cursor-pointer">Li e aceito o Termo de Adesão e Compromisso *</FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )} />
                  </>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-6">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={prevStep} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </Button>
              ) : <span className="hidden sm:block" />}
              {isLast ? (
                <Button type="submit" disabled={submitting} className="gap-2">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? 'Enviando...' : 'Enviar cadastro'}
                </Button>
              ) : (
                <Button type="button" onClick={nextStep} className="gap-2">
                  Continuar <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
