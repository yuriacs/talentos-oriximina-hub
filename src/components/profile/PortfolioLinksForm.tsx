import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Link2, Linkedin, Github, Globe, Video } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables } from '@/integrations/supabase/types';

interface Props {
  profile: Tables<'profiles'>;
  onSave: (updates: Partial<Tables<'profiles'>>) => Promise<{ error: any }>;
}

export default function PortfolioLinksForm({ profile, onSave }: Props) {
  const p = profile as any;
  const [form, setForm] = useState({
    portfolio_url: p.portfolio_url || '',
    linkedin_url: p.linkedin_url || '',
    github_url: p.github_url || '',
    video_url: p.video_url || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await onSave(form as any);
    if (error) toast.error('Erro ao salvar');
    else toast.success('Links salvos!');
    setSaving(false);
  };

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Link2 className="h-5 w-5 text-primary" />
          Portfólio e Links
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Globe className="h-4 w-4" /> Portfólio / Site</Label>
            <Input value={form.portfolio_url} onChange={e => set('portfolio_url', e.target.value)} placeholder="https://meuportfolio.com" maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Linkedin className="h-4 w-4" /> LinkedIn</Label>
            <Input value={form.linkedin_url} onChange={e => set('linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/seu-perfil" maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Github className="h-4 w-4" /> GitHub</Label>
            <Input value={form.github_url} onChange={e => set('github_url', e.target.value)} placeholder="https://github.com/seu-usuario" maxLength={200} />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5"><Video className="h-4 w-4" /> Vídeo de Apresentação</Label>
            <Input value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." maxLength={200} />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="gap-2 gradient-bg hover:opacity-90">
          <Save className="h-4 w-4" />{saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </CardContent>
    </Card>
  );
}
