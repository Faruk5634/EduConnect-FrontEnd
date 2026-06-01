import axios from 'axios';

// Temel telsiz bağlantımız
export const api = axios.create({
    baseURL: 'http://localhost:8080/api',
});

// 🚀 İŞTE BİLETÇİ MEMURUMUZ (Interceptor)
api.interceptors.request.use(
    (config) => {
        // 1. Tarayıcının kasasından (localStorage) o şifreli bileti al
        const token = localStorage.getItem('token');

        // 2. Eğer bilet varsa, gidecek olan mesajın (header) üzerine zımbala!
        // Not: Java tarafı biletin başında "Bearer " kelimesini görmek ister, bu bir güvenlik standardıdır.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config; // Zarfa bileti koyduk, artık yola çıkabilir!
    },
    (error) => {
        // Bir hata olursa doğrudan geri fırlat
        return Promise.reject(error);
    }
);