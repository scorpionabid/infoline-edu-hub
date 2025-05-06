
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Radio, RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLanguage } from '@/context/LanguageContext';
import { useRegions } from '@/hooks/useRegions';
import { toast } from 'sonner';
import { Region } from '@/types/region';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion?: Region | null;
}

export const AddRegionDialog: React.FC<RegionDialogProps> = ({ isOpen, onClose, selectedRegion }) => {
  const { t } = useLanguage();
  const { addRegion } = useRegions();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (isOpen && selectedRegion) {
      setName(selectedRegion.name || '');
      setDescription(selectedRegion.description || '');
      setStatus((selectedRegion.status as 'active' | 'inactive') || 'active');
    } else if (isOpen) {
      setName('');
      setDescription('');
      setStatus('active');
    }
  }, [isOpen, selectedRegion]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addRegion({
        name,
        description,
        status
      });
      
      toast.success(t('regionAdded'), {
        description: t('regionAddedSuccessfully')
      });
      
      onClose();
    } catch (error: any) {
      console.error('Region əlavə edilərkən xəta:', error);
      toast.error(t('error'), {
        description: error.message || t('unknownError')
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('addNewRegion')}</DialogTitle>
          <DialogDescription>{t('enterRegionDetails')}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="name" className="text-right">{t('name')}</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="col-span-3"
                required 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="description" className="text-right">{t('description')}</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">{t('status')}</Label>
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
            <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('adding') : t('add')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const EditRegionDialog: React.FC<RegionDialogProps> = ({ isOpen, onClose, selectedRegion }) => {
  const { t } = useLanguage();
  const { updateRegion } = useRegions();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (isOpen && selectedRegion) {
      setName(selectedRegion.name || '');
      setDescription(selectedRegion.description || '');
      setStatus((selectedRegion.status as 'active' | 'inactive') || 'active');
    }
  }, [isOpen, selectedRegion]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRegion) return;
    
    setIsSubmitting(true);
    
    try {
      await updateRegion(selectedRegion.id, {
        name,
        description,
        status
      });
      
      toast.success(t('regionUpdated'), {
        description: t('regionUpdatedSuccessfully')
      });
      
      onClose();
    } catch (error: any) {
      console.error('Region yeniləyərkən xəta:', error);
      toast.error(t('error'), {
        description: error.message || t('unknownError')
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('editRegion')}</DialogTitle>
          <DialogDescription>{t('updateRegionDetails')}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="name" className="text-right">{t('name')}</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="col-span-3"
                required 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label htmlFor="description" className="text-right">{t('description')}</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-2">
              <Label className="text-right">{t('status')}</Label>
              <RadioGroup 
                value={status} 
                onValueChange={(value) => setStatus(value as 'active' | 'inactive')} 
                className="col-span-3 flex items-center space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="edit-active" />
                  <Label htmlFor="edit-active">{t('active')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="edit-inactive" />
                  <Label htmlFor="edit-inactive">{t('inactive')}</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t('updating') : t('update')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export const DeleteRegionDialog: React.FC<RegionDialogProps> = ({ isOpen, onClose, selectedRegion }) => {
  const { t } = useLanguage();
  const { deleteRegion } = useRegions();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!selectedRegion) return;
    
    setIsDeleting(true);
    
    try {
      await deleteRegion(selectedRegion.id);
      
      toast.success(t('regionDeleted'), {
        description: t('regionDeletedSuccessfully')
      });
      
      onClose();
    } catch (error: any) {
      console.error('Region silmə xətası:', error);
      toast.error(t('error'), {
        description: error.message || t('unknownError')
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('deleteRegion')}</DialogTitle>
          <DialogDescription>{t('areYouSureDeleteRegion')}</DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p>{t('deleteConfirmMessage', { name: selectedRegion?.name })}</p>
          <p className="mt-2 text-muted-foreground text-sm">{t('thisActionCannot')}</p>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? t('deleting') : t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AssignAdminDialog: React.FC<RegionDialogProps & { onAdminAssigned?: () => void }> = ({ 
  isOpen, 
  onClose, 
  selectedRegion, 
  onAdminAssigned 
}) => {
  const { t } = useLanguage();
  const [adminEmail, setAdminEmail] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [status, setStatus] = useState<'existing' | 'new'>('existing');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<Array<{ id: string; email: string; name: string }>>([]);
  
  useEffect(() => {
    if (isOpen && selectedRegion?.admin_email) {
      setAdminEmail(selectedRegion.admin_email);
    }
  }, [isOpen, selectedRegion]);
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('assignRegionAdmin')}</DialogTitle>
          <DialogDescription>{t('assignAdminDescription')}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex space-x-2">
            <Button 
              variant={status === 'existing' ? 'default' : 'outline'}
              onClick={() => setStatus('existing')}
              className="flex-1"
            >
              {t('existingUser')}
            </Button>
            <Button 
              variant={status === 'new' ? 'default' : 'outline'}
              onClick={() => setStatus('new')}
              className="flex-1"
            >
              {t('newUser')}
            </Button>
          </div>
          
          {status === 'existing' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="user" className="text-right">{t('user')}</Label>
                <Select
                  value={selectedUser}
                  onValueChange={setSelectedUser}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('selectUser')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user1">{t('user1')}</SelectItem>
                    <SelectItem value="user2">{t('user2')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-2">
                <Label htmlFor="email" className="text-right">{t('email')}</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={adminEmail} 
                  onChange={(e) => setAdminEmail(e.target.value)} 
                  className="col-span-3"
                  required 
                />
              </div>
              
              {/* Burada əlavə formlar olacaq */}
              
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button 
            type="button" 
            disabled={isSubmitting || (!selectedUser && !adminEmail)}
          >
            {isSubmitting ? t('assigning') : t('assign')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
