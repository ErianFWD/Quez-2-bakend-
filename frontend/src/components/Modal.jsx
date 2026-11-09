import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ abierto, titulo, onCerrar, children, ancho = 560 }) {
  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e) => e.key === 'Escape' && onCerrar();
    window.addEventListener('keydown', alPresionar);
    // Evita que la página de fondo se desplace mientras el modal está abierto.
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', alPresionar);
      document.body.style.overflow = overflowPrevio;
    };
  }, [abierto, onCerrar]);

  if (!abierto) return null;
  // Se renderiza en <body> para que la animación de .contenido (transform) no
  // lo encierre en otro contexto de apilamiento y quede debajo de la cabecera.
  return createPortal(
    <div className="modal-fondo" onMouseDown={onCerrar}>
      <div className="modal" style={{ maxWidth: ancho }} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-cabecera">
          <h2>{titulo}</h2>
          <button className="btn-icono" onClick={onCerrar} aria-label="Cerrar">✕</button>
        </div>
        <div className="modal-cuerpo">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
