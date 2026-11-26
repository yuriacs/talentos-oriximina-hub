import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <span className="font-display text-4xl font-bold gradient-text">404</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold mb-4">
            Página não encontrada
          </h1>
          <p className="text-muted-foreground mb-8">
            A página que você está procurando não existe ou foi movida para outro endereço.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/">
              <Button className="gap-2 gradient-bg hover:opacity-90">
                <Home className="h-4 w-4" />
                Voltar ao Início
              </Button>
            </Link>
            <Link to="/explorar">
              <Button variant="outline" className="gap-2">
                <Search className="h-4 w-4" />
                Explorar Perfis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
