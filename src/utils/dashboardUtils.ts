
import { Category } from '@/types/category';
import { Notification } from '@/types/notification';
import { School } from '@/types/school';
import { FormStatus } from '@/types/form';

// Mock category məlumatı yaradır
export const getMockCategoryCompletion = (): Array<{
  name: string;
  completed: number;
}> => {
  return [
    { name: 'Ümumi məlumat', completed: 78 },
    { name: 'Müəllim heyəti', completed: 65 },
    { name: 'Texniki baza', completed: 82 },
    { name: 'Maliyyə', completed: 59 },
    { name: 'Tədris planı', completed: 91 },
  ];
};

// Mock region məlumatı yaradır
export const getMockRegionSchoolsData = (): Array<{
  name: string;
  value: number;
}> => {
  return [
    { name: 'Bakı', value: 120 },
    { name: 'Sumqayıt', value: 75 },
    { name: 'Gəncə', value: 65 },
    { name: 'Lənkəran', value: 45 },
    { name: 'Şəki', value: 30 },
  ];
};

// Mock aktivlik məlumatı yaradır
export const getMockActivityData = (): Array<{
  name: string;
  value: number;
}> => {
  return [
    { name: 'Təsdiqlənmiş', value: 65 },
    { name: 'Gözləmədə', value: 25 },
    { name: 'Rədd edilmiş', value: 10 }
  ];
};

// Mock bildirişlər yaradır
export const getMockNotifications = (count: number = 5): Notification[] => {
  const notificationTypes: Array<Notification['type']> = [
    'newCategory', 'deadline', 'approvalRequest', 'approved', 'rejected', 'systemUpdate', 'reminder'
  ];
  
  const notifications: Notification[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const now = new Date();
    const creationDate = new Date(now.getTime() - (Math.random() * 3 * 24 * 60 * 60 * 1000)); // Son 3 gün
    
    notifications.push({
      id: `notification-${i + 1}`,
      type,
      title: getNotificationTitle(type),
      message: getNotificationMessage(type),
      userId: "1",
      isRead: Math.random() > 0.7, // 30% oxunmamış
      createdAt: creationDate.toISOString(),
      priority: Math.random() > 0.8 ? 'critical' : Math.random() > 0.5 ? 'high' : 'normal',
      relatedEntityId: Math.random() > 0.5 ? `entity-${i + 1}` : undefined,
      relatedEntityType: Math.random() > 0.5 ? 'category' : undefined
    });
  }
  
  return notifications;
};

// Bildiriş başlığı
function getNotificationTitle(type: Notification['type']): string {
  switch (type) {
    case 'newCategory':
      return 'Yeni kateqoriya yaradıldı';
    case 'deadline':
      return 'Son tarix yaxınlaşır';
    case 'approvalRequest':
      return 'Təsdiq tələbi';
    case 'approved':
      return 'Məlumatlar təsdiqləndi';
    case 'rejected':
      return 'Məlumatlar rədd edildi';
    case 'systemUpdate':
      return 'Sistem yeniləməsi';
    case 'reminder':
      return 'Xatırlatma';
    default:
      return 'Bildiriş';
  }
}

// Bildiriş mesajı
function getNotificationMessage(type: Notification['type']): string {
  switch (type) {
    case 'newCategory':
      return 'Tədris məlumatları kateqoriyası yaradıldı və istifadəyə hazırdır.';
    case 'deadline':
      return 'Maliyyə məlumatlarının doldurulması üçün son tarixə 3 gün qalır.';
    case 'approvalRequest':
      return 'Məktəb #12 tərəfindən göndərilən məlumatların təsdiqlənməsi tələb olunur.';
    case 'approved':
      return 'Göndərilən məlumatlar təsdiqləndi.';
    case 'rejected':
      return 'Göndərilən məlumatlar rədd edildi. Səbəb: Natamam məlumat.';
    case 'systemUpdate':
      return 'Sistem yeniləndi. Yeni xüsusiyyətlər əlavə edildi.';
    case 'reminder':
      return 'Müəllim heyəti məlumatlarını doldurmağı unutmayın.';
    default:
      return 'Sistemdə yeni bildiriş var.';
  }
}

// Mock form məlumatları yaradır
export const getMockForms = (count: number = 5): {
  id: string;
  title: string;
  category: string;
  status: FormStatus;
  completionPercentage: number;
  deadline?: string;
}[] => {
  const formStatuses: FormStatus[] = ['pending', 'approved', 'rejected', 'due', 'overdue', 'draft', 'empty', 'dueSoon'];
  const categoryNames = ['Tədris planı', 'Müəllim heyəti', 'Şagird məlumatları', 'Maliyyə', 'İnfrastruktur'];
  
  const forms = [];
  
  for (let i = 0; i < count; i++) {
    const status = formStatuses[Math.floor(Math.random() * formStatuses.length)];
    const now = new Date();
    const futureDate = new Date(now.getTime() + (Math.random() * 30 * 24 * 60 * 60 * 1000));
    
    forms.push({
      id: `form-${i + 1}`,
      title: `${categoryNames[i % categoryNames.length]} formu`,
      category: categoryNames[i % categoryNames.length],
      status,
      completionPercentage: status === 'approved' ? 100 : Math.floor(Math.random() * 100),
      deadline: Math.random() > 0.3 ? futureDate.toISOString() : undefined
    });
  }
  
  return forms;
};

// Mock məktəbləri yaradır
export const getMockSchools = (count: number = 10): School[] => {
  const regions = ['Bakı', 'Abşeron', 'Sumqayıt', 'Gəncə', 'Lənkəran'];
  const sectors = ['Nəsimi', 'Nizami', 'Yasamal', 'Xətai', 'Sabunçu'];
  const statuses: School['status'][] = ['active', 'inactive'];
  const schools: School[] = [];
  
  for (let i = 0; i < count; i++) {
    const regionIndex = i % regions.length;
    const sectorIndex = i % sectors.length;
    
    schools.push({
      id: `school-${i + 1}`,
      name: `${i % 2 === 0 ? 'Şəhər' : 'Kənd'} Məktəbi #${i + 1}`,
      address: `${regions[regionIndex]} şəhəri, ${sectors[sectorIndex]} rayonu, Küçə ${i + 1}`,
      phone: `+994512345${i.toString().padStart(3, '0')}`,
      email: `mekteb${i + 1}@edu.az`,
      directorName: `Direktor ${i + 1}`,
      principalName: `Direktor ${i + 1}`,
      studentCount: 100 + Math.floor(Math.random() * 900),
      teacherCount: 10 + Math.floor(Math.random() * 90),
      type: i % 5 === 0 ? 'vocational' : i % 4 === 0 ? 'special' : i % 3 === 0 ? 'elementary' : i % 2 === 0 ? 'middle' : 'high',
      language: i % 4 === 0 ? 'russian' : i % 5 === 0 ? 'english' : 'azerbaijani',
      regionId: `region-${regionIndex + 1}`,
      sectorId: `sector-${sectorIndex + 1}`,
      status: statuses[i % statuses.length],
      createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
      updatedAt: new Date(Date.now() - (i * 43200000)).toISOString(),
      completionRate: Math.floor(Math.random() * 100),
      adminEmail: `admin${i + 1}@edu.az`,
      region: regions[regionIndex],
      sector: sectors[sectorIndex],
    });
  }
  
  return schools;
};

// Mock kateqoriyaları yaradır
export const getMockCategories = (count: number = 8): Category[] => {
  const statuses: CategoryStatus[] = ['active', 'inactive', 'pending', 'approved', 'rejected', 'dueSoon', 'overdue'];
  const assignments: ('all' | 'sectors')[] = ['all', 'sectors'];
  const categories: Category[] = [];
  
  for (let i = 0; i < count; i++) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (Math.random() * 30 * 24 * 60 * 60 * 1000));
    
    categories.push({
      id: `category-${i + 1}`,
      name: `Kateqoriya ${i + 1}`,
      description: `Bu kateqoriya ${i + 1} haqqında məlumatları əhatə edir`,
      deadline: Math.random() > 0.3 ? futureDate.toISOString() : undefined,
      status: statuses[i % statuses.length],
      priority: i + 1,
      assignment: assignments[i % assignments.length],
      createdAt: new Date(Date.now() - (i * 86400000)).toISOString(),
      updatedAt: new Date(Date.now() - (i * 43200000)).toISOString(),
      columnCount: Math.floor(Math.random() * 10) + 1,
      archived: i === count - 1 // Sonuncu kateqoriya arxivlənmiş
    });
  }
  
  return categories;
};

// Mock regional statistika yaradır
export const getMockRegionalStats = (regions: string[] = ['Bakı', 'Abşeron', 'Sumqayıt', 'Gəncə', 'Lənkəran']): Array<{
  region: string;
  approved: number;
  pending: number;
  rejected: number;
}> => {
  return regions.map(region => ({
    region,
    approved: Math.floor(Math.random() * 50),
    pending: Math.floor(Math.random() * 30),
    rejected: Math.floor(Math.random() * 10)
  }));
};

// Mock sektor statistikası yaradır
export const getMockSectorStats = (sectors: string[] = ['Nəsimi', 'Nizami', 'Yasamal', 'Xətai', 'Sabunçu']): Array<{
  sector: string;
  approved: number;
  pending: number;
  rejected: number;
}> => {
  return sectors.map(sector => ({
    sector,
    approved: Math.floor(Math.random() * 30),
    pending: Math.floor(Math.random() * 20),
    rejected: Math.floor(Math.random() * 5)
  }));
};

// Kateqoriyalara əsasən yaradılan default dəadlineləri
export const getMockDeadlines = (categories: Category[]): Array<{ 
  category: string; 
  date: string; 
}> => {
  return categories
    .filter(category => category.deadline)
    .slice(0, 5)
    .map(category => ({
      category: category.name,
      date: category.deadline!
    }));
};

// Tip uyğunsuzluqlarının qabağını almaq üçün köməkçi adapter funksiya
export type CategoryStatus = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'dueSoon' | 'overdue';
