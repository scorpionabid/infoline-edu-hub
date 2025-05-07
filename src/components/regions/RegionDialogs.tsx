
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { Region } from '@/types/school';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRegionsContext } from '@/context/RegionsContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface RegionDialogsProps {
  refreshRegions: () => void;
}

export const RegionDialogs: React.FC<RegionDialogsProps> = ({ refreshRegions }) => {
  const { t } = useLanguage();
  const { createRegion, updateRegion, deleteRegion } = useRegionsContext();

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState<Partial<Region>>({
    name: '',
    description: '',
    status: 'active'
  });

  // Selected region
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  // Reset form data
  const resetFormData = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
  };

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle opening edit dialog
  const handleEditRegion = (region: Region) => {
    setSelectedRegion(region);
    setFormData({
      name: region.name,
      description: region.description,
      status: region.status || 'active'
    });
    setEditOpen(true);
  };

  // Handle opening delete dialog
  const handleDeleteRegion = (region: Region) => {
    setSelectedRegion(region);
    setDeleteOpen(true);
  };

  // Handle creating a region
  const handleCreateRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createRegion(formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success(t('regionCreatedSuccess'));
      setCreateOpen(false);
      resetFormData();
      refreshRegions();
    } catch (error: any) {
      toast.error(t('errorCreatingRegion'), {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle updating a region
  const handleUpdateRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegion) return;
    
    setLoading(true);
    try {
      const result = await updateRegion(selectedRegion.id, formData);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success(t('regionUpdatedSuccess'));
      setEditOpen(false);
      resetFormData();
      refreshRegions();
    } catch (error: any) {
      toast.error(t('errorUpdatingRegion'), {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a region
  const handleDeleteRegion = async () => {
    if (!selectedRegion) return;
    
    setLoading(true);
    try {
      const result = await deleteRegion(selectedRegion.id);
      if (!result.success) {
        throw new Error(result.error);
      }
      toast.success(t('regionDeletedSuccess'));
      setDeleteOpen(false);
      refreshRegions();
    } catch (error: any) {
      toast.error(t('errorDeletingRegion'), {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => {
        resetFormData();
        setCreateOpen(true);
      }}>{t('addRegion')}</Button>

      {/* Create Region Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => {
        if (!open) resetFormData();
        setCreateOpen(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('createNewRegion')}</DialogTitle>
            <DialogDescription>{t('fillRegionDetails')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRegion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('regionName')} *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('enterRegionName')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('enterDescription')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">{t('status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('creating') : t('createRegion')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Region Dialog */}
      <Dialog open={editOpen} onOpenChange={(open) => {
        if (!open) resetFormData();
        setEditOpen(open);
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('editRegion')}</DialogTitle>
            <DialogDescription>{t('updateRegionDetails')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateRegion} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t('regionName')} *</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('enterRegionName')}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">{t('description')}</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('enterDescription')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">{t('status')}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? t('updating') : t('updateRegion')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Region Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('deleteRegion')}</DialogTitle>
            <DialogDescription>
              {t('deleteRegionConfirmation')}
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <p className="text-destructive">{t('thisActionCannot')}</p>
            {selectedRegion && (
              <p className="font-medium mt-2">{selectedRegion.name}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteRegion}
              disabled={loading}
            >
              {loading ? t('deleting') : t('deleteRegion')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegionDialogs;
