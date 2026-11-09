// Envoltorio de un campo de formulario con etiqueta y ayuda opcional.
export default function Campo({ etiqueta, ayuda, children, ancho }) {
  return (
    <label className={`campo ${ancho === 'completo' ? 'campo-completo' : ''}`}>
      <span>{etiqueta}</span>
      {children}
      {ayuda && <small>{ayuda}</small>}
    </label>
  );
}
