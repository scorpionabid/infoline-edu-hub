
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryStatus, CategoryAssignment } from '@/types/category.d';

export type FormStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'all';
export type AssignmentType = 'all' | 'sectors' | 'schools';

export interface CategoryFilter {
  status?: CategoryStatus | 'all';
  assignment?: AssignmentType | 'all';
  search?: string;
}

interface CategoryFilterCardProps {
  filter: CategoryFilter;
  onFilterChange: (filter: CategoryFilter) => void;
}

export const CategoryFilterCard: React.FC<CategoryFilterCardProps> = ({
  filter,
  onFilterChange,
}) => {
  const { t } = useLanguage();
  
  const handleStatusChange = (status: CategoryStatus | 'all') => {
    onFilterChange({ ...filter, status });
  };

  const handleAssignmentChange = (assignment: AssignmentType) => {
    onFilterChange({ ...filter, assignment });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('filters')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="mb-2 font-semibold">{t('status')}</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="status-all" 
                checked={filter.status === 'all'} 
                onCheckedChange={() => handleStatusChange('all')}
              />
              <Label htmlFor="status-all">{t('all')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="status-active" 
                checked={filter.status === 'active'} 
                onCheckedChange={() => handleStatusChange('active')}
              />
              <Label htmlFor="status-active">{t('active')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="status-inactive" 
                checked={filter.status === 'inactive'} 
                onCheckedChange={() => handleStatusChange('inactive')}
              />
              <Label htmlFor="status-inactive">{t('inactive')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="status-draft" 
                checked={filter.status === 'draft'} 
                onCheckedChange={() => handleStatusChange('draft')}
              />
              <Label htmlFor="status-draft">{t('draft')}</Label>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="mb-2 font-semibold">{t('assignment')}</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="assignment-all" 
                checked={filter.assignment === 'all'} 
                onCheckedChange={() => handleAssignmentChange('all')}
              />
              <Label htmlFor="assignment-all">{t('all')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="assignment-all-users" 
                checked={filter.assignment === 'all'} 
                onCheckedChange={() => handleAssignmentChange('all')}
              />
              <Label htmlFor="assignment-all-users">{t('allUsers')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="assignment-sectors" 
                checked={filter.assignment === 'sectors'} 
                onCheckedChange={() => handleAssignmentChange('sectors')}
              />
              <Label htmlFor="assignment-sectors">{t('sectorOnly')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="assignment-schools" 
                checked={filter.assignment === 'schools'} 
                onCheckedChange={() => handleAssignmentChange('schools')}
              />
              <Label htmlFor="assignment-schools">{t('schoolsOnly')}</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilterCard;
