
import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { toast } from 'sonner';
import { useSectorsStore } from '@/hooks/useSectorsStore';
import { useSectorDialogs } from '@/hooks/useSectorDialogs';
import SectorActionDialog from '@/components/sectors/SectorActionDialog';
import SectorHeader from '@/components/sectors/SectorHeader';
import SectorFilters from '@/components/sectors/SectorFilters';
import SectorTable from '@/components/sectors/SectorTable';
import SectorPagination from '@/components/sectors/SectorPagination';

const Sectors: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  
  // Zustand store
  const {
    filteredSectors,
    loading,
    error,
    searchTerm,
    selectedStatus,
    currentPage,
    pageSize,
    totalPages,
    isOperationComplete,
    fetchSectors,
    handleSearch,
    handleStatusFilter,
    handleSort,
    resetFilters,
    handlePageChange,
    setIsOperationComplete
  } = useSectorsStore();

  // Dialoglara aid state'lər və hadisə məkanizmi
  const {
    showCreateDialog,
    showEditDialog,
    showDeleteDialog,
    selectedSector,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs
  } = useSectorDialogs();

  // Component ilk dəfə açıldığında sektorları yüklə
  useEffect(() => {
    const loadSectors = async () => {
      try {
        // Region admini üçün, öz regionundan olan sektorları göstər
        if (user?.role === 'regionadmin' && user?.regionId) {
          await fetchSectors(user.regionId);
        } else {
          // SuperAdmin üçün bütün sektorları göstər
          await fetchSectors();
        }
      } catch (err) {
        console.error("Sektorların yüklənməsində xəta:", err);
      }
    };
    
    loadSectors();
    
    // Digər komponentlərdən gələn state-i təmizlə
    return () => {
      resetFilters();
    };
  }, [user?.regionId, user?.role, fetchSectors, resetFilters]);

  // Əməliyyat status dəyişikliyi
  useEffect(() => {
    if (isOperationComplete) {
      closeDialogs();
      setIsOperationComplete(false);
    }
  }, [isOperationComplete, setIsOperationComplete]);

  // Excel export
  const handleExport = () => {
    toast.info(t('exportStarted'), {
      description: t('preparingExport')
    });
    
    // Əslində burada Excel export kodu olacaq
    setTimeout(() => {
      toast.success(t('exportComplete'), {
        description: t('exportSuccess')
      });
    }, 1500);
  };

  // Import
  const handleImport = () => {
    toast.info(t('featureInDevelopment'), {
      description: t('comingSoon')
    });
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <h1 className="text-2xl font-bold text-red-500">{t('errorOccurred')}</h1>
        <p>{error.message}</p>
        <button onClick={() => fetchSectors()}>
          {t('tryAgain')}
        </button>
      </div>
    );
  }

  // Səhifələmə üçün cari sektorları hesablama
  const paginatedSectors = filteredSectors.slice(
    (currentPage - 1) * pageSize, 
    currentPage * pageSize
  );

  return (
    <div className="container py-4">
      {/* Başlıq və əsas əməliyyat düymələri */}
      <SectorHeader 
        onCreateClick={openCreateDialog} 
        onImport={handleImport} 
        onExport={handleExport}
      />

      <div className="bg-background rounded-lg shadow p-4">
        {/* Axtarış və filtrləmə bölümü */}
        <SectorFilters 
          searchTerm={searchTerm} 
          selectedStatus={selectedStatus} 
          onSearch={handleSearch} 
          onStatusFilter={handleStatusFilter}
        />

        {/* Sektorlar cədvəli */}
        <SectorTable 
          loading={loading}
          sectors={paginatedSectors}
          currentPage={currentPage}
          pageSize={pageSize}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onSort={handleSort}
          searchTerm={searchTerm}
          selectedStatus={selectedStatus}
        />
        
        {/* Səhifələmə komponenti */}
        <SectorPagination 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredSectors.length}
          pageSize={pageSize}
          onPageChange={handlePageChange}
        />
      </div>
      
      {/* Əməliyyat dialogları */}
      <SectorActionDialog
        isOpen={showCreateDialog}
        onClose={closeDialogs}
        action="create"
        regionId={user?.regionId}
        onSuccess={closeDialogs}
      />
      
      <SectorActionDialog
        isOpen={showEditDialog}
        onClose={closeDialogs}
        action="edit"
        sector={selectedSector}
        onSuccess={closeDialogs}
      />
      
      <SectorActionDialog
        isOpen={showDeleteDialog}
        onClose={closeDialogs}
        action="delete"
        sector={selectedSector}
        onSuccess={closeDialogs}
      />
    </div>
  );
};

export default Sectors;
