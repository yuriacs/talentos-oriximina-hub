import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

interface Props {
  profile: Tables<'profiles'>;
  onSave: (updates: Partial<Tables<'profiles'>>) => Promise<{ error: any }>;
}

const shiftOptions = [
  { value: 'MANHA', label: 'Manhã' },
  { value: 'TARDE', label: 'Tarde' },
  { value: 'NOITE', label: 'Noite' },
];

const hoursOptions = ['4h/dia', '6h/dia', '8h/dia', 'Meio período', 'Integral', 'Flexível'];

export default function MobilityForm({ profile, onSave }: Props) {
  const p = profile as any;
  const [form, setForm] = useState({
    available_shifts: p.available_shifts || [],
    desired_hours: p.desired_hours || '',
    can_work_onsite: p.can_work_onsite ?? true,
    accepts_remote: p.accepts_remote ?? false,
    can_travel: p.can_travel ?? false,
    has_transport: p.has_transport ?? false,
  });
  const [saving, setSaving] = useState(false);

  const toggleShift = (val: string) => {
    setForm(f => {
      const arr = f.available_shifts as string[];
      return { ...f, available_shifts: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await onSave(form as any);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Disponibilidade e mobilidade salvas!');
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Disponibilidade e Mobilidade
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <Label className="font-medium">Turnos Disponíveis</Label>
          <div className="flex gap-3">
            {shiftOptions.map(opt => (
              <div key={opt.value} className="flex items-center gap-2 p-3 border rounded-lg hover:bg-muted/30 flex-1">
                <Checkbox
                  checked={(form.available_shifts as string[]).includes(opt.value)}
                  onCheckedChange={() => toggleShift(opt.value)}
                />
                <Label className="cursor-pointer text-sm">{opt.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <Label>Carga Horária Desejada</Label>
          <Select value={form.desired_hours} onValueChange={v => setForm(f => ({ ...f, desired_hours: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {hoursOptions.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { key: 'can_work_onsite', label: 'Pode trabalhar presencial?' },
            { key: 'accepts_remote', label: 'Aceita trabalho remoto?' },
            { key: 'can_travel', label: 'Pode viajar?' },
            { key: 'has_transport', label: 'Possui transporte próprio?' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between gap-3 p-3 border rounded-lg">
              <Label className="text-sm">{item.label}</Label>
              <Switch
                checked={(form as any)[item.key]}
                onCheckedChange={v => setForm(f => ({ ...f, [item.key]: v }))}
              />
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2 gradient-bg hover:opacity-90">
          <Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  );
}
