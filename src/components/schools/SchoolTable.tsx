
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserPlus, Mail } from 'lucide-react';
import { School } from '@/types/school';
import { useLanguage } from '@/context/LanguageContext';
import { highlightText } from '@/utils/textUtils';
import EmptyState from '@/components/ui/empty-state';
import { SortConfig } from '@/hooks/schools/useSchoolsStore';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SchoolTableProps {
  currentItems: School[];
  searchTerm: string;
  sortConfig: SortConfig;
  handleSort: (key: keyof School) => void;
  handleEditDialogOpen: (school: School) => void;
  handleDeleteDialogOpen: (school: School) => void;
  handleAdminDialogOpen: (school: School) => void;
  userRole: 'superadmin' | 'regionadmin' | 'sectoradmin' | 'schooladmin';
}

const SchoolTable: React.FC<SchoolTableProps> = ({
  currentItems,
  searchTerm,
  sortConfig,
  handleSort,
  handleEditDialogOpen,
  handleDeleteDialogOpen,
  handleAdminDialogOpen,
  userRole
}) => {
  const { t } = useLanguage();
  
  const getSortIcon = (columnName: keyof School) => {
    if (columnName !== sortConfig.key) {
      return <span className="ml-1 text-gray-300">↕</span>;
    }
    return sortConfig.direction === 'asc' ? (
      <span className="ml-1">↑</span>
    ) : (
      <span className="ml-1">↓</span>
    );
  };

  if (currentItems.length === 0) {
    return (
      <EmptyState
        title={t('noSchoolsFound')}
        description={t('noSchoolsFoundDesc')}
        icon="school"
      />
    );
  }

  return (
    <div className="rounded-md border mt-6 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer w-[30%]"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center">
                {t('schoolName')}
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('principalName')}
            >
              <div className="flex items-center">
                {t('principalName')}
                {getSortIcon('principalName')}
              </div>
            </TableHead>
            <TableHead>{t('region')}</TableHead>
            <TableHead>{t('sector')}</TableHead>
            <TableHead>{t('admin')}</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center">
                {t('status')}
                {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {highlightText(school.name, searchTerm)}
                </div>
              </TableCell>
              <TableCell>
                {school.principalName ? 
                  highlightText(school.principalName, searchTerm) : 
                  <span className="text-muted-foreground italic">{t('notSpecified')}</span>
                }
              </TableCell>
              <TableCell>{school.region || '-'}</TableCell>
              <TableCell>{school.sector || '-'}</TableCell>
              <TableCell>
                {school.admin_email ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="truncate max-w-[150px]">{school.admin_email}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{school.admin_email}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-muted-foreground italic text-sm">{t('noAdmin')}</span>
                )}
              </TableCell>
              <TableCell>
                <Badge
                  variant={school.status === 'active' ? 'default' : 'secondary'}
                >
                  {t(school.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditDialogOpen(school)}
                    title={t('edit')}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAdminDialogOpen(school)}
                    title={t('manageAdmin')}
                  >
                    <UserPlus className="h-4 w-4" />
                  </Button>
                  
                  {(userRole === 'superadmin' || userRole === 'regionadmin') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteDialogOpen(school)}
                      title={t('delete')}
                      className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SchoolTable;
