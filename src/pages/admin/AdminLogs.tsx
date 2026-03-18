import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';

interface Log {
  id: string;
  admin_id: string;
  action: string;
  target_id: string | null;
  details: any;
  created_at: string;
}

export default function AdminLogs() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from('admin_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs((data as Log[]) || []);
      setLoading(false);
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Logs de Atividade</h1>
        <p className="text-muted-foreground">Registro de ações administrativas</p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : logs.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum log encontrado</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <Card key={log.id}>
              <CardContent className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-medium text-sm">{log.action.replace(/_/g, ' ')}</span>
                  {log.target_id && <span className="text-xs text-muted-foreground ml-2">Alvo: {log.target_id.slice(0, 8)}...</span>}
                </div>
                <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString('pt-BR')}</span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
