import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Search, Eye, KeyRound, Mail, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  profile_id: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionUser, setActionUser] = useState<AdminUser | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [resetting, setResetting] = useState(false);
  const [sendingLink, setSendingLink] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke(
      'admin-user-management',
      { body: { action: 'list_users', search } },
    );
    if (error) {
      toast.error('Erro ao carregar usuários');
      setUsers([]);
    } else {
      setUsers((data as any)?.users ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const resetPassword = async () => {
    if (!actionUser) return;
    setResetting(true);
    const { data, error } = await supabase.functions.invoke(
      'admin-user-management',
      { body: { action: 'reset_password', user_id: actionUser.id } },
    );
    setResetting(false);
    if (error || !(data as any)?.temp_password) {
      toast.error('Erro ao redefinir senha');
      return;
    }
    setTempPassword((data as any).temp_password);
    toast.success('Senha temporária gerada');
  };

  const sendRecoveryLink = async (u: AdminUser) => {
    setSendingLink(true);
    const { error } = await supabase.functions.invoke(
      'admin-user-management',
      {
        body: {
          action: 'send_recovery_link',
          email: u.email,
          redirect_to: `${window.location.origin}/reset-password`,
        },
      },
    );
    setSendingLink(false);
    if (error) toast.error('Erro ao enviar link');
    else toast.success('Link de recuperação enviado por e-mail');
  };

  const closeDialog = () => {
    setActionUser(null);
    setTempPassword(null);
  };

  const copy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success('Copiado!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Gerenciar Usuários</h1>
        <p className="text-muted-foreground">
          Acesso, recuperação de senha e dados de cadastro
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-8">Carregando...</p>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum usuário encontrado
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">
                      {u.full_name || '(sem nome)'}
                    </span>
                    {u.email_confirmed_at ? (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                        E-mail confirmado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-orange-500 border-orange-500">
                        E-mail pendente
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground break-all">
                    {u.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cadastro: {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    {' · '}
                    Último login:{' '}
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString('pt-BR')
                      : 'nunca'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {u.profile_id && (
                    <Link to={`/perfil/${u.profile_id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> Perfil
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={sendingLink}
                    onClick={() => sendRecoveryLink(u)}
                  >
                    <Mail className="h-4 w-4 mr-1" /> Enviar link
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActionUser(u);
                      setTempPassword(null);
                    }}
                  >
                    <KeyRound className="h-4 w-4 mr-1" /> Senha temporária
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!actionUser}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir senha temporária</DialogTitle>
            <DialogDescription>
              {tempPassword ? (
                <>
                  Senha gerada para <strong>{actionUser?.email}</strong>. Copie
                  agora — ela <strong>não será exibida novamente</strong>.
                </>
              ) : (
                <>
                  Isso vai sobrescrever a senha atual de{' '}
                  <strong>{actionUser?.email}</strong>. O usuário precisará usar
                  a nova senha para entrar.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {tempPassword && (
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3 font-mono text-base">
              <span className="flex-1 break-all">{tempPassword}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copy(tempPassword)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}

          <DialogFooter>
            {tempPassword ? (
              <Button onClick={closeDialog}>Concluir</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={closeDialog}>
                  Cancelar
                </Button>
                <Button onClick={resetPassword} disabled={resetting}>
                  {resetting && (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  )}
                  Gerar senha
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
