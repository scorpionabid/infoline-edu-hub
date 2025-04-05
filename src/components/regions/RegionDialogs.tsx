
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

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'blocked', label: 'Blocked' },
];

const regionSchema = z.object({
  name: z.string().min(2, {
    message: "Region adı ən azı 2 simvol olmalıdır.",
  }),
  description: z.string().optional(),
  status: z.string().optional(),
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

type RegionSchemaType = z.infer<typeof regionSchema>;

interface RegionDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedRegion: Region | null;
  onSubmit: (values: RegionSchemaType) => Promise<void>;
}

export const RegionDialog: React.FC<RegionDialogProps> = ({ 
  open, 
  setOpen, 
  selectedRegion, 
  onSubmit 
}) => {
  const { t } = useLanguage();
  const { loading: createRegionLoading } = useCreateRegionAdmin();

  const regionForm = useForm<RegionSchemaType>({
    resolver: zodResolver(regionSchema),
    defaultValues: {
      name: selectedRegion?.name || "",
      description: selectedRegion?.description || "",
      status: selectedRegion?.status || "active",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    },
  });

  React.useEffect(() => {
    if (selectedRegion) {
      regionForm.reset({
        name: selectedRegion.name,
        description: selectedRegion.description,
        status: selectedRegion.status || 'active',
        adminName: '',
        adminEmail: selectedRegion.admin_email || '',
        adminPassword: '',
      });
    } else {
      regionForm.reset({
        name: "",
        description: "",
        status: "active",
        adminName: "",
        adminEmail: "",
        adminPassword: "",
      });
    }
  }, [selectedRegion, regionForm]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{selectedRegion ? t('editRegion') : t('addRegion')}</DialogTitle>
          <DialogDescription>
            {t("createEditRegions")}
          </DialogDescription>
        </DialogHeader>
        <Form {...regionForm}>
          <form onSubmit={regionForm.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={regionForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("regionName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("regionName")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={regionForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("description")}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={regionForm.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("status")}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectStatus")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {t(status.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!selectedRegion && (
              <>
                <FormField
                  control={regionForm.control}
                  name="adminName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("adminName")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("adminName")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={regionForm.control}
                  name="adminEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("adminEmail")}</FormLabel>
                      <FormControl>
                        <Input placeholder={t("adminEmail")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={regionForm.control}
                  name="adminPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("adminPassword")}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={t("adminPassword")} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={createRegionLoading}>
                {selectedRegion ? t("updateRegion") : t("createRegion")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
