
import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PendingApproval } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';

interface PendingApprovalsCardProps {
  items: PendingApproval[];
  limit?: number;
  title?: string;
  showFooter?: boolean;
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({
  items,
  limit = 5,
  title,
  showFooter = true
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const displayItems = items?.slice(0, limit) || [];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title || t('pendingApprovals')}</CardTitle>
        <CardDescription>{t('pendingApprovalsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {displayItems.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <p>{t('noDataToShow')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                <div>
                  <h4 className="font-medium">{item.schoolName}</h4>
                  <p className="text-sm text-muted-foreground">{item.categoryName}</p>
                  <p className="text-xs text-muted-foreground">{t('submittedAt')}: {item.submittedAt || item.date}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/approvals/${item.id}`)}
                >
                  {t('review')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {showFooter && items?.length > limit && (
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => navigate('/approvals')}>
            {t('viewAll')} ({items.length})
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PendingApprovalsCard;
