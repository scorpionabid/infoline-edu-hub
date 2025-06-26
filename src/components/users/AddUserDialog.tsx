import React, { useState } from 'react';
import { useLanguageSafe } from '@/context/LanguageContext';
import { UserRole } from '@/types/user';
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
  const { t } = useLanguageSafe();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isLoading, setIsLoading] = useState(false);
  const { toast: showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock user creation for now
      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast({
        title: t('userCreated') || 'İstifadəçi yaradıldı',
        description: t('userCreatedSuccessfully') || 'İstifadəçi uğurla yaradıldı',
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      showToast({
        variant: 'destructive',
        title: t('error') || 'Xəta',
        description: error.message || t('userCreationFailed') || 'İstifadəçi yaradıla bilmədi',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('createUser')}</DialogTitle>
          <DialogDescription>
            {t('createUserDescription')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">{t('fullName')}</Label>
            <Input
              id="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t('fullNamePlaceholder')}
              // required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">{t('email')}</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              // required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">{t('password')}</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('passwordPlaceholder')}
              // required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">{t('role')}</Label>
            <Select onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder={t('selectRole')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="superadmin">{t('superadmin')}</SelectItem>
                <SelectItem value="regionadmin">{t('regionadmin')}</SelectItem>
                <SelectItem value="sectoradmin">{t('sectoradmin')}</SelectItem>
                <SelectItem value="schooladmin">{t('schooladmin')}</SelectItem>
                <SelectItem value="teacher">{t('teacher')}</SelectItem>
                <SelectItem value="user">{t('user')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? t('creating') : t('createUser')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
