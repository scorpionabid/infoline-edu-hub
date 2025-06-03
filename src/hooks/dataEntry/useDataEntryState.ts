
import { useState, useEffect } from 'react';
import { useCategoryData } from './useCategoryData';
import { useSectorCategories } from './useSectorCategories';
import { useSchoolSelector } from './useSchoolSelector';

interface UseDataEntryStateProps {
  user: any;
  isSectorAdmin: boolean;
  categoryIdFromUrl: string | null;
  schoolIdFromUrl: string | null;
  categoryId?: string;
  schoolId?: string;
}

export const useDataEntryState = ({
  user,
  isSectorAdmin,
  categoryIdFromUrl,
  schoolIdFromUrl,
  categoryId,
  schoolId
}: UseDataEntryStateProps) => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState('school');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(schoolIdFromUrl);
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>('');

  // Mock data entries state
  const [dataEntries, setDataEntries] = useState<any[]>([]);
  const [entriesMap, setEntriesMap] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  // Load categories based on current school
  const { categories, isLoading: categoriesLoading } = 
    useCategoryData({ schoolId: schoolId || user?.school_id });
  
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

  // Mock data entry functions
  const saveDataEntries = async (entries: any[]) => {
    console.log('Saving data entries:', entries);
    // Mock save operation
    setDataEntries(entries);
  };

  const fetchDataEntries = async () => {
    console.log('Fetching data entries...');
    // Mock fetch operation
    setDataEntries([]);
    setEntriesMap({});
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
    categoryStats,
    dataEntries,
    entriesMap,
    isLoading: loading,
    error,
    saveDataEntries,
    fetchDataEntries
  };
};
