import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface Report {
  id: string;
  reporter_id: string;
  reported_profile_id: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReports = async () => {
    let query = supabase.from('reports').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'ALL') query = query.eq('status', statusFilter as any);
    const { data } = await query;
    setReports((data as Report[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, [statusFilter]);

  const updateStatus = async (reportId: string, newStatus: string) => {
    const update: any = { status: newStatus };
    if (newStatus === 'RESOLVED' || newStatus === 'DISMISSED') {
      update.resolved_at = new Date().toISOString();
    }
    const { error } = await supabase.from('reports').update(update).eq('id', reportId);
    if (error) {
      toast.error('Erro ao atualizar denúncia');
    } else {
      toast.success('Denúncia atualizada');
      if (user) {
        await supabase.from('admin_logs').insert({
          admin_id: user.id,
          action: `report_${newStatus.toLowerCase()}`,
          target_id: reportId,
        });
      }
      fetchReports();
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      PENDING: { variant: 'destructive', label: 'Pendente' },
      REVIEWED: { variant: 'secondary', label: 'Em análise' },
      RESOLVED: { variant: 'default', label: 'Resolvida' },
      DISMISSED: { variant: 'outline', label: 'Descartada' },
    };
    const s = map[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Denúncias</h1>
        <p className="text-muted-foreground">Gerencie denúncias de perfis</p>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filtrar status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas</SelectItem>
          <SelectItem value="PENDING">Pendentes</SelectItem>
          <SelectItem value="REVIEWED">Em análise</SelectItem>
          <SelectItem value="RESOLVED">Resolvidas</SelectItem>
          <SelectItem value="DISMISSED">Descartadas</SelectItem>
        </SelectContent>
      </Select>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : reports.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhuma denúncia encontrada</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardContent className="py-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{report.reason}</span>
                      {statusBadge(report.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{report.description || 'Sem descrição adicional'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(report.created_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                {report.status === 'PENDING' && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateStatus(report.id, 'REVIEWED')}>Analisar</Button>
                    <Button size="sm" variant="default" onClick={() => updateStatus(report.id, 'RESOLVED')}>Resolver</Button>
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(report.id, 'DISMISSED')}>Descartar</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
