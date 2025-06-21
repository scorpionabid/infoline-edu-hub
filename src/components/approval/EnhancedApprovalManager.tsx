
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';

export interface EnhancedApprovalManagerProps {
  pendingApprovals?: any[];
  approvedItems?: any[];
  rejectedItems?: any[];
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

  const renderApprovalItem = (item: any) => (
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
            Completion: {item.completionRate}%
          </div>
          <div className="flex gap-2">
            {onView && (
              <Button size="sm" variant="outline" onClick={() => onView(item.id)}>
                <Eye className="h-3 w-3" />
              </Button>
            )}
            {item.status === 'pending' && onApprove && (
              <Button size="sm" variant="default" onClick={() => onApprove(item.id)}>
                <CheckCircle className="h-3 w-3" />
              </Button>
            )}
            {item.status === 'pending' && onReject && (
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
        <AlertDescription>Loading approval data...</AlertDescription>
      </Alert>
    );
  }

  const currentItems = activeTab === 'pending' ? pendingApprovals :
                      activeTab === 'approved' ? approvedItems : rejectedItems;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b">
        <Button
          variant={activeTab === 'pending' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('pending')}
        >
          Pending ({pendingApprovals.length})
        </Button>
        <Button
          variant={activeTab === 'approved' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('approved')}
        >
          Approved ({approvedItems.length})
        </Button>
        <Button
          variant={activeTab === 'rejected' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected ({rejectedItems.length})
        </Button>
      </div>

      <div className="space-y-2">
        {currentItems.length === 0 ? (
          <Alert>
            <AlertDescription>No items in this category.</AlertDescription>
          </Alert>
        ) : (
          currentItems.map(renderApprovalItem)
        )}
      </div>
    </div>
  );
};

export default EnhancedApprovalManager;
