import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SENSITIVE_CONSENT_VERSION, isMissingInDatabase } from '@/lib/privacy';

interface Props {
  consentedAt: string | null | undefined;
  /** Já existem dados sensíveis salvos (informados antes desta versão da política) */
  hasExistingData: boolean;
  onChange: (consentedAt: string | null) => void;
}

/**
 * Consentimento específico e destacado para dados sensíveis (LGPD art. 11, I):
 * raça/cor e informações sobre deficiência. Sem ele os campos ficam bloqueados.
 */
export function SensitiveConsentBox({ consentedAt, hasExistingData, onChange }: Props) {
  const [busy, setBusy] = useState(false);

  const setConsent = async (granted: boolean) => {
    if (!granted && !confirm('Isso apaga sua raça/cor e suas informações de deficiência e acessibilidade. Continuar?')) return;
    setBusy(true);
    const { error } = await supabase.rpc('set_sensitive_data_consent', {
      _granted: granted, _version: SENSITIVE_CONSENT_VERSION,
    });
    setBusy(false);
    if (error) {
      toast.error(isMissingInDatabase(error) ? 'Função ainda não disponível no banco de dados' : 'Não foi possível salvar sua escolha', { description: error.message });
      return;
    }
    onChange(granted ? new Date().toISOString() : null);
    toast.success(granted ? 'Autorização registrada' : 'Autorização revogada e dados sensíveis apagados');
  };

  if (consentedAt) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
        <span className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
          Você autorizou o uso de dados sensíveis em {new Date(consentedAt).toLocaleDateString('pt-BR')}.
        </span>
        <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => setConsent(false)}>
          Revogar e apagar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm">
      <p className="flex items-start gap-2">
        <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <span>
          Raça/cor e informações de deficiência são <strong>dados sensíveis</strong> pela LGPD. Eles são opcionais,
          nunca aparecem no seu perfil público e só são usados pela SEMJU, de forma agregada, para planejar políticas
          de juventude e ações de inclusão.{' '}
          <Link to="/privacidade" target="_blank" className="text-primary hover:underline">Saiba mais</Link>
        </span>
      </p>
      {hasExistingData && (
        <p className="text-amber-700 dark:text-amber-400">
          Você já informou alguns desses dados antes. Confirme a autorização para mantê-los ou apague-os.
        </p>
      )}
      <div className="flex items-start gap-2">
        <Checkbox id="sensitive-consent" disabled={busy} checked={false} onCheckedChange={(v) => v === true && setConsent(true)} />
        <Label htmlFor="sensitive-consent" className="font-normal leading-snug cursor-pointer">
          Autorizo a SEMJU a tratar esses dados para as finalidades acima. Posso revogar quando quiser.
        </Label>
      </div>
      {hasExistingData && (
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => setConsent(false)}>
          Apagar esses dados
        </Button>
      )}
    </div>
  );
}
