import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Role } from '@/context/auth/types';
import { useLanguage } from '@/context/LanguageContext';
import { UserFilter } from './UserSelectParts/types';

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

  const handleFilterChange = (filterType: keyof UserFilter, values: string[]) => {
    const newFilters = { ...filters, [filterType]: values };
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
          <CheckboxGroup
            defaultValue={filters.role}
            onValueChange={(values) => handleFilterChange('role', values)}
          >
            {availableRoles.map((role) => (
              <CheckboxItem key={role} value={role}>
                {t(role)}
              </CheckboxItem>
            ))}
          </CheckboxGroup>
        </div>

        <div>
          <h5 className="mb-2">{t('status')}</h5>
          <CheckboxGroup
            defaultValue={filters.status}
            onValueChange={(values) => handleFilterChange('status', values)}
          >
            <CheckboxItem value="active">{t('active')}</CheckboxItem>
            <CheckboxItem value="inactive">{t('inactive')}</CheckboxItem>
            <CheckboxItem value="blocked">{t('blocked')}</CheckboxItem>
          </CheckboxGroup>
        </div>

        <Button variant="outline" size="sm" onClick={handleClearFilters}>
          {t('clearFilters')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default UserFilters;
