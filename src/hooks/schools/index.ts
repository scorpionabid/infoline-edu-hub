import { useState } from 'react';

export const useSchoolDialogHandlers = (handlers: {
  setIsFilesDialogOpen: (open: boolean) => void;
  setSelectedSchoolForFiles: (school: any) => void;
  setIsLinksDialogOpen: (open: boolean) => void;
  setSelectedSchoolForLinks: (school: any) => void;
  setIsAdminDialogOpen: (open: boolean) => void;
  setSchoolForAdmin: (school: any) => void;
  setEditingSchool: (school: any) => void;
}) => {
  const handleDeleteSchool = (school: any) => {
    console.log('Delete school:', school);
  };

  const handleViewFiles = (school: any) => {
    handlers.setSelectedSchoolForFiles(school);
    handlers.setIsFilesDialogOpen(true);
  };

  const handleViewLinks = (school: any) => {
    handlers.setSelectedSchoolForLinks(school);
    handlers.setIsLinksDialogOpen(true);
  };

  const handleAssignAdmin = (school: any) => {
    handlers.setSchoolForAdmin(school);
    handlers.setIsAdminDialogOpen(true);
  };

  const handleAddClick = () => {
    handlers.setEditingSchool(null);
  };

  return {
    handleDeleteSchool,
    handleViewFiles,
    handleViewLinks,
    handleAssignAdmin,
    handleAddClick
  };
};

export * from './useSchools';
