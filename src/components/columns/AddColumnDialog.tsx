import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useLanguage } from '@/context/LanguageContext';

interface AddColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  column?: any;
  onSubmit: (columnData: any) => Promise<boolean>;
  categoryName?: string;
}

const AddColumnDialog: React.FC<AddColumnDialogProps> = ({ open, onOpenChange, categoryId, column, onSubmit, categoryName }) => {
  const { t } = useLanguage();
  
  const formSchema = z.object({
    name: z.string().min(2, {
      message: t('columnNameRequired'),
    }),
    type: z.string(),
    is_required: z.boolean().default(true),
    category_id: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      type: 'text',
      is_required: true,
      category_id: categoryId,
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const result = await onSubmit(values);
    if (result) {
      onOpenChange(false);
    }
  };

  const categoryOptions = [
    { id: '1', name: 'Kateqoriya 1' },
    { id: '2', name: 'Kateqoriya 2' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addColumn')}</DialogTitle>
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('columnType')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectColumnType')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="text">{t('text')}</SelectItem>
                      <SelectItem value="number">{t('number')}</SelectItem>
                      <SelectItem value="select">{t('select')}</SelectItem>
                      <SelectItem value="date">{t('date')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('category')}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={categoryId || field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectCategory')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit">{t('add')}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddColumnDialog;
