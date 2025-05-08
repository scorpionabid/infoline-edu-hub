
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { School } from '@/types/school';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/context/LanguageContext';

export interface SchoolFormProps {
  initialData?: School;
  onSubmit: (data: Partial<School>) => Promise<void>; 
  isSubmitting: boolean;
  regions?: Array<{ id: string; name: string }>;
  sectors?: Array<{ id: string; name: string }>;
  regionId?: string;
}

const SchoolForm: React.FC<SchoolFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting,
  regions = [],
  sectors = [],
  regionId
}) => {
  const { t } = useLanguage();
  
  const formSchema = z.object({
    name: z.string().min(1, { message: t('nameRequired') || "Məktəb adı tələb olunur" }),
    address: z.string().optional(),
    email: z.string().email({ message: t('invalidEmail') || "Düzgün email daxil edin" }).optional().or(z.literal('')),
    phone: z.string().optional(),
    principal_name: z.string().optional(),
    region_id: z.string().min(1, { message: t('regionRequired') || "Region seçilməlidir" }),
    sector_id: z.string().min(1, { message: t('sectorRequired') || "Sektor seçilməlidir" }),
    status: z.string().optional(),
    type: z.string().optional(),
    language: z.string().optional(),
    student_count: z.coerce.number().optional(),
    teacher_count: z.coerce.number().optional(),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      address: initialData?.address || '',
      email: initialData?.email || '',
      phone: initialData?.phone || '',
      principal_name: initialData?.principal_name || '',
      region_id: initialData?.region_id || regionId || '',
      sector_id: initialData?.sector_id || '',
      status: initialData?.status || 'active',
      type: initialData?.type || '',
      language: initialData?.language || '',
      student_count: initialData?.student_count || undefined,
      teacher_count: initialData?.teacher_count || undefined,
    }
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    await onSubmit(values);
  };

  // Seçilmiş regiona əsasən sektorları filterlə
  const selectedRegionId = form.watch('region_id');
  const filteredSectors = sectors.filter(sector => !selectedRegionId || sector.id === selectedRegionId);

  return (
    <Form {...form}>
      <form id="school-form" onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('schoolName')}</FormLabel>
              <FormControl>
                <Input {...field} />
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
                <FormLabel>{t('region')}</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                  disabled={!!regionId || isSubmitting}
                >
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
                <FormLabel>{t('sector')}</FormLabel>
                <Select 
                  value={field.value} 
                  onValueChange={field.onChange}
                  disabled={isSubmitting || !selectedRegionId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectSector')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sectors.filter(sector => sector.region_id === selectedRegionId).map((sector) => (
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
                <Input {...field} />
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
                  <Input {...field} type="email" />
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
                  <Input {...field} />
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
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('schoolType')}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="primary">Ibtidai məktəb</SelectItem>
                    <SelectItem value="secondary">Orta məktəb</SelectItem>
                    <SelectItem value="high">Tam orta məktəb</SelectItem>
                    <SelectItem value="mixed">Qarışıq</SelectItem>
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
                <FormLabel>{t('teachingLanguage')}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="az">Azərbaycan dili</SelectItem>
                    <SelectItem value="ru">Rus dili</SelectItem>
                    <SelectItem value="mixed">Qarışıq</SelectItem>
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
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
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
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="student_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentCount')}</FormLabel>
                <FormControl>
                  <Input {...field} type="number" min="0" />
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
                  <Input {...field} type="number" min="0" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
};

export default SchoolForm;
