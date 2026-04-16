import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileCheck, AlertTriangle, BarChart3, GraduationCap, Briefcase, Accessibility, Wifi, Monitor } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const COLORS = [
  'hsl(215, 70%, 55%)', 'hsl(145, 60%, 45%)', 'hsl(35, 85%, 55%)',
  'hsl(0, 65%, 55%)', 'hsl(270, 55%, 55%)', 'hsl(180, 50%, 45%)',
  'hsl(320, 60%, 50%)', 'hsl(50, 70%, 50%)', 'hsl(100, 50%, 45%)',
];

interface Stats {
  totalProfiles: number;
  publishedProfiles: number;
  draftProfiles: number;
  blockedProfiles: number;
  pendingReports: number;
  totalMessages: number;
}

type ProfileRow = {
  status: string;
  age_range: string | null;
  gender: string | null;
  race_color: string | null;
  education_level: string | null;
  employment_status: string | null;
  is_pcd: boolean | null;
  digital_skill_level: string | null;
  internet_access: string | null;
  has_computer: boolean | null;
  interest_areas: string[] | null;
  desired_opportunity_types: string[] | null;
};

function countField(profiles: ProfileRow[], field: keyof ProfileRow): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  profiles.forEach(p => {
    const val = p[field];
    if (typeof val === 'string' && val) {
      counts[val] = (counts[val] || 0) + 1;
    }
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function countBoolean(profiles: ProfileRow[], field: keyof ProfileRow, yesLabel: string, noLabel: string) {
  let yes = 0, no = 0;
  profiles.forEach(p => {
    const v = p[field];
    if (v === true) yes++;
    else if (v === false) no++;
  });
  return [
    { name: yesLabel, value: yes },
    { name: noLabel, value: no },
  ].filter(d => d.value > 0);
}

function countArrayField(profiles: ProfileRow[], field: keyof ProfileRow): { name: string; value: number }[] {
  const counts: Record<string, number> = {};
  profiles.forEach(p => {
    const arr = p[field];
    if (Array.isArray(arr)) {
      arr.forEach((item: string) => {
        if (item) counts[item] = (counts[item] || 0) + 1;
      });
    }
  });
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

function MiniPieChart({ data, title, icon: Icon }: { data: { name: string; value: number }[]; title: string; icon: any }) {
  if (!data.length) return null;
  return (
    <Card className="col-span-1">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Icon className="h-5 w-5 text-primary" />
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function MiniBarChart({ data, title, icon: Icon }: { data: { name: string; value: number }[]; title: string; icon: any }) {
  if (!data.length) return null;
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <Icon className="h-5 w-5 text-primary" />
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" hide />
            <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(215, 70%, 55%)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProfiles: 0, publishedProfiles: 0, draftProfiles: 0,
    blockedProfiles: 0, pendingReports: 0, totalMessages: 0,
  });
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [profilesRes, reports, messages] = await Promise.all([
        supabase.from('profiles').select('status, age_range, gender, race_color, education_level, employment_status, is_pcd, digital_skill_level, internet_access, has_computer, interest_areas, desired_opportunity_types'),
        supabase.from('reports').select('status').eq('status', 'PENDING'),
        supabase.from('messages').select('id', { count: 'exact', head: true }),
      ]);

      const profileList = (profilesRes.data || []) as ProfileRow[];
      setProfiles(profileList);
      setStats({
        totalProfiles: profileList.length,
        publishedProfiles: profileList.filter(p => p.status === 'PUBLISHED').length,
        draftProfiles: profileList.filter(p => p.status === 'DRAFT').length,
        blockedProfiles: profileList.filter(p => p.status === 'BLOCKED').length,
        pendingReports: reports.data?.length || 0,
        totalMessages: messages.count || 0,
      });
      setLoading(false);
    };
    fetchStats();
  }, []);

  const summaryCards = [
    { label: 'Total de Perfis', value: stats.totalProfiles, icon: Users, color: 'text-primary' },
    { label: 'Perfis Publicados', value: stats.publishedProfiles, icon: FileCheck, color: 'text-green-500' },
    { label: 'Rascunhos', value: stats.draftProfiles, icon: BarChart3, color: 'text-yellow-500' },
    { label: 'Bloqueados', value: stats.blockedProfiles, icon: AlertTriangle, color: 'text-destructive' },
    { label: 'Denúncias Pendentes', value: stats.pendingReports, icon: AlertTriangle, color: 'text-orange-500' },
    { label: 'Mensagens Totais', value: stats.totalMessages, icon: BarChart3, color: 'text-blue-500' },
  ];

  const ageData = countField(profiles, 'age_range');
  const genderData = countField(profiles, 'gender');
  const raceData = countField(profiles, 'race_color');
  const educationData = countField(profiles, 'education_level');
  const employmentData = countField(profiles, 'employment_status');
  const pcdData = countBoolean(profiles, 'is_pcd', 'Sim (PcD)', 'Não');
  const digitalData = countField(profiles, 'digital_skill_level');
  const internetData = countField(profiles, 'internet_access');
  const computerData = countBoolean(profiles, 'has_computer', 'Possui', 'Não possui');
  const interestData = countArrayField(profiles, 'interest_areas');
  const opportunityData = countArrayField(profiles, 'desired_opportunity_types');

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Carregando...</p></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground">Visão geral do Observatório da Juventude — {stats.totalProfiles} perfis cadastrados</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <div>
        <h2 className="font-display text-lg font-semibold mb-4">Indicadores dos Perfis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <MiniPieChart data={ageData} title="Distribuição por Faixa Etária" icon={Users} />
          <MiniPieChart data={genderData} title="Gênero" icon={Users} />
          <MiniPieChart data={raceData} title="Raça/Cor (IBGE)" icon={Users} />
          <MiniPieChart data={educationData} title="Escolaridade" icon={GraduationCap} />
          <MiniPieChart data={employmentData} title="Situação Profissional" icon={Briefcase} />
          <MiniPieChart data={pcdData} title="Pessoa com Deficiência" icon={Accessibility} />
          <MiniPieChart data={digitalData} title="Nível Digital" icon={Monitor} />
          <MiniPieChart data={internetData} title="Acesso à Internet" icon={Wifi} />
          <MiniPieChart data={computerData} title="Possui Computador" icon={Monitor} />
        </div>
      </div>

      {/* Bar charts for arrays */}
      {(interestData.length > 0 || opportunityData.length > 0) && (
        <div>
          <h2 className="font-display text-lg font-semibold mb-4">Áreas e Oportunidades</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MiniBarChart data={interestData} title="Áreas de Interesse (Top 10)" icon={BarChart3} />
            <MiniBarChart data={opportunityData} title="Tipos de Oportunidade Desejados" icon={Briefcase} />
          </div>
        </div>
      )}
    </div>
  );
}
