
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { 
  DataEntryForm, 
  EntryValue, 
  CategoryWithColumns, 
  UseDataEntryProps,
  DataEntrySaveStatus,
  UseDataEntryResult
} from '@/types/dataEntry';

export const useDataEntry = ({ schoolId, categoryId, onComplete }: UseDataEntryProps): UseDataEntryResult => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<DataEntryForm>({
    schoolId: schoolId || '',
    categoryId: categoryId || '',
    entries: []
  });
  
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithColumns | undefined>(undefined);
  const [entries, setEntries] = useState<EntryValue[]>([]);
  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);
  const [isDataModified, setIsDataModified] = useState(false);
  
  // Load categories and columns
  useEffect(() => {
    const fetchCategories = async () => {
      if (!schoolId) return;
      
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('status', 'active')
          .is('archived', false)
          .order('priority', { ascending: true });
        
        if (categoriesError) throw categoriesError;
        
        const { data: columnsData, error: columnsError } = await supabase
          .from('columns')
          .select('*')
          .eq('status', 'active')
          .order('order_index', { ascending: true });
        
        if (columnsError) throw columnsError;
        
        // Build categories with columns
        const categoriesWithColumns = categoriesData.map(category => {
          const cols = columnsData.filter(col => col.category_id === category.id);
          return {
            ...category,
            columns: cols.map(col => ({
              ...col,
              options: col.options || null,
              validation: col.validation || null
            }))
          };
        });
        
        setCategories(categoriesWithColumns);
        
        // Set selected category if categoryId is provided
        if (categoryId) {
          const selectedCat = categoriesWithColumns.find(cat => cat.id === categoryId);
          setSelectedCategory(selectedCat);
        }
        
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(t('errorFetchingCategories'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategories();
  }, [schoolId, categoryId, t]);
  
  // Load data for a specific school
  const loadDataForSchool = useCallback(async (schoolId: string) => {
    if (!schoolId) return;
    
    setLoading(true);
    
    try {
      const { data, error: entriesError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId);
      
      if (entriesError) throw entriesError;
      
      // Convert to our entry format
      const formattedEntries = data.map(entry => ({
        id: entry.id,
        categoryId: entry.category_id,
        columnId: entry.column_id,
        value: entry.value,
        status: entry.status
      }));
      
      setEntries(formattedEntries);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        schoolId,
        entries: formattedEntries
      }));
      
    } catch (err: any) {
      console.error('Error loading school data:', err);
      setError(t('errorLoadingSchoolData'));
    } finally {
      setLoading(false);
    }
  }, [t]);
  
  // Handle form update
  const updateFormData = useCallback((newData: Partial<DataEntryForm>) => {
    setFormData(prev => ({ ...prev, ...newData }));
    setIsDataModified(true);
  }, []);
  
  // Handle entries change
  const handleEntriesChange = useCallback((columnId: string, value: string | number | boolean | null) => {
    setEntries(prev => {
      // Check if entry already exists
      const existingEntryIndex = prev.findIndex(entry => 
        entry.columnId === columnId && entry.categoryId === formData.categoryId
      );
      
      const newEntries = [...prev];
      
      if (existingEntryIndex >= 0) {
        // Update existing entry
        newEntries[existingEntryIndex] = {
          ...newEntries[existingEntryIndex],
          value
        };
      } else {
        // Add new entry
        newEntries.push({
          categoryId: formData.categoryId,
          columnId,
          value
        });
      }
      
      return newEntries;
    });
    
    setIsDataModified(true);
  }, [formData.categoryId]);
  
  // Save form data
  const handleSave = useCallback(async () => {
    if (!schoolId || !formData.categoryId) {
      toast({
        title: t('error'),
        description: t('missingRequiredFields'),
        variant: 'destructive'
      });
      return;
    }
    
    setSaveStatus(DataEntrySaveStatus.SAVING);
    
    try {
      // Get entries for current category
      const categoryEntries = entries.filter(entry => entry.categoryId === formData.categoryId);
      
      // Prepare the entries for Supabase format
      const supabaseEntries = categoryEntries.map(entry => ({
        school_id: schoolId,
        category_id: entry.categoryId,
        column_id: entry.columnId,
        value: entry.value,
        status: 'pending',
        created_by: user?.id,
        updated_at: new Date().toISOString()
      }));
      
      // For each entry, upsert to database
      for (const entry of supabaseEntries) {
        const { error } = await supabase
          .from('data_entries')
          .upsert(entry, { 
            onConflict: 'school_id,category_id,column_id',
            returning: 'minimal'
          });
        
        if (error) throw error;
      }
      
      toast({
        title: t('success'),
        description: t('dataSavedSuccessfully')
      });
      
      setSaveStatus(DataEntrySaveStatus.SAVED);
      setIsDataModified(false);
      
    } catch (err: any) {
      console.error('Error saving data:', err);
      toast({
        title: t('error'),
        description: t('errorSavingData'),
        variant: 'destructive'
      });
      setSaveStatus(DataEntrySaveStatus.ERROR);
    }
  }, [schoolId, formData.categoryId, entries, user, t, toast]);
  
  // Submit for approval
  const handleSubmitForApproval = useCallback(async () => {
    // First save the data
    await handleSave();
    
    // Then update status to pending for approval
    if (saveStatus !== DataEntrySaveStatus.ERROR) {
      try {
        const { error } = await supabase.functions.invoke('submit-category-for-approval', {
          body: { 
            schoolId,
            categoryId: formData.categoryId
          }
        });
        
        if (error) throw error;
        
        toast({
          title: t('success'),
          description: t('dataSubmittedForApproval')
        });
        
        if (onComplete) {
          onComplete();
        }
        
      } catch (err: any) {
        console.error('Error submitting for approval:', err);
        toast({
          title: t('error'),
          description: t('errorSubmittingForApproval'),
          variant: 'destructive'
        });
      }
    }
  }, [handleSave, saveStatus, schoolId, formData.categoryId, toast, t, onComplete]);
  
  // For compatibility
  const submitForApproval = handleSubmitForApproval;
  
  return {
    formData,
    updateFormData,
    categories,
    loading,
    error,
    selectedCategory,
    saveStatus,
    isDataModified,
    handleSave,
    handleSubmitForApproval,
    handleEntriesChange,
    loadDataForSchool,
    entries,
    submitForApproval
  };
};
