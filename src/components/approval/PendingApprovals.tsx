import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PendingApproval } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Eye, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PendingApprovalsProps {
  pendingApprovals: PendingApproval[];
  limit?: number;
  showViewAllButton?: boolean;
}

const PendingApprovals: React.FC<PendingApprovalsProps> = ({ 
  pendingApprovals, 
  limit = 5, 
  showViewAllButton = true 
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Əgər təsdiq gözləyən maddələr yoxdursa
  if (!pendingApprovals || pendingApprovals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>{t('noPendingApprovals')}</p>
      </div>
    );
  }
  
  // Təsdiq gözləyən maddələri limitə görə filtrlə
  const displayedApprovals = pendingApprovals.slice(0, limit);
  
  return (
    <div className="space-y-4">
      {displayedApprovals.map((item) => (
        <div 
          key={item.id} 
          className="flex justify-between items-center border-b pb-4 last:border-0 last:pb-0"
        >
          <div>
            <h4 className="font-medium">{item.schoolName}</h4>
            <div className="text-sm text-muted-foreground">{item.categoryName}</div>
            <div className="flex items-center text-xs mt-1 text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {item.submittedAt || item.date}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="ml-4"
            onClick={() => navigate(`/approvals/${item.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {t('review')}
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
          {t('viewAll')} ({pendingApprovals.length})
        </Button>
      )}
    </div>
  );
};

export default PendingApprovals;
