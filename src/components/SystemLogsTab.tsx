import React, { useState, useEffect } from 'react';
import axios from 'axios';

// 📌 Log Veri Modeli
interface LogEntry {
    id: number;
    timestamp: string;
    user: string;
    action: string;
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'CRITICAL';
    ipAddress: string;
}

const SystemLogsTab: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔍 Filtreleme Durumları
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    // 📡 GERÇEK VERİ YÜKLEYİCİ (Backend'den Çekiliyor)
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const token = localStorage.getItem('token');
                // Backend log API'sine istek atılıyor
                const response = await axios.get('http://localhost:8080/api/logs', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // Gelen veriyi state'e aktar
                setLogs(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Sistem logları çekilemedi:", error);
                // Hata olursa veya henüz Backend API'si yazılmadıysa listeyi boşalt
                setLogs([]);
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    // 🚀 FİLTRELEME MOTORU
    const filteredLogs = logs.filter(log => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = log.user?.toLowerCase().includes(searchLower) || log.action?.toLowerCase().includes(searchLower);
        const matchesType = typeFilter === 'ALL' || log.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // 🎨 Renk Rozetleri Motoru
    const getBadgeStyle = (type: string) => {
        switch (type) {
            case 'SUCCESS': return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20';
            case 'WARNING': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'CRITICAL': return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'INFO': default: return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    const getBadgeLabel = (type: string) => {
        switch (type) {
            case 'SUCCESS': return 'BAŞARILI';
            case 'WARNING': return 'UYARI';
            case 'CRITICAL': return 'KRİTİK';
            case 'INFO': default: return 'BİLGİ';
        }
    };

    if (loading) return <div className="text-center py-20 text-slate-400 font-medium animate-pulse">📡 Sistem denetim kayıtları taranıyor...</div>;

    return (
        <div className="animate-fade-in-down h-full bg-slate-50 p-6 md:p-8 rounded-tl-3xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Sistem Logları ve Denetim</h2>
                    <p className="text-slate-500 text-sm mt-1">Sistemdeki tüm hareketleri, güvenlik uyarılarını ve atamaları canlı olarak izleyin.</p>
                </div>
                <button onClick={() => window.print()} className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-5 py-2.5 rounded-md font-bold shadow-sm transition-all flex items-center gap-2 text-sm tracking-widest">
                    <span>🖨️</span> RAPOR YAZDIR
                </button>
            </div>

            {/* 🎛️ FİLTRE VE ARAMA ÇUBUĞU (Banka Teması) */}
            <div className="bg-white p-4 rounded-md shadow-sm border border-slate-200 mb-6 flex flex-col sm:flex-row gap-4 flex-shrink-0">
                <div className="flex-1 relative">
                    <span className="absolute left-4 top-3 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Kullanıcı, eylem veya IP adresi ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md pl-11 pr-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-blue-700 outline-none transition-all placeholder:text-slate-400"
                    />
                </div>
                <div className="w-full sm:w-56">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-sm font-semibold focus:bg-white focus:border-blue-700 outline-none transition-all cursor-pointer text-slate-700"
                    >
                        <option value="ALL">Tüm Olay Türleri</option>
                        <option value="INFO">Bilgi (Info)</option>
                        <option value="SUCCESS">Başarılı (Success)</option>
                        <option value="WARNING">Uyarı (Warning)</option>
                        <option value="CRITICAL">Kritik (Critical)</option>
                    </select>
                </div>
            </div>

            {/* 📊 TABLO EKRANI (Scrollable - Kaydırılabilir Ana Alan) */}
            <div className="bg-white border border-slate-200 rounded-md shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-slate-50 z-10">
                        <tr className="border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider font-bold">
                            <th className="p-4 pl-6 whitespace-nowrap">Tarih & Saat</th>
                            <th className="p-4 whitespace-nowrap">Olay Türü</th>
                            <th className="p-4 whitespace-nowrap">Kullanıcı</th>
                            <th className="p-4 w-full">Açıklama / Eylem</th>
                            <th className="p-4 pr-6 whitespace-nowrap">IP Adresi</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                        {filteredLogs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                                    {searchTerm || typeFilter !== 'ALL'
                                        ? 'Arama kriterlerine uygun log bulunamadı.'
                                        : 'Henüz sisteme kaydedilmiş bir log bulunmuyor veya Backend API (api/logs) hazır değil.'}
                                </td>
                            </tr>
                        ) : (
                            filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                                    <td className="p-4 pl-6 text-sm font-semibold text-slate-600 whitespace-nowrap">
                                        {log.timestamp}
                                    </td>
                                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase border tracking-widest ${getBadgeStyle(log.type)}`}>
                        {getBadgeLabel(log.type)}
                      </span>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-slate-800 whitespace-nowrap">
                                        {log.user}
                                    </td>
                                    <td className="p-4 text-sm font-medium text-slate-700">
                                        {log.action}
                                    </td>
                                    <td className="p-4 pr-6 text-xs font-mono text-slate-400 whitespace-nowrap">
                                        {log.ipAddress}
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default SystemLogsTab;