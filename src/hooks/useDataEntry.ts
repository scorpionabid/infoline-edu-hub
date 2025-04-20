
import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/context/auth';
import { CategoryWithColumns } from '@/types/column';
import { DataEntry, DataEntrySaveStatus, UseDataEntryProps, UseDataEntryResult } from '@/types/dataEntry';
import { toast } from 'sonner';

export const useDataEntry = ({
  schoolId,
  categoryId,
  onComplete
}: UseDataEntryProps): UseDataEntryResult => {
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);
  const [isDataModified, setIsDataModified] = useState<boolean>(false);
  
  const { user } = useAuth();
  
  // Bu, yalnız mock funksionallıqdır
  const loadDataForSchool = async (schoolId: string) => {
    setLoading(true);
    try {
      // TODO: Məlumatları real API-dən yükləmək
      // Mock məlumatlar
      const mockCategories: CategoryWithColumns[] = [
        {
          id: '1',
          name: 'Ümumi məlumatlar',
          description: 'Məktəb haqqında ümumi məlumatlar',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          columns: [
            {
              id: 'col1',
              category_id: '1',
              name: 'Şagird sayı',
              type: 'number',
              is_required: true,
              order_index: 0,
              status: 'active',
              help_text: 'Məktəbdəki ümumi şagird sayı',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'col2',
              category_id: '1',
              name: 'Müəllim sayı',
              type: 'number',
              is_required: true,
              order_index: 1,
              status: 'active',
              help_text: 'Məktəbdəki ümumi müəllim sayı',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ]
        }
      ];
      
      setCategories(mockCategories);
      
      // Mock entries
      const mockEntries: DataEntry[] = [
        {
          column_id: 'col1',
          category_id: '1',
          school_id: schoolId,
          value: '500',
          status: 'pending'
        },
        {
          column_id: 'col2',
          category_id: '1',
          school_id: schoolId,
          value: '50',
          status: 'pending'
        }
      ];
      
      setEntries(mockEntries);
      setIsDataModified(false);
      setSaveStatus(DataEntrySaveStatus.IDLE);
      
    } catch (err: any) {
      console.error('Məlumatlar yüklənərkən xəta:', err);
      setError('Məlumatlar yüklənərkən xəta baş verdi. Yenidən cəhd edin.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEntriesChange = useCallback((updatedEntries: DataEntry[]) => {
    setEntries(updatedEntries);
    setIsDataModified(true);
    setSaveStatus(DataEntrySaveStatus.IDLE);
  }, []);
  
  const handleSave = async () => {
    if (!schoolId) {
      setError('Məktəb ID-si təyin edilməyib');
      return;
    }
    
    setSaveStatus(DataEntrySaveStatus.SAVING);
    
    try {
      // TODO: Real API-yə məlumatların saxlanması
      // Mock save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Məlumatların saxlanması uğurlu olduqda
      setIsDataModified(false);
      setSaveStatus(DataEntrySaveStatus.SAVED);
      toast.success('Məlumatlar uğurla saxlanıldı');
      
    } catch (err: any) {
      console.error('Məlumatlar saxlanarkən xəta:', err);
      setSaveStatus(DataEntrySaveStatus.ERROR);
      setError('Məlumatlar saxlanarkən xəta baş verdi. Yenidən cəhd edin.');
      toast.error('Məlumatlar saxlanarkən xəta baş verdi');
    }
  };
  
  const submitForApproval = async () => {
    if (!schoolId) {
      setError('Məktəb ID-si təyin edilməyib');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // TODO: Real API-yə təsdiqlənmə üçün göndərmə
      // Mock submission operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success('Məlumatlar təsdiqlənmə üçün göndərildi');
      setIsDataModified(false);
      
      if (onComplete) {
        onComplete();
      }
      
    } catch (err: any) {
      console.error('Təsdiqlənmə üçün göndərilərkən xəta:', err);
      setError('Təsdiqlənmə üçün göndərilərkən xəta baş verdi. Yenidən cəhd edin.');
      toast.error('Təsdiqlənmə üçün göndərilərkən xəta baş verdi');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSubmitForApproval = async () => {
    await handleSave();
    await submitForApproval();
  };
  
  useEffect(() => {
    if (schoolId) {
      loadDataForSchool(schoolId);
    }
  }, [schoolId]);
  
  return {
    categories,
    loading,
    submitting,
    error,
    formData,
    entries,
    handleEntriesChange,
    handleSave,
    handleSubmitForApproval,
    loadDataForSchool,
    submitForApproval,
    saveStatus,
    isDataModified
  };
};
