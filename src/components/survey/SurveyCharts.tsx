import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { QuestionStats } from '@/lib/survey';

const pct = (value: number, total: number) => (total ? Math.round((value / total) * 100) : 0);

/** Barras horizontais em HTML: rótulos longos quebram linha e funcionam bem no celular. */
function RankedBars({ stats }: { stats: QuestionStats }) {
  const max = Math.max(1, ...stats.data.map((d) => d.value));
  return (
    <ul className="space-y-3">
      {stats.data.map((d) => (
        <li key={d.name} title={`${d.name}: ${d.value} (${pct(d.value, stats.answered)}%)`}>
          <div className="flex items-baseline justify-between gap-3 text-sm mb-1">
            <span className="text-foreground">{d.name}</span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              <span className="font-semibold text-foreground">{pct(d.value, stats.answered)}%</span> · {d.value}
            </span>
          </div>
          <div className="h-2 rounded bg-muted overflow-hidden">
            <div className="h-full rounded bg-primary" style={{ width: `${(d.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ScaleChart({ stats }: { stats: QuestionStats }) {
  // Mostra todas as notas de 0 a 10, mesmo as sem respostas
  const byNote = new Map(stats.data.map((d) => [Number(d.name), d.value]));
  const data = Array.from({ length: 11 }, (_, n) => ({ name: String(n), value: byNote.get(n) ?? 0 }));
  return (
    <div className="space-y-3">
      {stats.average !== null && (
        <p className="text-sm text-muted-foreground">
          Média <span className="text-3xl font-bold text-foreground tabular-nums">{stats.average.toLocaleString('pt-BR')}</span> de 10
        </p>
      )}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 4, top: 4 }}>
            <CartesianGrid vertical={false} stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--muted))' }}
              formatter={(value: number) => [`${value} (${pct(value, stats.answered)}%)`, 'Respostas']}
              labelFormatter={(label) => `Nota ${label}`}
              contentStyle={{ borderRadius: 8, border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))', fontSize: 12 }}
            />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function QuestionChartCard({
  stats,
  className,
  badge,
}: {
  stats: QuestionStats;
  className?: string;
  badge?: ReactNode;
}) {
  const description =
    stats.kind === 'multi'
      ? `${stats.answered} pessoas responderam · cada uma podia escolher mais de uma opção`
      : `${stats.answered} pessoas responderam`;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{stats.label}</CardTitle>
          {badge}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {stats.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem respostas ainda.</p>
        ) : stats.kind === 'scale' ? (
          <ScaleChart stats={stats} />
        ) : (
          <RankedBars stats={stats} />
        )}
      </CardContent>
    </Card>
  );
}

export function QuestionChartGrid({
  items,
  badgeFor,
}: {
  items: QuestionStats[];
  badgeFor?: (stats: QuestionStats) => ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {items.map((stats) => (
        <QuestionChartCard
          key={stats.key}
          stats={stats}
          badge={badgeFor?.(stats)}
          className={stats.kind === 'multi' ? 'lg:col-span-2' : undefined}
        />
      ))}
    </div>
  );
}
