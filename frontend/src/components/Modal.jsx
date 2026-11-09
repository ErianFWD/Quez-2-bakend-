import { useEffect } from 'react';

export default function Modal({ abierto, titulo, onCerrar, children, ancho = 560 }) {
  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  return (
    <div className="modal-fondo" onMouseDown={onCerrar}>
      <div className="modal" style={{ maxWidth: ancho }} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-cabecera">
          <h2>{titulo}</h2>
          <button className="btn-icono" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>
  );
}
