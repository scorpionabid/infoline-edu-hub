
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
import { useCreateRegionAdmin } from '@/hooks/useCreateRegionAdmin';
import { AlertCircle, Loader2, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

const statusOptions = [
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
  { value: 'blocked', label: 'blocked' },
];

// İki fərqli forma sxeması yaradaq
// 1. Yeni region yaratmaq üçün admin daxil olmaqla
const newRegionSchema = z.object({
  name: z.string().min(2, {
    message: "Region adı ən azı 2 simvol olmalıdır.",
  }),
  description: z.string().optional(),
  status: z.string().optional(),
  skipAdminCreation: z.boolean().optional(),
  adminName: z.string().min(2, {
    message: "Admin adı ən azı 2 simvol olmalıdır.",
  }).optional(),
  adminEmail: z.string().email({
    message: "Düzgün email formatı daxil edin.",
  }).optional(),
  adminPassword: z.string().min(6, {
    message: "Şifrə ən azı 6 simvol olmalıdır.",
  }).optional(),
}).refine((data) => {
  // Əgər admin yaratma seçilməyibsə, admin məlumatları lazım deyil
  if (data.skipAdminCreation) return true;
  
  // Əgər admin yaratma seçilibsə, bütün admin məlumatları doldurulmalıdır
  return data.adminName && data.adminEmail && data.adminPassword;
}, {
  message: "Əgər admin yaratma seçilməyibsə, bütün admin məlumatları doldurulmalıdır",
  path: ["adminName"]
});

// 2. Mövcud regionu redaktə etmək üçün admin olmadan
const editRegionSchema = z.object({
  name: z.string().min(2, {
    message: "Region adı ən azı 2 simvol olmalıdır.",
  }),
  description: z.string().optional(),
  status: z.string().optional(),
});

type NewRegionSchemaType = z.infer<typeof newRegionSchema>;
type EditRegionSchemaType = z.infer<typeof editRegionSchema>;

interface RegionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRegion: Region | null;
  onSubmit: (values: any) => Promise<void>;
}

export const RegionDialog: React.FC<RegionDialogProps> = ({ 
  open, 
  setOpen, 
  selectedRegion, 
  onSubmit 
}) => {
  const { t } = useLanguage();
  const { createRegionWithAdmin, loading: createRegionLoading } = useCreateRegionAdmin();
  const [error, setError] = React.useState<string | null>(null);
  const [skipAdminCreation, setSkipAdminCreation] = React.useState<boolean>(false);

  const isEditMode = Boolean(selectedRegion);
  
  // Edit formu için form hook
  const editForm = useForm<EditRegionSchemaType>({
    resolver: zodResolver(editRegionSchema),
    defaultValues: {
      name: selectedRegion?.name || "",
      description: selectedRegion?.description || "",
      status: selectedRegion?.status || "active",
    },
  });
  
  // Create formu için form hook
  const createForm = useForm<NewRegionSchemaType>({
    resolver: zodResolver(newRegionSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "active",
      skipAdminCreation: false,
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    },
  });

  // Seçilen form
  const currentForm = isEditMode ? editForm : createForm;

  React.useEffect(() => {
    // Dialog açıldığında xəta mesajlarını sıfırla
    if (open) {
      setError(null);
      setSkipAdminCreation(false);
      
      if (selectedRegion) {
        editForm.reset({
          name: selectedRegion.name,
          description: selectedRegion.description,
          status: selectedRegion.status || 'active',
        });
      } else {
        createForm.reset({
          name: "",
          description: "",
          status: "active",
          skipAdminCreation: false,
          adminName: "",
          adminEmail: "",
          adminPassword: "",
        });
      }
    }
  }, [selectedRegion, editForm, createForm, open]);

  const handleFormSubmit = async (values: NewRegionSchemaType | EditRegionSchemaType) => {
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
        // Yeni region-admin cütlüyü yarat
        const newValues = values as NewRegionSchemaType;
        
        // Region və admin yaratmaq üçün edge funksiyası çağırılır
        const result = await createRegionWithAdmin({
          regionName: newValues.name,
          regionDescription: newValues.description,
          regionStatus: newValues.status,
          adminName: newValues.skipAdminCreation ? undefined : newValues.adminName,
          adminEmail: newValues.skipAdminCreation ? undefined : newValues.adminEmail,
          adminPassword: newValues.skipAdminCreation ? undefined : newValues.adminPassword,
          skipAdminCreation: newValues.skipAdminCreation
        });
        
        if (result.success) {
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

  const handleSkipAdminChange = (checked: boolean) => {
    setSkipAdminCreation(checked);
    createForm.setValue('skipAdminCreation', checked);
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
        
        {!isEditMode && (
          <Alert variant="info" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Məlumat</AlertTitle>
            <AlertDescription>
              İcazə xətası ilə qarşılaşırsınızsa, "Admin yaratma" seçimini aktiv edin və yalnız region yaratmağı sınayın.
            </AlertDescription>
          </Alert>
        )}
        
        <Form {...currentForm}>
          <form onSubmit={currentForm.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={currentForm.control}
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
              control={currentForm.control}
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
              control={currentForm.control}
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
            
            {/* Yeni region yaratılarkən admin məlumatları */}
            {!isEditMode && (
              <>
                <div className="flex items-center space-x-2 mb-2">
                  <Checkbox 
                    id="skipAdminCreation" 
                    checked={skipAdminCreation}
                    onCheckedChange={handleSkipAdminChange}
                  />
                  <label
                    htmlFor="skipAdminCreation"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t("skipAdminCreation") || "Admin yaratma"}
                  </label>
                </div>
                
                {!skipAdminCreation && (
                  <>
                    <FormField
                      control={createForm.control}
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
                      control={createForm.control}
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
                      control={createForm.control}
                      name="adminPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("adminPassword") || 'Admin şifrəsi'}</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder={t("adminPassword") || 'Admin şifrəsi'} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </>
            )}
            
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
