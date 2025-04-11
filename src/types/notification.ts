
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority?: string;
  isRead?: boolean;
  date?: string; // Tarix xüsusiyyətini əlavə edirik
  created_at?: string;
}
