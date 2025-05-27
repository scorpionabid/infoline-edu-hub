import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PendingApproval } from '@/types/dashboard';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from '@/components/ui/button';
import { Eye, Check, XCircle } from 'lucide-react';

interface PendingApprovalsTableProps {
  approvals: PendingApproval[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onView: (id: string) => void;
}

const PendingApprovalsTable: React.FC<PendingApprovalsTableProps> = ({
  approvals,
  onApprove,
  onReject,
  onView
}) => {
  const { t } = useLanguage();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('schoolName')}</TableHead>
          <TableHead>{t('categoryName')}</TableHead>
          <TableHead>{t('submittedAt')}</TableHead>
          <TableHead className="text-right">{t('actions')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {approvals.map((approval) => (
          <TableRow key={approval.id}>
            <TableCell>{approval.schoolName}</TableCell>
            <TableCell>{approval.categoryName}</TableCell>
            <TableCell>{approval.submittedAt || approval.date}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => onView(approval.id)}>
                <Eye className="h-4 w-4 mr-2" />
                {t('view')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onApprove(approval.id)}>
                <Check className="h-4 w-4 mr-2" />
                {t('approve')}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onReject(approval.id)}>
                <XCircle className="h-4 w-4 mr-2" />
                {t('reject')}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PendingApprovalsTable;
