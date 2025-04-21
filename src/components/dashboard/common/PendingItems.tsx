
import React from 'react';
import { PendingItem } from '@/types/dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/LanguageContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { az, ru, enUS, tr } from 'date-fns/locale';
import { toast } from 'sonner';

interface PendingItemsProps {
  items: PendingItem[];
}

const PendingItems: React.FC<PendingItemsProps> = ({ items }) => {
  const { t, currentLanguage } = useLanguage();
  
  const getLocale = () => {
    switch (currentLanguage) {
      case 'az':
        return az;
      case 'ru':
        return ru;
      case 'tr':
        return tr;
      default:
        return enUS;
    }
  };
  
  const handleApprove = (id: string) => {
    toast.success(t('itemApproved'), {
      description: t('itemApprovedDesc')
    });
  };
  
  const handleReject = (id: string) => {
    toast.error(t('itemRejected'), {
      description: t('itemRejectedDesc')
    });
  };

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('pendingApprovals')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">{t('noPendingApprovals')}</p>
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
          {items.map((item) => (
            <div 
              key={item.id} 
              className="p-4 border rounded-md flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="font-medium">{item.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{item.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.submittedAt && formatDistanceToNow(new Date(item.submittedAt), { 
                      addSuffix: true,
                      locale: getLocale()
                    })}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {item.schoolName} - {item.categoryName}
                </div>
              </div>
              
              <div className="flex gap-2 self-end md:self-center">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1"
                  onClick={() => handleReject(item.id)}
                >
                  <X className="h-4 w-4" />
                  {t('reject')}
                </Button>
                <Button 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={() => handleApprove(item.id)}
                >
                  <Check className="h-4 w-4" />
                  {t('approve')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingItems;
