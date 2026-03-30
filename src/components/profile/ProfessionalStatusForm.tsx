import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Save, Briefcase, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Tables } from '@/integrations/supabase/types';

interface Props {
  profile: Tables<'profiles'>;
  onSave: (updates: Partial<Tables<'profiles'>>) => Promise<{ error: any }>;
}

const experienceTimeOptions = ['Nenhuma', 'Até 6 meses', '6 meses a 1 ano', '1 a 2 anos', '2+ anos'];

const statusChoices = [
  { value: 'Empregado', label: 'Estou trabalhando', icon: CheckCircle2, description: 'Atualmente empregado ou atuando profissionalmente' },
  { value: 'Desempregado', label: 'Em busca de oportunidade', icon: Search, description: 'Procurando emprego, estágio ou nova oportunidade' },
];

export default function ProfessionalStatusForm({ profile, onSave }: Props) {
  const p = profile as any;
  const [form, setForm] = useState({
    employment_status: p.employment_status || '',
    has_work_experience: p.has_work_experience || false,
    experience_time: p.experience_time || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await onSave(form as any);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Situação profissional salva!');
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Situação Profissional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status toggle cards */}
        <div>
          <Label className="mb-2 block">Qual sua situação atual?</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {statusChoices.map(choice => {
              const Icon = choice.icon;
              const selected = form.employment_status === choice.value;
              return (
                <button
                  key={choice.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, employment_status: choice.value }))}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-lg border-2 text-left transition-all',
                    selected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-muted-foreground/30'
                  )}
                >
                  <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', selected ? 'text-primary' : 'text-muted-foreground')} />
                  <div>
                    <p className={cn('font-medium text-sm', selected ? 'text-primary' : 'text-foreground')}>{choice.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{choice.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tempo de Experiência</Label>
            <Select value={form.experience_time} onValueChange={v => setForm(f => ({ ...f, experience_time: v }))}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {experienceTimeOptions.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 p-3 border rounded-lg self-end">
            <Switch checked={form.has_work_experience} onCheckedChange={v => setForm(f => ({ ...f, has_work_experience: v }))} />
            <Label>Já teve experiência profissional?</Label>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 gradient-bg hover:opacity-90">
          <Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  );
}