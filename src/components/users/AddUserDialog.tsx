import React, { useState } from 'react';
import { useTranslation } from '@/contexts/TranslationContext';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { UserRole } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from 'sonner';
import { useToast } from '@/components/ui/use-toast';

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess 
}) => {
  const { t } = useTranslation();
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin } = usePermissions();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);
  const { toast: showToast } = useToast();

  // İcazələrə görə rol seçimləri
  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return ['superadmin', 'regionadmin', 'sectoradmin', 'schooladmin', 'teacher', 'user'];
    } else if (isRegionAdmin) {
      return ['sectoradmin', 'schooladmin', 'teacher', 'user'];
    } else if (isSectorAdmin) {
      return ['schooladmin', 'teacher', 'user'];
    }
    return ['user'];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasiyası
    if (!fullName.trim()) {
      showToast({
        variant: 'destructive',
        title: t('common.error') || 'Xəta',
        description: 'Ad sahəsi məcburidir',
      });
      return;
    }
    
    if (!email.trim()) {
      showToast({
        variant: 'destructive',
        title: t('common.error') || 'Xəta',
        description: 'E-poçt sahəsi məcburidir',
      });
      return;
    }
    
    if (!password.trim() || password.length < 6) {
      showToast({
        variant: 'destructive',
        title: t('common.error') || 'Xəta',
        description: 'Şifrə ən az 6 simvol olmalıdır',
      });
      return;
    }
    
    if (!role) {
      showToast({
        variant: 'destructive',
        title: t('common.error') || 'Xəta',
        description: 'Rol seçilməlidir',
      });
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('İstifadəçi yaratma əməliyyatı başladı', {
        fullName,
        email,
        role
      });
      
      // Edge function ilə istifadəçi yaratma
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: email,
          password: password,
          userData: {
            full_name: fullName,
            role: role
          }
        }
      });
      
      if (error) {
        console.error('İstifadəçi yaratma xətası:', error);
        throw new Error(error.message || 'İstifadəçi yaradılarkən xəta baş verdi');
      }
      
      console.log('İstifadəçi uğurla yaradıldı:', data);
      
      showToast({
        title: t('userManagement.success.userCreated') || 'İstifadəçi yaradıldı',
        description: t('userManagement.success.userCreated') || 'İstifadəçi uğurla yaradıldı',
      });

      // Form-u təmizlə
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('user');
      
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('İstifadəçi yaratma xətası:', error);
      showToast({
        variant: 'destructive',
        title: t('common.error') || 'Xəta',
        description: error.message || t('userManagement.error.createUser') || 'İstifadəçi yaradıla bilmədi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('userManagement.createUser') || 'İstifadəçi yarat'}</DialogTitle>
          <DialogDescription>
            {t('user.create_user_description') || 'Yeni istifadəçi yaradın'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('common.name') || 'Ad'}</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('common.name') || 'Ad daxil edin'}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{t('common.email') || 'E-poçt'}</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('common.email') || 'E-poçt daxil edin'}
              required
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t('common.password') || 'Şifrə'}</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('common.password') || 'Şifrə daxil edin'}
              required
              minLength={6}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">{t('user.role') || 'Rol'}</Label>
            <Select 
              value={role} 
              onValueChange={(value) => setRole(value as UserRole)}
              disabled={isLoading}
              required
            >
              <SelectTrigger id="role">
                <SelectValue placeholder={t('userManagement.form.role') || 'Rol seçin'} />
              </SelectTrigger>
              <SelectContent>
                {getAvailableRoles().map((roleOption) => (
                  <SelectItem key={roleOption} value={roleOption}>
                    {t(`user.${roleOption}`) || roleOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            disabled={isLoading || !fullName.trim() || !email.trim() || !password.trim() || !role}
            className="w-full"
          >
            {isLoading ? t('common.creating') || 'Yaradılır...' : t('userManagement.createUser') || 'İstifadəçi yarat'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
