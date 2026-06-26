import React from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-bold mb-4">Yönetim Girişi</h1>
            <p className="text-slate-400 mb-8">Bu kapıyı yakında inşa edeceğiz Kaptan!</p>
            <button
                onClick={() => navigate('/')}
                className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
                Liman'a Geri Dön
            </button>
        </div>
    );
};

export default AdminLoginPage;