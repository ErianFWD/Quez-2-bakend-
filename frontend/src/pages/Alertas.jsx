import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import StockBar from '../components/StockBar.jsx';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado.jsx';
import { fmtFecha, fmtNum, textoDias } from '../utils/format.js';

export default function Alertas() {
  const { data, loading, error, reload } = useApi(async () => {
    const [reorden, vencimientos, config] = await Promise.all([
      api.getAlertasReorden(), api.getAlertasVencimiento(), api.getConfiguracion(),
    ]);
    return { reorden, vencimientos, config };
  }, []);

  if (loading) return <Cargando />;
  if (error) return <ErrorCaja error={error} onReintentar={reload} />;

  const { reorden, vencimientos, config } = data;

  return (
    <>
      <PageHeader titulo="Alertas" migas={[{ texto: 'Alertas' }]} subtitulo="Tabla de alertas generada por el sistema a partir del stock y las fechas de vencimiento.">
        <button className="btn btn-sec" onClick={reload}>Actualizar</button>
      </PageHeader>

      <section className="panel sin-padding">
        <div className="panel-cabecera con-padding">
          <h2>Reorden ({reorden.length})</h2>
          <span className="tenue">Disponible ≤ punto de reorden · ordenado por urgencia</span>
        </div>
        {reorden.length === 0 ? <Vacio texto="No hay materiales bajo el punto de reorden." /> : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr><th>#</th><th>Material</th><th className="num">Disponible</th><th className="num">PR</th><th style={{ width: 150 }}>Nivel</th><th className="num">Sugerido pedir</th><th>Estado</th></tr>
              </thead>
              <tbody>
                {reorden.map((m, i) => (
                  <tr key={m.id}>
                    <td><strong>{i + 1}</strong></td>
                    <td><Link to={`/materiales/${m.id}`} className="enlace-fuerte">{m.nombre}</Link><div className="mono tenue">{m.codigo}</div></td>
                    <td className="num">{fmtNum(m.stock_disponible)} <span className="tenue">{m.unidad}</span></td>
                    <td className="num">{fmtNum(m.punto_reorden)}</td>
                    <td><StockBar disponible={m.stock_disponible} puntoReorden={m.punto_reorden} maximo={m.stock_maximo} /></td>
                    <td className="num"><strong>{fmtNum(m.cantidad_sugerida)}</strong> <span className="tenue">hasta el máx.</span></td>
                    <td><Badge tipo="stock" valor={m.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel sin-padding">
        <div className="panel-cabecera con-padding">
          <h2>Vencimientos ({vencimientos.length})</h2>
          <span className="tenue">Lotes vencidos o que vencen en ≤ {config.dias_alerta_critica} días</span>
        </div>
        {vencimientos.length === 0 ? <Vacio texto="No hay lotes vencidos ni por vencer." /> : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr><th>Estado</th><th>Material</th><th>Lote</th><th>Bodega</th><th className="num">Cantidad</th><th>Vence</th><th>Acción recomendada</th></tr>
              </thead>
              <tbody>
                {vencimientos.map((l) => (
                  <tr key={`${l.lote_id}-${l.bodega_id}`} className={l.estado_vencimiento === 'vencido' ? 'fila-danger' : ''}>
                    <td><Badge tipo="vencimiento" valor={l.estado_vencimiento} /></td>
                    <td><Link to={`/materiales/${l.material_id}`} className="enlace-fuerte">{l.material_nombre}</Link></td>
                    <td className="mono">{l.codigo_lote}</td>
                    <td>{l.bodega_nombre}</td>
                    <td className="num">{fmtNum(l.cantidad)} {l.unidad}</td>
                    <td>{fmtFecha(l.fecha_vencimiento)} <span className="tenue">({textoDias(l.dias_para_vencer)})</span></td>
                    <td>{l.estado_vencimiento === 'vencido' ? 'Dar de baja con ajuste y gestionar desecho' : 'Despachar primero (FEFO) o promocionar'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
