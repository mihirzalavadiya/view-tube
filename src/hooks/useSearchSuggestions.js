import { useState, useEffect } from 'react';

const useSearchSuggestions = (query) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${query}`);
        const data = await res.json();
        setSuggestions(data[1] || []);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        // fallback mock data
        setSuggestions([
          { snippet: { title: `${query} tutorial` } },
          { snippet: { title: `${query} guide` } },
          { snippet: { title: `${query} tips` } },
          { snippet: { title: `${query} 2024` } },
          { snippet: { title: `best ${query}` } },
        ]);
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delay);
  }, [query]);

  return { suggestions, loading };
};

export default useSearchSuggestions;
