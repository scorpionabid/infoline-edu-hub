
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PendingApproval } from '@/types/dashboard'; 
import { Button } from '@/components/ui/button';
import { Clock, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguageSafe } from '@/context/LanguageContext';

interface PendingApprovalsCardProps {
  items: PendingApproval[];
}

export const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ items }) => {
  const navigate = useNavigate();
  const { t } = useLanguageSafe();
  
  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('pendingApprovals')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            {t('noPendingApprovals')}
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pendingApprovals')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-0">
              <div>
                <h4 className="font-medium">{item.schoolName}</h4>
                <div className="text-sm text-muted-foreground">{item.categoryName}</div>
                <div className="flex items-center text-xs mt-1 text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {item.submittedAt || ''}
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-4"
                onClick={() => navigate(`/approvals?id=${item.id}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {t('review')}
              </Button>
            </div>
          ))}
          
          {items.length > 5 && (
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={() => navigate('/approvals')}
            >
              {items.length - 5} {t('seeMore')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsCard;
