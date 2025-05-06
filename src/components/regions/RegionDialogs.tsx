
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRegions } from '@/hooks/useRegions';
import { Region } from '@/types/region';

interface AddRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRegionDialog: React.FC<AddRegionDialogProps> = ({ isOpen, onClose }) => {
  const [regionName, setRegionName] = useState('');
  const [regionDescription, setRegionDescription] = useState('');
  const { createRegion, fetchRegions } = useRegions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!regionName.trim()) return;
    
    try {
      await createRegion({
        name: regionName,
        description: regionDescription
      });
      
      // Yeni regionu əlavə etdikdən sonra siyahını yenilə
      await fetchRegions();
      
      // Formu təmizlə və dialoqu bağla
      setRegionName('');
      setRegionDescription('');
      onClose();
    } catch (error) {
      console.error('Region əlavə edilərkən xəta baş verdi:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Region əlavə et</DialogTitle>
            <DialogDescription>
              Yeni region əlavə etmək üçün aşağıdakı məlumatları doldurun
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="regionName">Region adı</Label>
              <Input
                id="regionName"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                placeholder="Region adını daxil edin"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="regionDescription">Təsvir</Label>
              <Textarea
                id="regionDescription"
                value={regionDescription}
                onChange={(e) => setRegionDescription(e.target.value)}
                placeholder="Region haqqında qısa məlumat"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>İmtina</Button>
            <Button type="submit">Əlavə et</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

interface EditRegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  region: Region | null;
}

export const EditRegionDialog: React.FC<EditRegionDialogProps> = ({ isOpen, onClose, region }) => {
  const [regionName, setRegionName] = useState('');
  const [regionDescription, setRegionDescription] = useState('');
  const { updateRegion, fetchRegions } = useRegions();

  useEffect(() => {
    if (region) {
      setRegionName(region.name || '');
      setRegionDescription(region.description || '');
    }
  }, [region]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!region || !regionName.trim()) return;
    
    try {
      await updateRegion(region.id, {
        name: regionName,
        description: regionDescription
      });
      
      // Redaktə edildikdən sonra siyahını yenilə
      await fetchRegions();
      
      onClose();
    } catch (error) {
      console.error('Region yenilənərkən xəta baş verdi:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Regionu redaktə et</DialogTitle>
            <DialogDescription>
              Region məlumatlarını yeniləyin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="editRegionName">Region adı</Label>
              <Input
                id="editRegionName"
                value={regionName}
                onChange={(e) => setRegionName(e.target.value)}
                placeholder="Region adı"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editRegionDescription">Təsvir</Label>
              <Textarea
                id="editRegionDescription"
                value={regionDescription}
                onChange={(e) => setRegionDescription(e.target.value)}
                placeholder="Region haqqında təsvir"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>İmtina</Button>
            <Button type="submit">Yadda saxla</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
