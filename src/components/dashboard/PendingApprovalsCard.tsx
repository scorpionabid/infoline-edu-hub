
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';

interface PendingApprovalsCardProps {
  pendingApprovals: number;
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ pendingApprovals }) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{t('pendingApprovals')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{pendingApprovals}</div>
        <p className="text-sm text-muted-foreground mt-1">
          {t('pendingApprovalsDesc')}
        </p>
        <div className="h-2 w-full bg-muted mt-4 rounded-full overflow-hidden">
          <div 
            className="h-full bg-yellow-500 transition-all duration-500 ease-in-out" 
            style={{ width: `${Math.min(pendingApprovals * 5, 100)}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsCard;
