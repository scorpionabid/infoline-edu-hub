import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';

interface UseSchoolSelectorProps {
  isSectorAdmin: boolean;
  sectorId?: string | null;
}

interface School {
  id: string;
  name: string;
  [key: string]: any;
}

export const useSchoolSelector = ({ isSectorAdmin, sectorId }: UseSchoolSelectorProps) => {
  const { t } = useLanguage();
  const [schools, setSchools] = useState<School[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedSchoolName, setSelectedSchoolName] = useState<string>('');
  const [schoolSearchQuery, setSchoolSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Sektoradmin üçün məktəbləri yükləyirik
  useEffect(() => {
    const fetchSchools = async () => {
      if (isSectorAdmin && sectorId) {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('schools')
            .select('id, name')
            .eq('sector_id', sectorId)
            .eq('status', 'active')
            .order('name');
            
          if (error) throw error;
          
          const safeData = Array.isArray(data) ? data : [];
          setSchools(safeData);
          setFilteredSchools(safeData);
          
          // İlk məktəbi seçirik
          if (safeData.length > 0 && !selectedSchoolId) {
            setSelectedSchoolId(safeData[0].id);
            setSelectedSchoolName(safeData[0].name);
          }
        } catch (error) {
          console.error('Məktəbləri yükləyərkən xəta:', error);
          toast.error(t('errorLoadingSchools'));
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchSchools();
  }, [isSectorAdmin, sectorId, t, selectedSchoolId]);
  
  // Məktəb axtarışı
  useEffect(() => {
    if (schoolSearchQuery.trim() === '') {
      setFilteredSchools(schools);
    } else {
      const filtered = schools.filter(school => 
        school && school.name && school.name.toLowerCase().includes(schoolSearchQuery.toLowerCase())
      );
      setFilteredSchools(filtered);
    }
  }, [schoolSearchQuery, schools]);
  
  // Məktəb seçimi
  const handleSchoolChange = (schoolId: string) => {
    const school = schools.find(s => s && s.id === schoolId);
    if (school) {
      setSelectedSchoolId(schoolId);
      setSelectedSchoolName(school.name || '');
    }
  };
  
  return {
    schools,
    filteredSchools,
    selectedSchoolId,
    selectedSchoolName,
    schoolSearchQuery,
    isLoading,
    setSchoolSearchQuery,
    handleSchoolChange,
    setSelectedSchoolId,
    // setSelectedSchoolName
  };
};
