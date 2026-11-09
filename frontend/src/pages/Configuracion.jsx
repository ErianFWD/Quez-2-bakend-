import { useState } from 'react';
import { api, API_INFO } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import Campo from '../components/Campo.jsx';
import { useToast } from '../components/Toast.jsx';
import { Cargando, ErrorCaja } from '../components/Estado.jsx';

// Las reglas de negocio son configurables (no quedan fijas en el código).
export default function Configuracion() {
  const avisar = useToast();
  const { data, loading, error, reload, setData } = useApi(() => api.getConfiguracion(), []);
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);

  if (loading) return <Cargando />;
  if (error) return <ErrorCaja error={error} onReintentar={reload} />;

  const cambiar = (c) => (e) => setData((d) => ({ ...d, [c]: e.target.value }));

  async function guardar(e) {
    e.preventDefault();
    setErrorForm('');
    setGuardando(true);
    try {
      setData(await api.updateConfiguracion(data));
      avisar('Configuración guardada');
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <PageHeader titulo="Configuración" migas={[{ texto: 'Configuración' }]} subtitulo="Parámetros de las reglas de negocio." />

      <form onSubmit={guardar} className="panel form-grid" style={{ maxWidth: 720 }}>
        <h2 className="campo-completo">Alertas de vencimiento</h2>
        <Campo etiqueta="Días para alerta crítica" ayuda="Lotes que vencen en este plazo o menos">
          <input type="number" min="0" className="input" value={data.dias_alerta_critica} onChange={cambiar('dias_alerta_critica')} />
        </Campo>
        <Campo etiqueta="Días para alerta próxima" ayuda="Aviso preventivo">
          <input type="number" min="0" className="input" value={data.dias_alerta_proxima} onChange={cambiar('dias_alerta_proxima')} />
        </Campo>

        <h2 className="campo-completo">Regla de compras duplicadas</h2>
        <Campo etiqueta="Fechas a máximo (días)">
          <input type="number" min="0" className="input" value={data.duplicado_dias} onChange={cambiar('duplicado_dias')} />
        </Campo>
        <Campo etiqueta="Tolerancia de cantidad (%)">
          <input type="number" min="0" className="input" value={data.duplicado_tolerancia_pct} onChange={cambiar('duplicado_tolerancia_pct')} />
        </Campo>
        <p className="nota campo-completo">
          Dos OC se marcan como posible duplicado si tienen el mismo proveedor y material, cantidades que difieren
          como máximo {data.duplicado_tolerancia_pct}% y fechas separadas por {data.duplicado_dias} días o menos.
        </p>

        <h2 className="campo-completo">Usuario</h2>
        <Campo etiqueta="Usuario que registra movimientos">
          <input className="input" value={data.usuario_actual} onChange={cambiar('usuario_actual')} />
        </Campo>

        {errorForm && <div className="form-error campo-completo">{errorForm}</div>}
        <div className="form-acciones campo-completo">
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar configuración'}</button>
        </div>
      </form>

      <section className="panel" style={{ maxWidth: 720 }}>
        <h2>Origen de datos</h2>
        {API_INFO.modo === 'dbjson' ? (
          <p className="nota">
            Los datos vienen de <code>db.json</code> servido por json-server en <code>{API_INFO.baseUrl}</code>.
            Para volver a los datos iniciales ejecute <code>npm run db:reset</code>.
            Cuando el back end esté listo, cambie en <code>.env</code> a <code>VITE_FUENTE_DATOS=api</code>.
          </p>
        ) : (
          <p className="nota">Conectado a la API (Node + MySQL) en <code>{API_INFO.baseUrl}</code>.</p>
        )}
      </section>
    </>
  );
}
