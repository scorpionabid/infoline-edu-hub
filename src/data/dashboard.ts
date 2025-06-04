
import { FormItem, DeadlineItem, NotificationStats } from '@/types/dashboard';

export const mockFormItems: FormItem[] = [
  {
    id: '1',
    title: 'Məktəb Məlumatları',
    category: 'school_info',
    status: 'completed',
    progress: 100,
    updatedAt: '2024-01-15T10:30:00Z',
    deadline: '2024-01-31T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '2', 
    title: 'Müəllim Məlumatları',
    category: 'teacher_info',
    status: 'in_progress',
    progress: 65,
    updatedAt: '2024-01-14T16:45:00Z',
    deadline: '2024-02-15T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '3',
    title: 'Tələbə Statistikaları', 
    category: 'student_stats',
    status: 'in_progress',
    progress: 30,
    updatedAt: '2024-01-13T09:15:00Z',
    deadline: '2024-02-28T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '4',
    title: 'Maliyyə Hesabatı',
    category: 'finance_report', 
    status: 'not_started',
    progress: 0,
    updatedAt: '2024-01-12T14:20:00Z',
    deadline: '2024-03-15T23:59:59Z',
    school_id: 'school_1'
  }
];

export const mockDeadlines: DeadlineItem[] = [
  {
    id: '1',
    title: 'Məktəb Məlumatları',
    category: 'Məktəb İnformasiyası',
    deadline: '2024-01-31T23:59:59Z',
    status: 'upcoming',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Müəllim Hesabatı',
    category: 'Kadr Məlumatları', 
    deadline: '2024-02-15T23:59:59Z',
    status: 'upcoming',
    priority: 'normal'
  },
  {
    id: '3',
    title: 'Maliyyə Hesabatı',
    category: 'Maliyyə',
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
    updatedAt: '2024-01-15T14:30:00Z',
    deadline: '2024-01-31T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '2', 
    title: 'Müəllim siyahısı əlavə edildi',
    category: 'teacher_info',
    status: 'draft',
    progress: 45,
    updatedAt: '2024-01-15T12:15:00Z',
    deadline: '2024-02-15T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '3',
    title: 'Tələbə sayı yeniləndi',
    category: 'student_stats', 
    status: 'draft',
    progress: 90,
    updatedAt: '2024-01-15T09:45:00Z',
    deadline: '2024-02-28T23:59:59Z',
    school_id: 'school_1'
  }
];

export const mockPendingApprovals: FormItem[] = [
  {
    id: '1',
    title: 'Məktəb İnformasiyası',
    category: 'school_info',
    status: 'in_progress',
    progress: 100,
    updatedAt: '2024-01-14T16:30:00Z',
    deadline: '2024-01-31T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '2',
    title: 'Müəllim Məlumatları', 
    category: 'teacher_info',
    status: 'in_progress',
    progress: 75,
    updatedAt: '2024-01-14T14:20:00Z',
    deadline: '2024-02-15T23:59:59Z',
    school_id: 'school_1'
  },
  {
    id: '3',
    title: 'Tələbə Hesabatı',
    category: 'student_stats',
    status: 'not_started', 
    progress: 60,
    updatedAt: '2024-01-14T11:10:00Z',
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
