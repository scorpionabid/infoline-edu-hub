
export interface SchoolFormData {
  name: string;
  principalName: string;
  address: string;
  regionId: string;
  sectorId: string;
  phone: string;
  email: string;
  studentCount: string;
  teacherCount: string;
  status: 'active' | 'inactive';
  type: string;
  language: string;
  adminEmail?: string;
  adminFullName?: string;
  adminPassword?: string;
  adminStatus: 'active' | 'inactive' | 'blocked';
}
