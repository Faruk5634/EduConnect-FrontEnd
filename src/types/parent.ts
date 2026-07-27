export interface Parent {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;    // 🚀 BACKEND UYUMU: Velinin telefonu eklendi
    username?: string;       // 🚀 BACKEND UYUMU: Lise velileri için kullanıcı adı
    studentNames?: string[]; // DTO'dan gelen bu listeyi de bilelim
}