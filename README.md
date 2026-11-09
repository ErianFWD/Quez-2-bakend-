# EcoObra — Quiz #2

Proyecto de Gestión de Inventarios de Químicos EcoObra.

- `frontend/`: aplicación React/Vite terminada.
- `backend/`: API Express + Sequelize + MySQL alineada al DER recibido y al contrato de API.
- `ia/`: espacio para la parte de IA.

## Ejecución

### Backend

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run dev
```

### Base de datos

Ejecutar `backend/db/schema.sql` y después `backend/db/seed.sql` en MySQL Workbench.

### Frontend

En `frontend/.env`:

```env
VITE_FUENTE_DATOS=api
VITE_API_URL=http://localhost:3000/api
```

Después:

```powershell
cd frontend
npm install
npm run dev
```
