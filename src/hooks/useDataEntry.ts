
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { CategoryWithColumns } from '@/types/category';
import { DataEntry, DataEntrySaveStatus } from '@/types/dataEntry';
import { toast } from 'sonner';

interface UseDataEntryProps {
  schoolId?: string;
  categoryId?: string;
  onComplete?: () => void;
}

export const useDataEntry = ({ schoolId, categoryId, onComplete }: UseDataEntryProps = {}) => {
  const { userRole, schoolId: userSchoolId } = usePermissions();
  
  const [categories, setCategories] = useState<CategoryWithColumns[]>([]);
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<DataEntrySaveStatus>(DataEntrySaveStatus.IDLE);
  const [isDataModified, setIsDataModified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // İstifadəçinin məktəbini təyin et
  const effectiveSchoolId = schoolId || userSchoolId;
  
  // Kateqoriyaları yüklə
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('loadCategories çağırıldı');
      
      const { data, error } = await supabase
        .from('categories')
        .select('*, columns(*)')
        .order('priority', { ascending: false })
        .eq('status', 'active');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        console.log('Yüklənən kateqoriyalar:', data.length);
        setCategories(data as CategoryWithColumns[]);
      }
    } catch (error: any) {
      console.error('Kateqoriyaları yükləyərkən xəta:', error.message);
      setError('Kateqoriyaları yükləyərkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Məlumatları daxil etmək üçün
  const handleEntriesChange = useCallback((updatedEntries: DataEntry[]) => {
    setEntries(prev => {
      // Yalnız dəyişmiş olanları güncəllə
      const newEntries = [...prev];
      
      updatedEntries.forEach(updatedEntry => {
        const index = newEntries.findIndex(e => 
          e.column_id === updatedEntry.column_id && 
          e.category_id === updatedEntry.category_id
        );
        
        if (index >= 0) {
          // Mövcud giriş dəyişikliyini yenilə
          newEntries[index] = {
            ...newEntries[index],
            value: updatedEntry.value
          };
        } else {
          // Yeni giriş əlavə et
          newEntries.push({
            column_id: updatedEntry.column_id,
            category_id: updatedEntry.category_id,
            school_id: effectiveSchoolId || '',
            value: updatedEntry.value,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      });
      
      setIsDataModified(true);
      return newEntries;
    });
  }, [effectiveSchoolId]);
  
  // Dəyişiklikləri yadda saxlamaq üçün
  const handleSave = useCallback(async () => {
    if (!effectiveSchoolId || entries.length === 0) {
      return;
    }
    
    try {
      setSaveStatus(DataEntrySaveStatus.SAVING);
      
      // Girişləri döngüyə alıb hər biri üçün upsert əməliyyatı
      for (const entry of entries) {
        if (!entry.id) {
          // Yeni giriş əlavə et
          const { error } = await supabase
            .from('data_entries')
            .insert({
              school_id: effectiveSchoolId,
              category_id: entry.category_id,
              column_id: entry.column_id,
              value: entry.value,
              status: 'pending',
              created_by: userRole === 'schooladmin' ? 'user-id' : null // Real istifadəçi ID olmalıdır
            });
            
          if (error) throw error;
        } else {
          // Mövcud girişi yenilə
          const { error } = await supabase
            .from('data_entries')
            .update({
              value: entry.value,
              updated_at: new Date().toISOString()
            })
            .eq('id', entry.id);
            
          if (error) throw error;
        }
      }
      
      setSaveStatus(DataEntrySaveStatus.SAVED);
      setIsDataModified(false);
      
      toast.success('Dəyişikliklər uğurla yadda saxlanıldı');
      
      // Məlumatları yenidən yüklə
      await loadDataForSchool(effectiveSchoolId);
    } catch (error: any) {
      console.error('Yadda saxlama zamanı xəta:', error.message);
      setSaveStatus(DataEntrySaveStatus.ERROR);
      toast.error('Yadda saxlama zamanı xəta baş verdi');
    }
  }, [effectiveSchoolId, entries, userRole, loadDataForSchool]);
  
  // Təsdiq üçün göndərmək
  const handleSubmitForApproval = useCallback(async () => {
    if (!effectiveSchoolId) {
      return;
    }
    
    try {
      setSaveStatus(DataEntrySaveStatus.SUBMITTING);
      
      // Əvvəlcə yadda saxla
      await handleSave();
      
      // Təsdiq üçün status güncəllə
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('school_id', effectiveSchoolId)
        .in('id', entries.map(e => e.id).filter(Boolean));
        
      if (error) throw error;
      
      setSaveStatus(DataEntrySaveStatus.SUBMITTED);
      setIsDataModified(false);
      
      toast.success('Məlumatlar təsdiq üçün göndərildi');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Təsdiq üçün göndərmə zamanı xəta:', error.message);
      setSaveStatus(DataEntrySaveStatus.ERROR);
      toast.error('Təsdiq üçün göndərmə zamanı xəta baş verdi');
    }
  }, [effectiveSchoolId, entries, handleSave, onComplete]);
  
  // Məktəb məlumatlarını yüklə
  const loadDataForSchool = useCallback(async (schoolId: string) => {
    if (!schoolId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('loadDataForSchool çağırıldı:', schoolId);
      
      // Məktəb üçün mövcud giriş məlumatlarını al
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('school_id', schoolId);
        
      if (error) throw error;
      
      if (data) {
        console.log('Yüklənən giriş məlumatları:', data.length);
        setEntries(data as DataEntry[]);
      }
      
      // Kateqoriyaları da yüklə
      await loadCategories();
    } catch (error: any) {
      console.error('Məktəb məlumatlarını yükləyərkən xəta:', error.message);
      setError('Məlumatları yükləyərkən xəta baş verdi.');
    } finally {
      setLoading(false);
    }
  }, [loadCategories]);
  
  // Komponent yükləndikdə və ya effektiv məktəb ID-si dəyişdikdə məlumatları yüklə
  useEffect(() => {
    if (effectiveSchoolId) {
      loadDataForSchool(effectiveSchoolId);
    } else {
      loadCategories();
    }
  }, [effectiveSchoolId, loadDataForSchool, loadCategories]);
  
  // Kateqoriya ID dəyişdikdə UI-ı təmizlə
  useEffect(() => {
    if (isDataModified) {
      // İstifadəçini xəbərdar et
      console.log('Dəyişiklikləri yadda saxla');
    }
  }, [categoryId, isDataModified]);
  
  return {
    categories,
    entries,
    loading,
    submitting,
    saveStatus,
    isDataModified,
    error,
    handleEntriesChange,
    handleSave,
    handleSubmitForApproval,
    loadDataForSchool
  };
};

export default useDataEntry;
