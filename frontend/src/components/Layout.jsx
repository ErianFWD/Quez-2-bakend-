import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import { IconoMas } from './Iconos.jsx';

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="app">
      <Navbar />
      <main className="contenido" key={pathname}>
        <Outlet />
      </main>
      <Footer />
      <Link to="/movimientos?nuevo=1" className="boton-flotante" title="Registrar movimiento" aria-label="Registrar movimiento">
        <IconoMas />
      </Link>
    </div>
  );
}
