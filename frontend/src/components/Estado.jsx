// Componentes pequeños para estados de carga, error y vacío.
export function Cargando({ texto = 'Cargando…' }) {
  return (
    <div className="estado-carga">
      <span className="spinner" /> {texto}
    </div>
  );
}

export function ErrorCaja({ error, onReintentar }) {
  return (
    <div className="error-caja">
      <strong>No se pudieron cargar los datos.</strong>
      <span>{error?.message ?? String(error)}</span>
      {onReintentar && <button className="btn btn-sec" onClick={onReintentar}>Reintentar</button>}
    </div>
  );
}

export function Vacio({ texto }) {
  return <div className="vacio">{texto}</div>;
}
