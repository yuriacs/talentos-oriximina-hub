import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

interface Props {
  education: Tables<'education'>[];
  onAdd: (edu: Omit<TablesInsert<'education'>, 'profile_id'>) => Promise<{ error: any }>;
  onDelete: (id: string) => Promise<{ error: any }>;
}

export default function EducationForm({ education, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ level: '', course: '', institution: '', year: new Date().getFullYear(), current: false });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.level.trim() || !form.course.trim() || !form.institution.trim()) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    setAdding(true);
    const { error } = await onAdd(form);
    if (error) toast.error('Erro ao adicionar');
    else { toast.success('Formação adicionada!'); setForm({ level: '', course: '', institution: '', year: new Date().getFullYear(), current: false }); setShowForm(false); }
    setAdding(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Formação ({education.length})</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
          <Plus className="h-4 w-4" />{showForm ? 'Cancelar' : 'Adicionar'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Nível *</Label>
                <Select value={form.level} onValueChange={val => setForm(f => ({ ...f, level: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ensino Fundamental">Ensino Fundamental</SelectItem>
                    <SelectItem value="Ensino Médio">Ensino Médio</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Tecnólogo">Tecnólogo</SelectItem>
                    <SelectItem value="Superior (Graduação)">Superior (Graduação)</SelectItem>
                    <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                    <SelectItem value="Mestrado">Mestrado</SelectItem>
                    <SelectItem value="Doutorado">Doutorado</SelectItem>
                    <SelectItem value="Curso Livre">Curso Livre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Curso *</Label>
                <Input value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} maxLength={100} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Instituição *</Label>
                <Input value={form.institution} onChange={e => setForm(f => ({ ...f, institution: e.target.value }))} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label>Ano</Label>
                <Input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: parseInt(e.target.value) || new Date().getFullYear() }))} min={2000} max={2030} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.current} onCheckedChange={c => setForm(f => ({ ...f, current: !!c }))} />
              <Label className="text-sm font-normal">Cursando atualmente</Label>
            </div>
            <Button onClick={handleAdd} disabled={adding} className="gradient-bg hover:opacity-90">
              {adding ? 'Salvando...' : 'Salvar Formação'}
            </Button>
          </div>
        )}

        {education.length === 0 && !showForm && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma formação cadastrada</p>}

        {education.map(e => (
          <div key={e.id} className="flex items-start justify-between p-3 border rounded-lg">
            <div>
              <p className="font-medium">{e.course}</p>
              <p className="text-sm text-muted-foreground">{e.level} · {e.institution} · {e.year}{e.current ? ' (cursando)' : ''}</p>
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
