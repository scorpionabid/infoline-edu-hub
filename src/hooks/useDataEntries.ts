
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/dataEntry';
import { useAuth } from '@/context/AuthContext';

const useDataEntries = (categoryId?: string, schoolId?: string) => {
  const [entries, setEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  // Fetch data entries with optional filtering
  const fetchEntries = useCallback(async (filters?: Partial<DataEntry>) => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('data_entries')
        .select(`
          id, 
          category_id, 
          column_id, 
          school_id, 
          value, 
          status, 
          created_at, 
          updated_at, 
          created_by,
          approved_at,
          approved_by,
          rejected_by,
          rejection_reason
        `);
        
      // Əgər categoryId varsa, filtrdə istifadə et
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      // Əgər schoolId varsa, istifadə et
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
      
      // Əlavə filtrləri tətbiq et
      if (filters) {
        Object.keys(filters).forEach(key => {
          // Fikir verin - burada `key` və onun dəyəri tip təhlükəsizliyi üçün yoxlanılmalıdır
          const value = (filters as any)[key];
          if (value !== undefined && value !== null) {
            query = query.eq(key, value);
          }
        });
      }
      
      // Sorğunu icra et
      const { data, error: fetchError } = await query.order('updated_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      // Məlumatları formatlaşdır
      const formattedEntries: DataEntry[] = (data || []).map(entry => ({
        id: entry.id,
        category_id: entry.category_id,
        column_id: entry.column_id,
        school_id: entry.school_id,
        categoryId: entry.category_id,
        columnId: entry.column_id,
        schoolId: entry.school_id,
        value: entry.value || "",
        status: entry.status || "pending",
        createdAt: entry.created_at,
        updatedAt: entry.updated_at,
        createdBy: entry.created_by,
        approvedAt: entry.approved_at,
        approvedBy: entry.approved_by,
        rejectedBy: entry.rejected_by,
        rejectionReason: entry.rejection_reason
      }));
      
      setEntries(formattedEntries);
    } catch (err: any) {
      console.error("Failed to fetch data entries:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, schoolId]);

  // Add a new entry
  const addEntry = useCallback(async (entryData: Omit<DataEntry, "id" | "createdAt" | "updatedAt">) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .insert({
          category_id: entryData.category_id || entryData.categoryId,
          column_id: entryData.column_id || entryData.columnId,
          school_id: entryData.school_id || entryData.schoolId,
          value: entryData.value || "",
          status: entryData.status || "pending",
          created_by: user?.id || entryData.createdBy
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newEntry: DataEntry = {
        id: data.id,
        category_id: data.category_id,
        column_id: data.column_id,
        school_id: data.school_id,
        categoryId: data.category_id,
        columnId: data.column_id,
        schoolId: data.school_id,
        value: data.value || "",
        status: data.status || "pending",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by
      };
      
      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err: any) {
      console.error("Failed to add data entry:", err);
      throw err;
    }
  }, [user]);

  // Update an existing entry
  const updateEntry = useCallback(async (entryId: string, updateData: Partial<DataEntry>) => {
    try {
      const supabaseData: any = {};
      
      // Convert from column/category/school id to *_id format
      if (updateData.categoryId) supabaseData.category_id = updateData.categoryId;
      if (updateData.columnId) supabaseData.column_id = updateData.columnId;
      if (updateData.schoolId) supabaseData.school_id = updateData.schoolId;
      
      // Copy over direct matches
      if (updateData.category_id) supabaseData.category_id = updateData.category_id;
      if (updateData.column_id) supabaseData.column_id = updateData.column_id;
      if (updateData.school_id) supabaseData.school_id = updateData.school_id;
      if (updateData.value !== undefined) supabaseData.value = updateData.value;
      if (updateData.status) supabaseData.status = updateData.status;
      
      // Update the entry
      const { data, error } = await supabase
        .from('data_entries')
        .update({
          ...supabaseData,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId)
        .select()
        .single();
      
      if (error) throw error;
      
      const updatedEntry: DataEntry = {
        id: data.id,
        category_id: data.category_id,
        column_id: data.column_id,
        school_id: data.school_id,
        categoryId: data.category_id,
        columnId: data.column_id,
        schoolId: data.school_id,
        value: data.value || "",
        status: data.status || "pending",
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        createdBy: data.created_by,
        approvedAt: data.approved_at,
        approvedBy: data.approved_by,
        rejectedBy: data.rejected_by,
        rejectionReason: data.rejection_reason
      };
      
      // Update state
      setEntries(prev =>
        prev.map(entry => entry.id === entryId ? updatedEntry : entry)
      );
      
      return updatedEntry;
    } catch (err: any) {
      console.error("Failed to update data entry:", err);
      throw err;
    }
  }, []);

  // Delete an entry
  const deleteEntry = useCallback(async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .delete()
        .eq('id', entryId);
      
      if (error) throw error;
      
      // Update state
      setEntries(prev => prev.filter(entry => entry.id !== entryId));
      return true;
    } catch (err: any) {
      console.error("Failed to delete data entry:", err);
      throw err;
    }
  }, []);

  // Təsdiqləmə funksiyası
  const approveEntry = useCallback(async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id
        })
        .eq('id', entryId);
      
      if (error) throw error;
      
      // Update state
      setEntries(prev =>
        prev.map(entry => 
          entry.id === entryId 
            ? { 
                ...entry, 
                status: 'approved', 
                approvedAt: new Date().toISOString(), 
                approvedBy: user?.id 
              } 
            : entry
        )
      );
      
      return true;
    } catch (err: any) {
      console.error("Failed to approve data entry:", err);
      throw err;
    }
  }, [user]);

  // Rədd etmə funksiyası
  const rejectEntry = useCallback(async (entryId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from('data_entries')
        .update({
          status: 'rejected',
          rejection_reason: reason,
          rejected_by: user?.id
        })
        .eq('id', entryId);
      
      if (error) throw error;
      
      // Update state
      setEntries(prev =>
        prev.map(entry => 
          entry.id === entryId 
            ? { 
                ...entry, 
                status: 'rejected', 
                rejectionReason: reason, 
                rejectedBy: user?.id 
              } 
            : entry
        )
      );
      
      return true;
    } catch (err: any) {
      console.error("Failed to reject data entry:", err);
      throw err;
    }
  }, [user]);

  // Təsdiq üçün göndərmə funksiyası
  const submitCategoryForApproval = useCallback(async (categoryId: string, schoolId: string) => {
    try {
      // Əvvəlcə bütün gözləmə məlumatlarını əldə et
      const { data, error } = await supabase
        .from('data_entries')
        .select('id')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId)
        .eq('status', 'pending');
      
      if (error) throw error;
      
      // Yoxlayın ki, məlumatlar varmı
      if (!data || data.length === 0) {
        throw new Error("No pending entries found for this category and school");
      }
      
      // Status update function for multiple entries
      const updateStatus = async () => {
        const { error } = await supabase
          .rpc('submit_category_for_approval', {
            p_category_id: categoryId,
            p_school_id: schoolId,
            p_user_id: user?.id || null
          });
        
        if (error) throw error;
      };
      
      // Update all entries
      await updateStatus();
      
      // Update local state
      await fetchEntries({ category_id: categoryId, school_id: schoolId });
      
      return true;
    } catch (err: any) {
      console.error("Failed to submit category for approval:", err);
      throw err;
    }
  }, [fetchEntries, user]);

  // Təsdiq statusunu əldə etmək üçün funksiya
  const getApprovalStatus = useCallback(async (catId: string) => {
    try {
      const { data, error } = await supabase
        .from('data_entries')
        .select('status')
        .eq('category_id', catId)
        .eq('school_id', schoolId || '')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        // Məlumat tapılmadısa, "pending" qaytarın
        if (error.code === 'PGRST116') {
          return "pending";
        }
        throw error;
      }
      
      return data?.status || "pending";
    } catch (err: any) {
      console.error("Failed to get approval status:", err);
      return "pending";
    }
  }, [schoolId]);

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

export { useDataEntries };
