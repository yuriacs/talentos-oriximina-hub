import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Save, Accessibility } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/lib/database.types';
import { useStepSave } from './stepSave';
import { SensitiveConsentBox } from '@/components/privacy/SensitiveConsentBox';

interface Props {
  profile: Tables<'profiles'>;
  onSave: (updates: Partial<Tables<'profiles'>>) => Promise<{ error: any }>;
}

export default function InclusionForm({ profile, onSave }: Props) {
  const p = profile as any;
  const [form, setForm] = useState({
    is_pcd: p.is_pcd || false,
    disability_type: p.disability_type || '',
    accessibility_needs: p.accessibility_needs || '',
    social_programs_interest: p.social_programs_interest || false,
  });
  const [saving, setSaving] = useState(false);
  const [consentedAt, setConsentedAt] = useState<string | null>(p.sensitive_data_consent_at ?? null);

  const save = async () => {
    // Sem autorização, não envia nada sobre deficiência. Campo vazio vira null.
    const sensitive = consentedAt
      ? {
          is_pcd: form.is_pcd,
          disability_type: form.is_pcd ? form.disability_type || null : null,
          accessibility_needs: form.is_pcd ? form.accessibility_needs || null : null,
        }
      : {};
    const { error } = await onSave({ social_programs_interest: form.social_programs_interest, ...sensitive } as any);
    if (error) { toast.error('Erro ao salvar'); return false; }
    return true;
  };
  const { inWizard } = useStepSave('inclusion', form, save);

  const handleSave = async () => {
    setSaving(true);
    if (await save()) toast.success('Dados de inclusão salvos!');
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Accessibility className="h-5 w-5 text-primary" />
          Inclusão e Acessibilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SensitiveConsentBox
          consentedAt={consentedAt}
          hasExistingData={!!(p.is_pcd || p.disability_type || p.accessibility_needs)}
          onChange={(at) => {
            setConsentedAt(at);
            if (!at) setForm(f => ({ ...f, is_pcd: false, disability_type: '', accessibility_needs: '' }));
          }}
        />
        <div className="flex items-center justify-between gap-3 p-3 border rounded-lg">
          <Label>Pessoa com Deficiência (PcD)? <span className="text-muted-foreground text-xs">(opcional, dado sensível)</span></Label>
          <Switch checked={form.is_pcd} disabled={!consentedAt} onCheckedChange={v => setForm(f => ({ ...f, is_pcd: v }))} />
        </div>

        {consentedAt && form.is_pcd && (
          <>
            <div className="space-y-2">
              <Label>Tipo de Deficiência</Label>
              <Input
                value={form.disability_type}
                onChange={e => setForm(f => ({ ...f, disability_type: e.target.value }))}
                placeholder="Ex: Visual, Auditiva, Motora..."
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Necessidade de Acessibilidade</Label>
              <Textarea
                value={form.accessibility_needs}
                onChange={e => setForm(f => ({ ...f, accessibility_needs: e.target.value }))}
                placeholder="Descreva suas necessidades de acessibilidade..."
                rows={2}
                maxLength={300}
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between gap-3 p-3 border rounded-lg">
          <Label>Interesse em programas sociais?</Label>
          <Switch checked={form.social_programs_interest} onCheckedChange={v => setForm(f => ({ ...f, social_programs_interest: v }))} />
        </div>

        {!inWizard && (
          <Button onClick={handleSave} disabled={saving} className="gap-2 gradient-bg hover:opacity-90">
            <Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
