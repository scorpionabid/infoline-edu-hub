
// İstifadəçi autentikasiya məlumatları üçün tiplər
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  name?: string; // fullName-in aliası
  full_name?: string; // fullName-in digər bir aliası
  role: string;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  avatar: string | null;
  language: string;
  position: string;
  status: string;
  phone?: string;
  lastLogin?: string;
  last_login?: string;
  twoFactorEnabled?: boolean;
  notificationSettings?: {
    email: boolean;
    system: boolean;
  };
}
