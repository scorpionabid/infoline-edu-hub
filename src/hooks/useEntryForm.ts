
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { EntryFormData } from '@/types/entry';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { DataEntry } from '@/types/dataEntry';

interface UseEntryFormProps {
  schoolId: string;
  categoryId: string;
  onComplete?: () => void;
}

export const useEntryForm = ({ schoolId, categoryId, onComplete }: UseEntryFormProps) => {
  const [formData, setFormData] = useState<EntryFormData>({
    schoolId,
    categoryId,
    entries: [],
    isModified: false,
    status: 'draft'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();
  const { t } = useLanguage();

  const updateEntry = useCallback((columnId: string, value: string) => {
    setFormData(prev => {
      const entries = [...prev.entries];
      const existingIndex = entries.findIndex(e => e.column_id === columnId);
      
      if (existingIndex >= 0) {
        entries[existingIndex] = {
          ...entries[existingIndex],
          value
        };
      } else {
        entries.push({
          column_id: columnId,
          school_id: schoolId,
          category_id: categoryId,
          value,
          status: 'pending'
        });
      }

      return {
        ...prev,
        entries,
        isModified: true
      };
    });
  }, [schoolId, categoryId]);

  const saveEntries = useCallback(async (): Promise<boolean> => {
    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase
        .from('data_entries')
        .upsert(formData.entries.map(entry => ({
          ...entry,
          status: 'draft'
        })));

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        isModified: false,
        lastSaved: new Date().toISOString()
      }));

      toast({
        title: t('success'),
        description: t('dataSavedSuccessfully')
      });

      return true;
    } catch (err: any) {
      console.error('Error saving entries:', err);
      setError(err.message);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('errorSavingData')
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [formData.entries, t, toast]);

  const submitEntries = useCallback(async (): Promise<boolean> => {
    const saved = await saveEntries();
    if (!saved) return false;

    try {
      const { error } = await supabase
        .from('data_entries')
        .update({ status: 'pending' })
        .in('id', formData.entries.map(e => e.id as string));

      if (error) throw error;

      setFormData(prev => ({
        ...prev,
        status: 'pending'
      }));

      toast({
        title: t('success'),
        description: t('dataSubmittedSuccessfully')
      });

      if (onComplete) {
        onComplete();
      }

      return true;
    } catch (err: any) {
      console.error('Error submitting entries:', err);
      setError(err.message);
      toast({
        variant: 'destructive',
        title: t('error'),
        description: t('errorSubmittingData')
      });
      return false;
    }
  }, [saveEntries, formData.entries, t, toast, onComplete]);

  return {
    formData,
    isLoading,
    isSaving,
    error,
    updateEntry,
    saveEntries,
    submitEntries
  };
};
