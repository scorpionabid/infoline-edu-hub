
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { PendingItem } from '@/types/dashboard';

interface PendingApprovalsCardProps {
  pendingItems: PendingItem[];
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ pendingItems }) => {
  const { t } = useLanguage();

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
          </div>
        ) : (
          <p className="text-center text-muted-foreground">{t('noPendingApprovals')}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsCard;
