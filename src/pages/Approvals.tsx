
import React from 'react';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { Approval } from '@/components/approval/Approval';

const ApprovalsPage: React.FC = () => {
  return (
    <SidebarLayout>
      <Approval />
    </SidebarLayout>
  );
};

export default ApprovalsPage;
