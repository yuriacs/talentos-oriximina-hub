import { cn } from '@/lib/utils';
import { SkillLevel, SkillCategory } from '@/types';

interface SkillChipProps {
  name: string;
  category?: SkillCategory;
  level?: SkillLevel;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

const levelColors = {
  INICIANTE: 'bg-info/10 text-info border-info/20',
  INTERMEDIARIO: 'bg-warning/10 text-warning border-warning/20',
  AVANCADO: 'bg-success/10 text-success border-success/20',
};

const levelLabels = {
  INICIANTE: 'Iniciante',
  INTERMEDIARIO: 'Intermediário',
  AVANCADO: 'Avançado',
};

const categoryStyles = {
  HARD: 'bg-secondary/10 text-secondary border-secondary/20 hover:bg-secondary/20',
  SOFT: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-base',
};

export function SkillChip({
  name,
  category = 'HARD',
  level,
  size = 'md',
  showLevel = false,
  onClick,
  selected = false,
  className,
}: SkillChipProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium border transition-all duration-200",
        sizeStyles[size],
        selected
          ? "bg-primary text-primary-foreground border-primary"
          : categoryStyles[category],
        onClick && "cursor-pointer",
        className
      )}
    >
      {name}
      {showLevel && level && (
        <span
          className={cn(
            "px-1.5 py-0.5 rounded-full text-[10px] font-semibold",
            levelColors[level]
          )}
        >
          {levelLabels[level]}
        </span>
      )}
    </span>
  );
}
