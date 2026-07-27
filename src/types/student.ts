export interface Student {
    id: number;
    firstName: string;
    lastName: string;
    schoolNumber: string;
    parentFullName: string;
    parentId?: number;
    username?: string;
    grade?: string;

    // 🚀 BACKEND UYUMU: Makine dairesinden gelen yepyeni alanlar
    gender?: string;
    phone?: string;
    email?: string;
}