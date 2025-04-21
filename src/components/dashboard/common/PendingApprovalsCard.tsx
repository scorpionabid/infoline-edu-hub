import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Check, XCircle, Clock } from 'lucide-react';

export interface PendingItem {
  id: string;
  title: string;
  status: string;
  date: string;
  category?: string;
  route?: string; // Optional route property for navigation
}

export interface PendingApprovalsCardProps {
  pendingItems: PendingItem[];
  className?: string;
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ 
  pendingItems,
  className
}) => {
  const { t } = useLanguage();

  if (!pendingItems || pendingItems.length === 0) {
    return (
      <Card className={className}>
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
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('pendingApprovals')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <div key={item.id} className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{item.title}</p>
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                  {t('pending')}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{item.category}</p>
              <p className="text-xs text-muted-foreground">
                {t('dueDate')}: {item.date}
              </p>
              <div className="h-px bg-muted my-1"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsCard;
