
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioItem } from '@/components/ui/radio';
import { useLanguage } from '@/context/LanguageContext';
import { SchoolFormData, EnhancedSchoolFormProps } from '@/types/school';
import { Region, Sector } from '@/types/supabase';

const SchoolForm: React.FC<EnhancedSchoolFormProps> = ({ 
  initialData, 
  onSubmit,
  isSubmitting,
  regions,
  sectors,
  regionNames,
  sectorNames
}) => {
  const { t } = useLanguage();

  // Define form schema
  const formSchema = z.object({
    name: z.string().min(1, { message: t('required') }),
    region_id: z.string().min(1, { message: t('required') }),
    sector_id: z.string().min(1, { message: t('required') }),
    address: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email({ message: t('invalidEmail') }).optional().or(z.literal('')),
    principal_name: z.string().optional(),
    student_count: z.number().optional(),
    teacher_count: z.number().optional(),
    type: z.string().optional(),
    status: z.string().default('active'),
    language: z.string().optional()
  });

  // Create form with default values
  const form = useForm<SchoolFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      region_id: initialData?.region_id || '',
      sector_id: initialData?.sector_id || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      principal_name: initialData?.principal_name || initialData?.principalName || '',
      student_count: initialData?.student_count || 0,
      teacher_count: initialData?.teacher_count || 0,
      type: initialData?.type || '',
      status: initialData?.status || 'active',
      language: initialData?.language || ''
    }
  });

  // Get values and state from form
  const { register, handleSubmit, formState: { errors }, watch } = form;
  const selectedRegionId = watch('region_id');
  
  // Filter sectors based on selected region
  const filteredSectors = sectors?.filter(sector => sector.region_id === selectedRegionId) || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            {t('schoolName')} <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            {...register('name')}
            placeholder={t('enterSchoolName')}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-red-500 text-xs">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="region_id" className="text-sm font-medium">
            {t('region')} <span className="text-red-500">*</span>
          </label>
          <select
            id="region_id"
            {...register('region_id')}
            className={`w-full p-2 border rounded-md ${errors.region_id ? 'border-red-500' : ''}`}
          >
            <option value="">{t('selectRegion')}</option>
            {regions?.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          {errors.region_id && (
            <p className="text-red-500 text-xs">{errors.region_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="sector_id" className="text-sm font-medium">
            {t('sector')} <span className="text-red-500">*</span>
          </label>
          <select
            id="sector_id"
            {...register('sector_id')}
            className={`w-full p-2 border rounded-md ${errors.sector_id ? 'border-red-500' : ''}`}
          >
            <option value="">{t('selectSector')}</option>
            {filteredSectors.map((sector) => (
              <option key={sector.id} value={sector.id}>
                {sector.name}
              </option>
            ))}
          </select>
          {errors.sector_id && (
            <p className="text-red-500 text-xs">{errors.sector_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            {t('address')}
          </label>
          <Input
            id="address"
            {...register('address')}
            placeholder={t('enterAddress')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">
            {t('phone')}
          </label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder={t('enterPhone')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            {t('email')}
          </label>
          <Input
            id="email"
            {...register('email')}
            placeholder={t('enterEmail')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="principal_name" className="text-sm font-medium">
            {t('principalName')}
          </label>
          <Input
            id="principal_name"
            {...register('principal_name')}
            placeholder={t('enterPrincipalName')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="student_count" className="text-sm font-medium">
            {t('studentCount')}
          </label>
          <Input
            id="student_count"
            type="number"
            {...register('student_count', { valueAsNumber: true })}
            placeholder={t('enterStudentCount')}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="teacher_count" className="text-sm font-medium">
            {t('teacherCount')}
          </label>
          <Input
            id="teacher_count"
            type="number"
            {...register('teacher_count', { valueAsNumber: true })}
            placeholder={t('enterTeacherCount')}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">{t('status')}</label>
          <RadioGroup value={form.watch('status')} onValueChange={(value) => form.setValue('status', value)}>
            <div className="flex items-center space-x-2">
              <RadioItem value="active" id="status-active" />
              <label htmlFor="status-active">{t('active')}</label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioItem value="inactive" id="status-inactive" />
              <label htmlFor="status-inactive">{t('inactive')}</label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  );
};

export default SchoolForm;
