
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
  DialogTitle,
  DialogTabs,
  DialogTab,
  DialogTabsList,
  DialogTabsContent,
} from "@/components/ui/dialog";
import { 
  School, 
  Pencil, 
  Trash2, 
  Eye,
  Plus,
  Search,
  MoreHorizontal,
  Users,
  GraduationCap,
  Languages,
  GalleryVerticalEnd,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileDown,
  FileUp,
  User,
  KeyRound,
  Mail,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Saxta məktəb məlumatları
const mockSchools = [
  {
    id: '1',
    name: '20 nömrəli orta məktəb',
    principalName: 'Əhməd İbrahimov',
    address: 'Bakı ş., Yasamal r., 28 may küç., 7',
    region: 'Bakı',
    regionId: '1',
    sector: 'Yasamal',
    sectorId: '1',
    phone: '+994 12 432 15 78',
    email: 'mekteb20@edu.gov.az',
    studentCount: 856,
    teacherCount: 74,
    status: 'active',
    type: 'full_secondary',
    language: 'az',
    createdAt: '2023-02-10',
    completionRate: 92,
    logo: '',
    adminEmail: 'admin20@infoline.edu.az'
  },
  {
    id: '2',
    name: '6 nömrəli orta məktəb',
    principalName: 'Elmira Hüseynova',
    address: 'Bakı ş., Nəsimi r., Azadlıq pr., 145',
    region: 'Bakı',
    regionId: '1',
    sector: 'Nəsimi',
    sectorId: '3',
    phone: '+994 12 493 26 89',
    email: 'mekteb6@edu.gov.az',
    studentCount: 934,
    teacherCount: 82,
    status: 'active',
    type: 'full_secondary',
    language: 'az',
    createdAt: '2023-02-11',
    completionRate: 87,
    logo: '',
    adminEmail: 'admin6@infoline.edu.az'
  },
  {
    id: '3',
    name: '52 nömrəli orta məktəb',
    principalName: 'Kamran Kərimov',
    address: 'Bakı ş., Nizami r., Qara Qarayev küç., 24',
    region: 'Bakı',
    regionId: '1',
    sector: 'Nizami',
    sectorId: '2',
    phone: '+994 12 371 42 56',
    email: 'mekteb52@edu.gov.az',
    studentCount: 712,
    teacherCount: 65,
    status: 'active',
    type: 'full_secondary',
    language: 'az',
    createdAt: '2023-02-12',
    completionRate: 76,
    logo: '',
    adminEmail: 'admin52@infoline.edu.az'
  },
  {
    id: '4',
    name: '17 nömrəli orta məktəb',
    principalName: 'Fəridə Məmmədova',
    address: 'Bakı ş., Binəqədi r., 7-ci mkr., 32',
    region: 'Bakı',
    regionId: '1',
    sector: 'Binəqədi',
    sectorId: '6',
    phone: '+994 12 562 78 90',
    email: 'mekteb17@edu.gov.az',
    studentCount: 621,
    teacherCount: 56,
    status: 'active',
    type: 'general_secondary',
    language: 'az',
    createdAt: '2023-02-13',
    completionRate: 82,
    logo: '',
    adminEmail: 'admin17@infoline.edu.az'
  },
  {
    id: '5',
    name: '145 nömrəli orta məktəb',
    principalName: 'Namiq Əliyev',
    address: 'Bakı ş., Sabunçu r., 58-ci məhəllə, 4',
    region: 'Bakı',
    regionId: '1',
    sector: 'Sabunçu',
    sectorId: '4',
    phone: '+994 12 452 36 41',
    email: 'mekteb145@edu.gov.az',
    studentCount: 547,
    teacherCount: 49,
    status: 'active',
    type: 'full_secondary',
    language: 'az',
    createdAt: '2023-02-14',
    completionRate: 65,
    logo: '',
    adminEmail: 'admin145@infoline.edu.az'
  },
  {
    id: '6',
    name: '83 nömrəli orta məktəb',
    principalName: 'Səbinə Quliyeva',
    address: 'Bakı ş., Xətai r., General Şıxlinski küç., 13',
    region: 'Bakı',
    regionId: '1',
    sector: 'Xətai',
    sectorId: '8',
    phone: '+994 12 378 45 21',
    email: 'mekteb83@edu.gov.az',
    studentCount: 689,
    teacherCount: 58,
    status: 'active',
    type: 'full_secondary',
    language: 'ru',
    createdAt: '2023-02-15',
    completionRate: 91,
    logo: '',
    adminEmail: 'admin83@infoline.edu.az'
  },
  {
    id: '7',
    name: '31 nömrəli orta məktəb',
    principalName: 'Tahir Həsənov',
    address: 'Bakı ş., Suraxanı r., Hövsan qəs., 5',
    region: 'Bakı',
    regionId: '1',
    sector: 'Suraxanı',
    sectorId: '5',
    phone: '+994 12 457 32 84',
    email: 'mekteb31@edu.gov.az',
    studentCount: 523,
    teacherCount: 44,
    status: 'inactive',
    type: 'general_secondary',
    language: 'az',
    createdAt: '2023-02-16',
    completionRate: 45,
    logo: '',
    adminEmail: 'admin31@infoline.edu.az'
  },
  {
    id: '8',
    name: '123 nömrəli orta məktəb',
    principalName: 'Rəna Həsənova',
    address: 'Bakı ş., Nərimanov r., Atatürk pr., 32',
    region: 'Bakı',
    regionId: '1',
    sector: 'Nərimanov',
    sectorId: '7',
    phone: '+994 12 567 89 34',
    email: 'mekteb123@edu.gov.az',
    studentCount: 765,
    teacherCount: 67,
    status: 'active',
    type: 'full_secondary',
    language: 'az',
    createdAt: '2023-02-17',
    completionRate: 88,
    logo: '',
    adminEmail: 'admin123@infoline.edu.az'
  },
];

// Saxta sektor və region məlumatları
const mockSectors = [
  { id: '1', name: 'Yasamal', regionId: '1' },
  { id: '2', name: 'Nizami', regionId: '1' },
  { id: '3', name: 'Nəsimi', regionId: '1' },
  { id: '4', name: 'Sabunçu', regionId: '1' },
  { id: '5', name: 'Suraxanı', regionId: '1' },
  { id: '6', name: 'Binəqədi', regionId: '1' },
  { id: '7', name: 'Nərimanov', regionId: '1' },
  { id: '8', name: 'Xətai', regionId: '1' },
];

const mockRegions = [
  { id: '1', name: 'Bakı' },
  { id: '2', name: 'Gəncə' },
  { id: '3', name: 'Sumqayıt' },
  { id: '4', name: 'Mingəçevir' },
];

const Schools = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [schools, setSchools] = useState(mockSchools);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [currentTab, setCurrentTab] = useState('school');
  
  // Form vəziyyəti
  const initialFormState = {
    name: '',
    principalName: '',
    address: '',
    regionId: '',
    sectorId: '',
    phone: '',
    email: '',
    studentCount: '',
    teacherCount: '',
    status: 'active',
    type: 'full_secondary',
    language: 'az',
    adminEmail: '',
    adminFullName: '',
    adminPassword: '',
    adminStatus: 'active'
  };
  
  const [formData, setFormData] = useState(initialFormState);
  
  // Axtarışı həndlə etmək
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  // Filter funksiyaları
  const handleRegionFilter = (e) => {
    setSelectedRegion(e.target.value);
    setCurrentPage(1);
    // Region dəyişdikdə sektoru sıfırla
    if (e.target.value === '') {
      setSelectedSector('');
    }
  };
  
  const handleSectorFilter = (e) => {
    setSelectedSector(e.target.value);
    setCurrentPage(1);
  };
  
  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };
  
  // Filtrlənmiş sektorları almaq
  const filteredSectors = selectedRegion 
    ? mockSectors.filter(sector => sector.regionId === selectedRegion) 
    : mockSectors;
  
  // Axtarış və filtrləmə
  const filteredSchools = schools.filter(school => {
    // Axtarış
    const searchMatch = 
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.principalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.phone.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Region filtrləmə
    const regionMatch = selectedRegion ? school.regionId === selectedRegion : true;
    
    // Sektor filtrləmə
    const sectorMatch = selectedSector ? school.sectorId === selectedSector : true;
    
    // Status filtrləmə
    const statusMatch = selectedStatus ? school.status === selectedStatus : true;
    
    return searchMatch && regionMatch && sectorMatch && statusMatch;
  });
  
  // Sıralama
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Məlumatları sırala
  const sortedSchools = React.useMemo(() => {
    const sortableSchools = [...filteredSchools];
    if (sortConfig.key) {
      sortableSchools.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableSchools;
  }, [filteredSchools, sortConfig]);
  
  // Səhifələndirmə
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSchools.slice(indexOfFirstItem, indexOfLastItem);
  
  // Səhifə dəyişdirmək
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Ümumi səhifə sayı
  const totalPages = Math.ceil(sortedSchools.length / itemsPerPage);
  
  // Əlavə etmə dialoqu
  const handleAddDialogOpen = () => {
    setFormData(initialFormState);
    setCurrentTab('school');
    setIsAddDialogOpen(true);
  };
  
  // Admin dialoqu
  const handleAdminDialogOpen = (school) => {
    setSelectedAdmin(school);
    setIsAdminDialogOpen(true);
  };
  
  // Admin dəyişikliklərini saxlamaq
  const handleAdminUpdate = () => {
    // Burada admin məlumatlarının yenilənməsi məntiqi olacaq
    toast.success('Admin məlumatları yeniləndi');
    setIsAdminDialogOpen(false);
  };
  
  // Adminin parolunu sıfırlamaq
  const handleResetPassword = () => {
    toast.success('Parol sıfırlama linki admin e-poçtuna göndərildi');
  };
  
  // Əlavə etmək formu
  const handleAddSubmit = () => {
    // Zəruri sahələri yoxla
    if (!formData.name || !formData.regionId || !formData.sectorId) {
      toast.error('Zəruri sahələri doldurun: Məktəb adı, Region və Sektor');
      return;
    }
    
    if (currentTab === 'admin' && (!formData.adminEmail || !formData.adminFullName || !formData.adminPassword)) {
      toast.error('Zəruri admin məlumatlarını doldurun: Ad Soyad, Email və Parol');
      return;
    }
    
    const newSchool = {
      id: (schools.length + 1).toString(),
      ...formData,
      studentCount: Number(formData.studentCount) || 0,
      teacherCount: Number(formData.teacherCount) || 0,
      createdAt: new Date().toISOString().split('T')[0],
      completionRate: 0,
      region: mockRegions.find(r => r.id === formData.regionId)?.name || '',
      sector: mockSectors.find(s => s.id === formData.sectorId)?.name || '',
      logo: '',
      adminEmail: formData.adminEmail || ''
    };
    
    setSchools([...schools, newSchool]);
    setIsAddDialogOpen(false);
    toast.success('Məktəb uğurla əlavə edildi');
    
    if (formData.adminEmail) {
      toast.success('Məktəb admini uğurla yaradıldı');
    }
  };
  
  // Redaktə dialoqu
  const handleEditDialogOpen = (school) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      principalName: school.principalName,
      address: school.address,
      regionId: school.regionId,
      sectorId: school.sectorId,
      phone: school.phone,
      email: school.email,
      studentCount: school.studentCount.toString(),
      teacherCount: school.teacherCount.toString(),
      status: school.status,
      type: school.type,
      language: school.language,
      adminEmail: school.adminEmail || '',
      adminFullName: '',
      adminPassword: '',
      adminStatus: 'active'
    });
    setIsEditDialogOpen(true);
  };
  
  // Form dəyişikliyi
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Region dəyişdikdə sektoru sıfırla
    if (name === 'regionId') {
      setFormData(prev => ({ ...prev, sectorId: '' }));
    }
  };
  
  // Redaktə formu
  const handleEditSubmit = () => {
    // Zəruri sahələri yoxla
    if (!formData.name || !formData.regionId || !formData.sectorId) {
      toast.error('Zəruri sahələri doldurun: Məktəb adı, Region və Sektor');
      return;
    }
    
    const updatedSchools = schools.map(school => 
      school.id === selectedSchool.id ? { 
        ...school, 
        ...formData,
        studentCount: Number(formData.studentCount) || 0,
        teacherCount: Number(formData.teacherCount) || 0,
        region: mockRegions.find(r => r.id === formData.regionId)?.name || '',
        sector: mockSectors.find(s => s.id === formData.sectorId)?.name || ''
      } : school
    );
    
    setSchools(updatedSchools);
    setIsEditDialogOpen(false);
    toast.success('Məktəb uğurla yeniləndi');
  };
  
  // Silmə dialoqu
  const handleDeleteDialogOpen = (school) => {
    setSelectedSchool(school);
    setIsDeleteDialogOpen(true);
  };
  
  // Silməni təsdiqləmək
  const handleDeleteConfirm = () => {
    const updatedSchools = schools.filter(school => school.id !== selectedSchool.id);
    setSchools(updatedSchools);
    setIsDeleteDialogOpen(false);
    toast.success('Məktəb uğurla silindi');
  };
  
  // Filtrləri sıfırlamaq
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedSector('');
    setSelectedStatus('');
    setCurrentPage(1);
  };
  
  // Tamamlanma faizi badge
  const renderCompletionRateBadge = (rate) => {
    if (rate >= 80) {
      return <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">{rate}%</Badge>;
    } else if (rate >= 60) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800">{rate}%</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">{rate}%</Badge>;
    }
  };
  
  // Status badge
  const renderStatusBadge = (status) => {
    if (status === 'active') {
      return <div className="flex items-center"><CheckCircle className="h-4 w-4 text-green-500 mr-1" /> Aktiv</div>;
    } else {
      return <div className="flex items-center"><XCircle className="h-4 w-4 text-red-500 mr-1" /> Deaktiv</div>;
    }
  };
  
  // Məktəb növü formatı
  const getSchoolTypeLabel = (type) => {
    switch (type) {
      case 'full_secondary': return 'Tam orta';
      case 'general_secondary': return 'Ümumi orta';
      case 'primary': return 'İbtidai';
      case 'lyceum': return 'Lisey';
      case 'gymnasium': return 'Gimnaziya';
      default: return 'Digər';
    }
  };
  
  // Tədris dili formatı
  const getLanguageLabel = (language) => {
    switch (language) {
      case 'az': return 'Azərbaycan';
      case 'ru': return 'Rus';
      case 'en': return 'İngilis';
      case 'tr': return 'Türk';
      default: return 'Digər';
    }
  };
  
  // Məktəb üçün loqo initial
  const getSchoolInitial = (name) => {
    return name.charAt(0).toUpperCase();
  };
  
  // Excel export
  const handleExport = () => {
    toast.success('Excel faylı yüklənir...');
    // Əsl layihədə Excel export funksionallığı burada olardı
  };
  
  // Excel import
  const handleImport = () => {
    toast.success('Excel faylından məlumatlar yükləndi');
    // Əsl layihədə Excel import funksionallığı burada olardı
  };
  
  return (
    <SidebarLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('schools')}</h1>
            <p className="text-muted-foreground">Məktəbləri idarə et və izlə</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            {(user?.role === 'superadmin' || user?.role === 'regionadmin' || user?.role === 'sectoradmin') && (
              <Button onClick={handleAddDialogOpen} className="gap-1">
                <Plus className="h-4 w-4" />
                Məktəb əlavə et
              </Button>
            )}
            <Button variant="outline" onClick={handleExport} className="gap-1">
              <FileDown className="h-4 w-4" />
              Excel Export
            </Button>
            <Button variant="outline" onClick={handleImport} className="gap-1">
              <FileUp className="h-4 w-4" />
              Excel Import
            </Button>
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            {/* Axtarış və filtrlər */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Məktəbləri axtar..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div>
                <select
                  value={selectedRegion}
                  onChange={handleRegionFilter}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Bütün regionlar</option>
                  {mockRegions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <select
                  value={selectedSector}
                  onChange={handleSectorFilter}
                  disabled={!selectedRegion}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Bütün sektorlar</option>
                  {filteredSectors.map(sector => (
                    <option key={sector.id} value={sector.id}>{sector.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <select
                  value={selectedStatus}
                  onChange={handleStatusFilter}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Bütün statuslar</option>
                  <option value="active">Aktiv</option>
                  <option value="inactive">Deaktiv</option>
                </select>
              </div>
              
              <div>
                <Button variant="outline" onClick={resetFilters} className="w-full">
                  Filtrləri sıfırla
                </Button>
              </div>
            </div>
            
            {/* Cədvəl */}
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
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/schools/${school.id}`)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Bax
                              </DropdownMenuItem>
                              {(user?.role === 'superadmin' || user?.role === 'regionadmin' || user?.role === 'sectoradmin') && (
                                <>
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => handleEditDialogOpen(school)}>
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Redaktə et
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate(`/schools/${school.id}/data`)}>
                                    <GalleryVerticalEnd className="h-4 w-4 mr-2" />
                                    Məlumatlar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="cursor-pointer text-destructive" onClick={() => handleDeleteDialogOpen(school)}>
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
                          <School className="h-8 w-8 mb-2" />
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
            
            {/* Səhifələndirmə */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Əlavə et dialoqu */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Yeni məktəb əlavə et</DialogTitle>
            <DialogDescription>
              Məktəb məlumatlarını əlavə edin. Məktəb admini yaratmaq istəyirsinizsə, ikinci tabda admin məlumatlarını da doldurun.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="school" value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="school">Məktəb məlumatları</TabsTrigger>
              <TabsTrigger value="admin">Admin məlumatları</TabsTrigger>
            </TabsList>
            
            <TabsContent value="school" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Məktəb adı<span className="text-red-500">*</span></Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleFormChange} />
                </div>
                
                <div>
                  <Label htmlFor="principalName">Direktoru</Label>
                  <Input id="principalName" name="principalName" value={formData.principalName} onChange={handleFormChange} />
                </div>
                
                <div>
                  <Label htmlFor="regionId">Region<span className="text-red-500">*</span></Label>
                  <select 
                    id="regionId" 
                    name="regionId" 
                    value={formData.regionId} 
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="">Region seçin</option>
                    {mockRegions.map(region => (
                      <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="sectorId">Sektor<span className="text-red-500">*</span></Label>
                  <select 
                    id="sectorId" 
                    name="sectorId" 
                    value={formData.sectorId}
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                    disabled={!formData.regionId}
                  >
                    <option value="">Sektor seçin</option>
                    {formData.regionId && filteredSectors
                      .filter(sector => sector.regionId === formData.regionId)
                      .map(sector => (
                        <option key={sector.id} value={sector.id}>{sector.name}</option>
                      ))
                    }
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="type">Məktəb növü</Label>
                  <select 
                    id="type" 
                    name="type" 
                    value={formData.type} 
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="full_secondary">Tam orta</option>
                    <option value="general_secondary">Ümumi orta</option>
                    <option value="primary">İbtidai</option>
                    <option value="lyceum">Lisey</option>
                    <option value="gymnasium">Gimnaziya</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="language">Tədris dili</Label>
                  <select 
                    id="language" 
                    name="language" 
                    value={formData.language} 
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="az">Azərbaycan</option>
                    <option value="ru">Rus</option>
                    <option value="en">İngilis</option>
                    <option value="tr">Türk</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="studentCount">Şagird sayı</Label>
                  <Input id="studentCount" name="studentCount" type="number" value={formData.studentCount} onChange={handleFormChange} />
                </div>
                
                <div>
                  <Label htmlFor="teacherCount">Müəllim sayı</Label>
                  <Input id="teacherCount" name="teacherCount" type="number" value={formData.teacherCount} onChange={handleFormChange} />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleFormChange} />
                </div>
                
                <div>
                  <Label htmlFor="email">E-poçt</Label>
                  <Input id="email" name="email" value={formData.email} onChange={handleFormChange} />
                </div>
                
                <div className="md:col-span-2">
                  <Label htmlFor="address">Ünvan</Label>
                  <Input id="address" name="address" value={formData.address} onChange={handleFormChange} />
                </div>
                
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status" 
                    name="status" 
                    value={formData.status} 
                    onChange={handleFormChange}
                    className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="active">Aktiv</option>
                    <option value="inactive">Deaktiv</option>
                  </select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="admin" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="adminFullName">Admin adı soyadı</Label>
                    <Input 
                      id="adminFullName" 
                      name="adminFullName" 
                      value={formData.adminFullName} 
                      onChange={handleFormChange}
                      placeholder="Adı Soyadı"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="adminEmail">Admin e-poçt</Label>
                    <Input 
                      id="adminEmail" 
                      name="adminEmail" 
                      value={formData.adminEmail} 
                      onChange={handleFormChange}
                      placeholder="admin@nümunə.az"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="adminPassword">Şifrə</Label>
                    <Input 
                      id="adminPassword" 
                      name="adminPassword" 
                      type="password" 
                      value={formData.adminPassword} 
                      onChange={handleFormChange}
                      placeholder="Güclü şifrə daxil edin"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="adminStatus">Admin statusu</Label>
                    <select 
                      id="adminStatus" 
                      name="adminStatus" 
                      value={formData.adminStatus} 
                      onChange={handleFormChange}
                      className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="active">Aktiv</option>
                      <option value="inactive">Deaktiv</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4 inline-block mr-1" />
                  Admin məlumatları doldurulduqda, bu istifadəçi məktəb admini olaraq avtomatik yaradılacaq.
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>İmtina</Button>
            <Button onClick={handleAddSubmit}>Məktəb əlavə et</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Redaktə et dialoqu */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Məktəbi redaktə et</DialogTitle>
            <DialogDescription>
              Məktəb məlumatlarını yeniləyin. 
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Məktəb adı<span className="text-red-500">*</span></Label>
                <Input id="edit-name" name="name" value={formData.name} onChange={handleFormChange} />
              </div>
              
              <div>
                <Label htmlFor="edit-principalName">Direktoru</Label>
                <Input id="edit-principalName" name="principalName" value={formData.principalName} onChange={handleFormChange} />
              </div>
              
              <div>
                <Label htmlFor="edit-regionId">Region<span className="text-red-500">*</span></Label>
                <select 
                  id="edit-regionId" 
                  name="regionId" 
                  value={formData.regionId} 
                  onChange={handleFormChange}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="">Region seçin</option>
                  {mockRegions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-sectorId">Sektor<span className="text-red-500">*</span></Label>
                <select 
                  id="edit-sectorId" 
                  name="sectorId" 
                  value={formData.sectorId}
                  onChange={handleFormChange}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                  disabled={!formData.regionId}
                >
                  <option value="">Sektor seçin</option>
                  {formData.regionId && filteredSectors
                    .filter(sector => sector.regionId === formData.regionId)
                    .map(sector => (
                      <option key={sector.id} value={sector.id}>{sector.name}</option>
                    ))
                  }
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-type">Məktəb növü</Label>
                <select 
                  id="edit-type" 
                  name="type" 
                  value={formData.type} 
                  onChange={handleFormChange}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="full_secondary">Tam orta</option>
                  <option value="general_secondary">Ümumi orta</option>
                  <option value="primary">İbtidai</option>
                  <option value="lyceum">Lisey</option>
                  <option value="gymnasium">Gimnaziya</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-language">Tədris dili</Label>
                <select 
                  id="edit-language" 
                  name="language" 
                  value={formData.language} 
                  onChange={handleFormChange}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="az">Azərbaycan</option>
                  <option value="ru">Rus</option>
                  <option value="en">İngilis</option>
                  <option value="tr">Türk</option>
                </select>
              </div>
              
              <div>
                <Label htmlFor="edit-studentCount">Şagird sayı</Label>
                <Input id="edit-studentCount" name="studentCount" type="number" value={formData.studentCount} onChange={handleFormChange} />
              </div>
              
              <div>
                <Label htmlFor="edit-teacherCount">Müəllim sayı</Label>
                <Input id="edit-teacherCount" name="teacherCount" type="number" value={formData.teacherCount} onChange={handleFormChange} />
              </div>
              
              <div>
                <Label htmlFor="edit-phone">Telefon</Label>
                <Input id="edit-phone" name="phone" value={formData.phone} onChange={handleFormChange} />
              </div>
              
              <div>
                <Label htmlFor="edit-email">E-poçt</Label>
                <Input id="edit-email" name="email" value={formData.email} onChange={handleFormChange} />
              </div>
              
              <div className="md:col-span-2">
                <Label htmlFor="edit-address">Ünvan</Label>
                <Input id="edit-address" name="address" value={formData.address} onChange={handleFormChange} />
              </div>
              
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select 
                  id="edit-status" 
                  name="status" 
                  value={formData.status} 
                  onChange={handleFormChange}
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm"
                >
                  <option value="active">Aktiv</option>
                  <option value="inactive">Deaktiv</option>
                </select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>İmtina</Button>
            <Button onClick={handleEditSubmit}>Məlumatları yadda saxla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Silmə dialoqu */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Məktəbi sil</DialogTitle>
            <DialogDescription>
              Bu məktəbi silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSchool && (
            <div className="py-4">
              <p className="text-center text-lg font-medium">{selectedSchool.name}</p>
              <p className="text-center text-sm text-muted-foreground">{selectedSchool.address}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>İmtina</Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Admin məlumatları dialoqu */}
      <Dialog open={isAdminDialogOpen} onOpenChange={setIsAdminDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Məktəb admin məlumatları</DialogTitle>
            <DialogDescription>
              Məktəb admininin məlumatlarını görüntüləyin və idarə edin.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAdmin && (
            <div className="py-4 space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {selectedAdmin.adminEmail ? selectedAdmin.adminEmail.charAt(0).toUpperCase() : "A"}
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <p className="text-lg font-medium">{selectedAdmin.name}</p>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedAdmin.adminEmail}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="admin-email">Admin e-poçt</Label>
                  <Input 
                    id="admin-email"
                    value={selectedAdmin.adminEmail}
                    disabled
                  />
                </div>
                
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">
                    {renderStatusBadge(selectedAdmin.status)}
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button variant="outline" className="w-full" onClick={handleResetPassword}>
                  <KeyRound className="h-4 w-4 mr-2" />
                  Parolu sıfırla
                </Button>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdminDialogOpen(false)}>Bağla</Button>
            <Button onClick={handleAdminUpdate}>Yadda saxla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarLayout>
  );
};

export default Schools;
