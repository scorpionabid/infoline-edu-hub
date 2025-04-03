
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { AdminDialog } from './school-dialogs/AdminDialog';
import { School } from '@/types/school';

interface SchoolAdminDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  school: School | null;
  onAssignAdmin: (schoolId: string, adminData: any) => Promise<boolean>;
  onUnassignAdmin: (schoolId: string) => Promise<boolean>;
  onResetPassword: (userId: string, password: string) => Promise<boolean>;
  onClose: () => void;
}

export const SchoolAdminDialog: React.FC<SchoolAdminDialogProps> = ({
  isOpen,
  onOpenChange,
  school,
  onAssignAdmin,
  onUnassignAdmin,
  onResetPassword,
  onClose
}) => {
  const { t } = useLanguage();
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && school) {
      // Əgər məktəbin artıq bir admini varsa, onu yükləyəcəyik
      if (school.adminEmail) {
        setAdmin({
          id: school.id,
          email: school.adminEmail,
          fullName: school.adminName,
          schoolName: school.name,
          regionName: school.regionName,
          sectorName: school.sectorName
        });
      } else {
        setAdmin(null);
      }
    }
  }, [isOpen, school]);

  const handleAdminUpdate = async (adminData: any) => {
    if (!school) return;
    
    setLoading(true);
    try {
      if (adminData) {
        // Admin məlumatlarını yeniləmə
        await onAssignAdmin(school.id, adminData);
      } else {
        // Admini silmə
        await onUnassignAdmin(school.id);
      }
      onClose();
    } catch (error) {
      console.error('Admin yeniləmə xətası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (newPassword: string) => {
    if (!admin || !admin.id) return;
    
    setLoading(true);
    try {
      await onResetPassword(admin.id, newPassword);
    } catch (error) {
      console.error('Şifrə yeniləmə xətası:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminDialog
      open={isOpen}
      onOpenChange={onOpenChange}
      school={school}
      admin={admin}
      onSubmit={handleAdminUpdate}
      onResetPassword={handleResetPassword}
    />
  );
};
