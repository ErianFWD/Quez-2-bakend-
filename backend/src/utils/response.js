export function sendError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  throw error;
}
