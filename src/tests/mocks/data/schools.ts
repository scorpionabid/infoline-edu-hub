
import { School } from '@/types/school';

export const mockSchools: School[] = [
  {
    id: 'school1',
    name: 'Bakı şəhəri 1 nömrəli məktəb',
    principalName: 'Əhməd Əhmədov',
    address: 'Bakı şəhəri, Nəsimi rayonu',
    regionId: 'region1',
    sectorId: 'sector1',
    phone: '+994501234567',
    email: 'mekteb1@edu.az',
    studentCount: 520,
    teacherCount: 45,
    status: 'active',
    type: 'tam orta',
    language: 'Azərbaycan dili',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionRate: 75,
    region: 'Bakı',
    sector: 'Nəsimi',
    logo: ''
  },
  {
    id: 'school2',
    name: 'Bakı şəhəri 2 nömrəli məktəb',
    principalName: 'Leyla Məmmədova',
    address: 'Bakı şəhəri, Yasamal rayonu',
    regionId: 'region1',
    sectorId: 'sector2',
    phone: '+994501234568',
    email: 'mekteb2@edu.az',
    studentCount: 740,
    teacherCount: 62,
    status: 'active',
    type: 'tam orta',
    language: 'Azərbaycan dili',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    completionRate: 85,
    region: 'Bakı',
    sector: 'Yasamal',
    logo: ''
  }
];
