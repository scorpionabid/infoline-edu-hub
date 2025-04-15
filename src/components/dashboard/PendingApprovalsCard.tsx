
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PendingItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';

interface PendingApprovalsCardProps {
  pendingItems: PendingItem[];
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ pendingItems }) => {
  const { t } = useLanguage();

  if (!pendingItems || pendingItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('pendingApprovals')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{t('noPendingApprovals')}</p>
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
          {pendingItems.map((item) => (
            <div key={item.id} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{item.school}</p>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  {t('pending')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.category}</p>
              <p className="text-xs text-muted-foreground">{t('dueDate')}: {item.date}</p>
              <div className="h-px bg-muted my-1"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsCard;
