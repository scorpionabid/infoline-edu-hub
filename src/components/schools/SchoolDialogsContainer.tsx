import React from 'react';
import AddSchoolDialog from './AddSchoolDialog';
import EditSchoolDialog from './EditSchoolDialog';
import DeleteSchoolDialog from './DeleteSchoolDialog';
import SchoolAdminDialog from './SchoolAdminDialog';
import ExistingUserSchoolAdminDialog from './ExistingUserSchoolAdminDialog';
import { School } from '@/types/school';
import { Region } from '@/types/school';
import { Sector } from '@/types/school';

interface SchoolDialogsContainerProps {
  // Add School Dialog
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  
  // Edit School Dialog
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  selectedSchool: School | null;
  
  // Delete School Dialog
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  
  // School Admin Dialog
  isAdminDialogOpen: boolean;
  setIsAdminDialogOpen: (open: boolean) => void;
  
  // Existing User Admin Dialog
  isExistingUserDialogOpen: boolean;
  setIsExistingUserDialogOpen: (open: boolean) => void;
  
  // Data and handlers
  regions: Region[];
  sectors: Sector[];
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
  onCreateSchool: (schoolData: Omit<School, 'id'>) => Promise<void>;
  onUpdateSchool: (schoolData: Partial<School>) => Promise<void>;
  onDeleteSchool: () => Promise<void>;
  onCreateAdmin: (adminData: any) => Promise<void>;
  onAssignExistingUser: () => void;
  
  // Loading states
  isSubmitting: boolean;
}

const SchoolDialogsContainer: React.FC<SchoolDialogsContainerProps> = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  isEditDialogOpen,
  setIsEditDialogOpen,
  selectedSchool,
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  isAdminDialogOpen,
  setIsAdminDialogOpen,
  isExistingUserDialogOpen,
  setIsExistingUserDialogOpen,
  regions,
  sectors,
  regionNames,
  sectorNames,
  onCreateSchool,
  onUpdateSchool,
  onDeleteSchool,
  onCreateAdmin,
  onAssignExistingUser,
  isSubmitting
}) => {

  return (
    <>
      {/* Add School Dialog */}
      <AddSchoolDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        regions={regions}
        sectors={sectors}
        regionNames={regionNames}
        sectorNames={sectorNames}
        onSubmit={onCreateSchool}
        isSubmitting={isSubmitting}
      />

      {/* Edit School Dialog */}
      {selectedSchool && (
        <EditSchoolDialog
          school={selectedSchool}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          regions={regions}
          sectors={sectors}
          regionNames={regionNames}
          sectorNames={sectorNames}
          onSubmit={onUpdateSchool}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Delete School Dialog */}
      <DeleteSchoolDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={onDeleteSchool}
        schoolName={selectedSchool?.name || ''}
        isDeleting={isSubmitting}
      />

      {/* School Admin Dialog */}
      <SchoolAdminDialog
        isOpen={isAdminDialogOpen}
        onClose={() => setIsAdminDialogOpen(false)}
        schoolId={selectedSchool?.id || ''}
        onSubmit={onCreateAdmin}
        isSubmitting={isSubmitting}
      />

      {/* Existing User Admin Dialog */}
      <ExistingUserSchoolAdminDialog
        isOpen={isExistingUserDialogOpen}
        onClose={() => setIsExistingUserDialogOpen(false)}
        schoolId={selectedSchool?.id || ''}
        onSuccess={onAssignExistingUser}
      />
    </>
  );
};

export default SchoolDialogsContainer;
