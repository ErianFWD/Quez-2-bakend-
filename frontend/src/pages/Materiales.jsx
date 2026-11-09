import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../services/api.js';
import { useApi } from '../hooks/useApi.js';
import PageHeader from '../components/PageHeader.jsx';
import Badge from '../components/Badge.jsx';
import StockBar from '../components/StockBar.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import Modal from '../components/Modal.jsx';
import Campo from '../components/Campo.jsx';
import { useToast } from '../components/Toast.jsx';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado.jsx';
import { fmtFecha, fmtNum } from '../utils/format.js';
import { calcPuntoReorden, calcStockSeguridad } from '../utils/inventario.js';

const VACIO = {
  codigo: '', nombre: '', categoria: 'Selladores', unidad: 'unidad',
  stock_minimo: '', stock_maximo: '', demanda_promedio: '', demanda_maxima: '',
  tiempo_entrega: '', vida_util_dias: '',
};
const CATEGORIAS = ['Selladores', 'Adhesivos', 'Impermeabilizantes', 'Aditivos'];

export default function Materiales() {
  const { data: materiales, loading, error, reload } = useApi(() => api.getMateriales(), []);
  const [params] = useSearchParams();
  const [busqueda, setBusqueda] = useState(params.get('q') ?? '');
  const [categoria, setCategoria] = useState(params.get('categoria') ?? 'todas');
  useEffect(() => {
    setBusqueda(params.get('q') ?? '');
    setCategoria(params.get('categoria') ?? 'todas');
  }, [params]);
  const [vista, setVista] = useState('tarjetas');
  const [editando, setEditando] = useState(null); // null = cerrado, {} = nuevo, material = editar

  const filtrados = useMemo(() => {
    if (!materiales) return [];
    const q = busqueda.trim().toLowerCase();
    return materiales.filter(
      (m) =>
        (categoria === 'todas' || m.categoria === categoria) &&
        (!q || m.nombre.toLowerCase().includes(q) || m.codigo.toLowerCase().includes(q))
    );
  }, [materiales, busqueda, categoria]);

  return (
    <>
      <PageHeader titulo="Materiales" migas={[{ texto: 'Materiales' }]} subtitulo="El stock se calcula a partir de los movimientos; el punto de reorden se calcula, no se digita.">
        <button className="btn" onClick={() => setEditando({})}>+ Nuevo material</button>
      </PageHeader>

      <div className="filtros">
        <input className="input" placeholder="Buscar por nombre o código…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <select className="input" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="todas">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="segmentado" style={{ marginLeft: 'auto' }}>
          <button className={vista === 'tarjetas' ? 'activo' : ''} onClick={() => setVista('tarjetas')}>Tarjetas</button>
          <button className={vista === 'tabla' ? 'activo' : ''} onClick={() => setVista('tabla')}>Tabla</button>
        </div>
      </div>

      {loading ? <Cargando /> : error ? <ErrorCaja error={error} onReintentar={reload} /> : vista === 'tarjetas' ? (
        filtrados.length === 0 ? <Vacio texto="No hay materiales que coincidan." /> : (
          <div className="rejilla-tarjetas">
            {filtrados.map((m) => <MaterialCard key={m.id} m={m} />)}
          </div>
        )
      ) : (
        <section className="panel sin-padding">
          {filtrados.length === 0 ? <Vacio texto="No hay materiales que coincidan." /> : (
            <div className="tabla-scroll">
              <table className="tabla">
                <thead>
                  <tr>
                    <th>Material</th>
                    <th>Categoría</th>
                    <th className="num">Disponible</th>
                    <th style={{ width: 150 }}>Nivel</th>
                    <th className="num">SS</th>
                    <th className="num">PR</th>
                    <th>Próx. vencimiento</th>
                    <th>Estado</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <Link to={`/materiales/${m.id}`} className="enlace-fuerte">{m.nombre}</Link>
                        <div className="mono tenue">{m.codigo}</div>
                      </td>
                      <td>{m.categoria}</td>
                      <td className="num">
                        <strong>{fmtNum(m.stock_disponible)}</strong> <span className="tenue">{m.unidad}</span>
                        {m.stock_vencido > 0 && <div className="texto-danger">+{fmtNum(m.stock_vencido)} vencido</div>}
                      </td>
                      <td><StockBar disponible={m.stock_disponible} puntoReorden={m.punto_reorden} maximo={m.stock_maximo} /></td>
                      <td className="num">{fmtNum(m.stock_seguridad)}</td>
                      <td className="num"><strong>{fmtNum(m.punto_reorden)}</strong></td>
                      <td>{fmtFecha(m.proximo_vencimiento)}</td>
                      <td><Badge tipo="stock" valor={m.estado} /></td>
                      <td className="acciones">
                        <Link className="btn btn-sec btn-sm" to={`/materiales/${m.id}`}>Trazabilidad</Link>
                        <button className="btn btn-sec btn-sm" onClick={() => setEditando(m)}>Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      <FormMaterial material={editando} onCerrar={() => setEditando(null)} onGuardado={reload} />
    </>
  );
}

function FormMaterial({ material, onCerrar, onGuardado }) {
  const avisar = useToast();
  const esNuevo = material && !material.id;
  const [form, setForm] = useState(VACIO);
  const [errorForm, setErrorForm] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [abiertoPara, setAbiertoPara] = useState(null);

  // Cargar los datos cuando se abre el modal
  if (material !== abiertoPara) {
    setAbiertoPara(material);
    setErrorForm('');
    setForm(material && material.id ? { ...VACIO, ...material } : VACIO);
  }

  const cambiar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  // Vista previa del cálculo, igual a la que hace el back end
  const listos = ['demanda_promedio', 'demanda_maxima', 'tiempo_entrega'].every((c) => form[c] !== '');
  const ss = listos ? calcStockSeguridad(form.demanda_maxima, form.demanda_promedio, form.tiempo_entrega) : null;
  const pr = listos ? calcPuntoReorden(form.demanda_promedio, form.tiempo_entrega, ss) : null;

  async function guardar(e) {
    e.preventDefault();
    setErrorForm('');
    setGuardando(true);
    try {
      if (esNuevo) await api.createMaterial(form);
      else await api.updateMaterial(material.id, form);
      avisar(esNuevo ? 'Material registrado' : 'Material actualizado');
      onGuardado();
      onCerrar();
    } catch (err) {
      setErrorForm(err.message);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal abierto={!!material} titulo={esNuevo ? 'Nuevo material' : 'Editar material'} onCerrar={onCerrar} ancho={640}>
      <form onSubmit={guardar} className="form-grid">
        <Campo etiqueta="Código estándar"><input className="input mono" value={form.codigo} onChange={cambiar('codigo')} placeholder="SEL-ACR-009" required /></Campo>
        <Campo etiqueta="Categoría">
          <select className="input" value={form.categoria} onChange={cambiar('categoria')}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </Campo>
        <Campo etiqueta="Nombre" ancho="completo"><input className="input" value={form.nombre} onChange={cambiar('nombre')} required /></Campo>
        <Campo etiqueta="Unidad"><input className="input" value={form.unidad} onChange={cambiar('unidad')} placeholder="galón, saco, tubo…" required /></Campo>
        <Campo etiqueta="Vida útil (días)" ayuda="Desde la fabricación"><input type="number" min="0" className="input" value={form.vida_util_dias} onChange={cambiar('vida_util_dias')} required /></Campo>
        <Campo etiqueta="Stock mínimo"><input type="number" min="0" className="input" value={form.stock_minimo} onChange={cambiar('stock_minimo')} required /></Campo>
        <Campo etiqueta="Stock máximo"><input type="number" min="0" className="input" value={form.stock_maximo} onChange={cambiar('stock_maximo')} required /></Campo>
        <Campo etiqueta="Demanda promedio / día"><input type="number" min="0" step="0.1" className="input" value={form.demanda_promedio} onChange={cambiar('demanda_promedio')} required /></Campo>
        <Campo etiqueta="Demanda máxima / día"><input type="number" min="0" step="0.1" className="input" value={form.demanda_maxima} onChange={cambiar('demanda_maxima')} required /></Campo>
        <Campo etiqueta="Tiempo de entrega (días)"><input type="number" min="1" className="input" value={form.tiempo_entrega} onChange={cambiar('tiempo_entrega')} required /></Campo>

        <div className="calculo campo-completo">
          <div>
            <span>Stock de seguridad</span>
            <strong>{ss ?? '—'}</strong>
            <small>(dem. máx − dem. prom) × tiempo entrega</small>
          </div>
          <div>
            <span>Punto de reorden</span>
            <strong>{pr ?? '—'}</strong>
            <small>dem. prom × tiempo entrega + SS</small>
          </div>
        </div>

        {errorForm && <div className="form-error campo-completo">{errorForm}</div>}
        <div className="form-acciones campo-completo">
          <button type="button" className="btn btn-sec" onClick={onCerrar}>Cancelar</button>
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  );
}
