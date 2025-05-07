
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "../ui/checkbox";
import { Loader2 } from "lucide-react";
import { useLanguageSafe } from "@/context/LanguageContext";
import { useRegions } from "@/hooks/regions/useRegions";
import { Region, Sector } from "@/types/school";
import { useToast } from "../ui/use-toast";
import { EnhancedSector } from '@/hooks/useSectorsStore';

// Form validasiya sxemi
const sectorSchema = z.object({
  name: z.string().min(2, "Ad ən azı 2 simvol olmalıdır").max(100, "Ad maksimum 100 simvol ola bilər"),
  description: z.string().optional(),
  region_id: z.string().min(1, "Region seçilməlidir"),
  status: z.string().optional(),
  addAdmin: z.boolean().optional()
});

type SectorFormValues = z.infer<typeof sectorSchema>;

interface SectorDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (values: SectorFormValues) => void;
  sector?: EnhancedSector | null;
  isDeleteDialog?: boolean;
}

// Əsas SectorDialog komponenti
const SectorDialog: React.FC<SectorDialogProps> = ({
  open,
  onClose,
  onSubmit,
  sector,
  isDeleteDialog = false
}) => {
  const { t } = useLanguageSafe();
  const { regions, loading: regionsLoading } = useRegions();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addAdmin, setAddAdmin] = useState(false);

  const form = useForm<SectorFormValues>({
    resolver: zodResolver(sectorSchema),
    defaultValues: {
      name: sector?.name || "",
      description: sector?.description || "",
      region_id: sector?.region_id || "",
      status: sector?.status || "active",
      addAdmin: false
    }
  });

  useEffect(() => {
    if (sector) {
      form.reset({
        name: sector.name || "",
        description: sector.description || "",
        region_id: sector.region_id || "",
        status: sector.status || "active",
        addAdmin: false
      });
    } else {
      form.reset({
        name: "",
        description: "",
        region_id: "",
        status: "active",
        addAdmin: false
      });
    }
  }, [sector, form]);

  const handleSubmit = async (values: SectorFormValues) => {
    if (isDeleteDialog) {
      handleDelete();
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ ...values, addAdmin });
      }
      form.reset();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: error.message || t('unexpectedError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!sector) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          name: sector.name,
          region_id: sector.region_id,
          status: "deleted"
        });
      }
      toast({
        title: t('sectorDeleted'),
        description: t('sectorDeletedDesc')
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('error'),
        description: error.message || t('unexpectedError'),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dialogTitle = isDeleteDialog
    ? t('deleteSector')
    : sector
      ? t('editSector')
      : t('createSector');

  return (
    <Dialog open={open} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        {isDeleteDialog ? (
          <div className="py-4">
            <p>{t('deleteSectorConfirmation')}</p>
            <p className="font-semibold mt-2">{sector?.name}</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('name')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('enterSectorName')} {...field} />
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
                      <Textarea 
                        placeholder={t('enterSectorDescription')} 
                        {...field} 
                        value={field.value || ''}
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
                    <FormLabel>{t('region')}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectRegion')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {regionsLoading ? (
                          <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            {t('loading')}
                          </div>
                        ) : (
                          regions.map((region: Region) => (
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
                    <FormLabel>{t('status')}</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('selectStatus')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">{t('active')}</SelectItem>
                        <SelectItem value="inactive">{t('inactive')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!sector && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="addAdmin"
                    checked={addAdmin}
                    onCheckedChange={(checked: boolean) => setAddAdmin(checked)}
                  />
                  <label
                    htmlFor="addAdmin"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {t('addAdminAfterCreation')}
                  </label>
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  {t('cancel')}
                </Button>
                <Button type="submit" disabled={isSubmitting || (isDeleteDialog ? false : !form.formState.isDirty)}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isDeleteDialog
                    ? t('delete')
                    : sector
                      ? t('update')
                      : t('create')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}

        {isDeleteDialog && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('cancel')}
            </Button>
            <Button 
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('delete')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export { SectorDialog };
