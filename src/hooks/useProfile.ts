import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { showToast } from '../utils/toast';
import type { TeacherProfile, StudentProfile } from '../types/panelTypes';

export function useTeacherProfile() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try { const res = await api.get<TeacherProfile>('/teachers/me'); setProfile(res.data); }
    catch (err) { console.error(err); showToast('Profil yüklenemedi','error'); }
    finally { setLoading(false); }
  })(); }, []);

  const refresh = async () => { setLoading(true); try { const res = await api.get<TeacherProfile>('/teachers/me'); setProfile(res.data); } catch(e){ console.error(e); showToast('Profil yenilenemedi','error'); } finally { setLoading(false); } };

  return { profile, loading, refresh, setProfile };
}

export function useStudentProfile(fetchUrl: string | null) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    try { const res = await api.get<StudentProfile>(fetchUrl ?? '/students/me'); setProfile(res.data); }
    catch (err) { console.error(err); showToast('Profil yüklenemedi','error'); }
    finally { setLoading(false); }
  })(); }, [fetchUrl]);

  const refresh = async () => { setLoading(true); try { const res = await api.get<StudentProfile>(fetchUrl ?? '/students/me'); setProfile(res.data); } catch(e){ console.error(e); showToast('Profil yenilenemedi','error'); } finally { setLoading(false); } };

  return { profile, loading, refresh, setProfile };
}
