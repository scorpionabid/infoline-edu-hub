
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail, KeyRound, User, Globe, School } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';

interface SchoolAdmin {
  id: string;
  email: string;
  fullName?: string;
  regionName?: string;
  sectorName?: string;
  schoolName?: string;
}

interface AdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: any | null;
  admin: SchoolAdmin | null;
  onSubmit: (adminData: any) => void;
  onResetPassword: () => void;
}

export const AdminDialog: React.FC<AdminDialogProps> = ({
  open,
  onOpenChange,
  school,
  admin,
  onSubmit,
  onResetPassword
}) => {
  const { t } = useLanguage();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (e.target.value.length < 6) {
      setPasswordError(t('passwordTooShort'));
    } else {
      setPasswordError('');
    }
  };

  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      setPasswordError(t('passwordTooShort'));
      return;
    }
    
    // Burada parol yeniləmə funksiyasını çağırmaq olar
    toast.success(t('passwordResetSuccess'));
    setShowPasswordReset(false);
    setNewPassword('');
    onResetPassword();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) {
        setShowPasswordReset(false);
        setNewPassword('');
        setPasswordError('');
      }
      onOpenChange(isOpen);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('schoolAdmin')}</DialogTitle>
          <DialogDescription>
            {t('manageSchoolAdmin')}
          </DialogDescription>
        </DialogHeader>
        
        {admin && (
          <div className="grid gap-4 py-4">
            {!showPasswordReset ? (
              <>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="adminEmail">{t('email')}</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span id="adminEmail">{admin.email}</span>
                  </div>
                </div>
                
                {admin.fullName && (
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="adminName">{t('name')}</Label>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span id="adminName">{admin.fullName}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="adminSchool">{t('school')}</Label>
                  <div className="flex items-center gap-2">
                    <School className="h-4 w-4 text-muted-foreground" />
                    <span id="adminSchool">{school?.name || admin.schoolName}</span>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="adminRegion">{t('regionSector')}</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span id="adminRegion">
                      {school?.regionName || admin.regionName} / {school?.sectorName || admin.sectorName}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="newPassword">{t('newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder={t('enterNewPassword')}
                    className={passwordError ? "border-red-500" : ""}
                  />
                  {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{t('passwordResetNote')}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!showPasswordReset ? (
            <>
              <Button variant="outline" onClick={() => setShowPasswordReset(true)}>
                <KeyRound className="h-4 w-4 mr-2" />
                {t('changePassword')}
              </Button>
              <Button onClick={() => onSubmit(admin)}>
                <User className="h-4 w-4 mr-2" />
                {t('update')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowPasswordReset(false)}>
                {t('cancel')}
              </Button>
              <Button 
                onClick={handleResetPassword}
                disabled={newPassword.length < 6}
              >
                {t('resetPassword')}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
