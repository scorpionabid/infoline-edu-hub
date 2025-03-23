
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import DataEntryContainer from '@/components/dataEntry/DataEntryContainer';
import { Toaster } from '@/components/ui/toaster';
import { Helmet } from 'react-helmet';

const DataEntry = () => {
  return (
    <>
      <Helmet>
        <title>Məlumat daxil etmə | InfoLine</title>
      </Helmet>
      <SidebarLayout>
        <DataEntryContainer />
        <Toaster />
      </SidebarLayout>
    </>
  );
};

export default DataEntry;
