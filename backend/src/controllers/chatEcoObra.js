import { calcularExistencias } from '../services/materiales.js';
import { obtenerConfiguracion } from '../services/configuracion.js';
import { explicar } from '../../../ia/groq.mjs';

export async function chatEcoObra(req, res, next) {
  const mensaje = typeof req.body?.mensaje === 'string' ? req.body.mensaje.trim() : '';
  if (!mensaje || mensaje.length > 500) {
    return res.status(400).json({ error: 'Escribe una pregunta de hasta 500 caracteres.' });
  }

  const apiKey = process.env.GROQ_API_KEY?.trim();
  const modelo = process.env.GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';
  if (!apiKey) {
    return res.status(503).json({ error: 'Configura GROQ_API_KEY en backend/.env y reinicia el servidor.' });
  }

  let existencias;
  try {
    existencias = await calcularExistencias(await obtenerConfiguracion());
  } catch (error) {
    return next(error);
  }

  // Dar prioridad a códigos de lote y de material escritos en la consulta.
  const palabras = new Set(mensaje.toUpperCase().match(/[A-Z0-9]+(?:-[A-Z0-9]+)*/g));
  const coincide = (lote) => palabras.has(lote.codigo_lote) || palabras.has(lote.material_codigo);
  const claves = new Set(existencias.filter(coincide).map((lote) => `${lote.material_id}:${lote.bodega_id}`));
  const ordenadas = [...existencias].sort((a, b) =>
    Number(claves.has(`${b.material_id}:${b.bodega_id}`)) - Number(claves.has(`${a.material_id}:${a.bodega_id}`))
    || a.fecha_vencimiento.localeCompare(b.fecha_vencimiento));
  const lotes = ordenadas.slice(0, 60).map((lote) => {
    const { codigo_lote, material_codigo, material_nombre, bodega_nombre, cantidad,
      unidad, fecha_vencimiento, dias_para_vencer, estado_vencimiento } = lote;
    return { codigo_lote, material_codigo, material_nombre, bodega_nombre, cantidad,
      unidad, fecha_vencimiento, dias_para_vencer, estado_vencimiento };
  });

  try {
    const respuesta = await explicar({
      pregunta: mensaje,
      lotes,
      total_lotes_por_bodega: existencias.length,
      listado_parcial: lotes.length < existencias.length,
    }, apiKey, modelo);
    return res.json({ respuesta });
  } catch (error) {
    return res.status(502).json({ error: error.message.startsWith('Groq ')
      ? error.message : 'No se pudo conectar con Groq. Intenta de nuevo.' });
  }
}
