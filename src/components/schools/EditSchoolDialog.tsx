
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Region, School, Sector } from '@/types/supabase';

// Form validasiya sxemi
const formSchema = z.object({
  id: z.string().uuid({ message: "ID düzgün formatda deyil" }),
  name: z.string().min(2, { message: "Məktəb adı ən az 2 simvol olmalıdır" }),
  region_id: z.string().uuid({ message: "Region seçilməlidir" }),
  sector_id: z.string().uuid({ message: "Sektor seçilməlidir" }),
  principal_name: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email({ message: "Düzgün email formatı daxil edin" }).optional().or(z.literal('')),
  status: z.enum(["active", "inactive", "blocked"]).default("active"),
});

// Dialog propları
interface EditSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (schoolData: School) => Promise<void>;
  school: School | null;
  regions: Region[];
  sectors: Sector[];
  regionNames: { [key: string]: string };
  sectorNames: { [key: string]: string };
  isSubmitting?: boolean;
}

const EditSchoolDialog: React.FC<EditSchoolDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  school,
  regions,
  sectors,
  regionNames,
  sectorNames,
  isSubmitting = false,
}) => {
  const { t } = useLanguage();
  const [filteredSectors, setFilteredSectors] = React.useState<Sector[]>([]);

  // Form hook
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: school?.id || '',
      name: school?.name || '',
      region_id: school?.region_id || '',
      sector_id: school?.sector_id || '',
      principal_name: school?.principal_name || '',
      address: school?.address || '',
      phone: school?.phone || '',
      email: school?.email || '',
      status: (school?.status as any) || 'active',
    },
  });

  // Məktəb dəyişdikdə formu yenilə
  React.useEffect(() => {
    if (school) {
      form.reset({
        id: school.id,
        name: school.name,
        region_id: school.region_id,
        sector_id: school.sector_id,
        principal_name: school.principal_name || '',
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        status: (school.status as any) || 'active',
      });
    }
  }, [school, form]);

  // Region dəyişdikdə sektorları filtrlə
  React.useEffect(() => {
    const regionId = form.watch('region_id');
    if (regionId) {
      const filtered = sectors.filter(sector => sector.region_id === regionId);
      setFilteredSectors(filtered);
      
      // Əgər sektoru seçilibsə və yeni region üçün mövcud deyilsə, sıfırla
      const currentSectorId = form.watch('sector_id');
      if (currentSectorId && !filtered.some(s => s.id === currentSectorId)) {
        form.setValue('sector_id', '');
      }
    } else {
      setFilteredSectors([]);
      form.setValue('sector_id', '');
    }
  }, [form.watch('region_id'), sectors, form]);

  // Form təqdim edildi funksiyası
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await onSubmit(values as School);
      onClose();
    } catch (error) {
      console.error('Məktəb redaktə etmə xətası:', error);
    }
  };

  if (!school) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{t('editSchool')}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('schoolName')} *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('enterSchoolName')} />
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
                  <FormLabel>{t('region')} *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectRegion')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.id} value={region.id}>
                          {regionNames[region.id] || region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sector_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sector')} *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!form.watch('region_id')}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !form.watch('region_id') 
                            ? t('pleaseSelectRegionFirst') 
                            : t('selectSector')
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredSectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sectorNames[sector.id] || sector.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="principal_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('principal')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('enterPrincipalName')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('address')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('enterAddress')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('phone')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enterPhone')} />
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
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('enterEmail')} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('status')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
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
                      <SelectItem value="blocked">{t('blocked')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button variant="outline" onClick={onClose} type="button">
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  t('save')
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSchoolDialog;
