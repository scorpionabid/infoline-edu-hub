import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { DataEntryTableData } from '@/types/dataEntry';
import { useToast } from '@/hooks/common/useToast';
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
        
        // Approval vəziyyətini əldə et
        const { data: approval, error: approvalError } = await supabase
          .from('approvals')
          .select('status, rejection_reason')
          .eq('school_id', resolvedSchoolId)
          .eq('category_id', resolvedCategoryId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (approvalError) throw approvalError;
        
        const formattedEntries = entries.map((entry: any) => ({
          id: entry.id,
          columnId: entry.column_id,
          columnName: entry.column?.name || 'Unknown',
          type: entry.column?.type || 'text',
          value: entry.value,
          status: entry.status || 'pending',
          comments: entry.comments || '',
          isRequired: entry.is_required,
        }));
        
        setData({
          entries: formattedEntries, 
          status: approval?.status || 'pending'
        });
        setSchoolName(school?.name || '');
        setCategoryName(category?.name || '');
        setError(null);
      } catch (err: any) {
        console.error('Error loading approval data:', err);
        setError(err.message);
        toast({
          title: t('error'),
          description: t('errorLoadingData'),
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [resolvedSchoolId, resolvedCategoryId, toast, t]);
  
  // Məlumatı təsdiqlə
  const approveData = useCallback(async () => {
    try {
      if (!resolvedSchoolId || !resolvedCategoryId) {
        throw new Error('School ID or Category ID is missing');
      }
      
      setLoading(true);
      // Təsdiqləmə yazısı əlavə et
      const { error: approvalError } = await supabase
        .from('approvals')
        .insert({
          school_id: resolvedSchoolId,
          category_id: resolvedCategoryId,
          status: 'approved',
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        });
      
      if (approvalError) throw approvalError;
      
      // Məlumatları yenilə
      setData(prev => ({ ...prev, status: 'approved' }));
      
      toast({
        title: t('success'),
        description: t('dataApproveSuccess'),
        variant: 'success',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error approving data:', err);
      toast({
        title: t('error'),
        description: t('errorApprovingData'),
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [resolvedSchoolId, resolvedCategoryId, toast, t]);
  
  // Məlumatı rədd et
  const rejectData = useCallback(async (reason: string) => {
    try {
      if (!resolvedSchoolId || !resolvedCategoryId) {
        throw new Error('School ID or Category ID is missing');
      }
      
      if (!reason.trim()) {
        throw new Error('Rejection reason is required');
      }
      
      setLoading(true);
      // Təsdiqləmə yazısı əlavə et
      const { error: approvalError } = await supabase
        .from('approvals')
        .insert({
          school_id: resolvedSchoolId,
          category_id: resolvedCategoryId,
          status: 'rejected',
          rejection_reason: reason,
          approved_by: (await supabase.auth.getUser()).data.user?.id,
        });
      
      if (approvalError) throw approvalError;
      
      // Məlumatları yenilə
      setData(prev => ({ ...prev, status: 'rejected' }));
      
      toast({
        title: t('success'),
        description: t('dataRejectSuccess'),
        variant: 'success',
      });
      
      return true;
    } catch (err: any) {
      console.error('Error rejecting data:', err);
      toast({
        title: t('error'),
        description: t('errorRejectingData'),
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [resolvedSchoolId, resolvedCategoryId, toast, t]);
  
  return {
    loading,
    error,
    data: data.entries,
    status: data.status,
    schoolName,
    categoryName,
    approveData,
    rejectData,
  };
};

export default useApproval;
