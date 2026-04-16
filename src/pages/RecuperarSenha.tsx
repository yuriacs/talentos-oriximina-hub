import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Mail, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export default function RecuperarSenha() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error('Erro ao enviar e-mail', { description: error.message });
    } else {
      setSent(true);
      toast.success('E-mail enviado com sucesso!');
    }
    setIsLoading(false);
  };

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-bg">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
            </Link>
            <h1 className="font-display text-2xl font-bold">Recuperar senha</h1>
            <p className="text-muted-foreground mt-1">
              {sent
                ? 'Verifique sua caixa de entrada'
                : 'Informe seu e-mail para redefinir sua senha'}
            </p>
          </div>

          <Card className="border-border/50">
            <CardContent className="pt-6">
              {sent ? (
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enviamos um link de recuperação para <strong>{email}</strong>. Clique no link do e-mail para criar uma nova senha.
                  </p>
                  <Button variant="outline" className="w-full gap-2" onClick={() => setSent(false)}>
                    Enviar novamente
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10" required />
                    </div>
                  </div>

                  <Button type="submit" className="w-full gradient-bg hover:opacity-90" disabled={isLoading}>
                    {isLoading ? 'Enviando...' : 'Enviar link de recuperação'}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link to="/login" className="text-sm text-primary font-medium hover:underline inline-flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" /> Voltar para o login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
