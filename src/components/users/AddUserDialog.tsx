import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '@/contexts/TranslationContext';
import { toast } from 'sonner';

interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserAdded?: () => void;
}

interface UserFormData {
  email: string;
  full_name: string;
  role: string;
  region_id?: string;
  sector_id?: string;
  school_id?: string;
  phone?: string;
  position?: string;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ 
  open, 
  onClose, 
  onUserAdded 
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    role: 'schooladmin',
    phone: '',
    position: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock user creation - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(t('users.addSuccess') || 'İstifadəçi uğurla əlavə edildi');
      
      if (onUserAdded) {
        onUserAdded();
      }
      
      onClose();
      
      // Reset form
      setFormData({
        email: '',
        full_name: '',
        role: 'schooladmin',
        phone: '',
        position: ''
      });
    } catch (error) {
      toast.error(t('users.addError') || 'İstifadəçi əlavə edilərkən xəta baş verdi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('users.add') || 'İstifadəçi Əlavə Et'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('users.email') || 'E-poçt'}</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">{t('users.fullName') || 'Ad və Soyad'}</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">{t('users.role') || 'Rol'}</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder={t('users.selectRole') || 'Rol seçin'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">{t('roles.superadmin') || 'Super Admin'}</SelectItem>
                <SelectItem value="regionadmin">{t('roles.regionadmin') || 'Region Admin'}</SelectItem>
                <SelectItem value="sectoradmin">{t('roles.sectoradmin') || 'Sektor Admin'}</SelectItem>
                <SelectItem value="schooladmin">{t('roles.schooladmin') || 'Məktəb Admin'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t('users.phone') || 'Telefon'}</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">{t('users.position') || 'Vəzifə'}</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('common.cancel') || 'Ləğv et'}
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (t('common.loading') || 'Yüklənir...') : (t('users.add') || 'Əlavə et')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
