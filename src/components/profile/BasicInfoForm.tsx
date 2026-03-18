import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

const areaOptions = [
  'Tecnologia',
  'Design',
  'Comunicação',
  'Gestão',
  'Saúde',
  'Educação',
  'Meio Ambiente',
  'Arte e Cultura',
];

interface Props {
  profile: Tables<'profiles'>;
  onSave: (updates: Partial<Tables<'profiles'>>) => Promise<{ error: any }>;
}

const visibilityOptions = [
  { value: 'INTERNAL_ONLY', label: 'Apenas mensagens internas' },
  { value: 'EMAIL_LOGGED', label: 'Mostrar e-mail para logados' },
  { value: 'WHATSAPP_LOGGED', label: 'Mostrar WhatsApp para logados' },
  { value: 'ALL', label: 'Mostrar para todos' },
  { value: 'HIDDEN', label: 'Ocultar tudo' },
];

export default function BasicInfoForm({ profile, onSave }: Props) {
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    city: profile.city || 'Oriximiná',
    professional_objective: profile.professional_objective || '',
    whatsapp: profile.whatsapp || '',
    contact_visibility: profile.contact_visibility || 'INTERNAL_ONLY',
    area: (profile as any).area || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.full_name.trim()) { toast.error('Nome é obrigatório'); return; }
    setSaving(true);
    const { error } = await onSave(form as any);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Informações salvas!');
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome Completo *</Label>
            <Input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} maxLength={100} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Bio Profissional</Label>
          <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Fale um pouco sobre você..." rows={3} maxLength={500} />
          <p className="text-xs text-muted-foreground">{form.bio.length}/500</p>
        </div>
        <div className="space-y-2">
          <Label>Objetivo Profissional</Label>
          <Textarea value={form.professional_objective} onChange={e => setForm(f => ({ ...f, professional_objective: e.target.value }))} placeholder="O que você busca alcançar?" rows={2} maxLength={300} />
        </div>
        <div className="space-y-2">
          <Label>Área de Atuação</Label>
          <Select value={form.area} onValueChange={v => setForm(f => ({ ...f, area: v }))}>
            <SelectTrigger><SelectValue placeholder="Selecione sua área" /></SelectTrigger>
            <SelectContent>
              {areaOptions.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>WhatsApp (opcional)</Label>
            <Input value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))} placeholder="(93) 99999-9999" maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label>Visibilidade do Contato</Label>
            <Select value={form.contact_visibility} onValueChange={v => setForm(f => ({ ...f, contact_visibility: v as typeof f.contact_visibility }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {visibilityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 gradient-bg hover:opacity-90">
          <Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar Informações'}
        </Button>
      </CardContent>
    </Card>
  );
}
