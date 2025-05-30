
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Column } from '@/types/column';
import { useColumnForm } from '@/hooks/columns/useColumnForm';
import ColumnTypeSelector from './columnDialog/ColumnTypeSelector';
import OptionsField from './columnDialog/OptionsField';
import { useLanguage } from '@/context/LanguageContext';

interface ColumnFormDialogProps {
  open: boolean;
  onClose: () => void;
  column?: Column | null;
  categoryId?: string;
  onSave: (columnData: any) => Promise<boolean>;
}

const ColumnFormDialog: React.FC<ColumnFormDialogProps> = ({
  open,
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

  const handleSubmit = async (data: any) => {
    const success = await onSubmit(data);
    if (success) {
      onClose();
    }
  };

  const showOptionsField = ['select', 'radio', 'checkbox', 'multiselect'].includes(selectedType);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('editColumn') : t('createColumn')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t('editColumnDescription') : t('createColumnDescription')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('columnName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('enterColumnName')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <ColumnTypeSelector 
              control={form.control}
              selectedType={selectedType}
              onTypeChange={onTypeChange}
            />

            {showOptionsField && (
              <OptionsField
                control={form.control}
                options={options}
                newOption={newOption}
                setNewOption={setNewOption}
                addOption={addOption}
                removeOption={(id: string) => removeOption(id)}
              />
            )}

            <FormField
              control={form.control}
              name="placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('placeholder')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('enterPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="help_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('helpText')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('enterHelpText')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t('required')}</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? t('saving') : (isEditMode ? t('update') : t('create'))}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnFormDialog;
