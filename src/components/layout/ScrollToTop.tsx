import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// O React Router mantém a rolagem da página anterior; ao trocar de página, volta ao topo.
// Links com âncora (#contato) ficam por conta da própria página.
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}
