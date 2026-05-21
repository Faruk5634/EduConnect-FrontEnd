// src/types/auth.ts

// Java'daki AuthRequest DTO'sunun karşılığı (Gişeye verdiğimiz form)
export interface AuthRequest {
    username: string;
    password?: string;
}

// Java'daki AuthResponse DTO'sunun karşılığı (Gişeden aldığımız bilet)
export interface AuthResponse {
    token: string;
}