
import { useCallback } from 'react';
import { School } from '@/data/schoolsData';
import { toast } from 'sonner';

interface UseSchoolCrudOperationsProps {
  schools: School[];
  setSchools: React.Dispatch<React.SetStateAction<School[]>>;
  refreshData: () => void;
}

export const useSchoolCrudOperations = ({
  schools,
  setSchools,
  refreshData
}: UseSchoolCrudOperationsProps) => {
  // CRUD operations
  const handleAddSchool = useCallback((newSchool: School) => {
    setSchools(prevSchools => [...prevSchools, newSchool]);
    toast.success("Məktəb uğurla əlavə edildi");
    refreshData();
  }, [setSchools, refreshData]);

  const handleUpdateSchool = useCallback((updatedSchool: School) => {
    setSchools(prevSchools => 
      prevSchools.map(school => 
        school.id === updatedSchool.id ? updatedSchool : school
      )
    );
    toast.success("Məktəb uğurla yeniləndi");
    refreshData();
  }, [setSchools, refreshData]);

  const handleDeleteSchool = useCallback((schoolId: string) => {
    setSchools(prevSchools => prevSchools.filter(school => school.id !== schoolId));
    toast.success("Məktəb uğurla silindi");
    refreshData();
  }, [setSchools, refreshData]);

  return {
    handleAddSchool,
    handleUpdateSchool,
    handleDeleteSchool
  };
};
