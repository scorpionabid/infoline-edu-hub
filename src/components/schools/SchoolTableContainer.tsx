
import React from 'react';
import { SchoolTable } from './SchoolTable';
import { School, Region, Sector } from '@/types/school';

interface SchoolTableContainerProps {
  schools: School[];
  isLoading: boolean;
  onEdit: (school: School) => void;
  onDelete: (school: School) => void;
  onViewFiles: (school: School) => void;
  onViewLinks: (school: School) => void;
  onAssignAdmin: (school: School) => void;
  regions: Region[];
  sectors: Sector[];
  regionNames: Record<string, string>;
  sectorNames: Record<string, string>;
}

export const SchoolTableContainer: React.FC<SchoolTableContainerProps> = (props) => {
  return <SchoolTable {...props} />;
};

export default SchoolTableContainer;
