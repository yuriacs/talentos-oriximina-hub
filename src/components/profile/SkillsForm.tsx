import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

interface Props {
  skills: Tables<'skills'>[];
  onAdd: (skill: Omit<TablesInsert<'skills'>, 'profile_id'>) => Promise<{ error: any }>;
  onDelete: (id: string) => Promise<{ error: any }>;
}

const categoryLabels = { HARD: 'Técnica', SOFT: 'Socioemocional' };
const levelLabels = { INICIANTE: 'Iniciante', INTERMEDIARIO: 'Intermediário', AVANCADO: 'Avançado' };

export default function SkillsForm({ skills, onAdd, onDelete }: Props) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'HARD' | 'SOFT'>('HARD');
  const [level, setLevel] = useState<'INICIANTE' | 'INTERMEDIARIO' | 'AVANCADO'>('INICIANTE');
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) { toast.error('Informe o nome da competência'); return; }
    setAdding(true);
    const { error } = await onAdd({ name: name.trim(), category, level });
    if (error) toast.error('Erro ao adicionar');
    else { toast.success('Competência adicionada!'); setName(''); }
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await onDelete(id);
    if (error) toast.error('Erro ao remover');
  };

  const hardSkills = skills.filter(s => s.category === 'HARD');
  const softSkills = skills.filter(s => s.category === 'SOFT');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Competências ({skills.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Nome da competência" className="flex-1" maxLength={50} onKeyDown={e => e.key === 'Enter' && handleAdd()} />
          <Select value={category} onValueChange={v => setCategory(v as any)}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="HARD">Técnica</SelectItem>
              <SelectItem value="SOFT">Socioemocional</SelectItem>
            </SelectContent>
          </Select>
          <Select value={level} onValueChange={v => setLevel(v as any)}>
            <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="INICIANTE">Iniciante</SelectItem>
              <SelectItem value="INTERMEDIARIO">Intermediário</SelectItem>
              <SelectItem value="AVANCADO">Avançado</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAdd} disabled={adding} size="icon" className="gradient-bg shrink-0">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {skills.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">Nenhuma competência cadastrada. Adicione pelo menos 5.</p>}

        {hardSkills.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Técnicas</p>
            <div className="flex flex-wrap gap-2">
              {hardSkills.map(s => (
                <Badge key={s.id} variant="secondary" className="gap-1 pr-1">
                  {s.name} · {levelLabels[s.level]}
                  <button onClick={() => handleDelete(s.id)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {softSkills.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Socioemocionais</p>
            <div className="flex flex-wrap gap-2">
              {softSkills.map(s => (
                <Badge key={s.id} variant="outline" className="gap-1 pr-1">
                  {s.name} · {levelLabels[s.level]}
                  <button onClick={() => handleDelete(s.id)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
