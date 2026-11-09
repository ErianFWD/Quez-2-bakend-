import { Link } from 'react-router-dom';
import { IconoCorreo, IconoTelefono, IconoUbicacion, Logo } from './Iconos.jsx';

export default function Footer() {
  return (
    <footer className="pie">
      <div className="contenedor pie-columnas">
        <div>
          <Link to="/" className="marca marca-pie">
            <Logo className="marca-logo" />
            <span className="marca-texto"><strong>Eco<em>Obra</em></strong><small>Químicos S.A.</small></span>
          </Link>
          <ul className="pie-contacto">
            <li><IconoTelefono className="ico-mini" /> (+506) 2661-0000</li>
            <li><IconoCorreo className="ico-mini" /> bodega@ecoobra.example</li>
            <li><IconoUbicacion className="ico-mini" /> El Roble, Puntarenas, Costa Rica</li>
          </ul>
          <p className="pie-legal">Proyecto académico · Quiz #2 Gestión de Inventarios · Datos ficticios</p>
        </div>

        <div>
          <h3>Inventario</h3>
          <ul className="pie-enlaces">
            <li><Link to="/materiales">Materiales</Link></li>
            <li><Link to="/lotes">Lotes y vencimientos</Link></li>
            <li><Link to="/movimientos">Movimientos</Link></li>
            <li><Link to="/ordenes">Órdenes de compra</Link></li>
          </ul>
        </div>

        <div>
          <h3>Control</h3>
          <ul className="pie-enlaces">
            <li><Link to="/alertas">Alertas de reorden</Link></li>
            <li><Link to="/alertas">Alertas de vencimiento</Link></li>
            <li><Link to="/ordenes">Compras duplicadas</Link></li>
            <li><Link to="/configuracion">Configuración</Link></li>
          </ul>
        </div>

        <div>
          <h3>Reglas</h3>
          <ul className="pie-enlaces pie-reglas">
            <li>PR = demanda prom. × entrega + SS</li>
            <li>SS = (dem. máx − dem. prom) × entrega</li>
            <li>FEFO: sale primero lo que vence primero</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
