
// İstifadəçi autentikasiya məlumatları üçün tiplər
export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  regionId: string | null;
  sectorId: string | null;
  schoolId: string | null;
  avatar: string | null;
  language: string;
  position: string;
  status: string;
}
