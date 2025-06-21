
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Eye, Filter } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { EnhancedApprovalItem } from '@/types/approval';

export interface EnhancedApprovalManagerProps {
  pendingApprovals?: EnhancedApprovalItem[];
  approvedItems?: EnhancedApprovalItem[];
  rejectedItems?: EnhancedApprovalItem[];
  isLoading?: boolean;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason?: string) => void;
  onView?: (id: string) => void;
}

export const EnhancedApprovalManager: React.FC<EnhancedApprovalManagerProps> = ({
  pendingApprovals = [],
  approvedItems = [],
  rejectedItems = [],
  isLoading = false,
  onApprove,
  onReject,
  onView
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const renderApprovalItem = (item: EnhancedApprovalItem) => (
    <Card key={item.id} className="mb-4">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-sm">{item.schoolName}</CardTitle>
            <p className="text-xs text-muted-foreground">{item.categoryName}</p>
          </div>
          <Badge variant={
            item.status === 'approved' ? 'default' :
            item.status === 'rejected' ? 'destructive' : 'secondary'
          }>
            {item.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground">
            Tamamlanma: {item.completionRate}%
          </div>
          <div className="flex gap-2">
            {onView && (
              <Button size="sm" variant="outline" onClick={() => onView(item.id)}>
                <Eye className="h-3 w-3" />
              </Button>
            )}
            {item.status === 'pending' && item.canApprove && onApprove && (
              <Button size="sm" variant="default" onClick={() => onApprove(item.id)}>
                <CheckCircle className="h-3 w-3" />
              </Button>
            )}
            {item.status === 'pending' && item.canApprove && onReject && (
              <Button size="sm" variant="destructive" onClick={() => onReject(item.id)}>
                <XCircle className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          <div data-testid="loading-spinner">Təsdiq məlumatları yüklənir...</div>
        </AlertDescription>
      </Alert>
    );
  }

  const currentItems = activeTab === 'pending' ? pendingApprovals :
                      activeTab === 'approved' ? approvedItems : rejectedItems;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Təkmilləşdirilmiş Təsdiq Meneceri</h2>
      
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('pending')}
        >
          Gözləyən: {pendingApprovals.length}
        </Button>
        <Button
          variant={activeTab === 'approved' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('approved')}
        >
          Təsdiqlənmiş: {approvedItems.length}
        </Button>
        <Button
          variant={activeTab === 'rejected' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('rejected')}
        >
          Rədd edilmiş: {rejectedItems.length}
        </Button>
      </div>

      <div className="space-y-2">
        {currentItems.length === 0 ? (
          <Alert>
            <AlertDescription>Bu kateqoriyada heç bir element yoxdur.</AlertDescription>
          </Alert>
        ) : (
          currentItems.map(renderApprovalItem)
        )}
      </div>
    </div>
  );
};

export default EnhancedApprovalManager;
