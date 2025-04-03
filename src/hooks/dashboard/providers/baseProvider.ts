
import { DashboardData } from '@/types/dashboard';
import { FormItem, FormStatus } from '@/types/form';
import { getMockNotifications } from '../mockDashboardData';

export const getBaseDashboardData = (): DashboardData => {
  const notifications = getMockNotifications();
  
  return {
    regions: 12,
    sectors: 45,
    schools: 450,
    users: 1200,
    completionRate: 68,
    pendingApprovals: 15,
    notifications,
    activityData: getActivityData(),
    pendingSchools: 12,
    approvedSchools: 428,
    rejectedSchools: 10,
    statusData: {
      completed: 428,
      pending: 12,
      rejected: 10,
      notStarted: 0
    },
    chartData: {
      labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May'],
      datasets: [
        {
          label: 'Məlumat toplamış məktəblər',
          data: [250, 300, 350, 400, 450],
          backgroundColor: ['rgba(59, 130, 246, 0.5)'],
          borderColor: ['rgb(59, 130, 246)'],
          borderWidth: 1,
        },
      ],
    },
    categoryCompletionData: [
      { name: 'Şagird məlumatları', completed: 432, total: 450, percentage: 96 },
      { name: 'Müəllim məlumatları', completed: 405, total: 450, percentage: 90 },
      { name: 'İnfrastruktur', completed: 380, total: 450, percentage: 84 },
      { name: 'Maliyyə', completed: 290, total: 450, percentage: 64 }
    ],
    pendingForms: [
      { 
        id: '1', 
        title: 'Şagird sayı', 
        status: 'pending' as FormStatus, 
        completionPercentage: 65, 
        category: 'Şagird məlumatları', 
        date: '2023-05-20' 
      },
      { 
        id: '2', 
        title: 'Müəllim sayı', 
        status: 'dueSoon' as FormStatus, 
        completionPercentage: 40, 
        category: 'Müəllim məlumatları', 
        date: '2023-05-15' 
      }
    ]
  };
};

// Activity data generator
const getActivityData = () => [
  {
    id: '1',
    action: 'Yeni məktəb əlavə edildi',
    actor: 'Admin İstifadəçi',
    target: '42 saylı məktəb',
    time: '15 dəq əvvəl'
  },
  {
    id: '2',
    action: 'Məlumat təsdiqləndi',
    actor: 'Sektor Admin',
    target: 'Şagird məlumatları',
    time: '1 saat əvvəl'
  },
  {
    id: '3',
    action: 'Yeni kateqoriya yaradıldı',
    actor: 'Super Admin',
    target: 'Olimpiyada nəticələri',
    time: '3 saat əvvəl'
  }
];

// Məlumat formalarının statuslarına görə sayını əldə etmək üçün funksiya
export const getFormStatusCounts = (formItems: FormItem[]) => {
  const counts = {
    pending: 0,
    approved: 0,
    rejected: 0,
    dueSoon: 0,
    overdue: 0
  };

  formItems.forEach(form => {
    if (form.status === 'pending') {
      counts.pending++;
    } else if (form.status === 'approved') {
      counts.approved++;
    } else if (form.status === 'rejected') {
      counts.rejected++;
    } else if (form.status === 'dueSoon') {
      counts.dueSoon++;
    } else if (form.status === 'overdue') {
      counts.overdue++;
    }
  });

  return counts;
};
