export interface NotificationStats {
  total: number;
  unread: number;
  today: number;
  thisWeek: number;
}

export interface DeadlineItem {
  id: string;
  title: string;
  deadline: string;
  status: 'upcoming' | 'overdue' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

export interface FormItem {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  progress: number;
  deadline: string;
  school_id: string;
  updated_at?: string;
}
