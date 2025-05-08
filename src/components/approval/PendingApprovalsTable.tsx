
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PendingApproval } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Eye, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';

interface PendingApprovalsTableProps {
  pendingApprovals: PendingApproval[];
  onReview?: (approvalId: string) => void;
}

const PendingApprovalsTable: React.FC<PendingApprovalsTableProps> = ({ 
  pendingApprovals,
  onReview
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const handleReview = (id: string) => {
    if (onReview) {
      onReview(id);
    } else {
      navigate(`/approvals/${id}`);
    }
  };
  
  // Tarixi formatla
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd.MM.yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };
  
  // Əgər təsdiq gözləyən maddələr yoxdursa
  if (!pendingApprovals || pendingApprovals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('noPendingApprovals')}</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
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
          {pendingApprovals.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.schoolName}</TableCell>
              <TableCell>{item.categoryName}</TableCell>
              <TableCell>{formatDate(item.submittedAt || item.date || '')}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100">
                  {t('pending')}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleReview(item.id)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {t('review')}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PendingApprovalsTable;
