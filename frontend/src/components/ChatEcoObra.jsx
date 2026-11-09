import { useEffect, useRef, useState } from 'react';
import './ChatEcoObra.css';

const base = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
const sugerencias = ['¿Qué lotes están vencidos?', '¿Qué lote apto puede salir primero en la misma bodega que AC-K-0090?'];

export default function ChatEcoObra() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [turnos, setTurnos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const entrada = useRef(null);
  const boton = useRef(null);
  const historial = useRef(null);

  useEffect(() => {
    if (abierto) entrada.current?.focus();
  }, [abierto]);

  useEffect(() => {
    const lista = historial.current;
    if (lista) lista.scrollTop = lista.scrollHeight;
  }, [abierto, turnos, enviando, error]);

  function cerrar() {
    setAbierto(false);
    boton.current?.focus();
  }

  async function enviar(texto) {
    const pregunta = texto.trim();
    if (!pregunta || enviando) return;
    setTurnos((prev) => [...prev, { autor: 'Tú', texto: pregunta }]);
    setMensaje('');
    setError('');
    setEnviando(true);
    try {
      const res = await fetch(`${base}/ia/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: pregunta }),
      });
      const datos = await res.json().catch(() => null);
      if (!res.ok || typeof datos?.respuesta !== 'string') {
        throw new Error(datos?.error || 'No se pudo obtener una respuesta del asistente.');
      }
      setTurnos((prev) => [...prev, { autor: 'EcoObra', texto: datos.respuesta }]);
    } catch (fallo) {
      setError(fallo instanceof TypeError
        ? 'No se pudo conectar con el backend de EcoObra.'
        : fallo.message);
      setMensaje(pregunta);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <aside className="eco-chat">
      {abierto && (
        <section id="eco-chat-panel" className="eco-chat-panel" aria-labelledby="eco-chat-titulo"
          onKeyDown={(evento) => { if (evento.key === 'Escape') cerrar(); }}>
          <header className="eco-chat-cabecera">
            <div>
              <h2 id="eco-chat-titulo">Asistente EcoObra</h2>
              <p>Vencimientos y rotación FEFO</p>
            </div>
            <button type="button" aria-label="Cerrar chat" onClick={cerrar}>×</button>
          </header>
          <div className="eco-chat-historial" ref={historial} role="log" aria-label="Conversación">
            <div className="eco-chat-turno">Consulta qué lotes necesitan atención o cuál debería salir primero.</div>
            {!turnos.length && sugerencias.map((texto) => (
              <button className="eco-chat-sugerencia" key={texto} type="button"
                onClick={() => enviar(texto)}>{texto}</button>
            ))}
            {turnos.map((turno, indice) => (
              <div className={`eco-chat-turno${turno.autor === 'Tú' ? ' eco-chat-usuario' : ''}`} key={indice}>
                <strong>{turno.autor}</strong>
                <p>{turno.texto}</p>
              </div>
            ))}
            {enviando && <p role="status">Consultando el inventario…</p>}
            {error && <p className="eco-chat-error" role="alert">{error}</p>}
          </div>
          <form className="eco-chat-form" onSubmit={(evento) => { evento.preventDefault(); enviar(mensaje); }}>
            <input ref={entrada} value={mensaje} onChange={(evento) => setMensaje(evento.target.value)}
              maxLength={500} readOnly={enviando} aria-label="Pregunta para EcoObra" placeholder="Escribe tu pregunta…" />
            <button type="submit" disabled={!mensaje.trim() || enviando}>Enviar</button>
          </form>
        </section>
      )}
      <button ref={boton} type="button" className="eco-chat-abrir" aria-expanded={abierto}
        aria-controls={abierto ? 'eco-chat-panel' : undefined} onClick={() => abierto ? cerrar() : setAbierto(true)}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M20 11.5a8 8 0 0 1-8 8H4l1.6-3.3A8 8 0 1 1 20 11.5Z" />
          <path d="M8 11.5h8M8 14.5h5" />
        </svg>
        Asistente IA
      </button>
    </aside>
  );
}
