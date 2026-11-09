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
