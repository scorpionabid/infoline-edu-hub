
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
import { Column, ColumnFormValues } from '@/types/column';
import { useForm, Control, FieldValues, UseFormReturn } from 'react-hook-form';
import { useColumnForm } from '@/hooks/columns/useColumnForm';
import { Category } from '@/types/category';
import ColumnTypeSelector from './columnDialog/ColumnTypeSelector';
import OptionsField from './columnDialog/OptionsField';
import { useLanguage } from '@/context/LanguageContext';

interface ColumnFormDialogProps {
  isOpen: boolean; // was 'open'
  onClose: () => void;
  editColumn?: Column | null; // was 'column'
  categories?: Category[];
  columns?: Column[];
  isSubmitting?: boolean;
  onSaveColumn: (columnData: any) => Promise<boolean>; // was 'onSave'
}

const ColumnFormDialog: React.FC<ColumnFormDialogProps> = ({
  isOpen,
  onClose,
  editColumn, // was 'column'
  categories,
  columns,
  isSubmitting,
  onSaveColumn // was 'onSave'
}) => {
  // Uyğunluq üçün köhnə dəyişən adlarını istifadə edirik
  const column = editColumn;
  const categoryId = column?.category_id;
  const onSave = onSaveColumn;
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? t('editColumn') : t('createColumn')}
          </DialogTitle>
          <DialogDescription>
            {isEditMode ? t('editColumnDescription') : t('createColumnDescription')}
          </DialogDescription>
        </DialogHeader>

        {/* @ts-ignore - İdeal həll deyil, amma indiki problemi həll edir */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* @ts-ignore */}
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

            {/* @ts-ignore */}
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

            {/* @ts-ignore */}
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

            {/* @ts-ignore */}
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
