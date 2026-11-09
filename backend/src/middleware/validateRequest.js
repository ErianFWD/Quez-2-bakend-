export function validateBody(requiredFields = []) {
  return (req, _res, next) => {
    const missing = requiredFields.filter((field) => {
      const value = req.body?.[field];
      return value === undefined || value === null || String(value).trim() === '';
    });

    if (missing.length) {
      const error = new Error(`Faltan campos obligatorios: ${missing.join(', ')}`);
      error.status = 400;
      return next(error);
    }

    next();
  };
}
