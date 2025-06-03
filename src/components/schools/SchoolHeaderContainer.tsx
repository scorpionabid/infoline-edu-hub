
import React from 'react';
import { SchoolHeader } from './SchoolHeader';

export const SchoolHeaderContainer: React.FC = () => {
  const handleAddClick = () => {
    console.log('Add new school');
  };

  return <SchoolHeader onAddClick={handleAddClick} />;
};

export default SchoolHeaderContainer;
