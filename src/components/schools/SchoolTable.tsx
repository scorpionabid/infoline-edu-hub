
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  UserCog,
  ArrowDown,
  ArrowUp
} from 'lucide-react';
import { SortConfig } from '@/hooks/schools/useSchoolsStore';
import { cn } from '@/lib/utils';
import { School } from '@/types/supabase';

interface SchoolTableProps {
  currentItems: School[];
  searchTerm: string;
  sortConfig: SortConfig;
  handleSort: (key: string) => void;
  handleEditDialogOpen: (school: School) => void;
  handleDeleteDialogOpen: (school: School) => void;
  handleAdminDialogOpen: (school: School) => void;
  userRole?: string;
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
  
  // Sortun vəziyyətini vizual olaraq göstərmək üçün komponent
  const SortIcon = ({ column }: { column: string }) => {
    if (sortConfig.key !== column) return null;
    
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-1 h-4 w-4" /> 
      : <ArrowDown className="ml-1 h-4 w-4" />;
  };
  
  // Cədvəl başlığı ilə sortlamanı idarə edən komponent
  const SortableHeader = ({ column, label }: { column: string; label: string }) => (
    <div 
      className="flex cursor-pointer items-center"
      onClick={() => handleSort(column)}
    >
      {label}
      <SortIcon column={column} />
    </div>
  );
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px]">
              <SortableHeader column="name" label="Məktəb adı" />
            </TableHead>
            <TableHead>
              <SortableHeader column="principal_name" label="Direktor" />
            </TableHead>
            <TableHead>
              <SortableHeader column="student_count" label="Şagird sayı" />
            </TableHead>
            <TableHead>
              <SortableHeader column="teacher_count" label="Müəllim sayı" />
            </TableHead>
            <TableHead>
              <SortableHeader column="admin_email" label="Admin" />
            </TableHead>
            <TableHead>
              <SortableHeader column="status" label="Status" />
            </TableHead>
            <TableHead className="text-right">Əməliyyatlar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.length > 0 ? (
            currentItems.map((school) => (
              <TableRow key={school.id}>
                <TableCell className="font-medium">{school.name}</TableCell>
                <TableCell>{school.principal_name || "-"}</TableCell>
                <TableCell>{school.student_count || "-"}</TableCell>
                <TableCell>{school.teacher_count || "-"}</TableCell>
                <TableCell>{school.admin_email || "-"}</TableCell>
                <TableCell>
                  <span className={cn(
                    "rounded-full px-2 py-1 text-xs font-medium",
                    school.status === 'active' 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  )}>
                    {school.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Menyu aç</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEditDialogOpen(school)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Redaktə et
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAdminDialogOpen(school)}>
                        <UserCog className="mr-2 h-4 w-4" />
                        Admin təyin et
                      </DropdownMenuItem>
                      {(userRole === 'superadmin' || userRole === 'regionadmin') && (
                        <DropdownMenuItem 
                          onClick={() => handleDeleteDialogOpen(school)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                {searchTerm ? "Axtarışa uyğun məktəb tapılmadı." : "Məktəb məlumatları yoxdur."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default SchoolTable;
