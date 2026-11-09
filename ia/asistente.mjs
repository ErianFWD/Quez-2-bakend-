import { explicar } from './groq.mjs';
import { parseArgs } from 'node:util';
import { respuestasDemo } from './demo.mjs';
import { prepararConsulta } from './inventario.mjs';

async function consultarAPI(ruta) {
  const base = (process.env.ECOOBRA_API_URL || 'http://localhost:3000/api').replace(/\/$/, '');
  const respuesta = await fetch(base + ruta, { signal: AbortSignal.timeout(8000) });
  if (!respuesta.ok) throw new Error(`EcoObra devolvió HTTP ${respuesta.status} en ${ruta}.`);
  const datos = await respuesta.json();
  if (!Array.isArray(datos)) throw new Error(`Respuesta inesperada de EcoObra en ${ruta}.`);
  return datos;
}

async function ejecutar() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: { demo: { type: 'boolean' }, datos: { type: 'boolean' } },
  });
  const [accion, lote] = positionals;
  if (!['vencimientos', 'fefo'].includes(accion) || positionals.length > 2 || (accion === 'fefo' && !lote?.trim())) {
    throw new Error('Uso: node ia/asistente.mjs vencimientos [CÓDIGO] o fefo CÓDIGO [--demo] [--datos]');
  }
  const consultar = values.demo ? async (ruta) => {
    if (!(ruta in respuestasDemo)) throw new Error(`La demo no tiene datos para ${ruta}.`);
    return respuestasDemo[ruta];
  } : consultarAPI;
  const datos = await prepararConsulta(consultar, accion, lote?.trim().toUpperCase());
  console.log(values.demo ? 'Fuente: datos de demostración' : 'Fuente: API EcoObra');
  console.log(JSON.stringify(datos, null, 2));
  if (values.datos || !datos.registros.length) return;

  const apiKey = process.env.GROQ_API_KEY?.trim();
  const modelo = process.env.GROQ_MODEL?.trim() || 'llama-3.1-8b-instant';
  if (!apiKey) throw new Error('Configura GROQ_API_KEY en ia/.env o ejecuta con --datos.');
  const explicacion = await explicar(datos, apiKey, modelo);
  console.log(`\nExplicación de IA\n${explicacion}`);
}

ejecutar().catch((error) => {
  console.error(error.cause?.code === 'ECONNREFUSED'
    ? 'No se pudo conectar a la API EcoObra. Inicia el backend o usa --demo.'
    : error.message);
  process.exitCode = 1;
});
