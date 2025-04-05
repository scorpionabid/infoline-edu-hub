
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/supabase';
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateRegion } from '@/hooks/useCreateRegion';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const statusOptions = [
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
  { value: 'blocked', label: 'blocked' },
];

// Region yaratmaq üçün schema
const regionSchema = z.object({
  name: z.string().min(2, {
    message: "Region adı ən azı 2 simvol olmalıdır.",
  }),
  description: z.string().optional(),
  status: z.string().optional(),
});

type RegionSchemaType = z.infer<typeof regionSchema>;

interface RegionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRegion: Region | null;
  onSubmit: (values: any) => Promise<void>;
  onSuccess?: (region: any) => void;
}

export const RegionDialog: React.FC<RegionDialogProps> = ({ 
  open, 
  setOpen, 
  selectedRegion,
  onSubmit,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { createRegion, loading: createRegionLoading } = useCreateRegion();
  const [error, setError] = React.useState<string | null>(null);

  const isEditMode = Boolean(selectedRegion);
  
  const form = useForm<RegionSchemaType>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      name: selectedRegion?.name || "",
      description: selectedRegion?.description || "",
      status: selectedRegion?.status || "active",
    },
  });

  React.useEffect(() => {
    // Dialog açıldığında xəta mesajlarını sıfırla
    if (open) {
      setError(null);
      
      if (selectedRegion) {
        form.reset({
          name: selectedRegion.name,
          description: selectedRegion.description,
          status: selectedRegion.status || 'active',
        });
      } else {
        form.reset({
          name: "",
          description: "",
          status: "active",
        });
      }
    }
  }, [selectedRegion, form, open]);

  const handleFormSubmit = async (values: RegionSchemaType) => {
    try {
      setError(null);
      
      if (isEditMode) {
        // Mövcud regionu redaktə et
        await onSubmit({
          name: values.name,
          description: values.description,
          status: values.status,
        });
      } else {
        // Yeni region yarat
        const result = await createRegion({
          name: values.name,
          description: values.description,
          status: values.status,
        });
        
        if (result.success) {
          if (onSuccess) {
            onSuccess(result.data.region);
          }
          setOpen(false);
        } else if (result.error) {
          setError(result.error);
        }
      }
    } catch (error: any) {
      console.error('Form submit xətası:', error);
      setError(error.message || 'Region işləmi zamanı xəta baş verdi');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedRegion ? t('editRegion') || 'Regionu düzəlt' : t('addRegion') || 'Region əlavə et'}</DialogTitle>
          <DialogDescription>
            {t("createEditRegions") || 'Region məlumatlarını daxil edin'}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("regionName") || 'Region adı'}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("regionName") || 'Region adı'} {...field} />
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
                  <FormLabel>{t("description") || 'Təsvir'}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("description") || 'Təsvir'}
                      className="resize-none"
                      {...field}
                    />
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
                  <FormLabel>{t("status") || 'Status'}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectStatus") || 'Status seçin'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {t(status.label) || status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                disabled={createRegionLoading}
              >
                {t("cancel") || 'Ləğv et'}
              </Button>
              <Button type="submit" disabled={createRegionLoading}>
                {createRegionLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("loading") || 'Yüklənir...'}
                  </>
                ) : (
                  selectedRegion ? t("updateRegion") || 'Regionu yenilə' : t("createRegion") || 'Region yarat'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
