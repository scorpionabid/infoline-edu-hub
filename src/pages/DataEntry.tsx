
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DataEntryContainer from '@/components/dataEntry/DataEntryContainer';
import { Toaster } from '@/components/ui/toaster';

const DataEntry = () => {
  return (
    <SidebarLayout>
      <DataEntryContainer />
    </SidebarLayout>
  );
};

export default DataEntry;
