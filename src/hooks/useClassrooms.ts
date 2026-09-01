import { useCallback, useState } from 'react';
import { api } from '../services/api';
import { showToast } from '../utils/toast';

interface Classroom { id: number; name: string; gradeLevel: number; homeroomTeacherFullName: string; studentNames?: string[] }
interface Teacher { id:number; firstName:string; lastName:string; branch:string }
interface Student { id:number; firstName:string; lastName:string; schoolNumber:string; grade:string; parentFullName?:string }

export function useClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classStudents, setClassStudents] = useState<Student[]>([]);
  const [schoolType, setSchoolType] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    try {
      try {
        const userRes = await api.get('/users/me');
        setSchoolType(userRes.data.schoolType || 'HIGH_SCHOOL');
      } catch (_) { console.warn('Kullanıcı türü çekilemedi.'); }

      const [classRes, teacherRes] = await Promise.all([api.get('/classrooms'), api.get('/teachers')]);
      setClassrooms(classRes.data || []);
      setTeachers(teacherRes.data || []);
    } catch (err) {
      console.error(err); showToast('Veriler yüklenemedi','error');
      setClassrooms([]); setTeachers([]);
    } finally { setLoading(false); }
  }, []);

  const fetchClassStudents = useCallback(async (className: string) => {
    try {
      const res = await api.get('/students/list');
      const filtered = (res.data || []).filter((s: any) => s.grade === className);
      setClassStudents(filtered);
    } catch (err) { console.error(err); showToast('Öğrenciler yüklenemedi','error'); setClassStudents([]); }
  }, []);

  const createOrUpdateClass = useCallback(async (payload: { name: string; gradeLevel: number; teacherId?: string }, idToUpdate?: number | null) => {
    try {
      if (idToUpdate) {
        let url = `/classrooms/${idToUpdate}`;
        if (payload.teacherId) url += `?teacherId=${payload.teacherId}`;
        await api.put(url, { name: payload.name, gradeLevel: payload.gradeLevel });
      } else {
        const res = await api.post('/classrooms', { name: payload.name, gradeLevel: payload.gradeLevel });
        const newClassId = res.data.id;
        if (payload.teacherId) {
          await api.put(`/classrooms/${newClassId}/teacher/${payload.teacherId}`, {});
        }
      }
      await fetchInitialData();
    } catch (err) { console.error(err); showToast('Sınıf oluşturulamadı/güncellenemedi','error'); throw err; }
  }, [fetchInitialData]);

  const deleteClass = useCallback(async (id:number) => {
    try { await api.delete(`/classrooms/${id}`); await fetchInitialData(); }
    catch (err) { console.error(err); showToast('Sınıf silinemedi','error'); }
  }, [fetchInitialData]);

  const deleteStudent = useCallback(async (id:number) => {
    try { await api.delete(`/students/${id}`); setClassStudents(prev => prev.filter(s => s.id !== id)); }
    catch (err) { console.error(err); showToast('Öğrenci silinemedi','error'); }
  }, []);

  return { classrooms, teachers, classStudents, schoolType, loading, fetchInitialData, fetchClassStudents, createOrUpdateClass, deleteClass, deleteStudent };
}
