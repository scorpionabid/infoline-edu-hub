import React from 'react';

export interface School {
  id: string;
  name: string;
  principalName: string;
  address: string;
  region: string;
  regionId: string;
  sector: string;
  sectorId: string;
  phone: string;
  email: string;
  studentCount: number;
  teacherCount: number;
  status: 'active' | 'inactive';
  type: 'full_secondary' | 'general_secondary' | 'primary' | 'lyceum' | 'gymnasium';
  language: 'az' | 'ru' | 'en' | 'tr';
  createdAt: string;
  completionRate: number;
  logo: string;
  adminEmail: string;
}

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
  type: 'full_secondary' | 'general_secondary' | 'primary' | 'lyceum' | 'gymnasium';
  language: 'az' | 'ru' | 'en' | 'tr';
  adminEmail?: string;
  adminFullName?: string;
  adminPassword?: string;
  adminStatus?: string;
}

export interface SortConfig {
  key: string | null;
  direction: string | null;
}

// Mock data for schools
export const mockSchools: School[] = [
  {
    id: '1',
    name: '20 nömrəli orta məktəb',
    principalName: 'Əhməd İbrahimov',
    address: 'Bakı ş., Yasamal r., 28 may küç., 7',
    region: 'Bakı',
    regionId: '1',
    sector: 'Yasamal',
    sectorId: '1',
    phone: '+994 12 432 15 78',
    email: 'mekteb20@edu.gov.az',
    studentCount: 856,
    teacherCount: 74,
    status: 'active',
    type: 'full_secondary',
    language: 'az',
    createdAt: '2023-02-10',
    completionRate: 92,
    logo: '',
    adminEmail: 'admin20@infoline.edu.az'
  },
  {
    id: '2',
    name: '6 nömrəli orta məktəb',
    principalName: 'Elmira Hüseynova',
    address: 'Bakı ş., Nəsimi r., Azadlıq pr., 145',
    region: 'Bakı',
    regionId: '1',
    sector: 'Nəsimi',
    sectorId: '3',
    phone: '+994 12 493 26 89',
    email: 'mekteb6@edu.gov.az',
    studentCount: 934,
    teacherCount: 82,
    status: 'active',
    type: 'full_secondary',
    language: 'az',
    createdAt: '2023-02-11',
    completionRate: 87,
    logo: '',
    adminEmail: 'admin6@infoline.edu.az'
  },
  {
    id: '3',
    name: '52 nömrəli orta məktəb',
    principalName: 'Kamran Kərimov',
    address: 'Bakı ş., Nizami r., Qara Qarayev küç., 24',
    region: 'Bakı',
    regionId: '1',
    sector: 'Nizami',
    sectorId: '2',
    phone: '+994 12 371 42 56',
    email: 'mekteb52@edu.gov.az',
    studentCount: 712,
    teacherCount: 65,
    status: 'active',
    type: 'full_secondary',
    language: 'az',
    createdAt: '2023-02-12',
    completionRate: 76,
    logo: '',
    adminEmail: 'admin52@infoline.edu.az'
  },
  {
    id: '4',
    name: '17 nömrəli orta məktəb',
    principalName: 'Fəridə Məmmədova',
    address: 'Bakı ş., Binəqədi r., 7-ci mkr., 32',
    region: 'Bakı',
    regionId: '1',
    sector: 'Binəqədi',
    sectorId: '6',
    phone: '+994 12 562 78 90',
    email: 'mekteb17@edu.gov.az',
    studentCount: 621,
    teacherCount: 56,
    status: 'active',
    type: 'general_secondary',
    language: 'az',
    createdAt: '2023-02-13',
    completionRate: 82,
    logo: '',
    adminEmail: 'admin17@infoline.edu.az'
  },
  {
    id: '5',
    name: '145 nömrəli orta məktəb',
    principalName: 'Namiq Əliyev',
    address: 'Bakı ş., Sabunçu r., 58-ci məhəllə, 4',
    region: 'Bakı',
    regionId: '1',
    sector: 'Sabunçu',
    sectorId: '4',
    phone: '+994 12 452 36 41',
    email: 'mekteb145@edu.gov.az',
    studentCount: 547,
    teacherCount: 49,
    status: 'active',
    type: 'full_secondary',
    language: 'az',
    createdAt: '2023-02-14',
    completionRate: 65,
    logo: '',
    adminEmail: 'admin145@infoline.edu.az'
  },
  {
    id: '6',
    name: '83 nömrəli orta məktəb',
    principalName: 'Səbinə Quliyeva',
    address: 'Bakı ş., Xətai r., General Şıxlinski küç., 13',
    region: 'Bakı',
    regionId: '1',
    sector: 'Xətai',
    sectorId: '8',
    phone: '+994 12 378 45 21',
    email: 'mekteb83@edu.gov.az',
    studentCount: 689,
    teacherCount: 58,
    status: 'active',
    type: 'full_secondary',
    language: 'ru',
    createdAt: '2023-02-15',
    completionRate: 91,
    logo: '',
    adminEmail: 'admin83@infoline.edu.az'
  },
  {
    id: '7',
    name: '31 nömrəli orta məktəb',
    principalName: 'Tahir Həsənov',
    address: 'Bakı ş., Suraxanı r., Hövsan qəs., 5',
    region: 'Bakı',
    regionId: '1',
    sector: 'Suraxanı',
    sectorId: '5',
    phone: '+994 12 457 32 84',
    email: 'mekteb31@edu.gov.az',
    studentCount: 523,
    teacherCount: 44,
    status: 'inactive',
    type: 'general_secondary',
    language: 'az',
    createdAt: '2023-02-16',
    completionRate: 45,
    logo: '',
    adminEmail: 'admin31@infoline.edu.az'
  },
  {
    id: '8',
    name: '123 nömrəli orta məktəb',
    principalName: 'Rəna Həsənova',
    address: 'Bakı ş., Nərimanov r., Atatürk pr., 32',
    region: 'Bakı',
    regionId: '1',
    sector: 'Nərimanov',
    sectorId: '7',
    phone: '+994 12 567 89 34',
    email: 'mekteb123@edu.gov.az',
    studentCount: 765,
    teacherCount: 67,
    status: 'active',
    type: 'full_secondary',
    language: 'az',
    createdAt: '2023-02-17',
    completionRate: 88,
    logo: '',
    adminEmail: 'admin123@infoline.edu.az'
  },
];

// Mock data for sectors
export const mockSectors = [
  { id: '1', name: 'Yasamal', regionId: '1' },
  { id: '2', name: 'Nizami', regionId: '1' },
  { id: '3', name: 'Nəsimi', regionId: '1' },
  { id: '4', name: 'Sabunçu', regionId: '1' },
  { id: '5', name: 'Suraxanı', regionId: '1' },
  { id: '6', name: 'Binəqədi', regionId: '1' },
  { id: '7', name: 'Nərimanov', regionId: '1' },
  { id: '8', name: 'Xətai', regionId: '1' },
];

// Mock data for regions
export const mockRegions = [
  { id: '1', name: 'Bakı' },
  { id: '2', name: 'Gəncə' },
  { id: '3', name: 'Sumqayıt' },
  { id: '4', name: 'Mingəçevir' },
];

// Utility functions
export const getSchoolTypeLabel = (type: string): string => {
  switch (type) {
    case 'full_secondary': return 'Tam orta';
    case 'general_secondary': return 'Ümumi orta';
    case 'primary': return 'İbtidai';
    case 'lyceum': return 'Lisey';
    case 'gymnasium': return 'Gimnaziya';
    default: return 'Digər';
  }
};

export const getLanguageLabel = (language: string): string => {
  switch (language) {
    case 'az': return 'Azərbaycan';
    case 'ru': return 'Rus';
    case 'en': return 'İngilis';
    case 'tr': return 'Türk';
    default: return 'Digər';
  }
};

export const getSchoolInitial = (name: string): string => {
  return name.charAt(0).toUpperCase();
};
