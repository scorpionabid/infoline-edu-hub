import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Region } from '@/types/supabase';

// Bu komponent/əhatə bütöv şəkildə olmalıdır, çünki key xətalar burada var:
export const AddRegionDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  useRegionsHook: any;
}> = ({ open, onOpenChange, useRegionsHook }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const { createRegion, fetchRegions } = useRegionsHook;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createRegion({ name, description, status });
      onOpenChange(false);
      setName('');
      setDescription('');
      setStatus('active');
      // refresh əvəzinə fetchRegions istifadə edirik
      fetchRegions();
    } catch (error) {
      console.error('Error adding region:', error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Region</DialogTitle>
          <DialogDescription>
            Yeni region əlavə etmək üçün məlumatları doldurun.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Ad</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Region adı"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Təsvir</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Region haqqında qısa məlumat"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'active' | 'inactive') => setStatus(value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Deaktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Əlavə et</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const EditRegionDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: Region | null;
  useRegionsHook: any;
}> = ({ open, onOpenChange, region, useRegionsHook }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const { updateRegion, fetchRegions } = useRegionsHook;
  
  useEffect(() => {
    if (region) {
      setName(region.name || '');
      setDescription(region.description || '');
      setStatus(region.status as 'active' | 'inactive' || 'active');
    }
  }, [region]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!region?.id) return;
    
    try {
      await updateRegion(region.id, { name, description, status });
      onOpenChange(false);
      // refresh əvəzinə fetchRegions istifadə edirik
      fetchRegions();
    } catch (error) {
      console.error('Error updating region:', error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Regionu Düzəlt</DialogTitle>
          <DialogDescription>
            Region məlumatlarını yeniləyin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Ad</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Region adı"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Təsvir</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Region haqqında qısa məlumat"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(value: 'active' | 'inactive') => setStatus(value)}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Status seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="inactive">Deaktiv</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Yadda saxla</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteRegionDialog: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  region: Region | null;
  useRegionsHook: any;
}> = ({ open, onOpenChange, region, useRegionsHook }) => {
  const { deleteRegion, fetchRegions } = useRegionsHook;
  
  const handleDelete = async () => {
    if (!region?.id) return;
    
    try {
      await deleteRegion(region.id);
      onOpenChange(false);
      fetchRegions();
    } catch (error) {
      console.error('Error deleting region:', error);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Regionu Sil</DialogTitle>
          <DialogDescription>
            Bu əməliyyat geri qaytarıla bilməz. Region silinəcək.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>
            <strong>{region?.name}</strong> regionunu silmək istədiyinizə əminsiniz?
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>İmtina</Button>
          <Button variant="destructive" onClick={handleDelete}>Sil</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
