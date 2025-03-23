
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { 
  School, 
  SchoolFormData, 
  SortConfig, 
  mockSchools, 
  mockSectors, 
  mockRegions 
} from '@/data/schoolsData';

// Komponentləri idxal edirik
import SchoolHeader from '@/components/schools/SchoolHeader';
import SchoolFilters from '@/components/schools/SchoolFilters';
import SchoolTable from '@/components/schools/SchoolTable';
import SchoolPagination from '@/components/schools/SchoolPagination';
import { 
  AddDialog, 
  EditDialog, 
  DeleteDialog, 
  AdminDialog 
} from '@/components/schools/SchoolDialogs';

const Schools = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // State vəziyyətləri
  const [schools, setSchools] = useState<School[]>(mockSchools);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<School | null>(null);
  const [currentTab, setCurrentTab] = useState('school');
  
  // Form vəziyyəti
  const initialFormState: SchoolFormData = {
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
  
  const [formData, setFormData] = useState<SchoolFormData>(initialFormState);
  
  // Axtarışı həndlə etmək
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  
  // Filter funksiyaları
  const handleRegionFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    setCurrentPage(1);
    // Region dəyişdikdə sektoru sıfırla
    if (e.target.value === '') {
      setSelectedSector('');
    }
  };
  
  const handleSectorFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSector(e.target.value);
    setCurrentPage(1);
  };
  
  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
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
        if (a[sortConfig.key as keyof School] < b[sortConfig.key as keyof School]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key as keyof School] > b[sortConfig.key as keyof School]) {
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
  const handlePageChange = (page: number) => {
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
  const handleAdminDialogOpen = (school: School) => {
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
    
    const newSchool: School = {
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
  const handleEditDialogOpen = (school: School) => {
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
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    
    if (!selectedSchool) return;
    
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
  const handleDeleteDialogOpen = (school: School) => {
    setSelectedSchool(school);
    setIsDeleteDialogOpen(true);
  };
  
  // Silməni təsdiqləmək
  const handleDeleteConfirm = () => {
    if (!selectedSchool) return;
    
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
        <SchoolHeader 
          userRole={user?.role}
          onAddClick={handleAddDialogOpen}
          onExportClick={handleExport}
          onImportClick={handleImport}
        />
        
        <Card>
          <CardContent className="p-6">
            {/* Axtarış və filtrlər */}
            <SchoolFilters 
              searchTerm={searchTerm}
              selectedRegion={selectedRegion}
              selectedSector={selectedSector}
              selectedStatus={selectedStatus}
              filteredSectors={filteredSectors}
              handleSearch={handleSearch}
              handleRegionFilter={handleRegionFilter}
              handleSectorFilter={handleSectorFilter}
              handleStatusFilter={handleStatusFilter}
              resetFilters={resetFilters}
            />
            
            {/* Cədvəl */}
            <SchoolTable 
              currentItems={currentItems}
              userRole={user?.role}
              searchTerm={searchTerm}
              sortConfig={sortConfig}
              handleSort={handleSort}
              handleEditDialogOpen={handleEditDialogOpen}
              handleDeleteDialogOpen={handleDeleteDialogOpen}
              handleAdminDialogOpen={handleAdminDialogOpen}
            />
            
            {/* Səhifələndirmə */}
            <SchoolPagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </CardContent>
        </Card>
        
        {/* Dialoglar */}
        <DeleteDialog 
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
        
        <AdminDialog 
          isOpen={isAdminDialogOpen}
          onClose={() => setIsAdminDialogOpen(false)}
          onUpdate={handleAdminUpdate}
          onResetPassword={handleResetPassword}
          selectedAdmin={selectedAdmin}
        />
        
        <AddDialog 
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleAddSubmit}
          formData={formData}
          handleFormChange={handleFormChange}
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          filteredSectors={filteredSectors}
        />
        
        <EditDialog 
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={handleEditSubmit}
          formData={formData}
          handleFormChange={handleFormChange}
          filteredSectors={filteredSectors}
        />
      </div>
    </SidebarLayout>
  );
};

export default Schools;
