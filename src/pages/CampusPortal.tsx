import React from 'react';
import { useNavigate } from 'react-router-dom';

const CampusPortal: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-emerald-900 flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl font-bold mb-4">Kampüs Portalı</h1>
            <p className="text-emerald-200 mb-8">3 Büyük Buton buraya eklenecek!</p>
            <button
                onClick={() => navigate('/')}
                className="bg-emerald-600 px-6 py-2 rounded-lg hover:bg-emerald-500 transition-colors"
            >
                Liman'a Geri Dön
            </button>
        </div>
    );
};

export default CampusPortal;