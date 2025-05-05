
import React, { useState } from 'react';
import { useRegions } from '@/hooks/useRegions';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import RegionAdminDialog from './RegionAdminDialog';
import { Region, RegionFormData, RegionDialogsProps } from '@/types/regions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const RegionDialogs: React.FC<RegionDialogsProps> = ({ open, onOpenChange }) => {
  const [regionData, setRegionData] = useState<RegionFormData>({
    name: '',
    description: '',
    status: 'active',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(null);
  const [regionToEdit, setRegionToEdit] = useState<Region | null>(null);
  const [adminDialogRegionId, setAdminDialogRegionId] = useState<string | null>(null);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);

  const { regions, loading, error, fetchRegions, refresh, createRegion, updateRegion, deleteRegion } = useRegions();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setRegionData((prev) => ({ ...prev, [name]: value }));
    // Sahə doldurulduqda xətanı təmizləyirik
    if (value.trim() && errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!regionData.name.trim()) {
      newErrors.name = t('regionNameRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRegion = async () => {
    if (!validateForm()) return;

    try {
      const result = await createRegion(regionData);

      if (result) {
        toast({
          title: t('success'),
          description: t('regionAddedSuccessfully'),
        });
        // Dialog-u bağlayırıq və verilənləri sıfırlayırıq
        onOpenChange(false);
        setRegionData({
          name: '',
          description: '',
          status: 'active',
        });
        // Regionların siyahısını yeniləyirik
        refresh();
      } else {
        toast({
          title: t('error'),
          description: t('regionAddError'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('unexpectedError'),
        variant: "destructive",
      });
    }
  };

  const handleUpdateRegion = async () => {
    if (!regionToEdit || !validateForm()) return;

    try {
      const result = await updateRegion(regionToEdit.id, regionData);

      if (result) {
        toast({
          title: t('success'),
          description: t('regionUpdatedSuccessfully'),
        });
        setRegionToEdit(null);
        refresh();
      } else {
        toast({
          title: t('error'),
          description: t('regionUpdateError'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('unexpectedError'),
        variant: "destructive",
      });
    }
  };

  const handleDeleteRegion = async () => {
    if (!regionToDelete) return;

    try {
      const result = await deleteRegion(regionToDelete.id);

      if (result) {
        toast({
          title: t('success'),
          description: t('regionDeletedSuccessfully'),
        });
        setRegionToDelete(null);
        refresh();
      } else {
        toast({
          title: t('error'),
          description: t('regionDeleteError'),
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('unexpectedError'),
        variant: "destructive",
      });
    }
  };

  const handleOpenEditDialog = (region: Region) => {
    setRegionToEdit(region);
    setRegionData({
      name: region.name,
      description: region.description || '',
      status: region.status || 'active',
    });
  };

  const handleOpenDeleteDialog = (region: Region) => {
    setRegionToDelete(region);
  };

  const handleAssignAdmin = (regionId: string) => {
    setAdminDialogRegionId(regionId);
    setAdminDialogOpen(true);
  };

  // Form komponentləri
  const formFields = (
    <div className="space-y-4 py-2">
      <div className="space-y-2">
        <Label htmlFor="name">{t('regionName')} *</Label>
        <Input
          id="name"
          name="name"
          value={regionData.name}
          onChange={handleInputChange}
          placeholder={t('enterRegionName')}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          name="description"
          value={regionData.description}
          onChange={handleInputChange}
          placeholder={t('enterDescription')}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="status">{t('status')}</Label>
        <Select
          value={regionData.status}
          onValueChange={(value) => setRegionData((prev) => ({ ...prev, status: value as 'active' | 'inactive' }))}
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
    </div>
  );

  return (
    <>
      {/* Add Region Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('addRegion')}</DialogTitle>
            <DialogDescription>{t('addRegionDescription')}</DialogDescription>
          </DialogHeader>

          {formFields}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAddRegion}>{t('addRegion')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Region Dialog */}
      {regionToEdit && (
        <Dialog open={!!regionToEdit} onOpenChange={() => setRegionToEdit(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('editRegion')}</DialogTitle>
              <DialogDescription>{t('editRegionDescription')}</DialogDescription>
            </DialogHeader>

            {formFields}

            <DialogFooter>
              <Button variant="outline" onClick={() => setRegionToEdit(null)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleUpdateRegion}>{t('update')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Region Dialog */}
      {regionToDelete && (
        <Dialog open={!!regionToDelete} onOpenChange={() => setRegionToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('deleteRegion')}</DialogTitle>
              <DialogDescription>
                {t('deleteRegionConfirmation', { regionName: regionToDelete.name })}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRegionToDelete(null)}>
                {t('cancel')}
              </Button>
              <Button variant="destructive" onClick={handleDeleteRegion}>
                {t('delete')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Admin Dialog */}
      {adminDialogRegionId && (
        <RegionAdminDialog
          open={adminDialogOpen}
          onClose={() => setAdminDialogOpen(false)}
          regionId={adminDialogRegionId}
          onSuccess={() => {
            setAdminDialogOpen(false);
            refresh();
          }}
        />
      )}
    </>
  );
};

export default RegionDialogs;
