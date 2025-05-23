import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { FullUserData } from '@/types/supabase';
import { useToast } from '@/hooks/common/useToast';
import { useLanguage } from '@/context/LanguageContext';

// Tip xətalarını həll etmək üçün sadə bir interface yaradırıq
// Bu, Supabase tipləri tam olaraq inteqrasiya edilənə qədər bir müvəqqəti həlldir
interface ApprovalRecord {
  id: string;
  school_id: string;
  category_id: string;
  status: string;
  rejection_reason?: string;
  approved_by?: string;
  created_at: string;
  updated_at?: string;
}

// DataEntryTableData tipi üçün ara interface
export interface ApprovalEntryData {
  id: string;
  columnId: string;
  columnName: string;
  type: string;
  value: any;
  status: string;
  comments?: string;
  isRequired: boolean;
}

export const useApproval = (schoolId?: string, categoryId?: string) => {
  const params = useParams();
  const resolvedSchoolId = schoolId || params.schoolId;
  const resolvedCategoryId = categoryId || params.categoryId;
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<{ entries: ApprovalEntryData[], status: string }>({ 
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
        // Type-safe olmayan variant - müvəqqəti həll
        const approvalResponse = await (supabase as any)
          .from('approvals')
          .select('status, rejection_reason')
          .eq('school_id', resolvedSchoolId)
          .eq('category_id', resolvedCategoryId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        const approval = approvalResponse.data;
        const approvalError = approvalResponse.error;
        
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
          entries: formattedEntries as ApprovalEntryData[], 
          status: approval?.status || 'pending'
        });
        setSchoolName(school?.name || '');
        setCategoryName(category?.name || '');
        setError(null);
      } catch (err: any) {
        console.error('Error loading approval data:', err);
        setError(err.message);
        toast(`${t('error')}: ${t('errorLoadingData')}`);
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
      const user = (await supabase.auth.getUser()).data.user;
      const approvalResponse = await (supabase as any)
        .from('approvals')
        .insert({
          school_id: resolvedSchoolId,
          category_id: resolvedCategoryId,
          status: 'approved',
          approved_by: user?.id
        });
        
      const error = approvalResponse.error;
      
      if (error) throw error;
      
      // Məlumatları yenilə
      setData(prev => ({ ...prev, status: 'approved' }));
      
      toast(`${t('success')}: ${t('approvalSuccessful')}`);
      
      return true;
    } catch (err: any) {
      console.error('Error approving data:', err);
      toast(`${t('error')}: ${t('errorApprovingSubmission')}`);
      return false;
    } finally {
      setLoading(false);
    }
  }, [resolvedSchoolId, resolvedCategoryId, toast, t]);
  
  // Məlumatı rədd et
  const rejectData = useCallback(async (rejectionReason: string) => {
    try {
      if (!resolvedSchoolId || !resolvedCategoryId) {
        throw new Error('School ID or Category ID is missing');
      }
      
      if (!rejectionReason.trim()) {
        throw new Error('Rejection reason is required');
      }
      
      setLoading(true);
      // Təsdiqləmə yazısı əlavə et
      const user = (await supabase.auth.getUser()).data.user;
      const approvalResponse = await (supabase as any)
        .from('approvals')
        .insert({
          school_id: resolvedSchoolId,
          category_id: resolvedCategoryId,
          status: 'rejected',
          rejection_reason: rejectionReason,
          approved_by: user?.id
        });
        
      const error = approvalResponse.error;
      
      if (error) throw error;
      
      // Məlumatları yenilə
      setData(prev => ({ ...prev, status: 'rejected' }));
      
      toast(`${t('success')}: ${t('rejectionSuccessful')}`);
      
      return true;
    } catch (err: any) {
      console.error('Error rejecting data:', err);
      toast(`${t('error')}: ${t('errorRejectingSubmission')}`);
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
