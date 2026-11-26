import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { size: 48, stroke: 4 },
  md: { size: 80, stroke: 6 },
  lg: { size: 120, stroke: 8 },
};

export function ProgressRing({
  progress,
  size = 'md',
  showLabel = true,
  className,
}: ProgressRingProps) {
  const { size: svgSize, stroke } = sizeConfig[size];
  const radius = (svgSize - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={svgSize} height={svgSize} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={stroke}
        />
        {/* Progress circle */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500 ease-out"
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(160, 84%, 39%)" />
            <stop offset="100%" stopColor="hsl(200, 80%, 50%)" />
          </linearGradient>
        </defs>
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            "font-display font-bold gradient-text",
            size === 'sm' && "text-xs",
            size === 'md' && "text-lg",
            size === 'lg' && "text-2xl"
          )}>
            {progress}%
          </span>
        </div>
      )}
    </div>
  );
}
