
import React, { useState } from 'react';
import { useSmartTranslation } from '@/hooks/translation/useSmartTranslation';
import { useAuthStore, selectUser } from '@/hooks/auth/useAuthStore';
import { useSchoolsStore } from '@/hooks/schools/useSchoolsStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SchoolTable } from './SchoolTable';
import { EditSchoolDialog } from './EditSchoolDialog';
import { SchoolFilesDialog } from './SchoolFilesDialog';
import { SchoolLinksDialog } from './SchoolLinksDialog';
import { AssignAdminDialog } from './AssignAdminDialog';
import { DeleteSchoolDialog } from './DeleteSchoolDialog';
import { Loader2 } from 'lucide-react';
import { School, Region, Sector } from '@/types/school';

interface SchoolsContainerProps {
  schools: School[];
  regions: Region[];
  sectors: Sector[];
  isLoading: boolean;
  onRefresh: () => void;
  onCreate: (schoolData: Omit<School, 'id'>) => Promise<void>;
  onEdit: (schoolData: School) => Promise<void>;
  onDelete: (school: School) => Promise<void>;
  onAssignAdmin: (schoolId: string, userId: string) => Promise<void>;
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
  // Pagination props
  currentPage?: number;
  pageSize?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  // Filter props
  filters?: {
    search: string;
    regionId: string;
    sectorId: string;
    status: string;
  };
  onFilterChange?: (filters: any) => void;
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
  // Pagination props
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
  // Filter props
  filters,
  onFilterChange
}) => {
  const { tSafe: t, tContext } = useSmartTranslation();
  const user = useAuthStore(selectUser);
  
  // Dialog states
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [schoolForFiles, setSchoolForFiles] = useState<School | null>(null);
  const [schoolForLinks, setSchoolForLinks] = useState<School | null>(null);
  const [schoolForAdmin, setSchoolForAdmin] = useState<School | null>(null);
  const [schoolForDelete, setSchoolForDelete] = useState<School | null>(null);

  const handleEdit = (school: School) => {
    setEditingSchool(school);
  };

  const handleDelete = (school: School) => {
    setSchoolForDelete(school);
  };

  const handleViewFiles = (school: School) => {
    setSchoolForFiles(school);
  };

  const handleViewLinks = (school: School) => {
    setSchoolForLinks(school);
  };

  const handleAssignAdmin = (school: School) => {
    setSchoolForAdmin(school);
  };

  const handleEditSubmit = async (schoolData: School) => {
    try {
      await onEdit(schoolData);
      setEditingSchool(null);
      onRefresh();
      toast.success(t('schoolUpdated'));
    } catch (error: any) {
      console.error('Error updating school:', error);
      toast.error(t('schoolUpdateFailed'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!schoolForDelete) return;
    
    try {
      await onDelete(schoolForDelete);
      setSchoolForDelete(null);
      onRefresh();
      toast.success(t('schoolDeleted'));
    } catch (error: any) {
      console.error('Error deleting school:', error);
      toast.error(t('schoolDeletionFailed'));
    }
  };

  const handleAdminAssign = async (userId: string) => {
    if (!schoolForAdmin) return;
    
    try {
      await onAssignAdmin(schoolForAdmin.id, userId);
      setSchoolForAdmin(null);
      onRefresh();
      toast.success(t('adminAssigned'));
    } catch (error: any) {
      console.error('Error assigning admin:', error);
      toast.error(t('adminAssignmentFailed'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">{t('loading')}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          {/* h1 və p elementləri silindi */}
        </div>
        <div className="flex items-center space-x-2">
          {/* Filter elementləri */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder={t('search')}
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters?.search || ''}
              onChange={(e) => onFilterChange?.({ ...filters, search: e.target.value })}
            />
            <select
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters?.regionId || ''}
              onChange={(e) => onFilterChange?.({ ...filters, regionId: e.target.value })}
            >
              <option value="">{t('allRegions')}</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters?.sectorId || ''}
              onChange={(e) => onFilterChange?.({ ...filters, sectorId: e.target.value })}
            >
              <option value="">{t('allSectors')}</option>
              {sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.name}
                </option>
              ))}
            </select>
            <select
              className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={filters?.status || ''}
              onChange={(e) => onFilterChange?.({ ...filters, status: e.target.value })}
            >
              <option value="">{t('allStatuses')}</option>
              <option value="active">{t('active')}</option>
              <option value="inactive">{t('inactive')}</option>
            </select>
          </div>
        </div>
      </div>

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
      {totalCount !== undefined && pageSize !== undefined && currentPage !== undefined && onPageChange && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {tContext('common.showingEntries', { 
              start: ((currentPage - 1) * pageSize) + 1, 
              end: Math.min(currentPage * pageSize, totalCount), 
              total: totalCount 
            })}
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="px-3 py-2 border rounded-md text-sm disabled:opacity-50"
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              {t('previous')}
            </button>
            <span className="px-3 py-2">{currentPage}</span>
            <button
              className="px-3 py-2 border rounded-md text-sm disabled:opacity-50"
              disabled={currentPage * pageSize >= totalCount}
              onClick={() => onPageChange(currentPage + 1)}
            >
              {t('next')}
            </button>
            <select
              className="px-3 py-2 border rounded-md text-sm"
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>
      )}

      {/* Edit School Dialog */}
      {editingSchool && (
        <EditSchoolDialog
          isOpen={!!editingSchool}
          onClose={() => setEditingSchool(null)}
          school={editingSchool}
          onSuccess={() => {
            setEditingSchool(null);
            onRefresh();
          }}
        />
      )}

      {/* School Files Dialog */}
      <SchoolFilesDialog
        open={!!schoolForFiles}
        onOpenChange={(open) => !open && setSchoolForFiles(null)}
        schoolId={schoolForFiles?.id || ''}
      />

      {/* School Links Dialog */}
      <SchoolLinksDialog
        open={!!schoolForLinks}
        onOpenChange={(open) => !open && setSchoolForLinks(null)}
        schoolId={schoolForLinks?.id || ''}
      />

      {/* Assign Admin Dialog */}
      {schoolForAdmin && (
        <AssignAdminDialog
          isOpen={!!schoolForAdmin}
          onClose={() => setSchoolForAdmin(null)}
          onAssign={handleAdminAssign}
          entityType="school"
          entityName={schoolForAdmin.name}
        />
      )}

      {/* Delete School Dialog */}
      {schoolForDelete && (
        <DeleteSchoolDialog
          isOpen={!!schoolForDelete}
          onClose={() => setSchoolForDelete(null)}
          school={schoolForDelete}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default SchoolsContainer;
