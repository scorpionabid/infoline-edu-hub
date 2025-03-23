
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import SchoolsContainer from '@/components/schools/SchoolsContainer';
import { Toaster } from '@/components/ui/toaster';

const Schools = () => {
  return (
    <SidebarLayout>
      <SchoolsContainer />
      <Toaster />
    </SidebarLayout>
  );
};

export default Schools;
