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

            // 1. Bileti kasaya atıyoruz (Bu zaten vardı)
            localStorage.setItem('jwtToken', token);

            // 🚀 SİHİRLİ DOKUNUŞ: Biletin ambalajını (Payload/Gövde) açıp içindeki rütbeyi (role) okuyoruz!
            // Bir JWT üç parçadan oluşur (Başlık.Gövde.İmza). Biz ortadaki (1. indeksli) parçayı alıyoruz.
            const payloadBase64 = token.split('.')[1];
            // Base64 şifresini çözüp JSON formatına çeviriyoruz
            const decodedPayload = JSON.parse(window.atob(payloadBase64));

            // Okuduğumuz rütbeyi de tarayıcının kasasına kaydediyoruz!
            const userRole = decodedPayload.role;
            localStorage.setItem('userRole', userRole);

            console.log("Gemiye binen kişinin rütbesi tespit edildi:", userRole);

            // 🚀 YÖNLENDİRME ZEKASI: Rütbeye göre doğru kamaraya (sayfaya) yönlendir.
            if (userRole === 'ROLE_ADMIN') {
                navigate('/dashboard'); // Adminler yönetim paneline
            } else if (userRole === 'ROLE_TEACHER') {
                navigate('/teacher-panel'); // Öğretmenler kendi paneline (Bu sayfayı daha sonra yapacağız)
            } else if (userRole === 'ROLE_PARENT') {
                navigate('/parent-panel'); // Veliler veli paneline (Bu sayfayı da sonra yapacağız)
            } else {
                navigate('/student-panel'); // Öğrenciler kendi duyuru paneline
            }

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