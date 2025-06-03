
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  FileText, 
  Link,
  UserPlus,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SchoolLinksDialog } from './SchoolLinksDialog';
import { SchoolFilesDialog } from './SchoolFilesDialog';
import { School, Region, Sector } from '@/types/school';

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
  const [isLinksDialogOpen, setIsLinksDialogOpen] = React.useState(false);
  const [selectedSchoolForLinks, setSelectedSchoolForLinks] = React.useState<School | null>(null);
  const [isFilesDialogOpen, setIsFilesDialogOpen] = React.useState(false);
  const [selectedSchoolForFiles, setSelectedSchoolForFiles] = React.useState<School | null>(null);

  const handleViewLinks = (school: School) => {
    setSelectedSchoolForLinks(school);
    setIsLinksDialogOpen(true);
    onViewLinks(school);
  };

  const handleViewFiles = (school: School) => {
    setSelectedSchoolForFiles(school);
    setIsFilesDialogOpen(true);
    onViewFiles(school);
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
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Sektor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>{regionNames[school.region_id] || school.region_id}</TableCell>
                <TableCell>{sectorNames[school.sector_id] || school.sector_id}</TableCell>
                <TableCell>
                  <Badge variant={school.status === 'active' ? 'default' : 'secondary'}>
                    {school.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                  </Badge>
                </TableCell>
                <TableCell>{school.phone || '-'}</TableCell>
                <TableCell>{school.email || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(school)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewFiles(school)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Fayllar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewLinks(school)}>
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

      {/* Links Dialog */}
      <SchoolLinksDialog
        open={isLinksDialogOpen}
        onOpenChange={setIsLinksDialogOpen}
        schoolId={selectedSchoolForLinks?.id || ''}
      />

      {/* Files Dialog */}
      <SchoolFilesDialog
        open={isFilesDialogOpen}
        onOpenChange={setIsFilesDialogOpen}
        schoolId={selectedSchoolForFiles?.id || ''}
      />
    </>
  );
};
