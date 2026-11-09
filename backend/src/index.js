import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import sequelize from './config/database.js';
import { chatEcoObra } from './controllers/chatEcoObra.js';
import routes from './routes/index.js';
import './models/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app=express();
const PORT=Number(process.env.PORT||3000);
const CORS_ORIGIN=process.env.CORS_ORIGIN||'http://localhost:5173';
app.use(cors({origin:CORS_ORIGIN}));
app.use(express.json({limit:'1mb'}));
app.get('/',(_req,res)=>res.json({ok:true,servicio:'ecoobra-inventario-api'}));
app.post('/api/ia/chat', chatEcoObra);
app.use('/api',routes);
app.use((_req,res)=>res.status(404).json({error:'Ruta no encontrada'}));
app.use(errorHandler);
try{await sequelize.authenticate();console.log('✓ Conectado a MySQL');app.listen(PORT,()=>console.log(`✓ API EcoObra en http://localhost:${PORT}/api`));}catch(err){console.error('✗ No se pudo conectar a MySQL:',err.message);process.exit(1);}
