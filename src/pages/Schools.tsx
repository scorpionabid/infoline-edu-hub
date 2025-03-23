
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import SchoolFilters from '@/components/schools/SchoolFilters';
import SchoolTable from '@/components/schools/SchoolTable';
import SchoolPagination from '@/components/schools/SchoolPagination';
import SchoolHeader from '@/components/schools/SchoolHeader';
import { DeleteDialog, EditDialog, AddDialog, AdminDialog } from '@/components/schools/SchoolDialogs';
import { mockSchools, mockSectors, mockRegions, getSchoolTypeLabel, getLanguageLabel, getSchoolInitial, School, SchoolFormData } from '@/data/schoolsData';

const Schools = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [schools, setSchools] = useState<School[]>(mockSchools);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<School | null>(null);
  const [currentTab, setCurrentTab] = useState('school');
  
  // Initialize formData state
  const initialFormState: SchoolFormData = getSchoolInitial();
  const [formData, setFormData] = useState<SchoolFormData>(initialFormState);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleRegionFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRegion(e.target.value);
    setCurrentPage(1);
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

  const filteredSectors = selectedRegion 
    ? mockSectors.filter(sector => sector.regionId === selectedRegion) 
    : mockSectors;

  const filteredSchools = schools.filter(school => {
    const searchMatch = 
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.principalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.phone.toLowerCase().includes(searchTerm.toLowerCase());

    const regionMatch = selectedRegion ? school.regionId === selectedRegion : true;
    
    const sectorMatch = selectedSector ? school.sectorId === selectedSector : true;
    
    const statusMatch = selectedStatus ? school.status === selectedStatus : true;
    
    return searchMatch && regionMatch && sectorMatch && statusMatch;
  });

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedSchools.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(sortedSchools.length / itemsPerPage);

  const handleAddDialogOpen = () => {
    setFormData(initialFormState);
    setCurrentTab('school');
    setIsAddDialogOpen(true);
  };

  const handleAdminDialogOpen = (school: School) => {
    setSelectedAdmin(school);
    setIsAdminDialogOpen(true);
  };

  const handleAdminUpdate = () => {
    toast.success('Admin məlumatları yeniləndi');
    setIsAdminDialogOpen(false);
  };

  const handleResetPassword = (newPassword: string) => {
    if (!selectedAdmin) return;
    
    const adminEmail = selectedAdmin.adminEmail;
    
    toast.success(`${adminEmail} üçün yeni parol təyin edildi`, {
      description: "Admin növbəti daxil olduqda bu parolu istifadə edəcək."
    });
    
    setIsAdminDialogOpen(false);
  };

  const handleAddSubmit = () => {
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

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'regionId') {
      setFormData(prev => ({ ...prev, sectorId: '' }));
    }
  };

  const handleEditSubmit = () => {
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

  const handleDeleteDialogOpen = (school: School) => {
    setSelectedSchool(school);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedSchool) return;
    
    const updatedSchools = schools.filter(school => school.id !== selectedSchool.id);
    setSchools(updatedSchools);
    setIsDeleteDialogOpen(false);
    toast.success('Məktəb uğurla silindi');
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedSector('');
    setSelectedStatus('');
    setCurrentPage(1);
  };

  const handleExport = () => {
    toast.success('Excel faylı yüklənir...');
  };

  const handleImport = () => {
    toast.success('Excel faylından məlumatlar yükləndi');
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
            
            {totalPages > 1 && (
              <SchoolPagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
            )}
          </CardContent>
        </Card>
        
        <DeleteDialog 
          isOpen={isDeleteDialogOpen} 
          onClose={() => setIsDeleteDialogOpen(false)} 
          onConfirm={handleDeleteConfirm} 
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
        
        <AdminDialog 
          isOpen={isAdminDialogOpen} 
          onClose={() => setIsAdminDialogOpen(false)} 
          onUpdate={handleAdminUpdate} 
          onResetPassword={handleResetPassword} 
          selectedAdmin={selectedAdmin} 
        />
      </div>
    </SidebarLayout>
  );
};

export default Schools;
