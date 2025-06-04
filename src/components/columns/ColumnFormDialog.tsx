
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Column, ColumnFormValues, ColumnOption } from '@/types/column';
import ColumnBasicFields from './columnDialog/ColumnBasicFields';
import ColumnTypeSelector from './columnDialog/ColumnTypeSelector';
import ColumnAdvancedSettings from './columnDialog/ColumnAdvancedSettings';
import ColumnOptionsManager from './columnDialog/ColumnOptionsManager';
import { useColumnForm } from '@/hooks/columns/useColumnForm';

interface ColumnFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column?: Column;
  categoryId: string;
  onSave?: (column: ColumnFormValues) => void;
}

const ColumnFormDialog: React.FC<ColumnFormDialogProps> = ({
  open,
  onOpenChange,
  column,
  categoryId,
  onSave
}) => {
  const { t } = useLanguage();
  const [options, setOptions] = useState<ColumnOption[]>(
    column?.options || []
  );
  const [newOption, setNewOption] = useState({ value: '', label: '' });

  const {
    form,
    isLoading,
    onSubmit
  } = useColumnForm({
    column,
    categoryId,
    onSuccess: () => {
      onOpenChange(false);
      if (onSave) {
        onSave(form.getValues());
      }
    }
  });

  const handleNewOptionChange = (field: 'value' | 'label', value: string) => {
    setNewOption(prev => ({ ...prev, [field]: value }));
  };

  const handleAddOption = () => {
    if (newOption.value && newOption.label) {
      const updatedOptions = [...options, newOption];
      setOptions(updatedOptions);
      setNewOption({ value: '', label: '' });
      form.setValue('options', updatedOptions);
    }
  };

  const handleRemoveOption = (index: number) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);
    form.setValue('options', updatedOptions);
  };

  const selectedType = form.watch('type');
  const showOptions = ['select', 'radio', 'checkbox'].includes(selectedType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {column ? t('editColumn') : t('addColumn')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <ColumnBasicFields control={form.control} />
          
          <ColumnTypeSelector control={form.control} />
          
          {showOptions && (
            <ColumnOptionsManager
              options={options}
              newOption={newOption}
              onNewOptionChange={handleNewOptionChange}
              onAddOption={handleAddOption}
              onRemoveOption={handleRemoveOption}
            />
          )}
          
          <ColumnAdvancedSettings control={form.control} />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('saving') : (column ? t('update') : t('create'))}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnFormDialog;
