import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

interface Props {
  experiences: Tables<'experiences'>[];
  onAdd: (exp: Omit<TablesInsert<'experiences'>, 'profile_id'>) => Promise<{ error: any }>;
  onDelete: (id: string) => Promise<{ error: any }>;
}

export default function ExperiencesForm({ experiences, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: '', place: '', start_date: '', end_date: '', current: false, description: '' });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.type.trim() || !form.place.trim() || !form.start_date) {
      toast.error('Preencha tipo, local e data de início');
      return;
    }
    setAdding(true);
    const { error } = await onAdd({
      type: form.type,
      place: form.place,
      start_date: form.start_date,
      end_date: form.current ? null : form.end_date || null,
      current: form.current,
      description: form.description,
    });
    if (error) toast.error('Erro ao adicionar');
    else { toast.success('Experiência adicionada!'); setForm({ type: '', place: '', start_date: '', end_date: '', current: false, description: '' }); setShowForm(false); }
    setAdding(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Experiências ({experiences.length})</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
          <Plus className="h-4 w-4" />{showForm ? 'Cancelar' : 'Adicionar'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Tipo * (ex: Voluntário, Estágio)</Label>
                <Input value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label>Local *</Label>
                <Input value={form.place} onChange={e => setForm(f => ({ ...f, place: e.target.value }))} maxLength={100} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Data Início *</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
              </div>
              {!form.current && (
                <div className="space-y-2">
                  <Label>Data Fim</Label>
                  <Input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.current} onCheckedChange={c => setForm(f => ({ ...f, current: !!c }))} />
              <Label className="text-sm font-normal">Atividade atual</Label>
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} maxLength={500} />
            </div>
            <Button onClick={handleAdd} disabled={adding} className="gradient-bg hover:opacity-90">
              {adding ? 'Salvando...' : 'Salvar Experiência'}
            </Button>
          </div>
        )}

        {experiences.length === 0 && !showForm && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma experiência cadastrada</p>}

        {experiences.map(e => (
          <div key={e.id} className="flex items-start justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">{e.type} — {e.place}</p>
              <p className="text-sm text-muted-foreground">{e.start_date}{e.current ? ' — atual' : e.end_date ? ` — ${e.end_date}` : ''}</p>
              {e.description && <p className="text-sm mt-1">{e.description}</p>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => onDelete(e.id)} className="text-destructive shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
