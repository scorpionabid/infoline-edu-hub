
import { useState, useCallback } from 'react';
import { School, mockSchools } from '@/data/schoolsData';
import { useSchoolFilters } from './useSchoolFilters';
import { useSchoolCrudOperations } from './useSchoolCrudOperations';

// Mock data
const mockRegions = [
  { id: "reg-01", name: "Bakı", description: "Bakı şəhəri", status: "active", created_at: "", updated_at: "" },
  { id: "reg-02", name: "Sumqayıt", description: "Sumqayıt şəhəri", status: "active", created_at: "", updated_at: "" },
  { id: "reg-03", name: "Gəncə", description: "Gəncə şəhəri", status: "active", created_at: "", updated_at: "" },
];

const mockSectors = [
  { id: "sec-01", name: "Nəsimi", regionId: "reg-01", description: "Nəsimi rayonu", status: "active", created_at: "", updated_at: "" },
  { id: "sec-02", name: "Suraxanı", regionId: "reg-01", description: "Suraxanı rayonu", status: "active", created_at: "", updated_at: "" },
  { id: "sec-03", name: "Mərkəz", regionId: "reg-03", description: "Mərkəz rayonu", status: "active", created_at: "", updated_at: "" },
];

export const useSchoolsData = () => {
  const [schools, setSchools] = useState<School[]>(mockSchools);
  const [version, setVersion] = useState(0); // Məlumatların yenilənməsini izləmək üçün

  // Məlumatları yeniləmək üçün metod
  const refreshData = useCallback(() => {
    setVersion(prev => prev + 1);
  }, []);

  // Filter və pagiantion məntiqini ayrı bir hook'a çıxarırıq
  const filterHook = useSchoolFilters({
    schools,
    mockSectors,
    mockRegions,
    version
  });

  // CRUD əməliyyatları üçün ayrı bir hook istifadə edirik
  const crudHook = useSchoolCrudOperations({
    schools,
    setSchools,
    refreshData
  });

  return {
    ...filterHook,
    ...crudHook,
    schools,
    refreshData
  };
};
