import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useLanguage } from '@/context/LanguageContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useCreateSector, useEditSector, useDeleteSector } from '@/hooks/useSectorMutations';

interface SectorActionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'create' | 'edit' | 'delete';
  regionId?: string;
  sector?: any;
  onSuccess?: () => void;
}

const SectorActionDialog: React.FC<SectorActionDialogProps> = ({
  isOpen,
  onClose,
  action,
  regionId,
  sector,
  onSuccess
}) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const [name, setName] = useState(sector?.name || '');
  const [description, setDescription] = useState(sector?.description || '');
  const [status, setStatus] = useState(sector?.status || 'active');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('Password123');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (action === 'edit' && sector) {
        setName(sector.name || '');
        setDescription(sector.description || '');
        setStatus(sector.status || 'active');
      } else if (action === 'create') {
        setName('');
        setDescription('');
        setStatus('active');
        setAdminName('');
        setAdminEmail('');
        setAdminPassword('Password123');
      }
    }
  }, [isOpen, action, sector]);

  useEffect(() => {
    if (action === 'create' && name) {
      const transliterate = (text) => {
        const letters = {
          'ə': 'e', 'ü': 'u', 'ö': 'o', 'ğ': 'g', 'ı': 'i',
          'ş': 'sh', 'ç': 'ch', 'Ə': 'E', 'Ü': 'U', 'Ö': 'O',
          'Ğ': 'G', 'I': 'I', 'Ş': 'Sh', 'Ç': 'Ch'
        };
        return text.replace(/[əüöğışçƏÜÖĞIŞÇ]/g, (match) => letters[match] || match);
      };
      
      const processedName = transliterate(name)
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')  
        .replace(/\s+/g, '.');
      
      setAdminName(`${name} Admin`);
      setAdminEmail(`${processedName}.admin@infoline.edu`);
    }
  }, [name, action]);
  
  const createSectorMutation = useCreateSector();
  const editSectorMutation = useEditSector();
  const deleteSectorMutation = useDeleteSector();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (action === 'create') {
        await createSectorMutation.mutateAsync({
          name,
          description,
          regionId: regionId!,
          status,
          adminEmail: adminEmail || undefined,
          adminName: adminName || undefined,
          adminPassword: adminPassword || undefined
        });
        
        console.log('Sektor yaradıldı');
        toast.success(t('sectorCreated'), {
          description: t('sectorCreatedDesc')
        });
        
        if (adminEmail) {
          toast.success(t('adminCreated'), {
            description: `${adminEmail} ${t('adminCreatedDesc')}`
          });
        }
      } else if (action === 'edit') {
        await editSectorMutation.mutateAsync({
          id: sector.id,
          name,
          description,
          status
        });
        
        toast.success(t('sectorUpdated'), {
          description: t('sectorUpdatedDesc')
        });
      } else if (action === 'delete') {
        await deleteSectorMutation.mutateAsync(sector.id);
        
        toast.success(t('sectorDeleted'), {
          description: t('sectorDeletedDesc')
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Sector action error:', error);
      toast.error(t('operationFailed') || 'Əməliyyat uğursuz oldu', {
        description: error.message || t('tryAgainLater') || 'Zəhmət olmasa yenidən cəhd edin'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDialogTitle = () => {
    switch (action) {
      case 'create': return t('createSector') || 'Sektor yarat';
      case 'edit': return t('editSector') || 'Sektoru redaktə et';
      case 'delete': return t('deleteSector') || 'Sektoru sil';
      default: return '';
    }
  };
  
  const getDialogClass = () => {
    return action === 'delete' ? 'sm:max-w-md' : 'sm:max-w-lg';
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={getDialogClass()}>
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          {action === 'delete' ? (
            <div className="py-4">
              <p className="text-center mb-2">
                {t('deleteSectorConfirmation') || 'Bu sektoru silmək istədiyinizə əminsiniz?'}:
                <span className="font-medium"> {sector?.name}</span>
              </p>
              <p className="text-center text-muted-foreground text-sm">
                {t('deleteSectorWarning') || 'Bu əməliyyat geri qaytarıla bilməz.'}
              </p>
            </div>
          ) : action === 'create' ? (
            <div className="space-y-4">
              <Accordion type="single" collapsible defaultValue="sector" className="w-full">
                <AccordionItem value="sector">
                  <AccordionTrigger className="text-lg font-medium">
                    {t('sectorInfo') || 'Sektor məlumatları'}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('name') || 'Ad'}</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t('enterSectorName') || 'Sektor adını daxil edin'}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">{t('description') || 'Təsvir'}</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder={t('enterSectorDescription') || 'Sektor haqqında qısa məlumat'}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="status">{t('status') || 'Status'}</Label>
                        <Select value={status} onValueChange={setStatus}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('selectStatus') || 'Status seçin'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">{t('active') || 'Aktiv'}</SelectItem>
                            <SelectItem value="inactive">{t('inactive') || 'Deaktiv'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="admin">
                  <AccordionTrigger className="text-lg font-medium">
                    {t('adminInfo') || 'Admin məlumatları'}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 pt-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="adminName">{t('adminName') || 'Admin adı'}</Label>
                        <Input
                          id="adminName"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          placeholder={t('adminNamePlaceholder') || 'Admin adı və soyadı'}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="adminEmail">{t('adminEmail') || 'Admin email'}</Label>
                        <Input
                          id="adminEmail"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder={t('adminEmailPlaceholder') || 'admin@infoline.edu'}
                          type="email"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="adminPassword">{t('adminPassword') || 'Admin şifrəsi'}</Label>
                        <Input
                          id="adminPassword"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="Password123"
                          type="password"
                        />
                        <p className="text-xs text-muted-foreground">
                          {t('adminPasswordInfo') || "Admin hesabı standart şifrəsi ilə yaradılır. İlk girişdən sonra şifrənin dəyişdirilməsi tövsiyə olunur."}
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t('name') || 'Ad'}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('enterSectorName') || 'Sektor adı'}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">{t('description') || 'Təsvir'}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('enterSectorDescription') || 'Sektor təsviri'}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">{t('status') || 'Status'}</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('selectStatus') || 'Status seçin'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t('active') || 'Aktiv'}</SelectItem>
                    <SelectItem value="inactive">{t('inactive') || 'Deaktiv'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              {t('cancel') || 'Ləğv et'}
            </Button>
            <Button
              type="submit"
              variant={action === 'delete' ? 'destructive' : 'default'}
              disabled={
                isLoading ||
                ((action === 'create' || action === 'edit') && !name)
              }
            >
              {isLoading
                ? (t('processing') || 'İcra olunur...')
                : action === 'create'
                  ? (t('create') || 'Yarat')
                  : action === 'edit'
                    ? (t('save') || 'Yadda saxla')
                    : (t('delete') || 'Sil')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SectorActionDialog;
