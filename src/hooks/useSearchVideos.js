import { useState } from 'react';

const useSearchVideos = () => {
  const [loading, setLoading] = useState(false);

  const searchVideos = async (query) => {
    if (!query.trim()) return [];

    setLoading(true);
    try {
      const res = await fetch(`/api/searchvideo?q=${query}`);
      if (!res.ok) throw new Error('Failed to fetch search results');

      const data = await res.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching search results:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { searchVideos, loading };
};

export default useSearchVideos;
