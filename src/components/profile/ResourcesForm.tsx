import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Monitor } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

interface Props {
  profile: Tables<'profiles'>;
  onSave: (updates: Partial<Tables<'profiles'>>) => Promise<{ error: any }>;
}

const internetOptions = ['Bom', 'Limitado', 'Inexistente'];
const digitalLevelOptions = ['Básico', 'Intermediário', 'Avançado'];

export default function ResourcesForm({ profile, onSave }: Props) {
  const p = profile as any;
  const [form, setForm] = useState({
    has_computer: p.has_computer ?? false,
    internet_access: p.internet_access || '',
    digital_skill_level: p.digital_skill_level || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await onSave(form as any);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Recursos salvos!');
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Monitor className="h-5 w-5 text-primary" />
          Recursos Extras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3 p-3 border rounded-lg">
          <Label>Possui computador?</Label>
          <Switch checked={form.has_computer} onCheckedChange={v => setForm(f => ({ ...f, has_computer: v }))} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Acesso à Internet</Label>
            <Select value={form.internet_access} onValueChange={v => setForm(f => ({ ...f, internet_access: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {internetOptions.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Nível de Habilidade Digital</Label>
            <Select value={form.digital_skill_level} onValueChange={v => setForm(f => ({ ...f, digital_skill_level: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {digitalLevelOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2 gradient-bg hover:opacity-90">
          <Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  );
}
