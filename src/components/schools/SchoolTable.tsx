import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  FileText, 
  Link,
  UserPlus,
  MoreHorizontal,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { School } from '@/types/school';
import { SortOptions } from '@/hooks/common/useEnhancedPagination';
import { useSchoolAdmins } from '@/hooks/schools/useSchoolAdmins';

type SortField = 'name' | 'region' | 'sector' | 'admin' | 'email' | 'principal_name' | 'address' | 'student_count' | 'teacher_count' | 'completion_rate' | 'created_at';

interface SchoolTableProps {
  schools: School[];
  isLoading: boolean;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
  onViewFiles: (school: School) => void;
  onViewLinks: (school: School) => void;
  onAssignAdmin: (school: School) => void;
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
  sortOptions: SortOptions;
  onSortChange: (sort: SortOptions) => void;
}

export const SchoolTable: React.FC<SchoolTableProps> = ({
  schools,
  isLoading,
  onEdit,
  onDelete,
  onViewFiles,
  onViewLinks,
  onAssignAdmin,
  regionNames,
  sectorNames,
  sortOptions,
  onSortChange
}) => {
  // Admin məlumatlarını yükləyirik
  const schoolIds = React.useMemo(() => schools.map(school => school.id), [schools]);
  const { adminMap, isLoading: adminsLoading } = useSchoolAdmins(schoolIds);

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortOptions.field === field) {
      // Cycle through: asc -> desc -> null
      const newDirection = 
        sortOptions.direction === 'asc' ? 'desc' : 
        sortOptions.direction === 'desc' ? null : 'asc';
      
      onSortChange({
        field: newDirection ? field : null,
        direction: newDirection
      });
    } else {
      onSortChange({
        field,
        direction: 'asc'
      });
    }
  };

  // Get sort icon for header
  const getSortIcon = (field: SortField) => {
    if (sortOptions.field !== field) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    if (sortOptions.direction === 'asc') {
      return <ArrowUp className="h-4 w-4 text-primary" />;
    }
    if (sortOptions.direction === 'desc') {
      return <ArrowDown className="h-4 w-4 text-primary" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  if (isLoading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Məktəblər yüklənir...</p>
      </div>
    );
  }

  if (!schools.length) {
    return (
      <div className="w-full p-8 text-center">
        <p className="text-muted-foreground">Heç bir məktəb tapılmadı</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center justify-between">
                <span>Məktəb Adı</span>
                {getSortIcon('name')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('region')}
            >
              <div className="flex items-center justify-between">
                <span>Region</span>
                {getSortIcon('region')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('sector')}
            >
              <div className="flex items-center justify-between">
                <span>Sektor</span>
                {getSortIcon('sector')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('admin')}
            >
              <div className="flex items-center justify-between">
                <span>Admin</span>
                {getSortIcon('admin')}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer hover:bg-muted/50 select-none"
              onClick={() => handleSort('email')}
            >
              <div className="flex items-center justify-between">
                <span>Email</span>
                {getSortIcon('email')}
              </div>
            </TableHead>
            <TableHead className="text-right">Əməliyyatlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">{school.name}</TableCell>
              <TableCell>
                {(regionNames && school.region_id && regionNames[school.region_id]) || 'Naməlum region'}
              </TableCell>
              <TableCell>
                {(sectorNames && school.sector_id && sectorNames[school.sector_id]) || 'Naməlum sektor'}
              </TableCell>
              <TableCell>
                {adminsLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    <span className="text-xs">Yüklənir...</span>
                  </div>
                ) : (
                  <span className="text-sm">
                    {adminMap[school.id] || 'Təyin edilməyib'}
                  </span>
                )}
              </TableCell>
              <TableCell>{school.email || '-'}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(school)}
                    title="Redaktə et"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" title="Əlavə əməliyyatlar">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewFiles(school)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Fayllar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewLinks(school)}>
                        <Link className="h-4 w-4 mr-2" />
                        Linklər
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onAssignAdmin(school)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Admin təyin et
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(school)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};