export default function KpiCard({ etiqueta, valor, detalle, tono = 'neutral' }) {
  return (
    <div className={`kpi kpi-${tono}`}>
      <span className="kpi-etiqueta">{etiqueta}</span>
      <strong className="kpi-valor">{valor}</strong>
      {detalle && <span className="kpi-detalle">{detalle}</span>}
    </div>
  );
}
