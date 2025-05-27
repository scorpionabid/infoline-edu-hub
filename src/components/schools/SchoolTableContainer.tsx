import React from 'react';
import { School } from '@/types/supabase';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, UserPlus, MoreHorizontal, Link, FolderOpen } from 'lucide-react';
import { useLanguageSafe } from '@/context/LanguageContext';
import SchoolPagination from './SchoolPagination';

interface SchoolTableContainerProps {
  schools: School[];
  filteredSchools: School[];
  paginatedSchools: School[];
  currentPage: number;
  totalPages: number;
  regionNames: { [key: string]: string };
  sectorNames: { [key: string]: string };
  adminMap: { [key: string]: string };
  isAdminsLoading: boolean;
  onPageChange: (page: number) => void;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
  onAdmin: (school: School) => void;
  onLinks: (school: School) => void;
  onFiles: (school: School) => void;
  canEditSchool: (school: School) => boolean;
  canDeleteSchool: (school: School) => boolean;
  canAssignAdmin: (school: School) => boolean;
}

const SchoolTableContainer: React.FC<SchoolTableContainerProps> = ({
  schools,
  filteredSchools,
  paginatedSchools,
  currentPage,
  totalPages,
  regionNames,
  sectorNames,
  adminMap,
  isAdminsLoading,
  onPageChange,
  onEdit,
  onDelete,
  onAdmin,
  onLinks,
  onFiles,
  canEditSchool,
  canDeleteSchool,
  canAssignAdmin
}) => {
  const { t } = useLanguageSafe();

  return (
    <div className="border rounded-md">
      <ScrollArea className="h-[calc(100vh-300px)]">
        <Table>
          <TableCaption className="text-xs sm:text-sm">{t('schoolsList')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm w-[30%]">{t('schoolName')}</TableHead>
              <TableHead className="text-xs sm:text-sm hidden sm:table-cell w-[15%]">{t('admin')}</TableHead>
              <TableHead className="text-xs sm:text-sm hidden sm:table-cell w-[15%]">{t('sector')}</TableHead>
              <TableHead className="text-xs sm:text-sm w-[10%]">{t('status')}</TableHead>
              <TableHead className="text-xs sm:text-sm text-right w-[15%]">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSchools.map(school => (
              <TableRow key={school.id} className={school.status === 'active' ? '' : 'opacity-60'}>
                <TableCell className="text-xs sm:text-sm font-medium">
                  <div>
                    <div>{school.name}</div>
                    {/* Show admin/sector on mobile under school name */}
                    <div className="text-xs text-muted-foreground sm:hidden">
                      {adminMap[school.id] || '-'} • {sectorNames[school.sector_id]}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                  {isAdminsLoading ? (
                    <span className="flex items-center">
                      <span className="h-3 w-3 mr-2 animate-spin rounded-full border-b-2 border-gray-500"></span>
                      {t('loading')}
                    </span>
                  ) : (
                    adminMap[school.id] || '-'
                  )}
                </TableCell>
                <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                  {sectorNames[school.sector_id] || '-'}
                </TableCell>
                <TableCell className="text-xs sm:text-sm">
                  {school.status === 'active' 
                    ? <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">{t('active')}</span>
                    : <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">{t('inactive')}</span>
                  }
                </TableCell>
                <TableCell className="text-xs sm:text-sm text-right">
                  <div className="flex justify-end items-center space-x-1">
                    {/* Əsas əməliyyat düymələri birbaşa göstərilir */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => onEdit(school)}
                      disabled={!canEditSchool(school)}
                      title={t('edit')}
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7" 
                      onClick={() => onAdmin(school)}
                      disabled={!canAssignAdmin(school)}
                      title={t('assignAdmin')}
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                    </Button>
                    
                    {/* Əlavə əməliyyatlar üçün dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <span className="sr-only">{t('openMenu')}</span>
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel className="text-xs">{t('moreActions')}</DropdownMenuLabel>
                        <DropdownMenuItem 
                          onClick={() => onLinks(school)}
                          className="text-xs"
                        >
                          <Link className="mr-2 h-3 w-3" /> {t('links')}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onFiles(school)}
                          className="text-xs"
                        >
                          <FolderOpen className="mr-2 h-3 w-3" /> {t('files')}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(school)} 
                          disabled={!canDeleteSchool(school)}
                          className="text-xs text-red-600"
                        >
                          <Trash2 className="mr-2 h-3 w-3" /> {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredSchools.length > 0 && (
          <SchoolPagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </ScrollArea>
    </div>
  );
};

export default SchoolTableContainer;
