
import { FormItem, DeadlineItem } from '@/types/dashboard';

export const mockFormItems: FormItem[] = [
  {
    id: '1',
    title: 'Məktəb məlumatları',
    category: 'Ümumi',
    status: 'approved',
    progress: 100,
    deadline: '2024-01-15',
    school_id: 'school-1'
  },
  {
    id: '2',
    title: 'Müəllim məlumatları',
    category: 'Kadrlar',
    status: 'pending',
    progress: 75,
    deadline: '2024-01-20',
    school_id: 'school-1'
  },
  {
    id: '3',
    title: 'Şagird məlumatları',
    category: 'Təhsil',
    status: 'draft',
    progress: 30,
    deadline: '2024-01-25',
    school_id: 'school-1'
  },
  {
    id: '4',
    title: 'Maliyyə hesabatı',
    category: 'Maliyyə',
    status: 'rejected',
    progress: 50,
    deadline: '2024-01-30',
    school_id: 'school-1'
  }
];

export const mockDeadlineItems: DeadlineItem[] = [
  {
    id: '1',
    title: 'Müəllim məlumatları',
    name: 'Müəllim məlumatları',
    deadline: '2024-01-20',
    status: 'upcoming',
    priority: 'high',
    daysLeft: 5
  },
  {
    id: '2',
    title: 'Şagird məlumatları',
    name: 'Şagird məlumatları',
    deadline: '2024-01-25',
    status: 'upcoming',
    priority: 'medium',
    daysLeft: 10
  },
  {
    id: '3',
    title: 'Maliyyə hesabatı',
    name: 'Maliyyə hesabatı',
    deadline: '2024-01-30',
    status: 'upcoming',
    priority: 'low',
    daysLeft: 15
  }
];

export const mockSchoolFormItems: FormItem[] = [
  {
    id: '5',
    title: 'Təhsil keyfiyyəti',
    category: 'Keyfiyyət',
    status: 'approved',
    progress: 100,
    deadline: '2024-02-01',
    school_id: 'school-2'
  },
  {
    id: '6',
    title: 'İnfrastruktur məlumatları',
    category: 'İnfrastruktur',
    status: 'pending',
    progress: 60,
    deadline: '2024-02-05',
    school_id: 'school-2'
  },
  {
    id: '7',
    title: 'Məzun məlumatları',
    category: 'Məzunlar',
    status: 'draft',
    progress: 25,
    deadline: '2024-02-10',
    school_id: 'school-2'
  },
  {
    id: '8',
    title: 'Sosial fəaliyyət',
    category: 'Sosial',
    status: 'approved',
    progress: 100,
    deadline: '2024-02-15',
    school_id: 'school-3'
  },
  {
    id: '9',
    title: 'Texnologiya istifadəsi',
    category: 'Texnologiya',
    status: 'pending',
    progress: 80,
    deadline: '2024-02-20',
    school_id: 'school-3'
  },
  {
    id: '10',
    title: 'Beynəlxalq əlaqələr',
    category: 'Beynəlxalq',
    status: 'draft',
    progress: 40,
    deadline: '2024-02-25',
    school_id: 'school-3'
  }
];
