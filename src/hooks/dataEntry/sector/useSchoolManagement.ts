
import { useState, useCallback } from 'react';

export interface UseSchoolManagementResult {
  selectedSchoolId: string | null;
  isLoading: boolean;
  error: string | null;
  selectSchool: (schoolId: string) => void;
  clearSelection: () => void;
}

export const useSchoolManagement = (): UseSchoolManagementResult => {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectSchool = useCallback((schoolId: string) => {
    setSelectedSchoolId(schoolId);
    setError(null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSchoolId(null);
    setError(null);
  }, []);

  return {
    selectedSchoolId,
    isLoading,
    error,
    selectSchool,
    clearSelection
  };
};

export default useSchoolManagement;
