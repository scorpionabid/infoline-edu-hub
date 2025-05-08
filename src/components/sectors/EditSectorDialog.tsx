
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useLanguageSafe } from '@/context/LanguageContext';
import { Region, Sector } from '@/types/supabase';
import { useForm } from 'react-hook-form';

interface EditSectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sectorData: Sector) => Promise<void>;
  sector: Sector;
  regions?: Region[];
  isSubmitting?: boolean;
}

const EditSectorDialog: React.FC<EditSectorDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  sector,
  regions = [],
  isSubmitting = false
}) => {
  const { t } = useLanguageSafe();
  const [status, setStatus] = useState<string>(sector.status || 'active');
  const [regionId, setRegionId] = useState<string>(sector.region_id || '');

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
    defaultValues: {
      name: sector.name || '',
      description: sector.description || '',
    }
  });

  // Update form when sector changes
  useEffect(() => {
    if (sector) {
      setValue('name', sector.name || '');
      setValue('description', sector.description || '');
      setRegionId(sector.region_id || '');
      setStatus(sector.status || 'active');
    }
  }, [sector, setValue]);

  const onFormSubmit = async (data: any) => {
    const sectorData = {
      ...sector,
      name: data.name,
      description: data.description,
      region_id: regionId,
      status: status
    };

    try {
      await onSubmit(sectorData);
      onClose();
    } catch (error) {
      console.error("Error updating sector:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('editSector')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('sectorName')}</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{t('sectorNameRequired')}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="region">{t('region')}</Label>
              <Select value={regionId} onValueChange={setRegionId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectRegion')} />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!regionId && (
                <p className="text-red-500 text-sm">{t('regionRequired')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                {...register('description')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('status')}</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !regionId}
            >
              {isSubmitting ? t('saving') : t('save')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSectorDialog;
