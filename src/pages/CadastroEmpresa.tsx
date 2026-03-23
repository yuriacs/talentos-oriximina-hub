import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, MapPin, Briefcase, Award, FileText, CheckCircle2, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// Masks
function maskCNPJ(v: string) {
  return v.replace(/\D/g, '').replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
}
function maskPhone(v: string) {
  const d = v.replace(/\D/g, '');
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').slice(0, 15);
}
function maskCEP(v: string) {
  return v.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);
}

const formSchema = z.object({
  razao_social: z.string().min(3, 'Razão social é obrigatória').max(200),
  nome_fantasia: z.string().min(2, 'Nome fantasia é obrigatório').max(200),
  cnpj: z.string().min(18, 'CNPJ inválido').max(18),
  endereco_rua: z.string().max(200).optional(),
  endereco_numero: z.string().max(20).optional(),
  endereco_bairro: z.string().max(100).optional(),
  endereco_cidade: z.string().max(100).optional(),
  endereco_estado: z.string().max(2).optional(),
  endereco_cep: z.string().max(9).optional(),
  responsavel_nome: z.string().min(3, 'Nome do responsável é obrigatório').max(150),
  responsavel_cargo: z.string().max(100).optional(),
  whatsapp: z.string().max(15).optional(),
  email: z.string().email('E-mail inválido').max(255),
  setor_atividade: z.string().optional(),
  porte: z.string().optional(),
  site_url: z.string().url('URL inválida').max(500).optional().or(z.literal('')),
  linkedin_url: z.string().max(500).optional(),
  instagram_url: z.string().max(500).optional(),
  modalidades_vaga: z.array(z.string()).optional(),
  faixa_salarial: z.string().optional(),
  turnos_trabalho: z.array(z.string()).optional(),
  acoes_profissionalizacao: z.array(z.string()).optional(),
  termo_aceito: z.literal(true, { errorMap: () => ({ message: 'Você deve aceitar o termo para continuar' }) }),
});

type FormData = z.infer<typeof formSchema>;

const STEPS = [
  { icon: Building2, label: 'Identificação' },
  { icon: Briefcase, label: 'Perfil' },
  { icon: MapPin, label: 'Contratação' },
  { icon: Award, label: 'Selo' },
  { icon: FileText, label: 'Termo' },
];

const SETORES = ['Tecnologia', 'Comércio', 'Indústria', 'Agropecuária', 'Saúde', 'Educação', 'Serviços', 'Outros'];
const PORTES = ['MEI', 'Microempresa', 'Média Empresa', 'Grande Empresa'];
const MODALIDADES = ['Jovem Aprendiz', 'Estágio', 'CLT (Efetivo)', 'Freelance / Projetos'];
const TURNOS = ['Manhã', 'Tarde', 'Noite', 'Flexível'];
const ACOES = [
  'Reserva de percentual de vagas para jovens de 14 a 29 anos',
  'Oferta de cursos de formação ou capacitação',
  'Parcerias com entidades de inclusão no mercado de trabalho',
  'Contribuições aos fundos municipais da juventude',
];

const TERMO_TEXT = `TERMO DE ADESÃO E COMPROMISSO – PROGRAMA EMPRESA AMIGA DA JUVENTUDE

Pelo presente instrumento, a PESSOA JURÍDICA devidamente identificada no cadastro deste portal, doravante denominada EMPRESA, declara sua adesão à plataforma de talentos de Oriximiná e manifesta seu interesse na obtenção do Selo Empresa Amiga da Juventude, sujeitando-se às seguintes cláusulas e condições:

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

export default function CadastroEmpresa() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      razao_social: '', nome_fantasia: '', cnpj: '',
      endereco_rua: '', endereco_numero: '', endereco_bairro: '',
      endereco_cidade: 'Oriximiná', endereco_estado: 'PA', endereco_cep: '',
      responsavel_nome: '', responsavel_cargo: '', whatsapp: '', email: '',
      setor_atividade: '', porte: '', site_url: '', linkedin_url: '', instagram_url: '',
      modalidades_vaga: [], faixa_salarial: '', turnos_trabalho: [],
      acoes_profissionalizacao: [], termo_aceito: undefined as unknown as true,
    },
    mode: 'onTouched',
  });

  const progressPercent = ((step + 1) / STEPS.length) * 100;

  const nextStep = async () => {
    // Validate current step fields before advancing
    const fieldsPerStep: (keyof FormData)[][] = [
      ['razao_social', 'nome_fantasia', 'cnpj', 'responsavel_nome', 'email'],
      ['setor_atividade', 'porte'],
      ['modalidades_vaga', 'turnos_trabalho'],
      ['acoes_profissionalizacao'],
      ['termo_aceito'],
    ];
    const valid = await form.trigger(fieldsPerStep[step]);
    if (valid) setStep(s => Math.min(s + 1, STEPS.length - 1));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const { error } = await supabase.from('companies' as any).insert({
        razao_social: data.razao_social,
        nome_fantasia: data.nome_fantasia,
        cnpj: data.cnpj.replace(/\D/g, ''),
        endereco_rua: data.endereco_rua || null,
        endereco_numero: data.endereco_numero || null,
        endereco_bairro: data.endereco_bairro || null,
        endereco_cidade: data.endereco_cidade || 'Oriximiná',
        endereco_estado: data.endereco_estado || 'PA',
        endereco_cep: data.endereco_cep?.replace(/\D/g, '') || null,
        responsavel_nome: data.responsavel_nome,
        responsavel_cargo: data.responsavel_cargo || null,
        whatsapp: data.whatsapp || null,
        email: data.email,
        setor_atividade: data.setor_atividade || null,
        porte: data.porte || null,
        site_url: data.site_url || null,
        linkedin_url: data.linkedin_url || null,
        instagram_url: data.instagram_url || null,
        modalidades_vaga: data.modalidades_vaga || [],
        faixa_salarial: data.faixa_salarial || null,
        turnos_trabalho: data.turnos_trabalho || [],
        acoes_profissionalizacao: data.acoes_profissionalizacao || [],
        termo_aceito: true,
        termo_aceito_em: new Date().toISOString(),
      } as any);
      if (error) throw error;
      setSuccess(true);
      toast({ title: 'Cadastro realizado!', description: 'Sua empresa foi cadastrada com sucesso.' });
    } catch (err: any) {
      toast({ title: 'Erro ao cadastrar', description: err.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto py-20 px-4 text-center">
          <div className="bg-card rounded-2xl shadow-lg p-10 border">
            <CheckCircle2 className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground mb-3">Cadastro Realizado com Sucesso!</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Sua empresa foi registrada na plataforma. A equipe da SEMJU entrará em contato para dar continuidade ao processo do Selo Empresa Amiga da Juventude.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button onClick={() => navigate('/')}>Voltar ao Início</Button>
              <Button variant="outline" onClick={() => navigate('/explorar')}>Explorar Talentos</Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-10 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Award className="h-4 w-4" />
            Programa Empresa Amiga da Juventude
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Cadastro de Empresa
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Conecte sua empresa aos jovens talentos de Oriximiná e contribua com o desenvolvimento profissional da juventude.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isDone = i < step;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  className={`flex flex-col items-center gap-1 transition-all ${i <= step ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isDone ? 'bg-primary border-primary text-primary-foreground' : isActive ? 'border-primary text-primary bg-primary/10' : 'border-border text-muted-foreground'}`}>
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
                </button>
              );
            })}
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Step 0 - Identificação */}
            {step === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary" /> Identificação Jurídica</CardTitle>
                  <CardDescription>Dados essenciais para emissão do diploma do Selo.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="razao_social" render={({ field }) => (
                      <FormItem><FormLabel>Razão Social *</FormLabel><FormControl><Input placeholder="Ex: Empresa XYZ Ltda" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="nome_fantasia" render={({ field }) => (
                      <FormItem><FormLabel>Nome Fantasia *</FormLabel><FormControl><Input placeholder="Ex: XYZ" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="cnpj" render={({ field }) => (
                      <FormItem><FormLabel>CNPJ *</FormLabel><FormControl><Input placeholder="00.000.000/0000-00" {...field} onChange={e => field.onChange(maskCNPJ(e.target.value))} maxLength={18} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>E-mail Corporativo *</FormLabel><FormControl><Input type="email" placeholder="contato@empresa.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="responsavel_nome" render={({ field }) => (
                      <FormItem><FormLabel>Responsável RH/Contato *</FormLabel><FormControl><Input placeholder="Nome completo" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="responsavel_cargo" render={({ field }) => (
                      <FormItem><FormLabel>Cargo</FormLabel><FormControl><Input placeholder="Ex: Gerente de RH" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="whatsapp" render={({ field }) => (
                    <FormItem><FormLabel>WhatsApp Corporativo</FormLabel><FormControl><Input placeholder="(93) 99999-9999" {...field} onChange={e => field.onChange(maskPhone(e.target.value))} maxLength={15} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <p className="text-sm font-medium text-foreground mt-2">Endereço</p>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="endereco_rua" render={({ field }) => (
                      <FormItem className="sm:col-span-2"><FormLabel>Rua / Travessa</FormLabel><FormControl><Input placeholder="Rua Principal" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="endereco_numero" render={({ field }) => (
                      <FormItem><FormLabel>Número</FormLabel><FormControl><Input placeholder="123" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <FormField control={form.control} name="endereco_bairro" render={({ field }) => (
                      <FormItem><FormLabel>Bairro</FormLabel><FormControl><Input placeholder="Centro" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="endereco_cidade" render={({ field }) => (
                      <FormItem><FormLabel>Cidade</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="endereco_cep" render={({ field }) => (
                      <FormItem><FormLabel>CEP</FormLabel><FormControl><Input placeholder="00000-000" {...field} onChange={e => field.onChange(maskCEP(e.target.value))} maxLength={9} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 1 - Perfil */}
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary" /> Perfil e Áreas de Atuação</CardTitle>
                  <CardDescription>Ajuda a cruzar dados com os interesses dos jovens.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="setor_atividade" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setor de Atividade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione o setor" /></SelectTrigger></FormControl>
                          <SelectContent>{SETORES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="porte" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Porte da Empresa</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecione o porte" /></SelectTrigger></FormControl>
                          <SelectContent>{PORTES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <p className="text-sm font-medium text-foreground mt-2">Links Sociais (opcional)</p>
                  <FormField control={form.control} name="site_url" render={({ field }) => (
                    <FormItem><FormLabel>Site</FormLabel><FormControl><Input placeholder="https://www.empresa.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="linkedin_url" render={({ field }) => (
                      <FormItem><FormLabel>LinkedIn</FormLabel><FormControl><Input placeholder="https://linkedin.com/company/..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="instagram_url" render={({ field }) => (
                      <FormItem><FormLabel>Instagram</FormLabel><FormControl><Input placeholder="@empresa" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2 - Contratação */}
            {step === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /> Intenção de Contratação</CardTitle>
                  <CardDescription>Informe como sua empresa pretende contribuir com a juventude.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <FormField control={form.control} name="modalidades_vaga" render={() => (
                    <FormItem>
                      <FormLabel>Modalidades de Vaga Oferecidas</FormLabel>
                      <div className="grid sm:grid-cols-2 gap-3 mt-2">
                        {MODALIDADES.map(m => (
                          <FormField key={m} control={form.control} name="modalidades_vaga" render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(m)}
                                  onCheckedChange={checked => {
                                    const v = field.value || [];
                                    field.onChange(checked ? [...v, m] : v.filter((x: string) => x !== m));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">{m}</FormLabel>
                            </FormItem>
                          )} />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="faixa_salarial" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Faixa Salarial Média</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="Até R$ 1.500">Até R$ 1.500</SelectItem>
                          <SelectItem value="R$ 1.500 - R$ 2.500">R$ 1.500 - R$ 2.500</SelectItem>
                          <SelectItem value="R$ 2.500 - R$ 4.000">R$ 2.500 - R$ 4.000</SelectItem>
                          <SelectItem value="Acima de R$ 4.000">Acima de R$ 4.000</SelectItem>
                          <SelectItem value="A combinar">A combinar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="turnos_trabalho" render={() => (
                    <FormItem>
                      <FormLabel>Turnos de Trabalho</FormLabel>
                      <div className="flex flex-wrap gap-4 mt-2">
                        {TURNOS.map(t => (
                          <FormField key={t} control={form.control} name="turnos_trabalho" render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(t)}
                                  onCheckedChange={checked => {
                                    const v = field.value || [];
                                    field.onChange(checked ? [...v, t] : v.filter((x: string) => x !== t));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">{t}</FormLabel>
                            </FormItem>
                          )} />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            )}

            {/* Step 3 - Selo */}
            {step === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-primary" /> Selo "Empresa Amiga da Juventude"</CardTitle>
                  <CardDescription>Ações de Profissionalização — Selecione ao menos uma ação que sua empresa realiza ou pretende realizar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField control={form.control} name="acoes_profissionalizacao" render={() => (
                    <FormItem>
                      <div className="grid gap-4 mt-2">
                        {ACOES.map(a => (
                          <FormField key={a} control={form.control} name="acoes_profissionalizacao" render={({ field }) => (
                            <FormItem className="flex items-start space-x-3 space-y-0 p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(a)}
                                  onCheckedChange={checked => {
                                    const v = field.value || [];
                                    field.onChange(checked ? [...v, a] : v.filter((x: string) => x !== a));
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal leading-relaxed cursor-pointer">{a}</FormLabel>
                            </FormItem>
                          )} />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            )}

            {/* Step 4 - Termo */}
            {step === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Termo de Adesão e Compromisso</CardTitle>
                  <CardDescription>Leia atentamente o termo abaixo antes de prosseguir.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  <ScrollArea className="h-72 rounded-lg border bg-muted/20 p-5">
                    <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed">{TERMO_TEXT}</pre>
                  </ScrollArea>
                  <FormField control={form.control} name="termo_aceito" render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0 p-4 rounded-lg border-2 border-primary/30 bg-primary/5">
                      <FormControl>
                        <Checkbox checked={field.value === true} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div>
                        <FormLabel className="font-semibold cursor-pointer">Li e aceito o Termo de Adesão e Compromisso</FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <Button type="button" variant="outline" onClick={prevStep} disabled={step === 0} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Anterior
              </Button>
              {step < STEPS.length - 1 ? (
                <Button type="button" onClick={nextStep} className="gap-2">
                  Próximo <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={submitting || !form.watch('termo_aceito')} className="gap-2">
                  <Send className="h-4 w-4" /> {submitting ? 'Cadastrando...' : 'Cadastrar Empresa'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
