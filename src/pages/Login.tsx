import React, { useState } from 'react';
import type { AuthRequest } from '../types/auth';
import { api } from '../services/api'; // Telsiz odamızı içeri alıyoruz
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // 🚀 Işınlanma motorunu tanımladık

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const request: AuthRequest = { username, password };

        try {
            const response = await api.post('/auth/login', request);
            const token = response.data.token;

            localStorage.setItem('jwtToken', token);

            // Eski "alert" satırını silip yerine bunu yazıyoruz:
            navigate('/dashboard'); // 🚀 Bilet alındığı an rotayı Dashboard'a çevir!

        } catch (error) {
            console.error("Eyvah, kaleden ret yedik!", error);
            alert("Giriş başarısız! Kullanıcı adı veya şifre hatalı olabilir.");
        }
    };
    return (
        <div className="login-container">
            <form onSubmit={handleLogin} className="login-form">
                <h2>EduConnect Giriş</h2>

                <div className="form-group">
                    <label>Kullanıcı Adı</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Şifre</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="******"
                        required
                    />
                </div>

                <button type="submit">Gemiye Bin (Giriş Yap)</button>
            </form>
        </div>
    );
}