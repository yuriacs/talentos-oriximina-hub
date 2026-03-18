import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

interface Props {
  profile: Tables<'profiles'>;
  onSave: (updates: Partial<Tables<'profiles'>>) => Promise<{ error: any }>;
}

const ageRanges = ['14-17', '18-21', '22-25', '26-29', '30+'];
const genderOptions = ['Masculino', 'Feminino', 'Não-binário', 'Prefiro não informar'];
const raceOptions = ['Branca', 'Preta', 'Parda', 'Amarela', 'Indígena', 'Prefiro não informar'];
const educationLevels = [
  'Ensino Fundamental Incompleto',
  'Ensino Fundamental Completo',
  'Ensino Médio Incompleto',
  'Ensino Médio Completo',
  'Ensino Técnico',
  'Superior Incompleto',
  'Superior Completo',
  'Pós-graduação',
];
const institutionTypes = ['Pública', 'Privada', 'EETEPA', 'IFPA', 'Outra'];

export default function SocioeducationalForm({ profile, onSave }: Props) {
  const p = profile as any;
  const [form, setForm] = useState({
    age_range: p.age_range || '',
    gender: p.gender || '',
    race_color: p.race_color || '',
    education_level: p.education_level || '',
    institution_type: p.institution_type || '',
    current_course: p.current_course || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await onSave(form as any);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Dados socioeducacionais salvos!');
    setSaving(false);
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Perfil Socioeducacional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Faixa Etária</Label>
            <Select value={form.age_range} onValueChange={v => set('age_range', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {ageRanges.map(a => <SelectItem key={a} value={a}>{a} anos</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gênero <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Select value={form.gender} onValueChange={v => set('gender', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {genderOptions.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Raça/Cor <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Select value={form.race_color} onValueChange={v => set('race_color', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {raceOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Escolaridade</Label>
            <Select value={form.education_level} onValueChange={v => set('education_level', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {educationLevels.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Tipo de Instituição</Label>
            <Select value={form.institution_type} onValueChange={v => set('institution_type', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                {institutionTypes.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Curso Atual <span className="text-muted-foreground text-xs">(opcional)</span></Label>
          <Input value={form.current_course} onChange={e => set('current_course', e.target.value)} placeholder="Ex: Técnico em Informática" maxLength={100} />
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 gradient-bg hover:opacity-90">
          <Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  );
}
