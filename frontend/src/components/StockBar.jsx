// Barra visual: muestra el stock disponible contra el máximo,
// con una marca en el punto de reorden.
export default function StockBar({ disponible, puntoReorden, maximo }) {
  const tope = Math.max(maximo, disponible, puntoReorden, 1);
  const pct = Math.min(100, (disponible / tope) * 100);
  const pctPR = Math.min(100, (puntoReorden / tope) * 100);
  const tono = disponible <= 0 ? 'danger' : disponible <= puntoReorden ? 'warn' : 'ok';
  return (
    <div className="stockbar" title={`Disponible ${disponible} · PR ${puntoReorden} · Máx ${maximo}`}>
      <div className={`stockbar-relleno ${tono}`} style={{ width: `${pct}%` }} />
      <div className="stockbar-pr" style={{ left: `${pctPR}%` }} />
    </div>
  );
}
