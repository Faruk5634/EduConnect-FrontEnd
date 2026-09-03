import { useCallback, useState } from 'react';
import { api } from '../services/api';
import type { Announcement } from '../types/panelTypes';
import { showToast } from '../utils/toast';

export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<Announcement[]>('/announcements');
      const sorted = (res.data || []).sort((a,b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
      setAnnouncements(sorted);
    } catch (err) {
      console.error(err); showToast('Duyurular yüklenemedi','error');
      setAnnouncements([]);
    } finally { setLoading(false); }
  }, []);

  const create = useCallback(async (formData: FormData) => {
    try {
      await api.post('/announcements/create', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Duyuru başarıyla yayınlandı!', 'success');
      await fetchAll();
    } catch (err: any) {
      // HTTP 500 is typically a file storage / SecurityException on the backend
      if (err?.response?.status === 500) {
        showToast(
          'Duyuru oluşturulurken bir hata oluştu. Lütfen dosya isimlerini kontrol edin (özel karakter veya çok uzun isim olabilir).',
          'error'
        );
      } else if (err?.response?.status === 413) {
        showToast('Dosya boyutu çok büyük! Lütfen daha küçük dosyalar seçin.', 'error');
      } else {
        showToast('Duyuru oluşturulamadı. Lütfen tekrar deneyin.', 'error');
      }
      throw err;
    }
  }, [fetchAll]);

  const remove = useCallback(async (id: number) => {
    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) { console.error(err); showToast('Duyuru silinemedi','error'); }
  }, []);

  return { announcements, setAnnouncements, loading, fetchAll, create, remove };
}
