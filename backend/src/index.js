// Punto de entrada de la API.
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { sequelize } from './models/index.js';
import rutas from './routes/index.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

app.get('/api/salud', (req, res) => res.json({ ok: true }));
app.use('/api', rutas);

// Manejo de errores general: siempre responde { error: "mensaje" }
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, async () => {
  console.log(`API escuchando en http://localhost:${PORT}/api`);
  try {
    await sequelize.authenticate();
    console.log('Conectado a MySQL');
  } catch (e) {
    console.warn('No se pudo conectar a MySQL (revise .env):', e.message);
  }
});
