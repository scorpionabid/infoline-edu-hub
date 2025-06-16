
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/context/LanguageContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { School } from '@/types/school';
import { Loader2 } from 'lucide-react';

interface CreateSchoolDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (school: Omit<School, 'id'>) => Promise<void>;
  regions: { id: string; name: string }[];
  sectors: { id: string; name: string }[];
  isSubmitting: boolean;
}

const CreateSchoolDialog: React.FC<CreateSchoolDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  regions,
  sectors,
  isSubmitting
}) => {
  const { t } = useLanguage();
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<Partial<School>>({
    defaultValues: {
      status: 'active',
      admin_id: null
    }
  });

  const selectedRegionId = watch('region_id');

  const filteredSectors = sectors.filter(sector => 
    !selectedRegionId || sector.id === selectedRegionId
  );

  const handleFormSubmit = async (data: Partial<School>) => {
    // Add default values for created_at and updated_at
    const now = new Date().toISOString();
    const schoolData: any = {
      ...data,
      created_at: now,
      updated_at: now
    };

    await onSubmit(schoolData as Omit<School, 'id'>);
    reset();
  };

  const onRegionChange = (value: string) => {
    setValue('region_id', value);
    setValue('sector_id', ''); // Reset sector when region changes
  };

  // Filter out any regions/sectors with empty IDs or invalid data
  const validRegions = regions.filter(region => 
    region && region.id && String(region.id).trim() !== '' && region.name
  );
  
  const validSectors = filteredSectors.filter(sector => 
    sector && sector.id && String(sector.id).trim() !== '' && sector.name
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addSchool')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('schoolName')}</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder={t('enterSchoolName')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-xs">{t('nameRequired')}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="region_id">{t('region')}</Label>
                <Select 
                  onValueChange={onRegionChange} 
                  defaultValue={watch('region_id') || undefined}
                >
                  <SelectTrigger id="region_id" className={errors.region_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('selectRegion')} />
                  </SelectTrigger>
                  <SelectContent>
                    {validRegions.length > 0 ? (
                      validRegions.map(region => (
                        <SelectItem key={region.id} value={region.id}>
                          {region.name}
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
                  <p className="text-red-500 text-xs">{t('regionRequired')}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="sector_id">{t('sector')}</Label>
                <Select 
                  onValueChange={(value) => setValue('sector_id', value)} 
                  defaultValue={watch('sector_id') || undefined}
                  disabled={!selectedRegionId}
                >
                  <SelectTrigger id="sector_id" className={errors.sector_id ? 'border-red-500' : ''}>
                    <SelectValue placeholder={t('selectSector')} />
                  </SelectTrigger>
                  <SelectContent>
                    {validSectors.length > 0 ? (
                      validSectors.map(sector => (
                        <SelectItem key={sector.id} value={sector.id}>
                          {sector.name}
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
                  <p className="text-red-500 text-xs">{t('sectorRequired')}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="principal_name">{t('principalName')}</Label>
              <Input
                id="principal_name"
                {...register('principal_name')}
                placeholder={t('enterPrincipalName')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">{t('phone')}</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  placeholder={t('enterPhoneNumber')}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder={t('enterEmail')}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">{t('address')}</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder={t('enterAddress')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">{t('status')}</Label>
              <Select 
                onValueChange={(value) => setValue('status', value as any)} 
                defaultValue={watch('status') || 'active'}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder={t('selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
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
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolDialog;
