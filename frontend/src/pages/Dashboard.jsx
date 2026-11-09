import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import Badge from '../components/Badge.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado.jsx';
import { IconoAlerta, IconoCaja, IconoReloj, IconoRuta } from '../components/Iconos.jsx';
import { CATEGORIAS } from '../utils/categorias.js';
import { fmtFecha, fmtNum, textoDias } from '../utils/format.js';

export default function Dashboard() {
  const { data, loading, error, reload } = useApi(async () => {
    const [materiales, reorden, lotes, duplicados] = await Promise.all([
      api.getMateriales(),
      api.getAlertasReorden(),
      api.getLotes(),
      api.getPosiblesDuplicados(),
    ]);
    return { materiales, reorden, lotes, duplicados };
  }, []);

  return (
    <>
      {/* ===== Portada con corte en "V" ===== */}
      <section className="hero-inicio ancho-completo">
        <div className="contenedor">
          <span className="hero-etiqueta">Control de materiales con fecha de vencimiento</span>
          <h1>Distribuidora de selladores, adhesivos y químicos de obra</h1>
          <p>Stock por lote y bodega, alertas de reorden, vencimientos con FEFO y trazabilidad hasta la orden de compra.</p>
          <div className="hero-botones">
            <Link to="/materiales" className="btn btn-azul">Ver materiales</Link>
            <Link to="/alertas" className="btn-contorno btn-contorno-claro">Ver alertas</Link>
          </div>
        </div>
      </section>

      {loading ? <div className="contenedor"><Cargando /></div> : error ? <div className="contenedor"><ErrorCaja error={error} onReintentar={reload} /></div> : (
        <Contenido {...data} />
      )}
    </>
  );
}

function Contenido({ materiales, reorden, lotes, duplicados }) {
  const vencidos = lotes.filter((l) => l.estado_vencimiento === 'vencido');
  const criticos = lotes.filter((l) => l.estado_vencimiento === 'critico');
  const proximos = lotes.filter((l) => l.dias_para_vencer >= 0).slice(0, 6);
  const destacados = reorden.length ? reorden.slice(0, 4) : materiales.slice(0, 4);

  const numeros = [
    { valor: materiales.length, texto: 'Materiales activos', tono: 'ok' },
    { valor: reorden.length, texto: 'Bajo punto de reorden', tono: reorden.length ? 'warn' : 'ok' },
    { valor: vencidos.length, texto: 'Lotes vencidos', tono: vencidos.length ? 'danger' : 'ok' },
    { valor: criticos.length, texto: 'Vencen pronto', tono: criticos.length ? 'warn' : 'ok' },
    { valor: duplicados.length, texto: 'OC posiblemente duplicadas', tono: duplicados.length ? 'danger' : 'ok' },
  ];

  return (
    <>
      {/* ===== Lo que hace el sistema ===== */}
      <section className="ancho-completo seccion">
        <div className="contenedor servicios">
          {[
            { Icono: IconoCaja, titulo: 'Stock por lote', texto: 'Cada entrada crea un lote con su vencimiento' },
            { Icono: IconoAlerta, titulo: 'Alertas de reorden', texto: 'PR calculado, nunca digitado' },
            { Icono: IconoReloj, titulo: 'Vencimientos FEFO', texto: 'Sale primero lo que vence primero' },
            { Icono: IconoRuta, titulo: 'Trazabilidad', texto: 'De cada existencia hasta su OC' },
          ].map(({ Icono, titulo, texto }) => (
            <div className="servicio" key={titulo}>
              <span className="servicio-icono"><Icono /></span>
              <div><strong>{titulo}</strong><span>{texto}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Misión del sistema + números ===== */}
      <section className="ancho-completo seccion seccion-gris">
        <div className="contenedor dos-columnas">
          <div className="hexagonos-decorativos" aria-hidden="true">
            {Object.entries(CATEGORIAS).slice(0, 3).map(([nombre, c], i) => (
              <div key={nombre} className={`hex hex-deco hex-deco-${i}`} style={{ background: c.fondo }}>
                <c.Icono className="hex-icono-grande" />
              </div>
            ))}
          </div>
          <div>
            <h2 className="titulo-seccion">Nos aseguramos de que ningún producto se venza en bodega</h2>
            <div className="mision-vision">
              <div>
                <h3>Reorden</h3>
                <p>El sistema compara el stock disponible (sin lotes vencidos) contra el punto de reorden de cada material y avisa qué reponer y cuánto pedir.</p>
              </div>
              <div>
                <h3>Vencimientos</h3>
                <p>Los lotes se ordenan por fecha de vencimiento. Los vencidos no se pueden despachar y se dan de baja con un ajuste con motivo.</p>
              </div>
            </div>
            <h3 className="subtitulo-mayus">EcoObra en números</h3>
            <div className="circulos">
              {numeros.map((n) => (
                <div className={`circulo circulo-${n.tono}`} key={n.texto}>
                  <strong>{n.valor}</strong>
                  <span>{n.texto}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Categorías en hexágonos ===== */}
      <section className="ancho-completo seccion">
        <div className="contenedor centrado">
          <h2 className="titulo-mayus">Categorías que manejamos</h2>
          <p className="subtitulo-centro">Los diferentes químicos de obra en inventario</p>
          <div className="hexagonos">
            {Object.entries(CATEGORIAS).map(([nombre, c], i) => {
              const cantidad = materiales.filter((m) => m.categoria === nombre).length;
              return (
                <Link to={`/materiales?categoria=${encodeURIComponent(nombre)}`} key={nombre} className={`hex hex-categoria ${i % 2 ? 'hex-bajo' : ''}`} style={{ background: c.fondo }}>
                  <span className="hex-sello"><c.Icono /></span>
                  <strong>{nombre}</strong>
                  <small>{cantidad} material{cantidad === 1 ? '' : 'es'}</small>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== Tarjetas tipo "productos destacados" ===== */}
      <section className="ancho-completo seccion seccion-gris">
        <div className="contenedor">
          <h2 className="titulo-seccion centrado">{reorden.length ? 'Materiales por reponer' : 'Materiales destacados'}</h2>
          <div className="rejilla-tarjetas">
            {destacados.map((m) => <MaterialCard key={m.id} m={m} />)}
          </div>
        </div>
      </section>

      {/* ===== Vencimientos y duplicados ===== */}
      <section className="ancho-completo seccion">
        <div className="contenedor grid-2">
          <div className="panel">
            <div className="panel-cabecera">
              <h2>Próximos vencimientos</h2>
              <Link to="/lotes">Ver todos →</Link>
            </div>
            {proximos.length === 0 ? <Vacio texto="No hay lotes vigentes." /> : (
              <ul className="lista">
                {proximos.map((l) => (
                  <li key={`${l.lote_id}-${l.bodega_id}`}>
                    <div className="lista-principal">
                      <Link to={`/materiales/${l.material_id}`} className="enlace-fuerte">{l.material_nombre}</Link>
                      <span className="tenue">Lote <span className="mono">{l.codigo_lote}</span> · {l.bodega_nombre}</span>
                    </div>
                    <div className="lista-derecha">
                      <strong>{textoDias(l.dias_para_vencer)}</strong>
                      <span className="tenue">{fmtFecha(l.fecha_vencimiento)}</span>
                    </div>
                    <Badge tipo="vencimiento" valor={l.estado_vencimiento} />
                  </li>
                ))}
              </ul>
            )}
            {vencidos.length > 0 && (
              <div className="aviso" style={{ marginTop: 12 }}>
                Hay {vencidos.length} lote(s) vencido(s) con {fmtNum(vencidos.reduce((s, l) => s + l.cantidad, 0))} unidades en bodega.{' '}
                <Link to="/lotes">Revisar</Link>
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-cabecera">
              <h2>Posibles compras duplicadas</h2>
              <Link to="/ordenes">Ver órdenes →</Link>
            </div>
            {duplicados.length === 0 ? <Vacio texto="No se detectaron duplicados." /> : (
              <ul className="lista">
                {duplicados.map((p) => (
                  <li key={`${p.oc_a.id}-${p.oc_b.id}`}>
                    <div className="lista-principal">
                      <span className="enlace-fuerte mono">{p.oc_a.codigo} ↔ {p.oc_b.codigo}</span>
                      <span className="tenue">{p.oc_a.material_nombre} · {p.oc_a.proveedor_nombre}</span>
                    </div>
                    <div className="lista-derecha">
                      <strong>{p.diferencia_dias} d</strong>
                      <span className="tenue">±{p.diferencia_cantidad_pct}% cant.</span>
                    </div>
                    <Badge tono="danger">Revisar</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {/* ===== Caja de acción (como el boletín del sitio de referencia) ===== */}
      <section className="ancho-completo seccion seccion-gris">
        <div className="contenedor">
          <div className="caja-accion">
            <h2>¿Llegó mercadería a bodega?</h2>
            <div className="caja-accion-botones">
              <Link to="/ordenes" className="btn btn-azul">Recibir una OC</Link>
              <Link to="/movimientos?nuevo=1" className="btn-contorno">Registrar movimiento</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
