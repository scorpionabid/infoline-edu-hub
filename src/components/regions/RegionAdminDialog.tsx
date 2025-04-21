import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAssignRegionAdmin } from '@/hooks/useAssignRegionAdmin';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Admin təyin etmək üçün schema
const adminSchema = z.object({
  adminName: z.string().min(2, {
    message: "Admin adı ən azı 2 simvol olmalıdır.",
  }),
  adminEmail: z.string().email({
    message: "Düzgün email formatı daxil edin.",
  }),
  adminPassword: z.string().min(6, {
    message: "Şifrə ən azı 6 simvol olmalıdır.",
  }),
});

type AdminSchemaType = z.infer<typeof adminSchema>;

interface RegionAdminDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  region: Region | null;
  onSuccess?: () => void;
}

export const RegionAdminDialog: React.FC<RegionAdminDialogProps> = ({ 
  open, 
  setOpen, 
  region,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { assignAdmin, loading } = useAssignRegionAdmin();
  const [error, setError] = React.useState<string | null>(null);
  
  const form = useForm<AdminSchemaType>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    },
  });

  React.useEffect(() => {
    // Dialog açıldığında xəta mesajlarını sıfırla
    if (open) {
      setError(null);
      form.reset({
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });
    }
  }, [form, open]);

  const handleFormSubmit = async (values: AdminSchemaType) => {
    if (!region) {
      setError('Region mövcud deyil');
      return;
    }
    
    try {
      setError(null);
      
      // Admin təyin etmək üçün hook-u çağırırıq
      const result = await assignAdmin({
        regionId: region.id,
        adminName: values.adminName,
        adminEmail: values.adminEmail,
        adminPassword: values.adminPassword,
      });
      
      if (result.success) {
        setOpen(false);
        if (onSuccess) {
          onSuccess();
        }
      } else if (result.error) {
        setError(result.error);
      }
    } catch (error: any) {
      console.error('Form submit xətası:', error);
      setError(error.message || 'Admin təyin edilərkən xəta baş verdi');
    }
  };

  if (!region) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('assignRegionAdmin') || 'Region admini təyin et'}</DialogTitle>
          <DialogDescription>
            {t("assignRegionAdminDesc") || `"${region.name}" regionu üçün admin təyin edin`}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="adminName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("adminName") || 'Admin adı'}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("adminName") || 'Admin adı'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("adminEmail") || 'Admin email'}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("adminEmail") || 'Admin email'} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adminPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("adminPassword") || 'Admin şifrəsi'}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder={t("adminPassword") || 'Admin şifrəsi'} 
                      {...field} 
                    />
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
                disabled={loading}
              >
                {t("cancel") || 'Ləğv et'}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("loading") || 'Yüklənir...'}
                  </>
                ) : (
                  t("assignAdmin") || 'Admin təyin et'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
