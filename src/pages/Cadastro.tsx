import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check, MailCheck, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import { getRedirectPath, withRedirect } from '@/lib/redirect';
import { cn } from '@/lib/utils';

const benefits = [
  'Portfólio profissional gratuito',
  'Seja encontrado por empresas de Oriximiná',
  'Gere currículo em PDF',
  'Destaque suas competências',
];

const MIN_AGE = 18;
const MIN_PASSWORD = 8;

function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

type Field = 'fullName' | 'email' | 'password' | 'confirmPassword' | 'birthDate' | 'terms';

function validate(form: Record<Exclude<Field, 'terms'>, string>, acceptTerms: boolean): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  if (form.fullName.trim().split(/\s+/).length < 2) errors.fullName = 'Informe nome e sobrenome';
  if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errors.email = 'Informe um e-mail válido';
  if (form.password.length < MIN_PASSWORD) errors.password = `A senha precisa ter pelo menos ${MIN_PASSWORD} caracteres`;
  if (form.confirmPassword !== form.password) errors.confirmPassword = 'As senhas não coincidem';
  if (!form.birthDate) {
    errors.birthDate = 'Informe sua data de nascimento';
  } else {
    const age = calculateAge(form.birthDate);
    if (isNaN(age) || age < 0 || age > 120) errors.birthDate = 'Data de nascimento inválida';
    else if (age < MIN_AGE) errors.birthDate = `É necessário ter pelo menos ${MIN_AGE} anos para criar uma conta`;
  }
  if (!acceptTerms) errors.terms = 'Aceite os termos para continuar';
  return errors;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export default function Cadastro() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '', birthDate: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmEmailSentTo, setConfirmEmailSentTo] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const redirect = getRedirectPath(useLocation().search);
  const forCompany = redirect === '/cadastro-empresa';

  const errors = validate(formData, acceptTerms);
  // Erros aparecem depois da primeira tentativa de envio, para não assustar quem ainda está digitando
  const shown = submitted ? errors : {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      document.getElementById(firstError)?.focus();
      return;
    }

    setIsLoading(true);
    const email = formData.email.trim().toLowerCase();
    const { error, needsConfirmation } = await signUp(email, formData.password, formData.fullName.trim(), redirect);
    setIsLoading(false);

    if (error) {
      const alreadyExists = /already|registered|exists/i.test(error.message);
      toast.error(alreadyExists ? 'Este e-mail já tem uma conta' : 'Erro ao criar conta', {
        description: alreadyExists ? 'Faça login ou use "Esqueceu a senha?".' : error.message,
      });
      return;
    }
    if (needsConfirmation) {
      setConfirmEmailSentTo(email);
      return;
    }
    toast.success('Conta criada com sucesso!');
    navigate(redirect ?? '/meu-perfil');
  };

  if (confirmEmailSentTo) {
    return (
      <Layout hideFooter>
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md text-center">
            <CardContent className="pt-8 pb-8 space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-7 w-7 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold">Confirme seu e-mail</h1>
              <p className="text-muted-foreground">
                Enviamos um link de confirmação para <strong className="text-foreground">{confirmEmailSentTo}</strong>.
                Abra o e-mail e clique no link para ativar sua conta.
              </p>
              <p className="text-xs text-muted-foreground">Não chegou? Confira a caixa de spam ou lixo eletrônico.</p>
              <Button asChild className="w-full">
                <Link to={withRedirect('/login', redirect)}>Já confirmei, quero entrar</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Info */}
          <div className="hidden lg:block">
            <div className="max-w-md">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-bg">
                  {forCompany ? <Building2 className="h-6 w-6 text-primary-foreground" /> : <Sparkles className="h-6 w-6 text-primary-foreground" />}
                </div>
                <span className="font-display text-2xl font-bold gradient-text">Observatório</span>
              </Link>
              {forCompany ? (
                <>
                  <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Crie a conta do responsável pela empresa</h1>
                  <p className="text-muted-foreground text-lg mb-8">
                    Use o e-mail de quem vai cuidar do cadastro. Logo depois você volta para preencher os dados da empresa.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">Crie seu perfil profissional</h1>
                  <p className="text-muted-foreground text-lg mb-8">Junte-se aos jovens talentos de Oriximiná e mostre suas competências para o mundo.</p>
                  <div className="space-y-4">
                    {benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full gradient-bg">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <span className="text-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="text-center mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-bg">
                  {forCompany ? <Building2 className="h-6 w-6 text-primary-foreground" /> : <Sparkles className="h-6 w-6 text-primary-foreground" />}
                </div>
              </Link>
              <h1 className="font-display text-2xl font-bold">{forCompany ? 'Conta do responsável' : 'Criar Conta'}</h1>
              <p className="text-muted-foreground mt-1">
                {forCompany ? 'Depois você volta para cadastrar a empresa' : 'Comece a construir seu portfólio'}
              </p>
            </div>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <GoogleSignInButton redirectPath={redirect ?? '/meu-perfil'} />

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">ou com e-mail</span></div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="fullName" name="fullName" autoComplete="name" placeholder="Seu nome e sobrenome" value={formData.fullName} onChange={handleChange} className={cn('pl-10', shown.fullName && 'border-destructive')} aria-invalid={!!shown.fullName} />
                    </div>
                    <FieldError message={shown.fullName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" name="email" type="email" autoComplete="email" inputMode="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} className={cn('pl-10', shown.email && 'border-destructive')} aria-invalid={!!shown.email} />
                    </div>
                    <FieldError message={shown.email} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder={`Mínimo ${MIN_PASSWORD} caracteres`} value={formData.password} onChange={handleChange} className={cn('pl-10 pr-10', shown.password && 'border-destructive')} aria-invalid={!!shown.password} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPassword ? 'Esconder senha' : 'Mostrar senha'}>
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {shown.password ? (
                      <FieldError message={shown.password} />
                    ) : (
                      <p className={cn('text-xs', formData.password.length >= MIN_PASSWORD ? 'text-green-600' : 'text-muted-foreground')}>
                        {formData.password.length >= MIN_PASSWORD ? '✓ Tamanho ok' : `${formData.password.length}/${MIN_PASSWORD} caracteres`}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Repita sua senha" value={formData.confirmPassword} onChange={handleChange} className={cn('pl-10', shown.confirmPassword && 'border-destructive')} aria-invalid={!!shown.confirmPassword} />
                    </div>
                    <FieldError message={shown.confirmPassword} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de nascimento</Label>
                    <Input
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                      className={cn(shown.birthDate && 'border-destructive')}
                      aria-invalid={!!shown.birthDate}
                    />
                    {shown.birthDate ? (
                      <FieldError message={shown.birthDate} />
                    ) : (
                      <p className="text-xs text-muted-foreground">É necessário ter {MIN_AGE} anos ou mais para se cadastrar.</p>
                    )}
                  </div>
                  <div className="space-y-1 pt-2">
                    <div className="flex items-start space-x-2">
                      <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked === true)} aria-invalid={!!shown.terms} />
                      <Label htmlFor="terms" className="text-sm font-normal leading-snug cursor-pointer">
                        Declaro que as informações são verdadeiras e concordo com os{' '}
                        <Link to="/termos" target="_blank" className="text-primary hover:underline">Termos de Uso</Link>{' '}e a{' '}
                        <Link to="/privacidade" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>
                      </Label>
                    </div>
                    <FieldError message={shown.terms} />
                  </div>
                  <Button type="submit" className="w-full gradient-bg hover:opacity-90 gap-2" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : <><span>Criar minha conta</span><ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Já tem uma conta? </span>
                  <Link to={withRedirect('/login', redirect)} className="text-primary font-medium hover:underline">Fazer login</Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
