
import { useSchoolsData } from './useSchoolsData';
import { useSchoolsStore } from './useSchoolsStore';
import { useSchoolDialogHandlers } from './useSchoolDialogHandlers';
import { useImportExport } from './useImportExport';

export { 
  useSchoolsData,
  useSchoolsStore,
  useSchoolDialogHandlers,
  useImportExport
};

// Geriyə uyğunluq üçün alias ixrac
export const useSchools = useSchoolsData;
