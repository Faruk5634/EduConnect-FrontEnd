export interface Parent {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    studentNames?: string[]; // DTO'dan gelen bu listeyi de bilelim
}