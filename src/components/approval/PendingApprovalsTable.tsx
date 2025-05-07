
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguageSafe } from '@/context/LanguageContext';
import { formatDate } from '@/utils/date';
import { Check, Eye } from 'lucide-react';
import ApprovalDialog from './ApprovalDialog';
import { PendingApproval } from '@/types/dashboard';

export type PendingApprovalItem = PendingApproval;

interface PendingApprovalsTableProps {
  items: PendingApprovalItem[];
  onRefresh: () => void;
}

const PendingApprovalsTable: React.FC<PendingApprovalsTableProps> = ({ 
  items, 
  onRefresh 
}) => {
  const { t } = useLanguageSafe();
  const [selectedItem, setSelectedItem] = useState<PendingApprovalItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleReview = (item: PendingApprovalItem) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  const handleApprovalCompleted = () => {
    setSelectedItem(null);
    onRefresh();
  };

  if (!items.length) {
    return (
      <div className="text-center p-4">
        <p className="text-muted-foreground">{t('noPendingApprovals')}</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('school')}</TableHead>
            <TableHead>{t('category')}</TableHead>
            <TableHead>{t('submittedAt')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead className="text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.schoolName}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{formatDate(item.submittedDate)}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                  {t('pending')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReview(item)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('review')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedItem && (
        <ApprovalDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          schoolId={selectedItem.schoolId}
          schoolName={selectedItem.schoolName}
          categoryId={selectedItem.categoryId}
          categoryName={selectedItem.category}
          onComplete={handleApprovalCompleted}
        />
      )}
    </>
  );
};

export default PendingApprovalsTable;
