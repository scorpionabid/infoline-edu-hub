import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  DotsHorizontalIcon,
  Plus,
  Building,
  Search,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from '@radix-ui/react-icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import BulkDataEntryDialog from '@/components/dataEntry/BulkDataEntryDialog';
import {
  useSchools,
  School,
  SchoolFilters,
  SchoolSort,
  useSchoolActions,
  useSchoolBulkActions,
} from '@/hooks/schools/useSchools';
import { usePagination } from '@/hooks/common/usePagination';
import { useDebounce } from '@/hooks/common/useDebounce';
import { useBulkDataEntry } from '@/hooks/dataEntry/useBulkDataEntry';

const schoolSchema = z.object({
  name: z.string().min(2, {
    message: "Məktəb adı ən azı 2 simvol olmalıdır.",
  }),
  address: z.string().min(5, {
    message: "Ünvan ən azı 5 simvol olmalıdır.",
  }),
})

const SectorAdminSchoolList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState<SchoolSort>({ field: 'name', order: 'asc' });
  const [filters, setFilters] = useState<SchoolFilters>({ sectorId: '' });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [deleteSchoolId, setDeleteSchoolId] = useState<string | null>(null);
  const [editSchool, setEditSchool] = useState<School | null>(null);

  // Custom Hooks
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const {
    schools,
    sectors,
    loading,
    error,
    refreshData,
  } = useSchools(debouncedSearchQuery, sort, filters);
  const {
    createSchool,
    updateSchool,
    deleteSchool,
    creating,
    updating,
    deleting,
  } = useSchoolActions();
  const { bulkApproveSchools, bulkRejectSchools, bulkApproving, bulkRejecting } =
    useSchoolBulkActions();
  const { currentPage, pageSize, totalPages, setPageSize, goToPage } =
    usePagination(schools, 10);
  const { handleBulkDataEntry } = useBulkDataEntry();

  // Form
  const form = useForm<z.infer<typeof schoolSchema>>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: "",
      address: "",
    },
  })

  // Derived Data
  const paginatedSchools = React.useMemo(
    () => schools.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [schools, currentPage, pageSize],
  );
  const selectedSchools = React.useMemo(() => paginatedSchools.filter(school => school.selected), [paginatedSchools]);

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (field: string) => {
    setSort((prev) => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleFilterChange = (filter: Partial<SchoolFilters>) => {
    setFilters((prev) => ({ ...prev, ...filter }));
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    goToPage(1);
  };

  const handleSchoolSelect = (school: School) => {
    setSelectedSchool(school);
  };

  const handleBulkDataEntryClick = (school: School) => {
    setSelectedSchool(school);
    setBulkDialogOpen(true);
  };

  const handleCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCreateSchool = async (values: z.infer<typeof schoolSchema>) => {
    try {
      await createSchool(values);
      toast({
        title: "Məktəb uğurla yaradıldı!",
        description: "Yeni məktəb siyahıya əlavə edildi.",
      })
      form.reset()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Xəta baş verdi!",
        description: "Məktəb yaradılarkən xəta baş verdi.",
      })
    } finally {
      setCreateDialogOpen(false);
      refreshData();
    }
  };

  const handleEditSchool = (school: School) => {
    setEditSchool(school);
    form.setValue("name", school.name);
    form.setValue("address", school.address);
  };

  const handleUpdateSchool = async (schoolId: string, values: z.infer<typeof schoolSchema>) => {
    try {
      await updateSchool(schoolId, values);
      toast({
        title: "Məktəb uğurla yeniləndi!",
        description: "Məktəb məlumatları yeniləndi.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Xəta baş verdi!",
        description: "Məktəb yenilənərkən xəta baş verdi.",
      })
    } finally {
      setEditSchool(null);
      refreshData();
    }
  };

  const handleDeleteSchool = (schoolId: string) => {
    setDeleteSchoolId(schoolId);
  };

  const confirmDeleteSchool = async () => {
    if (deleteSchoolId) {
      try {
        await deleteSchool(deleteSchoolId);
        toast({
          title: "Məktəb uğurla silindi!",
          description: "Məktəb siyahıdan silindi.",
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Xəta baş verdi!",
          description: "Məktəb silinərkən xəta baş verdi.",
        })
      } finally {
        setDeleteSchoolId(null);
        refreshData();
      }
    }
  };

  const handleBulkApprove = async () => {
    try {
      await bulkApproveSchools(selectedSchools.map(s => s.id));
      toast({
        title: "Məktəblər təsdiqləndi!",
        description: "Seçilmiş məktəblər təsdiqləndi.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Xəta baş verdi!",
        description: "Məktəblər təsdiqlənərkən xəta baş verdi.",
      })
    } finally {
      refreshData();
    }
  };

  const handleBulkReject = async () => {
    try {
      await bulkRejectSchools(selectedSchools.map(s => s.id));
      toast({
        title: "Məktəblər rədd edildi!",
        description: "Seçilmiş məktəblər rədd edildi.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Xəta baş verdi!",
        description: "Məktəblər rədd edilərkən xəta baş verdi.",
      })
    } finally {
      refreshData();
    }
  };

  const handleSelectSchool = (schoolId: string) => {
    const updatedSchools = schools.map(school =>
      school.id === schoolId ? { ...school, selected: !school.selected } : school
    );
    // Update the schools state with the new selected state
    // This assumes you have a function to update the schools state
  };

  const handleSelectAllSchools = () => {
    const allSelected = schools.every(school => school.selected);
    const updatedSchools = schools.map(school => ({ ...school, selected: !allSelected }));
    // Update the schools state with the new selected state
    // This assumes you have a function to update the schools state
  };

  // Render Functions
  const renderSortIcon = (field: string) => {
    if (sort.field === field) {
      return sort.order === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
    }
    return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <span className="ml-2 text-destructive">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Building className="h-6 w-6" />
          Məktəblər
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Məktəb yarat
          </Button>
          {selectedSchools.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Əməliyyatlar ({selectedSchools.length})
                  <ArrowDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Toplu Əməliyyatlar</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleBulkApprove} disabled={bulkApproving}>
                  Təsdiqlə
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkReject} disabled={bulkRejecting}>
                  Rədd et
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2">
          <div className="relative">
            <Input
              type="search"
              placeholder="Məktəb axtar..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div>
          <Select onValueChange={(value) => handleFilterChange({ sectorId: value })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sektor seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Bütün Sektorlar</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector.id} value={sector.id}>
                  {sector.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* School Table */}
      <Card>
        <CardHeader>
          <CardTitle>Məktəb Siyahısı</CardTitle>
          <CardDescription>
            {schools.length} məktəb tapıldı
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <input
                      type="checkbox"
                      onChange={handleSelectAllSchools}
                      checked={schools.every(school => school.selected)}
                    />
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    Adı {renderSortIcon('name')}
                  </TableHead>
                  <TableHead>Sektor</TableHead>
                  <TableHead>Ünvan</TableHead>
                  <TableHead className="text-right">Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSchools.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">
                      <input
                        type="checkbox"
                        onChange={() => handleSelectSchool(school.id)}
                        checked={school.selected}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.sectorName}</TableCell>
                    <TableCell>{school.address}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Menyunu aç</span>
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Əməliyyatlar</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEditSchool(school)}>
                            Redaktə et
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteSchool(school.id)}>
                            Sil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleBulkDataEntryClick(school)}>
                            Məlumat daxil et
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Select value={pageSize.toString()} onValueChange={(value) => handlePageSizeChange(parseInt(value))}>
          <SelectTrigger>
            <SelectValue placeholder="Səhifə ölçüsü" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Əvvəlki
          </Button>
          <span>{currentPage} / {totalPages}</span>
          <Button
            variant="outline"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sonrakı
          </Button>
        </div>
      </div>

      {/* Create School Dialog */}
      <AlertDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Məktəb yarat</AlertDialogTitle>
            <AlertDialogDescription>
              Yeni məktəb yaratmaq üçün məlumatları daxil edin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateSchool)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Məktəb adı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ünvan</FormLabel>
                    <FormControl>
                      <Input placeholder="Məktəb ünvanı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => form.reset()}>Ləğv et</AlertDialogCancel>
                <Button type="submit" disabled={creating}>
                  Yarat
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit School Dialog */}
      <AlertDialog open={!!editSchool} onOpenChange={() => setEditSchool(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Məktəbi redaktə et</AlertDialogTitle>
            <AlertDialogDescription>
              Məktəb məlumatlarını redaktə etmək üçün məlumatları dəyişdirin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((values) => handleUpdateSchool(editSchool?.id || '', values))} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Məktəb adı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ünvan</FormLabel>
                    <FormControl>
                      <Input placeholder="Məktəb ünvanı" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setEditSchool(null)}>Ləğv et</AlertDialogCancel>
                <Button type="submit" disabled={updating}>
                  Yenilə
                </Button>
              </AlertDialogFooter>
            </form>
          </Form>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete School Dialog */}
      <AlertDialog open={!!deleteSchoolId} onOpenChange={() => setDeleteSchoolId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Məktəbi sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu məktəbi silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteSchoolId(null)}>Ləğv et</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSchool} disabled={deleting}>
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Data Entry Dialog */}
      
        <BulkDataEntryDialog
          open={bulkDialogOpen}
          onOpenChange={setBulkDialogOpen}
          schoolId={selectedSchool?.id || ''}
          categoryId=""
          onClose={() => setBulkDialogOpen(false)}
          onComplete={() => {
            setBulkDialogOpen(false);
            refreshData();
          }}
        />
      
    </div>
  );
};

export default SectorAdminSchoolList;
