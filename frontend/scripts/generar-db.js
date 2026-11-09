// Genera (o restaura) db.json con los datos de prueba.
// Uso: npm run db:reset
// Las fechas se calculan desde HOY para que siempre haya lotes vencidos,
// por vencer y vigentes al hacer la demo.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { crearDatosSemilla } from '../src/services/mockData.js';

const destino = join(dirname(fileURLToPath(import.meta.url)), '..', 'db.json');
writeFileSync(destino, JSON.stringify(crearDatosSemilla(), null, 2) + '\n', 'utf8');
console.log(`db.json generado en ${destino}`);
