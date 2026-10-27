import { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Save, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Tables } from '@/integrations/supabase/types';
import { useStepSave } from './stepSave';
import { maskPhone } from '@/lib/br';

const areaOptions = [
  'Administração e Gestão',
  'Agropecuária',
  'Arte e Cultura',
  'Comércio e Vendas',
  'Comunicação',
  'Construção Civil',
  'Design',
  'Educação',
  'Esporte',
  'Indústria e Mineração',
  'Meio Ambiente',
  'Saúde',
  'Tecnologia',
  'Turismo e Gastronomia',
  'Outra',
];

interface Props {
  profile: Tables<'profiles'>;
  onSave: (updates: Partial<Tables<'profiles'>>) => Promise<{ error: any }>;
}

// Só opções que o site realmente aplica (ver get_safe_profile_data)
const visibilityOptions = [
  { value: 'WHATSAPP_LOGGED', label: 'Só para quem entrou no site (empresas)' },
  { value: 'ALL', label: 'Para qualquer visitante' },
  { value: 'HIDDEN', label: 'Não mostrar meu WhatsApp' },
];
const normalizeVisibility = (v: string) => (visibilityOptions.some(o => o.value === v) ? v : 'HIDDEN');

export default function BasicInfoForm({ profile, onSave }: Props) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(profile.photo || '');
  const [form, setForm] = useState({
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    city: profile.city || 'Oriximiná',
    professional_objective: profile.professional_objective || '',
    whatsapp: profile.whatsapp || '',
    contact_visibility: normalizeVisibility(profile.contact_visibility || 'WHATSAPP_LOGGED') as typeof profile.contact_visibility,
    area: (profile as any).area || '',
  });
  const [saving, setSaving] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error('Erro ao enviar imagem');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    const url = `${publicUrl}?t=${Date.now()}`;
    setPhotoUrl(url);
    const { error } = await onSave({ photo: url } as any);
    if (error) toast.error('Erro ao salvar foto');
    else toast.success('Foto atualizada!');
    setUploading(false);
  };

  const save = async () => {
    if (!form.full_name.trim()) { toast.error('Nome é obrigatório'); return false; }
    const { error } = await onSave(form as any);
    if (error) { toast.error('Erro ao salvar'); return false; }
    return true;
  };
  const { inWizard } = useStepSave('basic', form, save);

  const handleSave = async () => {
    setSaving(true);
    if (await save()) toast.success('Informações salvas!');
    setSaving(false);
  };

  const initials = form.full_name.split(' ').map(n => n[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Informações Básicas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Photo upload */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Avatar className="h-20 w-20 border-2 border-border">
              {photoUrl ? (
                <AvatarImage src={photoUrl} alt={form.full_name} />
              ) : null}
              <AvatarFallback className="text-lg font-semibold bg-muted">
                {initials || '?'}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              {uploading ? (
                <Loader2 className="h-5 w-5 text-white animate-spin" />
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>
          <div>
            <p className="text-sm font-medium">Foto do Perfil</p>
            <p className="text-xs text-muted-foreground">JPG, PNG. Máx 5MB.</p>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="px-0 h-auto text-xs"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : photoUrl ? 'Trocar foto' : 'Adicionar foto'}
            </Button>
          </div>
        </div>

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
          <Label>Sobre você <span className="text-xs font-normal text-muted-foreground">(necessário para publicar)</span></Label>
          <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Ex.: Tenho 20 anos, moro no bairro Santa Luzia e estudo Administração. Gosto de atender pessoas e organizar tarefas." rows={4} maxLength={500} />
          <p className="text-xs text-muted-foreground">Conte quem você é, o que estuda e o que sabe fazer. {form.bio.length}/500</p>
        </div>
        <div className="space-y-2">
          <Label>Objetivo profissional <span className="text-xs font-normal text-muted-foreground">(necessário para publicar)</span></Label>
          <Textarea value={form.professional_objective} onChange={e => setForm(f => ({ ...f, professional_objective: e.target.value }))} placeholder="Ex.: Conseguir meu primeiro estágio na área administrativa." rows={2} maxLength={300} />
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
            <Input type="tel" inputMode="tel" value={form.whatsapp} onChange={e => setForm(f => ({ ...f, whatsapp: maskPhone(e.target.value) }))} placeholder="(93) 99999-9999" maxLength={15} />
          </div>
          <div className="space-y-2">
            <Label>Quem pode ver seu WhatsApp?</Label>
            <Select value={form.contact_visibility} onValueChange={v => setForm(f => ({ ...f, contact_visibility: v as typeof f.contact_visibility }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {visibilityOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        {!inWizard && (
          <Button onClick={handleSave} disabled={saving} className="gap-2 gradient-bg hover:opacity-90">
            <Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar Informações'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
