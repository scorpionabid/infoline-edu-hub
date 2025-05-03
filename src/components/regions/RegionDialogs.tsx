
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRegions } from '@/hooks/regions/useRegions';
import { Region, RegionFormData } from '@/types/region';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { RegionAdminDialog } from './RegionAdminDialog';

const regionFormSchema = z.object({
  name: z.string().min(2, { message: "Region adı ən azı 2 simvol olmalıdır" }),
  description: z.string().optional(),
});

interface AddRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddRegionDialog: React.FC<AddRegionDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useLanguage();
  const { addRegion } = useRegions();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegionFormData>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
    },
  });

  const onSubmit = async (values: RegionFormData) => {
    setIsSubmitting(true);
    
    try {
      const result = await addRegion({
        ...values,
        created_at: new Date().toISOString(),
        status: 'active',
      });
      
      if (result.success) {
        toast({
          title: "Uğurlu!",
          description: "Region uğurla əlavə edildi",
        });
        form.reset();
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Xəta!",
          description: result.error || "Region əlavə edilərkən xəta baş verdi",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Xəta!",
        description: error.message || "Region əlavə edilərkən xəta baş verdi",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Region</DialogTitle>
          <DialogDescription>
            Region məlumatlarını daxil edin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Region adını daxil edin" {...field} />
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
                  <FormLabel>Təsviri</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Region haqqında qısa məlumat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Ləğv et
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Əlavə edilir..." : "Əlavə et"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

interface EditRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: Region | null;
}

export const EditRegionDialog: React.FC<EditRegionDialogProps> = ({ 
  open, 
  onOpenChange, 
  region 
}) => {
  const { t } = useLanguage();
  const { updateRegion } = useRegions();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegionFormData>({
    resolver: zodResolver(regionFormSchema),
    defaultValues: {
      name: region?.name || '',
      description: region?.description || '',
      status: region?.status || 'active',
    },
  });

  // Update form when region changes
  React.useEffect(() => {
    if (region) {
      form.reset({
        name: region.name || '',
        description: region.description || '',
        status: region.status || 'active',
      });
    }
  }, [region, form]);

  const onSubmit = async (values: RegionFormData) => {
    if (!region) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await updateRegion(region.id, {
        ...values,
        updated_at: new Date().toISOString(),
      });
      
      if (result.success) {
        toast({
          title: "Uğurlu!",
          description: "Region uğurla yeniləndi",
        });
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Xəta!",
          description: result.error || "Region yenilənərkən xəta baş verdi",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Xəta!",
        description: error.message || "Region yenilənərkən xəta baş verdi",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Region redaktə et</DialogTitle>
          <DialogDescription>
            Region məlumatlarını redaktə edin.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Region adını daxil edin" {...field} />
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
                  <FormLabel>Təsviri</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Region haqqında qısa məlumat" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Ləğv et
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Yadda saxlanılır..." : "Yadda saxla"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: Region | null;
}

export const DeleteRegionDialog: React.FC<DeleteRegionDialogProps> = ({
  open,
  onOpenChange,
  region,
}) => {
  const { t } = useLanguage();
  const { deleteRegion } = useRegions();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!region) return;
    
    setIsDeleting(true);
    
    try {
      const result = await deleteRegion(region.id);
      
      if (result.success) {
        toast({
          title: "Uğurlu!",
          description: "Region uğurla silindi",
        });
        onOpenChange(false);
      } else {
        toast({
          variant: "destructive",
          title: "Xəta!",
          description: result.error || "Region silinərkən xəta baş verdi",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Xəta!",
        description: error.message || "Region silinərkən xəta baş verdi",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Regionu sil</DialogTitle>
          <DialogDescription>
            Bu əməliyyat geri qaytarıla bilməz. "{region?.name}" regionunu silmək istədiyinizə əminsiniz?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Ləğv et
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? "Silinir..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface AssignAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: Region | null;
}

export const AssignAdminDialog: React.FC<AssignAdminDialogProps> = ({
  open,
  onOpenChange,
  region,
}) => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isRegionAdminOpen, setIsRegionAdminOpen] = useState(false);

  const handleOpenRegionAdminDialog = () => {
    setIsRegionAdminOpen(true);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin təyin et</DialogTitle>
            <DialogDescription>
              "{region?.name}" regionu üçün admin təyin edin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {region?.admin_email ? (
              <div className="space-y-2">
                <p className="text-sm">Hazırki admin: <span className="font-medium">{region.admin_email}</span></p>
              </div>
            ) : (
              <p className="text-sm text-amber-500">Bu region üçün admin təyin edilməyib.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => onOpenChange(false)}>
              Ləğv et
            </Button>
            <Button variant="default" onClick={handleOpenRegionAdminDialog}>
              {region?.admin_email ? "Admini dəyiş" : "Admin təyin et"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {region && (
        <RegionAdminDialog 
          isOpen={isRegionAdminOpen}
          onClose={() => setIsRegionAdminOpen(false)}
          regionId={region.id}
        />
      )}
    </>
  );
};
