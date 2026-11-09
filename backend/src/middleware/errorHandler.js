export function errorHandler(err, _req, res, _next) {
  console.error(err);
  const status = Number(err.status || 500);

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'Ya existe un registro con un valor único duplicado' });
  }

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors?.[0]?.message || 'Datos inválidos' });
  }

  return res.status(status).json({
    error: status >= 500 ? 'Error interno del servidor' : (err.message || 'Error de solicitud'),
  });
}
