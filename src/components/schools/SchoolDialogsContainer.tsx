import React from 'react';
import { School, Region, Sector } from '@/types/supabase';
import AddSchoolDialog from './AddSchoolDialog';
import EditSchoolDialog from './EditSchoolDialog';
import DeleteSchoolDialog from './DeleteSchoolDialog';
import SchoolAdminDialog from './SchoolAdminDialog';
import SchoolLinksDialog from './school-links/SchoolLinksDialog';
import { SchoolFilesDialog } from './school-files/SchoolFilesDialog';
import { User } from '@/types/auth';

interface SchoolDialogsContainerProps {
  // Dialog state-ləri
  isAddDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isAdminDialogOpen: boolean;
  isLinkDialogOpen: boolean;
  isFileDialogOpen: boolean;
  
  // Seçilmiş məktəb
  selectedSchool: School | null;
  
  // Dialog qapatma funksiyaları
  closeAddDialog: () => void;
  closeEditDialog: () => void;
  closeDeleteDialog: () => void;
  closeAdminDialog: () => void;
  closeLinkDialog: () => void;
  closeFilesDialog: () => void;
  
  // Form submit funksiyaları
  onCreateSchool: (data: Omit<School, 'id'>) => Promise<void>;
  onEditSchool: (school: School) => Promise<void>;
  onDeleteSchool: (school: School) => Promise<void>;
  onAssignAdmin: (schoolId: string, userId: string) => Promise<void>;
  
  // Digər data
  regions: Region[];
  sectors: Sector[];
  isSubmitting: boolean;
  user: User | null;
}

const SchoolDialogsContainer: React.FC<SchoolDialogsContainerProps> = ({
  // Dialog state-ləri
  isAddDialogOpen,
  isEditDialogOpen,
  isDeleteDialogOpen,
  isAdminDialogOpen,
  isLinkDialogOpen,
  isFileDialogOpen,
  
  // Seçilmiş məktəb
  selectedSchool,
  
  // Dialog qapatma funksiyaları
  closeAddDialog,
  closeEditDialog,
  closeDeleteDialog,
  closeAdminDialog,
  closeLinkDialog,
  closeFilesDialog,
  
  // Form submit funksiyaları
  onCreateSchool,
  onEditSchool,
  onDeleteSchool,
  onAssignAdmin,
  
  // Digər data
  regions,
  sectors,
  isSubmitting,
  user
}) => {
  return (
    <>
      {/* Add School Dialog */}
      {isAddDialogOpen && (
        <AddSchoolDialog
          isOpen={isAddDialogOpen}
          onClose={closeAddDialog}
          regions={regions}
          sectors={sectors}
          onSubmit={onCreateSchool}
          isSubmitting={isSubmitting}
        />
      )}
      
      {/* Edit School Dialog */}
      {isEditDialogOpen && selectedSchool && (
        <EditSchoolDialog
          isOpen={isEditDialogOpen}
          onClose={closeEditDialog}
          school={selectedSchool}
          regions={regions}
          sectors={sectors}
          onSubmit={onEditSchool}
          isSubmitting={isSubmitting}
        />
      )}
      
      {/* Delete School Dialog */}
      {isDeleteDialogOpen && selectedSchool && (
        <DeleteSchoolDialog
          isOpen={isDeleteDialogOpen}
          onClose={closeDeleteDialog}
          school={selectedSchool}
          onConfirm={() => onDeleteSchool(selectedSchool)}
          isSubmitting={isSubmitting}
        />
      )}
      
      {/* Admin Assignment Dialog */}
      {isAdminDialogOpen && selectedSchool && (
        <SchoolAdminDialog
          isOpen={isAdminDialogOpen}
          onClose={closeAdminDialog}
          school={selectedSchool}
          onSubmit={onAssignAdmin}
          isSubmitting={isSubmitting}
        />
      )}
      
      {/* Links Management Dialog */}
      {isLinkDialogOpen && selectedSchool && (
        <SchoolLinksDialog
          isOpen={isLinkDialogOpen}
          onClose={closeLinkDialog}
          school={selectedSchool}
          links={[]}
          onDelete={async (linkId) => { console.log('Deleting link', linkId); }}
          onAdd={async (link) => { console.log('Adding link', link); }}
          isLoading={isSubmitting}
        />
      )}
      
      {/* Files Management Dialog */}
      {isFileDialogOpen && selectedSchool && (
        <SchoolFilesDialog
          isOpen={isFileDialogOpen}
          onClose={closeFilesDialog}
          school={selectedSchool}
          userRole={user?.role || 'viewer'}
        />
      )}
    </>
  );
};

export default SchoolDialogsContainer;
