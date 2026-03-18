import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { Tables, Database } from '@/integrations/supabase/types';

type AvailabilityType = Database['public']['Enums']['availability_type'];

interface Props {
  availability: Tables<'availability'>[];
  onToggle: (type: AvailabilityType) => Promise<{ error: any }>;
}

const options: { value: AvailabilityType; label: string; description: string }[] = [
  { value: 'ESTAGIO', label: 'Estágio', description: 'Disponível para programas de estágio' },
  { value: 'FREELANCE', label: 'Freelance', description: 'Aceita trabalhos pontuais' },
  { value: 'VOLUNTARIO', label: 'Voluntário', description: 'Disponível para trabalho voluntário' },
  { value: 'PROJETO', label: 'Projeto', description: 'Aceita participar de projetos' },
  { value: 'MENTORIA', label: 'Mentoria', description: 'Busca ou oferece mentoria' },
];

export default function AvailabilityForm({ availability, onToggle }: Props) {
  const active = new Set(availability.map(a => a.type));

  const handleToggle = async (type: AvailabilityType) => {
    const { error } = await onToggle(type);
    if (error) toast.error('Erro ao atualizar');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Disponibilidade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {options.map(opt => (
          <div key={opt.value} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
            <Checkbox
              checked={active.has(opt.value)}
              onCheckedChange={() => handleToggle(opt.value)}
              className="mt-0.5"
            />
            <div>
              <Label className="font-medium cursor-pointer">{opt.label}</Label>
              <p className="text-sm text-muted-foreground">{opt.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
