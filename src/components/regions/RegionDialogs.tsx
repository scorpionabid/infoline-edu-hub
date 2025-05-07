import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useRegionsContext } from '@/context/RegionsContext';
import { Region } from '@/types/school';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const RegionDialogs = () => {
  const { t } = useLanguage();
  const { regions, loading, addRegion, assignRegionAdmin } = useRegionsContext();
  
  // Dialog states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  
  // Form data - type-a uyğun olaraq düzəltdik
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });
  
  // Selected region
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  
  // Existing/New user selection for admin assignment
  const [adminType, setAdminType] = useState<'existing' | 'new'>('existing');
  const [existingUserId, setExistingUserId] = useState('');
  
  // New admin form data
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
    });
    setNewAdminData({
      name: '',
      email: '',
      password: '',
    });
    setAdminType('existing');
    setExistingUserId('');
  };
  
  // Add region dialog open/close
  const openAddRegion = () => setIsAddOpen(true);
  const closeAddRegion = () => {
    setIsAddOpen(false);
    resetForm();
  };
  
  // Edit region dialog open/close
  const openEditRegion = (region: Region) => {
    setSelectedRegion(region);
    setFormData({
      name: region.name,
      description: region.description || '',
      status: (region.status as 'active' | 'inactive') || 'active',
    });
    setIsEditOpen(true);
  };
  const closeEditRegion = () => {
    setIsEditOpen(false);
    setSelectedRegion(null);
    resetForm();
  };
  
  // Delete region dialog open/close
  const openDeleteRegion = (region: Region) => {
    setSelectedRegion(region);
    setIsDeleteOpen(true);
  };
  const closeDeleteRegion = () => {
    setIsDeleteOpen(false);
    setSelectedRegion(null);
  };
  
  // Admin dialog open/close
  const openAdminDialog = (region: Region) => {
    setSelectedRegion(region);
    setIsAdminOpen(true);
  };
  const closeAdminDialog = () => {
    setIsAdminOpen(false);
    setSelectedRegion(null);
    resetForm();
  };
  
  // Handle add region
  const handleAddRegion = async () => {
    if (!formData.name.trim()) {
      toast({
        title: t('validationError'),
        description: t('regionNameRequired'),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      await addRegion({
        name: formData.name,
        description: formData.description,
        status: formData.status
      });
      
      toast({
        title: t('success'),
        description: t('regionAddedSuccessfully'),
      });
      
      closeAddRegion();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('errorAddingRegion'),
        variant: 'destructive',
      });
    }
  };
  
  // Handle edit region
  const handleEditRegion = async () => {
    if (!selectedRegion || !formData.name.trim()) {
      toast({
        title: t('validationError'),
        description: t('regionNameRequired'),
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Implementation would go here
      
      toast({
        title: t('success'),
        description: t('regionUpdatedSuccessfully'),
      });
      
      closeEditRegion();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('errorUpdatingRegion'),
        variant: 'destructive',
      });
    }
  };
  
  // Handle delete region
  const handleDeleteRegion = async () => {
    if (!selectedRegion) return;
    
    try {
      // Implementation would go here
      
      toast({
        title: t('success'),
        description: t('regionDeletedSuccessfully'),
      });
      
      closeDeleteRegion();
    } catch (error: any) {
      toast({
        title: t('error'),
        description: error.message || t('errorDeletingRegion'),
        variant: 'destructive',
      });
    }
  };
  
  // Handle admin assignment
  const handleAssignAdmin = async () => {
    if (!selectedRegion) return;
    
    if (adminType === 'existing') {
      if (!existingUserId) {
        toast({
          title: t('validationError'),
          description: t('selectUserRequired'),
          variant: 'destructive',
        });
        return;
      }
      
      try {
        await assignRegionAdmin(selectedRegion.id, existingUserId);
        
        toast({
          title: t('success'),
          description: t('adminAssignedSuccessfully'),
        });
        
        closeAdminDialog();
      } catch (error: any) {
        toast({
          title: t('error'),
          description: error.message || t('errorAssigningAdmin'),
          variant: 'destructive',
        });
      }
    } else {
      // Handle creating new admin
      // Implementation would go here
    }
  };
  
  return (
    <>
      <div className="flex space-x-2">
        <Button onClick={openAddRegion}>{t('addRegion')}</Button>
      </div>
      
      {/* Add Region Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('addRegion')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">{t('name')}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">{t('description')}</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">{t('status')}</Label>
              <RadioGroup
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'active' | 'inactive' }))}
                className="col-span-3 flex space-x-4"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">{t('active')}</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive">{t('inactive')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeAddRegion}>{t('cancel')}</Button>
            <Button onClick={handleAddRegion}>{t('add')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Region Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          {/* Dialog content for editing */}
          <DialogHeader>
            <DialogTitle>{t('editRegion')}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Edit region fields */}
            {/* Similar to add region */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditRegion}>{t('cancel')}</Button>
            <Button onClick={handleEditRegion}>{t('save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Region Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmation')}</DialogTitle>
            <DialogDescription>
              {t('deleteRegionConfirmation', { name: selectedRegion?.name })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteRegion}>{t('cancel')}</Button>
            <Button variant="destructive" onClick={handleDeleteRegion}>{t('delete')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Admin Dialog */}
      <Dialog open={isAdminOpen} onOpenChange={setIsAdminOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t('assignAdmin')}</DialogTitle>
            <DialogDescription>
              {t('assignAdminToRegion', { name: selectedRegion?.name })}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs value={adminType} onValueChange={(v) => setAdminType(v as 'existing' | 'new')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="existing">{t('existingUser')}</TabsTrigger>
              <TabsTrigger value="new">{t('newUser')}</TabsTrigger>
            </TabsList>
            <TabsContent value="existing">
              {/* Existing user selection */}
              {/* User selector component would go here */}
            </TabsContent>
            <TabsContent value="new">
              {/* New user form */}
              {/* Form for creating new admin would go here */}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={closeAdminDialog}>{t('cancel')}</Button>
            <Button onClick={handleAssignAdmin}>{t('assign')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RegionDialogs;
