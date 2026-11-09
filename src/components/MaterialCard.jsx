import { Link } from 'react-router-dom';
import Badge from './Badge.jsx';
import StockBar from './StockBar.jsx';
import { IconoMatraz } from './Iconos.jsx';
import { infoCategoria } from '../utils/categorias.js';
import { fmtFecha, fmtNum } from '../utils/format.js';

// Tarjeta de material al estilo "productos destacados": nombre grande con el color
// de la categoría, borde inferior de color y botón de acción.
export default function MaterialCard({ m }) {
  const cat = infoCategoria(m.categoria);
  return (
    <article className="tarjeta-material">
      <Link to={`/materiales/${m.id}`} className="tarjeta-material-cara" style={{ '--cat': cat.color }}>
        <IconoMatraz className="tarjeta-material-fondo" />
        <span className="tarjeta-material-nombre">{m.nombre}</span>
      </Link>
      <div className="tarjeta-material-datos">
        <div className="tarjeta-material-fila">
          <span className="mono tenue">{m.codigo}</span>
          <Badge tipo="stock" valor={m.estado} />
        </div>
        <StockBar disponible={m.stock_disponible} puntoReorden={m.punto_reorden} maximo={m.stock_maximo} />
        <div className="tarjeta-material-fila tenue">
          <span><b className="texto-fuerte">{fmtNum(m.stock_disponible)}</b> {m.unidad} · PR {fmtNum(m.punto_reorden)}</span>
        </div>
        <div className="tarjeta-material-fila tenue">
          <span>Próx. vence: {fmtFecha(m.proximo_vencimiento)}</span>
          {m.stock_vencido > 0 && <span className="texto-danger">{fmtNum(m.stock_vencido)} vencido</span>}
        </div>
      </div>
      <Link to={`/materiales/${m.id}`} className="btn btn-azul">Ver trazabilidad</Link>
    </article>
  );
}
