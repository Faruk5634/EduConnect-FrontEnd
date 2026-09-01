import { useEffect, useState } from 'react';
import { api } from '../services/api';

export interface SearchUser { userId: number; fullName: string; role: string; }

export function useUserSearch(query: string, debounceMs = 400) {
  const [results, setResults] = useState<SearchUser[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setVisible(false); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get<SearchUser[]>(`/messages/search-users?keyword=${encodeURIComponent(query)}`);
        setResults(res.data || []);
        setVisible(true);
      } catch (err) { console.error(err); setResults([]); setVisible(false); }
    }, debounceMs);

    return () => clearTimeout(t);
  }, [query, debounceMs]);

  return { results, visible, setVisible, setResults };
}
