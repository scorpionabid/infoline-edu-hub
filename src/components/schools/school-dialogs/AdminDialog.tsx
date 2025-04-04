
import React, { useState, useEffect } from 'react';
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
import { Mail, KeyRound, User, Globe, School as SchoolIcon } from 'lucide-react';
import { School } from '@/data/schoolsData';

interface AdminDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onResetPassword: (newPassword: string) => void;
  selectedAdmin: School | null;
}

export const AdminDialog: React.FC<AdminDialogProps> = ({
  isOpen,
  onClose,
  onUpdate,
  onResetPassword,
  selectedAdmin
}) => {
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Dialog açıldıqda və ya bağlandıqda state-ləri sıfırla
  useEffect(() => {
    if (!isOpen) {
      setShowPasswordReset(false);
      setNewPassword('');
      setPasswordError('');
    }
  }, [isOpen]);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPassword(e.target.value);
    if (e.target.value.length < 6) {
      setPasswordError('Parol minimum 6 simvol olmalıdır');
    } else {
      setPasswordError('');
    }
  };

  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      setPasswordError('Parol minimum 6 simvol olmalıdır');
      return;
    }
    onResetPassword(newPassword);
    setShowPasswordReset(false);
    setNewPassword('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Məktəb admini</DialogTitle>
          <DialogDescription>
            Məktəb admininin məlumatlarını idarə edin.
          </DialogDescription>
        </DialogHeader>
        {selectedAdmin && (
          <div className="grid gap-4 py-4">
            {!showPasswordReset ? (
              <>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="adminEmail">E-poçt</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span id="adminEmail">{selectedAdmin.adminEmail}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="adminSchool">Məktəb</Label>
                  <div className="flex items-center gap-2">
                    <SchoolIcon className="h-4 w-4 text-muted-foreground" />
                    <span id="adminSchool">{selectedAdmin.name}</span>
                  </div>
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="adminRegion">Region/Sektor</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span id="adminRegion">{selectedAdmin.region} / {selectedAdmin.sector}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col space-y-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="newPassword">Yeni parol</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Yeni parol daxil edin (minimum 6 simvol)"
                    className={passwordError ? "border-red-500" : ""}
                  />
                  {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Qeyd: Yeni parol təyin edildikdən sonra admin yeni parol ilə sistemə daxil olmalı olacaq.</p>
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
                Parolu dəyiş
              </Button>
              <Button 
                onClick={onUpdate}
                className="cursor-pointer"
              >
                <User className="h-4 w-4 mr-2" />
                Yenilə
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowPasswordReset(false)}>
                Ləğv et
              </Button>
              <Button 
                onClick={handleResetPassword}
                disabled={newPassword.length < 6}
                className="cursor-pointer"
              >
                Parolu dəyiş
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
