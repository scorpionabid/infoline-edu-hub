import React, { useState } from 'react';
import { School } from '@/types/school';
import { Region } from '@/types/region';
import { Sector } from '@/types/sector';
import { FilterOptions, SortOptions } from '@/hooks/common/useEnhancedPagination';
import { SchoolTable } from './SchoolTable';
import { SchoolHeader } from './SchoolHeader';
import { SchoolFilters } from './SchoolFilters';
import SchoolPagination from './SchoolPagination';
import AddSchoolDialog from './AddSchoolDialog';
import { EditSchoolDialog } from './EditSchoolDialog';
import { DeleteSchoolDialog } from './DeleteSchoolDialog';
import { SchoolFilesDialog } from './SchoolFilesDialog';
import { SchoolLinksDialog } from './SchoolLinksDialog';
import { ExistingUserSchoolAdminDialog } from './SchoolAdminDialogs';

interface SchoolsContainerProps {
  schools: School[];
  regions: Region[];
  sectors: Sector[];
  isLoading: boolean;
  onRefresh: () => void;
  onCreate: (school: Omit<School, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onEdit: (school: School) => Promise<void>;
  onDelete: (school: School) => Promise<void>;
  onAssignAdmin: (schoolId: string, adminData: any) => Promise<void>;
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
  // Pagination props
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  // Filter props
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  // Sort props
  sortOptions: SortOptions;
  onSortChange: (sort: SortOptions) => void;
}

const SchoolsContainer: React.FC<SchoolsContainerProps> = ({
  schools,
  regions,
  sectors,
  isLoading,
  onRefresh,
  onCreate,
  onEdit,
  onDelete,
  onAssignAdmin,
  regionNames,
  sectorNames,
  currentPage,
  pageSize,
  totalCount,
  totalPages,
  onPageChange,
  onPageSizeChange,
  filters,
  onFilterChange,
  sortOptions,
  onSortChange,
}) => {
  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [filesDialogOpen, setFilesDialogOpen] = useState(false);
  const [linksDialogOpen, setLinksDialogOpen] = useState(false);
  
  // Selected school for operations
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  
  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handlers
  const handleAdd = () => {
    setAddDialogOpen(true);
  };

  const handleEdit = (school: School) => {
    setSelectedSchool(school);
    setEditDialogOpen(true);
  };

  const handleDelete = (school: School) => {
    setSelectedSchool(school);
    setDeleteDialogOpen(true);
  };

  const handleAssignAdmin = (school: School) => {
    setSelectedSchool(school);
    setAdminDialogOpen(true);
  };

  const handleViewFiles = (school: School) => {
    setSelectedSchool(school);
    setFilesDialogOpen(true);
  };

  const handleViewLinks = (school: School) => {
    setSelectedSchool(school);
    setLinksDialogOpen(true);
  };

  // Submit handlers
  const handleCreateSubmit = async (schoolData: Omit<School, 'id' | 'created_at' | 'updated_at'>) => {
    setIsSubmitting(true);
    try {
      await onCreate(schoolData);
      setAddDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (schoolData: School) => {
    if (!selectedSchool) return;
    setIsSubmitting(true);
    try {
      await onEdit(schoolData);
      setEditDialogOpen(false);
      setSelectedSchool(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSchool) return;
    setIsSubmitting(true);
    try {
      await onDelete(selectedSchool);
      setDeleteDialogOpen(false);
      setSelectedSchool(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminAssignSuccess = async () => {
    console.log('🔄 SchoolsContainer - Admin assignment successful, refreshing data...');
    setAdminDialogOpen(false);
    setSelectedSchool(null);
    await onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SchoolHeader onAddClick={handleAdd} />

      {/* Filters */}
      <SchoolFilters
        filters={filters}
        onFilterChange={onFilterChange}
        regions={regions}
        sectors={sectors}
        loadingRegions={false}
        loadingSectors={false}
      />

      {/* Table */}
      <SchoolTable
        schools={schools}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewFiles={handleViewFiles}
        onViewLinks={handleViewLinks}
        onAssignAdmin={handleAssignAdmin}
        regionNames={regionNames}
        sectorNames={sectorNames}
        sortOptions={sortOptions}
        onSortChange={onSortChange}
      />

      {/* Pagination */}
      <SchoolPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* Dialogs */}
      <SchoolFilesDialog
        open={filesDialogOpen}
        onOpenChange={(open) => setFilesDialogOpen(open)}
        schoolId={selectedSchool?.id || ''}
      />

      <AddSchoolDialog
        isOpen={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleCreateSubmit}
        isSubmitting={isSubmitting}
        regions={regions}
        sectors={sectors}
        regionNames={regionNames}
        sectorNames={sectorNames}
      />

      {selectedSchool && (
        <>
          <EditSchoolDialog
            isOpen={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setSelectedSchool(null);
            }}
            onSubmit={handleEditSubmit}
            isSubmitting={isSubmitting}
            school={selectedSchool}
            regions={regions}
            sectors={sectors}
            regionNames={regionNames}
            sectorNames={sectorNames}
          />

          <DeleteSchoolDialog
            isOpen={deleteDialogOpen}
            onClose={() => {
              setDeleteDialogOpen(false);
              setSelectedSchool(null);
            }}
            onConfirm={() => selectedSchool && handleDelete(selectedSchool)}
            school={selectedSchool!}
          />

          <ExistingUserSchoolAdminDialog
            isOpen={adminDialogOpen}
            onClose={() => {
              setAdminDialogOpen(false);
              setSelectedSchool(null);
            }}
            schoolId={selectedSchool?.id || ''}
            schoolName={selectedSchool?.name || ''}
            onSuccess={handleAdminAssignSuccess}
          />

          <SchoolFilesDialog
            open={filesDialogOpen}
            onOpenChange={(open) => {
              setFilesDialogOpen(open);
              if (!open) setSelectedSchool(null);
            }}
            schoolId={selectedSchool?.id || ''}
          />

          <SchoolLinksDialog
            open={linksDialogOpen}
            onOpenChange={(open) => {
              setLinksDialogOpen(open);
              if (!open) setSelectedSchool(null);
            }}
            schoolId={selectedSchool?.id || ''}
          />
        </>
      )}
    </div>
  );
};

export default SchoolsContainer;