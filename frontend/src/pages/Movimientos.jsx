import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import Campo from '../components/Campo.jsx';
import { useToast } from '../components/Toast.jsx';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado.jsx';
import { fmtFecha, fmtFechaHora, fmtNum, textoDias } from '../utils/format.js';
import { hoyISO, loteSugeridoFEFO } from '../utils/inventario.js';

const TIPOS = [
  { valor: 'entrada', texto: 'Entrada', doc: 'OC', ayuda: 'Ingreso de mercadería. Crea o alimenta un lote con su fecha de vencimiento.' },
  { valor: 'salida', texto: 'Salida', doc: 'Vale de salida', ayuda: 'Despacho a cliente u obra. Se sugiere el lote que vence primero (FEFO).' },
  { valor: 'traslado', texto: 'Traslado', doc: 'Traslado', ayuda: 'Mover un lote de una bodega u obra a otra.' },
  { valor: 'ajuste', texto: 'Ajuste', doc: 'Acta de ajuste', ayuda: 'Corrección por conteo físico, merma o desecho de producto vencido.' },
];

export default function Movimientos() {
  const { data, loading, error, reload } = useApi(async () => {
    const [movimientos, materiales, bodegas, ordenes, config] = await Promise.all([
      api.getMovimientos(), api.getMateriales(), api.getBodegas(), api.getOrdenes(), api.getConfiguracion(),
    ]);
    return { movimientos, materiales, bodegas, ordenes, config };
  }, []);
  const [filtro, setFiltro] = useState('todos');
  const [params, setParams] = useSearchParams();
  const [abierto, setAbierto] = useState(params.get('nuevo') === '1');

  // El botón flotante y el menú abren el formulario con ?nuevo=1
  useEffect(() => {
    if (params.get('nuevo') === '1') setAbierto(true);
  }, [params]);

  function cerrarFormulario() {
    setAbierto(false);
    if (params.get('nuevo')) setParams({}, { replace: true });
  }

  if (loading) return <Cargando />;
  if (error) return <ErrorCaja error={error} onReintentar={reload} />;

  const lista = data.movimientos.filter((m) => filtro === 'todos' || m.tipo === filtro);

  return (
    <>
      <PageHeader titulo="Movimientos" migas={[{ texto: 'Movimientos' }]} subtitulo="Cada entrada, salida, traslado o ajuste queda registrado con fecha, usuario, lote, ubicación y documento de origen.">
        <button className="btn" onClick={() => setAbierto(true)}>+ Registrar movimiento</button>
      </PageHeader>

      <div className="filtros">
        <div className="segmentado">
          <button className={filtro === 'todos' ? 'activo' : ''} onClick={() => setFiltro('todos')}>Todos</button>
          {TIPOS.map((t) => (
            <button key={t.valor} className={filtro === t.valor ? 'activo' : ''} onClick={() => setFiltro(t.valor)}>{t.texto}</button>
          ))}
        </div>
      </div>

      <section className="panel sin-padding">
        {lista.length === 0 ? <Vacio texto="Sin movimientos." /> : (
          <div className="tabla-scroll">
            <table className="tabla">
              <thead>
                <tr><th>Fecha</th><th>Tipo</th><th>Material</th><th>Lote</th><th className="num">Cantidad</th><th>Origen → Destino</th><th>Documento</th><th>Usuario</th></tr>
              </thead>
              <tbody>
                {lista.map((m) => (
                  <tr key={m.id}>
                    <td className="nowrap">{fmtFechaHora(m.fecha)}</td>
                    <td><Badge tipo="movimiento" valor={m.tipo} /></td>
                    <td><Link to={`/materiales/${m.material_id}`} className="enlace-fuerte">{m.material_nombre}</Link></td>
                    <td className="mono">{m.codigo_lote}</td>
                    <td className="num">{fmtNum(m.cantidad)} <span className="tenue">{m.unidad}</span></td>
                    <td>{m.bodega_origen ?? '—'} → {m.bodega_destino ?? '—'}</td>
                    <td><span className="tenue">{m.documento_tipo}</span> <span className="mono">{m.documento_ref}</span></td>
                    <td>{m.usuario}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {abierto && (
        <FormMovimiento datos={data} onCerrar={cerrarFormulario} onGuardado={reload} />
      )}
    </>
  );
}

function FormMovimiento({ datos, onCerrar, onGuardado }) {
  const avisar = useToast();
  const { materiales, bodegas, ordenes, config } = datos;
  const [form, setForm] = useState({
    tipo: 'salida',
    material_id: materiales[0]?.id ?? '',
    existencia: '', // "loteId-bodegaId"
    bodega_destino_id: '',
    codigo_lote: '',
    fecha_vencimiento: '',
    cantidad: '',
    sentido: 'negativo',
    documento_ref: '',
    usuario: config.usuario_actual,
    observacion: '',
  });
  const [existencias, setExistencias] = useState([]);
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);

  const tipo = TIPOS.find((t) => t.valor === form.tipo);
  const material = materiales.find((m) => m.id === Number(form.material_id));
  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  // Cada vez que cambia el material, se cargan sus existencias por lote y se sugiere el lote FEFO
  useEffect(() => {
    if (!form.material_id) return;
    setExistencias([]);
    setForm((f) => ({ ...f, existencia: '' }));

    let vigente = true;
    api.getExistencias(form.material_id).then((ex) => {
      if (!vigente) return;
      setExistencias(ex);
      const sugerido = loteSugeridoFEFO(ex);
      setForm((f) => ({ ...f, existencia: sugerido ? `${sugerido.lote_id}-${sugerido.bodega_id}` : ex[0] ? `${ex[0].lote_id}-${ex[0].bodega_id}` : '' }));
    }).catch((err) => { if (vigente) setErrorForm(err.message); });
    return () => { vigente = false; };
  }, [form.material_id]);

  const sugerido = loteSugeridoFEFO(existencias);
  const elegido = existencias.find((e) => `${e.lote_id}-${e.bodega_id}` === form.existencia);
  const noEsFEFO = form.tipo === 'salida' && elegido && sugerido && elegido !== sugerido && elegido.dias_para_vencer > sugerido.dias_para_vencer;
  const ocsPendientes = ordenes.filter((o) => o.material_id === Number(form.material_id));

  async function guardar(e) {
    e.preventDefault();
    setErrorForm('');
    setGuardando(true);
    const [lote_id, bodega_origen_id] = form.existencia.split('-');
    try {
      await api.createMovimiento({
        tipo: form.tipo,
        material_id: Number(form.material_id),
        cantidad: Number(form.cantidad),
        usuario: form.usuario,
        documento_tipo: tipo.doc,
        documento_ref: form.documento_ref,
        observacion: form.observacion,
        ...(form.tipo === 'entrada'
          ? { bodega_destino_id: Number(form.bodega_destino_id), codigo_lote: form.codigo_lote, fecha_vencimiento: form.fecha_vencimiento }
          : { lote_id: Number(lote_id), bodega_origen_id: Number(bodega_origen_id) }),
        ...(form.tipo === 'traslado' ? { bodega_destino_id: Number(form.bodega_destino_id) } : {}),
        ...(form.tipo === 'ajuste' ? { sentido: form.sentido } : {}),
      });
      avisar(`${tipo.texto} registrada correctamente`);
      onGuardado();
      onCerrar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal abierto titulo="Registrar movimiento" onCerrar={onCerrar} ancho={660}>
      <form onSubmit={guardar} className="form-grid">
        <div className="segmentado campo-completo">
          {TIPOS.map((t) => (
            <button type="button" key={t.valor} className={form.tipo === t.valor ? 'activo' : ''} onClick={() => setForm((f) => ({ ...f, tipo: t.valor, documento_ref: '' }))}>
              {t.texto}
            </button>
          ))}
        </div>
        <p className="nota campo-completo">{tipo.ayuda}</p>

        <Campo etiqueta="Material" ancho="completo">
          <select className="input" value={form.material_id} onChange={cambiar('material_id')}>
            {materiales.map((m) => <option key={m.id} value={m.id}>{m.codigo} · {m.nombre}</option>)}
          </select>
        </Campo>

        {form.tipo === 'entrada' ? (
          <>
            <Campo etiqueta="Bodega de destino">
              <select className="input" value={form.bodega_destino_id} onChange={cambiar('bodega_destino_id')} required>
                <option value="">Seleccione…</option>
                {bodegas.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Código de lote (del fabricante)"><input className="input mono" value={form.codigo_lote} onChange={cambiar('codigo_lote')} required /></Campo>
            <Campo etiqueta="Fecha de vencimiento" ayuda={material ? `Vida útil típica: ${material.vida_util_dias} días` : null}>
              <input type="date" className="input" min={hoyISO()} value={form.fecha_vencimiento} onChange={cambiar('fecha_vencimiento')} required />
            </Campo>
            <Campo etiqueta="Orden de compra">
              <input className="input mono" list="ocs-material" value={form.documento_ref} onChange={cambiar('documento_ref')} placeholder="OC-20XX" required />
              <datalist id="ocs-material">
                {ocsPendientes.map((o) => <option key={o.id} value={o.codigo}>{o.proveedor_nombre} · {o.cantidad} {o.unidad}</option>)}
              </datalist>
            </Campo>
          </>
        ) : (
          <>
            <Campo etiqueta="Lote y bodega (orden FEFO)" ancho="completo">
              <select className="input" value={form.existencia} onChange={cambiar('existencia')} required>
                {existencias.length === 0 && <option value="">Sin existencias</option>}
                {existencias.map((e) => (
                  <option key={`${e.lote_id}-${e.bodega_id}`} value={`${e.lote_id}-${e.bodega_id}`}>
                    {e === sugerido ? '★ ' : ''}{e.codigo_lote} · {e.bodega_nombre} · {fmtNum(e.cantidad)} {e.unidad} · vence {fmtFecha(e.fecha_vencimiento)} ({textoDias(e.dias_para_vencer)})
                  </option>
                ))}
              </select>
            </Campo>
            {noEsFEFO && (
              <div className="aviso campo-completo">
                Hay un lote que vence antes (<span className="mono">{sugerido.codigo_lote}</span>, {fmtFecha(sugerido.fecha_vencimiento)}). Según FEFO debería salir primero.
              </div>
            )}
            {elegido?.dias_para_vencer < 0 && form.tipo !== 'ajuste' && (
              <div className="form-error campo-completo">Este lote está vencido: no se puede despachar ni trasladar. Use un ajuste para darlo de baja.</div>
            )}
            {form.tipo === 'traslado' && (
              <Campo etiqueta="Bodega de destino">
                <select className="input" value={form.bodega_destino_id} onChange={cambiar('bodega_destino_id')} required>
                  <option value="">Seleccione…</option>
                  {bodegas.filter((b) => b.id !== elegido?.bodega_id).map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                </select>
              </Campo>
            )}
            {form.tipo === 'ajuste' && (
              <Campo etiqueta="Sentido del ajuste">
                <select className="input" value={form.sentido} onChange={cambiar('sentido')}>
                  <option value="negativo">Disminuir (merma, desecho, faltante)</option>
                  <option value="positivo">Aumentar (sobrante en conteo)</option>
                </select>
              </Campo>
            )}
            <Campo etiqueta={`N.º de ${tipo.doc.toLowerCase()}`}>
              <input className="input mono" value={form.documento_ref} onChange={cambiar('documento_ref')} placeholder={form.tipo === 'salida' ? 'VS-0000' : form.tipo === 'traslado' ? 'TR-0000' : 'AJ-0000'} required />
            </Campo>
          </>
        )}

        <Campo etiqueta={`Cantidad ${material ? `(${material.unidad})` : ''}`} ayuda={elegido && form.tipo !== 'entrada' ? `Disponible en ese lote: ${fmtNum(elegido.cantidad)}` : null}>
          <input type="number" min="1" className="input" value={form.cantidad} onChange={cambiar('cantidad')} required />
        </Campo>
        <Campo etiqueta="Usuario"><input className="input" value={form.usuario} onChange={cambiar('usuario')} required /></Campo>
        <Campo etiqueta={form.tipo === 'ajuste' ? 'Motivo del ajuste (obligatorio)' : 'Observación'} ancho="completo">
          <input className="input" value={form.observacion} onChange={cambiar('observacion')} required={form.tipo === 'ajuste'} />
        </Campo>

        {errorForm && <div className="form-error campo-completo">{errorForm}</div>}
        <div className="form-acciones campo-completo">
          <button type="button" className="btn btn-sec" onClick={onCerrar}>Cancelar</button>
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : `Registrar ${tipo.texto.toLowerCase()}`}</button>
        </div>
      </form>
    </Modal>
  );
}
