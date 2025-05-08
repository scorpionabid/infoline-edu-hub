import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DataEntryTableData } from '@/types/dataEntry';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/context/LanguageContext';

export const useApproval = (schoolId?: string, categoryId?: string) => {
  const params = useParams();
  const resolvedSchoolId = schoolId || params.schoolId;
  const resolvedCategoryId = categoryId || params.categoryId;
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ entries: DataEntryTableData[], status: string }>({ 
    entries: [], 
    status: 'pending'
  });
  const [schoolName, setSchoolName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  
  // Məlumatları yüklə
  useEffect(() => {
    if (!resolvedSchoolId || !resolvedCategoryId) {
      setError('School ID or Category ID is missing');
      setLoading(false);
      return;
    }
    
    const loadData = async () => {
      try {
        setLoading(true);
        // Məlumatları əldə et
        const { data: entries, error: entriesError } = await supabase
          .from('data_entries')
          .select('*, column:column_id(name, type)')
          .eq('school_id', resolvedSchoolId)
          .eq('category_id', resolvedCategoryId);
        
        if (entriesError) throw entriesError;
        
        // Məktəb məlumatlarını əldə et
        const { data: school, error: schoolError } = await supabase
          .from('schools')
          .select('name')
          .eq('id', resolvedSchoolId)
          .single();
        
        if (schoolError) throw schoolError;
        
        // Kateqoriya məlumatlarını əldə et
        const { data: category, error: categoryError } = await supabase
          .from('categories')
          .select('name')
          .eq('id', resolvedCategoryId)
          .single();
        
        if (categoryError) throw categoryError;
        
        // Status məlumatını təyin et (ilk elementin statusuna əsasən)
        const status = entries.length > 0 ? entries[0].status : 'pending';
        
        // Məlumatları uyğun formata çevir
        const formattedEntries: DataEntryTableData[] = formatEntries(entries);
        
        setData({
          entries: formattedEntries,
          status
        });
        setSchoolName(school?.name || '');
        setCategoryName(category?.name || '');
        setError(null);
      } catch (err: any) {
        console.error('Error loading approval data:', err);
        setError(err.message || 'Error loading data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [resolvedSchoolId, resolvedCategoryId]);
  
  const formatEntries = (entries: any[]): DataEntryTableData[] => {
    return entries.map(entry => ({
      id: entry.id,
      categoryId: entry.category_id,
      schoolId: entry.school_id,
      columnId: entry.column_id,
      columnName: entry.columnName || '',
      value: entry.value,
      status: entry.status || 'pending',
      columnType: entry.columnType || 'text',
      createdAt: entry.created_at || new Date().toISOString(),
      updatedAt: entry.updated_at || new Date().toISOString()
    }));
  };
  
  // Təsdiq et
  const handleApprove = useCallback(async () => {
    if (!resolvedSchoolId || !resolvedCategoryId) {
      throw new Error('School ID or Category ID is missing');
    }
    
    const { error } = await supabase
      .from('data_entries')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('school_id', resolvedSchoolId)
      .eq('category_id', resolvedCategoryId);
    
    if (error) throw error;
    
    // Uğurlu mesaj
    toast({
      title: t('approvalSuccess'),
      description: t('dataApprovedSuccessfully'),
    });
    
    // State yenilə
    setData(prev => ({
      ...prev,
      status: 'approved'
    }));
    
    return true;
  }, [resolvedSchoolId, resolvedCategoryId, toast, t]);
  
  // Rədd et
  const handleReject = useCallback(async (reason: string) => {
    if (!reason || !reason.trim()) {
      throw new Error('Rejection reason is required');
    }
    
    if (!resolvedSchoolId || !resolvedCategoryId) {
      throw new Error('School ID or Category ID is missing');
    }
    
    const { error } = await supabase
      .from('data_entries')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        rejected_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('school_id', resolvedSchoolId)
      .eq('category_id', resolvedCategoryId);
    
    if (error) throw error;
    
    // Uğurlu mesaj
    toast({
      title: t('rejectionSuccess'),
      description: t('dataRejectedSuccessfully'),
    });
    
    // State yenilə
    setData(prev => ({
      ...prev,
      status: 'rejected'
    }));
    
    return true;
  }, [resolvedSchoolId, resolvedCategoryId, toast, t]);
  
  return {
    loading,
    error,
    data,
    schoolName,
    categoryName,
    handleApprove,
    handleReject
  };
};

export default useApproval;
