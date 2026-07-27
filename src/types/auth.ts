// src/types/auth.ts

// Java'daki AuthRequest DTO'sunun karşılığı (Gişeye verdiğimiz form)
export interface AuthRequest {
    username: string;
    password?: string;
    role?: string;      // 🚀 BACKEND UYUMU: Kayıt olurken rütbe seçimi
    schoolId?: number;  // 🚀 BACKEND UYUMU: Super Admin'in okul ataması yapabilmesi için
}

// Java'daki AuthResponse DTO'sunun karşılığı (Gişeden aldığımız bilet)
export interface AuthResponse {
    username: string;   // 🚀 BACKEND UYUMU
    role: string;       // 🚀 BACKEND UYUMU
    message: string;    // 🚀 BACKEND UYUMU
    token: string;
}