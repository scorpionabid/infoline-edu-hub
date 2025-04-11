
import { School } from '@/types/school';

export const mockSchools: School[] = [
  {
    id: 'school1',
    name: 'Bakı şəhəri 1 nömrəli məktəb',
    principal_name: 'Əhməd Əhmədov',
    address: 'Bakı şəhəri, Nəsimi rayonu',
    region_id: 'region1',
    sector_id: 'sector1',
    phone: '+994501234567',
    email: 'mekteb1@edu.az',
    student_count: 520,
    teacher_count: 45,
    status: 'active',
    type: 'tam orta',
    language: 'Azərbaycan dili',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completion_rate: 75
  },
  {
    id: 'school2',
    name: 'Bakı şəhəri 2 nömrəli məktəb',
    principal_name: 'Leyla Məmmədova',
    address: 'Bakı şəhəri, Yasamal rayonu',
    region_id: 'region1',
    sector_id: 'sector2',
    phone: '+994501234568',
    email: 'mekteb2@edu.az',
    student_count: 740,
    teacher_count: 62,
    status: 'active',
    type: 'tam orta',
    language: 'Azərbaycan dili',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completion_rate: 85
  }
];
