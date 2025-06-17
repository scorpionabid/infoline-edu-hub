
import React, { useState } from 'react';
import { useLanguageSafe } from '@/contexts/LanguageContext';
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
  sectorNames
}) => {
  const { t } = useLanguageSafe();
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
          <h1 className="text-2xl font-bold">{t('schools')}</h1>
          <p className="text-muted-foreground">{t('schoolsDescription')}</p>
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
