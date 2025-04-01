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
import { useSectorsStore } from '@/hooks/useSectorsStore';
import { useRegions } from '@/hooks/useRegions';

const Sectors = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { regions } = useRegions();
  
  const {
    sectors,
    loading,
    searchTerm,
    selectedStatus,
    sortConfig,
    currentPage,
    totalPages,
    handleSearch,
    handleStatusFilter,
    handleSort,
    handlePageChange,
    resetFilters,
    handleAddSector,
    handleUpdateSector,
    handleDeleteSector
  } = useSectorsStore();
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  
  const [sectorFormData, setSectorFormData] = useState({
    name: '',
    description: '',
    status: 'active',
    region_id: ''
  });
  
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
  
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  
  const handleAddDialogOpen = () => {
    setSectorFormData({
      name: '',
      description: '',
      status: 'active',
      region_id: ''
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
  
  const handleViewAdmin = (sector) => {
    setSelectedSector(sector);
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
  
  const handleSectorFormChange = (e) => {
    const { name, value } = e.target;
    setSectorFormData(prev => ({ ...prev, [name]: value }));
    
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
  
  const handleAddSubmit = async () => {
    const sectorDataToAdd = {
      name: sectorFormData.name,
      description: sectorFormData.description,
      region_id: selectedRegion,
      status: sectorFormData.status as 'active' | 'inactive'
    };
    
    const success = await handleAddSector(sectorDataToAdd);
    
    if (success) {
      const newAdminId = `user-${Date.now()}`;
      const newAdmin = {
        ...adminFormData,
        id: newAdminId,
        regionId: selectedRegion,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockUsers.push(newAdmin);
      
      setIsAddDialogOpen(false);
      toast.success('Sektor və admin uğurla əlavə edildi');
    }
  };
  
  const handleEditDialogOpen = (sector) => {
    setSelectedSector(sector);
    setSectorFormData({
      name: sector.name,
      description: sector.description || '',
      status: sector.status,
      region_id: sector.region_id
    });
    setSelectedRegion(sector.region_id);
    setIsEditDialogOpen(true);
  };
  
  const handleEditSubmit = async () => {
    if (!selectedSector) return;
    
    const sectorUpdates = {
      name: sectorFormData.name,
      description: sectorFormData.description,
      status: sectorFormData.status,
      region_id: selectedRegion
    };
    
    const success = await handleUpdateSector(selectedSector.id, sectorUpdates);
    if (success) {
      setIsEditDialogOpen(false);
    }
  };
  
  const handleDeleteDialogOpen = (sector) => {
    setSelectedSector(sector);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!selectedSector) return;
    
    const success = await handleDeleteSector(selectedSector.id);
    if (success) {
      setIsDeleteDialogOpen(false);
    }
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
            <h1 className="text-2xl font-bold tracking-tight">{t('sectors')}</h1>
            <p className="text-muted-foreground">Sektorları idarə et və izlə</p>
          </div>
          {user?.role === 'superadmin' || user?.role === 'regionadmin' && (
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
                  placeholder="Sektorları axtar..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
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
                    <TableHead className="hidden md:table-cell" onClick={() => handleSort('regionName')}>
                      <div className="flex items-center">
                        Region
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Məktəblər</TableHead>
                    <TableHead className="hidden md:table-cell">Admin</TableHead>
                    <TableHead className="hidden md:table-cell">Tamamlanma</TableHead>
                    <TableHead className="hidden md:table-cell" onClick={() => handleSort('status')}>
                      <div className="flex items-center">
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center h-24">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <p>Məlumatlar yüklənir...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : sectors.length > 0 ? (
                    sectors.map(sector => (
                      <TableRow key={sector.id}>
                        <TableCell className="font-medium">{sector.id.substring(0, 4)}...</TableCell>
                        <TableCell>{sector.name}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {sector.regionName}
                        </TableCell>
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
                          <Map className="h-8 w-8 mb-2" />
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
            
            {totalPages > 1 && (
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
                    <Label htmlFor="add-region">Region</Label>
                    <select
                      id="add-region"
                      name="regionId"
                      value={selectedRegion}
                      onChange={(e) => setSelectedRegion(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Region seçin</option>
                      {regions.map(region => (
                        <option key={region.id} value={region.id}>{region.name}</option>
                      ))}
                    </select>
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
                !sectorFormData.name || 
                !selectedRegion ||
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
              <Label htmlFor="edit-description">Təsvir</Label>
              <Input
                id="edit-description"
                name="description"
                value={sectorFormData.description}
                onChange={handleSectorFormChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-region">Region</Label>
              <select
                id="edit-region"
                name="regionId"
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Region seçin</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
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
              {selectedSector?.name} sektorunun admininə aid məlumatlar
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
                    <Badge variant="secondary" className="w-fit">Sektor admin</Badge>
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

export default Sectors;
