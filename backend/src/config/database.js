 feat_yubran
import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecoobra_inventario',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    dialect: 'mysql',
    timezone: process.env.DB_TIMEZONE || '-06:00',
    logging: false,
    define: { underscored: true, freezeTableName: true, timestamps: false },
    dialectOptions: { decimalNumbers: true },
  }
);

export default sequelize;

// Conexión a MySQL con Sequelize. Los datos vienen del archivo .env (nunca subir credenciales).
import { Sequelize } from 'sequelize';
import 'dotenv/config';

export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: false,
  define: { underscored: true, freezeTableName: true },
});
 main
