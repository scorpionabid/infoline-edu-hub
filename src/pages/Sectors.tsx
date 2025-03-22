
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
  Globe, 
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
  User
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Role } from '@/context/AuthContext';
import { UserFormData } from '@/types/user';
import { mockUsers } from '@/data/mockUsers';

// Mock data for sectors
const mockSectors = [
  { 
    id: '1', 
    name: 'Yasamal', 
    region: 'Baku', 
    regionId: '1',
    description: 'Yasamal district in Baku city',
    schoolCount: 24,
    status: 'active',
    createdAt: '2023-01-15',
    completionRate: 78,
    adminId: 'sector-admin-1',
    adminEmail: 'yasamal.admin@infoline.edu'
  },
  { 
    id: '2', 
    name: 'Nizami', 
    region: 'Baku', 
    regionId: '1',
    description: 'Nizami district in Baku city',
    schoolCount: 18,
    status: 'active',
    createdAt: '2023-01-16',
    completionRate: 82,
    adminId: 'sector-admin-2',
    adminEmail: 'nizami.admin@infoline.edu'
  },
  { 
    id: '3', 
    name: 'Nasimi', 
    region: 'Baku', 
    regionId: '1',
    description: 'Nasimi district in Baku city',
    schoolCount: 21,
    status: 'active',
    createdAt: '2023-01-17',
    completionRate: 65,
    adminId: 'sector-admin-3',
    adminEmail: 'nasimi.admin@infoline.edu'
  },
  { 
    id: '4', 
    name: 'Sabunchu', 
    region: 'Baku', 
    regionId: '1',
    description: 'Sabunchu district in Baku city',
    schoolCount: 26,
    status: 'active',
    createdAt: '2023-01-18',
    completionRate: 71,
    adminId: 'sector-admin-4',
    adminEmail: 'sabunchu.admin@infoline.edu'
  },
  { 
    id: '5', 
    name: 'Surakhani', 
    region: 'Baku', 
    regionId: '1',
    description: 'Surakhani district in Baku city',
    schoolCount: 19,
    status: 'active',
    createdAt: '2023-01-19',
    completionRate: 59,
    adminId: 'sector-admin-5',
    adminEmail: 'surakhani.admin@infoline.edu'
  },
  { 
    id: '6', 
    name: 'Binagadi', 
    region: 'Baku', 
    regionId: '1',
    description: 'Binagadi district in Baku city',
    schoolCount: 22,
    status: 'active',
    createdAt: '2023-01-20',
    completionRate: 88,
    adminId: 'sector-admin-6',
    adminEmail: 'binagadi.admin@infoline.edu'
  },
  { 
    id: '7', 
    name: 'Narimanov', 
    region: 'Baku', 
    regionId: '1',
    description: 'Narimanov district in Baku city',
    schoolCount: 17,
    status: 'active',
    createdAt: '2023-01-21',
    completionRate: 76,
    adminId: 'sector-admin-7',
    adminEmail: 'narimanov.admin@infoline.edu'
  },
  { 
    id: '8', 
    name: 'Khatai', 
    region: 'Baku', 
    regionId: '1',
    description: 'Khatai district in Baku city',
    schoolCount: 20,
    status: 'inactive',
    createdAt: '2023-01-22',
    completionRate: 45,
    adminId: 'sector-admin-8',
    adminEmail: 'khatai.admin@infoline.edu'
  },
];

// Mock data for regions
const mockRegions = [
  { id: '1', name: 'Baku' },
  { id: '2', name: 'Ganja' },
  { id: '3', name: 'Sumgait' },
  { id: '4', name: 'Lankaran' },
];

const Sectors = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [sectors, setSectors] = useState(mockSectors);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  
  // Form state
  const [sectorFormData, setSectorFormData] = useState({
    name: '',
    regionId: '',
    description: '',
    status: 'active'
  });
  
  // Admin əlavə etmə formu
  const [adminFormData, setAdminFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'sectoradmin' as Role,
    status: 'active',
    notificationSettings: {
      email: true,
      system: true
    }
  });
  
  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter sectors based on search term
  const filteredSectors = sectors.filter(sector =>
    sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sector.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sector.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sector.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Handle sort
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Sort sectors based on sort config
  const sortedSectors = React.useMemo(() => {
    const sortableSectors = [...filteredSectors];
    if (sortConfig.key) {
      sortableSectors.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSectors;
  }, [filteredSectors, sortConfig]);
  
  // Sektor əlavə etmək
  const handleAddDialogOpen = () => {
    setSectorFormData({
      name: '',
      regionId: '',
      description: '',
      status: 'active'
    });
    
    setAdminFormData({
      name: '',
      email: '',
      password: '',
      role: 'sectoradmin' as Role,
      status: 'active',
      notificationSettings: {
        email: true,
        system: true
      }
    });
    
    setIsAddDialogOpen(true);
  };
  
  // Admin məlumatlarına baxmaq
  const handleViewAdmin = (sector) => {
    setSelectedSector(sector);
    // Burada admin məlumatlarını API-dən alardıq, amma mock data istifadə edirik
    const admin = mockUsers.find(user => user.id === sector.adminId);
    setSelectedAdmin(admin || { 
      id: sector.adminId, 
      name: 'Admin', 
      email: sector.adminEmail,
      role: 'sectoradmin' as Role,
      status: 'active'
    });
    setIsUserDialogOpen(true);
  };
  
  // Sektor form dəyişikliyini idarə etmək
  const handleSectorFormChange = (e) => {
    const { name, value } = e.target;
    setSectorFormData(prev => ({ ...prev, [name]: value }));
    
    // Sektor adı dəyişdikdə, admin email təklifi yarat
    if (name === 'name' && value) {
      const suggestedEmail = `${value.toLowerCase().replace(/\s+/g, '.')}.admin@infoline.edu`;
      setAdminFormData(prev => ({ 
        ...prev, 
        email: suggestedEmail,
        name: `${value} Admin`
      }));
    }
  };
  
  // Admin form dəyişikliyini idarə etmək
  const handleAdminFormChange = (e) => {
    const { name, value } = e.target;
    setAdminFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Sektor və admin yaratma
  const handleAddSubmit = () => {
    // Yeni sektor yaradaq
    const newSectorId = (sectors.length + 1).toString();
    const newAdminId = `sector-admin-${Date.now()}`;
    
    const newSector = {
      id: newSectorId,
      ...sectorFormData,
      region: mockRegions.find(r => r.id === sectorFormData.regionId)?.name || '',
      schoolCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      completionRate: 0,
      adminId: newAdminId,
      adminEmail: adminFormData.email
    };
    
    // Yeni admin əlavə edək
    const newAdmin = {
      ...adminFormData,
      id: newAdminId,
      regionId: sectorFormData.regionId,
      sectorId: newSectorId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Mock data-ya əlavə edək
    setSectors([...sectors, newSector]);
    mockUsers.push(newAdmin);
    
    setIsAddDialogOpen(false);
    toast.success('Sektor və admin uğurla əlavə edildi');
  };
  
  // Handle edit dialog open
  const handleEditDialogOpen = (sector) => {
    setSelectedSector(sector);
    setSectorFormData({
      name: sector.name,
      regionId: sector.regionId,
      description: sector.description,
      status: sector.status
    });
    setIsEditDialogOpen(true);
  };
  
  // Handle edit form submit
  const handleEditSubmit = () => {
    const updatedSectors = sectors.map(sector => 
      sector.id === selectedSector.id ? { 
        ...sector, 
        ...sectorFormData,
        region: mockRegions.find(r => r.id === sectorFormData.regionId)?.name || sector.region
      } : sector
    );
    setSectors(updatedSectors);
    setIsEditDialogOpen(false);
    toast.success('Sektor uğurla yeniləndi');
  };
  
  // Handle delete dialog open
  const handleDeleteDialogOpen = (sector) => {
    setSelectedSector(sector);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle delete confirm
  const handleDeleteConfirm = () => {
    const updatedSectors = sectors.filter(sector => sector.id !== selectedSector.id);
    setSectors(updatedSectors);
    setIsDeleteDialogOpen(false);
    toast.success('Sektor uğurla silindi');
  };
  
  // Admin parolunu sıfırlamaq
  const handleResetPassword = () => {
    toast.success(`${selectedAdmin.email} üçün parol sıfırlama linki göndərildi`);
    setIsUserDialogOpen(false);
  };
  
  // Render completion rate badge
  const renderCompletionRateBadge = (rate) => {
    if (rate >= 80) {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">{rate}%</Badge>;
    } else if (rate >= 60) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">{rate}%</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">{rate}%</Badge>;
    }
  };
  
  // Render status badge
  const renderStatusBadge = (status) => {
    if (status === 'active') {
      return <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Active</div>;
    } else {
      return <div className="flex items-center"><XCircle className="h-4 w-4 text-red-500 mr-1" /> Inactive</div>;
    }
  };
  
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('sectors')}</h1>
            <p className="text-muted-foreground">Manage and view sectors</p>
          </div>
          {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
            <Button onClick={handleAddDialogOpen} className="gap-1">
              <Plus className="h-4 w-4" />
              Sektor əlavə et
            </Button>
          )}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sectors..."
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
                    <TableHead onClick={() => handleSort('region')} className="cursor-pointer">
                      <div className="flex items-center">
                        Region
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Məktəblər</TableHead>
                    <TableHead className="hidden md:table-cell">Admin</TableHead>
                    <TableHead className="hidden md:table-cell">Tamamlanma</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSectors.length > 0 ? (
                    sortedSectors.map(sector => (
                      <TableRow key={sector.id}>
                        <TableCell className="font-medium">{sector.id}</TableCell>
                        <TableCell>{sector.name}</TableCell>
                        <TableCell>{sector.region}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <School className="h-4 w-4 text-muted-foreground" />
                            {sector.schoolCount}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto text-blue-500 hover:text-blue-700 flex items-center gap-1"
                            onClick={() => handleViewAdmin(sector)}
                          >
                            <User className="h-4 w-4" />
                            {sector.adminEmail}
                          </Button>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {renderCompletionRateBadge(sector.completionRate)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {renderStatusBadge(sector.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/sectors/${sector.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Bax
                              </DropdownMenuItem>
                              {(user?.role === 'superadmin' || user?.role === 'regionadmin') && (
                                <>
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditDialogOpen(sector)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Redaktə et
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleDeleteDialogOpen(sector)}>
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
                          <Globe className="h-8 w-8 mb-2" />
                          <p>Sektor tapılmadı</p>
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
          </CardContent>
        </Card>
      </div>
      
      {/* Sektor əlavə etmək dialoqu */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sektor əlavə et</DialogTitle>
            <DialogDescription>Yeni sektor əlavə etmək üçün məlumatları daxil edin.</DialogDescription>
          </DialogHeader>
          
          <Accordion type="single" collapsible defaultValue="sector" className="w-full">
            <AccordionItem value="sector">
              <AccordionTrigger className="text-lg font-medium">
                Sektor məlumatları
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="add-name">Ad</Label>
                    <Input
                      id="add-name"
                      name="name"
                      value={sectorFormData.name}
                      onChange={handleSectorFormChange}
                      placeholder="Sektor adı"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-region">Region</Label>
                    <select
                      id="add-region"
                      name="regionId"
                      value={sectorFormData.regionId}
                      onChange={handleSectorFormChange}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Region seçin</option>
                      {mockRegions.map(region => (
                        <option key={region.id} value={region.id}>{region.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-description">Təsvir</Label>
                    <Input
                      id="add-description"
                      name="description"
                      value={sectorFormData.description}
                      onChange={handleSectorFormChange}
                      placeholder="Sektor haqqında qısa məlumat"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="add-status">Status</Label>
                    <select
                      id="add-status"
                      name="status"
                      value={sectorFormData.status}
                      onChange={handleSectorFormChange}
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
                      onChange={handleAdminFormChange}
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
                      onChange={handleAdminFormChange}
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
                      onChange={handleAdminFormChange}
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
                !sectorFormData.name || 
                !sectorFormData.regionId || 
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
      
      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sektoru redaktə et</DialogTitle>
            <DialogDescription>Sektor məlumatlarını dəyişin.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Ad</Label>
              <Input
                id="edit-name"
                name="name"
                value={sectorFormData.name}
                onChange={handleSectorFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-region">Region</Label>
              <select
                id="edit-region"
                name="regionId"
                value={sectorFormData.regionId}
                onChange={handleSectorFormChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Region seçin</option>
                {mockRegions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Təsvir</Label>
              <Input
                id="edit-description"
                name="description"
                value={sectorFormData.description}
                onChange={handleSectorFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <select
                id="edit-status"
                name="status"
                value={sectorFormData.status}
                onChange={handleSectorFormChange}
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
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Silməyi təsdiqlə</DialogTitle>
            <DialogDescription>
              "{selectedSector?.name}" sektorunu silmək istədiyinizə əminsiniz?
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
      
      {/* Admin məlumatları dialoqu */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Admin məlumatları</DialogTitle>
            <DialogDescription>
              {selectedSector?.name} sektorunun admininə aid məlumatlar
            </DialogDescription>
          </DialogHeader>
          {selectedAdmin && (
            <div className="space-y-4 py-4">
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
                <Badge variant="secondary" className="w-fit">Sektor admin</Badge>
              </div>
              <div className="flex flex-col space-y-1">
                <Label className="text-sm text-muted-foreground">Status</Label>
                <Badge variant="outline" className={`w-fit ${selectedAdmin.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {selectedAdmin.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>Bağla</Button>
            <Button onClick={handleResetPassword}>Parolu sıfırla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default Sectors;
