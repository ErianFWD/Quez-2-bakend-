# Revisión de integración EcoObra

## Resultado

El proyecto original tenía la capa de API y rutas compatibles, pero iniciaba el frontend con `db.json`. No estaba configurado para usar MySQL por defecto. Se corrigió la configuración y se verificó la comunicación real React → Express → MySQL 8.4.

## Correcciones

- Frontend en modo API por defecto; `npm start` inicia Vite y el modo JSON queda en `npm run demo`.
- Express 4: manejo explícito de errores de controladores asíncronos. Las validaciones devuelven JSON con 400/404/409 en lugar de dejar peticiones sin respuesta.
- Movimientos: se completa `referencia`, campo obligatorio que antes impedía guardar.
- Traslados: se conserva el lote global por producto/código, sin crear duplicados que violaban su índice único. Las ubicaciones se obtienen de los movimientos.
- Entradas del mismo lote en otra bodega reutilizan su identidad y validan la fecha de vencimiento.
- Búsqueda y categorías sincronizadas cuando cambian los parámetros de navegación en Materiales.
- Carga de existencias del formulario: limpia datos previos y muestra los errores de consulta.
- Prueba de backend con ruta de importación incorrecta corregida.
- SQL con tildes reales, cadenas entre comillas simples y `SET NAMES utf8mb4`. El esquema ya no elimina tablas al importarlo.
- Archivo SQL combinado y documentación de instalación actualizados; lockfile del backend añadido.

## Comprobaciones realizadas

En Linux, Node.js 24.22.1 y MySQL 8.4:

- Importación completa de `backend/db/ecoobra_mysql.sql` en una base de prueba nueva: 14 tablas y datos de demostración.
- Backend: `npm run check`, `npm test` (10 pruebas) y `npm run test:integration`.
- Frontend: `npm test` (10 pruebas) y `npm run build`.
- Integración HTTP: lectura de todos los recursos, alta y edición de material, configuración, creación y recepción de orden, traslado, salida, ajuste, trazabilidad, stock final esperado, rechazo de salida excesiva y de recepción repetida.
- Navegador Chromium con API y MySQL reales: páginas de materiales, detalle, vencimientos, movimientos, órdenes, alertas y configuración; búsqueda repetida desde la barra; alta de material y entrada con persistencia visible en trazabilidad.
- Vista móvil de 390 × 844: apertura del menú, navegación a materiales y ausencia de desbordamiento horizontal en esa pantalla.
- Sin errores JavaScript en los recorridos del navegador.
- ZIP extraído en una carpeta limpia: `npm ci` en ambos proyectos, pruebas del backend/frontend y compilación del frontend completados correctamente.

Los registros creados por estas pruebas existen solo en la base temporal de revisión; el SQL entregado contiene los datos de demostración originales corregidos.

## Alcance

No se instaló en el servidor del usuario ni se probaron Windows, despliegue público, carga concurrente o todos los casos límite. El sistema mantiene el alcance original sin autenticación. Las entidades de cliente y facturación existen en el esquema, pero no se agregaron pantallas ni endpoints para ellas. El SQL se entrega para una instalación nueva; no sustituye una migración de datos de una base anterior.
