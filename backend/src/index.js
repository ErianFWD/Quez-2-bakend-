 feat_yubran
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import routes from './routes/index.js';
import './models/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app=express();
const PORT=Number(process.env.PORT||3000);
const CORS_ORIGIN=process.env.CORS_ORIGIN||'http://localhost:5173';
app.use(cors({origin:CORS_ORIGIN}));
app.use(express.json({limit:'1mb'}));
app.get('/',(_req,res)=>res.json({ok:true,servicio:'ecoobra-inventario-api'}));
app.use('/api',routes);
app.use((_req,res)=>res.status(404).json({error:'Ruta no encontrada'}));
app.use(errorHandler);
try{await sequelize.authenticate();console.log('✓ Conectado a MySQL');app.listen(PORT,()=>console.log(`✓ API EcoObra en http://localhost:${PORT}/api`));}catch(err){console.error('✗ No se pudo conectar a MySQL:',err.message);process.exit(1);}

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
 main
