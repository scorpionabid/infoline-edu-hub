
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRegions } from '@/hooks/useRegions';
import { toast } from 'sonner';
import { Region } from '@/types/regions';
import { RegionAdminDialog } from './RegionAdminDialog';
import { useLanguage } from '@/context/LanguageContext';

interface RegionDialogsProps {
  onSuccess?: () => void;
}

export const RegionDialogs: React.FC<RegionDialogsProps> = ({ onSuccess }) => {
  const { t } = useLanguage();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', status: 'active' });
  const [submitted, setSubmitted] = useState(false);

  const { 
    regions, 
    loading, 
    error, 
    createRegion, 
    updateRegion, 
    deleteRegion 
  } = useRegions();

  const handleAddDialogOpen = () => {
    setFormData({ name: '', description: '', status: 'active' });
    setSubmitted(false);
    setIsAddDialogOpen(true);
  };

  const handleEditDialogOpen = (region: Region) => {
    setSelectedRegion(region);
    setFormData({
      name: region.name,
      description: region.description || '',
      status: region.status || 'active'
    });
    setSubmitted(false);
    setIsEditDialogOpen(true);
  };

  const handleDeleteDialogOpen = (region: Region) => {
    setSelectedRegion(region);
    setIsDeleteDialogOpen(true);
  };

  const handleAdminDialogOpen = (region: Region) => {
    setSelectedRegion(region);
    setIsAdminDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name) {
      toast.error(t('nameRequired'));
      return false;
    }
    return true;
  };

  const handleAddSubmit = async () => {
    setSubmitted(true);
    if (!validateForm()) return;

    try {
      const regionData = {
        name: formData.name,
        description: formData.description,
        status: formData.status
      };

      const result = await createRegion(regionData);
      
      if (result) {
        toast.success(t('regionAddSuccess'));
        setIsAddDialogOpen(false);
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('Region əlavə edilərkən xəta baş verdi:', err);
      toast.error(t('regionAddError'), {
        description: err.message || t('unexpectedError')
      });
    }
  };

  const handleEditSubmit = async () => {
    setSubmitted(true);
    if (!validateForm() || !selectedRegion) return;

    try {
      const regionData = {
        name: formData.name,
        description: formData.description,
        status: formData.status
      };

      const result = await updateRegion(selectedRegion.id, regionData);
      
      if (result) {
        toast.success(t('regionUpdateSuccess'));
        setIsEditDialogOpen(false);
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('Region yeniləmə xətası:', err);
      toast.error(t('regionUpdateError'), {
        description: err.message || t('unexpectedError')
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRegion) return;

    try {
      const result = await deleteRegion(selectedRegion.id);
      
      if (result) {
        toast.success(t('regionDeleteSuccess'));
        setIsDeleteDialogOpen(false);
        onSuccess?.();
      }
    } catch (err: any) {
      console.error('Region silinərkən xəta baş verdi:', err);
      toast.error(t('regionDeleteError'), {
        description: err.message || t('unexpectedError')
      });
    }
  };

  return (
    <>
      {/* Region əlavə etmə dialoqu */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('addRegion')}</DialogTitle>
            <DialogDescription>
              {t('addRegionDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input 
                id="name"
                name="name" 
                value={formData.name} 
                onChange={handleFormChange}
                className={submitted && !formData.name ? "border-red-500" : ""}
                placeholder={t('regionNamePlaceholder')}
              />
              {submitted && !formData.name && (
                <p className="text-sm text-red-500">{t('nameRequired')}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea 
                id="description"
                name="description" 
                value={formData.description} 
                onChange={handleFormChange}
                placeholder={t('regionDescriptionPlaceholder')}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleAddSubmit}>
              {t('add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Region yeniləmə dialoqu */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('editRegion')}</DialogTitle>
            <DialogDescription>
              {t('editRegionDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input 
                id="name"
                name="name" 
                value={formData.name} 
                onChange={handleFormChange}
                className={submitted && !formData.name ? "border-red-500" : ""}
              />
              {submitted && !formData.name && (
                <p className="text-sm text-red-500">{t('nameRequired')}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea 
                id="description"
                name="description" 
                value={formData.description} 
                onChange={handleFormChange}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleEditSubmit}>
              {t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Region silmə dialoqu */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>{t('deleteRegion')}</DialogTitle>
            <DialogDescription>
              {t('deleteRegionDescription')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-3">
            <p className="text-destructive">
              {t('deleteRegionWarning', { name: selectedRegion?.name || '' })}
            </p>
          </div>
          
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Region admin təyin etmə dialoqu */}
      <RegionAdminDialog 
        open={isAdminDialogOpen} 
        onClose={() => setIsAdminDialogOpen(false)} 
        regionId={selectedRegion?.id || ''}
      />
      
      <div className="flex flex-wrap gap-2 justify-end mb-4">
        <Button onClick={handleAddDialogOpen}>
          {t('addRegion')}
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-lg text-center">
            <p className="text-destructive">{error}</p>
          </div>
        ) : regions && regions.length === 0 ? (
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-muted-foreground">{t('noRegionsFound')}</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {regions && regions.map(region => (
              <div key={region.id} className="bg-card text-card-foreground border rounded-lg shadow-sm">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium">{region.name}</h3>
                    {region.status === 'active' ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {t('active')}
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                        {t('inactive')}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {region.description || t('noDescription')}
                  </p>
                  
                  <div className="mt-4 flex flex-col gap-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t('admin')}:</span>
                      <span className="font-medium">
                        {region.admin_email || t('notAssigned')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex gap-2 justify-end">
                    <Button variant="outline" size="sm" onClick={() => handleAdminDialogOpen(region)}>
                      {t('assignAdmin')}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditDialogOpen(region)}>
                      {t('edit')}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteDialogOpen(region)}>
                      {t('delete')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default RegionDialogs;
