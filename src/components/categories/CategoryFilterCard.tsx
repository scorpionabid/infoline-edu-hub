
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CategoryStatus } from '@/types/category';
import { useTranslation } from '@/hooks/useTranslation';

export interface CategoryFilterProps {
  title?: string;
  statuses: string[];
  onStatusChange: (status: string, checked: boolean) => void;
  assignments: string[];
  onAssignmentChange: (assignment: string, checked: boolean) => void;
  showArchived: boolean;
  onArchivedChange: (checked: boolean) => void;
}

const CategoryFilterCard: React.FC<CategoryFilterProps> = ({
  title = 'Filters',
  statuses = [],
  onStatusChange,
  assignments = [],
  onAssignmentChange,
  showArchived,
  onArchivedChange
}) => {
  const { t } = useTranslation();
  
  // Available status options
  const statusOptions = [
    { value: 'all', label: t('all') },
    { value: 'active', label: t('active'), color: 'bg-green-500' },
    { value: 'draft', label: t('draft'), color: 'bg-yellow-500' },
    { value: 'approved', label: t('approved'), color: 'bg-blue-500' },
    { value: 'pending', label: t('pending'), color: 'bg-orange-500' }
  ];
  
  // Available assignment options
  const assignmentOptions = [
    { value: 'all', label: t('all') },
    { value: 'schools', label: t('schools') },
    { value: 'sectors', label: t('sectors') }
  ];
  
  // Handle status checkbox changes
  const handleStatusChange = (status: string, checked: boolean) => {
    onStatusChange(status, checked);
  };
  
  // Handle assignment checkbox changes
  const handleAssignmentChange = (assignment: string, checked: boolean) => {
    onAssignmentChange(assignment, checked);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">{t('status')}</h3>
            <div className="space-y-2">
              {statusOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`status-${option.value}`} 
                    checked={statuses.includes(option.value)} 
                    onCheckedChange={(checked: boolean) => handleStatusChange(option.value, checked)}
                  />
                  <Label htmlFor={`status-${option.value}`} className="flex items-center cursor-pointer">
                    {option.value !== 'all' && (
                      <Badge variant="outline" className={`mr-2 w-3 h-3 rounded-full ${option.color}`}>&nbsp;</Badge>
                    )}
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="font-medium mb-2">{t('assignment')}</h3>
            <div className="space-y-2">
              {assignmentOptions.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`assignment-${option.value}`} 
                    checked={assignments.includes(option.value)} 
                    onCheckedChange={(checked: boolean) => handleAssignmentChange(option.value, checked)}
                  />
                  <Label htmlFor={`assignment-${option.value}`}>{option.label}</Label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="show-archived" 
              checked={showArchived} 
              onCheckedChange={(checked: boolean) => onArchivedChange(checked)}
            />
            <Label htmlFor="show-archived">{t('showArchived')}</Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryFilterCard;
