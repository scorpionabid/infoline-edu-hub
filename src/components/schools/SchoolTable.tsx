
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  FileText, 
  Link,
  UserPlus,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { School } from '@/types/school';
import { useSchoolAdmins } from '@/hooks/schools/useSchoolAdmins';

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
  sectorNames
}) => {
  // Admin məlumatlarını yükləyirik - loop-u önləmək üçün sadəcə school id-ləri ötürürük
  const schoolIds = React.useMemo(() => schools.map(school => school.id), [schools]);
  const { adminMap, isLoading: adminsLoading } = useSchoolAdmins(schoolIds);

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
            <TableHead>Məktəb Adı</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Sektor</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="text-right">Əməliyyatlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schools.map((school) => (
            <TableRow key={school.id}>
              <TableCell className="font-medium">{school.name}</TableCell>
              <TableCell>
                {regionNames[school.region_id] || 'Naməlum region'}
              </TableCell>
              <TableCell>
                {sectorNames[school.sector_id] || 'Naməlum sektor'}
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
