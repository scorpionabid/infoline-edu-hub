
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/dataEntry';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

export const useDataEntries = (categoryId?: string, schoolId?: string) => {
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

      const formattedEntries = data?.map(entry => {
        const formattedEntry: DataEntry = {
          id: entry.id,
          categoryId: entry.category_id,
          category_id: entry.category_id,
          categoryName: entry.categories?.name || '',
          columnId: entry.column_id,
          column_id: entry.column_id,
          schoolId: entry.school_id,
          school_id: entry.school_id,
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
        };
        return formattedEntry;
      }) || [];

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
        category_id: entryData.categoryId || entryData.category_id,
        column_id: entryData.columnId || entryData.column_id,
        school_id: entryData.schoolId || entryData.school_id || user?.schoolId,
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
        category_id: data.category_id,
        categoryName: data.categories?.name || '',
        columnId: data.column_id,
        column_id: data.column_id,
        schoolId: data.school_id,
        school_id: data.school_id,
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
        category_id: data.category_id,
        categoryName: data.categories?.name || '',
        columnId: data.column_id,
        column_id: data.column_id,
        schoolId: data.school_id,
        school_id: data.school_id,
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
      const { data: entryData } = await supabase
        .from('data_entries')
        .select('school_id')
        .eq('id', entryId)
        .single();
      
      const { error } = await supabase
        .from('data_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      toast.success('Məlumat uğurla silindi');
      
      if (entryData?.school_id) {
        await updateSchoolCompletionRate(entryData.school_id);
      }
      
      return true;
    } catch (err: any) {
      console.error('Məlumat silinərkən xəta:', err);
      toast.error('Məlumat silinərkən xəta baş verdi');
      throw err;
    }
  }, []);

  // Approval funksiyaları
  const approveEntry = useCallback(async (entryId: string) => {
    return updateEntry(entryId, { status: 'approved' });
  }, [updateEntry]);

  const rejectEntry = useCallback(async (entryId: string, rejectionReason?: string) => {
    return updateEntry(entryId, { 
      status: 'rejected',
      rejectionReason: rejectionReason || 'Məlumat yanlışdır.'
    });
  }, [updateEntry]);

  // Məktəbin tamamlanma faizini yeniləmək üçün funksiya
  const updateSchoolCompletionRate = async (schoolId: string) => {
    try {
      // Məktəbin bütün kateqoriyalar üzrə ümumi sütun sayını əldə et
      const { count: totalColumns } = await supabase
        .from('columns')
        .select('id', { count: 'exact', head: true });
      
      // Məktəbin daxil edilmiş məlumatlarının sayını əldə et
      const { count: filledEntries } = await supabase
        .from('data_entries')
        .select('id', { count: 'exact', head: true })
        .eq('school_id', schoolId);
      
      // Tamamlanma faizini hesabla
      const completionRate = totalColumns && totalColumns > 0 
        ? Math.round((filledEntries || 0) / totalColumns * 100) 
        : 0;
      
      // Məktəbin tamamlanma faizini yenilə
      await supabase
        .from('schools')
        .update({ completion_rate: completionRate })
        .eq('id', schoolId);
        
    } catch (err) {
      console.error('Məktəbin tamamlanma faizini yeniləyərkən xəta:', err);
    }
  };

  // Kateqoriyanın təsdiq vəziyyətini əldə etmək üçün funksiya
  const getApprovalStatus = useCallback(async (categoryId: string, schoolId: string) => {
    try {
      // Kateqoriya üzrə sütun sayını əldə et
      const { count: columnCount } = await supabase
        .from('columns')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', categoryId);
      
      // Kateqoriya və məktəb üzrə təsdiqlənmiş məlumatların sayını əldə et
      const { count: approvedCount } = await supabase
        .from('data_entries')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .eq('status', 'approved');
      
      // Kateqoriya və məktəb üzrə rədd edilmiş məlumatların sayını əldə et
      const { count: rejectedCount } = await supabase
        .from('data_entries')
        .select('id', { count: 'exact', head: true })
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .eq('status', 'rejected');
      
      // Təsdiq vəziyyətini təyin et
      if (rejectedCount && rejectedCount > 0) {
        return 'rejected';
      } else if (approvedCount === columnCount && columnCount > 0) {
        return 'approved';
      } else {
        return 'pending';
      }
    } catch (err) {
      console.error('Təsdiq vəziyyətini əldə edərkən xəta:', err);
      return 'pending';
    }
  }, []);

  // Kateqoriyanın təsdiq üçün göndərilməsi
  const submitCategoryForApproval = useCallback(async (categoryId: string, schoolId: string) => {
    try {
      // Kateqoriya üzrə bütün daxil edilmiş məlumatları təsdiq üçün göndər
      const { data, error } = await supabase
        .from('data_entries')
        .update({ status: 'pending' })
        .eq('category_id', categoryId)
        .eq('school_id', schoolId);
      
      if (error) throw error;
      
      // Bildiriş göndər
      await supabase.from('notifications').insert({
        type: 'info',
        title: 'Kateqoriya təsdiqə göndərildi',
        message: `${categoryId} kateqoriyası təsdiq üçün göndərildi`,
        user_id: user?.id,
        priority: 'normal',
        related_entity_id: categoryId,
        related_entity_type: 'category'
      });
      
      toast.success('Kateqoriya təsdiq üçün uğurla göndərildi');
      return true;
    } catch (err) {
      console.error('Kateqoriyanı təsdiqə göndərərkən xəta:', err);
      toast.error('Kateqoriyanı təsdiqə göndərərkən xəta baş verdi');
      return false;
    }
  }, [user]);

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
