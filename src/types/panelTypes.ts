export interface ClassroomInfo { id: number; name: string; }

export interface TeacherProfile {
  id: number;
  firstName: string;
  lastName: string;
  branch: string;
  username: string;
  phone?: string;
  email?: string;
  schoolName?: string;
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
  /** Backend primary date field */
  createdDate: string;
  /** Fallback date field (some endpoints use 'date') */
  date?: string;
  authorName: string;
  type: string;
  /** Backend field name for target class names */
  targetClasses: string[];
  /** Fallback for older field name */
  targetClassroomNames?: string[];
  /** Attached files */
  attachedFiles?: AnnouncementFile[];
  /** Fallback for older field name */
  attachments?: AnnouncementFile[];
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