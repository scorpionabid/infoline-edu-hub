
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Role } from '@/context/auth/types'; 
import { useLanguage } from '@/context/LanguageContext';
import { Label } from '@/components/ui/label';

interface UserFilter {
  role: string[];
  status: string[];
  region: string[];
  sector: string[];
  school: string[];
}

interface UserFiltersProps {
  onFilterChange: (filters: UserFilter) => void;
  availableRoles: Role[];
}

const UserFilters: React.FC<UserFiltersProps> = ({ onFilterChange, availableRoles }) => {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<UserFilter>({
    role: [],
    status: [],
    region: [],
    sector: [],
    school: [],
  });

  const handleRoleChange = (role: string, checked: boolean) => {
    const newRoles = checked 
      ? [...filters.role, role] 
      : filters.role.filter(r => r !== role);
    
    const newFilters = { ...filters, role: newRoles };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatuses = checked
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    
    const newFilters = { ...filters, status: newStatuses };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: UserFilter = {
      role: [],
      status: [],
      region: [],
      sector: [],
      school: [],
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <Card>
      <CardContent className="space-y-4">
        <h4 className="font-medium">{t('filters')}</h4>

        <div>
          <h5 className="mb-2">{t('role')}</h5>
          <div className="space-y-2">
            {availableRoles.map((role) => (
              <div key={role} className="flex items-center space-x-2">
                <Checkbox 
                  id={`role-${role}`} 
                  checked={filters.role.includes(role)}
                  onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                />
                <Label htmlFor={`role-${role}`}>{t(role)}</Label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h5 className="mb-2">{t('status')}</h5>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="status-active" 
                checked={filters.status.includes('active')}
                onCheckedChange={(checked) => handleStatusChange('active', checked as boolean)}
              />
              <Label htmlFor="status-active">{t('active')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="status-inactive" 
                checked={filters.status.includes('inactive')}
                onCheckedChange={(checked) => handleStatusChange('inactive', checked as boolean)}
              />
              <Label htmlFor="status-inactive">{t('inactive')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="status-blocked" 
                checked={filters.status.includes('blocked')}
                onCheckedChange={(checked) => handleStatusChange('blocked', checked as boolean)}
              />
              <Label htmlFor="status-blocked">{t('blocked')}</Label>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          {t('clearFilters')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserFilters;
