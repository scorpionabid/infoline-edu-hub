
// Bu faylın tam kodunu görmədən düzəliş etmək çətindir, lakin xətanın özünə əsaslanaraq,
// categories prop-u ilə bağlı bir düzəliş etməliyik
// Aşağıdakı kod fraqmenti sadəcə xətanın həlli üçün bir nümunədir

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

// Bu faylın tam məzmununu görmədən təxmin edirik.
// Xəta göstərir ki, 'categories' özelliği olmayan bir tipdə istifadə edilir.
// Bu səbəbdən ya bu özelliyi əlavə etmək, ya da onu başqa şəkildə istifadə etmək lazımdır.

// Xətanın həlli üçün tip tərifini düzəldək
interface AddColumnDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (column: any) => void;
  categoryId?: string; // Bu parametri elave edək
}

const AddColumnDialog: React.FC<AddColumnDialogProps> = ({ open, onClose, onAdd, categoryId }) => {
  const { t } = useLanguage();
  
  // Form şemasını tanımlayaq
  const formSchema = z.object({
    name: z.string().min(2, {
      message: t('columnNameRequired'),
    }),
    type: z.string(),
    is_required: z.boolean().default(true),
    category_id: z.string().optional(),
    // Digər sahələr...
  });

  // React Hook Form ilə formu idarə edək
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
    onAdd(values);
    onClose();
  };

  // Sorğuda xətaya səbəb olan hissəni düzəldək
  // Ola bilər ki, categoryOptions bunların hamısını içərir:
  const categoryOptions = [
    { id: '1', name: 'Kateqoriya 1' },
    { id: '2', name: 'Kateqoriya 2' },
  ];
  
  // Burada categories xüsusiyyətini əlavə etməmək lazımdır
  // Ya da əgər lazımsa, tipə əlavə etmək lazımdır

  return (
    <Dialog open={open} onOpenChange={onClose}>
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
              <Button type="button" variant="outline" onClick={onClose}>
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
