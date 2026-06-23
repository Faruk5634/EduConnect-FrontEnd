export interface Student {
    id: number;
    firstName: string;
    lastName: string;
    schoolNumber: string;
    parentFullName: string; // 🚀 YENİ: Java'dan gelen tam isim
    parentId?: number; // Düzenleme işlemi için (buna birazdan değineceğiz)

    // 🚀 BACKEND UYUMU: Makine dairesinden gelen yeni alanlar eklendi
    username?: string;
    grade?: string;
}