
import { FormItem, DeadlineItem, NotificationStats } from '@/types/dashboard';

export const mockFormItems: FormItem[] = [
  {
    id: '1',
    title: 'Məktəb Məlumatları',
    category: 'school_info',
    status: 'approved',
    progress: 100,
    updated_at: '2024-01-15T10:30:00Z',
    deadline: '2024-01-31T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '2', 
    title: 'Müəllim Məlumatları',
    category: 'teacher_info',
    status: 'pending',
    progress: 65,
    updated_at: '2024-01-14T16:45:00Z',
    deadline: '2024-02-15T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '3',
    title: 'Tələbə Statistikaları', 
    category: 'student_stats',
    status: 'pending',
    progress: 30,
    updated_at: '2024-01-13T09:15:00Z',
    deadline: '2024-02-28T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '4',
    title: 'Maliyyə Hesabatı',
    category: 'finance_report', 
    status: 'draft',
    progress: 0,
    updated_at: '2024-01-12T14:20:00Z',
    deadline: '2024-03-15T23:59:59Z',
    school_id: 'school_1'
  }
];

export const mockDeadlines: DeadlineItem[] = [
  {
    id: '1',
    title: 'Məktəb Məlumatları',
    deadline: '2024-01-31T23:59:59Z',
    status: 'upcoming',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Müəllim Hesabatı',
    deadline: '2024-02-15T23:59:59Z',
    status: 'upcoming',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Maliyyə Hesabatı',
    deadline: '2024-03-15T23:59:59Z', 
    status: 'upcoming',
    priority: 'low'
  }
];

export const mockRecentActivity: FormItem[] = [
  {
    id: '1',
    title: 'Məktəb profili yeniləndi',
    category: 'school_info',
    status: 'draft',
    progress: 85,
    updated_at: '2024-01-15T14:30:00Z',
    deadline: '2024-01-31T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '2', 
    title: 'Müəllim siyahısı əlavə edildi',
    category: 'teacher_info',
    status: 'draft',
    progress: 45,
    updated_at: '2024-01-15T12:15:00Z',
    deadline: '2024-02-15T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '3',
    title: 'Tələbə sayı yeniləndi',
    category: 'student_stats', 
    status: 'draft',
    progress: 90,
    updated_at: '2024-01-15T09:45:00Z',
    deadline: '2024-02-28T23:59:59Z',
    school_id: 'school_1'
  }
];

export const mockPendingApprovals: FormItem[] = [
  {
    id: '1',
    title: 'Məktəb İnformasiyası',
    category: 'school_info',
    status: 'pending',
    progress: 100,
    updated_at: '2024-01-14T16:30:00Z',
    deadline: '2024-01-31T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '2',
    title: 'Müəllim Məlumatları', 
    category: 'teacher_info',
    status: 'pending',
    progress: 75,
    updated_at: '2024-01-14T14:20:00Z',
    deadline: '2024-02-15T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '3',
    title: 'Tələbə Hesabatı',
    category: 'student_stats',
    status: 'draft', 
    progress: 60,
    updated_at: '2024-01-14T11:10:00Z',
    deadline: '2024-02-28T23:59:59Z',
    school_id: 'school_1'
  }
];

export const mockNotificationStats: NotificationStats = {
  total: 15,
  unread: 3,
  today: 5,
  thisWeek: 12
};
