
import React from 'react';
import { useParams } from 'react-router-dom';
import { useEntryForm } from '@/hooks/useEntryForm';
import { useEntryValidation } from '@/hooks/useEntryValidation';
import { EntryForm } from '@/components/dataEntry/EntryForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

export const DataEntryPage = () => {
  const { schoolId, categoryId } = useParams<{ schoolId: string; categoryId: string }>();
  const { t } = useLanguage();
  
  const {
    formData,
    isLoading,
    isSaving,
    error,
    updateEntry,
    saveEntries,
    submitEntries
  } = useEntryForm({
    schoolId: schoolId!,
    categoryId: categoryId!
  });

  const { validation, validateAllFields } = useEntryValidation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t('dataEntry')}</h1>
        <div className="space-x-4">
          <Button 
            variant="outline" 
            onClick={saveEntries}
            disabled={isSaving || !formData.isModified}
          >
            {isSaving ? t('saving') : t('save')}
          </Button>
          <Button
            onClick={async () => {
              const isValid = validateAllFields(formData.entries);
              if (isValid) {
                await submitEntries();
              }
            }}
            disabled={isSaving || !formData.isModified}
          >
            {t('submit')}
          </Button>
        </div>
      </div>

      {validation.errors && Object.keys(validation.errors).length > 0 && (
        <Alert variant="destructive">
          <AlertDescription>
            {t('pleaseFixValidationErrors')}
          </AlertDescription>
        </Alert>
      )}

      <EntryForm
        category={formData.category}
        entries={formData.entries}
        onChange={updateEntry}
        disabled={isSaving}
      />
    </div>
  );
};
