# EcoObra: frontend, API y MySQL

Aplicación de inventario por material, lote y bodega. Esta entrega conecta React con la API Express y MySQL por defecto. `db.json` queda como demostración opcional e independiente.

## Requisitos

- Node.js 22 o 24 LTS y npm (verificado con 24.22.1).
- MySQL 8.0 o 8.4; verificado con MySQL 8.4.
- MySQL Workbench o cliente MySQL para importar el SQL.

## 1. Crear la base MySQL

En MySQL Workbench, conectar con tu servidor, abrir `backend/db/ecoobra_mysql.sql` y ejecutar el archivo completo. Crea `ecoobra_inventario`, 14 tablas relacionadas y datos de demostración (8 materiales, 3 bodegas, 3 proveedores, órdenes, lotes y movimientos).

También se puede importar desde el cliente interactivo MySQL, en Windows o Linux:

```text
mysql -u root -p
```

Dentro del cliente, usar la ruta real del archivo, con barras `/`:

```sql
SOURCE C:/ruta/ecoObra/backend/db/ecoobra_mysql.sql;
SHOW TABLES FROM ecoobra_inventario;
```

En Linux, por ejemplo: `SOURCE /ruta/ecoObra/backend/db/ecoobra_mysql.sql;`.

El archivo combinado es para una base nueva: los datos de demostración se cargan una sola vez. No elimina tablas existentes; tampoco actualiza esquemas de instalaciones anteriores. Para crear solo la estructura, usar `backend/db/schema.sql`. No combinar la importación SQL con `npm run db:migrate` en la misma base.

## 2. Iniciar el backend

En una terminal, entrar en la carpeta `backend` de este proyecto. Crear `.env` copiando `.env.example` (Explorador de archivos, `copy .env.example .env` en CMD o `cp .env.example .env` en Linux). Configurar los datos reales de MySQL:

```env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=ecoobra_inventario
DB_USER=root
DB_PASSWORD=tu_contraseña_local
DB_TIMEZONE=-06:00
CORS_ORIGIN=http://localhost:5173
```

Ejecutar desde `backend`:

```text
npm ci
npm run dev
```

Debe mostrar que se conectó a MySQL. Abrir `http://localhost:3000/api/salud`: debe responder `ok: true`.

## 3. Iniciar el frontend

En otra terminal, entrar en `frontend`. Copiar `.env.example` a `.env`, de la misma forma que en el backend. Debe contener:

```env
VITE_FUENTE_DATOS=api
VITE_API_URL=http://localhost:3000/api
```

Ejecutar desde `frontend`:

```text
npm ci
npm start
```

Abrir `http://localhost:5173`. Los cambios se guardan en MySQL mediante el backend. Reiniciar Vite después de cambiar `.env`. Si ya existía un `.env` con `VITE_FUENTE_DATOS=dbjson`, cambiarlo a `api`.

## Verificación

Desde `backend`: `npm run check` y `npm test`.
Desde `frontend`: `npm test` y `npm run build`.
Con el backend iniciado y una base de pruebas con los datos de demostración: desde `backend`, ejecutar `npm run test:integration`. Este último crea registros de prueba; no ejecutarlo contra datos de trabajo.

`REVISION.md` describe hallazgos y pruebas realizadas. `backend/scripts/verificar-integracion.js` contiene la comprobación reproducible contra la API.

## Estructura

- `frontend/`: React, navegación y formularios.
- `backend/src/`: API, modelos Sequelize y reglas de inventario.
- `backend/db/ecoobra_mysql.sql`: instalación completa en MySQL con demostración.
- `backend/db/schema.sql`: estructura sin datos.
- `backend/db/seed.sql`: datos de demostración, después del esquema.

## Problemas habituales

- Conexión rechazada a MySQL: revisar servicio, host, puerto y contraseña en `backend/.env`.
- Se muestra “Datos: db.json”: cambiar `VITE_FUENTE_DATOS=api` y reiniciar el frontend.
- Error de CORS: usar `http://localhost:5173`, que coincide con `CORS_ORIGIN`; si cambias la dirección, actualizarla en el backend y reiniciarlo.
- Vite usa otro puerto: liberar 5173 o ajustar `CORS_ORIGIN` al puerto elegido.
- La compilación se sirve desde otro dominio: configurar `VITE_API_URL` antes de compilar y habilitar ese origen en la API. El servidor web debe redirigir las rutas de React a `index.html`.

La verificación se realizó en Linux. Los pasos con Workbench y CMD se documentan para Windows, pero no se ejecutaron allí. El proyecto mantiene el alcance original de inventario sin autenticación de usuarios.
