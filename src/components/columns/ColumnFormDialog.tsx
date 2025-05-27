
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useLanguage } from '@/context/LanguageContext';
import { Category } from '@/types/category';
import { Column, ColumnType } from '@/types/column';
import BasicColumnFields from './columnDialog/BasicColumnFields';
import ColumnTypeSelector from './columnDialog/ColumnTypeSelector';
import OptionsField from './columnDialog/OptionsField';
import ValidationFields from './columnDialog/ValidationFields';

interface ColumnFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  column?: Column;
  categories: Category[];
}

const columnSchema = z.object({
  name: z.string().min(1, 'Sütun adı tələb olunur'),
  type: z.string().min(1, 'Tip tələb olunur'),
  category_id: z.string().min(1, 'Kateqoriya tələb olunur'),
  description: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional()
  }).optional()
});

type ColumnFormValues = z.infer<typeof columnSchema>;

const ColumnFormDialog: React.FC<ColumnFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  column,
  categories
}) => {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = React.useState<ColumnType>('text');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      name: column?.name || '',
      type: column?.type || 'text',
      category_id: column?.category_id || '',
      description: column?.description || '',
      required: column?.required || false,
      options: column?.options || [],
      validation: column?.validation || {}
    }
  });

  const { control, handleSubmit, watch, formState: { errors }, reset } = form;

  React.useEffect(() => {
    if (column) {
      reset({
        name: column.name,
        type: column.type,
        category_id: column.category_id,
        description: column.description || '',
        required: column.required || false,
        options: column.options || [],
        validation: column.validation || {}
      });
      setSelectedType(column.type as ColumnType);
    }
  }, [column, reset]);

  const handleFormSubmit = async (data: ColumnFormValues) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
      onClose();
      reset();
    } catch (error) {
      console.error('Column form submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTypeChange = (type: ColumnType) => {
    setSelectedType(type);
    form.setValue('type', type);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {column ? t('editColumn') : t('addColumn')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <BasicColumnFields
              form={form}
              control={control}
              errors={errors}
              watch={watch}
              categories={categories}
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
              isEditMode={!!column}
            />

            <ColumnTypeSelector
              selectedType={selectedType}
              onTypeChange={handleTypeChange}
            />

            {(selectedType === 'select' || selectedType === 'radio') && (
              <OptionsField control={control} />
            )}

            {(selectedType === 'number' || selectedType === 'text') && (
              <ValidationFields control={control} type={selectedType} />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('saving') : (column ? t('update') : t('create'))}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ColumnFormDialog;
