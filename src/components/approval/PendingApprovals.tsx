
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PendingApproval } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { formatDate } from '@/utils/formatters';
import { Eye } from 'lucide-react';

interface PendingApprovalsProps {
  pendingApprovals: PendingApproval[];
  limit?: number;
  showViewAllButton?: boolean;
}

const PendingApprovals: React.FC<PendingApprovalsProps> = ({
  pendingApprovals,
  limit = 5,
  showViewAllButton = false
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const displayItems = pendingApprovals.slice(0, limit);
  
  if (displayItems.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {t('noPendingApprovals')}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {displayItems.map((item) => (
        <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-0">
          <div>
            <h4 className="font-medium">{item.schoolName}</h4>
            <div className="text-sm text-muted-foreground">{item.categoryName}</div>
            <div className="text-xs mt-1 text-muted-foreground">
              {formatDate(item.date)}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-4"
            onClick={() => navigate(`/approvals/${item.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            {t('view')}
          </Button>
        </div>
      ))}
      
      {showViewAllButton && pendingApprovals.length > limit && (
        <Button 
          variant="outline" 
          className="w-full" 
          size="sm"
          onClick={() => navigate('/approvals')}
        >
          {t('viewAll')} ({pendingApprovals.length - limit} {t('more')})
        </Button>
      )}
    </div>
  );
};

export default PendingApprovals;
