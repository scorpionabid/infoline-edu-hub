
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import SchoolsContainer from '@/components/schools/SchoolsContainer';
import { Toaster } from 'sonner';

const Schools = () => {
  return (
    <SidebarLayout>
      <SchoolsContainer />
      <Toaster position="top-right" closeButton richColors />
    </SidebarLayout>
  );
};

export default Schools;
