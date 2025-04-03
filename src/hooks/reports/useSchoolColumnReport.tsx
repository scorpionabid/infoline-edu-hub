import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { CategoryWithColumns } from '@/types/column';

// Modify the function to handle CategoryWithColumns correctly
export const useSchoolColumnReport = (initialCategoryId?: string) => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialCategoryId || '');
  const [schoolColumnData, setSchoolColumnData] = useState<any[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<boolean>(false);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const { user } = useAuth();
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('status', 'active')
          .order('order', { ascending: true });
          
        if (categoryError) throw categoryError;
        
        // For each category fetch its columns
        const categoriesWithColumns: CategoryWithColumns[] = [];
        
        for (const cat of categoryData) {
          const { data: columnsData, error: columnsError } = await supabase
            .from('columns')
            .select('*')
            .eq('category_id', cat.id)
            .order('order_index', { ascending: true });
            
          if (columnsError) throw columnsError;
          
          categoriesWithColumns.push({
            category: {
              id: cat.id,
              name: cat.name,
              description: cat.description,
              order: cat.order || cat.priority || 0,
              priority: cat.priority || 0,
              status: cat.status,
              assignment: cat.assignment
            },
            columns: columnsData.map(col => ({
              id: col.id,
              name: col.name,
              type: col.type,
              categoryId: col.category_id,
              isRequired: col.is_required || false,
              order: col.order || col.order_index || 0,
              options: col.options || [],
              status: col.status || 'active'
            })),
            id: cat.id,
            name: cat.name
          });
        }
        
        setCategories(categoriesWithColumns);
        
        if (categoriesWithColumns.length > 0) {
          const firstCat = categoriesWithColumns[0];
          setSelectedCategoryId(initialCategoryId || firstCat.category?.id || '');
        }
        
        setCategoriesLoading(false);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoriesError(true);
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, [initialCategoryId]);

  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!selectedCategoryId) return;
      setIsDataLoading(true);

      try {
        const { data: schoolData, error: schoolError } = await supabase
          .from('schools')
          .select('id, name, region_id, sector_id, status')
          .eq('status', 'active');

        if (schoolError) throw schoolError;

        const { data: regionData, error: regionError } = await supabase
          .from('regions')
          .select('id, name');

        if (regionError) throw regionError;

        const { data: sectorData, error: sectorError } = await supabase
          .from('sectors')
          .select('id, name');

        if (sectorError) throw sectorError;

        const { data: columnData, error: columnError } = await supabase
          .from('columns')
          .select('id, name')
          .eq('category_id', selectedCategoryId);

        if (columnError) throw columnError;

        const { data: dataEntries, error: dataEntriesError } = await supabase
          .from('data_entries')
          .select('school_id, column_id, value, status')
          .eq('category_id', selectedCategoryId);

        if (dataEntriesError) throw dataEntriesError;

        const formattedSchoolData = schoolData.map(school => {
          const region = regionData.find(r => r.id === school.region_id);
          const sector = sectorData.find(s => s.id === school.sector_id);

          const schoolEntries = dataEntries.filter(de => de.school_id === school.id);

          const columnDataArray = columnData.map(column => {
            const entry = schoolEntries.find(se => se.column_id === column.id);
            return {
              columnId: column.id,
              value: entry ? entry.value : null,
              status: entry ? entry.status : null
            };
          });

          return {
            schoolId: school.id,
            schoolName: school.name,
            region: region ? region.name : 'N/A',
            sector: sector ? sector.name : 'N/A',
            columnData: columnDataArray,
            status: school.status
          };
        });

        setSchoolColumnData(formattedSchoolData);

        const uniqueSectors = [...new Set(schoolData.map(school => {
          const sector = sectorData.find(s => s.id === school.sector_id);
          return sector ? sector.name : undefined;
        }).filter(Boolean))] as string[];
        setSectors(uniqueSectors);

      } catch (error) {
        console.error('Error fetching school data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchSchoolData();
  }, [selectedCategoryId]);

  const exportData = () => {
    // Implement export logic here
  };

  const toggleSchoolSelection = (schoolId: string) => {
    setSelectedSchools(prev => {
      if (prev.includes(schoolId)) {
        return prev.filter(id => id !== schoolId);
      } else {
        return [...prev, schoolId];
      }
    });
  };

  const selectAllSchools = () => {
    const allSchoolIds = schoolColumnData.map(school => school.schoolId);
    setSelectedSchools(allSchoolIds);
  };

  const deselectAllSchools = () => {
    setSelectedSchools([]);
  };

  const getSelectedSchoolsData = () => {
    return schoolColumnData.filter(school => selectedSchools.includes(school.schoolId));
  };
  
  return {
    // Return CategoryWithColumns fixed properties
    categories,
    selectedCategoryId,
    setSelectedCategoryId,
    schoolColumnData,
    sectors,
    isCategoriesLoading: categoriesLoading,
    isCategoriesError: categoriesError,
    isDataLoading,
    exportData,
    toggleSchoolSelection,
    selectAllSchools,
    deselectAllSchools,
    getSelectedSchoolsData
  };
};
