# Químicos EcoObra S.A. · Gestión de Inventarios (Quiz #2, caso #062)

Control de materiales con fecha de vencimiento para una distribuidora de selladores,
adhesivos y químicos de obra (Opción 2 del enunciado: control de inventario).

```
├── frontend/   React + Vite + db.json (json-server)  ← terminado
├── backend/    Node + Express + MySQL + Sequelize     ← base lista, falta implementar
└── ia/         Parte de IA                             ← pendiente
```

- Frontend: ver `frontend/README.md` (`npm install` y `npm start`).
- Back end: ver `backend/README.md` y `backend/API_CONTRACT.md`, que dice exactamente qué rutas y qué JSON espera el frontend.
- Para conectar ambos: en `frontend/.env` cambiar `VITE_FUENTE_DATOS=api`.

No se suben contraseñas: cada carpeta tiene su `.env.example` y el `.env` real está en `.gitignore`.
