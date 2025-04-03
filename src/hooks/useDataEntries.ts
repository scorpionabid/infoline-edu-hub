import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/dataEntry';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useDataEntries = () => {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchEntries = useCallback(async (filters?: Partial<DataEntry>) => {
    setLoading(true);
    try {
      let query = supabase.from('data_entries').select(`
        *,
        schools (id, name),
        categories (id, name, deadline)
      `);

      switch (user?.role) {
        case 'superadmin':
          break;
        case 'regionadmin':
          if (user.regionId) {
            query = query.in('school_id', 
              supabase.from('schools')
                .select('id')
                .eq('region_id', user.regionId)
            );
          }
          break;
        case 'sectoradmin':
          if (user.sectorId) {
            query = query.in('school_id', 
              supabase.from('schools')
                .select('id')
                .eq('sector_id', user.sectorId)
            );
          }
          break;
        case 'schooladmin':
          if (user.schoolId) {
            query = query.eq('school_id', user.schoolId);
          }
          break;
      }

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined) {
            const fieldName = key === 'categoryId' ? 'category_id' : 
                            key === 'columnId' ? 'column_id' :
                            key === 'schoolId' ? 'school_id' :
                            key === 'createdBy' ? 'created_by' :
                            key === 'approvedBy' ? 'approved_by' :
                            key === 'rejectedBy' ? 'rejected_by' : key;
            
            query = query.eq(fieldName, value);
          }
        });
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedEntries = data?.map(entry => ({
        id: entry.id,
        categoryId: entry.category_id,
        categoryName: entry.categories?.name || '',
        columnId: entry.column_id,
        schoolId: entry.school_id,
        schoolName: entry.schools?.name || '',
        value: entry.value || '',
        status: entry.status || 'pending',
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
        createdBy: entry.created_by,
        approvedAt: entry.approved_at,
        approvedBy: entry.approved_by,
        rejectedBy: entry.rejected_by,
        rejectionReason: entry.rejection_reason || '',
        deadline: entry.categories?.deadline
      })) || [];

      setEntries(formattedEntries);
      setLoading(false);
    } catch (err: any) {
      console.error('Məlumatları yükləyərkən xəta:', err);
      setError(err);
      setLoading(false);
      toast.error('Məlumatları yükləyərkən xəta baş verdi');
    }
  }, [user, categoryId, schoolId]);

  const addEntry = useCallback(async (entryData: Omit<DataEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const supabaseEntryData = {
        category_id: entryData.categoryId,
        column_id: entryData.columnId,
        school_id: entryData.schoolId || user?.schoolId,
        value: entryData.value,
        status: entryData.status || 'pending',
        created_by: user?.id,
      };

      const { data, error } = await supabase
        .from('data_entries')
        .insert(supabaseEntryData)
        .select(`
          *,
          schools (id, name),
          categories (id, name, deadline)
        `)
        .single();

      if (error) throw error;

      const newEntry: DataEntry = {
        id: data.id,
        categoryId: data.category_id,
        categoryName: data.categories?.name || '',
        columnId: data.column_id,
        schoolId: data.school_id,
        schoolName: data.schools?.name || '',
        value: data.value || '',
        status: data.status || 'pending',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by,
        rejectedBy: data.rejected_by,
        rejectionReason: data.rejection_reason || '',
        deadline: data.categories?.deadline
      };

      setEntries(prev => [...prev, newEntry]);
      toast.success('Məlumat uğurla əlavə edildi');
      
      await updateSchoolCompletionRate(data.school_id);
      
      return newEntry;
    } catch (err: any) {
      console.error('Məlumat əlavə edərkən xəta:', err);
      toast.error('Məlumat əlavə edərkən xəta baş verdi');
      throw err;
    }
  }, [user]);

  const updateEntry = useCallback(async (entryId: string, updateData: Partial<DataEntry>) => {
    try {
      const supabaseUpdateData: any = {};
      
      if (updateData.value !== undefined) supabaseUpdateData.value = updateData.value;
      if (updateData.status !== undefined) supabaseUpdateData.status = updateData.status;
      
      if (updateData.status === 'approved') {
        supabaseUpdateData.approved_at = new Date().toISOString();
        supabaseUpdateData.approved_by = user?.id;
      } else if (updateData.status === 'rejected') {
        supabaseUpdateData.rejected_by = user?.id;
        if (updateData.rejectionReason) {
          supabaseUpdateData.rejection_reason = updateData.rejectionReason;
        }
      }

      const { data, error } = await supabase
        .from('data_entries')
        .update(supabaseUpdateData)
        .eq('id', entryId)
        .select(`
          *,
          schools (id, name),
          categories (id, name, deadline)
        `)
        .single();

      if (error) throw error;

      const updatedEntry: DataEntry = {
        id: data.id,
        categoryId: data.category_id,
        categoryName: data.categories?.name || '',
        columnId: data.column_id,
        schoolId: data.school_id,
        schoolName: data.schools?.name || '',
        value: data.value || '',
        status: data.status || 'pending',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by,
        rejectedBy: data.rejected_by,
        rejectionReason: data.rejection_reason || '',
        deadline: data.categories?.deadline
      };

      setEntries(prev => prev.map(entry => 
        entry.id === entryId ? updatedEntry : entry
      ));
      
      if (updateData.status === 'approved') {
        toast.success('Məlumat təsdiqləndi');
      } else if (updateData.status === 'rejected') {
        toast.success('Məlumat rədd edildi');
      } else {
        toast.success('Məlumat uğurla yeniləndi');
      }
      
      await updateSchoolCompletionRate(data.school_id);
      
      return updatedEntry;
    } catch (err: any) {
      console.error('Məlumat yenilənərkən xəta:', err);
      toast.error('Məlumat yenilənərkən xəta baş verdi');
      throw err;
    }
  }, [user]);

  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      const entry = entries.find(e => e.id === entryId);
      const schoolId = entry?.schoolId;
      
      const { error } = await supabase
        .from('data_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Məlumat uğurla silindi');
      
      if (schoolId) {
        await updateSchoolCompletionRate(schoolId);
      }
      
      return true;
    } catch (err: any) {
      console.error('Məlumat silinərkən xəta:', err);
      toast.error('Məlumat silinərkən xəta baş verdi');
      throw err;
    }
  }, [entries]);
  
  const approveEntry = useCallback(async (entryId: string, updateData?: Partial<DataEntry>) => {
    return await updateEntry(entryId, {
      ...updateData,
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: user?.id
    });
  }, [user, updateEntry]);

  const rejectEntry = useCallback(async (entryId: string, updateData?: Partial<DataEntry>) => {
    return await updateEntry(entryId, {
      ...updateData,
      status: 'rejected',
      rejected_by: user?.id,
      rejection_reason: updateData?.rejectionReason || updateData?.rejection_reason || ''
    });
  }, [user, updateEntry]);

  const submitCategoryForApproval = useCallback(async (categoryId: string, schoolId: string) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId);
        
      if (error) throw error;
      
      for (const entry of data) {
        await updateEntry(entry.id, { status: 'pending' });
      }
      
      return true;
    } catch (error) {
      console.error('Category submission error:', error);
      return false;
    }
  }, [updateEntry]);

  const getApprovalStatus = useCallback((categoryId: string) => {
    const categoryEntries = entries.filter(entry => entry.category_id === categoryId || entry.categoryId === categoryId);
    
    if (categoryEntries.length === 0) return 'pending';
    
    const approvedCount = categoryEntries.filter(entry => entry.status === 'approved').length;
    const rejectedCount = categoryEntries.filter(entry => entry.status === 'rejected').length;
    
    if (rejectedCount > 0) return 'rejected';
    if (approvedCount === categoryEntries.length) return 'approved';
    
    return 'pending';
  }, [entries]);
  
  const updateSchoolCompletionRate = async (schoolId: string) => {
    try {
      const { count: totalColumnsCount } = await supabase
        .from('columns')
        .select('*', { count: 'exact', head: true });
      
      if (!totalColumnsCount) return;
      
      const { count: approvedEntriesCount } = await supabase
        .from('data_entries')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .eq('status', 'approved');
      
      const completionRate = Math.round((approvedEntriesCount || 0) / totalColumnsCount * 100);
      
      await supabase
        .from('schools')
        .update({ completion_rate: completionRate })
        .eq('id', schoolId);
    } catch (err) {
      console.error('Məktəb tamamlanma faizini yeniləyərkən xəta:', err);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return {
    entries,
    loading,
    error,
    fetchEntries,
    addEntry,
    updateEntry,
    deleteEntry,
    approveEntry,
    rejectEntry,
    submitCategoryForApproval,
    getApprovalStatus
  };
};
