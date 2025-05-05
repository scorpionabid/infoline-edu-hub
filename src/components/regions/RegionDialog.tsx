
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useLanguage } from '@/context/LanguageContext';
import { EnhancedRegion } from '@/hooks/useRegionsStore';

// Form şeması
const regionFormSchema = z.object({
  name: z.string().min(3, 'Ad minimum 3 hərf olmalıdır').max(50, 'Ad maksimum 50 hərf ola bilər'),
  description: z.string().optional(),
  status: z.string().min(1, 'Status seçilməlidir'),
  addAdmin: z.boolean().optional()
});

type RegionFormValues = z.infer<typeof regionFormSchema>;

export interface RegionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRegion: EnhancedRegion | null;
  onSubmit: (values: RegionFormValues) => Promise<void>;
}

export const RegionDialog: React.FC<RegionDialogProps> = ({
  open,
  setOpen,
  selectedRegion,
  onSubmit
}) => {
  const { t } = useLanguage();

  // React Hook Form ilə form state-ni idarə edirik
  const form = useForm<RegionFormValues>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: {
      name: selectedRegion?.name || '',
      description: selectedRegion?.description || '',
      status: selectedRegion?.status || 'active',
      addAdmin: false
    }
  });

  // Selected region dəyişdikdə form dəyərlərini yeniləyirik
  React.useEffect(() => {
    if (selectedRegion) {
      form.reset({
        name: selectedRegion.name,
        description: selectedRegion.description || '',
        status: selectedRegion.status,
        addAdmin: false
      });
    } else {
      form.reset({
        name: '',
        description: '',
        status: 'active',
        addAdmin: false
      });
    }
  }, [selectedRegion, form]);

  const handleSubmit = async (values: RegionFormValues) => {
    await onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {selectedRegion ? t('editRegion') : t('createRegion')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('regionName')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('enterRegionName')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('description')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t('enterRegionDescription')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('status')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectStatus')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">{t('statusActive')}</SelectItem>
                      <SelectItem value="inactive">{t('statusInactive')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!selectedRegion && (
              <FormField
                control={form.control}
                name="addAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('addRegionAdmin')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="mr-2"
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
              >
                {selectedRegion ? t('save') : t('create')}
                {form.formState.isSubmitting && (
                  <span className="ml-2 animate-spin">⏳</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RegionDialog;
