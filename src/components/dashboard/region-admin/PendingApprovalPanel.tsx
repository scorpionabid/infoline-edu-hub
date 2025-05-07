
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import PendingApprovalsTable from '@/components/approval/PendingApprovalsTable';
import { PendingApproval } from '@/types/dashboard';

interface PendingApprovalPanelProps {
  pendingApprovals: PendingApproval[];
}

const PendingApprovalPanel: React.FC<PendingApprovalPanelProps> = ({ 
  pendingApprovals
}) => {
  const { t } = useLanguage();

  return (
    <Card className="col-span-12 lg:col-span-8">
      <CardHeader>
        <CardTitle>{t('pendingApprovals')}</CardTitle>
      </CardHeader>
      <CardContent>
        <PendingApprovalsTable pendingApprovals={pendingApprovals} />
      </CardContent>
    </Card>
  );
};

export default PendingApprovalPanel;
