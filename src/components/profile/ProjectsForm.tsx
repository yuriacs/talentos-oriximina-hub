import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

interface Props {
  projects: Tables<'projects'>[];
  onAdd: (proj: Omit<TablesInsert<'projects'>, 'profile_id'>) => Promise<{ error: any }>;
  onDelete: (id: string) => Promise<{ error: any }>;
}

export default function ProjectsForm({ projects, onAdd, onDelete }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', problem: '', solution: '', results: '' });
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!form.title.trim()) { toast.error('Título é obrigatório'); return; }
    setAdding(true);
    const { error } = await onAdd({
      title: form.title.trim(),
      problem: form.problem,
      solution: form.solution,
      results: form.results || null,
    });
    if (error) toast.error('Erro ao adicionar');
    else { toast.success('Projeto adicionado!'); setForm({ title: '', problem: '', solution: '', results: '' }); setShowForm(false); }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await onDelete(id);
    if (error) toast.error('Erro ao remover');
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Projetos ({projects.length})</CardTitle>
        <Button variant="outline" size="sm" onClick={() => setShowForm(!showForm)} className="gap-1">
          <Plus className="h-4 w-4" />{showForm ? 'Cancelar' : 'Adicionar'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <div className="space-y-2">
              <Label>Título *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label>Problema</Label>
              <Textarea value={form.problem} onChange={e => setForm(f => ({ ...f, problem: e.target.value }))} rows={2} maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label>Solução</Label>
              <Textarea value={form.solution} onChange={e => setForm(f => ({ ...f, solution: e.target.value }))} rows={2} maxLength={500} />
            </div>
            <div className="space-y-2">
              <Label>Resultados</Label>
              <Textarea value={form.results} onChange={e => setForm(f => ({ ...f, results: e.target.value }))} rows={2} maxLength={500} />
            </div>
            <Button onClick={handleAdd} disabled={adding} className="gradient-bg hover:opacity-90">
              {adding ? 'Salvando...' : 'Salvar Projeto'}
            </Button>
          </div>
        )}

        {projects.length === 0 && !showForm && <p className="text-sm text-muted-foreground text-center py-4">Nenhum projeto cadastrado. Adicione pelo menos 1.</p>}

        {projects.map(p => (
          <div key={p.id} className="flex items-start justify-between p-3 border rounded-lg">
            <div className="min-w-0">
              <p className="font-medium">{p.title}</p>
              {p.problem && <p className="text-sm text-muted-foreground mt-1">{p.problem}</p>}
              {p.technologies && p.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {p.technologies.map((t, i) => <span key={i} className="text-xs px-2 py-0.5 rounded bg-muted">{t}</span>)}
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="text-destructive shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
