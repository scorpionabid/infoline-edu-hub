import { CategoryWithEntries, CategoryEntryData } from '@/types/column';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export const useCategoryEntries = (categoryId: string, schoolId: string) => {
  const [entries, setEntries] = useState<CategoryEntryData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('data_entries')
          .select('*')
          .eq('category_id', categoryId)
          .eq('school_id', schoolId);

        if (error) {
          throw new Error(error.message);
        }

        setEntries(
          data
            ? data.map((entry) => ({
                id: entry.id,
                category_id: entry.category_id,
                column_id: entry.column_id,
                value: entry.value,
                status: entry.status,
              }))
            : []
        );
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId && schoolId) {
      fetchEntries();
    }
  }, [categoryId, schoolId]);

  return { entries, loading, error };
};

export const submitCategoryEntries = async (entries: CategoryEntryData[], status = 'pending') => {
  if (!entries.length) {
    return { data: null, error: { message: 'No entries to submit' } };
  }

  const formattedEntries = entries.map(entry => ({
    column_id: entry.column_id,
    category_id: entry.category_id,
    value: entry.value,
    status,
    id: entry.id // Include ID if exists for updates
  }));

  try {
    const { data, error } = await supabase
      .from('data_entries')
      .upsert(formattedEntries, { onConflict: 'id' })
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return { data, error: null };
  } catch (error: any) {
    return { data: null, error: { message: error.message } };
  }
};

export const useCategoryCompletionRate = (category: CategoryWithEntries) => {
  const [completionRate, setCompletionRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateCompletionRate = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!category?.columns || category.columns.length === 0) {
          setCompletionRate(0);
          return;
        }

        const requiredColumnsCount = category.columns.filter((column) => column.is_required).length;

        if (requiredColumnsCount === 0) {
          setCompletionRate(100);
          return;
        }

        if (!category.entries || category.entries.length === 0) {
          setCompletionRate(0);
          return;
        }

        const validEntriesCount = category.entries.filter((entry) => entry.value !== null && entry.value !== '').length;
        const calculatedRate = (validEntriesCount / requiredColumnsCount) * 100;

        setCompletionRate(calculatedRate);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    calculateCompletionRate();
  }, [category]);

  return { completionRate, loading, error };
};
