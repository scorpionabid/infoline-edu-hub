
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  School as SchoolIcon, 
  Pencil, 
  Trash2, 
  Eye,
  MoreHorizontal,
  Users,
  GraduationCap,
  Languages,
  GalleryVerticalEnd,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Mail,
} from 'lucide-react';
import { 
  getSchoolTypeLabel, 
  getLanguageLabel, 
  getSchoolInitial,
  School,
} from '@/data/schoolsData';
import { SortConfig } from '@/hooks/useSchoolsData';

interface SchoolTableProps {
  currentItems: School[];
  userRole?: string;
  searchTerm: string;
  sortConfig: SortConfig;
  handleSort: (key: string) => void;
  handleEditDialogOpen: (school: School) => void;
  handleDeleteDialogOpen: (school: School) => void;
  handleAdminDialogOpen: (school: School) => void;
}

const SchoolTable: React.FC<SchoolTableProps> = ({
  currentItems,
  userRole,
  searchTerm,
  sortConfig,
  handleSort,
  handleEditDialogOpen,
  handleDeleteDialogOpen,
  handleAdminDialogOpen
}) => {
  const navigate = useNavigate();

  // Tamamlanma faizi badge
  const renderCompletionRateBadge = (rate: number) => {
    if (rate >= 80) {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">{rate}%</Badge>;
    } else if (rate >= 60) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">{rate}%</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">{rate}%</Badge>;
    }
  };
  
  // Status badge
  const renderStatusBadge = (status: string) => {
    if (status === 'active') {
      return <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Aktiv</div>;
    } else {
      return <div className="flex items-center"><XCircle className="h-4 w-4 text-red-500 mr-1" /> Deaktiv</div>;
    }
  };

  // Dropdown menyu tıklama işləyicisi
  const handleDropdownAction = (action: string, school: School) => {
    switch (action) {
      case 'view':
        navigate(`/schools/${school.id}`);
        break;
      case 'edit':
        handleEditDialogOpen(school);
        break;
      case 'data':
        navigate(`/schools/${school.id}/data`);
        break;
      case 'delete':
        handleDeleteDialogOpen(school);
        break;
      case 'admin':
        handleAdminDialogOpen(school);
        break;
      default:
        break;
    }
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[70px]"></TableHead>
            <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
              <div className="flex items-center">
                Məktəb adı
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead onClick={() => handleSort('region')} className="cursor-pointer hidden md:table-cell">
              <div className="flex items-center">
                Region/Sektor
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead className="hidden lg:table-cell">Şagird/Müəllim</TableHead>
            <TableHead className="hidden lg:table-cell">Məktəb növü</TableHead>
            <TableHead className="hidden md:table-cell">Admin</TableHead>
            <TableHead className="hidden md:table-cell">Tamamlanma</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="text-right">Əməliyyatlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.length > 0 ? (
            currentItems.map(school => (
              <TableRow key={school.id}>
                <TableCell>
                  <Avatar className="h-9 w-9">
                    {school.logo ? (
                      <AvatarImage src={school.logo} alt={school.name} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getSchoolInitial(school.name)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{school.name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-[200px]">{school.address}</div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <div>{school.region}</div>
                  <div className="text-sm text-muted-foreground">{school.sector}</div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    {school.studentCount}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {school.teacherCount}
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div>{getSchoolTypeLabel(school.type)}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Languages className="h-3 w-3" />
                    {getLanguageLabel(school.language)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {school.adminEmail ? (
                    <button 
                      className="text-blue-500 hover:underline flex items-center gap-1"
                      onClick={() => handleAdminDialogOpen(school)}
                    >
                      <Mail className="h-3 w-3" />
                      {school.adminEmail}
                    </button>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {renderCompletionRateBadge(school.completionRate)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {renderStatusBadge(school.status)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="cursor-pointer"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-background">
                      <DropdownMenuItem 
                        className="cursor-pointer" 
                        onClick={() => handleDropdownAction('view', school)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Bax
                      </DropdownMenuItem>
                      {(userRole === 'superadmin' || userRole === 'regionadmin' || userRole === 'sectoradmin') && (
                        <>
                          <DropdownMenuItem 
                            className="cursor-pointer" 
                            onClick={() => handleDropdownAction('edit', school)}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Redaktə et
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer" 
                            onClick={() => handleDropdownAction('data', school)}
                          >
                            <GalleryVerticalEnd className="h-4 w-4 mr-2" />
                            Məlumatlar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer text-destructive" 
                            onClick={() => handleDropdownAction('delete', school)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Sil
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center h-24">
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <SchoolIcon className="h-8 w-8 mb-2" />
                  <p>Məktəb tapılmadı</p>
                  {searchTerm && (
                    <p className="text-sm">Başqa axtarış termini sınayın</p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SchoolTable;
