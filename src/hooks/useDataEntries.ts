import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { DataEntry } from '@/types/dataEntry';
import { useAuth } from '@/context/auth';
import { 
  getDataEntries, 
  addDataEntry, 
  updateDataEntry, 
  deleteDataEntry, 
  approveDataEntry, 
  rejectDataEntry 
} from '@/services/dataEntryService';

export const useDataEntries = (schoolId?: string, categoryId?: string, columnId?: string) => {
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useLanguage();
  const { user } = useAuth();

  const fetchDataEntries = useCallback(async () => {
    setLoading(true);
    try {
      // Servis qatından məlumatları əldə edirik
      const { success, data, error } = await getDataEntries({
        schoolId: schoolId || user?.schoolId,
        categoryId,
        columnId
      });
      
      if (!success) throw new Error(error);
      
      setDataEntries(data as DataEntry[]);
    } catch (err: any) {
      console.error('Məlumat elementlərini əldə edərkən xəta:', err);
      setError(err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotLoadDataEntries')
      });
    } finally {
      setLoading(false);
    }
  }, [schoolId, categoryId, columnId, user, t]);

  const handleAddDataEntry = async (dataEntry: Omit<DataEntry, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const entryWithSchoolId = {
        ...dataEntry,
        school_id: dataEntry.school_id || user?.schoolId,
        created_by: user?.id,
        status: 'pending'
      };

      // Servis qatı vasitəsilə məlumat əlavə edirik
      const { success, data, error } = await addDataEntry(entryWithSchoolId);
      
      if (!success) throw new Error(error);
      
      setDataEntries(prev => [data as DataEntry, ...prev]);
      toast.success(t('dataEntrySaved'), {
        description: t('dataEntrySavedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Məlumat elementi əlavə edərkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotSaveData')
      });
      throw err;
    }
  };

  const handleUpdateDataEntry = async (id: string, updates: Partial<DataEntry>) => {
    try {
      // Servis qatı vasitəsilə məlumatı yeniləyirik
      const { success, data, error } = await updateDataEntry(id, updates);
      
      if (!success) throw new Error(error);
      
      setDataEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...data } as DataEntry : entry
      ));
      
      toast.success(t('dataEntryUpdated'), {
        description: t('dataEntryUpdatedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Məlumat elementi yeniləyərkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotUpdateData')
      });
      throw err;
    }
  };

  const handleDeleteDataEntry = async (id: string) => {
    try {
      // Servis qatı vasitəsilə məlumatı silirik
      const { success, error } = await deleteDataEntry(id);
      
      if (!success) throw new Error(error);
      
      setDataEntries(prev => prev.filter(entry => entry.id !== id));
      
      toast.success(t('dataEntryDeleted'), {
        description: t('dataEntryDeletedDesc')
      });
    } catch (err: any) {
      console.error('Məlumat elementi silirkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotDeleteData')
      });
      throw err;
    }
  };

  const handleApproveDataEntry = async (id: string) => {
    try {
      // Servis qatı vasitəsilə məlumatı təsdiqləyirik
      const { success, data, error } = await approveDataEntry(id);
      
      if (!success) throw new Error(error);
      
      setDataEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...data } as DataEntry : entry
      ));
      
      toast.success(t('dataEntryApproved'), {
        description: t('dataEntryApprovedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Məlumat elementi təsdiqləyərkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: t('couldNotApproveData')
      });
      throw err;
    }
  };

  const handleRejectDataEntry = async (id: string, rejectionReason: string) => {
    try {
      if (!rejectionReason) {
        throw new Error('Rədd səbəbi tələb olunur');
      }

      // Servis qatı vasitəsilə məlumatı rədd edirik
      const { success, data, error } = await rejectDataEntry(id, rejectionReason);
      
      if (!success) throw new Error(error);
      
      setDataEntries(prev => prev.map(entry => 
        entry.id === id ? { ...entry, ...data } as DataEntry : entry
      ));
      
      toast.success(t('dataEntryRejected'), {
        description: t('dataEntryRejectedDesc')
      });
      
      return data;
    } catch (err: any) {
      console.error('Məlumat elementi rədd edərkən xəta:', err);
      toast.error(t('errorOccurred'), {
        description: err.message || t('couldNotRejectData')
      });
      throw err;
    }
  };

  // Effektlər
  useEffect(() => {
    fetchDataEntries();
  }, [fetchDataEntries]);

  return {
    dataEntries,
    loading,
    error,
    refetch: fetchDataEntries,
    addDataEntry: handleAddDataEntry,
    updateDataEntry: handleUpdateDataEntry,
    deleteDataEntry: handleDeleteDataEntry,
    approveDataEntry: handleApproveDataEntry,
    rejectDataEntry: handleRejectDataEntry
  };
};

export default useDataEntries;