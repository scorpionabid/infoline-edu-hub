import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth';
import { Column, ColumnType } from '@/types/column';
import { parseJsonSafe } from '@/utils/json-utils';
import { CategoryAssignment } from '@/types/category';

interface CategoryData {
  id: string;
  name: string;
  columns: Column[];
  description?: string;
  status?: string;
  assignment?: CategoryAssignment;
  priority?: number;
  deadline?: string;
  completionRate?: number;
}

export interface UseCategoryDataProps {
  categoryId?: string;
  schoolId?: string; // School ID parameter
}

export const useCategoryData = ({ categoryId, schoolId }: UseCategoryDataProps = {}) => {
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false); // alias for backward compatibility
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // UUID validation helper
  const isValidUUID = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  };

  // Supabase-dən gələn JSON-formatı düzəltmək üçün köməkçi funksiya
  const fixSupabaseJsonFormat = (jsonData: any): any => {
    // Əgər məlumat yoxdursa, boş massiv qaytar
    if (!jsonData) return [];
    
    try {
      // Artıq array və ya obyektdirsə
      if (typeof jsonData !== 'string') return jsonData;
      
      // Boş stringdirsə
      if (jsonData.trim() === '') return [];
      
      // Escape edilmiş slash-ları düzəlt
      if (jsonData.includes('\\"')) {
        const cleaned = jsonData.replace(/\\\"([^\\\"]*)\\\"/g, '"$1"');
        return JSON.parse(cleaned);
      }
      
      // Sadəcə parse et
      return JSON.parse(jsonData);
    } catch (err) {
      console.error('Error fixing Supabase JSON format:', err);
      console.error('Original data:', jsonData);
      return [];
    }
  };
  
  // Fetch all categories for a school
  const fetchSchoolCategories = async (schoolId: string) => {
    if (!schoolId) {
      console.log('No schoolId provided to fetchSchoolCategories');
      setCategories([]);
      setIsLoading(false);
      setLoading(false);
      return;
    }

    if (!isValidUUID(schoolId)) {
      console.error('Invalid schoolId format:', schoolId);
      setError('Invalid school ID format');
      setCategories([]);
      setIsLoading(false);
      setLoading(false);
      return;
    }

    setIsLoading(true);
    setLoading(true);
    setError(null);
    
    try {
      // Fetch categories that are applicable to schools
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, description')
        .eq('status', 'active')
        .in('assignment', ['schools', 'all']);
      
      if (categoriesError) {
        throw new Error(`Error fetching school categories: ${categoriesError.message}`);
      }
      
      if (!categoriesData || categoriesData.length === 0) {
        setCategories([]);
        setIsLoading(false);
        setLoading(false);
        return;
      }
      
      // Safety check for valid category data with UUID validation
      const validCategoryIds = categoriesData
        .filter(cat => cat && cat.id && isValidUUID(cat.id))
        .map(cat => cat.id);
        
      if (validCategoryIds.length === 0) {
        setCategories([]);
        setIsLoading(false);
        setLoading(false);
        return;
      }
      
      // Fetch columns for all categories
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .in('category_id', validCategoryIds)
        .order('order_index');
      
      if (columnsError) {
        throw new Error(`Error fetching columns data: ${columnsError.message}`);
      }
      
      // Process categories with their columns
      const categoriesWithColumns: CategoryData[] = categoriesData
        .filter(category => category && category.id && isValidUUID(category.id)) // Filter out invalid categories
        .map(category => {
          const categoryColumns = columnsData
            ? columnsData.filter(col => col && col.category_id === category.id && isValidUUID(col.id || ''))
            : [];
          
          // Process column data
          const processedColumns: Column[] = categoryColumns
            .filter(column => column && column.id) // Filter out invalid columns
            .map((column: any) => {
              // Supabase-dən gələn options-ları düzəltmə prosesi
              console.log(`Processing options for column ${column.name} (${column.id})`);
              
              // Xüsusi SupabaseJSON düzəldicisini istifadə edirik
              let options = [];
              
              // Bazadan gələn məlumatların tipini kontrol edirik
              if (column.type === 'select' || column.type === 'multiselect') {
                try {
                  // Row/xəta məlumatları göstər
                  console.log(`Raw options for column ${column.name}:`, {
                    type: typeof column.options,
                    isArray: Array.isArray(column.options),
                    rawValue: column.options
                  });
                  
                  // fixSupabaseJsonFormat funksiyamızı istifadə edirik
                  const processedOptions = fixSupabaseJsonFormat(column.options);
                  console.log(`Processed options for ${column.name}:`, processedOptions);
                  
                  // Əgər nəticə müvəffəqiyyətlidirsə və massivdirsə
                  if (processedOptions && Array.isArray(processedOptions)) {
                    options = processedOptions;
                  }
                  
                  // Əgər hələ də məlumat yoxdursa, həmin sütun üçün birbaşa bazadan çəkməyə çalış
                  if (!options.length) {
                    console.warn(`No options parsed, trying direct DB fetch for column ${column.id}`);
                    
                    // Birbaşa bazadan məlumatları yüklə
                    const getOptionsFromDB = async () => {
                      try {
                        const { data, error } = await supabase
                          .from('columns')
                          .select('options')
                          .eq('id', column.id)
                          .single();
                        
                        if (error) throw error;
                        
                        if (data && data.options) {
                          console.log(`DB options for column ${column.name}:`, data.options);
                          const dbOptions = fixSupabaseJsonFormat(data.options);
                          
                          if (dbOptions && Array.isArray(dbOptions) && dbOptions.length > 0) {
                            // Nəticələri global obyektə təyin edirik
                            column.options = dbOptions;
                            options = dbOptions;
                            console.log(`Successfully loaded options from DB for ${column.name}:`, options);
                          }
                        }
                      } catch (dbErr) {
                        console.error(`Error fetching options for column ${column.id}:`, dbErr);
                      }
                    };
                    
                    // Async funksiyanı çağır
                    getOptionsFromDB();
                  }
                } catch (parseError) {
                  console.error(`Error processing options for ${column.name}:`, parseError);
                }
              }
              
              // Əgər hələ də heç bir variant yoxdursa, test/demo variant əlavə et
              if ((column.type === 'select' || column.type === 'multiselect') && 
                  (!options || !Array.isArray(options) || options.length === 0)) {
                  
                // Sütun adına görə xüsusi variantlar əlavə et
                if (column.name.toLowerCase().includes('bilər')) {
                  options = [
                    { value: 'ola_bilar', label: 'Ola bilər' },
                    { value: 'ola_bilmez', label: 'Ola bilməz' }
                  ];
                } else if (column.name.toLowerCase().includes('vəziyyət')) {
                  options = [
                    { value: 'yaxsi', label: 'Yaxşı' },
                    { value: 'orta', label: 'Orta' },
                    { value: 'pis', label: 'Pis' }
                  ];
                } else {
                  options = [
                    { value: 'option1', label: 'Variant 1' },
                    { value: 'option2', label: 'Variant 2' },
                    { value: 'option3', label: 'Variant 3' }
                  ];
                }
                
                console.log(`Created default options for ${column.name}:`, options);
              }
              
              // Validation parse etmə prosesi
              const validation = parseJsonSafe(
                typeof column.validation === 'string' ? column.validation : JSON.stringify(column.validation || {}), 
                {}
              );

              // Return the processed column with correct type
              return {
                id: column.id,
                category_id: column.category_id,
                name: column.name || '',
                type: column.type as ColumnType,
                is_required: Boolean(column.is_required),
                placeholder: column.placeholder || '',
                help_text: column.help_text || '',
                default_value: column.default_value || '',
                order_index: column.order_index || 0,
                status: column.status || 'active',
                options,
                validation,
                description: column.description || '',
                section: column.section || '',
                color: column.color || '',
                created_at: column.created_at,
                updated_at: column.updated_at
              } as Column;
            });
          
          return {
            id: category.id,
            name: category.name || '',
            description: category.description || '',
            columns: processedColumns,
          };
        });
      
      setCategories(categoriesWithColumns);
    } catch (err: any) {
      console.error('Error in fetchSchoolCategories:', err);
      setError(err.message || 'Failed to fetch categories data');
      toast.error('Failed to fetch categories data');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const fetchCategoryData = async () => {
    if (!categoryId) {
      setCategory(null);
      setIsLoading(false);
      setLoading(false);
      return;
    }

    if (!isValidUUID(categoryId)) {
      console.error('Invalid categoryId format:', categoryId);
      setError('Invalid category ID format');
      setCategory(null);
      setIsLoading(false);
      setLoading(false);
      return;
    }

    setIsLoading(true);
    setLoading(true);
    setError(null);

    try {
      // Fetch category details
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, description')
        .eq('id', categoryId)
        .single();

      if (categoryError) {
        throw new Error(`Error fetching category data: ${categoryError.message}`);
      }

      if (!categoryData || !categoryData.id) {
        setCategory(null);
        throw new Error(`Category not found with ID: ${categoryId}`);
      }

      // Fetch columns for this category
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index');

      if (columnsError) {
        throw new Error(`Error fetching column data: ${columnsError.message}`);
      }

      // Process column data safely
      const processedColumns: Column[] = Array.isArray(columnsData) ? columnsData
        .filter(column => column && column.id) // Filter out invalid columns
        .map((column: any) => {
          // Parse options and validation if needed
          const options = parseJsonSafe(
            typeof column.options === 'string' ? column.options : JSON.stringify(column.options || []), 
            []
          );

          const validation = parseJsonSafe(
            typeof column.validation === 'string' ? column.validation : JSON.stringify(column.validation || {}), 
            {}
          );

          // Return the processed column with correct type
          return {
            id: column.id,
            category_id: column.category_id,
            name: column.name || '',
            type: column.type as ColumnType,
            is_required: Boolean(column.is_required),
            placeholder: column.placeholder || '',
            help_text: column.help_text || '',
            default_value: column.default_value || '',
            order_index: column.order_index || 0,
            status: column.status || 'active',
            options,
            validation,
            description: column.description || '',
            section: column.section || '',
            color: column.color || '',
            created_at: column.created_at,
            updated_at: column.updated_at
          } as Column;
        }) : [];

      // Create the category object with columns
      const category: CategoryData = {
        id: categoryData.id,
        name: categoryData.name || '',
        description: categoryData.description || '',
        columns: processedColumns,
      };

      setCategory(category);
    } catch (err: any) {
      console.error('Error in useCategoryData:', err);
      setError(err.message || 'Failed to fetch category data');
      toast.error('Failed to fetch category data');
      setCategory(null);
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  // Fetch data based on provided parameters
  useEffect(() => {
    if (categoryId) {
      fetchCategoryData();
    } else if (schoolId) {
      fetchSchoolCategories(schoolId);
    }
  }, [categoryId, schoolId]);

  // Add a refetch function
  const refetch = () => {
    if (categoryId) {
      fetchCategoryData();
    } else if (schoolId) {
      fetchSchoolCategories(schoolId);
    }
  };

  return {
    category,
    categories,
    isLoading,
    loading,
    error,
    refetch
  };
};

export default useCategoryData;
