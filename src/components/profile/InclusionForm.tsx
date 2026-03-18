import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Save, Accessibility } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

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

  const handleSave = async () => {
    setSaving(true);
    const { error } = await onSave(form as any);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Dados de inclusão salvos!');
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
        <div className="flex items-center justify-between gap-3 p-3 border rounded-lg">
          <Label>Pessoa com Deficiência (PcD)?</Label>
          <Switch checked={form.is_pcd} onCheckedChange={v => setForm(f => ({ ...f, is_pcd: v }))} />
        </div>

        {form.is_pcd && (
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

        <Button onClick={handleSave} disabled={saving} className="gap-2 gradient-bg hover:opacity-90">
          <Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  );
}
