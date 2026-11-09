import { Link } from 'react-router-dom';

// Banner oscuro con título grande (estilo "Tienda" del sitio de referencia).
// migas: [{ texto, to }] para la ruta de navegación.
export default function PageHeader({ titulo, subtitulo, migas = [], children }) {
  return (
    <section className="hero-pagina">
      <div className="contenedor hero-pagina-contenido">
        <div>
          <nav className="migas">
            <Link to="/">Inicio</Link>
            {migas.map((m) => (
              <span key={m.texto}> / {m.to ? <Link to={m.to}>{m.texto}</Link> : m.texto}</span>
            ))}
          </nav>
          <h1>{titulo}</h1>
          {subtitulo && <p>{subtitulo}</p>}
        </div>
        {children && <div className="page-actions">{children}</div>}
      </div>
    </section>
  );
}
