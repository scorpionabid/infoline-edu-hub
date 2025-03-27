
import { School } from '@/types/school';
import { Notification, NotificationType } from '@/types/notification';
import { FormItem, ChartData } from '@/types/dashboard';
import { FormStatus } from '@/types/form';

export const getMockSchools = (): School[] => [
  { id: "1", name: "Şəhər Məktəbi #1", regionId: "1", sectorId: "1", status: "active" },
  { id: "2", name: "Şəhər Məktəbi #2", regionId: "1", sectorId: "1", status: "active" },
  { id: "3", name: "Kənd Məktəbi #1", regionId: "2", sectorId: "2", status: "active" },
  { id: "4", name: "Kənd Məktəbi #2", regionId: "2", sectorId: "2", status: "inactive" }
];

export const getMockRegions = () => [
  { id: "1", name: "Bakı" },
  { id: "2", name: "Abşeron" },
  { id: "3", name: "Sumqayıt" }
];

export const getMockSectors = () => [
  { id: "1", name: "Nəsimi", region_id: "1" },
  { id: "2", name: "Xırdalan", region_id: "2" },
  { id: "3", name: "28 May", region_id: "3" }
];

export const getMockNotifications = (): Notification[] => [
  {
    id: "1",
    type: "newCategory" as NotificationType,
    title: "Yeni kateqoriya yaradıldı",
    message: "Tədris məlumatları kateqoriyası yaradıldı",
    createdAt: new Date().toISOString(),
    isRead: false,
    userId: "1",
    priority: "normal"
  },
  {
    id: "2",
    type: "deadline" as NotificationType,
    title: "Məlumat tələb olunur",
    message: "Maliyyə məlumatlarını doldurmağınız xahiş olunur",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    userId: "1",
    priority: "high"
  }
];

export const getMockRecentForms = (): FormItem[] => [
  {
    id: "form-1",
    title: "Tədris planı",
    category: "Tədris",
    status: 'pending',
    completionPercentage: 75
  },
  {
    id: "form-2",
    title: "Müəllim məlumatları",
    category: "Kadr",
    status: 'approved',
    completionPercentage: 100
  },
  {
    id: "form-3",
    title: "İnfrastruktur hesabatı",
    category: "İnfrastruktur",
    status: 'rejected',
    completionPercentage: 50
  },
  {
    id: "form-4",
    title: "Maliyyə hesabatı",
    category: "Maliyyə",
    status: 'overdue',
    completionPercentage: 30
  }
];

export const getChartData = (t: (key: string) => string): ChartData => ({
  activityData: [
    { name: t('approved'), value: 65 },
    { name: t('pending'), value: 25 },
    { name: t('rejected'), value: 10 }
  ],
  regionSchoolsData: getMockRegions().map(region => {
    return {
      name: region.name,
      value: getMockSchools().filter(school => school.regionId === region.id).length
    };
  }),
  categoryCompletionData: [
    { name: "Ümumi məlumat", completed: 78 },
    { name: "Müəllim heyəti", completed: 65 },
    { name: "Texniki baza", completed: 82 },
    { name: "Maliyyə", completed: 59 },
    { name: "Tədris planı", completed: 91 }
  ]
});
