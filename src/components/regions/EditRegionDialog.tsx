
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/supabase';
import { Loader2 } from 'lucide-react';

export interface EditRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  region: Region;
  onSubmit: (region: Region) => Promise<void>;
  isSubmitting: boolean;
}

const EditRegionDialog: React.FC<EditRegionDialogProps> = ({
  isOpen,
  onClose,
  region,
  onSubmit,
  isSubmitting
}) => {
  const { t } = useLanguage();
  const { register, handleSubmit, formState: { errors } } = useForm<Region>({
    defaultValues: region
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('editRegion')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('regionName')}</Label>
              <Input
                id="name"
                {...register('name', { required: true })}
                placeholder={t('enterRegionName')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{t('nameRequired')}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">{t('description')}</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder={t('enterDescription')}
              />
            </div>
            <div className="flex justify-end space-x-2">
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

export default EditRegionDialog;
