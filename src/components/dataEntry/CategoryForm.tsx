import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { supabase } from '@/integrations/supabase/client';
import { CategoryWithColumns } from '@/types/category';
import { Column } from '@/types/column';
import { DataEntry } from '@/types/dataEntry';
import { useCategoryStatus } from '@/hooks/categories/useCategoryStatus';
import { validateEntries, convertEntryValuesToDataEntries } from '@/components/dataEntry/utils/formUtils';
import DataEntryForm from './DataEntryForm';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const CategoryForm: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [category, setCategory] = useState<CategoryWithColumns | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [status, setStatus] = useState<string>('');

  // Kateqoriya statusunu idarə etmək üçün hook
  const {
    status: calculatedStatus,
    completionPercentage,
    getStatusBadgeColor,
    getStatusLabel
  } = useCategoryStatus(category || { columns: [] }, { entries });

  // Məlumatları əldə et
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      // Kateqoriyanı əldə et
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('*')
        .eq('id', categoryId)
        .single();

      if (categoryError) {
        throw new Error(categoryError.message);
      }

      if (!categoryData) {
        navigate('/404');
        return;
      }

      const categoryWithColumns: CategoryWithColumns = {
        ...categoryData,
        columns: []
      };
      setCategory(categoryWithColumns);
      setStatus(categoryWithColumns.status || 'draft');

      // Sütunları əldə et
      const { data: columnsData, error: columnsError } = await supabase
        .from('columns')
        .select('*')
        .eq('category_id', categoryId)
        .order('order_index', { ascending: true });

      if (columnsError) {
        throw new Error(columnsError.message);
      }

      setColumns(columnsData as Column[]);
      categoryWithColumns.columns = columnsData as Column[];

      // Mövcud məlumatları əldə et
      const { data: entriesData, error: entriesError } = await supabase
        .from('data_entries')
        .select('*')
        .eq('category_id', categoryId)
        .eq('school_id', user?.school_id);

      if (entriesError) {
        throw new Error(entriesError.message);
      }

      setEntries(entriesData as DataEntry[]);
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: t('errorFetchingData'),
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  }, [categoryId, navigate, t, toast, user?.school_id]);

  // Komponent mount olduqda məlumatları əldə et
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Dəyişiklikləri yadda saxla
  const handleSave = async (newEntries: any[]) => {
    setLoading(true);
    setError('');

    try {
      // Əvvəlcə bütün səhvləri yoxla
      const validatedEntries = validateEntries(newEntries, columns);

      // Əgər səhv varsa, saxla
      if (validatedEntries.some(entry => !entry.isValid)) {
        setEntries(validatedEntries);
        toast({
          variant: 'destructive',
          title: t('errorSavingForm'),
          description: t('pleaseCorrectErrors')
        });
        return;
      }

      // DataEntry obyektlərinə çevir
      const dataToSave = convertEntryValuesToDataEntries(validatedEntries, categoryId || '', user?.school_id || '');

      // Əgər data varsa, update et, yoxsa əlavə et
      for (const entry of dataToSave) {
        const existingEntry = entries.find(e => e.column_id === entry.column_id);

        if (existingEntry) {
          // Update
          const { error: updateError } = await supabase
            .from('data_entries')
            .update({ value: entry.value, updated_at: new Date().toISOString() })
            .eq('column_id', entry.column_id)
            .eq('category_id', categoryId)
            .eq('school_id', user?.school_id);

          if (updateError) {
            throw new Error(updateError.message);
          }
        } else {
          // Insert
          const { error: insertError } = await supabase
            .from('data_entries')
            .insert({
              ...entry,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            throw new Error(insertError.message);
          }
        }
      }

      toast({
        title: t('formSavedSuccessfully'),
        description: t('formDataSaved')
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: t('errorSavingForm'),
        description: err.message
      });
    } finally {
      setLoading(false);
      fetchData();
    }
  };

  // Statusu dəyiş
  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    setError('');

    try {
      // Statusu dəyiş
      const { error: updateError } = await supabase
        .from('categories')
        .update({ status: newStatus })
        .eq('id', categoryId);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setStatus(newStatus);
      toast({
        title: t('statusUpdatedSuccessfully'),
        description: t('categoryStatusUpdated')
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        variant: 'destructive',
        title: t('errorUpdatingStatus'),
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Əgər məlumatlar yüklənirsə
  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Əgər xəta varsa
  if (error) {
    return (
      <div className="flex items-center justify-center h-60 text-red-500">
        {t('errorMessage')}: {error}
      </div>
    );
  }

  // Əgər kateqoriya yoxdursa
  if (!category) {
    return (
      <div className="flex items-center justify-center h-60">
        {t('categoryNotFound')}
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">{category.name}</h1>
      <div className="mb-5">
        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(calculatedStatus)}`}>
          {getStatusLabel(calculatedStatus)} ({completionPercentage}%)
        </span>
      </div>

      <DataEntryForm
        columns={columns}
        initialEntries={entries}
        onSave={handleSave}
        loading={loading}
      />

      <div className="mt-5 flex justify-end gap-2">
        {status === 'pending' ? null : (
          <Button
            variant="secondary"
            onClick={() => handleStatusChange('pending')}
            disabled={loading}
          >
            {t('submitForApproval')}
          </Button>
        )}
        {status === 'approved' ? null : (
          <Button
            onClick={() => handleStatusChange('approved')}
            disabled={loading}
          >
            {t('approve')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default CategoryForm;
