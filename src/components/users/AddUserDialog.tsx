import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateUser } from '@/hooks/useCreateUser';
import { useRegions } from '@/hooks/regions/useRegions';
import { useSectors } from '@/hooks/sectors/useSectors';
import { useSchools } from '@/hooks/useSchools';
import { toast } from 'sonner';
import { UserFormData } from '@/types/user';

interface AddUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  entityTypes: Array<'region' | 'sector' | 'school'>;
}

const AddUserDialog: React.FC<AddUserDialogProps> = ({
  isOpen,
  onClose,
  onComplete,
  entityTypes
}) => {
  const { t } = useLanguage();
  const { createUser, loading } = useCreateUser();
  
  // Entity data
  const { regions } = useRegions();
  const { sectors, fetchSectors } = useSectors();
  const { schools, fetchSchoolsBySector } = useSchools();
  
  // Form state - status və language əlavə edildi
  const [userData, setUserData] = useState<UserFormData>({
    email: '',
    password: '',
    fullName: '',
    name: '', // Eyni zamal fullName ilə eyni dəyərdə saxlayırıq
    role: 'schooladmin',
    language: 'az',
    status: 'active'
  });
  
  // Seçilmiş regiondan asılı olaraq sektorları yeniləmək
  useEffect(() => {
    if (userData.role === 'sectoradmin' && userData.region_id) {
      fetchSectors(userData.region_id);
    }
  }, [userData.role, userData.region_id, fetchSectors]);
  
  // Seçilmiş sektordan asılı olaraq məktəbləri yeniləmək
  useEffect(() => {
    if (userData.sectorId) {
      fetchSchoolsBySector(userData.sectorId);
    }
  }, [userData.sectorId, fetchSchoolsBySector]);
  
  // Formu təmizləmək
  const resetForm = () => {
    setUserData({
      email: '',
      password: '',
      fullName: '',
      name: '',
      role: 'schooladmin',
      language: 'az',
      status: 'active'
    });
  };
  
  // Dialog bağlandığında formu təmizləmək
  const handleClose = () => {
    resetForm();
    onClose();
  };
  
  // Input dəyişikliyini işləmək
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => {
      // name fullName olduqda, eyni zamanda name sahəsini də yeniləyək
      if (name === 'fullName') {
        return { ...prev, [name]: value, name: value, full_name: value };
      }
      return { ...prev, [name]: value };
    });
  };
  
  // Select dəyişikliyini işləmək
  const handleSelectChange = (name: string, value: string) => {
    // Əgər region dəyişirsə, sektor və məktəb seçimlərini sıfırla
    if (name === 'regionId') {
      setUserData(prev => ({ 
        ...prev, 
        [name]: value,
        region_id: value,
        sectorId: undefined,
        sector_id: undefined,
        schoolId: undefined,
        school_id: undefined
      }));
    }
    // Əgər sektor dəyişirsə, məktəb seçimini sıfırla
    else if (name === 'sectorId') {
      setUserData(prev => ({ 
        ...prev, 
        [name]: value,
        sector_id: value,
        schoolId: undefined,
        school_id: undefined
      }));
    }
    else if (name === 'schoolId') {
      setUserData(prev => ({ 
        ...prev, 
        [name]: value,
        school_id: value
      }));
    }
    else {
      setUserData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // İstifadəçini yaratmaq
  const handleSubmit = async () => {
    // Validiasiya
    if (!userData.email || !userData.password || !userData.fullName) {
      toast.error(t('requiredFieldsMissing'));
      return;
    }
    
    if (userData.password && userData.password.length < 6) {
      toast.error(t('passwordTooShort'));
      return;
    }
    
    if (userData.role === 'regionadmin' && !userData.regionId) {
      toast.error(t('selectRegion'));
      return;
    }
    
    if (userData.role === 'sectoradmin' && !userData.sectorId) {
      toast.error(t('selectSector'));
      return;
    }
    
    if (userData.role === 'schooladmin' && !userData.schoolId) {
      toast.error(t('selectSchool'));
      return;
    }
    
    try {
      const result = await createUser({
        ...userData,
        full_name: userData.fullName,
        name: userData.fullName
      });
      
      if (result.success) {
        resetForm();
        onComplete();
      }
    } catch (error) {
      console.error('İstifadəçi yaratma xətası:', error);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('addNewUser')}</DialogTitle>
          <DialogDescription>
            {t('fillUserDetails')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Ad Soyad */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">
              {t('fullName')}
            </Label>
            <Input
              id="fullName"
              name="fullName"
              value={userData.fullName}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          
          {/* Email */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              {t('email')}
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          
          {/* Şifrə */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              {t('password')}
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={userData.password}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          
          {/* Rol */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              {t('role')}
            </Label>
            <Select
              value={userData.role}
              onValueChange={(value) => handleSelectChange('role', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('selectRole')} />
              </SelectTrigger>
              <SelectContent>
                {entityTypes.includes('region') && (
                  <SelectItem value="regionadmin">{t('regionadmin')}</SelectItem>
                )}
                {entityTypes.includes('sector') && (
                  <SelectItem value="sectoradmin">{t('sectoradmin')}</SelectItem>
                )}
                {entityTypes.includes('school') && (
                  <SelectItem value="schooladmin">{t('schooladmin')}</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          {/* Region seçimi - əgər region admin və ya digər rollardırsa */}
          {(userData.role === 'regionadmin' || userData.role === 'sectoradmin' || userData.role === 'schooladmin') && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="regionId" className="text-right">
                {t('region')}
              </Label>
              <Select
                value={userData.regionId}
                onValueChange={(value) => handleSelectChange('regionId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectRegion')} />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {region.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Sektor seçimi - əgər sektor admin və ya məktəb admindirsə və region seçilibsə */}
          {(userData.role === 'sectoradmin' || userData.role === 'schooladmin') && userData.regionId && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sectorId" className="text-right">
                {t('sector')}
              </Label>
              <Select
                value={userData.sectorId}
                onValueChange={(value) => handleSelectChange('sectorId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectSector')} />
                </SelectTrigger>
                <SelectContent>
                  {sectors.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Məktəb seçimi - əgər məktəb admindirsə və sektor seçilibsə */}
          {userData.role === 'schooladmin' && userData.sectorId && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="schoolId" className="text-right">
                {t('school')}
              </Label>
              <Select
                value={userData.schoolId}
                onValueChange={(value) => handleSelectChange('schoolId', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('selectSchool')} />
                </SelectTrigger>
                <SelectContent>
                  {schools.map((school) => (
                    <SelectItem key={school.id} value={school.id}>
                      {school.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {/* Telefon - əlavə sahə olaraq */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              {t('phone')}
            </Label>
            <Input
              id="phone"
              name="phone"
              value={userData.phone || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          
          {/* Vəzifə - əlavə sahə olaraq */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="position" className="text-right">
              {t('position')}
            </Label>
            <Input
              id="position"
              name="position"
              value={userData.position || ''}
              onChange={handleChange}
              className="col-span-3"
            />
          </div>
          
          {/* Dil seçimi */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="text-right">
              {t('language')}
            </Label>
            <Select
              value={userData.language || 'az'}
              onValueChange={(value) => handleSelectChange('language', value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="az">{t('azerbaijani')}</SelectItem>
                <SelectItem value="en">{t('english')}</SelectItem>
                <SelectItem value="ru">{t('russian')}</SelectItem>
                <SelectItem value="tr">{t('turkish')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? t('creating') : t('createUser')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
