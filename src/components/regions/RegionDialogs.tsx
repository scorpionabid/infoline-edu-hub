
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { useRegions } from '@/hooks/useRegions';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Region } from '@/types/region';

interface CreateRegionDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateRegionDialog({ open, onClose }: CreateRegionDialogProps) {
  const { t } = useLanguage();
  const { createRegion } = useRegions();
  
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
      await createRegion({
        name,
        description,
        status
      });
      
      toast.success(t('regionCreatedSuccess', { name }));
      onClose();
    } catch (error: any) {
      console.error('Error creating region:', error);
      toast.error(t('regionCreationFailed'), {
        description: error.message
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
            {/* Region adı */}
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
            {/* Region açıklaması */}
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
            {/* Region durumu */}
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
              disabled={isSubmitting || !name}
            >
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
  const { updateRegion } = useRegions();
  
  const [name, setName] = useState(region.name);
  const [description, setDescription] = useState(region.description || '');
  const [status, setStatus] = useState<"active" | "inactive">(region.status as "active" | "inactive");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (open) {
      setName(region.name);
      setDescription(region.description || '');
      setStatus(region.status as "active" | "inactive");
    }
  }, [open, region]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await updateRegion(region.id, {
        name,
        description,
        status
      });
      
      toast.success(t('regionUpdated'), {
        description: t('regionUpdatedSuccess', { name })
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error updating region:', error);
      toast.error(t('regionUpdateFailed'), {
        description: error.message
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
            <DialogTitle>{t('editRegion')}</DialogTitle>
            <DialogDescription>
              {t('editRegionDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Region adı */}
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
            {/* Region açıklaması */}
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
            {/* Region durumu */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                {t('status')}
              </Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as "active" | "inactive")}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">{t('active')}</SelectItem>
                  <SelectItem value="inactive">{t('inactive')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !name}
            >
              {isSubmitting ? t('saving') : t('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteRegionDialogProps {
  open: boolean;
  onClose: () => void;
  region: Region;
}

export function DeleteRegionDialog({ open, onClose, region }: DeleteRegionDialogProps) {
  const { t } = useLanguage();
  const { deleteRegion } = useRegions();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      await deleteRegion(region.id);
      
      toast.success(t('regionDeleted'), {
        description: t('regionDeletedSuccess', { name: region.name })
      });
      
      onClose();
    } catch (error: any) {
      console.error('Error deleting region:', error);
      
      toast.error(t('regionDeleteFailed'), {
        description: error.message
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('deleteRegion')}</DialogTitle>
          <DialogDescription>
            {t('deleteRegionDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p>{t('deleteRegionConfirmation', { name: region.name })}</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            {t('cancel')}
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? t('deleting') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
