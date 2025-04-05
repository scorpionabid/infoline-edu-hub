
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Sector } from '@/types/supabase';
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
import { useCreateSector } from '@/hooks/useCreateSector';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRegions } from '@/hooks/useRegions';
import { useAuth } from '@/context/AuthContext';
import { Checkbox } from '@/components/ui/checkbox';

const statusOptions = [
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
  { value: 'blocked', label: 'blocked' },
];

// Sektor yaratmaq üçün schema
const sectorSchema = z.object({
  name: z.string().min(2, {
    message: "Sektor adı ən azı 2 simvol olmalıdır.",
  }),
  description: z.string().optional(),
  region_id: z.string({
    required_error: "Region seçilməlidir",
  }),
  status: z.string().optional(),
  addAdmin: z.boolean().optional().default(false),
});

type SectorSchemaType = z.infer<typeof sectorSchema>;

interface SectorDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedSector: Sector | null;
  onSubmit: (values: any) => Promise<void>;
  onSuccess?: (sector: any) => void;
}

export const SectorDialog: React.FC<SectorDialogProps> = ({ 
  open, 
  setOpen, 
  selectedSector,
  onSubmit,
  onSuccess
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { createSector, loading: createSectorLoading } = useCreateSector();
  const { regions, loading: regionsLoading } = useRegions();
  const [error, setError] = React.useState<string | null>(null);

  const isEditMode = Boolean(selectedSector);
  
  const form = useForm<SectorSchemaType>({
    resolver: zodResolver(sectorSchema),
    defaultValues: {
      name: selectedSector?.name || "",
      description: selectedSector?.description || "",
      region_id: selectedSector?.region_id || user?.regionId || "",
      status: selectedSector?.status || "active",
      addAdmin: false,
    },
  });

  React.useEffect(() => {
    // Dialog açıldığında xəta mesajlarını sıfırla
    if (open) {
      setError(null);
      
      if (selectedSector) {
        form.reset({
          name: selectedSector.name,
          description: selectedSector.description,
          region_id: selectedSector.region_id,
          status: selectedSector.status || 'active',
          addAdmin: false,
        });
      } else {
        form.reset({
          name: "",
          description: "",
          region_id: user?.regionId || "",
          status: "active",
          addAdmin: false,
        });
      }
    }
  }, [selectedSector, form, open, user?.regionId]);

  const handleFormSubmit = async (values: SectorSchemaType) => {
    try {
      setError(null);
      
      if (isEditMode) {
        // Mövcud sektoru redaktə et
        await onSubmit({
          name: values.name,
          description: values.description,
          region_id: values.region_id,
          status: values.status,
          addAdmin: values.addAdmin,
        });
      } else {
        // Yeni sektor yarat
        const result = await createSector({
          name: values.name,
          description: values.description,
          region_id: values.region_id,
          status: values.status,
        });
        
        if (result.success) {
          if (onSuccess && values.addAdmin) {
            onSuccess(result.data.sector);
          } else {
            setOpen(false);
          }
        } else if (result.error) {
          setError(result.error);
        }
      }
    } catch (error: any) {
      console.error('Form submit xətası:', error);
      setError(error.message || 'Sektor işləmi zamanı xəta baş verdi');
    }
  };

  // İstifadəçi regionadmin olduqda, region seçimini bağla
  const isRegionFixed = user?.role === 'regionadmin' && !!user?.regionId;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedSector ? t('editSector') || 'Sektoru düzəlt' : t('addSector') || 'Sektor əlavə et'}</DialogTitle>
          <DialogDescription>
            {t("createEditSectors") || 'Sektor məlumatlarını daxil edin'}
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
                  <FormLabel>{t("sectorName") || 'Sektor adı'}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("sectorName") || 'Sektor adı'} {...field} />
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
              name="region_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("selectRegion") || 'Region seçin'}</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={isRegionFixed || regionsLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectRegion") || 'Region seçin'} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regionsLoading ? (
                        <div className="flex items-center justify-center p-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2">{t('loading') || 'Yüklənir...'}</span>
                        </div>
                      ) : regions.length === 0 ? (
                        <div className="p-2 text-center text-sm text-muted-foreground">
                          {t('noRegionsFound') || 'Region tapılmadı'}
                        </div>
                      ) : (
                        regions.map(region => (
                          <SelectItem key={region.id} value={region.id}>
                            {region.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
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
            
            {!isEditMode && (
              <FormField
                control={form.control}
                name="addAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t("addAdminAfterCreation") || 'Yaratdıqdan sonra admin təyin et'}
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
                disabled={createSectorLoading}
              >
                {t("cancel") || 'Ləğv et'}
              </Button>
              <Button type="submit" disabled={createSectorLoading}>
                {createSectorLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("loading") || 'Yüklənir...'}
                  </>
                ) : (
                  selectedSector ? t("updateSector") || 'Sektoru yenilə' : t("createSector") || 'Sektor yarat'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SectorDialog;
