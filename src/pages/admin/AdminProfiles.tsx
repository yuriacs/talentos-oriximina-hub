import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Shield, ShieldOff, CheckCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  city: string;
  status: string;
  is_verified: boolean;
  profile_completion: number;
  created_at: string;
}

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfiles = async () => {
    let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'ALL') query = query.eq('status', statusFilter as any);
    if (search) query = query.ilike('full_name', `%${search}%`);
    const { data } = await query;
    setProfiles((data as Profile[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, [statusFilter, search]);

  const updateProfileStatus = async (profileId: string, newStatus: string) => {
    const { error } = await supabase.from('profiles').update({ status: newStatus as any }).eq('id', profileId);
    if (error) {
      toast.error('Erro ao atualizar status');
    } else {
      toast.success(`Perfil ${newStatus === 'BLOCKED' ? 'bloqueado' : 'atualizado'}`);
      // Log action
      if (user) {
        await supabase.from('admin_logs').insert({
          admin_id: user.id,
          action: `profile_status_changed_to_${newStatus}`,
          target_id: profileId,
        });
      }
      fetchProfiles();
    }
  };

  const toggleVerified = async (profileId: string, current: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_verified: !current }).eq('id', profileId);
    if (error) {
      toast.error('Erro ao atualizar verificação');
    } else {
      toast.success(!current ? 'Perfil verificado!' : 'Verificação removida');
      if (user) {
        await supabase.from('admin_logs').insert({
          admin_id: user.id,
          action: !current ? 'profile_verified' : 'profile_unverified',
          target_id: profileId,
        });
      }
      fetchProfiles();
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      PUBLISHED: { variant: 'default', label: 'Publicado' },
      DRAFT: { variant: 'secondary', label: 'Rascunho' },
      BLOCKED: { variant: 'destructive', label: 'Bloqueado' },
    };
    const s = map[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Gerenciar Perfis</h1>
        <p className="text-muted-foreground">Moderação e gestão de perfis dos jovens</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="PUBLISHED">Publicados</SelectItem>
            <SelectItem value="DRAFT">Rascunhos</SelectItem>
            <SelectItem value="BLOCKED">Bloqueados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : profiles.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum perfil encontrado</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <Card key={profile.id}>
              <CardContent className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{profile.full_name}</span>
                    {profile.is_verified && <Badge variant="outline" className="text-green-600 border-green-600 text-xs">✓ Verificado</Badge>}
                    {statusBadge(profile.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.city} · {profile.profile_completion}% completo · {new Date(profile.created_at).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link to={`/perfil/${profile.id}`}>
                    <Button variant="ghost" size="sm"><Eye className="h-4 w-4 mr-1" /> Ver</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => toggleVerified(profile.id, profile.is_verified)}>
                    <CheckCircle className={`h-4 w-4 mr-1 ${profile.is_verified ? 'text-green-600' : ''}`} />
                    {profile.is_verified ? 'Desverificar' : 'Verificar'}
                  </Button>
                  {profile.status !== 'BLOCKED' ? (
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => updateProfileStatus(profile.id, 'BLOCKED')}>
                      <ShieldOff className="h-4 w-4 mr-1" /> Bloquear
                    </Button>
                  ) : (
                    <Button variant="ghost" size="sm" className="text-green-600" onClick={() => updateProfileStatus(profile.id, 'DRAFT')}>
                      <Shield className="h-4 w-4 mr-1" /> Desbloquear
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
