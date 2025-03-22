
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Map, 
  School, 
  Search, 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

// Saxta regionlar məlumatı
const mockRegions = [
  { 
    id: '1', 
    name: 'Bakı', 
    description: 'Azərbaycanın paytaxtı',
    sectorCount: 9,
    schoolCount: 293,
    status: 'active',
    createdAt: '2023-01-10',
    completionRate: 87
  },
  { 
    id: '2', 
    name: 'Gəncə', 
    description: 'Azərbaycanın ikinci böyük şəhəri',
    sectorCount: 4,
    schoolCount: 78,
    status: 'active',
    createdAt: '2023-01-11',
    completionRate: 75
  },
  { 
    id: '3', 
    name: 'Sumqayıt', 
    description: 'Bakıdan şimalda yerləşən sənaye şəhəri',
    sectorCount: 3,
    schoolCount: 56,
    status: 'active',
    createdAt: '2023-01-12',
    completionRate: 90
  },
  { 
    id: '4', 
    name: 'Mingəçevir', 
    description: 'Kür çayının üzərində yerləşən şəhər',
    sectorCount: 2,
    schoolCount: 29,
    status: 'active',
    createdAt: '2023-01-13',
    completionRate: 65
  },
  { 
    id: '5', 
    name: 'Şəki', 
    description: 'Azərbaycanın şimal-qərb hissəsindəki tarixi şəhər',
    sectorCount: 2,
    schoolCount: 34,
    status: 'active',
    createdAt: '2023-01-14',
    completionRate: 72
  },
  { 
    id: '6', 
    name: 'Lənkəran', 
    description: 'Cənub bölgəsində yerləşən şəhər',
    sectorCount: 3,
    schoolCount: 43,
    status: 'active',
    createdAt: '2023-01-15',
    completionRate: 84
  },
  { 
    id: '7', 
    name: 'Şirvan', 
    description: 'Mərkəzi Aran bölgəsində yerləşən şəhər',
    sectorCount: 1,
    schoolCount: 21,
    status: 'inactive',
    createdAt: '2023-01-16',
    completionRate: 38
  },
  { 
    id: '8', 
    name: 'Naxçıvan', 
    description: 'Naxçıvan Muxtar Respublikasının mərkəzi',
    sectorCount: 4,
    schoolCount: 67,
    status: 'active',
    createdAt: '2023-01-17',
    completionRate: 81
  },
];

const Regions = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [regions, setRegions] = useState(mockRegions);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Form daxiletmə vəziyyəti
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  
  // Axtarışı həndlə etmək
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Axtarış ediləndə ilk səhifəyə qayıt
  };
  
  // Axtarış terminə görə regionların filtirlənməsi
  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sıralamaq üçün
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Sıralama konfiqurasiyasına görə regionların sıralanması
  const sortedRegions = React.useMemo(() => {
    const sortableRegions = [...filteredRegions];
    if (sortConfig.key) {
      sortableRegions.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableRegions;
  }, [filteredRegions, sortConfig]);
  
  // Səhifə üçün göstəriləcək məlumatları ala bilirik
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRegions.slice(indexOfFirstItem, indexOfLastItem);
  
  // Səhifə nömrəsini dəyişir
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Ümumi səhifə sayı
  const totalPages = Math.ceil(sortedRegions.length / itemsPerPage);
  
  // Region əlavə etmək
  const handleAddDialogOpen = () => {
    setFormData({
      name: '',
      description: '',
      status: 'active'
    });
    setIsAddDialogOpen(true);
  };
  
  // Region əlavə etmək formu
  const handleAddSubmit = () => {
    const newRegion = {
      id: (regions.length + 1).toString(),
      ...formData,
      sectorCount: 0,
      schoolCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      completionRate: 0
    };
    
    setRegions([...regions, newRegion]);
    setIsAddDialogOpen(false);
    toast.success('Region uğurla əlavə edildi');
  };
  
  // Region redaktə dialoqu açmaq
  const handleEditDialogOpen = (region) => {
    setSelectedRegion(region);
    setFormData({
      name: region.name,
      description: region.description,
      status: region.status
    });
    setIsEditDialogOpen(true);
  };
  
  // Form dəyişikliyini idarə etmək
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Redaktə formunu təqdim etmək
  const handleEditSubmit = () => {
    const updatedRegions = regions.map(region => 
      region.id === selectedRegion.id ? { ...region, ...formData } : region
    );
    setRegions(updatedRegions);
    setIsEditDialogOpen(false);
    toast.success('Region uğurla yeniləndi');
  };
  
  // Silmə dialoqunu açmaq
  const handleDeleteDialogOpen = (region) => {
    setSelectedRegion(region);
    setIsDeleteDialogOpen(true);
  };
  
  // Silməni təsdiqləmək
  const handleDeleteConfirm = () => {
    const updatedRegions = regions.filter(region => region.id !== selectedRegion.id);
    setRegions(updatedRegions);
    setIsDeleteDialogOpen(false);
    toast.success('Region uğurla silindi');
  };
  
  // Tamamlanma dərəcəsi badge-ni göstərmək
  const renderCompletionRateBadge = (rate) => {
    if (rate >= 80) {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">{rate}%</Badge>;
    } else if (rate >= 60) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">{rate}%</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">{rate}%</Badge>;
    }
  };
  
  // Status badge-ni göstərmək
  const renderStatusBadge = (status) => {
    if (status === 'active') {
      return <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Aktiv</div>;
    } else {
      return <div className="flex items-center"><XCircle className="h-4 w-4 text-red-500 mr-1" /> Deaktiv</div>;
    }
  };
  
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('regions')}</h1>
            <p className="text-muted-foreground">Regionları idarə et və izlə</p>
          </div>
          {user?.role === 'superadmin' && (
            <Button onClick={handleAddDialogOpen} className="gap-1">
              <Plus className="h-4 w-4" />
              Region əlavə et
            </Button>
          )}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Regionları axtar..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                      <div className="flex items-center">
                        Ad
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Sektorlar</TableHead>
                    <TableHead className="hidden md:table-cell">Məktəblər</TableHead>
                    <TableHead className="hidden md:table-cell">Tamamlanma</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map(region => (
                      <TableRow key={region.id}>
                        <TableCell className="font-medium">{region.id}</TableCell>
                        <TableCell>{region.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            {region.sectorCount}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <School className="h-4 w-4 text-muted-foreground" />
                            {region.schoolCount}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {renderCompletionRateBadge(region.completionRate)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {renderStatusBadge(region.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/regions/${region.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Bax
                              </DropdownMenuItem>
                              {user?.role === 'superadmin' && (
                                <>
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditDialogOpen(region)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Redaktə et
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleDeleteDialogOpen(region)}>
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
                      <TableCell colSpan={7} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Map className="h-8 w-8 mb-2" />
                          <p>Region tapılmadı</p>
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
            
            {/* Səhifələndirmə */}
            {sortedRegions.length > itemsPerPage && (
              <div className="mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)} 
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          isActive={currentPage === page}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)} 
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Region əlavə etmək dialoqu */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Region əlavə et</DialogTitle>
            <DialogDescription>Yeni region əlavə etmək üçün məlumatları daxil edin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Ad</Label>
              <Input
                id="add-name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Region adı"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-description">Təsvir</Label>
              <Input
                id="add-description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Region haqqında qısa məlumat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-status">Status</Label>
              <select
                id="add-status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Deaktiv</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Ləğv et</Button>
            <Button onClick={handleAddSubmit}>Əlavə et</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Region redaktə dialoqu */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Regionu redaktə et</DialogTitle>
            <DialogDescription>Region məlumatlarını dəyişin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Ad</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Təsvir</Label>
              <Input
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                name="status"
                value={formData.status}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="active">Aktiv</option>
                <option value="inactive">Deaktiv</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Ləğv et</Button>
            <Button onClick={handleEditSubmit}>Yadda saxla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Silmə təsdiq dialoqu */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Silməyi təsdiqlə</DialogTitle>
            <DialogDescription>
              "{selectedRegion?.name}" regionunu silmək istədiyinizə əminsiniz?
              Bu əməliyyat geri qaytarıla bilməz.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Ləğv et</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default Regions;

