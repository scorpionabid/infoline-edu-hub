
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ClipboardCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PendingItem } from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface PendingApprovalsCardProps {
  pendingItems: PendingItem[];
  className?: string; // className property əlavə edildi
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ pendingItems, className }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
          {t('pendingApprovals')}
        </CardTitle>
        <CardDescription>{t('pendingApprovalsDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        {pendingItems.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>{t('noPendingApprovals')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(item.route)}
                  className="text-primary hover:text-primary/80"
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  {t('review')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsCard;
