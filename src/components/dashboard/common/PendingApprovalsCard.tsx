
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PendingItem } from '@/types/dashboard';
import { useLanguage } from '@/context/LanguageContext';
import { format, isValid } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Clock, Eye } from 'lucide-react';

interface PendingApprovalsCardProps {
  pendingItems?: PendingItem[];
  approvals?: PendingItem[];
  className?: string;
}

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ 
  pendingItems = [], 
  approvals = [],
  className 
}) => {
  const { t } = useLanguage();
  
  // Combine both arrays and remove duplicates
  const items = [...(approvals || []), ...(pendingItems || [])].filter(
    (item, index, self) => index === self.findIndex(t => t.id === item.id)
  );

  // Format date function
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return isValid(date) ? format(date, 'dd MMM yyyy') : dateString;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{t('pendingApprovals')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {items.length === 0 ? (
            <div className="text-center text-muted-foreground p-4">
              {t('noItemsPendingApproval')}
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <div className="font-medium">{item.school || item.schoolName}</div>
                    <div className="text-sm text-muted-foreground">{item.category || item.categoryName}</div>
                    <div className="text-xs text-muted-foreground flex items-center mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDate(item.date || item.dueDate || item.submittedAt)}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Eye className="h-3 w-3 mr-1" />
                    {t('view')}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default PendingApprovalsCard;
