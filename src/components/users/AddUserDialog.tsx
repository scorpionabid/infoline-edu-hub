
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/auth/usePermissions';
import UserForm from './UserForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  filterParams?: {
    regionId?: string;
    sectorId?: string;
    schoolId?: string;
  };
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({ 
  isOpen, 
  onClose, 
  onComplete,
  filterParams = {}
}) => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const { isSuperAdmin, isRegionAdmin, isSectorAdmin } = usePermissions();
  const [loading, setLoading] = useState(false);
  
  // İlkin form məlumatları
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'schooladmin',
    regionId: filterParams.regionId || (isRegionAdmin ? currentUser?.region_id : ''),
    sectorId: filterParams.sectorId || (isSectorAdmin ? currentUser?.sector_id : ''),
    schoolId: filterParams.schoolId || '',
    status: 'active',
    phone: '',
    position: '',
    language: 'az'
  });

  // Form məlumatlarının dəyişməsi
  const handleFormChange = (newData: any) => {
    setFormData(newData);
  };

  // Formu sıfırla
  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'schooladmin',
      regionId: filterParams.regionId || (isRegionAdmin ? currentUser?.region_id : ''),
      sectorId: filterParams.sectorId || (isSectorAdmin ? currentUser?.sector_id : ''),
      schoolId: filterParams.schoolId || '',
      status: 'active',
      phone: '',
      position: '',
      language: 'az'
    });
  };

  // İstifadəçi əlavə et
  const handleAddUser = async () => {
    // Vacib sahələri yoxla
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error(t('pleaseCompleteRequiredFields'));
      return;
    }

    // Rola uyğun olaraq region, sektor və məktəb seçimini yoxla
    if (formData.role === 'regionadmin' && !formData.regionId) {
      toast.error(t('pleaseSelectRegion'));
      return;
    }

    if (formData.role === 'sectoradmin' && (!formData.regionId || !formData.sectorId)) {
      toast.error(t('pleaseSelectRegionAndSector'));
      return;
    }

    if (formData.role === 'schooladmin' && (!formData.regionId || !formData.sectorId || !formData.schoolId)) {
      toast.error(t('pleaseSelectRegionSectorAndSchool'));
      return;
    }

    setLoading(true);
    try {
      // İstifadəçi yaratmaq üçün Supabase Auth istifadə et
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // İstifadəçi məlumatlarını profiles cədvəlinə əlavə et
        const { error: dbError } = await supabase.from('profiles').insert({
          id: authData.user.id,
          email: formData.email,
          full_name: formData.fullName,
          role: formData.role,
          region_id: formData.regionId || null,
          sector_id: formData.sectorId || null,
          school_id: formData.schoolId || null,
          status: 'active',
          phone: formData.phone || null,
          position: formData.position || null,
          language: formData.language || 'az',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (dbError) throw dbError;

        toast.success(t('userAddedSuccessfully'));
        resetForm();
        onComplete();
      }
    } catch (error: any) {
      console.error('Error adding user:', error);
      toast.error(error.message || t('errorAddingUser'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('addNewUser')}</DialogTitle>
          <DialogDescription>
            {t('addUserDescription')}
          </DialogDescription>
        </DialogHeader>
        
        <UserForm 
          initialData={formData}
          onChange={handleFormChange}
          isEditMode={false}
        />
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t('cancel')}
          </Button>
          
          <Button
            onClick={handleAddUser}
            disabled={loading}
          >
            {loading ? t('adding') : t('addUser')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
