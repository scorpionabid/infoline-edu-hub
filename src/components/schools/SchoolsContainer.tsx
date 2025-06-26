import React, { useState } from 'react';
import { School, Region, Sector } from '@/types/school';
import { SchoolTable } from './SchoolTable';
import { SchoolHeader } from './SchoolHeader';
import { SchoolFilters } from './SchoolFilters';
import { SchoolPagination } from './SchoolPagination';
import AddSchoolDialog from './AddSchoolDialog';
import EditSchoolDialog from './EditSchoolDialog';
import DeleteSchoolDialog from './DeleteSchoolDialog';
import AssignAdminDialog from './AssignAdminDialog';
import SchoolFilesDialog from './SchoolFilesDialog';
import SchoolLinksDialog from './SchoolLinksDialog';

interface SchoolsContainerProps {
  schools: School[];
  regions: Region[];
  sectors: Sector[];
  isLoading: boolean;
  onRefresh: () => void;
  onCreate: (school: Omit<School, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onEdit: (school: School) => Promise<void>;
  onDelete: (school: School) => Promise<void>;
  onAssignAdmin: (schoolId: string, userId: string) => Promise<void>;
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
  // Pagination props
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  // Filter props
  filters: {
    search: string;
    regionId: string;
    sectorId: string;
    status: string;
  };
  onFilterChange: (filters: any) => void;
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
  onPageChange,
  onPageSizeChange,
  filters,
  onFilterChange,
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

  const handleAdminAssign = async (userId: string) => {
    if (!selectedSchool) return;
    setIsSubmitting(true);
    try {
      await onAssignAdmin(selectedSchool.id, userId);
      setAdminDialogOpen(false);
      setSelectedSchool(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <SchoolHeader onAdd={handleAdd} onRefresh={onRefresh} />

      {/* Filters */}
      <SchoolFilters
        filters={filters}
        onFilterChange={onFilterChange}
        regions={regions}
        sectors={sectors}
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
      />

      {/* Pagination */}
      <SchoolPagination
        currentPage={currentPage}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

      {/* Dialogs */}
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
            onConfirm={handleDeleteConfirm}
            isDeleting={isSubmitting}
            school={selectedSchool}
          />

          <AssignAdminDialog
            isOpen={adminDialogOpen}
            onClose={() => {
              setAdminDialogOpen(false);
              setSelectedSchool(null);
            }}
            onAssign={handleAdminAssign}
            isAssigning={isSubmitting}
            school={selectedSchool}
          />

          <SchoolFilesDialog
            isOpen={filesDialogOpen}
            onClose={() => {
              setFilesDialogOpen(false);
              setSelectedSchool(null);
            }}
            school={selectedSchool}
          />

          <SchoolLinksDialog
            isOpen={linksDialogOpen}
            onClose={() => {
              setLinksDialogOpen(false);
              setSelectedSchool(null);
            }}
            school={selectedSchool}
          />
        </>
      )}
    </div>
  );
};

export default SchoolsContainer;