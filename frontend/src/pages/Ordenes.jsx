import { useState } from 'react';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import Modal from '../components/Modal.jsx';
import Campo from '../components/Campo.jsx';
import { useToast } from '../components/Toast.jsx';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado.jsx';
import { fmtColones, fmtFecha, fmtNum } from '../utils/format.js';
import { hoyISO, sumarDias } from '../utils/inventario.js';

export default function Ordenes() {
  const { data, loading, error, reload } = useApi(async () => {
    const [ordenes, duplicados, materiales, proveedores, bodegas, config] = await Promise.all([
      api.getOrdenes(), api.getPosiblesDuplicados(), api.getMateriales(), api.getProveedores(), api.getBodegas(), api.getConfiguracion(),
    ]);
    return { ordenes, duplicados, materiales, proveedores, bodegas, config };
  }, []);
  const [nueva, setNueva] = useState(false);
  const [recibiendo, setRecibiendo] = useState(null);

  if (loading) return <Cargando />;
  if (error) return <ErrorCaja error={error} onReintentar={reload} />;

  const { ordenes, duplicados, config } = data;
  const sospechosas = new Set(duplicados.flatMap((p) => [p.oc_a.id, p.oc_b.id]));

  return (
    <>
      <PageHeader titulo="Órdenes de compra" migas={[{ texto: 'Órdenes' }]} subtitulo="Cada OC recibida genera una entrada con su lote, así se sabe de qué compra viene cada existencia.">
        <button className="btn" onClick={() => setNueva(true)}>+ Nueva OC</button>
      </PageHeader>

      <section className="panel panel-alerta">
        <div className="panel-cabecera">
          <h2>Posibles compras duplicadas ({duplicados.length})</h2>
        </div>
        <p className="nota">
          Regla: mismo proveedor y mismo material, cantidad parecida (±{config.duplicado_tolerancia_pct}%) y fechas a {config.duplicado_dias} días o menos.
          Se puede ajustar en Configuración.
        </p>
        {duplicados.length === 0 ? <Vacio texto="No se detectaron posibles duplicados." /> : (
          <div className="duplicados">
            {duplicados.map((p) => (
              <div className="duplicado" key={`${p.oc_a.id}-${p.oc_b.id}`}>
                <div className="duplicado-par">
                  <OcMini oc={p.oc_a} />
                  <span className="duplicado-vs">≈</span>
                  <OcMini oc={p.oc_b} />
                </div>
                <div className="tenue">
                  {p.oc_a.material_nombre} · {p.oc_a.proveedor_nombre} · {p.diferencia_dias} día(s) de diferencia · cantidades a {p.diferencia_cantidad_pct}%
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel sin-padding">
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr><th>OC</th><th>Fecha</th><th>Proveedor</th><th>Material</th><th className="num">Cantidad</th><th className="num">Precio unit.</th><th className="num">Total</th><th>Estado</th><th /></tr>
            </thead>
            <tbody>
              {ordenes.map((o) => (
                <tr key={o.id} className={sospechosas.has(o.id) ? 'fila-warn' : ''}>
                  <td className="mono">{o.codigo} {sospechosas.has(o.id) && <span title="Posible duplicado">⚠</span>}</td>
                  <td>{fmtFecha(o.fecha)}</td>
                  <td>{o.proveedor_nombre}</td>
                  <td>{o.material_nombre}</td>
                  <td className="num">{fmtNum(o.cantidad)} <span className="tenue">{o.unidad}</span></td>
                  <td className="num">{fmtColones(o.precio_unitario)}</td>
                  <td className="num"><strong>{fmtColones(o.total)}</strong></td>
                  <td><Badge tipo="orden" valor={o.estado} /></td>
                  <td className="acciones">
                    {o.estado === 'pendiente' && <button className="btn btn-sec btn-sm" onClick={() => setRecibiendo(o)}>Recibir</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {nueva && <FormOrden datos={data} onCerrar={() => setNueva(false)} onGuardado={reload} />}
      {recibiendo && <FormRecepcion oc={recibiendo} datos={data} onCerrar={() => setRecibiendo(null)} onGuardado={reload} />}
    </>
  );
}

function OcMini({ oc }) {
  return (
    <div className="oc-mini">
      <strong className="mono">{oc.codigo}</strong>
      <span>{fmtFecha(oc.fecha)}</span>
      <span>{fmtNum(oc.cantidad)} {oc.unidad}</span>
      <Badge tipo="orden" valor={oc.estado} />
    </div>
  );
}

function FormOrden({ datos, onCerrar, onGuardado }) {
  const avisar = useToast();
  const [form, setForm] = useState({
    fecha: hoyISO(), proveedor_id: '', material_id: datos.materiales[0]?.id ?? '', cantidad: '', precio_unitario: '', solicitante: 'Bodega Central',
  });
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);
  const cambiar = (c) => (e) => setForm((f) => ({ ...f, [c]: e.target.value }));
  const total = Number(form.cantidad || 0) * Number(form.precio_unitario || 0);

  async function guardar(e) {
    e.preventDefault();
    setErrorForm('');
    setGuardando(true);
    try {
      const r = await api.createOrden(form);
      if (r.posibles_duplicados?.length) {
        avisar(`${r.orden.codigo} creada, pero se parece a ${r.posibles_duplicados.join(', ')}. Revísela.`, 'warn');
      } else {
        avisar(`${r.orden.codigo} creada`);
      }
      onGuardado();
      onCerrar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal abierto titulo="Nueva orden de compra" onCerrar={onCerrar}>
      <form onSubmit={guardar} className="form-grid">
        <Campo etiqueta="Fecha"><input type="date" className="input" value={form.fecha} onChange={cambiar('fecha')} required /></Campo>
        <Campo etiqueta="Área solicitante">
          <select className="input" value={form.solicitante} onChange={cambiar('solicitante')}>
            <option>Bodega Central</option><option>Obras</option><option>Mantenimiento</option>
          </select>
        </Campo>
        <Campo etiqueta="Proveedor" ancho="completo">
          <select className="input" value={form.proveedor_id} onChange={cambiar('proveedor_id')} required>
            <option value="">Seleccione…</option>
            {datos.proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Material" ancho="completo">
          <select className="input" value={form.material_id} onChange={cambiar('material_id')}>
            {datos.materiales.map((m) => <option key={m.id} value={m.id}>{m.codigo} · {m.nombre}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Cantidad"><input type="number" min="1" className="input" value={form.cantidad} onChange={cambiar('cantidad')} required /></Campo>
        <Campo etiqueta="Precio unitario (₡)"><input type="number" min="1" className="input" value={form.precio_unitario} onChange={cambiar('precio_unitario')} required /></Campo>
        <div className="calculo campo-completo"><div><span>Total de la OC</span><strong>{fmtColones(total)}</strong></div></div>
        {errorForm && <div className="form-error campo-completo">{errorForm}</div>}
        <div className="form-acciones campo-completo">
          <button type="button" className="btn btn-sec" onClick={onCerrar}>Cancelar</button>
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Crear OC'}</button>
        </div>
      </form>
    </Modal>
  );
}

function FormRecepcion({ oc, datos, onCerrar, onGuardado }) {
  const avisar = useToast();
  const material = datos.materiales.find((m) => m.id === oc.material_id);
  const [form, setForm] = useState({
    bodega_destino_id: datos.bodegas[0]?.id ?? '',
    codigo_lote: '',
    fecha_vencimiento: material ? sumarDias(hoyISO(), material.vida_util_dias) : '',
    usuario: datos.config.usuario_actual,
  });
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);
  const cambiar = (c) => (e) => setForm((f) => ({ ...f, [c]: e.target.value }));

  async function guardar(e) {
    e.preventDefault();
    setErrorForm('');
    setGuardando(true);
    try {
      await api.recibirOrden(oc.id, form);
      avisar(`${oc.codigo} recibida: entrada registrada en el lote ${form.codigo_lote.toUpperCase()}`);
      onGuardado();
      onCerrar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal abierto titulo={`Recibir ${oc.codigo}`} onCerrar={onCerrar}>
      <form onSubmit={guardar} className="form-grid">
        <p className="nota campo-completo">
          {fmtNum(oc.cantidad)} {oc.unidad} de <strong>{oc.material_nombre}</strong> · {oc.proveedor_nombre}
        </p>
        <Campo etiqueta="Bodega de destino">
          <select className="input" value={form.bodega_destino_id} onChange={cambiar('bodega_destino_id')}>
            {datos.bodegas.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Código de lote"><input className="input mono" value={form.codigo_lote} onChange={cambiar('codigo_lote')} required /></Campo>
        <Campo etiqueta="Fecha de vencimiento" ayuda="Revise la etiqueta del producto">
          <input type="date" className="input" min={hoyISO()} value={form.fecha_vencimiento} onChange={cambiar('fecha_vencimiento')} required />
        </Campo>
        <Campo etiqueta="Usuario"><input className="input" value={form.usuario} onChange={cambiar('usuario')} required /></Campo>
        {errorForm && <div className="form-error campo-completo">{errorForm}</div>}
        <div className="form-acciones campo-completo">
          <button type="button" className="btn btn-sec" onClick={onCerrar}>Cancelar</button>
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Confirmar recepción'}</button>
        </div>
      </form>
    </Modal>
  );
}
