
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Eye, Clock } from 'lucide-react';
import { ApprovalItem, ApprovalService } from '@/services/api/approvalService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/hooks/auth/useAuthStore';
import { useToast } from '@/hooks/use-toast';

interface ApprovalQueueProps {
  className?: string;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  className = ''
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { user } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending approvals
  const { data: approvals = [], isLoading } = useQuery({
    queryKey: ['pending-approvals', user?.role, user?.regionId || user?.sectorId],
    queryFn: () => ApprovalService.getPendingApprovals(
      user?.role || '',
      user?.regionId || user?.sectorId
    ),
    enabled: !!user
  });

  // Process approval mutation
  const processApprovalMutation = useMutation({
    mutationFn: ApprovalService.processApproval,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      setSelectedItems([]);
      toast({
        title: 'Uğurlu',
        description: 'Təsdiq əməliyyatı tamamlandı'
      });
    },
    onError: (error) => {
      toast({
        title: 'Xəta',
        description: 'Təsdiq əməliyyatında xəta baş verdi',
        variant: 'destructive'
      });
    }
  });

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleBatchApproval = async (action: 'approve' | 'reject') => {
    if (selectedItems.length === 0) return;

    await processApprovalMutation.mutateAsync({
      itemIds: selectedItems,
      action,
      userId: user?.id || '',
      reason: action === 'reject' ? 'Toplu rədd' : undefined
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center">Yüklənir...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Təsdiq Gözləyənlər ({approvals.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Batch Actions */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <span className="text-sm font-medium">
              {selectedItems.length} element seçildi
            </span>
            <Button
              size="sm"
              onClick={() => handleBatchApproval('approve')}
              disabled={processApprovalMutation.isPending}
            >
              <Check className="h-4 w-4 mr-1" />
              Təsdiq et
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBatchApproval('reject')}
              disabled={processApprovalMutation.isPending}
            >
              <X className="h-4 w-4 mr-1" />
              Rədd et
            </Button>
          </div>
        )}

        {/* Approval List */}
        <div className="space-y-3">
          {approvals.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="rounded"
                  />
                  <div>
                    <h4 className="font-medium">{item.categoryName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {item.schoolName}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {item.entries.length} sahə
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-1" />
                    Bax
                  </Button>
                </div>
              </div>
              
              <div className="mt-2 text-xs text-muted-foreground">
                Göndərilmə: {new Date(item.submittedAt).toLocaleDateString('az-AZ')}
              </div>
            </div>
          ))}
        </div>

        {approvals.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Təsdiq gözləyən məlumat yoxdur</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApprovalQueue;
