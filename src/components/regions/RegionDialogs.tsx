import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRegions } from '@/hooks/regions/useRegions';
import { useLanguage } from '@/context/LanguageContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Region } from '@/types/region';

interface CreateRegionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateRegionDialog({ open, onClose }: CreateRegionDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { addRegion } = useRegions();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setStatus('active');
    }
  }, [open]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addRegion({
        name,
        description,
        status
      });
      
      toast({
        title: t('regionCreated'),
        description: t('regionCreatedSuccess', { name }),
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating region:', error);
      toast({
        title: t('error'),
        description: t('regionCreationFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('createRegion')}</DialogTitle>
            <DialogDescription>
              {t('createRegionDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {t('name')}
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                {t('description')}
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                {t('status')}
              </Label>
              <RadioGroup 
                value={status} 
                onValueChange={(value) => setStatus(value as 'active' | 'inactive')} 
                className="col-span-3 flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">{t('active')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive">{t('inactive')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditRegionDialogProps {
  open: boolean;
  onClose: () => void;
  region: Region;
}

export function EditRegionDialog({ open, onClose, region }: EditRegionDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { addRegion } = useRegions();
  
  const [name, setName] = useState(region?.name || '');
  const [description, setDescription] = useState(region?.description || '');
  const [status, setStatus] = useState(region?.status || 'active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
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
    <Dialog open={open} onOpenChange={onClose}>
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
}
