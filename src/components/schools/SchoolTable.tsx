import React, { useState } from 'react';
import { School } from '@/types/school';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Bell, Link, Users, File, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { SchoolFilesDialog } from './SchoolFilesDialog';
import { SchoolLinksDialog } from './SchoolLinksDialog';
import { SchoolAdminDialog } from './SchoolAdminDialog';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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
  const [isFilesDialogOpen, setIsFilesDialogOpen] = useState(false);
  const [isLinksDialogOpen, setIsLinksDialogOpen] = useState(false);
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedSchoolForFiles, setSelectedSchoolForFiles] = useState<School | null>(null);
  const [selectedSchoolForLinks, setSelectedSchoolForLinks] = useState<School | null>(null);
  const [selectedSchoolForAdmin, setSelectedSchoolForAdmin] = useState<School | null>(null);

  const handleViewFiles = (school: School) => {
    setSelectedSchoolForFiles(school);
    setIsFilesDialogOpen(true);
  };

  const handleViewLinks = (school: School) => {
    setSelectedSchoolForLinks(school);
    setIsLinksDialogOpen(true);
  };

  const handleAssignAdmin = (school: School) => {
    setSelectedSchoolForAdmin(school);
    setIsAdminDialogOpen(true);
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Məktəb Adı</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Sektor</TableHead>
            <TableHead className="text-center">Tamamlanma</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Əməliyyatlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
                <TableCell><div className="h-4 bg-muted rounded animate-pulse" /></TableCell>
              </TableRow>
            ))
          ) : schools.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                Məlumat yoxdur
              </TableCell>
            </TableRow>
          ) : (
            // Data rows
            schools.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>{regionNames[school.region_id]}</TableCell>
                <TableCell>{sectorNames[school.sector_id]}</TableCell>
                <TableCell className="text-center">
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      {school.completion_rate}%
                    </div>
                    <Progress
                      value={school.completion_rate || 0}
                      className="w-24 h-2"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={school.status === 'active' ? 'outline' : 'destructive'}>
                    {school.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(school)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Redaktə et
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewFiles(school)}>
                        <File className="w-4 h-4 mr-2" />
                        Fayllara bax
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleViewLinks(school)}>
                        <Link className="w-4 h-4 mr-2" />
                        Linklərə bax
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(school)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Sil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAssignAdmin(school)}>
                        <Users className="w-4 h-4 mr-2" />
                        Admin təyin et
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell className="w-4 h-4 mr-2" />
                        Bildiriş göndər
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      {selectedSchoolForFiles && (
        <SchoolFilesDialog
          isOpen={isFilesDialogOpen}
          onOpenChange={setIsFilesDialogOpen}
          schoolId={selectedSchoolForFiles.id || ''}
          files={[]}
        />
      )}
      
      {selectedSchoolForLinks && (
        <SchoolLinksDialog
          isOpen={isLinksDialogOpen}
          onOpenChange={setIsLinksDialogOpen}
          schoolId={selectedSchoolForLinks.id || ''}
        />
      )}
      
      {selectedSchoolForAdmin && (
        <SchoolAdminDialog
          isOpen={isAdminDialogOpen}
          onClose={() => setIsAdminDialogOpen(false)}
          school={selectedSchoolForAdmin}
          onSubmit={async (adminData: any) => {
            console.log('Admin data submitted:', adminData);
            setIsAdminDialogOpen(false);
          }}
          isSubmitting={false}
        />
      )}
    </div>
  );
};
