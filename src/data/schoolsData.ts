import { School as SupabaseSchool } from "@/types/supabase";

// Supabase School tipindən təyin edilən yeni School tipi
export type School = Omit<SupabaseSchool, 'principalName'> & {
  principalName: string; // required olaraq təyin edilir
};

// Mock məlumatlar
export const mockSchools: School[] = [
  {
    id: "1",
    name: "Bakı 1 saylı orta məktəb",
    principalName: "Əhməd Məmmədov",
    address: "Bakı şəhəri, Nəsimi r-nu, A.Məmmədov küç. 10",
    regionId: "reg-01",
    sectorId: "sec-01",
    phone: "+994 50 123 45 67",
    email: "baki1@edu.gov.az",
    studentCount: 850,
    teacherCount: 65,
    status: "active",
    type: "full_secondary",
    language: "az",
    adminEmail: "admin1@edu.gov.az",
    completionRate: 85,
  },
  {
    id: "2",
    name: "Sumqayıt 2 saylı orta məktəb",
    principalName: "Leyla Əliyeva",
    address: "Sumqayıt şəhəri, 11-ci məhəllə",
    regionId: "reg-02",
    sectorId: "sec-02",
    phone: "+994 55 456 78 90",
    email: "sumqayit2@edu.gov.az",
    studentCount: 720,
    teacherCount: 58,
    status: "active",
    type: "full_secondary",
    language: "az",
    adminEmail: "admin2@edu.gov.az",
    completionRate: 78,
  },
  {
    id: "3",
    name: "Gəncə 3 saylı orta məktəb",
    principalName: "Rəşad Qasımov",
    address: "Gəncə şəhəri, Nizami Gəncəvi pr. 55",
    regionId: "reg-03",
    sectorId: "sec-03",
    phone: "+994 70 987 65 43",
    email: "gence3@edu.gov.az",
    studentCount: 900,
    teacherCount: 70,
    status: "active",
    type: "full_secondary",
    language: "az",
    adminEmail: "admin3@edu.gov.az",
    completionRate: 92,
  }
];

// School obyektləri üçün konvertasiya funksiyası
export const convertSupabaseToSchool = (supabaseSchool: SupabaseSchool): School => {
  return {
    ...supabaseSchool,
    principalName: supabaseSchool.principalName || supabaseSchool.principal_name || '',
  };
};

// SchoolFormData tipini export edək
export type { SchoolFormData } from "@/types/school-form";
