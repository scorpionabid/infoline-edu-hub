import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { CategoryFilter } from '@/types/category';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useRouter, usePathname } from 'next/router';

interface CategoryFilterCardProps {
  filter: CategoryFilter;
  onFilterChange: (newFilter: Partial<CategoryFilter>) => void;
}

export function CategoryFilterCard({ filter, onFilterChange }: CategoryFilterCardProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  // Filter options
  const statusOptions = [
    { value: "pending", label: t("pending"), icon: <AlertCircle className="mr-2 h-4 w-4" /> },
    { value: "completed", label: t("completed"), icon: <CheckCircle className="mr-2 h-4 w-4" /> },
    { value: "dueSoon", label: t("dueSoon"), icon: <Clock className="mr-2 h-4 w-4" /> },
    { value: "overdue", label: t("overdue"), icon: <AlertTriangle className="mr-2 h-4 w-4" /> },
    { value: "draft", label: t("draft"), icon: <FileEdit className="mr-2 h-4 w-4" /> },
    { value: "approved", label: t("approved"), icon: <CheckCircle className="mr-2 h-4 w-4" /> },
    { value: "rejected", label: t("rejected"), icon: <XCircle className="mr-2 h-4 w-4" /> }
  ];

  const assignmentOptions = [
    { value: "all", label: t("allUsers") },
    { value: "sectors", label: t("sectorsOnly") }
  ];

  // Handlers
  const handleStatusFilter = (statuses: FormStatus[]) => {
    onFilterChange({ ...filter, status: statuses });
  };

  const handleAssignmentFilter = (assignment: AssignmentType | null) => {
    onFilterChange({ ...filter, assignment: assignment || undefined });
  };

  const handleSearchFilter = (search: string) => {
    onFilterChange({ ...filter, search: search || undefined });
  };

  const handleResetFilter = () => {
    onFilterChange({});
    // Update the URL to remove query params
    router.push(pathname);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('status')}</Label>
          <Select
            value={filter.status || 'all'}
            onValueChange={(value) => onFilterChange({ status: value as CategoryFilter['status'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('allStatuses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="active">{t('active')}</SelectItem>
              <SelectItem value="inactive">{t('inactive')}</SelectItem>
              <SelectItem value="draft">{t('draft')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>{t('assignment')}</Label>
          <Select
            value={filter.assignment || 'all'}
            onValueChange={(value) => onFilterChange({ assignment: value as CategoryFilter['assignment'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('allAssignments')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allAssignments')}</SelectItem>
              <SelectItem value="sectors">{t('onlySectors')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('deadline')}</Label>
          <Select
            value={filter.deadline || 'all'}
            onValueChange={(value) => onFilterChange({ deadline: value as CategoryFilter['deadline'] })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('allDeadlines')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allDeadlines')}</SelectItem>
              <SelectItem value="upcoming">{t('upcomingDeadlines')}</SelectItem>
              <SelectItem value="past">{t('pastDeadlines')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CategoryFilterCard;
