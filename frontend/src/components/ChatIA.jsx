import { useEffect, useRef, useState } from 'react';
import { api, API_INFO } from '../services/api.js';

const MAX = 500;
const SUGERENCIAS = [
  '¿Qué lotes están vencidos o por vencer?',
  '¿Qué lote debo despachar primero de AC-K-0090?',
];

export default function ChatIA() {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    { rol: 'ia', texto: 'Hola, soy el asistente de inventario de EcoObra. Pregúntame por vencimientos, lotes o FEFO. Escribe el código del lote si tu pregunta es específica.' },
  ]);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const finRef = useRef(null);
  const entradaRef = useRef(null);
  const disponible = API_INFO.modo === 'api';

  useEffect(() => { finRef.current?.scrollIntoView({ block: 'end' }); }, [mensajes, abierto]);
  useEffect(() => { if (abierto) entradaRef.current?.focus(); }, [abierto]);

  async function enviar(contenido) {
    const pregunta = contenido.trim();
    if (!pregunta || enviando) return;
    setTexto('');
    setMensajes((m) => [...m, { rol: 'usuario', texto: pregunta }]);
    setEnviando(true);
    try {
      const { respuesta } = await api.chatIA(pregunta);
      setMensajes((m) => [...m, { rol: 'ia', texto: respuesta }]);
    } catch (e) {
      setMensajes((m) => [...m, { rol: 'error', texto: e.message }]);
    } finally {
      setEnviando(false);
    }
  }

  function alEnviar(e) {
    e.preventDefault();
    enviar(texto);
  }

  function alTeclear(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar(texto);
    }
  }

  return (
    <>
      <button
        type="button"
        className="chat-ia-boton"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="chat-ia-panel"
      >
        <span aria-hidden="true">✦</span> Asistente IA
      </button>

      {abierto && (
        <section id="chat-ia-panel" className="chat-ia-panel" aria-label="Asistente IA">
          <header className="chat-ia-cabecera">
            <div>
              <h2>Asistente IA</h2>
              <p>Inventario EcoObra</p>
            </div>
            <button type="button" className="btn-icono" onClick={() => setAbierto(false)} aria-label="Cerrar asistente">✕</button>
          </header>

          <div className="chat-ia-mensajes" aria-live="polite">
            {mensajes.map((m, i) => (
              <div key={i} className={`chat-ia-msg chat-ia-${m.rol}`}>{m.texto}</div>
            ))}
            {enviando && <div className="chat-ia-msg chat-ia-ia chat-ia-pensando">Consultando inventario…</div>}
            {!disponible && (
              <div className="chat-ia-msg chat-ia-error">
                El asistente necesita el back end real. Configura <code>VITE_FUENTE_DATOS=api</code> en <code>frontend/.env</code>.
              </div>
            )}
            {disponible && mensajes.length === 1 && !enviando && (
              <div className="chat-ia-sugerencias">
                {SUGERENCIAS.map((s) => (
                  <button key={s} type="button" onClick={() => enviar(s)}>{s}</button>
                ))}
              </div>
            )}
            <div ref={finRef} />
          </div>

          <form className="chat-ia-form" onSubmit={alEnviar}>
            <textarea
              ref={entradaRef}
              rows={2}
              value={texto}
              maxLength={MAX}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={alTeclear}
              placeholder="Escribe tu pregunta…"
              disabled={!disponible}
              aria-label="Pregunta para el asistente"
            />
            <div className="chat-ia-pie">
              <span className="tenue">{texto.length}/{MAX}</span>
              <button className="btn" type="submit" disabled={!disponible || enviando || !texto.trim()}>
                {enviando ? 'Enviando…' : 'Enviar'}
              </button>
            </div>
          </form>
        </section>
      )}
    </>
  );
}
