import type { AdminStats } from '../../hooks/useAdminDashboard';

type Props = {
    stats: AdminStats;
    loading: boolean;
    onSelect: (tab: string) => void;
};

export default function AdminOverview({ stats, loading, onSelect }: Props) {
    if (loading) {
        return <div className="text-center py-10 text-slate-400 font-medium animate-pulse">Veriler yükleniyor...</div>;
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div onClick={() => onSelect('students')} className="cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex flex-col items-center justify-center text-center group">
                    <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🎓</div>
                    <h4 className="text-4xl font-black text-slate-800 mb-1">{stats.students}</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Kayıtlı Öğrenci</p>
                </div>
                <div onClick={() => onSelect('teachers')} className="cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-emerald-400 transition-all flex flex-col items-center justify-center text-center group">
                    <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">👩‍🏫</div>
                    <h4 className="text-4xl font-black text-slate-800 mb-1">{stats.teachers}</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Aktif Öğretmen</p>
                </div>
                <div onClick={() => onSelect('classes')} className="cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-amber-400 transition-all flex flex-col items-center justify-center text-center group">
                    <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🏫</div>
                    <h4 className="text-4xl font-black text-slate-800 mb-1">{stats.classes}</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Mevcut Sınıf</p>
                </div>
                <div onClick={() => onSelect('parents')} className="cursor-pointer bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-purple-400 transition-all flex flex-col items-center justify-center text-center group">
                    <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">👨‍👩‍👧</div>
                    <h4 className="text-4xl font-black text-slate-800 mb-1">{stats.parents}</h4>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">Sistemdeki Veli</p>
                </div>
            </div>

            <div onClick={() => onSelect('announcements')} className="cursor-pointer bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition-all flex items-center justify-between group">
                <div className="flex items-start gap-4">
                    <div className="text-2xl mt-1 group-hover:scale-110 transition-transform">📢</div>
                    <div>
                        <h4 className="font-bold text-slate-800 mb-1">İletişim Durumu</h4>
                        <p className="text-sm text-slate-600 font-medium">Sistemde şu ana kadar kurumunuza ait toplam <span className="font-bold text-slate-900">{stats.announcements}</span> adet duyuru yayınlandı.</p>
                    </div>
                </div>
            </div>
        </>
    );
}
