import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado.jsx';
import { fmtFecha, fmtNum, textoDias } from '../utils/format.js';

const ESTADOS = [
  { valor: 'todos', texto: 'Todos' },
  { valor: 'vencido', texto: 'Vencidos' },
  { valor: 'critico', texto: 'Vencen pronto' },
  { valor: 'proximo', texto: 'Próximos' },
  { valor: 'vigente', texto: 'Vigentes' },
];

export default function Lotes() {
  const { data, loading, error, reload } = useApi(async () => {
    const [lotes, bodegas, config] = await Promise.all([api.getLotes(), api.getBodegas(), api.getConfiguracion()]);
    return { lotes, bodegas, config };
  }, []);
  const [estado, setEstado] = useState('todos');
  const [bodega, setBodega] = useState('todas');

  const conteo = useMemo(() => {
    const c = { todos: 0, vencido: 0, critico: 0, proximo: 0, vigente: 0 };
    data?.lotes.forEach((l) => { c.todos++; c[l.estado_vencimiento]++; });
    return c;
  }, [data]);

  if (loading) return <Cargando />;
  if (error) return <ErrorCaja error={error} onReintentar={reload} />;

  const { lotes, bodegas, config } = data;
  const filtrados = lotes.filter(
    (l) => (estado === 'todos' || l.estado_vencimiento === estado) && (bodega === 'todas' || l.bodega_id === Number(bodega))
  );

  return (
    <>
      <PageHeader
        titulo="Lotes y vencimientos"
        migas={[{ texto: 'Vencimientos' }]}
        subtitulo={`Ordenados FEFO (lo que vence primero, sale primero). Crítico ≤ ${config.dias_alerta_critica} días · Próximo ≤ ${config.dias_alerta_proxima} días.`}
      />

      <div className="filtros">
        <div className="segmentado">
          {ESTADOS.map((e) => (
            <button key={e.valor} className={estado === e.valor ? 'activo' : ''} onClick={() => setEstado(e.valor)}>
              {e.texto} <span className="contador">{conteo[e.valor]}</span>
            </button>
          ))}
        </div>
        <select className="input" value={bodega} onChange={(e) => setBodega(e.target.value)}>
          <option value="todas">Todas las bodegas</option>
          {bodegas.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </select>
      </div>

      <section className="panel sin-padding">
        {filtrados.length === 0 ? <Vacio texto="No hay lotes con ese filtro." /> : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr><th>Vence</th><th>Días</th><th>Estado</th><th>Material</th><th>Lote</th><th>Bodega</th><th className="num">Cantidad</th><th>OC origen</th><th>Proveedor</th></tr>
              </thead>
              <tbody>
                {filtrados.map((l) => (
                  <tr key={`${l.lote_id}-${l.bodega_id}`} className={l.estado_vencimiento === 'vencido' ? 'fila-danger' : ''}>
                    <td><strong>{fmtFecha(l.fecha_vencimiento)}</strong></td>
                    <td>{textoDias(l.dias_para_vencer)}</td>
                    <td><Badge tipo="vencimiento" valor={l.estado_vencimiento} /></td>
                    <td><Link to={`/materiales/${l.material_id}`} className="enlace-fuerte">{l.material_nombre}</Link></td>
                    <td className="mono">{l.codigo_lote}</td>
                    <td>{l.bodega_nombre}</td>
                    <td className="num">{fmtNum(l.cantidad)} <span className="tenue">{l.unidad}</span></td>
                    <td className="mono">{l.oc_codigo ?? '—'}</td>
                    <td>{l.proveedor_nombre ?? '—'}</td>
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
