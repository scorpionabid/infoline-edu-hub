
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/LanguageContext';
import { Sector } from '@/types/sector';
import { useRegions } from '@/hooks/useRegions';
import useSectors from '@/hooks/sectors/useSectors';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/context/auth';
import { FullUserData } from '@/types/user';

interface CreateSectorDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateSectorDialog({ open, onClose }: CreateSectorDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { regions } = useRegions();
  const { addSector } = useSectors();
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [regionId, setRegionId] = useState<string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (open) {
      setName('');
      setDescription('');
      setStatus('active');
      
      // Eger kullanıcı bir region admin'i ise, o regionu varsayılan olarak seç
      if (user && user.role === 'regionadmin' && user.region_id) {
        setRegionId(user.region_id);
      } else {
        setRegionId('');
      }
    }
  }, [open, user]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addSector({
        name,
        description,
        region_id: regionId,
        status
      });
      
      toast({
        title: t('sectorCreated'),
        description: t('sectorCreatedSuccess', { name }),
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating sector:', error);
      toast({
        title: t('error'),
        description: t('sectorCreationFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Region adminləri yalnız öz regionlarını görə və idarə edə bilər
  const isRegionAdmin = user?.role === 'regionadmin';
  const filteredRegions = isRegionAdmin && user?.region_id
    ? regions.filter(region => region.id === user.region_id)
    : regions;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('createSector')}</DialogTitle>
            <DialogDescription>
              {t('createSectorDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Region seçimi */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                {t('region')}
              </Label>
              <Select
                value={regionId}
                onValueChange={setRegionId}
                disabled={isRegionAdmin || filteredRegions.length === 0}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectRegion')} />
                </SelectTrigger>
                <SelectContent>
                  {filteredRegions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Sektor adı */}
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
            {/* Sektor açıklaması */}
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
            {/* Sektor durumu */}
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
            <Button 
              type="submit" 
              disabled={isSubmitting || !regionId}
            >
              {isSubmitting ? t('creating') : t('create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditSectorDialogProps {
  open: boolean;
  onClose: () => void;
  sector: Sector;
}

export function EditSectorDialog({ open, onClose, sector }: EditSectorDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { updateSector } = useSectors();
  const { user } = useAuth();
  const { regions } = useRegions();
  
  const [name, setName] = useState(sector.name);
  const [description, setDescription] = useState(sector.description || '');
  const [regionId, setRegionId] = useState(sector.region_id);
  const [status, setStatus] = useState<"active" | "inactive">(sector.status as "active" | "inactive");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (open) {
      setName(sector.name);
      setDescription(sector.description || '');
      setRegionId(sector.region_id);
      setStatus(sector.status as "active" | "inactive");
    }
  }, [open, sector]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateSector({
        id: sector.id,
        name,
        description,
        region_id: regionId,
        status
      });
      
      toast({
        title: t('sectorUpdated'),
        description: t('sectorUpdatedSuccess', { name }),
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating sector:', error);
      toast({
        title: t('error'),
        description: t('sectorUpdateFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Region adminləri yalnız öz regionlarını görə və idarə edə bilər
  const isRegionAdmin = user?.role === 'regionadmin';
  const filteredRegions = isRegionAdmin && user?.region_id
    ? regions.filter(region => region.id === user.region_id)
    : regions;
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('editSector')}</DialogTitle>
            <DialogDescription>
              {t('editSectorDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Region seçimi */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="region" className="text-right">
                {t('region')}
              </Label>
              <Select
                value={regionId}
                onValueChange={setRegionId}
                disabled={isRegionAdmin || filteredRegions.length === 0}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectRegion')} />
                </SelectTrigger>
                <SelectContent>
                  {filteredRegions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Sektor adı */}
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
            {/* Sektor açıklaması */}
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
            {/* Sektor durumu */}
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
            <Button 
              type="submit" 
              disabled={isSubmitting || !regionId}
            >
              {isSubmitting ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteSectorDialogProps {
    open: boolean;
    onClose: () => void;
    sector: Sector | null;
}

export function DeleteSectorDialog({ open, onClose, sector }: DeleteSectorDialogProps) {
    const { t } = useLanguage();
    const { toast } = useToast();
    const { deleteSector } = useSectors();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sector) return;

        setIsDeleting(true);

        try {
            await deleteSector(sector.id);

            toast({
                title: t('sectorDeleted'),
                description: t('sectorDeletedSuccess', { name: sector.name }),
            });

            onClose();
        } catch (error) {
            console.error('Error deleting sector:', error);
            toast({
                title: t('error'),
                description: t('sectorDeleteFailed'),
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{t('deleteSector')}</DialogTitle>
                        <DialogDescription>
                            {t('deleteSectorDescription')}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <p>{t('deleteConfirmation', { name: sector?.name })}</p>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
                            {t('cancel')}
                        </Button>
                        <Button type="submit" variant="destructive" disabled={isDeleting}>
                            {isDeleting ? t('deleting') : t('delete')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
