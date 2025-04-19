import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePermissions } from '@/hooks/auth/usePermissions';
import { supabase } from '@/integrations/supabase/client';

interface UserFormProps {
  initialData: any;
  onChange: (data: any) => void;
  isEditMode?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onChange,
  isEditMode = false
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
      ...initialData,
      [field]: value
    });
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
      } catch (error) {
        console.error('Error fetching regions:', error);
      } finally {
        setLoading(prev => ({ ...prev, regions: false }));
      }
    };
    
    if (isSuperAdmin || isRegionAdmin) {
      fetchRegions();
    }
  }, [isSuperAdmin, isRegionAdmin]);

  // Sektorları yükləyək
  useEffect(() => {
    const fetchSectors = async () => {
      if (!initialData.regionId) {
        setSectors([]);
        return;
      }
      
      setLoading(prev => ({ ...prev, sectors: true }));
      try {
        const { data, error } = await supabase
          .from('sectors')
          .select('id, name')
          .eq('region_id', initialData.regionId)
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        setSectors(data || []);
      } catch (error) {
        console.error('Error fetching sectors:', error);
      } finally {
        setLoading(prev => ({ ...prev, sectors: false }));
      }
    };
    
    fetchSectors();
  }, [initialData.regionId]);

  // Məktəbləri yükləyək
  useEffect(() => {
    const fetchSchools = async () => {
      if (!initialData.sectorId) {
        setSchools([]);
        return;
      }
      
      setLoading(prev => ({ ...prev, schools: true }));
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id, name')
          .eq('sector_id', initialData.sectorId)
          .eq('status', 'active')
          .order('name');
          
        if (error) throw error;
        setSchools(data || []);
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setLoading(prev => ({ ...prev, schools: false }));
      }
    };
    
    fetchSchools();
  }, [initialData.sectorId]);

  // Region dəyişdikdə sektorId və schoolId sıfırlayaq
  useEffect(() => {
    if (initialData.regionId && !sectors.find(s => s.id === initialData.sectorId)) {
      onChange({
        ...initialData,
        sectorId: '',
        schoolId: ''
      });
    }
  }, [initialData.regionId, sectors, initialData.sectorId]);

  // Sektor dəyişdikdə schoolId sıfırlayaq
  useEffect(() => {
    if (initialData.sectorId && !schools.find(s => s.id === initialData.schoolId)) {
      onChange({
        ...initialData,
        schoolId: ''
      });
    }
  }, [initialData.sectorId, schools, initialData.schoolId]);

  return (
    <div className="space-y-6 py-4">
      {/* Əsas məlumatlar */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">{t('fullName')} *</Label>
          <Input
            id="fullName"
            value={initialData.fullName || ''}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder={t('enterFullName')}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">{t('email')} *</Label>
          <Input
            id="email"
            type="email"
            value={initialData.email || ''}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder={t('enterEmail')}
            required
            disabled={isEditMode} // Redaktə zamanı e-poçt dəyişdirilə bilməz
          />
        </div>
        
        {!isEditMode && (
          <div className="space-y-2">
            <Label htmlFor="password">{t('password')} *</Label>
            <Input
              id="password"
              type="password"
              value={initialData.password || ''}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder={t('enterPassword')}
              required
            />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="phone">{t('phone')}</Label>
          <Input
            id="phone"
            value={initialData.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder={t('enterPhone')}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="position">{t('position')}</Label>
          <Input
            id="position"
            value={initialData.position || ''}
            onChange={(e) => handleChange('position', e.target.value)}
            placeholder={t('enterPosition')}
          />
        </div>
      </div>
      
      {/* Rol seçimi */}
      <div className="space-y-2">
        <Label>{t('role')} *</Label>
        <RadioGroup
          value={initialData.role || ''}
          onValueChange={(value) => handleChange('role', value)}
          className="flex flex-col space-y-1"
        >
          {isSuperAdmin && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="superadmin" id="superadmin" />
              <Label htmlFor="superadmin">{t('superadmin')}</Label>
            </div>
          )}
          
          {(isSuperAdmin || isRegionAdmin) && (
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="regionadmin" id="regionadmin" />
              <Label htmlFor="regionadmin">{t('regionadmin')}</Label>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sectoradmin" id="sectoradmin" />
            <Label htmlFor="sectoradmin">{t('sectoradmin')}</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="schooladmin" id="schooladmin" />
            <Label htmlFor="schooladmin">{t('schooladmin')}</Label>
          </div>
        </RadioGroup>
      </div>
      
      {/* Region seçimi */}
      {(initialData.role === 'regionadmin' || initialData.role === 'sectoradmin' || initialData.role === 'schooladmin') && (
        <div className="space-y-2">
          <Label htmlFor="regionId">{t('region')} *</Label>
          <Select
            value={initialData.regionId || ''}
            onValueChange={(value) => handleChange('regionId', value)}
            disabled={loading.regions || !isSuperAdmin}
          >
            <SelectTrigger id="regionId">
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
      
      {/* Sektor seçimi */}
      {(initialData.role === 'sectoradmin' || initialData.role === 'schooladmin') && initialData.regionId && (
        <div className="space-y-2">
          <Label htmlFor="sectorId">{t('sector')} *</Label>
          <Select
            value={initialData.sectorId || ''}
            onValueChange={(value) => handleChange('sectorId', value)}
            disabled={loading.sectors || !initialData.regionId}
          >
            <SelectTrigger id="sectorId">
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
      
      {/* Məktəb seçimi */}
      {initialData.role === 'schooladmin' && initialData.sectorId && (
        <div className="space-y-2">
          <Label htmlFor="schoolId">{t('school')} *</Label>
          <Select
            value={initialData.schoolId || ''}
            onValueChange={(value) => handleChange('schoolId', value)}
            disabled={loading.schools || !initialData.sectorId}
          >
            <SelectTrigger id="schoolId">
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
      
      {/* Dil seçimi */}
      <div className="space-y-2">
        <Label htmlFor="language">{t('language')}</Label>
        <Select
          value={initialData.language || 'az'}
          onValueChange={(value) => handleChange('language', value)}
        >
          <SelectTrigger id="language">
            <SelectValue placeholder={t('selectLanguage')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="az">{t('azerbaijani')}</SelectItem>
            <SelectItem value="en">{t('english')}</SelectItem>
            <SelectItem value="ru">{t('russian')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Status seçimi (yalnız redaktə zamanı) */}
      {isEditMode && (
        <div className="space-y-2">
          <Label htmlFor="status">{t('status')}</Label>
          <Select
            value={initialData.status || 'active'}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder={t('selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default UserForm;
