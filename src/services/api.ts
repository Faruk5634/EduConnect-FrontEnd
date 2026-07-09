import axios from 'axios';

// Backend base URL'i Vite ortam değişkeninden alınabilir. Geliştirme için localhost fallback'imiz var.
const VITE_API_BASE = (import.meta as any).env?.VITE_API_BASE || '';
export const API_BASE = VITE_API_BASE || 'http://localhost:8080';

// Temel telsiz bağlantımız - tüm istekleri `/api` altına yönlendirir
export const api = axios.create({
    baseURL: `${API_BASE}/api`,
});

// 🚀 İŞTE BİLETÇİ MEMURUMUZ (Interceptor)
api.interceptors.request.use(
    (config) => {
        // 1. Tarayıcının kasasından (localStorage) o şifreli bileti al
        const token = localStorage.getItem('token');

        // 2. Eğer bilet varsa, gidecek olan mesajın (header) üzerine zımbala!
        // Not: Java tarafı biletin başında "Bearer " kelimesini görmek ister, bu bir güvenlik standardıdır.
        if (token) {
            // headers her zaman tanımlı olmayabilir
            if (!config.headers) config.headers = {} as any;
            (config.headers as any).Authorization = `Bearer ${token}`;
        }

        return config; // Zarfa bileti koyduk, artık yola çıkabilir!
    },
    (error) => {
        // Bir hata olursa doğrudan geri fırlat
        return Promise.reject(error);
    }
);