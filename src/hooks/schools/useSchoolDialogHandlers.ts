
import { Dispatch, SetStateAction } from 'react';

interface UseSchoolDialogHandlersProps {
  setIsFilesDialogOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedSchoolForFiles: Dispatch<SetStateAction<any>>;
  setIsLinksDialogOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedSchoolForLinks: Dispatch<SetStateAction<any>>;
  setIsAdminDialogOpen: Dispatch<SetStateAction<boolean>>;
  setSchoolForAdmin: Dispatch<SetStateAction<any>>;
  setEditingSchool: Dispatch<SetStateAction<any>>;
}

export const useSchoolDialogHandlers = ({
  setIsFilesDialogOpen,
  setSelectedSchoolForFiles,
  setIsLinksDialogOpen,
  setSelectedSchoolForLinks,
  setIsAdminDialogOpen,
  setSchoolForAdmin,
  // setEditingSchool
}: UseSchoolDialogHandlersProps) => {
  
  const handleDeleteSchool = (school: any) => {
    console.log('Delete school:', school);
  };

  const handleViewFiles = (school: any) => {
    setSelectedSchoolForFiles(school);
    setIsFilesDialogOpen(true);
  };

  const handleViewLinks = (school: any) => {
    setSelectedSchoolForLinks(school);
    setIsLinksDialogOpen(true);
  };

  const handleAssignAdmin = (school: any) => {
    setSchoolForAdmin(school);
    setIsAdminDialogOpen(true);
  };

  const handleAddClick = () => {
    setEditingSchool(null);
  };

  return {
    handleDeleteSchool,
    handleViewFiles,
    handleViewLinks,
    handleAssignAdmin,
    // handleAddClick
  };
};
