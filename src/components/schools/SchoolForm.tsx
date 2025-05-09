
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SchoolFormData, EnhancedSchoolFormProps, SchoolFormProps } from '@/types/school';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Radio, RadioGroup, RadioIndicator, RadioItem } from '@/components/ui/radio';

const SchoolForm = ({
  initialData,
  onSubmit,
  regions = [],
  sectors = [],
  isLoading = false,
  isSubmitting = false,
  submitButtonText = 'Save',
  regionNames = {},
  sectorNames = {}
}: EnhancedSchoolFormProps) => {
  const { t } = useLanguage();
  
  const formSchema = z.object({
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
    region_id: z.string().min(1, {
      message: "Please select a region.",
    }),
    sector_id: z.string().min(1, {
      message: "Please select a sector.",
    }),
    principal_name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    student_count: z.coerce.number().int().optional(),
    teacher_count: z.coerce.number().int().optional(),
    type: z.string().optional(),
    status: z.string().optional(),
    language: z.string().optional(),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      region_id: initialData?.region_id || '',
      sector_id: initialData?.sector_id || '',
      principal_name: initialData?.principal_name || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      student_count: initialData?.student_count || undefined,
      teacher_count: initialData?.teacher_count || undefined,
      type: initialData?.type || 'public',
      status: initialData?.status || 'active',
      language: initialData?.language || 'az',
    }
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const schoolData: SchoolFormData = {
      name: values.name,
      region_id: values.region_id,
      sector_id: values.sector_id,
      principal_name: values.principal_name,
      address: values.address,
      phone: values.phone,
      email: values.email,
      student_count: values.student_count,
      teacher_count: values.teacher_count,
      type: values.type,
      status: values.status,
      language: values.language,
    };
    
    onSubmit(schoolData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {t('loading')}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('schoolName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterSchoolName')} {...field} />
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
                  disabled={isLoading} 
                  onValueChange={field.onChange} 
                  value={field.value} 
                  defaultValue={field.value}
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
                  disabled={isLoading} 
                  onValueChange={field.onChange} 
                  value={field.value} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectSector')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sectors.map((sector) => (
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
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('address')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('enterAddress')} {...field} />
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
            name="student_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('studentCount')}</FormLabel>
                <FormControl>
                  <Input type="number" placeholder={t('enterStudentCount')} {...field} />
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
                  <Input type="number" placeholder={t('enterTeacherCount')} {...field} />
                </FormControl>
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
                <Select 
                  disabled={isLoading} 
                  onValueChange={field.onChange} 
                  value={field.value} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectLanguage')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="az">Azərbaycan</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('schoolType')}</FormLabel>
                <Select 
                  disabled={isLoading} 
                  onValueChange={field.onChange} 
                  value={field.value} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('selectSchoolType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">{t('public')}</SelectItem>
                    <SelectItem value="private">{t('private')}</SelectItem>
                    <SelectItem value="mixed">{t('mixed')}</SelectItem>
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
              <FormItem className="space-y-3">
                <FormLabel>{t('status')}</FormLabel>
                <FormControl>
                  <RadioGroup 
                    value={field.value} 
                    onValueChange={field.onChange}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioItem value="active" id="active">
                        <RadioIndicator />
                      </RadioItem>
                      <label htmlFor="active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t('active')}
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioItem value="inactive" id="inactive">
                        <RadioIndicator />
                      </RadioItem>
                      <label htmlFor="inactive" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {t('inactive')}
                      </label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            submitButtonText
          )}
        </Button>
      </form>
    </Form>
  );
};

export default SchoolForm;
