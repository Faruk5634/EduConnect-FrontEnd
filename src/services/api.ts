// src/services/api.ts
import axios from 'axios';

// Tüm isteklerin geçeceği ana telsiz frekansımız
export const api = axios.create({
    baseURL: 'http://localhost:8080/api', // Java kalesinin koordinatları
    headers: {
        'Content-Type': 'application/json',
    },
});

// İleride, bilet (JWT Token) elimize geçtiğinde her isteğin başlığına
// otomatik olarak o bileti ekleyecek bir memuru da buraya yazacağız.