
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { RegionFormData } from '@/types/region';
import { Eye, EyeOff } from 'lucide-react';

interface AddRegionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (formData: RegionFormData) => Promise<boolean>;
  includeAdmin?: boolean;
}

const AddRegionDialog: React.FC<AddRegionDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  includeAdmin = true,
}) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<RegionFormData>({
    name: '',
    description: '',
    status: 'active',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('region');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Avtomatik olaraq email ünvanı yaradaq
    if (name === 'name' && includeAdmin) {
      const suggestedEmail = value
        ? `${value.toLowerCase().replace(/\s+/g, '.')}.admin@infoline.edu`
        : '';
      
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        adminEmail: suggestedEmail,
        adminName: value ? `${value} Admin` : '',
      }));
    }
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      const success = await onSubmit(formData);
      
      if (success) {
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Region əlavə edilərkən xəta:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active',
      adminName: '',
      adminEmail: '',
      adminPassword: '',
    });
    setCurrentTab('region');
  };

  const isRegionValid = formData.name.trim() !== '';
  const isAdminValid = !includeAdmin || (
    formData.adminName?.trim() !== '' &&
    formData.adminEmail?.trim() !== '' &&
    formData.adminPassword?.trim() !== '' &&
    formData.adminPassword!.length >= 6
  );

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetForm();
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addRegion')}</DialogTitle>
          <DialogDescription>{t('addRegionDescription')}</DialogDescription>
        </DialogHeader>
        
        <div className="flex space-x-2 mb-4">
          <Button
            variant={currentTab === 'region' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => handleTabChange('region')}
            type="button"
          >
            {t('regionInfo')}
          </Button>
          {includeAdmin && (
            <Button
              variant={currentTab === 'admin' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => handleTabChange('admin')}
              type="button"
              disabled={!isRegionValid}
            >
              {t('adminInfo')}
            </Button>
          )}
        </div>
        
        {currentTab === 'region' ? (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('name')}</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('regionNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Input
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('regionDescriptionPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">{t('status')}</Label>
              <select 
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full p-2 rounded-md border border-input bg-background"
              >
                <option value="active">{t('active')}</option>
                <option value="inactive">{t('inactive')}</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="adminName">{t('adminName')}</Label>
              <Input
                id="adminName"
                name="adminName"
                value={formData.adminName}
                onChange={handleChange}
                placeholder={t('adminNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminEmail">{t('adminEmail')}</Label>
              <Input
                id="adminEmail"
                name="adminEmail"
                value={formData.adminEmail}
                onChange={handleChange}
                placeholder="email@example.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPassword">{t('adminPassword')}</Label>
              <div className="relative">
                <Input
                  id="adminPassword"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  placeholder="******"
                  type={showPassword ? "text" : "password"}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {formData.adminPassword && formData.adminPassword.length < 6 && (
                <p className="text-sm text-destructive">
                  {t('passwordMinLength')}
                </p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <div className="flex gap-2">
            {currentTab === 'admin' && includeAdmin && (
              <Button
                variant="outline"
                onClick={() => handleTabChange('region')}
                type="button"
              >
                {t('back')}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              {t('cancel')}
            </Button>
          </div>
          {currentTab === 'region' ? (
            includeAdmin ? (
              <Button
                disabled={!isRegionValid || loading}
                onClick={() => handleTabChange('admin')}
                type="button"
              >
                {t('next')}
              </Button>
            ) : (
              <Button
                disabled={!isRegionValid || loading}
                onClick={handleSubmit}
              >
                {loading ? t('adding') : t('add')}
              </Button>
            )
          ) : (
            <Button
              disabled={!isRegionValid || !isAdminValid || loading}
              onClick={handleSubmit}
            >
              {loading ? t('adding') : t('add')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddRegionDialog;
