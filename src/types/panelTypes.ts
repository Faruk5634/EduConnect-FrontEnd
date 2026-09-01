export interface ClassroomInfo { id: number; name: string; }

export interface TeacherProfile {
  id: number;
  firstName: string;
  lastName: string;
  branch: string;
  username: string;
  phone?: string;
  email?: string;
  homeroomClasses: ClassroomInfo[];
}

export interface StudentProfile {
  id: number;
  firstName: string;
  lastName: string;
  schoolNumber: string;
  parentFullName?: string;
  username: string;
  grade?: string;
  gender?: string;
  phone?: string;
  email?: string;
}

export interface AnnouncementFile { fileName: string; fileUrl: string; }
export interface Announcement {
  id: number;
  title: string;
  content: string;
  createdDate: string;
  authorName: string;
  type: string;
  targetClasses: string[];
  attachedFiles?: AnnouncementFile[];
}

export interface Message {
  id: number;
  subject: string;
  content: string;
  date: string;
  time: string;
  isRead: boolean;
  type: 'INBOX' | 'SENT';
  sender: string;
  isSentByParent?: boolean;
}