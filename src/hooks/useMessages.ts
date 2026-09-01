import { useCallback, useState } from 'react';
import { api } from '../services/api';
import type { Message } from '../types/panelTypes';
import { showToast } from '../utils/toast';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Message[]>('/messages');
      setMessages(res.data || []);
    } catch (err) { console.error(err); showToast('Mesajlar alınamadı','error'); setMessages([]); }
    finally { setLoading(false); }
  }, []);

  const send = useCallback(async (payload: { receiverId: string; subject: string; content: string; }) => {
    try { await api.post('/messages', payload); await fetchAll(); }
    catch (err) { console.error(err); showToast('Mesaj gönderilemedi','error'); throw err; }
  }, [fetchAll]);

  const markRead = useCallback(async (id: number) => {
    try { await api.put(`/messages/${id}/read`); setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m)); }
    catch (err) { console.error(err); }
  }, []);

  return { messages, setMessages, loading, fetchAll, send, markRead };
}
