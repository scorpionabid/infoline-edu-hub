
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { School, Region, Sector, SchoolFormData } from '@/types/school';

const schoolSchema = z.object({
  name: z.string().min(1, 'Məktəb adı tələb olunur'),
  address: z.string().optional(),
  email: z.string().email('Düzgün email formatı daxil edin').optional().or(z.literal('')),
  phone: z.string().optional(),
  principal_name: z.string().optional(),
  student_count: z.number().min(0).optional(),
  teacher_count: z.number().min(0).optional(),
  type: z.string().optional(),
  language: z.string().optional(),
  region_id: z.string().min(1, 'Region seçimi tələb olunur'),
  sector_id: z.string().min(1, 'Sektor seçimi tələb olunur'),
});

export interface SchoolFormProps {
  school?: Partial<School>;
  regions: Region[];
  sectors: Sector[];
  regionNames?: Record<string, string>;
  sectorNames?: Record<string, string>;
  onSubmit: (data: SchoolFormData) => Promise<void>;
  isSubmitting?: boolean;
}

const SchoolForm: React.FC<SchoolFormProps> = ({
  school,
  regions,
  sectors,
  regionNames = {},
  sectorNames = {},
  onSubmit,
  isSubmitting = false
}) => {
  const { t } = useLanguage();
  
  const form = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: school?.name || '',
      address: school?.address || '',
      email: school?.email || '',
      phone: school?.phone || '',
      principal_name: school?.principal_name || school?.principalName || '',
      student_count: school?.student_count || school?.studentCount || undefined,
      teacher_count: school?.teacher_count || school?.teacherCount || undefined,
      type: school?.type || '',
      language: school?.language || 'az',
      region_id: school?.region_id || school?.regionId || '',
      sector_id: school?.sector_id || school?.sectorId || '',
    }
  });

  const watchRegionId = form.watch('region_id');
  const filteredSectors = sectors.filter(sector => 
    sector.region_id === watchRegionId || sector.regionId === watchRegionId
  );

  // Reset sector when region changes
  useEffect(() => {
    if (watchRegionId) {
      const currentSectorId = form.getValues('sector_id');
      const sectorStillValid = filteredSectors.some(s => s.id === currentSectorId);
      if (!sectorStillValid) {
        form.setValue('sector_id', '');
      }
    }
  }, [watchRegionId, filteredSectors, form]);

  const handleSubmit = async (data: SchoolFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('School form submission error:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('schoolName')} *</FormLabel>
              <FormControl>
                <Input placeholder={t('enterSchoolName')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="region_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('region')} *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectRegion')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {regions.map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name}
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectSector')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredSectors.map((sector) => (
                      <SelectItem key={sector.id} value={sector.id}>
                        {sector.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('address')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('enterAddress')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input type="email" placeholder={t('enterEmail')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('phone')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterPhone')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="principal_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('principalName')}</FormLabel>
              <FormControl>
                <Input placeholder={t('enterPrincipalName')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="student_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentCount')}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder={t('enterStudentCount')} 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teacher_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('teacherCount')}</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder={t('enterTeacherCount')} 
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('schoolType')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectSchoolType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="primary">{t('primarySchool')}</SelectItem>
                    <SelectItem value="secondary">{t('secondarySchool')}</SelectItem>
                    <SelectItem value="high">{t('highSchool')}</SelectItem>
                    <SelectItem value="combined">{t('combinedSchool')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('language')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="az">{t('azerbaijani')}</SelectItem>
                    <SelectItem value="en">{t('english')}</SelectItem>
                    <SelectItem value="ru">{t('russian')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('saving') : t('save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SchoolForm;
