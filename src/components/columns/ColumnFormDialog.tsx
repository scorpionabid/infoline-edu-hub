
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useColumnForm } from '@/hooks/columns/useColumnForm';
import { Column, ColumnFormValues } from '@/types/column';
import { useLanguage } from '@/context/LanguageContext';
import ColumnBasicFields from './columnDialog/ColumnBasicFields';
import ColumnTypeSelector from './columnDialog/ColumnTypeSelector';
import ColumnOptionsManager from './columnDialog/ColumnOptionsManager';
import ColumnAdvancedSettings from './columnDialog/ColumnAdvancedSettings';

export interface ColumnFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  column?: Column | null;
  categoryId?: string;
  onSave?: (data: ColumnFormValues) => Promise<boolean>;
}

const ColumnFormDialog: React.FC<ColumnFormDialogProps> = ({
  isOpen,
  onClose,
  column,
  categoryId,
  onSave
}) => {
  const { t } = useLanguage();
  
  const {
    form,
    isLoading,
    selectedType,
    onTypeChange,
    options,
    addOption,
    removeOption,
    newOption,
    setNewOption,
    onSubmit,
    isEditMode
  } = useColumnForm({ column, categoryId, onSave });

  const handleNewOptionChange = (field: 'value' | 'label', value: string) => {
    setNewOption(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (data: ColumnFormValues) => {
    const success = await onSubmit(data);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('editColumn') : t('createColumn')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <ColumnBasicFields control={form.control} />
            
            <ColumnTypeSelector 
              control={form.control}
              selectedType={selectedType}
              onTypeChange={onTypeChange}
            />

            {(['select', 'radio', 'checkbox'].includes(selectedType)) && (
              <ColumnOptionsManager
                options={options}
                newOption={newOption}
                onNewOptionChange={handleNewOptionChange}
                onAddOption={addOption}
                onRemoveOption={removeOption}
              />
            )}

            <ColumnAdvancedSettings control={form.control} />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('saving') : (isEditMode ? t('update') : t('create'))}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnFormDialog;
