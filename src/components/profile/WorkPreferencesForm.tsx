import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Target } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

interface Props {
  profile: Tables<'profiles'>;
  onSave: (updates: Partial<Tables<'profiles'>>) => Promise<{ error: any }>;
}

const opportunityTypes = [
  { value: 'CLT', label: 'CLT (Carteira assinada)' },
  { value: 'ESTAGIO', label: 'Estágio' },
  { value: 'JOVEM_APRENDIZ', label: 'Jovem Aprendiz' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'VOLUNTARIADO', label: 'Voluntariado' },
];

const interestAreaOptions = [
  'Tecnologia', 'Design', 'Comunicação', 'Gestão', 'Saúde',
  'Educação', 'Meio Ambiente', 'Arte e Cultura', 'Comércio',
  'Construção Civil', 'Indústria', 'Agropecuária', 'Turismo',
];

const salaryRanges = [
  'Até R$ 1.000', 'R$ 1.000 - R$ 2.000', 'R$ 2.000 - R$ 3.000',
  'R$ 3.000 - R$ 5.000', 'Acima de R$ 5.000', 'A combinar',
];

export default function WorkPreferencesForm({ profile, onSave }: Props) {
  const p = profile as any;
  const [form, setForm] = useState({
    desired_opportunity_types: p.desired_opportunity_types || [],
    interest_areas: p.interest_areas || [],
    salary_range: p.salary_range || '',
  });
  const [saving, setSaving] = useState(false);

  const toggleArray = (key: 'desired_opportunity_types' | 'interest_areas', val: string) => {
    setForm(f => {
      const arr = f[key] as string[];
      return { ...f, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await onSave(form as any);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Preferências salvas!');
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Preferências de Trabalho
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-3">
          <Label className="font-medium">Tipo de Oportunidade Desejada</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {opportunityTypes.map(opt => (
              <div key={opt.value} className="flex items-center gap-2 p-2 border rounded-lg hover:bg-muted/30">
                <Checkbox
                  checked={(form.desired_opportunity_types as string[]).includes(opt.value)}
                  onCheckedChange={() => toggleArray('desired_opportunity_types', opt.value)}
                />
                <Label className="cursor-pointer text-sm">{opt.label}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="font-medium">Áreas de Interesse</Label>
          <div className="flex flex-wrap gap-2">
            {interestAreaOptions.map(area => {
              const selected = (form.interest_areas as string[]).includes(area);
              return (
                <button
                  key={area}
                  onClick={() => toggleArray('interest_areas', area)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all border ${
                    selected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background text-muted-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <Label>Pretensão Salarial <span className="text-muted-foreground text-xs">(opcional)</span></Label>
          <Select value={form.salary_range} onValueChange={v => setForm(f => ({ ...f, salary_range: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
            <SelectContent>
              {salaryRanges.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={saving} className="gap-2 gradient-bg hover:opacity-90">
          <Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  );
}
