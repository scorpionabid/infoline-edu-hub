
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { PendingItem } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PendingApprovalsCardProps {
  pendingItems: PendingItem[];
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ pendingItems }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('pendingApprovals')}</CardTitle>
      </CardHeader>
      <CardContent>
        {pendingItems && pendingItems.length > 0 ? (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <div key={item.id} className="border-b pb-2">
                <p className="font-medium">{item.school}</p>
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <p className="text-xs text-muted-foreground">{item.date}</p>
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="p-0 h-auto text-xs text-blue-500 dark:text-blue-400"
              onClick={() => navigate('/data-entry?filter=pending')}
            >
              {t('viewAllPendingItems')}
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">{t('noPendingApprovals')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsCard;
