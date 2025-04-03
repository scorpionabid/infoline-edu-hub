
import { Notification, NotificationType } from '@/types/notification';

// Demo bildirisləri
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'newCategory' as NotificationType,
    title: 'Yeni kateqoriya əlavə edildi',
    message: 'Şagird məlumatları kateqoriyası sistem inzibatçısı tərəfindən əlavə edildi.',
    createdAt: new Date().toISOString(),
    time: '15 dəq əvvəl',
    isRead: false,
    userId: 'user-1',
    priority: 'normal',
    read_status: false,
    relatedEntityType: 'category'
  },
  {
    id: '2',
    type: 'deadline' as NotificationType,
    title: 'Son tarix yaxınlaşır',
    message: 'Müəllim məlumatları formasının doldurulması üçün 2 gün qalıb.',
    createdAt: new Date().toISOString(),
    time: '1 saat əvvəl',
    isRead: true,
    userId: 'user-1',
    priority: 'high',
    read_status: true,
    relatedEntityType: 'category'
  }
];

// Demo məlumatlar üçün köməkçi funksiyalar 
export const getMockNotifications = () => mockNotifications;

export const getMockRegions = () => {
  return [
    { id: '1', name: 'Bakı', schoolCount: 120 },
    { id: '2', name: 'Sumqayıt', schoolCount: 45 },
    { id: '3', name: 'Gəncə', schoolCount: 36 }
  ];
};

export const getMockSectors = () => {
  return [
    { id: '1', name: 'Binəqədi', schoolCount: 28, regionId: '1' },
    { id: '2', name: 'Yasamal', schoolCount: 24, regionId: '1' },
    { id: '3', name: 'Xətai', schoolCount: 22, regionId: '1' }
  ];
};

export const getMockSchools = () => {
  return [
    { id: '1', name: '20 saylı məktəb', sectorId: '1' },
    { id: '2', name: '158 saylı məktəb', sectorId: '2' },
    { id: '3', name: '245 saylı məktəb', sectorId: '3' }
  ];
};
