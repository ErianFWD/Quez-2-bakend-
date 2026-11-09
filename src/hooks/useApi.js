import { useCallback, useEffect, useState } from 'react';

// Hook para cargar datos de la API con estados de carga y error.
// Uso: const { data, loading, error, reload } = useApi(() => api.getMateriales(), []);
export function useApi(fn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cargar = useCallback(fn, deps);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await cargar());
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [cargar]);

  useEffect(() => { reload(); }, [reload]);

  return { data, loading, error, reload, setData };
}
