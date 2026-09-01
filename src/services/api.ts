import axios from 'axios';

// Vite ortam değişkenlerinden Base URL'i güvenli (any kullanmadan) alıyoruz
const VITE_API_BASE = import.meta.env?.VITE_API_BASE || '';
export const API_BASE = VITE_API_BASE || 'http://localhost:8080';

// Temel telsiz bağlantımız - tüm istekleri `/api` altına yönlendirir
export const api = axios.create({
    baseURL: `${API_BASE}/api`,
});

// 🚀 GİDEN İSTEKLER (Request Interceptor) - Biletçi Memur
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        // Bilet varsa, TypeScript'i delmeden (any kullanmadan) güvenle ekle
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 🛡️ GELEN CEVAPLAR (Response Interceptor) - Güvenlik Şefi [YENİ EKLENDİ]
api.interceptors.response.use(
    (response) => {
        // Cevap başarılıysa veriyi olduğu gibi geri döndür
        return response;
    },
    (error) => {
        // Eğer makine dairesi 401 (Yetkisiz - Biletin süresi dolmuş) fırlatırsa
        if (error.response && error.response.status === 401) {
            // If the request asked to skip global redirect (e.g., login attempts), do not redirect here
            const req = error.config || {};
            const skipRedirect = req.headers && (req.headers['X-Skip-Auth-Redirect'] || req.headers['x-skip-auth-redirect']);
            if (skipRedirect) {
                return Promise.reject(error);
            }

            console.warn("Biletin süresi dolmuş veya yetkisiz erişim tespit edildi. Çıkış yapılıyor...");

            // Çürük bileti ve sicil kayıtlarını temizle
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('username');

            // Kullanıcıyı nazikçe giriş ekranına fırlat
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);