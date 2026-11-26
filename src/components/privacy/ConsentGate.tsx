import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MIN_AGE, TERMS_VERSION, isMissingInDatabase } from '@/lib/privacy';

// Páginas que precisam ficar legíveis enquanto a pessoa decide
const FREE_PATHS = ['/privacidade', '/termos', '/respaldo-juridico'];

/**
 * Pede o aceite da versão atual dos Termos e da Política a quem está logado
 * e ainda não aceitou: contas criadas pelo Google (que não passam pelo
 * formulário de cadastro) e contas antigas, quando a política muda.
 */
export function ConsentGate() {
  const { user, signOut } = useAuth();
  const { pathname } = useLocation();
  const [needsConsent, setNeedsConsent] = useState(false);
  const [isAdult, setIsAdult] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) { setNeedsConsent(false); return; }
    let cancelled = false;
    supabase
      .from('consent_records')
      .select('id')
      .eq('user_id', user.id)
      .eq('document', 'termos_privacidade')
      .eq('version', TERMS_VERSION)
      .eq('granted', true)
      .limit(1)
      .then(({ data, error }) => {
        if (cancelled) return;
        // Se a tabela ainda não existe no banco, não trava o site
        if (error) { if (!isMissingInDatabase(error)) console.error(error); return; }
        setNeedsConsent(!data?.length);
      });
    return () => { cancelled = true; };
  }, [user]);

  if (!user || !needsConsent || FREE_PATHS.includes(pathname)) return null;

  const accept = async () => {
    setSaving(true);
    const { error } = await supabase.from('consent_records').insert({
      user_id: user.id, document: 'termos_privacidade', version: TERMS_VERSION, granted: true,
    });
    setSaving(false);
    if (error) { toast.error('Não foi possível registrar o aceite', { description: error.message }); return; }
    setNeedsConsent(false);
  };

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Antes de continuar
          </AlertDialogTitle>
          <AlertDialogDescription>
            O Observatório da Juventude é um serviço da Prefeitura de Oriximiná (SEMJU). Para usar sua conta,
            confirme sua idade e leia como tratamos seus dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 py-2">
          <div className="flex items-start gap-2">
            <Checkbox id="gate-age" checked={isAdult} onCheckedChange={(v) => setIsAdult(v === true)} />
            <Label htmlFor="gate-age" className="text-sm font-normal leading-snug cursor-pointer">
              Declaro que tenho {MIN_AGE} anos ou mais.
            </Label>
          </div>
          <div className="flex items-start gap-2">
            <Checkbox id="gate-terms" checked={accepted} onCheckedChange={(v) => setAccepted(v === true)} />
            <Label htmlFor="gate-terms" className="text-sm font-normal leading-snug cursor-pointer">
              Li e concordo com os{' '}
              <Link to="/termos" target="_blank" className="text-primary hover:underline">Termos de Uso</Link> e a{' '}
              <Link to="/privacidade" target="_blank" className="text-primary hover:underline">Política de Privacidade</Link>.
            </Label>
          </div>
        </div>
        <AlertDialogFooter className="gap-2">
          <Button variant="outline" onClick={() => signOut()}>Não aceito, sair</Button>
          <Button onClick={accept} disabled={!isAdult || !accepted || saving}>
            {saving ? 'Salvando...' : 'Aceitar e continuar'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
