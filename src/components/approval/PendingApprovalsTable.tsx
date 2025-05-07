
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PendingApproval } from '@/types/dashboard';
import { Table, TableHead, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { formatDate } from '@/utils/formatters';

interface PendingApprovalsTableProps {
  pendingApprovals: PendingApproval[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
}

const PendingApprovalsTable: React.FC<PendingApprovalsTableProps> = ({
  pendingApprovals,
  onApprove,
  onReject,
  showActions = true
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleView = (approval: PendingApproval) => {
    navigate(`/approvals/${approval.id}`);
  };
  
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('school')}</TableHead>
            <TableHead>{t('category')}</TableHead>
            <TableHead className="hidden md:table-cell">{t('submittedDate')}</TableHead>
            {showActions && <TableHead className="text-right">{t('actions')}</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingApprovals.length > 0 ? (
            pendingApprovals.map(approval => (
              <TableRow key={approval.id}>
                <TableCell>{approval.schoolName}</TableCell>
                <TableCell>{approval.categoryName}</TableCell>
                <TableCell className="hidden md:table-cell">{formatDate(approval.date)}</TableCell>
                {showActions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleView(approval)}
                      >
                        {t('view')}
                      </Button>
                      
                      {onApprove && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => onApprove(approval.id)}
                        >
                          {t('approve')}
                        </Button>
                      )}
                      
                      {onReject && (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => onReject(approval.id)}
                        >
                          {t('reject')}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={showActions ? 4 : 3} 
                className="text-center py-6 text-muted-foreground"
              >
                {t('noPendingApprovals')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingApprovalsTable;
export type { PendingApproval };
