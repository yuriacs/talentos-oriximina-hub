import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Mail, Lock, User, ArrowRight, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

const benefits = [
  'Portfólio profissional gratuito',
  'Conecte-se com outros jovens',
  'Gere currículo em PDF',
  'Destaque suas competências',
];

export default function Cadastro() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (!acceptTerms) {
      toast.error('Você precisa aceitar os termos de uso');
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(formData.email, formData.password, formData.fullName);

    if (error) {
      toast.error('Erro ao criar conta', { description: error.message });
    } else {
      toast.success('Conta criada com sucesso!', {
        description: 'Vamos personalizar seu perfil!'
      });
      navigate('/meu-perfil');
    }
    setIsLoading(false);
  };

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Info */}
          <div className="hidden lg:block">
            <div className="max-w-md">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-bg">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-display text-2xl font-bold gradient-text">BTJO</span>
              </Link>
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
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="text-center mb-8 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-bg">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
              </Link>
              <h1 className="font-display text-2xl font-bold">Criar Conta</h1>
              <p className="text-muted-foreground mt-1">Comece a construir seu portfólio</p>
            </div>

            <Card className="border-border/50">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="fullName" name="fullName" placeholder="Seu nome completo" value={formData.fullName} onChange={handleChange} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" name="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange} className="pl-10" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 8 caracteres" value={formData.password} onChange={handleChange} className="pl-10 pr-10" minLength={8} required />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="Repita sua senha" value={formData.confirmPassword} onChange={handleChange} className="pl-10" required />
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 pt-2">
                    <Checkbox id="terms" checked={acceptTerms} onCheckedChange={(checked) => setAcceptTerms(checked as boolean)} />
                    <Label htmlFor="terms" className="text-sm font-normal leading-snug cursor-pointer">
                      Concordo com os{' '}
                      <Link to="/termos" className="text-primary hover:underline">Termos de Uso</Link>{' '}e{' '}
                      <Link to="/privacidade" className="text-primary hover:underline">Política de Privacidade</Link>
                    </Label>
                  </div>
                  <Button type="submit" className="w-full gradient-bg hover:opacity-90 gap-2" disabled={isLoading}>
                    {isLoading ? 'Criando conta...' : <><span>Criar Minha Conta</span><ArrowRight className="h-4 w-4" /></>}
                  </Button>
                </form>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">ou</span></div>
                </div>

                <GoogleSignInButton />

                <div className="mt-6 text-center text-sm">
                  <span className="text-muted-foreground">Já tem uma conta? </span>
                  <Link to="/login" className="text-primary font-medium hover:underline">Fazer login</Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
