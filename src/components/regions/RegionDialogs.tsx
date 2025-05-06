import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRegions } from '@/hooks/useRegions';
import { toast } from 'sonner';
import { Region } from '@/types/region';

export const CreateRegionDialog = ({ onClose, isOpen }: { onClose: () => void, isOpen: boolean }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addRegion } = useRegions();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Region adı daxil edin');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await addRegion({
        name,
        description,
        status: status as 'active' | 'inactive'
      });
      
      toast.success('Region uğurla yaradıldı');
      
      // Reset form fields
      setName('');
      setDescription('');
      setStatus('active');
      
      onClose();
    } catch (error) {
      console.error('Error creating region:', error);
      toast.error('Region yaradılarkən xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Region Yarat</DialogTitle>
          <DialogDescription>
            Aşağıdakı formu dolduraraq yeni bir region yaradın.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Ad
            </Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Açıqlama
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Durum
            </Label>
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Yaratılıyor..." : "Yarat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const EditRegionDialog = ({ region, onClose, isOpen }: { region: Region, onClose: () => void, isOpen: boolean }) => {
  const [name, setName] = useState(region?.name || '');
  const [description, setDescription] = useState(region?.description || '');
  const [status, setStatus] = useState(region?.status || 'active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addRegion } = useRegions();
  
  React.useEffect(() => {
    if (region) {
      setName(region.name || '');
      setDescription(region.description || '');
      setStatus(region.status || 'active');
    }
  }, [region]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Region adı daxil edin');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await addRegion({
        id: region.id,
        name,
        description,
        status: status as 'active' | 'inactive'
      });
      
      toast.success('Region uğurla yeniləndi');
      onClose();
    } catch (error) {
      console.error('Error updating region:', error);
      toast.error('Region yenilənərkən xəta baş verdi');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Regionu Güncelle</DialogTitle>
          <DialogDescription>
            Aşağıdaki formu doldurarak mevcut regionu güncelleyin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Ad
            </Label>
            <Input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Açıklama
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Durum
            </Label>
            <Select value={status} onValueChange={(value) => setStatus(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Pasif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </form>
        <DialogFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Güncelleniyor..." : "Güncelle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
