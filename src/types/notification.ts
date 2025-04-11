
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  priority?: string;
  isRead?: boolean;
  time?: string;
  created_at?: string;
  userId?: string;
  date?: string;
}
