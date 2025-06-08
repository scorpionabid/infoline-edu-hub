
import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/dataEntry';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';

interface UseDataEntryStateProps {
  categoryId: string;
  schoolId: string;
  enabled?: boolean;
}

export function useDataEntryState({ categoryId, schoolId, enabled = true }: UseDataEntryStateProps) {
  const user = useAuthStore(selectUser);
  const queryClient = useQueryClient();
  const [entriesMap, setEntriesMap] = useState<Record<string, DataEntry>>({});

  // Fetch data entries
  const {
    data: entries = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['dataEntries', categoryId, schoolId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', schoolId);

      if (error) throw error;
      return data || [];
    },
    enabled: enabled && !!categoryId && !!schoolId
  });

  // Update entries map when entries change
  useEffect(() => {
    const newEntriesMap = entries.reduce((acc, entry) => {
      acc[entry.column_id] = entry;
      return acc;
    }, {} as Record<string, DataEntry>);
    setEntriesMap(newEntriesMap);
  }, [entries]);

  // Helper functions
  const getEntryByColumnId = useCallback((columnId: string) => {
    return entriesMap[columnId] || null;
  }, [entriesMap]);

  const hasEntryForColumn = useCallback((columnId: string) => {
    return !!entriesMap[columnId];
  }, [entriesMap]);

  // Update single entry value
  const updateEntryValueMutation = useMutation({
    mutationFn: async ({ columnId, value }: { columnId: string; value: any }) => {
      const existingEntry = entriesMap[columnId];
      
      // Ensure we have a valid user ID or use null
      const safeUserId = user?.id || null;
      console.log('Using safe user ID for update:', safeUserId);
      
      if (existingEntry) {
        // Update existing entry
        const { data, error } = await supabase
          .from('data_entries')
          .update({
            value: value?.toString() || '',
            updated_at: new Date().toISOString()
          })
          .eq('id', existingEntry.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new entry with safe UUID handling
        const { data, error } = await supabase
          .from('data_entries')
          .insert({
            category_id: categoryId,
            school_id: schoolId,
            column_id: columnId,
            value: value?.toString() || '',
            status: 'draft',
            created_by: safeUserId // Use safe UUID or null, never "system"
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating data entry:', error);
          if (error.code === '22P02' && error.message?.includes('uuid')) {
            console.error('UUID validation failed. User ID:', safeUserId);
          }
          throw error;
        }
        return data;
      }
    },
    onSuccess: (data) => {
      // Update local state
      setEntriesMap(prev => ({
        ...prev,
        [data.column_id]: data
      }));
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['dataEntries', categoryId, schoolId] });
    }
  });

  // Update all entries
  const updateAllEntriesMutation = useMutation({
    mutationFn: async (entriesToSave: Partial<DataEntry>[]) => {
      const results = [];
      const safeUserId = user?.id || null;
      console.log('Using safe user ID for batch update:', safeUserId);
      
      for (const entry of entriesToSave) {
        const existingEntry = entriesMap[entry.column_id!];
        
        if (existingEntry) {
          // Update existing
          const { data, error } = await supabase
            .from('data_entries')
            .update({
              value: entry.value || '',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingEntry.id)
            .select()
            .single();

          if (error) throw error;
          results.push(data);
        } else {
          // Create new with safe UUID
          const { data, error } = await supabase
            .from('data_entries')
            .insert({
              category_id: categoryId,
              school_id: schoolId,
              column_id: entry.column_id!,
              value: entry.value || '',
              status: 'draft',
              created_by: safeUserId // Safe UUID or null
            })
            .select()
            .single();

          if (error) {
            console.error('Error in batch create:', error);
            if (error.code === '22P02' && error.message?.includes('uuid')) {
              console.error('UUID validation failed in batch. User ID:', safeUserId);
            }
            throw error;
          }
          results.push(data);
        }
      }
      
      return results;
    },
    onSuccess: () => {
      refetch();
    }
  });

  // Update status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ entries: entriesToUpdate, status }: { entries: DataEntry[]; status: string }) => {
      const entryIds = entriesToUpdate.map(entry => entry.id);
      
      const { error } = await supabase
        .from('data_entries')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .in('id', entryIds);

      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    }
  });

  return {
    entries,
    entriesMap,
    isLoading,
    isError,
    error,
    refetch,
    getEntryByColumnId,
    hasEntryForColumn,
    updateEntryValue: updateEntryValueMutation.mutate,
    updateAllEntries: updateAllEntriesMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
    isSaving: updateEntryValueMutation.isPending || updateAllEntriesMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending
  };
}

export default useDataEntryState;
