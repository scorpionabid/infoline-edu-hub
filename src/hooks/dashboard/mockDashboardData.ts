
import { ActivityItem, NotificationEntityType } from '@/types/dashboard';
import { NotificationType } from '@/types/notification';

// Nümunə bildirişlər
export const mockNotifications = [
  {
    id: '1',
    type: 'warning' as NotificationType,
    title: 'Son tarix yaxınlaşır',
    message: 'Şagird məlumatları formu son tarixinə 2 gün qalıb',
    createdAt: '2023-05-01T10:30:00Z',
    time: '2 gün əvvəl',
    isRead: false,
    userId: 'user-1',
    priority: 'normal',
    read_status: false,
    relatedEntityId: 'form-1', // relatedEntityId əlavə etdik
    relatedEntityType: 'form' as NotificationEntityType
  },
  {
    id: '2',
    type: 'success' as NotificationType,
    title: 'Təsdiqləndi',
    message: 'Şagird məlumatları təsdiqləndi',
    createdAt: '2023-04-28T14:15:00Z',
    time: '5 gün əvvəl',
    isRead: true,
    userId: 'user-1',
    priority: 'high',
    read_status: true,
    relatedEntityId: 'form-2', // relatedEntityId əlavə etdik
    relatedEntityType: 'form' as NotificationEntityType
  },
  // ... digər bildirişlər
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

export const getMockCategories = () => {
  return [
    { 
      id: '1',
      name: 'Şagird məlumatları',
      description: 'Şagirdlərlə bağlı əsas məlumatlar',
      status: 'active',
      priority: 1,
      assignment: 'all',
      deadline: new Date().toISOString(),
      archived: false,
      columnCount: 10,
      order: 1,
      completionRate: 85
    },
    {
      id: '2',
      name: 'Müəllim məlumatları',
      description: 'Müəllimlərlə bağlı əsas məlumatlar',
      status: 'active',
      priority: 2,
      assignment: 'all',
      deadline: new Date().toISOString(),
      archived: false,
      columnCount: 8,
      order: 2,
      completionRate: 70
    }
  ];
};
