
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/context/LanguageContext';
import { School, Region, Sector, CreateSchoolData } from '@/types/school';

export interface SchoolFormProps {
  school?: Partial<School>;
  onSubmit: (data: CreateSchoolData) => Promise<void>;
  isSubmitting: boolean;
  regions: Region[];
  sectors: Sector[];
  regionNames?: Record<string, string>;
  sectorNames?: Record<string, string>;
}

const SchoolForm: React.FC<SchoolFormProps> = ({
  school,
  onSubmit,
  isSubmitting,
  regions,
  sectors,
  regionNames = {},
  sectorNames = {}
}) => {
  const { t } = useLanguage();
  const [selectedRegionId, setSelectedRegionId] = useState<string>(school?.region_id || '');
  const [filteredSectors, setFilteredSectors] = useState<Sector[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateSchoolData>({
    defaultValues: {
      name: school?.name || '',
      region_id: school?.region_id || '',
      sector_id: school?.sector_id || '',
      address: school?.address || '',
      phone: school?.phone || '',
      email: school?.email || '',
      principal_name: school?.principal_name || '',
      student_count: school?.student_count || 0,
      teacher_count: school?.teacher_count || 0,
      type: school?.type || '',
      status: school?.status || 'active',
      language: school?.language || 'az'
    }
  });

  const watchedRegionId = watch('region_id');

  // Filter regions and sectors to ensure no empty IDs
  const validRegions = regions.filter(region => 
    region && region.id && String(region.id).trim() !== '' && region.name
  );

  const validSectors = sectors.filter(sector => 
    sector && sector.id && String(sector.id).trim() !== '' && sector.name
  );

  // Filter sectors based on selected region
  useEffect(() => {
    if (watchedRegionId) {
      const filtered = validSectors.filter(sector => sector.region_id === watchedRegionId);
      setFilteredSectors(filtered);
      setSelectedRegionId(watchedRegionId);
      
      // Reset sector selection if current sector is not in the filtered list
      const currentSectorId = watch('sector_id');
      if (currentSectorId && !filtered.find(s => s.id === currentSectorId)) {
        setValue('sector_id', '');
      }
    } else {
      setFilteredSectors([]);
    }
  }, [watchedRegionId, validSectors, setValue, watch]);

  const onFormSubmit = async (data: CreateSchoolData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">{t('schoolName')} *</Label>
          <Input
            id="name"
            {...register('name', { required: t('schoolNameRequired') })}
            placeholder={t('enterSchoolName')}
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="type">{t('schoolType')}</Label>
          <Input
            id="type"
            {...register('type')}
            placeholder={t('enterSchoolType')}
          />
        </div>

        <div>
          <Label htmlFor="region_id">{t('region')} *</Label>
          <Select
            value={watch('region_id') || undefined}
            onValueChange={(value) => setValue('region_id', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectRegion')} />
            </SelectTrigger>
            <SelectContent>
              {validRegions.length > 0 ? (
                validRegions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {regionNames[region.id] || region.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-regions" disabled>
                  {t('noRegionsAvailable') || 'No regions available'}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.region_id && (
            <p className="text-sm text-red-500">{errors.region_id.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="sector_id">{t('sector')} *</Label>
          <Select
            value={watch('sector_id') || undefined}
            onValueChange={(value) => setValue('sector_id', value)}
            disabled={!selectedRegionId}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectSector')} />
            </SelectTrigger>
            <SelectContent>
              {filteredSectors.length > 0 ? (
                filteredSectors.map(sector => (
                  <SelectItem key={sector.id} value={sector.id}>
                    {sectorNames[sector.id] || sector.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-sectors" disabled>
                  {selectedRegionId ? (t('noSectorsAvailable') || 'No sectors available') : (t('selectRegionFirst') || 'Select region first')}
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.sector_id && (
            <p className="text-sm text-red-500">{errors.sector_id.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="principal_name">{t('principalName')}</Label>
          <Input
            id="principal_name"
            {...register('principal_name')}
            placeholder={t('enterPrincipalName')}
          />
        </div>

        <div>
          <Label htmlFor="phone">{t('phone')}</Label>
          <Input
            id="phone"
            {...register('phone')}
            placeholder={t('enterPhone')}
          />
        </div>

        <div>
          <Label htmlFor="email">{t('email')}</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder={t('enterEmail')}
          />
        </div>

        <div>
          <Label htmlFor="language">{t('language')}</Label>
          <Select
            value={watch('language') || 'az'}
            onValueChange={(value) => setValue('language', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="az">Azərbaycan</SelectItem>
              <SelectItem value="ru">Русский</SelectItem>
              <SelectItem value="tr">Türkçe</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="student_count">{t('studentCount')}</Label>
          <Input
            id="student_count"
            type="number"
            {...register('student_count', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="teacher_count">{t('teacherCount')}</Label>
          <Input
            id="teacher_count"
            type="number"
            {...register('teacher_count', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="status">{t('status')}</Label>
          <Select
            value={watch('status') || 'active'}
            onValueChange={(value: 'active' | 'inactive') => setValue('status', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="address">{t('address')}</Label>
        <Textarea
          id="address"
          {...register('address')}
          placeholder={t('enterAddress')}
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t('saving') : t('save')}
        </Button>
      </div>
    </form>
  );
};

export default SchoolForm;
