
import React from 'react';
import { CardHeader, CardContent, CardTitle } from '@/components/ui/card';

interface PendingApproval {
  id: string;
  schoolName: string;
  categoryName: string;
  submittedAt: string;
}

interface PendingApprovalPanelProps {
  approvals: PendingApproval[];
}

const PendingApprovalPanel: React.FC<PendingApprovalPanelProps> = ({ approvals }) => {
  return (
    <div>
      <CardHeader>
        <CardTitle>Təsdiq Gözləyənlər</CardTitle>
      </CardHeader>
      <CardContent>
        {approvals.length === 0 ? (
          <p className="text-center text-muted-foreground">Təsdiq gözləyən məlumat yoxdur</p>
        ) : (
          <div className="space-y-4">
            {approvals.map(approval => (
              <div key={approval.id} className="border-b pb-2 last:border-0">
                <p className="font-medium">{approval.schoolName}</p>
                <p className="text-sm text-muted-foreground">{approval.categoryName}</p>
                <p className="text-xs text-muted-foreground">{approval.submittedAt}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </div>
  );
};

export default PendingApprovalPanel;
