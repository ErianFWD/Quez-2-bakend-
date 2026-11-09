# Frontend EcoObra

React 18 y Vite 5. Conecta por defecto a `http://localhost:3000/api`, con datos persistidos por el backend en MySQL. Consultar `../README.md` para la instalación completa.

Desde esta carpeta: copiar `.env.example` a `.env`, ejecutar `npm ci` y `npm start`. Abrir `http://localhost:5173`.

- `npm test`: reglas de inventario.
- `npm run build`: compilación para producción.
- `npm run preview`: previsualización de la compilación.
- `npm run demo`: inicia Vite y json-server; requiere `VITE_FUENTE_DATOS=dbjson` en `.env`. Es un modo independiente y no guarda en MySQL.
- `npm run db:reset`: regenera únicamente los datos de demostración de `db.json`.

Reiniciar Vite después de cambiar `.env`. Páginas: inicio, materiales, trazabilidad, vencimientos, movimientos, órdenes, alertas y configuración.
