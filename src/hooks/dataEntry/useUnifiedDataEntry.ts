
import { useState, useCallback } from 'react';
import { 
  fetchUnifiedDataEntries, 
  saveUnifiedDataEntries, 
  updateUnifiedDataEntriesStatus,
  type UnifiedDataEntry
} from '@/services/api/unifiedDataEntry';
import { toast } from 'sonner';

interface UseUnifiedDataEntryOptions {
  categoryId: string;
  entityId: string;
  entityType: 'school' | 'sector';
  userId?: string | null;
}

export const useUnifiedDataEntry = ({
  categoryId,
  entityId,
  entityType,
  userId
}: UseUnifiedDataEntryOptions) => {
  const [entries, setEntries] = useState<UnifiedDataEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUnifiedDataEntries({
        categoryId,
        entityId,
        entityType
      });
      setEntries(data);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching entries:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, entityId, entityType]);

  const saveEntries = useCallback(async (entriesToSave: Partial<UnifiedDataEntry>[]) => {
    setLoading(true);
    setError(null);
    try {
      const savedEntries = await saveUnifiedDataEntries(
        entriesToSave,
        categoryId,
        entityId,
        entityType,
        userId
      );
      
      // Update local state
      setEntries(prev => {
        const newEntries = [...prev];
        savedEntries.forEach(saved => {
          const index = newEntries.findIndex(e => e.id === saved.id);
          if (index >= 0) {
            newEntries[index] = saved;
          } else {
            newEntries.push(saved);
          }
        });
        return newEntries;
      });
      
      toast.success('Entries saved successfully');
      return savedEntries;
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to save entries');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categoryId, entityId, entityType, userId]);

  const updateStatus = useCallback(async (entriesToUpdate: UnifiedDataEntry[], status: string) => {
    setLoading(true);
    setError(null);
    try {
      await updateUnifiedDataEntriesStatus(entriesToUpdate, status, entityType);
      
      // Update local state
      setEntries(prev => prev.map(entry => {
        if (entriesToUpdate.some(e => e.id === entry.id)) {
          return { ...entry, status: status as any };
        }
        return entry;
      }));
      
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      setError(err as Error);
      toast.error('Failed to update status');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [entityType]);

  return {
    entries,
    loading,
    error,
    fetchEntries,
    saveEntries,
    updateStatus,
    refetch: fetchEntries
  };
};

export { type UnifiedDataEntry };
