
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { UserFilter } from '@/hooks/useUserList';

interface UserFiltersProps {
  filters: UserFilter;
  onApplyFilters: (filters: UserFilter) => void;
  onResetFilters: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onApplyFilters,
  onResetFilters,
}) => {
  const { t } = useLanguage();
  const [localFilters, setLocalFilters] = useState<UserFilter>(filters);

  // İlkin filter değerlerini lokalda saxlayaq
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Filterləri dəyişdirmək üçün handler
  const handleFilterChange = (key: keyof UserFilter, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Filterləri tətbiq et
  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role-filter">{t('role')}</Label>
          <Select
            value={localFilters.role || ''}
            onValueChange={(value) => handleFilterChange('role', value)}
          >
            <SelectTrigger id="role-filter">
              <SelectValue placeholder={t('selectRole')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('all')}</SelectItem>
              <SelectItem value="superadmin">{t('superadmin')}</SelectItem>
              <SelectItem value="regionadmin">{t('regionadmin')}</SelectItem>
              <SelectItem value="sectoradmin">{t('sectoradmin')}</SelectItem>
              <SelectItem value="schooladmin">{t('schooladmin')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="status-filter">{t('status')}</Label>
          <Select
            value={localFilters.status || ''}
            onValueChange={(value) => handleFilterChange('status', value)}
          >
            <SelectTrigger id="status-filter">
              <SelectValue placeholder={t('selectStatus')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('all')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
              <SelectItem value="blocked">{t('blocked')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="region-filter">{t('region')}</Label>
          <Select
            value={localFilters.region || ''}
            onValueChange={(value) => handleFilterChange('region', value)}
          >
            <SelectTrigger id="region-filter">
              <SelectValue placeholder={t('selectRegion')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('all')}</SelectItem>
              {/* Regionlar burada dinamik əlavə ediləcək */}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onResetFilters}>
          {t('resetFilters')}
        </Button>
        <Button onClick={handleApply}>
          {t('applyFilters')}
        </Button>
      </div>
    </div>
  );
};

export default UserFilters;
