import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import PendingApprovalsTable, { PendingApprovalItem } from '@/components/approval/PendingApprovalsTable';

interface PendingApprovalPanelProps {
  pendingApprovals: PendingApprovalItem[];
  onRefresh: () => void;
}

const PendingApprovalPanel: React.FC<PendingApprovalPanelProps> = ({
  pendingApprovals,
  onRefresh
}) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pendingApprovals')}</CardTitle>
      </CardHeader>
      <CardContent>
        <PendingApprovalsTable 
          items={pendingApprovals} 
          onRefresh={onRefresh} 
        />
      </CardContent>
    </Card>
  );
};

export default PendingApprovalPanel;
