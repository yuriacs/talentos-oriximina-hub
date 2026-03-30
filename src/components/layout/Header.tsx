import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, User, LogIn, LogOut, Shield, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const navLinks = [
  { href: '/', label: 'Início' },
  { href: '/explorar', label: 'Explorar Perfis' },
  { href: '/cadastro-empresa', label: 'Empresas' },
  { href: '/sobre', label: 'Sobre' },
  { href: '/como-funciona', label: 'Como Funciona' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-white/20"
      style={{
        backgroundImage: "url('/header-bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-0.1 group">
          <div className="flex items-center justify-center transition-transform group-hover:scale-105">
            <img src="/logo-observatorio.png" alt="Observatório da Juventude" className="h-14 w-14 object-contain drop-shadow-md" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg font-bold leading-none text-white drop-shadow">
              Observatório
            </span>
            <span className="text-[15px] text-white/75 leading-none">da Juventude de Oriximiná</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                isActive(link.href)
                  ? "bg-white/25 text-white font-semibold"
                  : "text-white/85 hover:text-white hover:bg-white/15"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to="/meu-perfil">
                <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:text-white hover:bg-white/15">
                  <UserCircle className="h-4 w-4" />Meu Perfil
                </Button>
              </Link>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:text-white hover:bg-white/15">
                    <Shield className="h-4 w-4" />Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:text-white hover:bg-white/15" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-2 text-white/90 hover:text-white hover:bg-white/15">
                  <LogIn className="h-4 w-4" />Entrar
                </Button>
              </Link>
              <Link to="/cadastro">
                <Button size="sm" className="gap-2 font-semibold shadow" style={{ backgroundImage: 'none', backgroundColor: 'white', color: 'hsl(var(--primary))' }}>
                  <User className="h-4 w-4" />Criar Perfil
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/15">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[350px]">
            <div className="flex flex-col gap-6 mt-6">
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "px-4 py-3 text-base font-medium rounded-lg transition-colors",
                      isActive(link.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="flex flex-col gap-3 pt-4 border-t">
                {user ? (
                  <>
                    <Link to="/meu-perfil" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2"><UserCircle className="h-4 w-4" />Meu Perfil</Button>
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full gap-2"><Shield className="h-4 w-4" />Painel Admin</Button>
                      </Link>
                    )}
                    <Button variant="outline" className="w-full gap-2" onClick={() => { handleSignOut(); setIsOpen(false); }}>
                      <LogOut className="h-4 w-4" />Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full gap-2"><LogIn className="h-4 w-4" />Entrar</Button>
                    </Link>
                    <Link to="/cadastro" onClick={() => setIsOpen(false)}>
                      <Button className="w-full gap-2 gradient-bg"><User className="h-4 w-4" />Criar Perfil</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
