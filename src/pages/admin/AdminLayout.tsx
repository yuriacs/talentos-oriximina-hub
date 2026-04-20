import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { cn } from '@/lib/utils';
import { BarChart3, Users, AlertTriangle, ScrollText, Building2, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminNav = [
  { href: '/admin', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/perfis', label: 'Perfis', icon: Users },
  { href: '/admin/usuarios', label: 'Usuários', icon: KeyRound },
  { href: '/admin/empresas', label: 'Empresas', icon: Building2 },
  { href: '/admin/denuncias', label: 'Denúncias', icon: AlertTriangle },
  { href: '/admin/logs', label: 'Logs', icon: ScrollText },
];

export default function AdminLayout() {
  const { isAdmin, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <Layout hideFooter>
      <div className="min-h-[calc(100vh-4rem)] flex">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 flex-col border-r border-border/40 bg-muted/30 p-4 gap-2">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" /> Voltar ao site
          </Link>
          {adminNav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                location.pathname === item.href
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </aside>

        {/* Mobile nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border/40 flex">
          {adminNav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2 text-xs',
                location.pathname === item.href ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </Layout>
  );
}
