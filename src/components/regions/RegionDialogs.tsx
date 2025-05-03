import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useRegions } from '@/hooks/useRegions';
import { Region } from '@/types/region';
import { toast } from 'sonner';

export const CreateRegionDialog = ({ open, onOpenChange, onSuccess }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { createRegion } = useRegions();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // createRegion istifadə edirik (əvvəlki addRegion əvəzinə)
      const result = await createRegion({
        name,
        description
      });
      
      if (result.success) {
        toast.success('Region uğurla yaradıldı');
        if (onSuccess) onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error('Region yaradarkən xəta baş verdi', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Region Yarat</DialogTitle>
          <DialogDescription>
            Aşağıdakı formu dolduraraq yeni bir region əlavə edin.
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
              <Label htmlFor="description">Açıqlama</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Region haqqında açıqlama"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={loading}>
                Ləğv et
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Yaradılır..." : "Yarat"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const EditRegionDialog = ({ open, onOpenChange, region, onSuccess }) => {
  const [name, setName] = useState(region?.name || '');
  const [description, setDescription] = useState(region?.description || '');
  const [loading, setLoading] = useState(false);
  
  const { updateRegion } = useRegions();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateRegion(region.id, {
        name,
        description
      });
      
      if (result.success) {
        toast.success('Region uğurla yeniləndi');
        if (onSuccess) onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error('Region yenilənərkən xəta baş verdi', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Region Yenilə</DialogTitle>
          <DialogDescription>
            Aşağıdakı formu dolduraraq region məlumatlarını yeniləyin.
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
              <Label htmlFor="description">Açıqlama</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Region haqqında açıqlama"
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={loading}>
                Ləğv et
              </Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "Yenilənir..." : "Yenilə"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteRegionDialog = ({ open, onOpenChange, region, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  
  const { deleteRegion } = useRegions();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await deleteRegion(region.id);
      
      if (result.success) {
        toast.success('Region uğurla silindi');
        if (onSuccess) onSuccess();
        onOpenChange(false);
      }
    } catch (error: any) {
      toast.error('Region silinərkən xəta baş verdi', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Region Sil</DialogTitle>
          <DialogDescription>
            Bu regionu silmək istədiyinizə əminsinizmi? Bu əməliyyat geri alına bilməz.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <p>
              <b>{region?.name}</b> regionunu silmək istədiyinizə əminsinizmi?
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary" disabled={loading}>
                Ləğv et
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={loading}>
              {loading ? "Silinir..." : "Sil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
