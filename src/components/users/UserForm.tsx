import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { supabase } from '@/integrations/supabase/client';

interface UserFormProps {
  formData: any;
  onChange: (data: any) => void;
  isEditMode?: boolean;
  disableFields?: string[];
  requiredFields?: string[];
}

const UserForm: React.FC<UserFormProps> = ({
  formData,
  onChange,
  isEditMode = false,
  disableFields = [],
  requiredFields = ['fullName', 'email', 'password', 'role']
}) => {
  const { t } = useLanguage();
  const { isSuperAdmin, isRegionAdmin } = usePermissions();
  const [regions, setRegions] = useState<any[]>([]);
  const [sectors, setSectors] = useState<any[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    regions: false,
    sectors: false,
    schools: false
  });

  // Form məlumatlarını yeniləyək
  const handleChange = (field: string, value: any) => {
    onChange({
      ...formData,
      [field]: value
    });
  };

  // Sahənin disabled olub-olmadığını yoxlayaq
  const isFieldDisabled = (fieldName: string): boolean => {
    return disableFields.includes(fieldName);
  };

  // Sahənin required olub-olmadığını yoxlayaq
  const isFieldRequired = (fieldName: string): boolean => {
    return requiredFields.includes(fieldName);
  };

  // Regionları yükləyək
  useEffect(() => {
    const fetchRegions = async () => {
      setLoading(prev => ({ ...prev, regions: true }));
      try {
        const { data, error } = await supabase
          .from('regions')
          .select('id, name')
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        setRegions(data || []);
      } catch (err) {
        console.error('Error fetching regions:', err);
      } finally {
        setLoading(prev => ({ ...prev, regions: false }));
      }
    };

    fetchRegions();
  }, []);

  // Regionu dəyişdikdə sektorları yükləyək
  useEffect(() => {
    if (!formData.regionId) {
      setSectors([]);
      return;
    }

    const fetchSectors = async () => {
      setLoading(prev => ({ ...prev, sectors: true }));
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('id, name')
          .eq('region_id', formData.regionId)
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        setSectors(data || []);
      } catch (err) {
        console.error('Error fetching sectors:', err);
      } finally {
        setLoading(prev => ({ ...prev, sectors: false }));
      }
    };

    fetchSectors();
  }, [formData.regionId]);

  // Sektoru dəyişdikdə məktəbləri yükləyək
  useEffect(() => {
    if (!formData.sectorId) {
      setSchools([]);
      return;
    }

    const fetchSchools = async () => {
      setLoading(prev => ({ ...prev, schools: true }));
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id, name')
          .eq('sector_id', formData.sectorId)
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        setSchools(data || []);
      } catch (err) {
        console.error('Error fetching schools:', err);
      } finally {
        setLoading(prev => ({ ...prev, schools: false }));
      }
    };

    fetchSchools();
  }, [formData.sectorId]);

  return (
    <div className="grid gap-4 py-4">
      {/* Ad Soyad */}
      {!isFieldDisabled('fullName') && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="fullName" className="text-right">
            {t('fullName')} {isFieldRequired('fullName') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            className="col-span-3"
            disabled={isFieldDisabled('fullName')}
            required={isFieldRequired('fullName')}
          />
        </div>
      )}

      {/* E-poçt */}
      {!isFieldDisabled('email') && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="email" className="text-right">
            {t('email')} {isFieldRequired('email') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="col-span-3"
            disabled={isFieldDisabled('email') || isEditMode}
            required={isFieldRequired('email')}
          />
        </div>
      )}

      {/* Şifrə */}
      {!isFieldDisabled('password') && !isEditMode && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">
            {t('password')} {isFieldRequired('password') && <span className="text-red-500">*</span>}
          </Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            className="col-span-3"
            disabled={isFieldDisabled('password')}
            required={isFieldRequired('password')}
          />
        </div>
      )}

      {/* Telefon */}
      {!isFieldDisabled('phone') && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="phone" className="text-right">
            {t('phone')}
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="col-span-3"
            disabled={isFieldDisabled('phone')}
          />
        </div>
      )}

      {/* Vəzifə */}
      {!isFieldDisabled('position') && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="position" className="text-right">
            {t('position')}
          </Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => handleChange('position', e.target.value)}
            className="col-span-3"
            disabled={isFieldDisabled('position')}
          />
        </div>
      )}

      {/* Rol */}
      {!isFieldDisabled('role') && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">
            {t('role')} {isFieldRequired('role') && <span className="text-red-500">*</span>}
          </Label>
          <div className="col-span-3">
            <RadioGroup
              value={formData.role}
              onValueChange={(value) => handleChange('role', value)}
              className="flex flex-col space-y-1"
              disabled={isFieldDisabled('role')}
            >
              {isSuperAdmin && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="regionadmin" id="regionadmin" />
                  <Label htmlFor="regionadmin">{t('regionadmin')}</Label>
                </div>
              )}
              {(isSuperAdmin || isRegionAdmin) && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sectoradmin" id="sectoradmin" />
                  <Label htmlFor="sectoradmin">{t('sectoradmin')}</Label>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="schooladmin" id="schooladmin" />
                <Label htmlFor="schooladmin">{t('schooladmin')}</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )}

      {/* Region */}
      {!isFieldDisabled('regionId') && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="regionId" className="text-right">
            {t('region')} {isFieldRequired('regionId') && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={formData.regionId}
            onValueChange={(value) => handleChange('regionId', value)}
            disabled={isFieldDisabled('regionId') || !isSuperAdmin || loading.regions}
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

      {/* Sektor */}
      {!isFieldDisabled('sectorId') && formData.role !== 'regionadmin' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sectorId" className="text-right">
            {t('sector')} {isFieldRequired('sectorId') && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={formData.sectorId}
            onValueChange={(value) => handleChange('sectorId', value)}
            disabled={isFieldDisabled('sectorId') || !formData.regionId || loading.sectors}
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

      {/* Məktəb */}
      {!isFieldDisabled('schoolId') && formData.role === 'schooladmin' && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="schoolId" className="text-right">
            {t('school')} {isFieldRequired('schoolId') && <span className="text-red-500">*</span>}
          </Label>
          <Select
            value={formData.schoolId}
            onValueChange={(value) => handleChange('schoolId', value)}
            disabled={isFieldDisabled('schoolId') || !formData.sectorId || loading.schools}
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

      {/* Dil */}
      {!isFieldDisabled('language') && (
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="language" className="text-right">
            {t('language')}
          </Label>
          <Select
            value={formData.language}
            onValueChange={(value) => handleChange('language', value)}
            disabled={isFieldDisabled('language')}
          >
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder={t('selectLanguage')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="az">{t('azerbaijani')}</SelectItem>
              <SelectItem value="en">{t('english')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default UserForm;
