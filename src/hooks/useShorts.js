import { useCallback, useEffect, useState } from 'react';

export default function useShorts() {
  const [shorts, setShorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/shorts');
      if (!res.ok) throw new Error(`Couldn't reach the video service (${res.status})`);

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setShorts(data.items || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching shorts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { shorts, loading, error, refetch: load };
}
