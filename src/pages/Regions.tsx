import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, Role } from '@/context/AuthContext';
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
  Globe,
  User,
  KeyRound
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
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { UserFormData } from '@/types/user';
import { mockUsers } from '@/data/mockUsers';

const mockRegions = [
  { 
    id: '1', 
    name: 'Bakı', 
    description: 'Azərbaycanın paytaxtı',
    sectorCount: 9,
    schoolCount: 293,
    status: 'active',
    createdAt: '2023-01-10',
    completionRate: 87,
    adminId: 'user-1',
    adminEmail: 'baki.admin@infoline.edu'
  },
  { 
    id: '2', 
    name: 'Gəncə', 
    description: 'Azərbaycanın ikinci böyük şəhəri',
    sectorCount: 4,
    schoolCount: 78,
    status: 'active',
    createdAt: '2023-01-11',
    completionRate: 75,
    adminId: 'user-2',
    adminEmail: 'gence.admin@infoline.edu'
  },
  { 
    id: '3', 
    name: 'Sumqayıt', 
    description: 'Bakıdan şimalda yerləşən sənaye şəhəri',
    sectorCount: 3,
    schoolCount: 56,
    status: 'active',
    createdAt: '2023-01-12',
    completionRate: 90,
    adminId: 'user-3',
    adminEmail: 'sumqayit.admin@infoline.edu'
  },
  { 
    id: '4', 
    name: 'Mingəçevir', 
    description: 'Kür çayının üzərində yerləşən şəhər',
    sectorCount: 2,
    schoolCount: 29,
    status: 'active',
    createdAt: '2023-01-13',
    completionRate: 65,
    adminId: 'user-4',
    adminEmail: 'mingecevir.admin@infoline.edu'
  },
  { 
    id: '5', 
    name: 'Şəki', 
    description: 'Azərbaycanın şimal-qərb hissəsindəki tarixi şəhər',
    sectorCount: 2,
    schoolCount: 34,
    status: 'active',
    createdAt: '2023-01-14',
    completionRate: 72,
    adminId: 'user-5',
    adminEmail: 'seki.admin@infoline.edu'
  },
  { 
    id: '6', 
    name: 'Lənkəran', 
    description: 'Cənub bölgəsində yerləşən şəhər',
    sectorCount: 3,
    schoolCount: 43,
    status: 'active',
    createdAt: '2023-01-15',
    completionRate: 84,
    adminId: 'user-6',
    adminEmail: 'lenkeran.admin@infoline.edu'
  },
  { 
    id: '7', 
    name: 'Şirvan', 
    description: 'Mərkəzi Aran bölgəsində yerləşən şəhər',
    sectorCount: 1,
    schoolCount: 21,
    status: 'inactive',
    createdAt: '2023-01-16',
    completionRate: 38,
    adminId: 'user-7',
    adminEmail: 'sirvan.admin@infoline.edu'
  },
  { 
    id: '8', 
    name: 'Naxçıvan', 
    description: 'Naxçıvan Muxtar Respublikasının mərkəzi',
    sectorCount: 4,
    schoolCount: 67,
    status: 'active',
    createdAt: '2023-01-17',
    completionRate: 81,
    adminId: 'user-8',
    adminEmail: 'naxcivan.admin@infoline.edu'
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
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [regionFormData, setRegionFormData] = useState({
    name: '',
    description: '',
    status: 'active'
  });
  
  const [adminFormData, setAdminFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'regionadmin' as Role,
    status: 'active',
    notificationSettings: {
      email: true,
      system: true
    }
  });
  
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
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
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedRegions.slice(indexOfFirstItem, indexOfLastItem);
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const totalPages = Math.ceil(sortedRegions.length / itemsPerPage);
  
  const handleAddDialogOpen = () => {
    setRegionFormData({
      name: '',
      description: '',
      status: 'active'
    });
    
    setAdminFormData({
      name: '',
      email: '',
      password: '',
      role: 'regionadmin' as Role,
      status: 'active',
      notificationSettings: {
        email: true,
        system: true
      }
    });
    
    setIsAddDialogOpen(true);
  };
  
  const handleViewAdmin = (region) => {
    setSelectedRegion(region);
    const admin = mockUsers.find(user => user.id === region.adminId);
    setSelectedAdmin(admin || { 
      id: region.adminId, 
      name: 'Admin', 
      email: region.adminEmail,
      role: 'regionadmin' as Role,
      status: 'active'
    });
    setIsUserDialogOpen(true);
  };
  
  const handleRegionFormChange = (e) => {
    const { name, value } = e.target;
    setRegionFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'name' && value) {
      const suggestedEmail = `${value.toLowerCase().replace(/\s+/g, '.')}.admin@infoline.edu`;
      setAdminFormData(prev => ({ 
        ...prev, 
        email: suggestedEmail,
        name: `${value} Admin`
      }));
    }
  };
  
  const handleAdminFormChange = (data: UserFormData) => {
    setAdminFormData(data);
  };
  
  const handleAddSubmit = () => {
    const newRegionId = (regions.length + 1).toString();
    const newAdminId = `user-${Date.now()}`;
    
    const newRegion = {
      id: newRegionId,
      ...regionFormData,
      sectorCount: 0,
      schoolCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      completionRate: 0,
      adminId: newAdminId,
      adminEmail: adminFormData.email
    };
    
    const newAdmin = {
      ...adminFormData,
      id: newAdminId,
      regionId: newRegionId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setRegions([...regions, newRegion]);
    mockUsers.push(newAdmin);
    
    setIsAddDialogOpen(false);
    toast.success('Region və admin uğurla əlavə edildi');
  };
  
  const handleEditDialogOpen = (region) => {
    setSelectedRegion(region);
    setRegionFormData({
      name: region.name,
      description: region.description,
      status: region.status
    });
    setIsEditDialogOpen(true);
  };
  
  const handleEditSubmit = () => {
    const updatedRegions = regions.map(region => 
      region.id === selectedRegion.id ? { ...region, ...regionFormData } : region
    );
    setRegions(updatedRegions);
    setIsEditDialogOpen(false);
    toast.success('Region uğurla yeniləndi');
  };
  
  const handleDeleteDialogOpen = (region) => {
    setSelectedRegion(region);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = () => {
    const updatedRegions = regions.filter(region => region.id !== selectedRegion.id);
    setRegions(updatedRegions);
    setIsDeleteDialogOpen(false);
    toast.success('Region uğurla silindi');
  };
  
  const renderCompletionRateBadge = (rate) => {
    if (rate >= 80) {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">{rate}%</Badge>;
    } else if (rate >= 60) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">{rate}%</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">{rate}%</Badge>;
    }
  };
  
  const renderStatusBadge = (status) => {
    if (status === 'active') {
      return <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Aktiv</div>;
    } else {
      return <div className="flex items-center"><XCircle className="h-4 w-4 text-red-500 mr-1" /> Deaktiv</div>;
    }
  };
  
  const handleResetPassword = () => {
    if (newPassword.length < 6) {
      setPasswordError('Parol minimum 6 simvol olmalıdır');
      return;
    }
    
    toast.success(`${selectedAdmin?.email} üçün yeni parol təyin edildi`, {
      description: "Admin növbəti daxil olduqda bu parolu istifadə edəcək."
    });
    
    setShowPasswordReset(false);
    setNewPassword('');
    setIsUserDialogOpen(false);
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
                    <TableHead className="hidden md:table-cell">Admin</TableHead>
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
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-blue-500 hover:text-blue-700 flex items-center gap-1"
                            onClick={() => handleViewAdmin(region)}
                          >
                            <User className="h-4 w-4" />
                            {region.adminEmail}
                          </Button>
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
                      <TableCell colSpan={8} className="text-center h-24">
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
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Region əlavə et</DialogTitle>
            <DialogDescription>Yeni region əlavə etmək üçün məlumatları daxil edin.</DialogDescription>
          </DialogHeader>
          
          <Accordion type="single" collapsible defaultValue="region" className="w-full">
            <AccordionItem value="region">
              <AccordionTrigger className="text-lg font-medium">
                Region məlumatları
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Ad</Label>
                    <Input
                      id="add-name"
                      name="name"
                      value={regionFormData.name}
                      onChange={handleRegionFormChange}
                      placeholder="Region adı"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-description">Təsvir</Label>
                    <Input
                      id="add-description"
                      name="description"
                      value={regionFormData.description}
                      onChange={handleRegionFormChange}
                      placeholder="Region haqqında qısa məlumat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-status">Status</Label>
                    <select
                      id="add-status"
                      name="status"
                      value={regionFormData.status}
                      onChange={handleRegionFormChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="active">Aktiv</option>
                      <option value="inactive">Deaktiv</option>
                    </select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="admin">
              <AccordionTrigger className="text-lg font-medium">
                Admin məlumatları
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Admin adı</Label>
                    <Input
                      id="admin-name"
                      name="name"
                      value={adminFormData.name}
                      onChange={(e) => setAdminFormData({...adminFormData, name: e.target.value})}
                      placeholder="Admin adı və soyadı"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      name="email"
                      type="email"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({...adminFormData, email: e.target.value})}
                      placeholder="admin@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Şifrə</Label>
                    <Input
                      id="admin-password"
                      name="password"
                      type="password"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({...adminFormData, password: e.target.value})}
                      placeholder="Şifrə (minimum 6 simvol)"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Ləğv et</Button>
            <Button onClick={handleAddSubmit} 
              disabled={
                !regionFormData.name || 
                !adminFormData.name || 
                !adminFormData.email || 
                !adminFormData.password || 
                adminFormData.password.length < 6
              }
            >
              Əlavə et
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
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
                value={regionFormData.name}
                onChange={handleRegionFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Təsvir</Label>
              <Input
                id="edit-description"
                name="description"
                value={regionFormData.description}
                onChange={handleRegionFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                name="status"
                value={regionFormData.status}
                onChange={handleRegionFormChange}
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
      
      <Dialog open={isUserDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setShowPasswordReset(false);
          setNewPassword('');
          setPasswordError('');
        }
        setIsUserDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin məlumatları</DialogTitle>
            <DialogDescription>
              {selectedRegion?.name} regionunun admininə aid məlumatlar
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4 py-4">
              {!showPasswordReset ? (
                <>
                  <div className="flex flex-col space-y-1">
                    <Label className="text-sm text-muted-foreground">Ad</Label>
                    <p className="font-medium">{selectedAdmin.name}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Label className="text-sm text-muted-foreground">Email</Label>
                    <p className="font-medium">{selectedAdmin.email}</p>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Label className="text-sm text-muted-foreground">Rol</Label>
                    <Badge variant="secondary" className="w-fit">Region admin</Badge>
                  </div>
                  <div className="flex flex-col space-y-1">
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <Badge variant="outline" className={`w-fit ${selectedAdmin.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                      {selectedAdmin.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                    </Badge>
                  </div>
                </>
              ) : (
                <div className="flex flex-col space-y-4">
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="newPassword">Yeni parol</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (e.target.value.length < 6) {
                          setPasswordError('Parol minimum 6 simvol olmalıdır');
                        } else {
                          setPasswordError('');
                        }
                      }}
                      placeholder="Yeni parol daxil edin (minimum 6 simvol)"
                      className={passwordError ? "border-red-500" : ""}
                    />
                    {passwordError && <p className="text-red-500 text-sm">{passwordError}</p>}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Qeyd: Yeni parol təyin edildikdən sonra admin yeni parol ilə sistemə daxil olmalı olacaq.</p>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {!showPasswordReset ? (
              <>
                <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Bağla</Button>
                <Button onClick={() => setShowPasswordReset(true)}>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Parolu dəyiş
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowPasswordReset(false)}>Ləğv et</Button>
                <Button 
                  onClick={handleResetPassword}
                  disabled={newPassword.length < 6}
                >
                  Parolu dəyiş
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default Regions;
