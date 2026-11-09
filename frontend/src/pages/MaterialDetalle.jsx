import { Link, useParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import KpiCard from '../components/KpiCard.jsx';
import Badge from '../components/Badge.jsx';
import StockBar from '../components/StockBar.jsx';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado.jsx';
import { fmtFecha, fmtFechaHora, fmtNum, textoDias } from '../utils/format.js';

// Consulta de trazabilidad: historial de movimientos de un material
// y la OC de donde proviene cada entrada.
export default function MaterialDetalle() {
  const { id } = useParams();
  const { data, loading, error, reload } = useApi(() => api.getTrazabilidad(id), [id]);

  if (loading) return <Cargando />;
  if (error) return <ErrorCaja error={error} onReintentar={reload} />;

  const { material: m, existencias, movimientos } = data;

  return (
    <>
      <PageHeader titulo={m.nombre} migas={[{ texto: 'Materiales', to: '/materiales' }, { texto: m.codigo }]} subtitulo={`${m.codigo} · ${m.categoria} · unidad: ${m.unidad}`}>
        <Badge tipo="stock" valor={m.estado} />
      </PageHeader>

      <section className="kpis">
        <KpiCard etiqueta="Disponible" valor={fmtNum(m.stock_disponible)} detalle={`${m.unidad} despachables`} tono={m.estado === 'ok' ? 'ok' : 'warn'} />
        <KpiCard etiqueta="Vencido en bodega" valor={fmtNum(m.stock_vencido)} detalle="No se puede despachar" tono={m.stock_vencido ? 'danger' : 'neutral'} />
        <KpiCard etiqueta="Stock de seguridad" valor={fmtNum(m.stock_seguridad)} detalle={`(${m.demanda_maxima} − ${m.demanda_promedio}) × ${m.tiempo_entrega} d`} />
        <KpiCard etiqueta="Punto de reorden" valor={fmtNum(m.punto_reorden)} detalle={`${m.demanda_promedio} × ${m.tiempo_entrega} + ${m.stock_seguridad}`} />
        <KpiCard etiqueta="Mín / Máx" valor={`${fmtNum(m.stock_minimo)} / ${fmtNum(m.stock_maximo)}`} detalle={`Vida útil ${m.vida_util_dias} días`} />
      </section>

      <section className="panel">
        <div className="panel-cabecera"><h2>Nivel de stock</h2></div>
        <StockBar disponible={m.stock_disponible} puntoReorden={m.punto_reorden} maximo={m.stock_maximo} />
        <p className="nota">La línea oscura marca el punto de reorden. Si la barra queda a la izquierda de la línea, hay que reponer.</p>
      </section>

      <section className="panel sin-padding">
        <div className="panel-cabecera con-padding"><h2>Existencias por lote (orden FEFO)</h2></div>
        {existencias.length === 0 ? <Vacio texto="Sin existencias." /> : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr><th>Lote</th><th>Bodega</th><th className="num">Cantidad</th><th>Vence</th><th>Días</th><th>Estado</th><th>OC origen</th><th>Proveedor</th></tr>
              </thead>
              <tbody>
                {existencias.map((e) => (
                  <tr key={`${e.lote_id}-${e.bodega_id}`}>
                    <td className="mono">{e.codigo_lote}</td>
                    <td>{e.bodega_nombre}</td>
                    <td className="num">{fmtNum(e.cantidad)}</td>
                    <td>{fmtFecha(e.fecha_vencimiento)}</td>
                    <td>{textoDias(e.dias_para_vencer)}</td>
                    <td><Badge tipo="vencimiento" valor={e.estado_vencimiento} /></td>
                    <td className="mono">{e.oc_codigo ?? '—'}</td>
                    <td>{e.proveedor_nombre ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-cabecera"><h2>Historial de movimientos</h2></div>
        {movimientos.length === 0 ? <Vacio texto="Este material no tiene movimientos." /> : (
          <ol className="linea-tiempo">
            {movimientos.map((mv) => (
              <li key={mv.id} className={`lt-${mv.tipo}`}>
                <div className="lt-punto" />
                <div className="lt-contenido">
                  <div className="lt-fila">
                    <Badge tipo="movimiento" valor={mv.tipo} />
                    <strong>{mv.cantidad > 0 && mv.tipo !== 'salida' ? '+' : mv.tipo === 'salida' ? '−' : ''}{fmtNum(Math.abs(mv.cantidad))} {mv.unidad}</strong>
                    <span className="tenue">{fmtFechaHora(mv.fecha)}</span>
                  </div>
                  <div className="lt-detalle">
                    Lote <span className="mono">{mv.codigo_lote}</span>
                    {mv.bodega_origen && <> · de <strong>{mv.bodega_origen}</strong></>}
                    {mv.bodega_destino && <> · a <strong>{mv.bodega_destino}</strong></>}
                  </div>
                  <div className="lt-detalle tenue">
                    {mv.documento_tipo}: <span className="mono">{mv.documento_ref}</span> · usuario {mv.usuario}
                    {mv.tipo === 'entrada' && mv.proveedor_nombre && <> · proveedor {mv.proveedor_nombre}</>}
                    {mv.tipo !== 'entrada' && mv.oc_origen && <> · el lote proviene de <span className="mono">{mv.oc_origen}</span></>}
                  </div>
                  {mv.observacion && <div className="lt-detalle tenue">“{mv.observacion}”</div>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}
