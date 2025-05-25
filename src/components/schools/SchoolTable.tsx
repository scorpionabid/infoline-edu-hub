import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DotsHorizontalIcon, Pencil1Icon, TrashIcon, PersonIcon } from '@radix-ui/react-icons'
import { Search } from 'lucide-react';
import { Link2, FolderOpen } from 'lucide-react';
import { SchoolLinksDialog } from './school-links/SchoolLinksDialog';
import { SchoolFilesDialog } from './school-files/SchoolFilesDialog';
import { useAuth } from '@/hooks/auth/useAuth';

interface School {
  id: string;
  name: string;
  region_id: string;
  sector_id: string;
  address?: string;
  phone?: string;
  email?: string;
  principal_name?: string;
  student_count?: number;
  teacher_count?: number;
  type?: string;
  status?: string;
  admin_id?: string;
  admin_email?: string;
  language?: string;
  created_at: string;
  updated_at: string;
  completion_rate?: number;
  region_name?: string;
  sector_name?: string;
}

interface SchoolTableProps {
  schools: School[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
  onAssignAdmin: (school: School) => void;
}

export const SchoolTable: React.FC<SchoolTableProps> = ({
  schools,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
  onAssignAdmin
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchools = schools.filter(school =>
    school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (school.principal_name && school.principal_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (school.address && school.address.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
  };
  
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [fileDialogOpen, setFileDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<any>(null);

  const handleLinksClick = (school: any) => {
    setSelectedSchool(school);
    setLinkDialogOpen(true);
  };

  const handleFilesClick = (school: any) => {
    setSelectedSchool(school);
    setFileDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-gray-500" />
          <Input
            type="text"
            placeholder="Məktəb axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-100 border-none focus:ring-0 focus:shadow-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Sektor</TableHead>
              <TableHead>Direktor</TableHead>
              <TableHead>Şagird sayı</TableHead>
              <TableHead>Müəllim sayı</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Yüklənir...
                </TableCell>
              </TableRow>
            ) : schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Məktəb tapılmadı
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => (
                <TableRow key={school.id}>
                  <TableCell>{school.name}</TableCell>
                  <TableCell>{school.region_name}</TableCell>
                  <TableCell>{school.sector_name}</TableCell>
                  <TableCell>{school.principal_name}</TableCell>
                  <TableCell>{school.student_count}</TableCell>
                  <TableCell>{school.teacher_count}</TableCell>
                  <TableCell>{school.status}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLinksClick(school)}
                        title="Linklər"
                      >
                        <Link2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleFilesClick(school)}
                        title="Fayllar"
                      >
                        <FolderOpen className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menyunu aç</span>
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onEdit(school)}>
                            <Pencil1Icon className="mr-2 h-4 w-4" />
                            Redaktə et
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onAssignAdmin(school)}>
                            <PersonIcon className="mr-2 h-4 w-4" />
                            Admin təyin et
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onDelete(school)}>
                            <TrashIcon className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Əvvəlki
          </Button>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Sonrakı
          </Button>
        </div>
        <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
          <div>
            <p className="text-sm text-gray-700">
              <span>{currentPage}</span> / <span>{totalPages}</span> səhifə
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <Button
                variant="outline"
                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                <span className="sr-only">Əvvəlki</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.21a.75.75 0 01-.02 1.06L8.832 10l3.938 3.73a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  onClick={() => handlePageChange(page)}
                  aria-current={currentPage === page ? "page" : undefined}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-500 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                <span className="sr-only">Sonrakı</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.79a.75.75 0 01.02-1.06L11.168 10 7.23 6.27a.75.75 0 011.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </Button>
            </nav>
          </div>
        </div>
      </div>

      {/* Link Management Dialog */}
      {selectedSchool && (
        <SchoolLinksDialog
          isOpen={linkDialogOpen}
          onClose={() => setLinkDialogOpen(false)}
          school={selectedSchool}
          userRole={useAuth().user?.role || 'viewer'}
        />
      )}

      {/* File Management Dialog */}
      {selectedSchool && (
        <SchoolFilesDialog
          isOpen={fileDialogOpen}
          onClose={() => setFileDialogOpen(false)}
          school={selectedSchool}
          userRole={useAuth().user?.role || 'viewer'}
        />
      )}
    </div>
  );
};
