
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/LanguageContext';
import { EnhancedRegion } from '@/hooks/useRegionsStore';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

// Form şeması
const adminFormSchema = z.object({
  name: z.string().min(3, 'Ad minimum 3 hərf olmalıdır').max(50, 'Ad maksimum 50 hərf ola bilər'),
  email: z.string().email('Düzgün e-poçt daxil edin'),
  password: z.string().min(6, 'Şifrə minimum 6 simvol olmalıdır')
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export interface RegionAdminDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  region: EnhancedRegion | null;
  onSuccess: () => void;
}

export const RegionAdminDialog: React.FC<RegionAdminDialogProps> = ({
  open,
  setOpen,
  region,
  onSuccess
}) => {
  const { t } = useLanguage();

  // React Hook Form ilə form state-ni idarə edirik
  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: ''
    }
  });

  const handleSubmit = async (values: AdminFormValues) => {
    if (!region) {
      toast.error(t('regionNotFound'));
      return;
    }
    
    try {
      // Admin yaratma
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          name: values.name,
          email: values.email,
          password: values.password,
          role: 'regionadmin',
          region_id: region.id
        }
      });
      
      if (error) throw error;
      
      // Regionun admin_email sahəsini yeniləyirik
      await supabase
        .from('regions')
        .update({
          admin_email: values.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', region.id);
      
      toast.success(t('adminCreated'));
      form.reset();
      setOpen(false);
      onSuccess();
      
    } catch (error: any) {
      console.error('Admin yaradılarkən xəta:', error);
      toast.error(error.message || t('errorCreatingAdmin'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {t('createRegionAdmin')}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('adminName')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('enterAdminName')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('adminEmail')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder={t('enterAdminEmail')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('adminPassword')}</FormLabel>
                  <FormControl>
                    <Input {...field} type="password" placeholder={t('enterAdminPassword')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {t('createAdmin')}
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

export default RegionAdminDialog;
