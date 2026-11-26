import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Save, Heart, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface SoftSkill {
  id: string;
  name: string;
  rating: number;
  profile_id: string;
  created_at: string;
}

interface Props {
  softSkills: SoftSkill[];
  onAdd: (skill: { name: string; rating: number }) => Promise<{ error: any }>;
  onUpdate: (id: string, rating: number) => Promise<{ error: any }>;
  onDelete: (id: string) => Promise<{ error: any }>;
}

const defaultSkills = [
  'Comunicação', 'Trabalho em Equipe', 'Liderança',
  'Proatividade', 'Organização', 'Criatividade',
  'Resolução de Problemas', 'Adaptabilidade', 'Empatia',
  'Gestão do Tempo',
];

const ratingLabels: Record<number, string> = {
  1: 'Básico', 2: 'Em desenvolvimento', 3: 'Bom', 4: 'Muito bom', 5: 'Excelente',
};

export default function SoftSkillsForm({ softSkills, onAdd, onUpdate, onDelete }: Props) {
  const [adding, setAdding] = useState(false);
  const existingNames = new Set(softSkills.map(s => s.name));
  const available = defaultSkills.filter(s => !existingNames.has(s));

  const handleAdd = async (name: string) => {
    setAdding(true);
    const { error } = await onAdd({ name, rating: 3 });
    if (error) toast.error('Erro ao adicionar');
    else toast.success(`${name} adicionada!`);
    setAdding(false);
  };

  const handleRate = async (id: string, rating: number) => {
    await onUpdate(id, rating);
  };

  const handleDelete = async (id: string) => {
    const { error } = await onDelete(id);
    if (error) toast.error('Erro ao remover');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Soft Skills – Autoavaliação ({softSkills.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {softSkills.length > 0 && (
          <div className="space-y-3">
            {softSkills.map(skill => (
              <div key={skill.id} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-medium">{skill.name}</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{ratingLabels[skill.rating]}</span>
                    <button onClick={() => handleDelete(skill.id)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <Slider
                  value={[skill.rating]}
                  min={1}
                  max={5}
                  step={1}
                  onValueCommit={([val]) => handleRate(skill.id, val)}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {available.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Adicionar soft skill:</Label>
            <div className="flex flex-wrap gap-2">
              {available.map(name => (
                <Button
                  key={name}
                  variant="outline"
                  size="sm"
                  disabled={adding}
                  onClick={() => handleAdd(name)}
                  className="gap-1 text-xs"
                >
                  <Plus className="h-3 w-3" />{name}
                </Button>
              ))}
            </div>
          </div>
        )}

        {softSkills.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Clique nas opções acima para adicionar suas soft skills e se autoavaliar.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
