import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(__dirname, '../../db/schema.sql');

function statementsFromSchema(sql) {
  return sql
    .replace(/\/\*[^]*?\*\//g, '')
    .split(';')
    .map((statement) => statement.trim())
    .filter(Boolean)
    .filter((statement) => !/^CREATE DATABASE/i.test(statement))
    .filter((statement) => !/^USE\s+/i.test(statement))
    .filter((statement) => !/^SET FOREIGN_KEY_CHECKS/i.test(statement))
    .filter((statement) => !/^DROP TABLE IF EXISTS/i.test(statement));
}

export async function up(queryInterface) {
  const sql = await fs.readFile(schemaPath, 'utf8');
  for (const statement of statementsFromSchema(sql)) {
    await queryInterface.sequelize.query(statement);
  }
}

export async function down(queryInterface) {
  const tables = [
    'detalle_factura', 'factura', 'movimiento_inventario', 'lote_mercancia',
    'detalle_orden_compra', 'orden_compra', 'inventario', 'cliente_x_trabajador',
    'producto', 'proveedor', 'bodega', 'trabajador', 'cliente', 'configuracion',
  ];

  await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=0');
  for (const table of tables) {
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS ${table}`);
  }
  await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS=1');
}
