# Asistente de inventario de EcoObra

Módulo de Node.js 22 o 24 que explica alertas de vencimiento y sugerencias FEFO desde la terminal. Usa únicamente consultas HTTP GET. FEFO elige, por material y bodega, el lote con existencias que vence primero entre los aptos. El inventario autoritativo sigue en la API de Express, Sequelize y MySQL.

## Probar desde la raíz del proyecto

Prueba con datos de muestra, sin instalaciones ni credenciales:

```powershell
node ia/asistente.mjs vencimientos AC-K-0090 --demo --datos
node ia/asistente.mjs fefo AC-K-0090 --demo --datos
```

`--demo` usa respuestas fijas para el escenario del 9 de noviembre de 2026. `--datos` imprime la evidencia y omite la llamada al modelo. La segunda consulta debe sugerir `AC-M-0331` en la misma bodega. El comando `fefo` parte del código de un lote en alerta. Si el código aparece en varias bodegas o materiales, muestra un resultado por coincidencia.

## Activar la explicación de IA

1. Copiar `ia/.env.example` a `ia/.env` y configurar `GROQ_API_KEY` con una clave de [Groq Console](https://console.groq.com/keys). El modelo predeterminado es `llama-3.1-8b-instant` y se puede cambiar con `GROQ_MODEL`. Mantener la clave en ese archivo local.
2. Ejecutar desde la raíz:

```powershell
node --env-file=ia/.env ia/asistente.mjs fefo AC-K-0090 --demo
```

Para usar inventario real, iniciar el backend según el README principal y quitar `--demo`:

```powershell
node --env-file=ia/.env ia/asistente.mjs vencimientos
node --env-file=ia/.env ia/asistente.mjs fefo AC-K-0090
```

Para probar el backend sin usar el modelo, agregar `--datos`. El comando lista primero la evidencia de inventario y luego, cuando corresponde, la explicación generada. Envía al modelo solo los campos de lote necesarios para la consulta.

## Integración

- `GET /api/alertas/vencimientos` identifica las existencias vencidas o críticas.
- `GET /api/materiales/:id/existencias` permite filtrar lotes aptos de la misma bodega y material.
- Si la API falla, el módulo muestra el error. Los datos de ejemplo se usan exclusivamente al activar `--demo`.

Referencia técnica: [API Chat Completions de Groq](https://console.groq.com/docs/api-reference).

## Usar el chat de la página

En `backend/.env` agrega `GROQ_API_KEY` con tu clave de Groq y, si necesitas cambiar el modelo, `GROQ_MODEL`. El chat usa `openai/gpt-oss-120b` por defecto. Reinicia Express e inicia el frontend como indica el README principal. Abre **Asistente IA** abajo a la izquierda.

El chat consulta MySQL a través de los servicios de inventario de Express y envía a Groq la pregunta y hasta 60 existencias por lote y bodega, con prioridad para los códigos mencionados. El historial visual se mantiene mientras la página esté abierta. Escribe el código del lote en cada pregunta específica. La clave queda en el backend.
