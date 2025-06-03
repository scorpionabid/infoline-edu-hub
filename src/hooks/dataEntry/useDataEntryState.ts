
import { useState, useEffect } from 'react';
import { useCategoryData } from './useCategoryData';
import { useSectorCategories } from './useSectorCategories';
import { useSchoolSelector } from './useSchoolSelector';

interface UseDataEntryStateProps {
  user: any;
  isSectorAdmin: boolean;
  categoryIdFromUrl: string | null;
  schoolIdFromUrl: string | null;
}

export const useDataEntryState = ({
  user,
  isSectorAdmin,
  categoryIdFromUrl,
  schoolIdFromUrl
}: UseDataEntryStateProps) => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('school');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(schoolIdFromUrl);
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>('');

  // Load categories based on current school
  const { categories, isLoading: categoriesLoading } = 
    useCategoryData({ schoolId: user?.school_id });
  
  // Load sector categories if user is sector admin
  const { 
    sectorCategories, 
    isLoading: sectorCategoriesLoading 
  } = useSectorCategories({ isSectorAdmin });
  
  // Setup school selector for sector admin
  const {
    schools,
    isLoading: schoolsLoading
  } = useSchoolSelector({ 
    isSectorAdmin, 
    sectorId: user?.sector_id || null 
  });
  
  // Determine which categories to display
  const displayCategories = isSectorAdmin && tabValue === 'sector'
    ? sectorCategories
    : categories;

  // Mock progress calculation
  const overallProgress = 65;
  const categoryStats = {
    completed: Math.floor((displayCategories?.length || 0) * 0.6),
    total: displayCategories?.length || 0
  };

  // Set loading state based on data fetching
  useEffect(() => {
    setLoading(
      categoriesLoading || 
      (isSectorAdmin && (sectorCategoriesLoading || schoolsLoading))
    );
  }, [categoriesLoading, sectorCategoriesLoading, schoolsLoading, isSectorAdmin]);

  // Auto-select school from URL if available
  useEffect(() => {
    if (schoolIdFromUrl && isSectorAdmin) {
      setSelectedSchoolId(schoolIdFromUrl);
      
      // Find and set school name
      const school = schools.find(s => s.id === schoolIdFromUrl);
      if (school) {
        setSelectedSchoolName(school.name);
      }
    }
  }, [schools, schoolIdFromUrl, isSectorAdmin]);

  return {
    loading,
    tabValue,
    setTabValue,
    selectedSchoolId,
    setSelectedSchoolId,
    selectedSchoolName,
    setSelectedSchoolName,
    displayCategories,
    overallProgress,
    categoryStats
  };
};
