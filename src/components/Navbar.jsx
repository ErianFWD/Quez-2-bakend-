import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { api, API_INFO } from '../services/api.js';
import { IconoAlerta, IconoTelefono, IconoUbicacion, Logo } from './Iconos.jsx';

const enlaces = [
  { to: '/', texto: 'Inicio', fin: true },
  { to: '/materiales', texto: 'Materiales' },
  { to: '/lotes', texto: 'Vencimientos' },
  { to: '/movimientos', texto: 'Movimientos' },
  { to: '/ordenes', texto: 'Órdenes' },
];

export default function Navbar() {
  const [alertas, setAlertas] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [compacto, setCompacto] = useState(false);
  const ubicacion = useLocation();
  const navegar = useNavigate();

  // Contador de alertas (se actualiza al cambiar de página)
  useEffect(() => {
    setMenuAbierto(false);
    Promise.all([api.getAlertasReorden(), api.getAlertasVencimiento()])
      .then(([r, v]) => setAlertas(r.length + v.length))
      .catch(() => setAlertas(null));
  }, [ubicacion.pathname]);

  // El menú se achica al bajar, como en el sitio de referencia
  useEffect(() => {
    const alBajar = () => setCompacto(window.scrollY > 40);
    window.addEventListener('scroll', alBajar);
    return () => window.removeEventListener('scroll', alBajar);
  }, []);

  function buscar(e) {
    e.preventDefault();
    navegar(`/materiales?q=${encodeURIComponent(busqueda.trim())}`);
  }

  return (
    <header className={`cabecera ${compacto ? 'compacta' : ''}`}>
      <div className="barra-superior">
        <div className="contenedor barra-superior-contenido">
          <div className="barra-datos">
            <span><IconoTelefono className="ico-mini" /> (+506) 2661-0000</span>
            <span><IconoUbicacion className="ico-mini" /> El Roble, Puntarenas, Costa Rica</span>
          </div>
          <div className="barra-datos">
            <form onSubmit={buscar} className="buscador">
              <input placeholder="Buscar material…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
            </form>
            <span className={`modo-chip ${API_INFO.modo}`} title={API_INFO.modo === 'demo' ? 'Datos guardados en el navegador' : API_INFO.baseUrl}>
              {API_INFO.modo === 'demo' ? 'Modo demostración' : 'API conectada'}
            </span>
          </div>
        </div>
      </div>

      <nav className="navegacion">
        <div className="contenedor navegacion-contenido">
          <Link to="/" className="marca">
            <Logo className="marca-logo" />
            <span className="marca-texto">
              <strong>Eco<em>Obra</em></strong>
              <small>Químicos S.A.</small>
            </span>
          </Link>

          <button className="hamburguesa" onClick={() => setMenuAbierto((a) => !a)} aria-label="Abrir menú">
            <span /><span /><span />
          </button>

          <div className={`menu ${menuAbierto ? 'abierto' : ''}`}>
            {enlaces.map((e) => (
              <NavLink key={e.to} to={e.to} end={e.fin} className={({ isActive }) => `menu-enlace ${isActive ? 'activo' : ''}`}>
                {e.texto}
              </NavLink>
            ))}
            <Link to="/movimientos?nuevo=1" className="btn-contorno">Registrar movimiento</Link>
            <Link to="/alertas" className="contador-alertas">
              <span className="contador-icono"><IconoAlerta /></span>
              <span><b>{alertas ?? '–'}</b> alertas activas</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
