import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PendingItem {
  id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
  route?: string; // route sahəsini əlavə et
}

interface PendingApprovalsCardProps {
  title: string;
  description: string;
  items: PendingItem[];
  viewAllRoute: string;
  onAction?: (id: string, action: 'approve' | 'reject') => void;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-500" />;
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />;
  }
};

const PendingApprovalsCard: React.FC<PendingApprovalsCardProps> = ({ 
  title,
  description,
  items = [],
  viewAllRoute,
  onAction
}) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // Item'ə kliklədikdə istifadə olunan funksiya
  const handleItemClick = (item: PendingItem) => {
    // Əgər route təyin olunubsa, o route'a yönləndir
    if (item.route) {
      navigate(item.route);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {items.map((item) => (
            <li key={item.id} className="p-4 hover:bg-accent cursor-pointer" onClick={() => handleItemClick(item)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(item.status)}
                  <span>{item.title}</span>
                </div>
                <div className="text-xs text-muted-foreground">{item.date}</div>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button variant="link" onClick={() => navigate(viewAllRoute)}>
          {t('viewAll')}
        </Button>
        {onAction && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onAction(items[0].id, 'reject')}>
              {t('reject')}
            </Button>
            <Button size="sm" onClick={() => onAction(items[0].id, 'approve')}>
              {t('approve')}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default PendingApprovalsCard;
